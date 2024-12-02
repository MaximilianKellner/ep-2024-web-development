console.log("Service Worker Loaded...");

self.addEventListener("push", (e) => {
    const data = e.data.json();
    console.log("Push Recieved...");
    self.registration.showNotification(data.title, data.options);
});

self.addEventListener("notificationclick", function(e) {
    const url = e.notification.body;
    const promiseChain = clients.openWindow(url);
    e.waitUntil(promiseChain); 
});