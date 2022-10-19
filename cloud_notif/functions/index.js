const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

exports.NewSOSNotificationRider = functions.firestore
  .document('SOS/{ordersId}')
  .onCreate(async (snapshot, context) => {
    const CityWikiData = snapshot.data().CityWikiData.trim();
    const CountryWikiData = snapshot.data().CountryWikiData.trim();
    const CityCollection =
      CountryWikiData == 'Philippines' ? 'city' : CityWikiData + '.city';
    functions.logger.log('CityWikiData: ', CityWikiData);
    functions.logger.log('CountryWikiData: ', CountryWikiData);
    functions.logger.log('CityCollection: ', CityCollection);
    db.collection(CityCollection)
      .doc(CityWikiData)
      .collection('RidersTokens')
      .doc('token')
      .get()
      .then(querySnapshot => {
        functions.logger.log('querySnapshot function: ');
        if (querySnapshot.exists) {
          console.log('Document data:', querySnapshot.data());
          functions.logger.log('Ridertokens: ', querySnapshot.data());
          const tileMessage =
            snapshot.data().callFor == 'Police'
              ? 'Police Emergency Alert!'
              : snapshot.data().callFor == 'Ambulance'
              ? 'Accident Alert, needs Ambulance & Rescue Team'
              : 'Fire Emergency Alert';

          admin
            .messaging()
            .sendMulticast({
              tokens: querySnapshot.data().Ridertokens,
              data: {
                name: 'SOS',
                mobile: snapshot.data().mobile,
                customername: snapshot.data().name,
                photo: snapshot.data().photo,
                str: snapshot.data().str,
                callFor: snapshot.data().callFor,
                email: snapshot.data().email,
                DatePressed: snapshot.data().DatePressed.toString(),
                latitude: snapshot.data().coords.latitude.toString(),
                longitude: snapshot.data().coords.longitude.toString(),
              },

              notification: {
                title: tileMessage,
                body: 'Their last location is at ' + snapshot.data().str.trim(),
              },
            })
            .then(msg => {
              console.log('success!!!: ', msg);
            })
            .catch(err => {
              console.log('function err!: ', err);
            });
        } else {
          // doc.data() will be undefined in this case
          functions.logger.log('No such document!');
        }
      })
      .catch(error => {
        functions.logger.log('Error getting document:', error);
      });
  });
