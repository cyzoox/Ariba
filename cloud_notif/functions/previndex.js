const functions = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp();


exports.AllNotifications = functions.firestore
    .document('orders/{ordersId}')
    .onCreate((snapshot, context) => {
  
admin.firestore().collection('charges').where('city', '==', snapshot.data().AccountInfo.city).get().then(
        result => {
          var registeredToken = [];
          result.docs.forEach(
            tokenDocument => {
              registeredToken.push(tokenDocument.data().token);
            }
          );
          admin.messaging().sendMulticast(
            {
              tokens: registeredToken,
              notification:{
                title: 'New Transaction!',
                body: 'There is new transaction'
              }
            }
          )
        }
      )
      admin.firestore().collection('riders').where('city', '==', snapshot.data().AccountInfo.city).get().then(
        result => {
          var registeredToken = [];
          result.docs.forEach(
            tokenDocument => {
              registeredToken.push(tokenDocument.data().token);
            }
          );
          admin.messaging().sendMulticast(
            {
              tokens: registeredToken,
              notification:{
                title: 'New Transaction!',
                body: 'There is new transaction'
              }
            }
          )
        }
      )

    if(snapshot.data().ProductType == 'Transport')
{
  admin.firestore().collection('riders').where('Account', '==', 'Transport').where('city', '==', snapshot.data().Billing.billing_city).get().then(
        result => {
          var registeredToken = [];
          result.docs.forEach(
            tokenDocument => {
              registeredToken.push(tokenDocument.data().token);
            }
          );
          admin.messaging().sendMulticast(
            {
              tokens: registeredToken,
              notification:{
                title: 'New Transaction!',
                body: 'There is new transaction'
              }
            }
          )
        }
      )

}
      else if(snapshot.data().ProductType == 'Services' ||snapshot.data().ProductType == 'Rentals')
{

          admin.messaging().sendMulticast(
            {
              tokens: snapshot.data().user_token,
              notification:{
                title: 'New Transaction!',
                body: 'There is new transaction'
              }
            }
          )
      

}
    });
