import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { AsyncHandler } from "./AsyncHandler";
import ErrorHandler from "../utils/ErrorHandler";
import { redis } from "../utils/redis";


export const isAuthenticated = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const access_token = req.cookies.access_token

    if (!access_token) {
        return next(new ErrorHandler("Please login to access this resources", 400))
    }

    const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN as string)

    if (!decoded) {
        return next(new ErrorHandler("Access token is not valid", 400))
    }

    const user = await redis.get(decoded.id)

    if (!user) {
        return next(new ErrorHandler("User not found", 400))
    }

    req.user = JSON.parse(user)

    next()
})

// validate the user role
export const authorizeRoles = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes(req.user?.role || '')) {
            return next(new ErrorHandler(`Role ${req.user?.role} is not allowed to access this resources`, 400))
        }
        next()
    }
} 