import 'dotenv/config';
import nodemailer from 'nodemailer';
import ApiError from "./ApiError.js";

// Create a transporter object
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // use SSL
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    }
});


// Configure the mailoptions object


export function sendDownloadNotification(customerNe, customerEmail, downloadLink) {

    try {
        const message = `
<h1>Dear ${customerName}!</h1>
<p>Your optimised files are now ready for download!</p>
<p><a href="${downloadLink}">Go to the downloads page</a></p>
`
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: customerEmail,
            subject: 'Your images are optimized & ready to download',
            text: 'That was easy!',
            html: message
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                throw ApiError.internal("Something went wrong when sending email");
            } else {
                console.log('Email sent:', info.response);
            }am
        });
    } catch (error) {
        throw error
    }
}

export function sendReminderNotification(customerName, customerEmail, renewalLink, expirationDate) {

    try {
        const message = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; text-align: center;">
            <h1 style="color: #333;">Your personal link will expire soon!</h1>
            <p style="color: #555; font-size: 16px;">Hello ${customerName},</p>
            <p style="color: #555; font-size: 16px;">Your personal download link will expire on <strong>${expirationDate}</strong>. Make sure to renew it before it's too late!</p>
            <a href="${renewalLink}" style="display: inline-block; padding: 12px 20px; margin-top: 15px; font-size: 18px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Renew Your Link</a>
            <p style="color: #999; font-size: 14px; margin-top: 20px;">If you have any questions, feel free to contact us.</p>
        </div>
        `;
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: customerEmail,
            subject: `Renew your personal link soon! Expiration date: ${expirationDate}`,
            text: 'That was easy!',
            html: message
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                throw ApiError.internal("Something went wrong when sending email");
            } else {
                console.log('Email sent:', info.response);
            }
        });
    } catch (error) {

    }
}
