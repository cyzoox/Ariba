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
                ? 'Police Emergency Alert!'
                : snapshot.data().callFor == 'Ambulance'
                ? 'Accident Alert, needs Ambulance & Rescue Team'
                : 'Fire Emergency Alert';
            const bodySub =
              snapshot.data().callFor == 'Fireman'
                ? 'Location: '
                : 'Last Location: ';
            functions.logger.log('tileMessage: ', tileMessage);
            functions.logger.log('bodySub: ', bodySub);
            functions.logger.log(
              'documentSnapshot.data().token: ',
              documentSnapshot.data().token,
            );
            functions.logger.log('snapshot.data().str: ', snapshot.data().str);
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
                    ? [
                        'dUuBDY0wROi7J4Vn6M7DJl:APA91bFYGnJj6UU4WTQs8clxNBW4IJt7G62SqmzuV3a8RcIUM8hneRTSJ7qaXsP57xzM_7XZLsla61kGVVxNiqyZwq1Cl7wGMXyGmUliwqsZDZrFANIY4Jq7-8ejC3GVbggAxyOKoJN1',
                      ]
                    : documentSnapshot.data().token,
                notification: {
                  title: tileMessage,
                  body: bodySub + snapshot.data().str,
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
