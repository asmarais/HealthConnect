const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const protect = require('../middleware/authMiddleware');


router.post('/', notificationController.addNotification);

router.put('/:notification_id/read', notificationController.markAsRead);

router.delete('/:notification_id', notificationController.deleteNotification);

router.get('/filters', notificationController.getNotificationsWithFilters);

router.delete('/user/:user_id', notificationController.deleteAllNotifications);

router.get('/user/:user_id', notificationController.getAllNotifications);

router.get('/:notification_id', notificationController.getNotificationById);

module.exports = router;
