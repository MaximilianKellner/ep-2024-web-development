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
        <div style="background-color: #0e0d21; color: white; font-family: 'Jost', sans-serif; padding: 20px; border-radius: 10px;">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Jost:wght@100..900&display=swap" rel="stylesheet">
            <div style="text-align: center; padding-bottom: 20px;">
                <h1 style="margin: 0; color: white; font-style: italic;">OmniMize</h1>
            </div>
            <div style="font-family: 'Jost', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #010015; text-align: center; border-radius: 10px;">
                <h1 style="color: white; font-weight: 500;">Ihre optimierten Dateien sind jetzt zum Download bereit!</h1>
                <p style="color: white; font-size: 16px;">Hallo ${customerName},</p>
                <p style="color: white; font-size: 16px;">Ihre optimierten Dateien sind jetzt bereit. Sie können sie über den folgenden Link herunterladen:</p>
                <a href="${downloadLink}" style="display: inline-block; padding: 12px 20px; margin-top: 15px; font-size: 20px; color: #fff; background: linear-gradient(91deg, #5b9ace 0%, #264aa7 100%); text-decoration: none; border-radius: 5px;">Zur Download-Seite</a>
                <p style="color: #999; font-size: 14px; margin-top: 20px;">Wenn Sie Fragen haben, können Sie uns gerne kontaktieren.</p>
            </div>
        </div>
`
        const mailOptions = nodemailer.createTransport({
           host: process.env.SMTP_HOST,
           port: process.env.SMTP_PORT,
            secure: false,
           auth: {
               user: process.env.SMTP_USER,
               pass: process.env.SMTP_PASSWORD
           }
        });

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
        <div style="background-color: #0e0d21; color: white; font-family: 'Jost', sans-serif; padding: 20px; border-radius: 10px;">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Jost:wght@100..900&display=swap" rel="stylesheet">
            <div style="text-align: center; padding-bottom: 20px;">
                <h1 style="margin: 0; color: white; font-style: italic;">OmniMize</h1>
            </div>
            <div style="font-family: 'Jost', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #010015; text-align: center; border-radius: 10px;">
                <h1 style="color: white; font-weight: 500;">Ihr persönlicher Link läuft bald ab!</h1>
                <p style="color: white; font-size: 16px;">Hallo ${customerName},</p>
                <p style="color: white; font-size: 16px;">Ihr persönlicher Download-Link läuft am <strong>${expirationDate}</strong> ab. Stellen Sie sicher, dass Sie ihn rechtzeitig erneuern!</p>
                <a href="${renewalLink}" style="display: inline-block; padding: 12px 20px; margin-top: 15px; font-size: 20px; color: #fff; background: linear-gradient(91deg, #5b9ace 0%, #264aa7 100%); text-decoration: none; border-radius: 5px;">Link erneuern</a>
                <p style="color: #999; font-size: 14px; margin-top: 20px;">Wenn Sie Fragen haben, können Sie uns gerne kontaktieren.</p>
            </div>
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
