const publicVapidKey = "BGQHJx76eQTAkKNu7pWY1A0CcoRsjgez3TNAq3bI44cffslhQueBW-syXaMwNvjHhHotLGff5JadVlovH_-jKKc"; // REPLACE_WITH_YOUR_KEY

// Check for service worker
if ("serviceWorker" in navigator) {
    // send().catch((err) => console.error(err));
}

// Register SW, Register Push, Send Push
async function send() {

    try {
        // Register Service Worker
        console.log("Registering service worker...");
        /* const register = await navigator.serviceWorker.register("./sw.js", {
            scope: "/",
        }); */
        const registerSuccess = await simulateMaxDelayForServiceWorkerRegistration(1000, 5000); // The use should be informed about browser incompatibility

        console.log("Service Worker Registered...");

        // Register Push
        console.log("Registering Push...");
        const subscription = await registerSuccess.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
        });
        console.log("Push Registered...");

        // Send Push Notification
        console.log("Sending Push...");
        await fetch("http://localhost:3000/subscribe", {
            method: "POST",
            body: JSON.stringify(subscription),
            headers: {
                "content-type": "application/json",
            },
        });
        console.log("Push Sent...");
    } catch (err) {
        alert(`Something went wrong: ${err}`);
    }
}

function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

document.getElementById('subscribeButton').addEventListener('click', () => {

    if (!("serviceWorker" in navigator)) {
        alert("Make sure to set permissions and/ or contact the content manager.");
    } else {
        send();
    }
});


function registerServiceWorker(time) {
    return new Promise((resolve, reject) => {
        // Simulating an asynchronous operation
        setTimeout(() => {
            const data = navigator.serviceWorker.register("./sw.js", {
                scope: "/",
            });
            resolve(data);
        }, time);
        // Resolves after 6 seconds
    });
}

function withTimeout(promise, timeout) {
    return Promise
        .race([
            promise,
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout: Could not register service worker.\nPlease try to use a different browser.\nPlease contact your service provider.')), timeout)
            )
        ]);
}

async function simulateMaxDelayForServiceWorkerRegistration(time, delay)  {
    try {
        const data = await withTimeout(registerServiceWorker(time), delay);
        console.log(data);
        return data;
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
}
