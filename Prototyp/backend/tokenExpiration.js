import {pool} from './db.js';
import {sendReminderNotification} from "./email-notification.js";

const oneDay = 1000 * 60 * 60 * 24;
const THREE_DAYS = 3;
const ZERO_DAYS = 0;

export async function checkTokenExpired() {
    try {
        const now = Date.now();

        const customers = await pool.query('SELECT * FROM customer');

        customers.rows.filter(customer => {
            let expirationDate = new Date(customer.expiration_date);  // Datum von der DB

            const expiresWithinThreeDays = (expirationDate) => {
                expirationDate.setUTCDate(expirationDate.getUTCDate())
                const differenceInMs = expirationDate.getTime() - now;
                const msToDays = (ms) => {
                    return ms / oneDay;
                };
                return msToDays(differenceInMs) <= THREE_DAYS && msToDays(differenceInMs) >= ZERO_DAYS;
            };

            if (expiresWithinThreeDays(expirationDate)) {
                const name = customer.name;
                const email = customer.email;
                const renewalLink = `http://localhost:5000/customers/${customer.link_token}`;
                const expirationDate = customer.expiration_date;
                sendReminderNotification(name, email, renewalLink, expirationDate);
            }
        })
        setTimeout(checkTokenExpired, oneDay);
    } catch (error) {
        console.error(error);
    }
}
