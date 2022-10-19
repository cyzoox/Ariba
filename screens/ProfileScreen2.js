import React, {Component} from 'react';
import {
  AppState,
  NativeModules,
  Animated,
  StyleSheet,
  View,
  ScrollView,
  Alert,
  Share,
  Dimensions,
  FlatList,
  PermissionsAndroid,
  BackHandler,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  Button,
  HStack,
  Text,
  Box,
  Stack,
  Input,
} from 'native-base';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Zocial from 'react-native-vector-icons/Zocial';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Card, Title, Paragraph, Avatar, Caption} from 'react-native-paper';
import moment from 'moment';

import firestore from '@react-native-firebase/firestore';
import CustomHeader from './Header';
import auth from '@react-native-firebase/auth';
import Modal from 'react-native-modal';
import axios from 'axios';
import Province from './Province.json';
import Geolocation from 'react-native-geolocation-service';
var DirectSms = NativeModules.DirectSms;
var {height, width} = Dimensions.get('window');
import Loader from '../components/Loader';
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export async function request_device_location_runtime_permission() {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Need Location Permission',
        message: 'App needs access to your location ',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
    } else {
      await request_device_location_runtime_permissions();
    }
  } catch (err) {
    console.warn(err);
  }
}

export async function request_device_location_runtime_permissions() {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Need Location Permission',
        message: 'App needs access to your location ',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
    } else {
    }
  } catch (err) {
    console.warn(err);
  }
}

export default class ProfileScreen2 extends Component {
  constructor() {
    super();
    this.Rotatevalue = new Animated.Value(0);
    this.backCount = 0;
    this.cityRef = firestore();
    this.state = {
      appState: AppState.currentState,

      name: '',
      email: '',
      mobile: '',
      address: {},
      country: '',
      province: '',
      zipcode: '',
      username: '',
      ShareLink: '',
      ShareLinkLabel: '',
      QRCodeURL: '',
      wallet: 0,
      loggedIn: '',
      modalSelectedCity: false,
      modalSelectedCityNoUser: false,
      UserLocationCountry: '',
      AvailableOn: [],
      currentLocation: '',
      newCity: [],
      SelectedAvailableOn: [],
      searchCountry: '',
      searchState: '',
      SelectedSearchState: [],
      selectedCountry: '',
      CountryNow: [{labelRider: '', currency: '', currencyPabili: ''}],
      ViewCountry: false,
      photo: '',
      processing: 0,
      delivered: 0,
      asyncselectedCity: null,
      asyncselectedCountry: null,
      coords: null,
      str: null,
      res_data: [],
      RiderIDS: [],
      NumberAmbulance: [],
      NumberFireman: [],
      NumberPolice: [],
      cityOriginal: {},
      SOSMOdal: false,
      status: 'New',
      cities: [],
      modalSelectedState: false,
      SelectedCountryInfo: null,
      states: [],
      PressedCountry: null,
      loading: false,
      EmptyOperator: false,
      Operator: '',
      searchcity: '',
    };
  }

  backAction = () => {
    console.log('BackPressed');
  };

