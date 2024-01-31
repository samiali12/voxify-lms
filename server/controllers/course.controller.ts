require('dotenv').config({ path: './config/.env' });
import express, { Request, Response, NextFunction } from 'express'
import ErrorHandler from '../utils/ErrorHandler'
import { AsyncHandler } from '../middleware/AsyncHandler'
import cloudinary from 'cloudinary'
import { createCourse, getAllCoursesService } from '../services/course.service';
import Course from '../models/course.model';
import { redis } from '../utils/redis';
import mongoose from 'mongoose';

export const courseUpload = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    try {

        const data = req.body

        const thumbnail = data.thumbnail

        if (thumbnail) {
            const cloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: 'courses'
            })

            data.thumnail = {
                public_id: cloud.public_id,
                url: cloud.secure_url
            }
        }
        createCourse(data, res, next)
    }
    catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})


export const updateCourse = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    try {

        const data = req.body
        const thumbnail = data.thumbnail

        if (thumbnail) {

            await cloudinary.v2.uploader.destroy(thumbnail.public_id)
            const cloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: 'courses'
            })

            data.thumnail = {
                public_id: cloud.public_id,
                url: cloud.secure_url
            }
        }

        const courseId = req.params.id

        const course = await Course.findByIdAndUpdate(courseId,
            { $set: data },
            { new: true }
        )

        res.status(200).json({
            success: true,
            message: "Course updated",
            course
        })
    }
    catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})



export const deleteCourse = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    try {
        const courseId = req.params.id
        const courseData = await Course.findByIdAndDelete(courseId)

        res.status(200).json({
            success: true,
            message: "Course data delete successfully"
        })
    }
    catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }

})


// get single course --without purchasing

export const getSingleCourse = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    try {

        const courseId = req.params.id
        const isCourseCacheExits = await redis.get(courseId)

        if (isCourseCacheExits) {
            const course = JSON.parse(isCourseCacheExits)
            res.status(200).json({
                success: true,
                course
            })
        }
        else {

            const course = await Course.findById(req.params.id)
                .select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links")

            await redis.set(courseId, JSON.stringify(course))

            res.status(200).json({
                success: true,
                course
            })
        }
    }
    catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

// get multiple course --without purchasing

export const getAllCourses = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    try {

        const isCoursesCacheExits = await redis.get("all-courses")

        if (isCoursesCacheExits) {
            const courses = JSON.parse(isCoursesCacheExits)
            res.status(200).json({
                success: true,
                courses
            })
        }
        else {
            const courses = await Course.find()
                .select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links")

            await redis.set("all-courses", JSON.stringify(courses))

            res.status(200).json({
                success: true,
                courses
            })
        }
    }
    catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

// get course content only for valid user 

export const getCourseByUser = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    try {

        const userCourseList = req.user?.courses
        const courseId = req.params.id
        const isCourseExits = userCourseList?.find((course: any) => course._id.toString() === courseId)

        if (!isCourseExits) {
            return next(new ErrorHandler("You are not eligible for this course", 400))
        }

        const course = await Course.findById(courseId)
        const content = course?.courseData

        res.status(200).json({
            success: true,
            content
        })
    }

    catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

interface IAddQuestions {
    question: string;
    courseId: string;
    contentId: string;
}

export const addQuestions = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { question, contentId }: IAddQuestions = req.body

        const courseId = req.params.id

        const course = await Course.findById(courseId)

        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandler("Invalid content id", 400))
        }

        const courseContent = course?.courseData?.find((item: any) => item._id.equals(contentId))

        if (!courseContent) {
            return next(new ErrorHandler("Invalid content id", 400))
        }

        const newQuestion: any = {
            user: req.user,
            question: question,
            questionReplies: []
        }

        courseContent.questions.push(newQuestion)

        await course?.save()

        res.status(200).json({
            success: true,
            course
        })
    }

    catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})


interface IReplyQuestions {
    questionAnswer: string;
    questionId: string;
    contentId: string;
}

export const replyQuestions = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { questionAnswer, contentId, questionId }: IReplyQuestions = req.body

        const courseId = req.params.id

        const course = await Course.findById(courseId)

        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandler("Invalid content id", 400))
        }

        const courseContent = course?.courseData?.find((item: any) => item._id.equals(contentId))

        if (!courseContent) {
            return next(new ErrorHandler("Invalid content id", 400))
        }

        console.log(courseContent.questions)

        const question = courseContent.questions?.find((item: any) => item._id.equals(questionId))

        if (!question) {
            return next(new ErrorHandler("Invalid question id", 400))
        }

        const answer: any = {
            user: req.user,
            question: questionAnswer,
            questionReplies: []
        }

        question.questionReplies.push(answer)

        await course?.save()

        res.status(200).json({
            success: true,
            message: "Your answer record successfully",
            course
        })
    }

    catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }

})



// add review to course 

interface IReviewData {
    comment: string;
    rating: number;
}

export const addReview = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    try {

        const userCourseList = req.user?.courses

        const courseId = req.params.id

        // check if course already exits 
        const isCourseExits = userCourseList?.some((course: any) => course._id.toString() === courseId.toString())

        if (!isCourseExits) {
            return next(new ErrorHandler("You are not eligible for to access this resources", 400))
        }


        const course = await Course.findById(courseId)

        const { comment, rating } = req.body as IReviewData


        const review: any = {
            comment: comment,
            rating: rating,
            user: req.user?._id,
            commentReplies: []
        }

        course?.reviews.push(review)

        let avg = 0

        course?.reviews.forEach((item: any) => {
            avg += item.rating;
        })

        if (course) {
            avg /= course?.reviews.length;
        }

        await course?.save()

        res.status(200).json({
            success: true,
            message: "Review add successfully"
        })
    }
    catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})


interface IReplyReview {
    reviewAnswer: string;
    reviewId: string;
    courseId: string;
}

export const replyReview = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    try {

        const { reviewAnswer, reviewId, courseId } = req.body as IReplyReview

        const course = await Course.findById(courseId)


        if (!course) {
            return next(new ErrorHandler("Course not found", 400))
        }

        const review = course.reviews.find((rev) => rev._id.toString() === reviewId)

        if (!review) {
            return next(new ErrorHandler("Review not found", 400))
        }

        const answer: any = {
            user: req.user,
            question: reviewAnswer,
            questionReplies: []
        }

        review.commentReplies?.push(answer)
       
        await course.save()

        res.status(200).json({
            success: true,
            message: "Your response record"
        })
    }

    catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})


// get all courses

export const retrieveAllCourses = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    try {
       getAllCoursesService(res)
    }
    catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})