import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { View, Text, Image, PermissionsAndroid } from 'react-native';
import { Button } from 'react-native-elements';


class LocationPermission extends React.Component {

    async onSkip() {
    const isLoggedIn = await AsyncStorage.getItem('uid');
    AsyncStorage.setItem('loc_perm', 'not_granted');
    this.props.navigation.reset({
        index: 0,
        routes: [{name: isLoggedIn ? 'Home' : 'Home2'}],
      })
}

      // Function to get permission for location
      async requestLocationPermission() {
    const isLoggedIn = await AsyncStorage.getItem('uid');
   
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Geolocation Permission',
          message: 'Can we access your location?',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      if (granted === 'granted') {
        AsyncStorage.setItem('loc_perm', 'granted');
        this.props.navigation.reset({
            index: 0,
            routes: [{name: isLoggedIn ? 'Home' : 'Home2'}],
          });
      
      } else {
        this.props.navigation.reset({
            index: 0,
            routes: [{name: isLoggedIn ? 'Home' : 'Home2'}],
          });
      }
    } catch (err) {
      return false;
    }
  };
render(){
    return(
        <>
        <View style={{flex: 1,justifyContent:'center',alignItems:'center'}}>
            <Image 
                source={require('../assets/icons-marker.png')}
                style={{width:50, height: 50}}
            />
            <Text>Use your Location</Text>
            <Image 
                source={require('../assets/map.png')}
                style={{width:300, height: 300}}
            />
            <Text style={{textAlign:'center', marginHorizontal: 10}}>
                Ariba collects location data to enable order tracking and user location even when the app is in foreground or not in used.
            </Text>

        </View>
        <View style={{justifyContent:'space-between', flexDirection:'row',  margin: 10}}>
        <Button style={{width: 200}} type='outline' title="  Skip  " onPress={()=> this.onSkip()}/>
        <Button title="Turn On" onPress={()=> this.requestLocationPermission()}/>
        </View>
        </>
    )
}
   
}
export default LocationPermission;