  componentWillUnmount() {
    this.appStateSubscription.remove();
    this.backHandler.remove();
  }
  async componentDidMount() {
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
          AsyncStorage.removeItem('asyncselectedCity');
          AsyncStorage.removeItem('asyncselectedCountry');
        }
        this.setState({appState: nextAppState});
      },
    );
    this.StartImageRotationFunction();
    const asyncselectedCity = await AsyncStorage.getItem('asyncselectedCity');
    const asyncselectedCountry = await AsyncStorage.getItem(
      'asyncselectedCountry',
    );
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
    this.setState({asyncselectedCity, asyncselectedCountry});
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.backAction,
    );
    firestore()
      .collection('LinkApp')
      .onSnapshot(querySnapshot => {
        querySnapshot.forEach(doc => {
          //console.log('doc.data(): ', doc.data())
          this.setState({
            ShareLink: doc.data().ShareLink,
            ShareLinkLabel: doc.data().ShareLinkLabel,
            QRCodeURL: doc.data().QRCodeURL,
          });
        });
      });
    // this.setState({loading: true})

    if (Platform.OS === 'android') {
      await request_device_location_runtime_permission();
    }

    Geolocation.getCurrentPosition(
      info => {
        const {coords} = info;
        //console.log('coordsL ', coords)

        axios
          .get(
            `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${coords.latitude}%2C${coords.longitude}&apiKey=5fcoJoPAIOye99-ssHc6TIx73yOAhtWiU1_1p1461X4`,
          )
          .then(res => {
            const UserLocationCountry = res.data.items[0].address.countryName;
            console.log('UserLocationCountry ', UserLocationCountry);

            const result = res.data.items[0].address.city;
            const short_code =
              res.data.items[0].address.countryName == 'Philippines'
                ? 'PH'
                : res.data.items[0].address.countryCode;
            console.log('short_code ', short_code);

            console.log('result: ', result);

            this.setState({
              cityOriginal: result,
              coords,
              str: res.data.items[0].address.label,
              res_data: res.data.items[0],
              UserLocationCountry:
                UserLocationCountry == 'Philippines'
                  ? 'city'
                  : UserLocationCountry.trim(),
              originalCountry:
                UserLocationCountry == 'Philippines'
                  ? 'city'
                  : UserLocationCountry.trim(),
              selectedCityUser: result,
              currentLocation: result,
              billing_streetTo: res.data.items[0].title,
              billing_provinceTo: res.data.items[0].address.county,
              fromPlace: res.data.items[0].address.label,
              location: res.data.items[0].address.label,
              x: {latitude: coords.latitude, longitude: coords.longitude},
            });

            this._bootstrapAsync(true, result.text, null, result.text);
            this.getAllStates(short_code.short_code);
            this.getAllCity();
          })
          .catch(err => {
            //   Alert.alert('Error', 'Internet Connection is unstable')
            console.log('Region axios: ', err);
            this.setState({loading: false});
          });
      },
      error => console.log(error),
      {
        enableHighAccuracy: false,
        timeout: 2000,
        maximumAge: 3600000,
      },
    );
    firestore()
      .collection('AvailableOn')
      .where('status', '==', true)
      .orderBy('label', 'asc')
      .onSnapshot(
        querySnapshot => {
          const AvailableOn = [];
          querySnapshot.forEach(doc => {
            AvailableOn.push(doc.data());
          });
          //     console.log('AvailableOn ',AvailableOn)
          this.setState({
            AvailableOn: AvailableOn,
            loading: false,
          });
        },
        error => {
          this.setState({loading: false});
          console.log(error);
        },
      );
  }
  onShare = async () => {
    try {
      const result = await Share.share({
        message: this.state.ShareLinkLabel + ' ' + this.state.ShareLink,
        url: this.state.QRCodeURL,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  };

  _bootstrapAsync = async (selected, item, typeOfRate, city) => {
    //   const asyncselectedCity= await AsyncStorage.getItem('asyncselectedCity');
    //  console.log('selectedCity: ',this.state.selectedCity)
    const NewCityItem = item.trim();
    const NewValueofCityUser = city.find(items => items.label === NewCityItem);
    this.setState({
      selectedCityUser:
        this.state.selectedCity == undefined
          ? item
          : this.state.selectedCity == 'none'
          ? item
          : this.state.selectedCity,
      typeOfRate: NewValueofCityUser.typeOfRate,
    });
    const newUserLocationCountry =
      this.state.UserLocationCountry == 'Philippines'
        ? 'vehicles'
        : this.state.UserLocationCountry + '.vehicles';
    //    firestore().collection(newUserLocationCountry).where('succeed', '>',0).onSnapshot(this.onCollectionProducts);
  };
  async getAllCity() {
    //  this.setState({loading: true})

    const collect =
      this.state.UserLocationCountry.trim() == 'Philippines'
        ? 'city'
        : this.state.UserLocationCountry.toString() + '.city';
    // console.log('collect: ', collect)
    //     console.log('UserLocationCountry: ', this.state.UserLocationCountry)
    //            console.log('selectedCountry: ', this.state.selectedCountry)
    firestore()
      .collection(collect)
      .where('OperatorsAvail', '>', 0)
      .onSnapshot(querySnapshot => {
        const city = [];
        querySnapshot.docs.forEach(doc => {
          city.push(doc.data());
          //    console.log('collect data: ', doc.data())
        });
        //  console.log('city getAllCity: ', city)
        this.setState({
          cities: city,
        });
      });

    const SosCity = [];
    const Soscollect =
      this.state.originalCountry.trim() == 'Philippines'
        ? 'city'
        : this.state.originalCountry.toString() + '.city';
    console.log('collect: ', Soscollect);
    console.log('cityOriginal: ', this.state.cityOriginal.text);
    firestore()
      .collection(Soscollect)
      .where('country', '==', this.state.originalCountry.trim())
      .onSnapshot(querySnapshot => {
        querySnapshot.docs.forEach(doc => {
          SosCity.push(doc.data());
          //  console.log('SosCity: ', doc.data())
        });
      });

    firestore()
      .collection(Soscollect)
      .where('arrayofCity', 'array-contains-any', [
        this.state.cityOriginal.text.trim(),
      ])
      .onSnapshot(querySnapshot => {
        querySnapshot.docs.forEach(doc => {
          //    console.log('NumberAmbulance: ', doc.data().NumberAmbulance)
          //     console.log('NumberFireman: ', doc.data().NumberFireman)
          //    console.log('NumberPolice: ', doc.data().NumberPolice)
          this.setState({
            NumberAmbulance: doc.data().NumberAmbulance,
            NumberFireman: doc.data().NumberFireman,
            NumberPolice: doc.data().NumberPolice,
          });
        });
      });

    const CountryNow = this.state.AvailableOn.filter(items => {
      const itemData = items.label;
      const textData = this.state.UserLocationCountry;

      return itemData.indexOf(textData) > -1;
    });

    this.setState({
      CountryNow,
      loading: false,
    });
  }
  async getAllStates(short_code) {
    //  this.setState({loading: true})

    console.log('getAllStates short_code: ', short_code.toUpperCase());

    firestore()
      .collection('AvailableOn')
      .doc(short_code.toUpperCase())
      .collection('states')
      .onSnapshot(querySnapshot => {
        const states = [];
        querySnapshot.docs.forEach(doc => {
          //         console.log('getCountryCity: ', doc.data().label)
          states.push(doc.data());
        });
        this.setState({
          states: states,
        });
      });

    this.setState({
      loading: false,
    });
  }

  async getCountryCity(PressedCountrycode) {
    //   this.setState({loading: true})
    const asyncselectedCountry = await AsyncStorage.getItem(
      'asyncselectedCountry',
    );
    console.log('PressedCountrycode: ', PressedCountrycode);
    console.log('selectedCountry: ', this.state.SelectedCountryInfo);

    firestore()
      .collection('AvailableOn')
      .doc(this.state.SelectedCountryInfo.code)
      .collection('states')
      .onSnapshot(querySnapshot => {
        const states = [];
        querySnapshot.docs.forEach(doc => {
          //         console.log('getCountryCity: ', doc.data().label)
          states.push(doc.data());
        });
        this.setState({
          states: states,
          modalSelectedState: true,
          modalSelectedCityNoUser: false,
          modalSelectedCity: false,
        });
      });
    const collect =
      asyncselectedCountry == null
        ? PressedCountrycode == 'Philippines'
          ? 'city'
          : PressedCountrycode.trim() + '.city'
        : asyncselectedCountry.trim() + '.city';
    firestore()
      .collection(collect)
      .where('OperatorsAvail', '>', 0)
      .onSnapshot(querySnapshot => {
        const city = [];
        querySnapshot.docs.forEach(doc => {
          //         console.log('getCountryCity: ', doc.data().label)
          city.push(doc.data());
        });
        this.setState({
          cities: city,
        });
      });
    if (this.state.AvailableOn.length < 1) {
      this.setState({
        CountryNow: [{labelRider: '', currency: '', currencyPabili: ''}],
      });
    }

    const CountryNow = this.state.AvailableOn.filter(items => {
      const itemData = items.label;
      const textData = PressedCountrycode;

      return itemData.indexOf(textData) > -1;
    });

    this.setState({
      CountryNow:
        CountryNow.length < 1
          ? [{labelRider: '', currency: '', currencyPabili: ''}]
          : CountryNow,
      PressedCountry: PressedCountrycode,
      loading: false,
    });
  }

  changeCity(item) {
    this._bootstrapAsync(true, item.label, item.typeOfRate, this.state.cities);
    this.setState({modalSelectedCity: false, newCity: [], searchcity: ''});
  }

  async getCountryCityNoUser(PressedCountrycode) {
    //   this.setState({loading: true})

    //console.log('PressedCountrycode getCountryCityNoUser : ', PressedCountrycode)
    if (this.state.selectedCountry == PressedCountrycode.trim()) {
      AsyncStorage.removeItem('asyncselectedCountry');
    } else {
      AsyncStorage.setItem('asyncselectedCountry', PressedCountrycode.trim());
    }
    const collect =
      PressedCountrycode == 'Philippines'
        ? 'city'
        : PressedCountrycode.trim() + '.city';
    // console.log('getCountryCityNoUser: ', collect)
    firestore()
      .collection(collect)
      .where('OperatorsAvail', '>', 0)
      .onSnapshot(querySnapshot => {
        const city = [];
        querySnapshot.docs.forEach(doc => {
          //     console.log('getCountryCity: ', doc.data().label)
          city.push(doc.data());
        });
        this.setState({
          cities: city,
        });
      });

    if (this.state.AvailableOn.length < 1) {
      this.setState({
        CountryNow: [{labelRider: '', currency: '', currencyPabili: ''}],
      });
    }

    const CountryNow = this.state.AvailableOn.filter(items => {
      const itemData = items.label;
      const textData = PressedCountrycode;

      return itemData.indexOf(textData) > -1;
    });

    this.setState({
      CountryNow:
        CountryNow.length < 1
          ? [{labelRider: '', currency: '', currencyPabili: ''}]
          : CountryNow,

      loading: false,
    });
  }

  changeCityNoUser(item) {
    //this.state.currentLocation.trim() == item.label
    Alert.alert('Do you want to book from another city?', ' ', [
      {text: 'Cancel', onPress: () => console.log('canceled')},

      {
        text: 'Proceed',
        onPress: () => {
          this.setState({loading: true});
          console.log('asyncselectedCity: ', item.label);
          if (this.state.selectedCityUser == item.label.trim()) {
            AsyncStorage.removeItem('asyncselectedCity');
          } else {
            AsyncStorage.setItem('asyncselectedCity', item.label.trim());
          }
          this._bootstrapAsync(
            true,
            item.label,
            item.typeOfRate,
            this.state.cities,
          );
          this.setState({
            modalSelectedCityNoUser: false,
            newCity: [],
            searchcity: '',
            loading: false,
          });
          this.props.navigation.reset({
            index: 0,
            routes: [{name: 'Home2'}],
          });
        },
      },
    ]);
  }

  async getCityProvince(PressedCountrycode) {
    // this.setState({loading: true})

    const asyncselectedCountry = await AsyncStorage.getItem(
      'asyncselectedCountry',
    );
    console.log('selectedCountry: ', this.state.selectedCountry);
    console.log('asyncselectedCountry: ', asyncselectedCountry);
    console.log('PressedCountrycode: ', PressedCountrycode);

    const collect =
      this.state.selectedCountry == null
        ? this.state.selectedCountry == 'Philippines'
          ? 'city'
          : this.state.selectedCountry.trim() + '.city'
        : this.state.UserLocationCountry.trim() == 'Philippines'
        ? 'city'
        : this.state.UserLocationCountry.trim() + '.city';
    console.log('collect: ', collect);
    firestore()
      .collection(collect)
      .where('province', '==', PressedCountrycode)
      .onSnapshot(querySnapshot => {
        const city = [];
        querySnapshot.docs.forEach(doc => {
          console.log('getCityProvince: ', doc.data().label);
          city.push(doc.data());
        });
        this.setState({
          cities: city,
        });
      });

    this.setState({
      modalSelectedCityNoUser: true,
      modalSelectedState: false,
      loading: false,
    });
  }

  StartImageRotationFunction() {
    this.Rotatevalue.setValue(0);
    Animated.timing(this.Rotatevalue, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: true, // Add This line
    }).start(() => this.StartImageRotationFunction());
  }

  render() {
    console.log('states: ', this.state.NumberPolice);
    console.log('NumberFireman: ', this.state.NumberFireman);
    const RotateData = this.Rotatevalue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '368deg'],
    });

    const trans = {
      transform: [{rotate: RotateData}],
    };
    return (
      <Box style={{backgroundColor:'white'}}>
        <CustomHeader
          title="Account Settings"
          isHome={true}
          Cartoff={true}
          navigation={this.props.navigation}
        />
        <Loader loading={this.state.loading} trans={trans} />

        <Modal
          isVisible={this.state.EmptyOperator}
          animationInTiming={500}
          animationIn="slideInUp"
          animationOut="slideOutDown"
          animationOutTiming={500}
          useNativeDriver={true}
          onBackButtonPress={() => this.setState({EmptyOperator: false})}
          transparent={true}>
          <View style={styles.contents}>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: 10,
              }}>
              <Text
                style={{
                  color: 'tomato',
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}>
                No Franchise Operator
              </Text>
            </View>
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <TouchableOpacity
                onPress={() =>
                  this.props.navigation.navigate('GatewayDetails', {
                    url: this.state.Operator,
                    title: 'Be a Franchise Operator',
                  })
                }
                style={{flexDirection: 'row', marginBottom: 25}}>
                <View
                  style={{backgroundColor: '#e85017', width: SCREEN_WIDTH / 2}}>
                  <Text
                    style={{color: 'white', textAlign: 'center', padding: 3}}>
                    {' '}
                    Click here to Become One
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          useNativeDriver={true}
          isVisible={this.state.modalSelectedState}
          onSwipeComplete={this.close}
          swipeDirection={['up', 'left', 'right', 'down']}
          style={styles.view}
          onBackButtonPress={() => this.setState({modalSelectedState: false})}
          onBackdropPress={() => this.setState({modalSelectedState: false})}
          transparent={true}>
          <View
            style={[
              styles.content,
              {
                height: SCREEN_HEIGHT,
                width: SCREEN_WIDTH,
                backgroundColor: 'white',
                marginLeft: -20,
              },
            ]}>
            <Card
              style={{
                width: SCREEN_WIDTH,
                marginTop: this.state.keyboardav == true ? 130 : 0,
              }}>
              <Box listItemPadding={0}>
                <Box style={{flex: 1}}>
                  <Button
                    transparent
                    onPress={() => this.setState({modalSelectedState: false})}>
                    <MaterialIcons name="arrow-back" size={25} color="black" />
                  </Button>
                </Box>
                <Box>
                  <TouchableOpacity
                    onPress={() =>
                      this.setState({ViewCountry: !this.state.ViewCountry})
                    }>
                    <Text>
                      {this.state.selectedCountry == ''
                        ? this.state.UserLocationCountry
                        : this.state.selectedCountry}
                    </Text>
                  </TouchableOpacity>
                </Box>
              </Box>
            </Card>

            <Card>
              {this.state.states.length < 1 ? null : (
                <Stack>
                  <AntDesign name="search1" size={25} color="gray" />
                  <Input
                    placeholder="Search State..."
                    value={this.state.searchState}
                    onChangeText={text => {
                      this.setState({
                        SelectedSearchState: this.state.states.filter(items => {
                          const itemData = items.label;
                          const textData = text;

                          return itemData.indexOf(textData) > -1;
                        }),
                        searchState: text,
                      });
                    }}
                    placeholderTextColor="#687373"
                    onFocus={() => this.setState({keyboardav: true})}
                    onBlur={() => this.setState({keyboardav: false})}
                  />
                </Stack>
              )}
              {this.state.states.length < 1 ? (
                <Box
                  style={{
                    marginTop: 0,
                    width: SCREEN_WIDTH,
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}>
                  <Text style={{fontSize: 17, paddingLeft: 20}}>
                    No Available Francise Operator
                  </Text>
                </Box>
              ) : (
                <FlatList
                  data={
                    this.state.SelectedSearchState.length > 0
                      ? this.state.SelectedSearchState
                      : this.state.states
                  }
                  renderItem={({item, index}) => (
                    <Box
                      bordered
                      style={{
                        marginTop: 0,
                        width: SCREEN_WIDTH,
                        flexDirection: 'row',
                      }}
                      key={index}
                      button
                      onPress={() => {
                        this.getCityProvince(item.label);
                        this.setState({
                          selectedState: item.label,
                          SelectedAvailableOn: [],
                          searchState: '',
                          SelectedStateInfo: item,
                        });
                      }}>
                      <Text style={{fontSize: 17, paddingLeft: 20}}>
                        {item.label}{' '}
                      </Text>
                    </Box>
                  )}
                  keyExtractor={(item, index) => index.toString()}
                  style={{marginBottom: 20}}
                />
              )}
            </Card>
          </View>
        </Modal>

        <Modal
          useNativeDriver={true}
          isVisible={this.state.modalSelectedCityNoUser}
          onSwipeComplete={this.close}
          swipeDirection={['up', 'left', 'right', 'down']}
          style={styles.view}
          onBackButtonPress={() =>
            this.setState({modalSelectedCityNoUser: false})
          }
          onBackdropPress={() =>
            this.setState({modalSelectedCityNoUser: false})
          }
          transparent={true}>
          <View
            style={[
              styles.content,
              {
                height: SCREEN_HEIGHT,
                width: SCREEN_WIDTH,
                backgroundColor: 'white',
                marginLeft: -20,
              },
            ]}>
            <Card
              style={{
                width: SCREEN_WIDTH,
                marginTop: this.state.keyboardav == true ? 130 : 0,
              }}>
              <HStack alignItems="center">
                <HStack style={{flex: 1, left:10}}>
                  <Button
                    style={{backgroundColor:'white'}}
                    onPress={() =>
                      this.setState({modalSelectedCityNoUser: false})
                    }>
                    <MaterialIcons name="arrow-back" size={25} color="black" />
                  </Button>
                </HStack>
                <HStack>
                  <TouchableOpacity
                  style={{right:10}}
                    onPress={() =>
                      this.setState({ViewCountry: !this.state.ViewCountry})
                    }>
                    <Text>
                      {this.state.asyncselectedCountry == null
                        ? this.state.selectedCountry == ''
                          ? this.state.UserLocationCountry
                          : this.state.selectedCountry
                        : this.state.asyncselectedCountry}
                    </Text>
                  </TouchableOpacity>
                </HStack>
              </HStack>
              <TouchableOpacity
                onPress={() => this.setState({EmptyOperator: true})}
                style={{alignSelf: 'flex-end', marginRight: 10}}>
                <Text>Become a Franchise Operator</Text>
              </TouchableOpacity>
            </Card>
            {this.state.ViewCountry == true ? (
              <Card>
                <Stack>
                  <Input
                    placeholder="Search..."
                    value={this.state.searchCountry}
                    onChangeText={text => {
                      this.setState({
                        SelectedAvailableOn: this.state.AvailableOn.filter(
                          items => {
                            const itemData = items.label;
                            const textData = text;

                            return itemData.indexOf(textData) > -1;
                          },
                        ),
                        searchCountry: text,
                      });
                    }}
                    placeholderTextColor="#687373"
                    onFocus={() => this.setState({keyboardav: true})}
                    onBlur={() => this.setState({keyboardav: false})}
                  />
                </Stack>
                <FlatList
                  data={
                    this.state.SelectedAvailableOn.length < 1
                      ? this.state.AvailableOn
                      : this.state.SelectedAvailableOn
                  }
                  renderItem={({item, index}) => (
                    <Box
                      bordered
                      style={{
                        marginTop: 0,
                        width: SCREEN_WIDTH,
                        flexDirection: 'row',
                      }}
                      key={index}
                      button
                      onPress={() => {
                        this.getCountryCityNoUser(item.label);
                        this.setState({
                          selectedCountry: item.label,
                          SelectedAvailableOn: [],
                          searchCountry: '',
                          ViewCountry: false,
                          keyboardav: false,
                        });
                      }}>
                      <Image
                        style={{width: 70, height: 50}}
                        resizeMethod="scale"
                        resizeMode="contain"
                        source={{uri: item.flag}}
                      />
                      <Text style={{fontSize: 17, paddingLeft: 20}}>
                        {item.label}{' '}
                        <Text style={{color: 'gray'}}>
                          {this.state.currentLocation.trim() == item.label
                            ? '(You are here)'
                            : null}{' '}
                          {item.label == 'Cebu City' ? '(Demo City)' : null}
                        </Text>
                      </Text>
                    </Box>
                  )}
                  keyExtractor={(item, index) => index.toString()}
                />
              </Card>
            ) : (
              <Card>
                <Stack>
                  <Input
                    placeholder="Search..."
                    value={this.state.searchcity}
                    onChangeText={text => {
                      this.setState({
                        newCity: this.state.cities.filter(items => {
                          const itemData = items.label;
                          const textData = text;

                          return itemData.indexOf(textData) > -1;
                        }),
                        searchcity: text,
                      });
                    }}
                    placeholderTextColor="#687373"
                    onFocus={() => this.setState({keyboardav: true})}
                    onBlur={() => this.setState({keyboardav: false})}
                  />
                </Stack>
                {this.state.searchcity != '' &&
                this.state.newCity.length == 0 ? (
                  <Box
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexDirection: 'column',
                    }}>
                    <Text style={{fontSize: 17, marginBottom: 10}}>
                      Sorry! The City/Municipality you're searching does not
                      have a franchise operator yet.
                    </Text>
                    <View
                      style={{justifyContent: 'center', alignItems: 'center'}}>
                      <TouchableOpacity
                        onPress={() =>
                          this.props.navigation.navigate('GatewayDetails', {
                            url: this.state.Operator,
                            title: 'Be a Franchise Operator',
                          })
                        }
                        style={{flexDirection: 'row', marginBottom: 25}}>
                        <View
                          style={{
                            backgroundColor: '#e85017',
                            width: SCREEN_WIDTH / 2,
                          }}>
                          <Text
                            style={{
                              color: 'white',
                              textAlign: 'center',
                              padding: 3,
                            }}>
                            {' '}
                            Please click here if you are interested to apply
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </Box>
                ) : (
                  <FlatList
                    data={
                      this.state.newCity.length < 1
                        ? this.state.cities
                        : this.state.newCity
                    }
                    renderItem={({item, index}) => (
                      <Box
                        bordered
                        style={{marginTop: 0, width: SCREEN_WIDTH}}
                        key={index}
                        button
                        onPress={() => {
                          this.changeCityNoUser(item);
                        }}>
                        <Text style={{fontSize: 17}}>
                          {item.label}{' '}
                          <Text style={{color: 'gray'}}>
                            {this.state.currentLocation.trim() == item.label
                              ? '(You are here)'
                              : null}{' '}
                            {item.label == 'Cebu City' ? '(Demo City)' : null}
                          </Text>
                        </Text>
                      </Box>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                  />
                )}
              </Card>
            )}
          </View>
        </Modal>

        <View>
          <HStack
            alignItems="center" 
            >
            <HStack>
              <Button style={{backgroundColor: '#FFFFFF'}}>
                <MaterialCommunityIcons name="login" size={25} color="gray" />
              </Button>
            </HStack>
            <HStack w={SCREEN_WIDTH/1.3}>
              <TouchableOpacity onPress={() => this.props.navigation.navigate('Login')}>
              <Text>Sign In</Text>
              </TouchableOpacity>
            </HStack>
          </HStack>
          <HStack itemDivider style={{backgroundColor: '#FFFFFF'}} />
          <HStack
            alignItems="center" 
           >
            <HStack>
              <Button style={{backgroundColor: '#FFFFFF'}}>
                <MaterialIcons name="my-location" size={25} color="gray" />
              </Button>
            </HStack>
            <HStack w={SCREEN_WIDTH/1.3}>
            <TouchableOpacity  onPress={() => this.setState({modalSelectedCityNoUser: true})}>
              <Text>
                City:{' '}
                {this.state.asyncselectedCity == null
                  ? this.state.selectedCityUser
                  : this.state.asyncselectedCity}
              </Text>
              </TouchableOpacity>
            </HStack>
            <HStack>
              <MaterialIcons
                name="keyboard-arrow-right"
                size={25}
                color="gray"
              />
            </HStack>
            
          </HStack>
          <HStack
            alignItems="center" 
            >
            <HStack>
              <Button style={{backgroundColor: '#FFFFFF'}}>
                <MaterialCommunityIcons
                  name="ticket-percent"
                  size={25}
                  color="gray"
                />
              </Button>
            </HStack>
            <HStack w={SCREEN_WIDTH/1.3}>
              <TouchableOpacity onPress={() => this.props.navigation.navigate('Vouchers')}>
              <Text>Vouchers</Text>
              </TouchableOpacity>
            </HStack>
            <HStack>
              <MaterialIcons
                name="keyboard-arrow-right"
                size={25}
                color="gray"
              />
            </HStack>
          </HStack>
          <HStack alignItems="center">
            <HStack>
              <Button style={{backgroundColor: '#FFFFFF'}}>
                <MaterialCommunityIcons
                  name="share-variant"
                  size={25}
                  color="gray"
                />
              </Button>
            </HStack>
            <HStack w={SCREEN_WIDTH/1.3}>
              <TouchableOpacity  onPress={this.onShare}>
              <Text>Share this app</Text>
              </TouchableOpacity>
            </HStack>
            <HStack>
              <MaterialIcons
                name="keyboard-arrow-right"
                size={25}
                color="gray"
              />
            </HStack>
          </HStack>

          <HStack alignItems="center" >
            <HStack>
              <Button style={{backgroundColor: '#FFFFFF'}}>
                <MaterialCommunityIcons
                  name="help-box"
                  size={25}
                  color="gray"
                />
              </Button>
            </HStack>
            <HStack w={SCREEN_WIDTH/1.3}>
              <TouchableOpacity>
              <Text>Help</Text>
              </TouchableOpacity>
            </HStack>
            <HStack>
              <MaterialIcons
                name="keyboard-arrow-right"
                size={25}
                color="gray"
              />
            </HStack>
          </HStack>

          <HStack itemDivider style={{backgroundColor: '#FFFFFF'}} />
          <HStack itemDivider style={{backgroundColor: '#FFFFFF'}} />
          <HStack itemDivider style={{backgroundColor: '#FFFFFF'}} />
          <HStack
            alignItems="center" 
           >
            <HStack>
              <Button style={{backgroundColor: '#FFFFFF'}}>
                <FontAwesome name="handshake-o" size={20} color="gray" />
              </Button>
            </HStack>
            <HStack w={SCREEN_WIDTH/1.3}>
              <TouchableOpacity onPress={() => this.props.navigation.navigate('Gateway')}>
              <Text>Partner with Us</Text>
              </TouchableOpacity>
            </HStack>
            <HStack>
              <MaterialIcons
                name="keyboard-arrow-right"
                size={25}
                color="gray"
              />
            </HStack>
          </HStack>
        </View>
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
  contents: {
    backgroundColor: 'white',
    padding: 22,
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
});
