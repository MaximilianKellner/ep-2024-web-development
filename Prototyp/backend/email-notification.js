import 'dotenv/config';
import nodemailer from 'nodemailer';

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


export function sendDownloadNotification(customerName, customerEmail, downloadLink) {

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
                console.log('Error:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });
    } catch (error) {
        // TODO: Replace with error handling
        console.error(error);
    }
}

export function sendReminderNotification(customerName, customerEmail, renewalLink, expirationDate) {

    try {
        const message = `
        <h1>Your personal link will expire on the ${expirationDate}</h1>
        <p><a href="${renewalLink}">Renew your personal link</a></p>
        `
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: customerEmail,
            subject: `Renew your personal link soon! Expiration date: ${expirationDate}`,
            text: 'That was easy!',
            html: message
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log('Error:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });
    } catch (error) {

    }
}
