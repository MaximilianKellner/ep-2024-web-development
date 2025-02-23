import {pool} from './db.js';
import {sendReminderNotification} from "./email-notification.js";

const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;
const THREE_DAYS = 3;
const ZERO_DAYS = 0;

export async function checkTokenExpired() {
    try {
        const now = Date.now();

        const customers = await pool.query('SELECT * FROM active_customer');

        customers.rows.filter(customer => {
            let expirationDate = new Date(customer.expiration_date);  // Datum von der DB

            const expiresWithinThreeDays = (expirationDate) => {
                expirationDate.setUTCDate(expirationDate.getUTCDate())
                const differenceInMs = expirationDate.getTime() - now;
                const msToDays = (ms) => {
                    return ms / ONE_DAY_IN_MS;
                };
                return msToDays(differenceInMs) <= THREE_DAYS && msToDays(differenceInMs) >= ZERO_DAYS;
            };

            if (expiresWithinThreeDays(expirationDate)) {
                const name = customer.name;
                const email = customer.email;
                const renewalLink = `${process.env.URL}/customers/${customer.link_token}?action=renewal`;
                const expirationDate = customer.expiration_date;
                sendReminderNotification(name, email, renewalLink, expirationDate);
            }
        })
        setTimeout(checkTokenExpired, ONE_DAY_IN_MS);
    } catch (error) {
        console.error(error);
    }
}
