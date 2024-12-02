const publicVapidKey = "BGQHJx76eQTAkKNu7pWY1A0CcoRsjgez3TNAq3bI44cffslhQueBW-syXaMwNvjHhHotLGff5JadVlovH_-jKKc"; // REPLACE_WITH_YOUR_KEY

// Check for service worker
if ("serviceWorker" in navigator) {
    // send().catch((err) => console.error(err));
}

// Register SW, Register Push, Send Push
async function send(datetimeInput) {
    // Register Service Worker
    console.log("Registering service worker...");
    console.log(`Push notification setting for ${datetimeInput}`);          //TODO: Check if a service worker is already active
    const register = await navigator.serviceWorker.register("./sw.js", {
        scope: "/",
    });
    console.log("Service Worker Registered...");

    // Register Push
    console.log("Registering Push...");
    const subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
    });
    console.log("Push Registered...");
    
    // Datum der Subscription hinzufügen
    const subscriptionWithDate = {
        ...subscription,
        dateTime: datetimeInput, // Datum in das Subscription-Objekt integrieren
    };

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
    const datetimeInput = document.getElementById('datetime').value;
    if (datetimeInput) {
        if ("serviceWorker" in navigator) {
            send(datetimeInput).catch((err) => console.error(err));
            alert(`You have subscribed for ${datetimeInput}`);
        }
    } else {
        alert('Please select a date and time.');
    }
});
