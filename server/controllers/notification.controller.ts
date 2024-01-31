import express, { Request, Response, NextFunction } from 'express'
import ErrorHandler from '../utils/ErrorHandler'
import { AsyncHandler } from '../middleware/AsyncHandler'
import NotificationModel, { INotification } from '../models/notification.model';
import cron from 'node-cron'



export const getAllNotifications = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const notifications: INotification[] = await NotificationModel.find();
        res.json({ success: true, data: notifications });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

export const updateNotificationStatus = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const notificationId = req.params.id;
        const { newStatus } = req.body;

        // Validate input
        if (!notificationId || !newStatus) {
            return next(new ErrorHandler("Invalid input", 400))
        }

        // Find the notification by ID and update its status
        const updatedNotification: INotification | null = await NotificationModel.findByIdAndUpdate(
            notificationId,
            { status: newStatus },
            { new: true }
        );

        // Check if the notification was found and updated
        if (updatedNotification) {
            res.json({ success: true, data: updatedNotification });
        } else {
            return next(new ErrorHandler("Notification not found", 400))
        }
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})



// delete notification -- only admin 
// Schedule the cron job to run every day at midnight



cron.schedule('0 0 0 * * *', async() => {

    const thirtyDaysOld = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    await NotificationModel.deleteMany({status:"read", createdAt: {$lt: thirtyDaysOld}})
    console.log("Deleted read notification")
    
});