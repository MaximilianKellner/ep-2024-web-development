console.log("Service Worker Loaded...");

self.addEventListener("push", (e) => {
    const data = e.data.json();
    console.log("Push Recieved...");

    
    const notificationData = data;
    console.log('');
    console.log('The notification data has the following parameters:');
    Object.keys(notificationData).forEach((key) => {
        console.log(`  ${key}: ${notificationData[key]}`);
    });
    console.log('');


    self.registration.showNotification(data.title, data.options);
});

self.addEventListener("notificationclick", function(e) {
    const url = e.notification.body;
    const promiseChain = clients.openWindow(url);
    e.waitUntil(promiseChain); 
});