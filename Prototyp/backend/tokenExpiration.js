import {pool} from './db.js';
import {sendReminderNotification} from "./email-notification.js";

export async function checkTokenExpired() {
    try {
        const oneDay = 1000 * 60 * 60 * 24;
        const threeDays = oneDay * 3; // Hier vermutlich als Testwert
        const now = Date.now();

        const customers = await pool.query('SELECT * FROM customer');
        customers.rows.filter(customer => {

            console.log(customer.expiration_date);
            console.log(now + threeDays >= customer.expiration_date);
            if (now + threeDays >= customer.expiration_date) {
                const name = customer.name;
                const email = customer.email;
                const renewalLink = `http://localhost:5000/customers/${customer.link_token}`;
                const expirationDate = customer.expiration_date;
                sendReminderNotification(name, email, renewalLink, expirationDate);
                console.log(customer.customer_name)
            }
        })
        setTimeout(checkTokenExpired, oneDay);
    } catch (error) {
        console.error(error);
    }
}
