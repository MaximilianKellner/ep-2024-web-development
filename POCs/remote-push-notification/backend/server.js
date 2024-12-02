const express = require("express"); // Web Server
const webpush = require("web-push");    // Web-based push notifications
const bodyParser = require("body-parser");  // Parsing request bodies
const path = require("path");   // Handling flie and directory paths
const PushNotifications = require("node-pushnotifications");    // Send push notifications using various psuh services (Apple Push Notification, Firefbase Cloud Messaging, ...)

const app = express();
console.log(path.join(__dirname, "/../frontend", "index.html"));

// Middleware for processing requests, before they reach the route handlers (parsing, error handling, authentification, ...)
// Set static path
app.use(express.static(path.join(__dirname, "/../frontend")));

// Parse incoming requests with JSON payloads
app.use(bodyParser.json());

// Parse incoming requests with urlencoded payloads
app.use(bodyParser.urlencoded({ extended: true }));

// Handle CORS
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader("Access-Control-Allow-Origin", "*");

    // Request methods you wish to allow
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, PATCH, DELETE",
    );

    // Request headers you wish to allow
    res.setHeader("Access-Control-Allow-Headers", "*");

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader("Access-Control-Allow-Credentials", true);

    // Pass to next layer of middleware
    next();
});

// VAPID keys are used for application server identification with web push protocols
// Put in env variables !!!
const publicVapidKey = "BGQHJx76eQTAkKNu7pWY1A0CcoRsjgez3TNAq3bI44cffslhQueBW-syXaMwNvjHhHotLGff5JadVlovH_-jKKc"; // REPLACE_WITH_YOUR_KEY
const privateVapidKey = "V5eznSafOJ_YbQmOL3irEGqzb7qaqIzvfDM6tLkknv8"; //REPLACE_WITH_YOUR_KEY

app.post("/subscribe", (req, res) => {
    // Get pushSubscription object
    const subscription = req.body;
    console.log(`Subscription: ${subscription}`);
    const { dateTime } = subscription;
    console.log(`Reminder set to: ${dateTime}`);
    const settings = {
        web: {
            vapidDetails: {
                subject: "mailto:r7155380@gmail.com", // REPLACE_WITH_YOUR_EMAIL
                publicKey: publicVapidKey,
                privateKey: privateVapidKey,
            },
            gcmAPIKey: "gcmkey",
            TTL: 2419200,
            contentEncoding: "aes128gcm",
            headers: {},
        },
        isAlwaysUseFCM: false,
    };

    // Send 201 - resource created
    const push = new PushNotifications(settings);

    // Create payload
    const payload = {
        title: "Click here to see your optimised files.",
        options: {
            body: `http://localhost:${port}/optimised-data`,
            tag: 'optimisation-done',
            data: {
                time: new Date(Date.now()).toString(),
                message: 'Hello, World!',
            },
        }
    };
    push.send(subscription, payload, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log(result);
        }
    });
});

//res.sendFile("index.html", { root: __dirname + "\\..\\frontend"});
//res.sendFile(path.join(__dirname, "/../frontend", "index.html"));

//Serve the frontend HTML and JS assets for our website
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/../frontend", "index.html");
});
app.get("/script.js", (req, res) => {
    res.sendFile(__dirname + "/../frontend", "script.js");
});
app.get("/style.js", (req, res) => {
    res.sendFile(__dirname + "/../frontend", "style.css");
});
app.get("/sw.js", (req, res) => {
    res.sendFile(__dirname + "/sw.js");
});

const port = 3000;

app.listen(port, () => console.log(`Server started on port ${port}`));