const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendReminderEmail } = require('../services/emailService');

cron.schedule('*/1 * * * *', async () => {
    console.log('Checking reminders...');

    const now = new Date();
    const nextMinute = new Date(now.getTime() + 60000);

    const reminders = await Reminder.find({
        dueDate: {
            $gte: now,
            $lte: nextMinute
        },
        isCompleted: false
    });

    for (const reminder of reminders) {
        const user = await User.findById(reminder.user);

        if (!user) continue;

        if (user.preferences.notifications) {
            await Notification.create({
                user: user._id,
                title: 'Reminder Alert',
                message: reminder.title,
                type: 'reminder'
            });
        }

        if (user.preferences.emailAlerts) {
            await sendReminderEmail(user.email, reminder);
        }
    }
});