require('dotenv').config({ path: './config/.env' });
import express, { Request, Response, NextFunction } from 'express'
import ErrorHandler from '../utils/ErrorHandler'
import { AsyncHandler } from '../middleware/AsyncHandler'
import { IOrder } from '../models/order.model';
import Course from '../models/course.model';
import User from '../models/user.model';
import path from 'path';
import ejs from 'ejs'
import sendMail from '../utils/sendMail'
import NotificationModel from '../models/notification.model';
import { createOrderService } from '../services/order.service';

export const createOrder = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { courseId, payment_info } = req.body as any

        const user = await User.findById(req.user?._id)

        const isCourseExits = user?.courses.some((course: any) => course._id.toString() === courseId)

        if (isCourseExits) {
            return next(new ErrorHandler("You have already purchased this course", 400))
        }

        const course = await Course.findById(courseId)

        if (!course) {
            return next(new ErrorHandler("Course not found", 404))
        }

        const data: any = {
            courseId: courseId,
            userId: user?._id,
            payment_info: payment_info
        }

        const mailData = {

            _id: course._id.toString().slice(0, 6),
            name: course.name,
            price: course.price,
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

        }

        const html = await ejs.renderFile(path.join(__dirname, '../templates/order-confirmation.ejs'),
            { data: mailData })

        try {

            if (user) {
                await sendMail({
                    email: user?.email,
                    subject: 'Order Confirmation',
                    template: 'order-confirmation.ejs',
                    data: mailData
                })
            }
        }
        catch (error: any) {
            return next(new ErrorHandler(error.message, 400))
        }

        await NotificationModel.create({
            userId: user?._id,
            title: "New Order Created",
            message: `You have new purchasing from ${course?.name}`
        })

        user?.courses.push(course?._id)

        await user?.save()    

        createOrderService(data, res, next)

    }

    catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})