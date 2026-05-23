const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendReminderEmail } = require('../services/emailService');

cron.schedule('* * * * *', async () => {
    try {
        console.log('Checking reminders...');

        const now = new Date();

        // check reminders from previous 1 minute to next 1 minute
        const oneMinuteAgo = new Date(now.getTime() - 60000);
        const nextMinute = new Date(now.getTime() + 60000);

        console.log('Current Time:', now);

        const reminders = await Reminder.find({
            dueDate: {
                $gte: oneMinuteAgo,
                $lte: nextMinute
            },
            isCompleted: false,
            notified: false
        });

        console.log(`Found ${reminders.length} reminders`);

        for (const reminder of reminders) {
            console.log('Sending reminder:', reminder.title);

            const user = await User.findById(reminder.user);

            if (!user) continue;

            // Create in-app notification
            await Notification.create({
                user: user._id,
                title: 'Reminder Alert',
                message: `Reminder: ${reminder.title}`,
                type: 'warning',
                category: 'reminder'
            });

            // Send email if enabled
            if (
                user.preferences &&
                user.preferences.emailAlerts
            ) {
                await sendReminderEmail(user.email, reminder);
            }

            // mark as notified
            reminder.notified = true;
            await reminder.save();

            console.log('Reminder processed successfully');
        }

    } catch (error) {
        console.error('Reminder Cron Error:', error);
    }
});