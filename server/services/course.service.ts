import express, { Request, Response, NextFunction } from 'express'
import { AsyncHandler } from '../middleware/AsyncHandler'
import courseModel from '../models/course.model'

export const createCourse = AsyncHandler(async (data: any, res: Response, next: NextFunction) => {

    const course = await courseModel.create(data)
    res.status(200).json({
        success: true,
        course
    })
})

export const getAllCoursesService = async (res: Response) => {
    const courses = await courseModel.find().sort({createdAt: -1})
    res.status(200).json({
        success: true,
        courses
    })
}