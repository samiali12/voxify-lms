import { Response } from "express";
import User from "../models/user.model";

export const getUserById = async (id: string, res: Response) => {

    const user = await User.findById(id)

    console.log(user)

    res.status(200).json({
        sucess: true,
        user
    })
}


export const getAllUsersService = async (res: Response) => {
    const users = await User.find();

    res.status(200).json({
        success: true,
        users
    })
}