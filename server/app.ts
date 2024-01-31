require('dotenv').config()
import express, {Request, Response, NextFunction} from 'express'
export const app = express()
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { ErrorMiddleware } from './middleware/error'
import { AsyncHandler } from './middleware/AsyncHandler'
import UserRoutes from './routes/user.route'
import CourseRoutes from './routes/course.route'
import OrderRoutes from './routes/order.route'
import NotificationRoutes from './routes/notification.route'

// body parser
app.use(express.json({limit:"50mb"}))

// cookie parser 
app.use(cookieParser())

// cross origin resource sharing
app.use(cors({
    credentials: true,
    origin: process.env.ORIGIN
}))


app.use("/api/v1", UserRoutes)
app.use("/api/v1", CourseRoutes)
app.use("/api/v1", OrderRoutes)
app.use("/api/v1", NotificationRoutes)

app.get("/test", (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
        success: true,
        message: "Hello LMS"
    })
})

app.all("*",  (req: Request, res: Response, next: NextFunction) => {
   const err = new Error(`Route ${req.originalUrl} not found`) as any
   err.statusCode = 404
   next(err)
})

app.use(ErrorMiddleware)
app.use(AsyncHandler)