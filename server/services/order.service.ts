import express, { Request, Response, NextFunction } from 'express'
import { AsyncHandler } from '../middleware/AsyncHandler'
import OrderModel from '../models/order.model'


export const createOrderService = AsyncHandler(async (data: any, res: Response, next: NextFunction) => {

    const order = await OrderModel.create(data)
  
    res.status(200).json({
        success: true,
        order
    })

})