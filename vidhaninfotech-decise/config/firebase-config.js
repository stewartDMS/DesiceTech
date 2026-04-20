
var firebaseToken = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

firebaseToken.initializeApp({
  credential: firebaseToken.credential.cert(serviceAccount)
});


module.exports.firebaseToken = firebaseToken