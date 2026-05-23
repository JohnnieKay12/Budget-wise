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
            from: `"BudgetWise" <${process.env.EMAIL_USER}>`,
            to,
            subject: `Reminder: ${reminder.title}`,
            html: `
                <div style="font-family: Arial; padding: 20px;">
                    <h2>BudgetWise Reminder</h2>

                    <p>
                        This is a reminder for:
                    </p>

                    <h3>${reminder.title}</h3>

                    <p>${reminder.description || 'No description provided'}</p>

                    <p>
                        <strong>Due Date:</strong>
                        ${new Date(reminder.dueDate).toLocaleString()}
                    </p>

                    <hr />

                    <p>
                        Stay on top of your finances with BudgetWise.
                    </p>
                </div>
            `
        });

        console.log('Reminder email sent successfully');

    } catch (error) {
        console.log('Email error:', error.message);
    }
};