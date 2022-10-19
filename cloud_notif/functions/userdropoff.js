const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

exports.UserDropOffNotification = functions.firestore
  .document('orders/{ordersId}')
  .onWrite((snapshot, context) => {
    if (
      snapshot.after.data().DropoffNotifRider == true &&
      snapshot.after.data().DropoffNotifUser == false
    ) {
      functions.logger.log('user_token!: ', snapshot.after.data().user_token);
      db.collection('orders').doc(snapshot.after.data().OrderId).update({
        DropoffNotifUser: true,
      });
      admin
        .messaging()
        .sendMulticast({
          tokens: snapshot.after.data().user_token,
          notification: {
            title: 'Rider has arrive at drop-off location!',
            body:
              'Rider already at the drop-off location of transaction No. ' +
              snapshot.after.data().OrderNo,
          },
        })
        .then(msg => {
          functions.logger.log('success!: ', msg);
          console.log('success!: ', msg);
        })
        .catch(err => {
          functions.logger.log('function err!: ', err);
          console.log('function err!: ', err);
        });
    }
  });
