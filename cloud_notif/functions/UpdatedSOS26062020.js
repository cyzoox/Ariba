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
          functions.logger.log('id: ', snapshot.data().id);
          functions.logger.log('userId: ', snapshot.data().userId);
          if (ifPresent == false) {
            db.collection('SOS')
              .doc(snapshot.data().id)
              .update({
                NotifiedRider: admin.firestore.FieldValue.arrayUnion(
                  documentSnapshot.data().userId,
                ),
              });

            const tileMessage =
              snapshot.data().callFor == 'Police'
                ? 'Police Emargency Alert!'
                : snapshot.data().callFor == 'Ambulance'
                ? 'Accident Alert, needs Ambulance & Rescue Team'
                : 'Fire Alarm';
            const bodySub =
              snapshot.data().callFor == 'Fireman'
                ? 'Location: '
                : 'Last Location: ';

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
                tokens:
                  documentSnapshot.data().token.length == 0
                    ? ['sample Id']
                    : documentSnapshot.data().token,
                notification: {
                  title: tileMessage,
                  body: bodySub + snapshot.data().str.trim(),
                  vibrate: 1,
                  sound: 1,
                  show_in_foreground: true,
                  priority: 'high',
                  content_available: true,
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
