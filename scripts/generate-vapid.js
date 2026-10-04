import webPush from "web-push";

const keys = webPush.generateVAPIDKeys();
console.log(JSON.stringify({ publicKey: keys.publicKey, privateKey: keys.privateKey }, null, 2));
