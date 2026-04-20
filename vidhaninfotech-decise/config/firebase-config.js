
var firebaseToken = require("firebase-admin");

var serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    // Preferred: load from environment variable (for production deployments)
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
} else {
    // Fallback: load from local file (development only – never commit this file)
    try {
        serviceAccount = require("./serviceAccountKey.json");
    } catch (e) {
        console.warn("Firebase service account key not found. Push notifications will be unavailable.");
        serviceAccount = null;
    }
}

if (serviceAccount) {
    firebaseToken.initializeApp({
        credential: firebaseToken.credential.cert(serviceAccount)
    });
}

module.exports.firebaseToken = firebaseToken;
