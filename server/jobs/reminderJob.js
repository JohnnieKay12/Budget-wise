const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendReminderEmail } = require('../services/emailService');

cron.schedule('* * * * *', async () => {
    try {
        console.log('Checking reminders...');

        const now = new Date();

        // increase range to 5 minutes
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);
        const fiveMinutesLater = new Date(now.getTime() + 5 * 60000);

        console.log('Current UTC Time:', now);
        console.log('Search Start:', fiveMinutesAgo);
        console.log('Search End:', fiveMinutesLater);

        const reminders = await Reminder.find({
            dueDate: {
                $gte: fiveMinutesAgo,
                $lte: fiveMinutesLater
            },
            isCompleted: false,
            notified: false
        });

        console.log(`Found ${reminders.length} reminders`);

        for (const reminder of reminders) {

            console.log('Reminder Match Found:', reminder.title);
            console.log('Reminder DueDate:', reminder.dueDate);

            const user = await User.findById(reminder.user);

            if (!user) {
                console.log('User not found');
                continue;
            }

            // CREATE APP NOTIFICATION
            await Notification.create({
                user: user._id,
                title: 'Reminder Alert',
                message: `Reminder: ${reminder.title}`,
                type: 'warning',
                category: 'reminder'
            });

            console.log('In-app notification created');

            // SEND EMAIL
            if (
                user.preferences &&
                user.preferences.emailAlerts
            ) {

                console.log('Sending email to:', user.email);

                await sendReminderEmail(user.email, reminder);

                console.log('Email sent successfully');
            }

            // MARK AS NOTIFIED
            reminder.notified = true;
            await reminder.save();

            console.log('Reminder marked as notified');
        }

    } catch (error) {
        console.error('Reminder Cron Error:', error);
    }
});