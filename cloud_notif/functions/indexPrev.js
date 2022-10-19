const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.StoreNotification = functions.database
  .ref('orders/{ordersId}')
  .onWrite((snapshot, context) => {
    if (
      snapshot.after.data().OrderStatus == 'Processing' &&
      snapshot.data().ProductType == 'Foods'
    ) {
      admin
        .messaging()
        .sendMulticast({
          tokens: snapshot.after.data().storeToken,
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
    }
  });
