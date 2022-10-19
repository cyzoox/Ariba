const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.AllNotifications = functions.firestore
  .document('orders/{ordersId}')
  .onCreate((snapshot, context) => {
    admin
      .messaging()
      .sendMulticast({
        tokens: snapshot.data().admin_token,
        notification: {
          title: 'New Transaction!',
          body: 'There is new transaction',
        },
      })
      .then(msg => {
        console.log('success!: ', msg);
      })
      .catch(err => {
        console.log('function err!: ', err);
      });
  });
