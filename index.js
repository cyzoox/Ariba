/**
 * @format
 */

 import {AppRegistry,LogBox} from 'react-native';
 import App from './App';
 import {name as appName} from './app.json';
 //import bgMessaging from './screens/FCM/bgMessaging';
 import messaging from '@react-native-firebase/messaging';
 import notifee from '@notifee/react-native';

 if (__DEV__) {
   const ignoreWarns = [
     "EventEmitter.removeListener",
     "[fuego-swr-keys-from-collection-path]",
     "Setting a timer for a long period of time",
     "ViewPropTypes will be removed from React Native",
     "AsyncStorage has been extracted from react-native",
     "exported from 'deprecated-react-native-prop-types'.",
     "Non-serializable values were found in the navigation state.",
     "VirtualizedLists should never be nested inside plain ScrollViews",
   ];
 
   const warn = console.warn;
   console.warn = (...arg) => {
     for (const warning of ignoreWarns) {
       if (arg[0].startsWith(warning)) {
         return;
       }
     }
     warn(...arg);
   };
 
   LogBox.ignoreLogs(ignoreWarns);
 }


messaging().setBackgroundMessageHandler(async remoteMessage => {
    const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        sound: 'notif',
      });
  
      // Display a notification
      await notifee.displayNotification({
          title: remoteMessage.notification.title,
        body: remoteMessage.notification.body,
        android: {
          channelId,
          smallIcon: 'ic_launcher', // optional, defaults to 'ic_launcher'.
          sound: 'notif',
        },
      });
    console.log('Message handled in the background!', remoteMessage);
  });
 AppRegistry.registerComponent(appName, () => App);
 //AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => bgMessaging); // <-- Add this line