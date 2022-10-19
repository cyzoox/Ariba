const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

exports.SOSNotificationToAdmin = functions.firestore
  .document('SOS/{ordersId}')
  .onCreate(async (snapshot, context) => {
    const CityWikiData = snapshot.data().CityWikiData.trim();
    functions.logger.log('CityWikiData: ', CityWikiData);

    db.collection('charges')
      .where('arrayofCity', 'array-contains-any', [CityWikiData])
      .get()
      .then(querySnapshot => {
        functions.logger.log('querySnapshot function: ');
        querySnapshot.forEach(documentSnapshot => {
          functions.logger.log('documentSnapshot: ', documentSnapshot.data());
          db.collection('SOS')
            .doc(snapshot.data().id)
            .update({
              NotifiedAdmin: admin.firestore.FieldValue.arrayUnion(
                documentSnapshot.data().id,
              ),
            });

          const tileMessage =
            snapshot.data().callFor == 'Police'
              ? 'Police Emergency Alert!'
              : snapshot.data().callFor == 'Ambulance'
              ? 'Accident Alert, needs Ambulance & Rescue Team'
              : 'Fire Emergency Alert';

          admin
            .messaging()
            .sendMulticast({
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
              tokens: documentSnapshot.data().token,
              notification: {
                title: tileMessage,
                body: 'Their last location is at ' + snapshot.data().str.trim(),
              },
            })
            .then(msg => {
              console.log('success!: ', msg);
            })
            .catch(err => {
              console.log('function err!: ', err);
            });
        });
      });
  });
