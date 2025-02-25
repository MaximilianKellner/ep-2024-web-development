import NotificationMessageBuilder from "./NotificationMessageBuilder.js";
import nodemailer from 'nodemailer';
import ApiError from "../errors/ApiError.js";

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

class EmailNotificationManager {


    static sendMail(messageType, customerName, customerEmail, customerLink, expirationDate) {

        try {
            const message = NotificationMessageBuilder.build(messageType, customerName, customerLink, expirationDate);

            const mailOptions = {
                from: process.env.SMTP_USER,
                to: customerEmail,
                subject: messageType.subject,
                text: messageType.text,
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
            throw error;
        }
    }
}

export default EmailNotificationManager;