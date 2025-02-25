import NotificationMessageType from "./NotificationMessageType.js";

class NotificationMessageBuilder {
    static build(messageType,  customerName, customerLink, expirationDate) {
        switch (messageType) {
            case NotificationMessageType.REMINDER: {
                return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; text-align: center;">
            <h1 style="color: #333;">Your personal link will expire soon!</h1>
            <p style="color: #555; font-size: 16px;">Hello ${customerName},</p>
            <p style="color: #555; font-size: 16px;">Your personal download link will expire on <strong>${expirationDate}</strong>. Make sure to renew it before it's too late!</p>
            <a href="${customerLink}" style="display: inline-block; padding: 12px 20px; margin-top: 15px; font-size: 18px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Renew Your Link</a>
            <p style="color: #999; font-size: 14px; margin-top: 20px;">If you have any questions, feel free to contact us.</p>
        </div>
        `;
            }
            case NotificationMessageType.NEW_ACCESS_LINK: {
                return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; text-align: center;">
            <h1 style="color: #333;">Your new access link</h1>
            <p style="color: #555; font-size: 16px;">Hello ${customerName},</p>
            <p style="color: #555; font-size: 16px;">Here is your new access link. Click the button below to start using it:</p>
            <a href="${customerLink}" style="display: inline-block; padding: 12px 20px; margin-top: 15px; font-size: 18px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Access Now</a>
            <p style="color: #999; font-size: 14px; margin-top: 20px;">If you have any questions, feel free to contact us.</p>
        </div>
        `;
            }
        }
    }
}

export default NotificationMessageBuilder;