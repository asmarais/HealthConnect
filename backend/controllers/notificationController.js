const db = require('../models/notificationModel');
const Notification = db.Notification;

// Ajouter une nouvelle notification
exports.addNotification = async (req, res) => {
  try {
    const { userId, userType, message } = req.body;

    const notification = await Notification.create({
      userId,
      userType,
      message
    });

    res.status(201).json({ message: 'Notification ajoutée avec succès', notification });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de l\'ajout de la notification', details: err.message });
  }
};

// Marquer une notification comme lue
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByPk(id);
    if (!notification) return res.status(404).json({ error: 'Notification non trouvée' });

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ message: 'Notification marquée comme lue', notification });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour', details: err.message });
  }
};

// Supprimer une notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Notification.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ error: 'Notification non trouvée' });

    res.status(200).json({ message: 'Notification supprimée avec succès' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression', details: err.message });
  }
};

// Supprimer toutes les notifications d'un utilisateur
exports.deleteAllNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    const deleted = await Notification.destroy({ where: { userId } });

    res.status(200).json({ message: 'Toutes les notifications ont été supprimées', deleted });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression', details: err.message });
  }
};

// Récupérer toutes les notifications d'un utilisateur
exports.getAllNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    const notifications = await Notification.findAll({ where: { userId } });

    if (notifications.length === 0) {
      return res.status(404).json({ error: 'Aucune notification trouvée' });
    }

    res.status(200).json({ notifications });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération', details: err.message });
  }
};

// Récupérer une notification par ID
exports.getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByPk(id);
    if (!notification) return res.status(404).json({ error: 'Notification non trouvée' });

    res.status(200).json({ notification });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération', details: err.message });
  }
};

// Récupérer les notifications avec filtres
exports.getNotificationsWithFilters = async (req, res) => {
  try {
    const { id, userId, isRead, userType, createdAtStart, createdAtEnd } = req.query;

    const where = {};

    if (id) where.id = id;
    if (userId) where.userId = userId;
    if (userType) where.userType = userType;
    if (isRead !== undefined) where.isRead = isRead === 'true';

    if (createdAtStart || createdAtEnd) {
      where.createdAt = {};
      if (createdAtStart) where.createdAt[Op.gte] = new Date(createdAtStart);
      if (createdAtEnd) where.createdAt[Op.lte] = new Date(createdAtEnd);
    }

    const notifications = await Notification.findAll({ where });

    if (notifications.length === 0) {
      return res.status(404).json({ error: 'Aucune notification trouvée avec ces filtres' });
    }

    res.status(200).json({ notifications });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération avec filtres', details: err.message });
  }
};
