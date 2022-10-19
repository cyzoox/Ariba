import React, {Component} from 'react';
import {
  AppState,
  StyleSheet,
  View,
  ScrollView,
  Alert,
  Image,Dimensions
} from 'react-native';
import {
  Box,
  Button,
  HStack,
  Text,
} from 'native-base';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Card, Title, Paragraph, Avatar} from 'react-native-paper';
import {TouchableOpacity} from 'react-native-gesture-handler';
import firestore from '@react-native-firebase/firestore';
import CustomHeader from './Header';
import auth from '@react-native-firebase/auth';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export default class Gateway extends Component {
  constructor() {
    super();
    this.state = {
      appState: AppState.currentState,
      uid: '',
      name: '',
      email: '',
      mobile: '',
      address: {},
      country: '',
      province: '',
      zipcode: '',
      username: '',
      wallet: 0,
      Hotel: '',
      Operator: '',
      Rider: '',
      Store: '',
      loggedIn: '',
    };
    this.FetchProfile();
  }

  FetchProfile = async () => {
    const userId = await AsyncStorage.getItem('uid');
    this.setState({
      loggedIn: userId,
    });
    const ref = firestore().collection('users').doc(userId);
    ref.get().then(doc => {
      if (doc.exists) {
        const data = doc.data();
        this.setState({
          key: doc.id,
          name: data.Name,
          email: data.Email,
          mobile: data.Mobile,
          address: data.Address,
          username: data.Username,
          wallet: data.wallet,
        });
      }
    });
  };

  _bootstrapAsync = async () => {
    const userId = await AsyncStorage.getItem('uid');

    if (userId) {
      this.FetchProfile();
      this.setState({uid: userId});
    }
  };

  signOut() {
    auth()
      .signOut()
      .then(() => {
        AsyncStorage.removeItem('uid');
        Alert.alert(
          'You have successfully logged out.',
          'Please come back soon.',
          [
            {
              text: 'OK',
              onPress: () =>
                this.props.navigation.reset({
                  index: 0,
                  routes: [{name: 'Home'}],
                }),
            },
          ],
          {cancelable: false},
        );
      })
      .catch(error => this.setState({errorMessage: error.message}));
  }

  componentDidMount() {
    this.appStateSubscription = AppState.addEventListener(
      'change',
      nextAppState => {
        if (
          this.state.appState.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          console.log('App has come to the foreground!');
        } else {
          console.log('Exitnow');
          if (auth().currentUser.uid) {
            firestore()
              .collection('users')
              .doc(auth().currentUser.uid)
              .update({
                cityLong: 'none',
                cityLat: 'none',
                selectedCountry: '',
                selectedCity: 'none',
              });
          }
        }
        this.setState({appState: nextAppState});
      },
    );
    this._bootstrapAsync();
    firestore()
      .collection('LinkApp')
      .onSnapshot(querySnapshot => {
        querySnapshot.forEach(doc => {
          console.log('doc.data(): ', doc.data());
          this.setState({
            Hotel: doc.data().Hotel,
            Operator: doc.data().Operator,
            Rider: doc.data().Rider,
            Store: doc.data().Store,
          });
        });
      });
  }

  componentWillUnmount() {
    this.appStateSubscription.remove();
  }

  render() {
    const {uid} = this.state;
    return (
      <Box style={{backgroundColor:'white'}}>
        <CustomHeader
          title="Account Settings"
          isHome={true}
          Cartoff={true}
          navigation={this.props.navigation}
        />

        <ScrollView>
          <HStack itemDivider style={{backgroundColor: '#FFFFFF'}} />

          <HStack
            alignItems="center" 
            >
            <Box>
              <Button style={{backgroundColor: '#FFFFFF'}}>
                <MaterialIcons
                  name="admin-panel-settings"
                  size={25}
                  color="gray"
                />
              </Button>
            </Box>
            <Box w={SCREEN_WIDTH/1.3}>
              <TouchableOpacity onPress={() =>
              this.props.navigation.navigate('GatewayDetails', {
                url: this.state.Operator,
                title: 'Franchise Operator',
              })
            }>
              <Text>Franchise Operator</Text>
              </TouchableOpacity>
            </Box>
            <Box>
              <MaterialIcons
                name="keyboard-arrow-right"
                size={25}
                color="gray"
              />
            </Box>
          </HStack>

          <HStack
            alignItems="center" 
           >
            <Box>
              <Button style={{backgroundColor: '#FFFFFF'}}>
                <Image
                  style={{width: 20, height: 20, resizeMode: 'contain'}}
                  source={require('../assets/rent.png')}
                />
              </Button>
            </Box>
            <Box w={SCREEN_WIDTH/1.3}>
              <TouchableOpacity onPress={() =>
              this.props.navigation.navigate('GatewayDetails', {
                url: this.state.Store,
                title: 'Be an Entrepreneur',
              })
            }>
              <Text>Be an Entrepreneur</Text>
              </TouchableOpacity>
            </Box>
            <Box>
              <MaterialIcons
                name="keyboard-arrow-right"
                size={25}
                color="gray"
              />
            </Box>
          </HStack>
          <HStack
            alignItems="center" 
            >
            <Box>
              <Button style={{backgroundColor: '#FFFFFF'}}>
                <Image
                  style={{width: 20, height: 20, resizeMode: 'contain'}}
                  source={require('../assets/rent.png')}
                />
              </Button>
            </Box>
            <Box w={SCREEN_WIDTH/1.3}>
              <TouchableOpacity onPress={() =>
              this.props.navigation.navigate('GatewayDetails', {
                url: this.state.Hotel,
                title: 'Be a hotel, rentals and service merchant',
              })
            }>
              <Text>Be an Hotel Partner</Text>
              </TouchableOpacity>
            </Box>
            <Box>
              <MaterialIcons
                name="keyboard-arrow-right"
                size={25}
                color="gray"
              />
            </Box>
          </HStack>

          <HStack
            alignItems="center" 
           >
            <Box>
              <Button style={{backgroundColor: '#FFFFFF'}}>
                <FontAwesome name="drivers-license-o" size={20} color="gray" />
              </Button>
            </Box>
            <Box w={SCREEN_WIDTH/1.3}>
              <TouchableOpacity  onPress={() =>
              this.props.navigation.navigate('GatewayDetails', {
                url: this.state.Rider,
                title: 'Delivery Rider',
              })
            }>
              <Text>Delivery Rider</Text>
              </TouchableOpacity>
            </Box>
            <Box>
              <MaterialIcons
                name="keyboard-arrow-right"
                size={25}
                color="gray"
              />
            </Box>
          </HStack>

          <HStack itemDivider style={{backgroundColor: '#FFFFFF'}} />
        </ScrollView>
      </Box>
    );
  }
}

const styles = StyleSheet.create({
  stepIndicator: {
    marginVertical: 10,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
