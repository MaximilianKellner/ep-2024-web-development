import {pool} from './db.js';
import {sendReminderNotification} from "./email-notification.js";
export async function checkTokenExpired() {
    try {
        const fullDay = 1000 * 10; // Hier vermutlich als Testwert
        const threeDays = 1000 * 60 * 60 * 24 * 3;
        const now = Date.now();

        const customers = await pool.query('SELECT * FROM customer');
        customers.rows.filter(customer => {

            if (now + threeDays >= customer.expiration_date) {
                const name = customer.name;
                const email = customer.email;
                const renewalLink = "test";
                const expirationDate = customer.expiration_date;
                sendReminderNotification(name, email, renewalLink, expirationDate);
                console.log(customer.customer_name)
            }
        })
        setTimeout(checkTokenExpired, fullDay);
    } catch (error) {
        console.error(error);
    }
}
