const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.sendReminderEmail = async (to, reminder) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject: `Reminder: ${reminder.title}`,
            html: `
                <div>
                    <h2>BudgetWise Reminder</h2>
                    <p>${reminder.title}</p>
                    <p>${reminder.description || ''}</p>
                    <p>Due Date: ${new Date(reminder.dueDate).toLocaleString()}</p>
                </div>
            `
        });

        console.log('Reminder email sent');
    } catch (error) {
        console.error(error);
    }
};