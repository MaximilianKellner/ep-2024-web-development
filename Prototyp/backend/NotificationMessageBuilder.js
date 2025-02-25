import NotificationMessageType from "./NotificationMessageType.js";

class NotificationMessageBuilder {
    static build(messageType,  customerName, customerLink, expirationDate) {
        switch (messageType) {
            case NotificationMessageType.REMINDER: {
                return `
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
                <a href="${customerLink}" style="display: inline-block; padding: 12px 20px; margin-top: 15px; font-size: 20px; color: #fff; background: linear-gradient(91deg, #5b9ace 0%, #264aa7 100%); text-decoration: none; border-radius: 5px;">Link erneuern</a>
                <p style="color: #999; font-size: 14px; margin-top: 20px;">Wenn Sie Fragen haben, können Sie uns gerne kontaktieren.</p>
            </div>
        </div>
        `;
            }
            case NotificationMessageType.NEW_ACCESS_LINK: {
                return `
            <div style="background-color: #0e0d21; color: white; font-family: 'Jost', sans-serif; padding: 20px; border-radius: 10px;">
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Jost:wght@100..900&display=swap" rel="stylesheet">
                <div style="text-align: center; padding-bottom: 20px;">
            <h1 style="margin: 0; color: white; font-style: italic;">OmniMize</h1>
        </div>
        <div style="font-family: 'Jost', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #010015; text-align: center; border-radius: 10px;">
            <h1 style="color: white; font-weight: 500;">Ihr neuer Zugang ist bereit!</h1>
            <p style="color: white; font-size: 16px;">Hallo ${customerName},</p>
            <p style="color: white; font-size: 16px;">Hier ist Ihr neuer Zugang. Klicken Sie auf den Button unten, um ihn zu nutzen:</p>
            <a href="${customerLink}" style="display: inline-block; padding: 12px 20px; margin-top: 15px; font-size: 20px; color: #fff; background: linear-gradient(91deg, #5b9ace 0%, #264aa7 100%); text-decoration: none; border-radius: 5px;">Jetzt zugreifen</a>
            <p style="color: #999; font-size: 14px; margin-top: 20px;">Wenn Sie Fragen haben, können Sie uns gerne kontaktieren.</p>
        </div>
        </div>
        `;
            }
        }
    }
}

export default NotificationMessageBuilder;