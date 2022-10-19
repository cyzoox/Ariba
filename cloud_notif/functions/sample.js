const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.NotificationWithRider = functions.firestore
  .document('orders/{ordersId}')
  .onCreate((snapshot, context) => {
    admin.messaging().sendToTopic('NewOrderWithRider', {
      notification: {
        title: 'New Order!',
        body: 'There is new order to deliver',
      },
    });

    admin
      .firestore()
      .collection('riders')
      .where('city', '==', snapshot.data().AccountInfo.city)
      .get()
      .then(result => {
        var registeredToken = [];
        result.docs.forEach(tokenDocument => {
          registeredToken.push(tokenDocument.data().token);
        });
        admin.messaging().sendMulticast({
          tokens: registeredToken,
          notification: {
            title: 'New Order!',
            body: 'There is new order to deliver',
          },
        });
      });
  });
