const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

exports.SOSNotificationToRiders = functions.firestore
  .document('SOS/{ordersId}')
  .onCreate(async (snapshot, context) => {
    const CityWikiData = snapshot.data().CityWikiData.trim();
    functions.logger.log('CityWikiData: ', CityWikiData);

    db.collection('riders')
      .where('arrayofCity', 'array-contains-any', [CityWikiData])
      .get()
      .then(querySnapshot => {
        functions.logger.log('riders querySnapshot function: ');
        querySnapshot.forEach(documentSnapshot => {
          functions.logger.log('riders documentSnapshot function: ');
          functions.logger.log(
            'riders documentSnapshot: ',
            documentSnapshot.data(),
          );
          const RiderTokens = snapshot.data().RiderIDS;

          const ifPresent = RiderTokens.includes(
            documentSnapshot.data().userId,
          );
          functions.logger.log('ifPresent: ', ifPresent);
          if (ifPresent == false) {
            admin
              .messaging()
              .sendMulticast({
                data: {
                  name: 'SOS',
                  mobile: snapshot.data().mobile,
                  name: snapshot.data().name,
                  photo: snapshot.data().photo,
                  str: snapshot.data().str,
                  latitude: snapshot.data().coords.latitude,
                  longitude: snapshot.data().coords.longitude,
                },
                tokens: documentSnapshot.data().token,
                notification: {
                  title: 'Somebody needs ' + snapshot.data().callFor + '!',
                  body:
                    'Their last location is at ' + snapshot.data().str.trim(),
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
      });
  });
