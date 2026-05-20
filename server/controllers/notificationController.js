const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const { read } = req.query;
    const query = { user: req.userId };
    if (read !== undefined) query.isRead = read === 'true';

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ user: req.userId, isRead: false });

    res.json({ success: true, notifications, unreadCount });
  } catch (error) {
    console.error('GetNotifications error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createNotification = async (req, res) => {
  try {
    const { title, message, type, category, actionLink } = req.body;

    const notification = await Notification.create({
      user: req.userId,
      title,
      message,
      type: type || 'info',
      category: category || 'system',
      actionLink
    });

    res.status(201).json({
      success: true,
      message: 'Notification created',
      notification
    });
  } catch (error) {
    console.error('CreateNotification error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('MarkAsRead error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.userId, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('MarkAllAsRead error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, user: req.userId });
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('DeleteNotification error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
