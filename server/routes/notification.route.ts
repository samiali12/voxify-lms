import express from 'express';
import { getAllNotifications, updateNotificationStatus } from '../controllers/notification.controller';

const router = express.Router();

// Route to get all notifications
router.get('/notifications', getAllNotifications);

// Route to update notification status
router.put('/notifications/:id', updateNotificationStatus);

export default router;
