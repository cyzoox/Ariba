const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

exports.DisableAccount = functions.firestore
  .document('DisableUserAccount/{ordersId}')
  .onCreate(async (snapshot, context) => {
    const userId = snapshot.data().userId;
    functions.logger.log('userId: ', userId);
    admin.auth().updateUser(userId, {disabled: true});
  });
