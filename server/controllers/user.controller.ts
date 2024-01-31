require('dotenv').config({ path: './config/.env' });
import express, { Request, Response, NextFunction } from 'express'
import User, { IUser } from '../models/user.model'
import ErrorHandler from '../utils/ErrorHandler'
import { AsyncHandler } from '../middleware/AsyncHandler'
import jwt, { JwtPayload, Secret } from 'jsonwebtoken'
import path from 'path'
import ejs from 'ejs'
import sendMail from '../utils/sendMail'
import { accessTokenOptions, refreshTokenOptions, sendToken } from '../utils/jwt';
import { redis } from "../utils/redis";
import { getAllUsersService, getUserById } from '../services/user.service';
import cloudinary from 'cloudinary';

// user registration
interface IRegistrationBody {
    name: string,
    email: string,
    password: string,
    avatar?: string
}

export const userRegistration = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {


    try {

        // extract the user data from request body
        const { name, email, password } = req.body

        const isEmailExits = await User.findOne({ email })

        // now we are checking if user is already exits or not
        if (isEmailExits) {
            return next(new ErrorHandler("Email already exits", 400))
        }

        // If user does not exits we will create new user in database
        const user: IRegistrationBody = {
            name,
            email,
            password
        }

        const userActivationToken = createUserActivationToken(user)
        const activationCode = userActivationToken.activationCode

        const data = { user: { name: user.name }, activationCode }
        const html = await ejs.renderFile(path.join(__dirname, "../templates/email-activation.ejs"), data);

        try {
            await sendMail({
                email: user.email,
                subject: 'Activate your account',
                template: 'email-activation.ejs',
                data
            })

            res.status(200).json({
                success: true,
                message: `Please check your email: ${user.email} to activate your account`,
                activationToken: userActivationToken.token
            })
        }
        catch (error: any) {
            return next(new ErrorHandler(error.message, 400))
        }

    }
    catch (error: any) {
        return next(new ErrorHandler(error.message, 404))
    }
})

interface IActivationToken {
    token: string,
    activationCode: string
}

export const createUserActivationToken = (user: any): IActivationToken => {
    const activationCode = Math.floor(1000 * Math.random() * 9000).toString()

    const token = jwt.sign(
        { user, activationCode },
        process.env.SECRET_KEY as Secret,
        { expiresIn: '1d' }
    )

    return { token, activationCode }
}

interface IActivationRequest {
    activationToken: string,
    activationCode: string
}

export const activateUser = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { activationToken, activationCode } = req.body as IActivationRequest

        const newUser: { user: any, activationCode: string } = jwt.verify(
            activationToken,
            process.env.SECRET_KEY as Secret,
        ) as { user: any, activationCode: string };


        if (newUser.activationCode !== activationCode) {
            return next(new ErrorHandler("Invalid activation code ", 400))
        }

        const { name, email, password } = newUser.user

        const exitUser = await User.findOne({ email })

        // now we are checking if user is already exits or not
        if (exitUser) {
            return next(new ErrorHandler("Email already exits", 400))
        }

        const user = await User.create({ name, email, password })

        res.status(200).json({
            success: true,
        })

    }
    catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})


// User Login Controller 

interface ILoginBody {
    email: string,
    password: string,
}


export const userLogin = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    try {

        // extract the user data from request body
        const { email, password } = req.body as ILoginBody

        if (!email || !password) {
            return next(new ErrorHandler("Please enter email or password", 404))
        }

        const isEmailExits = await User.findOne({ email })

        if (!isEmailExits) {
            return next(new ErrorHandler("Invalid email or password", 404))
        }

        const isPasswordCorrect = await isEmailExits.comparePassword(password)

        if (!isPasswordCorrect) {
            return next(new ErrorHandler("Invalid email or password", 404))
        }

        const user: any = isEmailExits;

        sendToken(user, 200, res)

    }
    catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

// User logout
export const userLogout = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {

        res.cookie('access_token', "", { maxAge: 1 })
        res.cookie('refresh_token', "", { maxAge: 1 })

        redis.del(req.user?._id || '')

        res.status(200).json({
            success: true,
            message: "Logout successfully"
        })
    }
    catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

// update the access token 
export const updateAccessToken = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    try {

        const refresh_token = req.cookies.refresh_token as string
        const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN as string) as JwtPayload

        if (!decoded) {
            return next(new ErrorHandler("Cloud not refresh token", 400))
        }

        const session = await redis.get(decoded.id as string)

        if (!session) {
            return next(new ErrorHandler("Cloud not refresh token", 400))
        }

        const user = JSON.parse(session)

        const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN as string, {
            expiresIn: "15m"
        })

        const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN as string, {
            expiresIn: "7d"
        })

        res.cookie("access_token", accessToken, accessTokenOptions)
        res.cookie("refresh_token", refreshToken, refreshTokenOptions)

        res.status(200).json({
            success: true,
            accessToken
        })

    }
    catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})


// get user information
export const getUserInfo = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    try {
        const id = req.params.id
        getUserById(id, res)
    }
    catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})


// update the user information

export const updateUserInfo = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    try {

        const id = req.params.id
        const data = req.body as IUser

        const user = await User.findById(id)

        if (!user) {
            return next(new ErrorHandler("User not found", 400))
        }

        const updatedUser = await User.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        });

        await user?.save()

        await redis.set(id, JSON.stringify(updatedUser))

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser
        })
    }

    catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

export const updateUserPassword = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    try {

        const user = await User.findById(req.user?._id)

        if (!user) {
            return next(new ErrorHandler("User not found", 400))
        }

        const isPassword = await user.comparePassword(req.body.currentPassword)

        if (!isPassword) {
            return next(new ErrorHandler("Current password is incorrect", 400))
        }

        user.password = req.body.newPassword

        await user?.save()

        await redis.set(req.user?._id, JSON.stringify(user))

        res.status(200).json({
            success: true,
            message: "Password changes successfully"
        })

    }

    catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

export const updateProfilePicture = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    try {

        const { avatar } = req.body;
        const userId = req.user?._id;
        const user = await User.findById(userId)

        if (avatar && user) {

            if (user?.avatar?.public_id) {
                await cloudinary.v2.uploader.destroy(user?.avatar?.public_id)

                const cloud = await cloudinary.v2.uploader.upload(avatar, {
                    folder: "avatars",
                    width: 150,
                });

                user.avatar = {
                    public_id: cloud.public_id,
                    url: cloud.secure_url
                }
            }

            else {

                const cloud = await cloudinary.v2.uploader.upload(avatar, {
                    folder: "avatars",
                    width: 150,
                });

                user.avatar = {
                    public_id: cloud.public_id,
                    url: cloud.secure_url
                }
            }
        }

        await user?.save()
        await redis.set(userId, JSON.stringify(user))

        res.status(200).json({
            success: true,
            message: "Profile picture updated",
            user
        })
    }

    catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})


export const getAllUsers = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    try {
        getAllUsersService(res)
    }
    catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})


export const deleteUser = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    try {

        const userId = req.params.userId;

        if (!userId) {
            return next(new ErrorHandler('Invalid user ID', 400))
        }

        // Find the user by ID and delete
        const deletedUser: IUser | null = await User.findByIdAndDelete(userId);

        // Check if the user was found and deleted
        if (!deletedUser) {
            return next(new ErrorHandler('Invalid user ID', 400))
        }

        res.json({ success: true, message: 'User deleted successfully' });
    }
    catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})