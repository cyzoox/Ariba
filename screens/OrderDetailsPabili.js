import React, {Component} from 'react';
import {
  AppState,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
  Image,
  FlatList,
  TouchableWithoutFeedback,
  SafeAreaView,
  ScrollView,
  BackHandler,
  Keyboard,
  PermissionsAndroid,
  Animated,
} from 'react-native';
import {
  View,
  Button,
  StatusBar,
  Stack,
  Input,
  HStack,
  Text,
  FormControl,
  TextArea,
  Box,
} from 'native-base';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
// Our custom files and classes import
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
import {RadioButton, Chip, Divider,Card} from 'react-native-paper';
//import { StackActions, NavigationActions } from 'react-navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import Modal from 'react-native-modal';
import TearLines from 'react-native-tear-lines';
import NumberFormat from 'react-number-format';
import Loader from '../components/Loader';
import CustomHeader from './Header';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import axios from 'axios';
import Rider_img from '../assets/rider.png';
import customer_img from '../assets/customer.png';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import * as ImagePicker from 'react-native-image-picker';
import {imgDefault} from './images';
import marker from '../assets/icons-marker.png';
import Province from './Province.json';
import Clipboard from '@react-native-clipboard/clipboard';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Octicons from 'react-native-vector-icons/Octicons';
import RNImmediatePhoneCall from 'react-native-immediate-phone-call';
import SendSMS from 'react-native-sms';
import DropDownPicker from 'react-native-dropdown-picker';
import Geolocation from 'react-native-geolocation-service';
import {Rating, AirbnbRating} from 'react-native-ratings';
import MapboxGL, {Logger} from '@react-native-mapbox-gl/maps';
MapboxGL.setAccessToken(
  'sk.eyJ1IjoiY3l6b294IiwiYSI6ImNrdmFxNW5iODBoa2kzMXBnMGRjNXRwNHUifQ.KefOQn1CBBNu-qw1DhPblA',
);

Logger.setLogCallback(log => {
  const {message} = log;

  // expected warnings - see https://github.com/mapbox/mapbox-gl-native/issues/15341#issuecomment-522889062
  if (
    message.match('Request failed due to a permanent error: Canceled') ||
    message.match('Request failed due to a permanent error: Socket Closed')
  ) {
    return true;
  }
  return false;
});

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

export default class OrderDetailsPabili extends Component {
  constructor(props) {
    super(props);
    this.Rotatevalue = new Animated.Value(0);
    this.updateref = firestore();
    this.updatecounts = firestore();
    this.updateUserOrders = firestore();
    this.checkoutref = firestore();
    this.storeRef = firestore();
    this.paymentsRef = firestore();
    this.billingRef = firestore();
    this.paymentMethodRef = firestore();
    this.ordercounters = firestore();
    this.chargeref = firestore()
      .collection('vehicles')
      .where('vehicle', '==', 'Motorcycle');
    this.state = {
      appState: AppState.currentState,
      orders: this.props.route.params.orders,
      VisibleAddInfo: false,
      datas: [],
      cLong: this.props.route.params.orders.flong,
      cLat: this.props.route.params.orders.flat,
      driver_charge: 0,
      xtra: 0,
      labor: 0,
      deliveryCharge: 0,
      pickup: 0,
      stores: [],
      paymentMethod: 'Cash on Delivery (COD)',
      billing_name: this.props.route.params.orders.billing_name,
      billing_postal: this.props.route.params.orders.billing_postal,
      billing_phone: this.props.route.params.orders.billing_phone,
      billing_street: this.props.route.params.orders.billing_street,
      billing_country: this.props.route.params.orders.billing_country,
      billing_province: this.props.route.params.orders.billing_province,
      billing_city: this.props.route.params.orders.billing_city,
      billing_barangay: this.props.route.params.orders.billing_barangay,
      billing_cluster: this.props.route.params.orders.billing_cluster,
      billing_nameTo: this.props.route.params.orders.billing_nameTo,
      billing_postalTo: this.props.route.params.orders.billing_postalTo,
      billing_phoneTo: this.props.route.params.orders.billing_phoneTo,
      billing_streetTo: this.props.route.params.orders.billing_streetTo,
      billing_countryTo: this.props.route.params.orders.billing_countryTo,
      billing_provinceTo: this.props.route.params.orders.billing_provinceTo,
      billing_cityTo: this.props.route.params.orders.billing_cityTo,
      billing_barangayTo: this.props.route.params.orders.billing_barangayTo,
      billing_clusterTo: this.props.route.params.orders.billing_clusterTo,
      preffered_delivery_time: '',
      currentDate: new Date(),
      visibleModal: false,
      isVisible: false,
      payments: [],
      methods: [],
      palawan_name: '',
      palawan_number: '',
      bank_number: '',
      bank_name: '',
      gcash_number: '',
      counter: 0,
      account_name: '',
      account_address: '',
      account_city: '',
      account_barangay: '',
      account_province: '',
      account_email: '',
      account_number: '',
      account_cluster: '',
      account_status: '',
      paypal_email: '',
      paypal_uname: '',
      vouchers: [],
      discount: 0,
      voucherArray: [],
      charge: 0,
      xtraCharge: 0,
      voucherCode: '',
      loading: false,
      address_list: [],
      visibleAddressModal: false,
      visibleAddressModalPin: false,
      //subtotal: subtotal,
      minimum: 0,
      selectedIndex: 0,
      selectedIndices: [0],
      customStyleIndex: 0,
      isready: 0,
      visibleAddressModalTo: true,
      visibleAddressModalToPin: false,
      passenger: '1',
      note: '',
      AlwaysOpen: true,
      Customerimage: null,
      Metro: 0,
      City: 0,
      SCity: 0,
      SMetro: 0,
      warningModal: false,
      fromPlace:
        this.props.route.params.orders.Billing.address +
        ', ' +
        this.props.route.params.orders.Billing.barangay +
        ', ' +
        this.props.route.params.orders.Billing.billing_city +
        ', ' +
        this.props.route.params.orders.Billing.province,
      flat: this.props.route.params.orders.flat,
      flong: this.props.route.params.orders.flong,
      region: {
        latitude: this.props.route.params.orders.flat,
        longitude: this.props.route.params.orders.flong,

        // latitudeDelta: 0.0005,
        //longitudeDelta: 0.05
        latitudeDelta: 0.01,
        longitudeDelta: 0.005,
      },
      searchResult: [],
      searchResultto: [],
      toPlace:
        this.props.route.params.orders.billing_streetTo +
        ', ' +
        this.props.route.params.orders.billing_barangayTo +
        ', ' +
        this.props.route.params.orders.billing_cityTo +
        ', ' +
        this.props.route.params.orders.billing_provinceTo,
      isLoading: false,
      Tolat: this.props.route.params.orders.Tolat,
      Tolong: this.props.route.params.orders.Tolong,
      reasonofCancel: '',
      otherreasonofcancel: '',
      RLat: null,
      RLong: null,
      DriverInfo: null,
      image: null,
      eta: 0,
      ratings: 0,
      routeForMap: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [
                [this.props.route.params.cLong, this.props.route.params.cLat],
                [this.props.route.params.cLong, this.props.route.params.cLat],
              ],
            },
          },
        ],
      },
      rating: 0,
      ratingModal: false,
      showURL: false,
      ItemList: [],
      CancelledModal: false,
      CancelledBy: '',
      RiderCancel: [],
      travelTime:
        this.props.route.params.orders.travelTime == undefined
          ? 0
          : this.props.route.params.orders.travelTime,
      AdditionalMinute:
        this.props.route.params.orders.AdditionalMinute == undefined
          ? 0
          : this.props.route.params.orders.AdditionalMinute,
      AdditionalMinMinute:
        this.props.route.params.orders.AdditionalMinMinute == undefined
          ? 0
          : this.props.route.params.orders.AdditionalMinMinute,
      userInfo: null,
    };
  }

  backAction = () => {
    Alert.alert('Hold on!', 'Are you sure you want to go back?', [
      {
        text: 'Cancel',
        onPress: () => null,
        style: 'cancel',
      },
      {text: 'YES', onPress: () => null},
    ]);
    return true;
  };

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
        this.setState({appState: nextAppState});
      },
    );
    this.StartImageRotationFunction();
    /* this.backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      this.backAction
    );*/
    firestore()
      .collection('users')
      .where('userId', '==', auth().currentUser.uid)
      .onSnapshot(
        querySnapshot => {
          querySnapshot.forEach(doc => {
            this.setState({userInfo: doc.data()});
          });
        },
        error => {
          //   console.log(error)
        },
      );
    if (Platform.OS === 'android') {
      await request_device_location_runtime_permission();
    }

    Geolocation.getCurrentPosition(
      info => {
        const {coords} = info;
        console.log('coordsL ', coords);
        this.setState({
          x: {latitude: coords.latitude, longitude: coords.longitude},
        });
      },
      error => console.log(error),
      {
        enableHighAccuracy: false,
        timeout: 2000,
        maximumAge: 3600000,
      },
    );

    this._bootstrapAsync();
  }

  componentWillUnmount() {
    this.appStateSubscription.remove();
    this.subscribe && this.subscribe();
    this._bootstrapAsync();
  }

  _bootstrapAsync = async () => {
    const userId = await AsyncStorage.getItem('uid');

    this.setState({uid: userId});

    const {flat, flong, Tolat, Tolong} = this.state;
    let from_lat = flat;
    let from_long = flong;
    let to_lat = Tolat;
    let to_long = Tolong;
    console.log('to_lat: ', to_lat);
    console.log('to_long: ', to_long);
    let routeCoordinates = [];

    axios
      .get(
        `https://route.ls.hereapi.com/routing/7.2/calculateroute.json?apiKey=5fcoJoPAIOye99-ssHc6TIx73yOAhtWiU1_1p1461X4&waypoint0=geo!${from_lat},${from_long}&waypoint1=geo!${to_lat},${to_long}&mode=fastest;car;traffic:disabled&legAttributes=shape`,
      )
      .then(res => {
        res.data.response.route[0].leg[0].shape.map(m => {
          // here we are getting latitude and longitude in seperate variables because HERE sends it together, but we
          // need it seperate for <Polyline/>
          let latlong = m.split(',');
          let latitude = parseFloat(latlong[0]);
          let longitude = parseFloat(latlong[1]);
          routeCoordinates.push([longitude, latitude]);
        });
        this.setState({
          routeForMap: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: routeCoordinates,
                },
              },
            ],
          },

          summary: res.data.response.route[0].summary,

          isLoading: false,
        });
      });

    firestore()
      .collection('orders')
      .where('OrderId', '==', this.props.route.params.orders.OrderId)
      .onSnapshot(querySnapshot => {
        querySnapshot.forEach(doc => {
          this.setState({
            orders: doc.data(),
            rating: doc.data().rating == undefined ? 5 : doc.data().rating,
            ratingModal:
              doc.data().OrderStatus == 'Delivered' &&
              doc.data().rating == undefined
                ? true
                : false,
            OrderStatus: doc.data().OrderStatus,
            RiderCancel: doc.data().RiderCancel,
            DeliveredBy: doc.data().extra_charge,
            RLat: doc.data().RLat,
            RLong: doc.data().RLong,
            DriverInfo: doc.data().DeliveredBy,
            image: doc.data().image,
            eta:
              doc.data().DeliveredBy.eta == undefined
                ? 0
                : doc.data().DeliveredBy.eta / 60,
            ratings: doc.data().DeliveredBy.rating,
            note: doc.data().Note,
            ItemList: doc.data().ItemList,

            isCancelled: doc.data().isCancelled,
            CancelledBy:
              doc.data().CancelledBy == undefined ? '' : doc.data().CancelledBy,
            travelTime:
              doc.data().travelTime == undefined ? 0 : doc.data().travelTime,
            AdditionalMinute:
              doc.data().AdditionalMinute == undefined
                ? 0
                : doc.data().AdditionalMinute,
            AdditionalMinMinute:
              doc.data().AdditionalMinMinute == undefined
                ? 0
                : doc.data().AdditionalMinMinute,
          });
          if (doc.data().OrderStatus == 'For Cancel') {
            this.setState({CancelledModal: true});
          }
        });
      });
  };

  ratingCompleted = rating => {
    console.log('Rating is: ' + rating);
    this.setState({rating: rating});
  };

  SubmitRating() {
    console.log('rating: ', this.state.rating);
    console.log('Driver Id: ', this.state.DriverInfo.id);
    this.setState({isLoading: true});
    if (parseFloat(this.state.rating) == 0) {
      Alert.alert('Invalid Rating', 'Rating should be 1-5');
      return;
    }
    firestore()
      .collection('riders')
      .doc(this.state.DriverInfo.id)
      .update({
        star1:
          parseFloat(this.state.rating) == 1
            ? firestore.FieldValue.increment(1)
            : firestore.FieldValue.increment(0),
        star2:
          parseFloat(this.state.rating) == 2
            ? firestore.FieldValue.increment(1)
            : firestore.FieldValue.increment(0),
        star3:
          parseFloat(this.state.rating) == 3
            ? firestore.FieldValue.increment(1)
            : firestore.FieldValue.increment(0),
        star4:
          parseFloat(this.state.rating) == 4
            ? firestore.FieldValue.increment(1)
            : firestore.FieldValue.increment(0),
        star5:
          parseFloat(this.state.rating) == 5
            ? firestore.FieldValue.increment(1)
            : firestore.FieldValue.increment(0),
        NumberofDeliveries: firestore.FieldValue.increment(1),
      })
      .then(docRef => {
        const ref = firestore()
          .collection('orders')
          .doc(this.props.route.params.orders.OrderId);
        ref
          .update({
            rating: parseFloat(this.state.rating),
          })
          .then(docRef => {
            this.setState({isLoading: false}),
              Alert.alert('Rating Successfully', 'Thank you for feedback', [
                {
                  text: 'OK',
                  onPress: () => this.setState({ratingModal: false}),
                },
              ]);
          });
      })
      .catch(err => {
        console.log('err: ', err);
        this.setState({isLoading: false}), Alert.alert('Rating Failed', err);
      });
  }

  StartImageRotationFunction() {
    this.Rotatevalue.setValue(0);
    Animated.timing(this.Rotatevalue, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: true, // Add this line
    }).start(() => this.StartImageRotationFunction());
  }

  CancelOrder() {
    const datasUse = {
      userId: this.state.orders.userId,
      id: this.state.orders.DeliveredBy.id,
      OrderId: this.state.orders.OrderId,
    };
    console.log('datasUse: ', datasUse);
    Alert.alert(
      'Confirmation',
      'are you sure to cancel this transaction?',
      [
        {text: 'cancel', onPress: () => null},

        {
          text: 'OK',
          onPress: () => {
            const datasUse = {
              userId: this.state.orders.userId,
              id: this.state.orders.DeliveredBy.id,
              OrderId: this.state.orders.OrderId,
            };
            console.log('datasUse: ', datasUse);
            const updateSuccess = firestore()
              .collection('users')
              .doc(this.state.orders.userId);
            updateSuccess.update({
              cancelLimitLastDate: moment().format('MMM D, YYYY'),
              cancelCounter:
                this.state.userInfo.cancelCounter == undefined ||
                this.state.userInfo.cancelCounter == ''
                  ? 1
                  : moment().format('MMM D, YYYY') !=
                    this.state.userInfo.cancelLimitLastDate
                  ? 1
                  : firestore.FieldValue.increment(1),

              RiderIDS: firestore.FieldValue.arrayRemove(
                this.state.orders.DeliveredBy.id,
              ),
            });
            const update_RiderTransaction = firestore()
              .collection('riders')
              .doc(this.state.orders.DeliveredBy.id);
            update_RiderTransaction.update({
              TransactionCancelled: firestore.FieldValue.increment(1),
              Transactionprocessing: firestore.FieldValue.increment(-1),
            });

            const ref = firestore()
              .collection('orders')
              .doc(this.state.orders.OrderId);
            ref.update({
              OrderStatus: 'Cancelled',
              rider_id: '',
              DeliveredBy: '',
            });
            this.setState({CancelledModal: false});
            this.props.navigation.goBack();
          },
        },
      ],
      {cancelable: false},
    );
    return;
  }

  PendingOrder() {
    Alert.alert(
      'Confirmation',
      'are you sure to move this transaction to pending?',
      [
        {text: 'cancel', onPress: () => null},

        {
          text: 'OK',
          onPress: () => {
            const updateSuccess = firestore()
              .collection('users')
              .doc(this.state.orders.userId);
            updateSuccess.update({
              RiderIDS: firestore.FieldValue.arrayRemove(
                this.state.orders.DeliveredBy.id,
              ),
            });
            const ref = firestore()
              .collection('orders')
              .doc(this.state.orders.OrderId);
            ref.update({
              OrderStatus: 'Pending',
              rider_id: '',
              DeliveredBy: '',
            });
            this.setState({CancelledModal: false});
            this.props.navigation.goBack();
          },
        },
      ],
      {cancelable: false},
    );
    return;
  }

  render() {
    //console.log('selectedCityUser Homescreen: ',this.state.selectedCityUser)
    //  console.log('UserLocationCountry typeOfRate: ', this.state.UserLocationCountry)
    //  console.log('CountryNow: ', this.state.CountryNow)
    const RotateData = this.Rotatevalue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '368deg'],
    });

    const trans = {
      transform: [{rotate: RotateData}],
    };
    const {
      paymentMethod,
      minimum,
      selectedIndex,
      selectedIndices,
      customStyleIndex,
      slatitude,
      slongitude,
      lat,
      ULat,
      summary,
    } = this.state;

    const copyToClipboard = () => {
      const keys = this.state.ItemList;

      let text = '';
      for (let x of keys) {
        text += '* ' + x + '\n';
      }

      Clipboard.setString(text);
      ToastAndroid.show('Copied to clipboard', ToastAndroid.SHORT);
    };

    const deleteListItem = item => {
      console.log('pressed');
      console.log(item);
      const NewListItem = this.state.ItemList.filter(value => {
        return value.indexOf(item) == -1;
      });
      this.setState({ItemList: NewListItem});
    };

    const NewTotal =
      parseFloat(this.props.route.params.orders.total) +
      parseFloat(this.props.route.params.orders.tip);

    const estTime = this.props.route.params.orders.estTime;
    const TimeConsume = this.state.travelTime / 1000;
    const NewTravelTime =
      TimeConsume + 60 - (estTime + this.state.AdditionalMinMinute * 60);
    //const NewTravelTime = (TimeConsume+60) -estTime;
    const MinuteRate = this.state.AdditionalMinute;
    const minuteValue = NewTravelTime / 60;
    const minuteChargeResult = minuteValue * MinuteRate;
    const MinuteCharge = minuteChargeResult > 0 ? minuteChargeResult : 0;
    console.log('fromTime: ', this.state.travelTime);
    console.log('estTime: ', estTime);
    console.log('TimeConsume: ', TimeConsume);
    console.log('NewTravelTime: ', NewTravelTime);
    console.log('MinuteRate: ', MinuteRate);
    console.log('minuteValue: ', minuteValue);
    console.log('MinuteCharge: ', Math.round((MinuteCharge * 10) / 10));

    return (
      <Box>
        <Box style={{backgroundColor: '#CCCCCC'}}>
        <View>
      <StatusBar bg="#ee4e4e" barStyle="light-content" />
      <Box safeAreaTop bg="#ee4e4e" />
      <HStack bg="#ee4e4e" px="1" py="3" justifyContent="space-between" alignItems="center" w="100%">
        <HStack alignItems="center">
        <Button bg="#ee4e4e"  onPress={() => this.props.navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={25} color="white" />
          </Button>
          <Text style={{color:'white', fontSize:20, fontWeight:'bold'}}>
            ARIBA
          </Text>
        </HStack>
        <HStack>
        <FontAwesome5
                name="clipboard-list"
                size={25}
                color="white"
                onPress={() => this.setState({listModal: true})}
              />
        </HStack>
      </HStack>
      </View>
        
          <Loader loading={this.state.loading} trans={trans} />
          <Loader loading={this.state.isLoading} trans={trans} />
          <Modal
            isVisible={this.state.listModal}
            onBackButtonPress={() => this.setState({listModal: false})}
            useNativeDriver={true}>
            <View
              style={{
                position: 'absolute',
                width: Dimensions.get('window').width,
                height: Dimensions.get('window').height,
                marginLeft: -20,
                backgroundColor: 'white',
              }}>
              {this.state.ItemList.length == 0 ? null : (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginHorizontal: 10,
                    marginTop: 10,
                  }}>
                  <View
                    style={{
                      flex: 3,
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignContent: 'center',
                      backgroundColor: 'grey',
                    }}>
                    <Text style={{textAlign: 'center'}}>Stack</Text>
                  </View>
                </View>
              )}

              {this.state.ItemList.length == 0 ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 10,
                  }}>
                  <Button
                    onPress={() => this.addListBulk()}
                    colorScheme="success"
                    borderRadius="full"
                    
                    style={{
                      alignSelf: 'center',
                      backgroundColor: '#FFFFFF',
                      width: '80%',
                      alignContent: 'center',
                    }}>
                    <Text
                      style={{
                        color: 'lime',
                        width: '100%',
                        textAlign: 'center',
                      }}>
                      Add List
                    </Text>
                  </Button>
                </View>
              ) : (
                <FlatList
                  data={this.state.ItemList}
                  renderItem={({item, index}) => {
                    return (
                      <HStack
                        icon
                        style={{
                          backgroundColor: '#f7f8fa',
                          borderRadius: 10,
                          left: -25,
                        }}>
                        <Box style={{left: 10}}>
                          <Text style={{color: 'black'}}>{index + 1}.</Text>
                        </Box>
                        <Box>
                          <Input value={item.name} />
                        </Box>
                      </HStack>
                    );
                  }}
                  keyExtractor={item => item.id}
                />
              )}
              <Button
                style={{
                  alignSelf: 'center',
                  backgroundColor: '#019fe8',
                  width: '100%',
                  alignContent: 'center',
                }}
                onPress={() => this.setState({listModal: false})}>
                <Text
                  style={{color: 'white', width: '100%', textAlign: 'center'}}>
                  Done
                </Text>
              </Button>
            </View>
          </Modal>
          <Modal
            useNativeDriver={true}
            isVisible={this.state.ratingModal}
            onSwipeComplete={this.close}
            swipeDirection={['up', 'left', 'right', 'down']}
            style={styles.view}
            transparent={true}>
            <View style={[styles.content, {height: SCREEN_HEIGHT / 3}]}>
              <Rating
                showRating
                onFinishRating={this.ratingCompleted}
                startingValue={5}
                style={{paddingVertical: 10}}
              />
              <TouchableOpacity
                onPress={() => this.SubmitRating()}
                style={{
                  borderColor: '#396ba0',
                  borderWidth: 1,
                  borderRadius: 10,
                  backgroundColor: '#396ba0',
                  padding: 10,
                  marginTop: 10,
                }}>
                <Text
                  style={{
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}>
                  SUBMIT
                </Text>
              </TouchableOpacity>
            </View>
          </Modal>

          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: Dimensions.get('window').width,
                height: Dimensions.get('window').height / 1.5,
              }}>
              <MapboxGL.MapView
                style={{
                  flex: 1,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
                attributionEnabled={false}
                logoEnabled={false}>
                <MapboxGL.Camera
                  centerCoordinate={
                    this.state.OrderStatus == 'Processing' &&
                    this.state.RLong != undefined
                      ? [this.state.RLong, this.state.RLat]
                      : [this.state.flong, this.state.flat]
                  }
                  zoomLevel={15}
                  followUserMode={'normal'}
                />

                <MapboxGL.ShapeSource
                  id="shapeSource"
                  shape={this.state.routeForMap}>
                  <MapboxGL.LineLayer
                    id="lineLayer"
                    style={{
                      lineWidth: 5,
                      lineJoin: 'bevel',
                      lineColor: '#ff0000',
                    }}
                  />
                </MapboxGL.ShapeSource>

                <MapboxGL.UserLocation
                  visible={true}
                  showsUserHeadingIndicator={true}
                />
                {console.log('flong: ', [this.state.flong, this.state.flat])}
                {this.state.x != undefined &&
                this.state.flat == this.props.route.params.clat
                  ? console.log('x: ', [
                      this.state.x.longitude,
                      this.state.x.latitude,
                    ])
                  : null}

                {this.state.x == undefined ? null : this.state.x != undefined &&
                  this.state.flat == this.props.route.params.clat ? (
                  <MapboxGL.PointAnnotation
                    coordinate={[this.state.x.longitude, this.state.x.latitude]}
                  />
                ) : (
                  <MapboxGL.PointAnnotation
                    coordinate={[this.state.flong, this.state.flat]}
                  />
                )}
                {console.log('Tolat: ', [this.state.Tolong, this.state.Tolat])}
                {this.state.Tolat == undefined ? null : (
                  <MapboxGL.PointAnnotation
                    coordinate={[this.state.Tolong, this.state.Tolat]}
                  />
                )}
                {console.log('Processing: ', [
                  this.state.RLong,
                  this.state.RLat,
                ])}
                {this.state.OrderStatus == 'Processing' &&
                this.state.RLong != undefined ? (
                  <MapboxGL.PointAnnotation
                    coordinate={[this.state.RLong, this.state.RLat]}
                  />
                ) : null}
              </MapboxGL.MapView>

              <Modal
                isVisible={this.state.visibleModal}
                animationInTiming={1000}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                animationOutTiming={1000}
                useNativeDriver={true}
                onBackdropPress={() => this.setState({visibleModal: false})}
                transparent={true}>
                <View style={style.content}>
                  <View style={{margin: 10}}>
                    <FormControl>
                      <TextArea
                        rowSpan={5}
                        value={this.state.note}
                        bordered
                        placeholder="Your Note Here"
                        onChangeText={text => this.setState({note: text})}
                      />
                    </FormControl>
                  </View>

                  <Button
                    block
                    style={{height: 50, backgroundColor: '#33c37d'}}
                    onPress={() => this.onUpdateNote()}>
                    <Text style={{color: 'white'}}>DONE</Text>
                  </Button>

                  <Button
                    block
                    style={{
                      height: 50,
                      backgroundColor: '#33c37d',
                      marginTop: 10,
                    }}
                    onPress={() => this.setState({visibleModal: false})}>
                    <Text style={{color: 'white'}}>CANCEL</Text>
                  </Button>
                </View>
              </Modal>
            </View>
          </View>
          <View>
            {this.state.OrderStatus == 'Cancelled' ||
            this.state.OrderStatus == 'Delivered' ? (
              <Card
                style={{
                  height:
                    SCREEN_HEIGHT < 767 ? SCREEN_HEIGHT / 3 : SCREEN_HEIGHT / 4,
                    top:SCREEN_HEIGHT/1.7, 
                    padding:10
                }}>
                <HStack style={{marginBottom:10}}>
                  <FontAwesome
                    name={'dot-circle-o'}
                    style={{marginRight: 10}}
                  />
                  <View style={{flexDirection: 'column'}}>
                    <Text
                      style={{
                        fontWeight: 'normal',
                        fontSize: 15,
                        color: 'green',
                      }}>
                      Pickup location{' '}
                    </Text>
                    <Text style={{fontSize: 15}}>{this.state.fromPlace}</Text>
                  </View>
                </HStack>
                <HStack style={{marginBottom:10}}>
                  <FontAwesome
                    name={'dot-circle-o'}
                    style={{marginRight: 10}}
                  />
                  <View style={{flexDirection: 'column'}}>
                    <Text
                      style={{
                        fontWeight: 'normal',
                        fontSize: 15,
                        color: 'blue',
                      }}>
                      Drop-off location
                    </Text>
                    <Text style={{fontSize: 15}}>{this.state.toPlace}</Text>
                  </View>
                </HStack>

                <Text style={{fontSize: 15, marginLeft: 20}}>
                  Reason of Cancellation:
                </Text>

                {this.state.RiderCancel == undefined
                  ? null
                  : this.state.RiderCancel.length > 0
                  ? this.state.RiderCancel.map(item => (
                      <View style={{flexDirection: 'row', marginLeft: 40}}>
                        <FontAwesome
                          name={'dot-circle-o'}
                          style={{marginRight: 10}}
                        />
                        <Text style={{fontSize: 15}}>
                          {item.CancelledReason} by {item.RiderName}
                        </Text>
                      </View>
                    ))
                  : null}
              </Card>
            ) : this.state.OrderStatus == 'Processing' ? (
              <Card
                style={{
                  height:
                    SCREEN_HEIGHT < 767
                      ? SCREEN_HEIGHT / 2
                      : SCREEN_HEIGHT / 2.5,
                      top:SCREEN_HEIGHT/1.9, 
                      padding:10,
                }}>
                <Box>
                  <Modal
                    isVisible={this.state.showURL}
                    animationInTiming={700}
                    animationIn="slideInUp"
                    animationOut="slideOutDown"
                    animationOutTiming={700}
                    useNativeDriver={true}
                    style={{marginLeft: 0}}
                    onBackdropPress={() => this.setState({showURL: false})}
                    transparent={true}>
                    <TouchableWithoutFeedback
                      onPress={() => this.setState({showURL: false})}>
                      <Image
                        style={{
                          width: SCREEN_WIDTH,
                          height: SCREEN_HEIGHT,
                          resizeMode: 'contain',
                        }}
                        source={{uri: this.state.SelectedURL}}
                      />
                    </TouchableWithoutFeedback>
                  </Modal>
                  <Box style={{flexDirection: 'row'}}>
                    <View style={{flexDirection: 'column', marginLeft: 10}}>
                      <TouchableOpacity
                        onPress={() =>
                          this.setState({
                            showURL: true,
                            SelectedURL: this.state.image,
                          })
                        }>
                        <Image
                          style={{
                            width: 100,
                            height: 100,
                            borderRadius: 50,
                            borderWidth: 5,
                            borderColor: 'black',
                            overflow: 'hidden',
                            top: -50,
                          }}
                          source={{uri: this.state.image}}
                        />
                      </TouchableOpacity>
                      {this.state.ratings > 4.5 ? ( //5
                        <View style={{flexDirection: 'row', top: -50}}>
                          <MaterialIcons
                            name="star"
                            size={20}
                            color={'yellow'}
                          />
                          <MaterialIcons
                            name="star"
                            size={20}
                            color={'yellow'}
                          />
                          <MaterialIcons
                            name="star"
                            size={20}
                            color={'yellow'}
                          />
                          <MaterialIcons
                            name="star"
                            size={20}
                            color={'yellow'}
                          />
                          <MaterialIcons
                            name="star"
                            size={20}
                            color={'yellow'}
                          />
                        </View>
                      ) : this.state.ratings > 4.4 && this.state.ratings < 5 ? ( //4.5
                        <View style={{flexDirection: 'row', top: -50}}>
                          <MaterialIcons
                            name="star"
                            size={20}
                            color={'yellow'}
                          />
                          <MaterialIcons
                            name="star"
                            size={20}
                            color={'yellow'}
                          />
                          <MaterialIcons
                            name="star"
                            size={20}
                            color={'yellow'}
                          />
                          <MaterialIcons
                            name="star"
                            size={20}
                            color={'yellow'}
                          />
                          <MaterialIcons
                            name="star-half"
                            size={20}
                            color={'yellow'}
                          />
                        </View>
                      ) : this.state.ratings > 3.9 &&
                        this.state.ratings < 4.5 ? ( //4
                        <View style={{flexDirection: 'row', top: -50}}>
                          <MaterialIcons
                            name="star"
                            size={20}
                            color={'yellow'}
                          />
                          <MaterialIcons
                            name="star"
                            size={20}
                            color={'yellow'}
                          />
                          <MaterialIcons
                            name="star"
                            size={20}
                            color={'yellow'}
                          />
                          <MaterialIcons
                            name="star"
                            size={20}
                            color={'yellow'}
                          />
                          <MaterialIcons
                            name="star-outline"
                            size={20}
                            color={'yellow'}
                          />
                        </View>
                      ) : this.state.ratings > 3.4 && this.state.ratings < 4 ? ( //3.5
                        <View style={{flexDirection: 'row', top: -50}}>
                          <MaterialIcons
                            name="star"
                            size={20}
                            color={'yellow'}
                          />
                          <MaterialIcons
                            name="star"
                            size={20}
                            color={'yellow'}
                          />
                          <MaterialIcons
                            name="star"
                            size={20}
                            color={'yellow'}
                          />
                          <MaterialIcons
                            name="star-half"
                            size={20}
                            color={'yellow'}
                          />
                          <MaterialIcons
                            name="star-outline"
                            size={20}
                            color={'yellow'}
                          />
                        </View>
                      ) : this.state.ratings > 2.9 &&
                        this.state.ratings < 3.5 ? ( //3
                        <View style={{flexDirection: 'row', top: -50}}>
                          <MaterialIcons
                            name="star"
                            size={20}
                            color={'yellow'}
                          />
                          <MaterialIcons
                            name="star"
                            size={20}
                            color={'yellow'}
                          />
                          <MaterialIcons
                            name="star"
                            size={20}
                            color={'yellow'}
                          />
                          <MaterialIcons
                            name="star-outline"
                            size={20}
                            color={'yellow'}
                          />
                          <MaterialIcons
                            name="star-outline"
                            size={20}
                            color={'yellow'}
                          />
                        </View>
                      ) : this.state.ratings > 2.4 && this.state.ratings < 3 ? ( //2.5
                        <View style={{flexDirection: 'row', top: -50}}>
                          <MaterialIcons
                            name="star"
                            size={20}
                            color={'yellow'}
                          />
                          <MaterialIcons
                            name="star"
                            size={20}
                            color={'yellow'}
                          />
                          <MaterialIcons
                            name="star-half"
                            size={20}
                            color={'yellow'}
                          />
                          <MaterialIcons
                            name="star-outline"
                            size={20}
                            color={'yellow'}
                          />
                          <MaterialIcons
                            name="star-outline"
                            size={20}
                            color={'yellow'}
                          />
                        </View>
                      ) : this.state.ratings > 1.9 &&
                        this.state.ratings < 2.5 ? ( //2
                        <View style={{flexDirection: 'row', top: -50}}>
                          <MaterialIcons
                            name="star"
                            size={20}
                            color={'yellow'}
                          />
                          <MaterialIcons
                            name="star"
                            size={20}
                            color={'yellow'}
                          />
                          <MaterialIcons
                            name="star-outline"
                            size={20}
                            color={'yellow'}
                          />
                          <MaterialIcons
                            name="star-outline"
                            size={20}
                            color={'yellow'}
                          />
                          <MaterialIcons
                            name="star-outline"
                            size={20}
                            color={'yellow'}
                          />
                        </View>
                      ) : this.state.ratings > 1.4 && this.state.ratings < 2 ? ( //1.5
                        <View style={{flexDirection: 'row', top: -50}}>
                          <MaterialIcons
                            name="star"
                            size={20}
                            color={'yellow'}
                          />
                          <MaterialIcons
                            name="star-half"
                            size={20}
                            color={'yellow'}
                          />
                          <MaterialIcons
                            name="star-outline"
                            size={20}
                            color={'yellow'}
                          />
                          <MaterialIcons
                            name="star-outline"
                            size={20}
                            color={'yellow'}
                          />
                          <MaterialIcons
                            name="star-outline"
                            size={20}
                            color={'yellow'}
                          />
                        </View>
                      ) : this.state.ratings > 0.9 &&
                        this.state.ratings < 1.5 ? ( //1
                        <View style={{flexDirection: 'row', top: -50}}>
                          <MaterialIcons
                            name="star"
                            size={20}
                            color={'yellow'}
                          />
                          <MaterialIcons
                            name="star-outline"
                            size={20}
                            color={'yellow'}
                          />
                          <MaterialIcons
                            name="star-outline"
                            size={20}
                            color={'yellow'}
                          />
                          <MaterialIcons
                            name="star-outline"
                            size={20}
                            color={'yellow'}
                          />
                          <MaterialIcons
                            name="star-outline"
                            size={20}
                            color={'yellow'}
                          />
                        </View>
                      ) : (
                        <View style={{flexDirection: 'row', top: -50}}>
                          <MaterialIcons
                            name="star-outline"
                            size={20}
                            color={'yellow'}
                          />
                          <MaterialIcons
                            name="star-outline"
                            size={20}
                            color={'yellow'}
                          />
                          <MaterialIcons
                            name="star-outline"
                            size={20}
                            color={'yellow'}
                          />
                          <MaterialIcons
                            name="star-outline"
                            size={20}
                            color={'yellow'}
                          />
                          <MaterialIcons
                            name="star-outline"
                            size={20}
                            color={'yellow'}
                          />
                        </View>
                      )}

                      <Text
                        style={{fontSize: 15, top: -50, textAlign: 'center'}}>
                        {this.state.ratings}{' '}
                      </Text>
                    </View>
                    <View style={{flexDirection: 'column', marginLeft: 10}}>
                      <Text style={{fontSize: 15}}>
                        {this.state.DriverInfo.Name}{' '}
                      </Text>
                      <Text style={{fontSize: 15}}>
                        {this.state.DriverInfo.ColorMotor}{' '}
                        {this.state.DriverInfo.MBrand}{' '}
                        {this.state.DriverInfo.VModel}{' '}
                        {this.state.DriverInfo.ownerRider == true
                          ? null
                          : this.state.DriverInfo.selectedDeliveryApp +
                            ' Rider'}
                      </Text>
                      <Text style={{fontSize: 15}}>
                        Plate Number :
                        <Text style={{fontSize: 15}}>
                          {this.state.DriverInfo.PlateNo}{' '}
                        </Text>
                      </Text>
                    </View>
                  </Box>

                  <Box style={{top: SCREEN_HEIGHT < 767 ? -170 : -180, left: SCREEN_WIDTH/1.7}}>
                    <View
                      style={{
                        backgroundColor: '#396ba0',
                        borderRadius: 10,
                        width: '40%',
                      }}>
                      <Text
                        style={{
                          textAlign: 'center',
                          fontSize: 14,
                          color: 'white',
                        }}>
                        ETA
                      </Text>
                      <Text
                        style={{
                          textAlign: 'center',
                          fontSize: 14,
                          color: 'white',
                        }}>
                        {Math.round(this.state.eta).toString()}mins
                      </Text>
                    </View>
                  </Box>
                </Box>
                <HStack style={{top: -85}}>
                  <FontAwesome
                    name={'dot-circle-o'}
                    style={{marginRight: 10}}
                  />
                  <View style={{flexDirection: 'column'}}>
                    <Text
                      style={{
                        fontWeight: 'normal',
                        fontSize: 15,
                        color: 'green',
                      }}>
                      Pickup location{' '}
                    </Text>
                    <Text style={{fontSize: 15}}>{this.state.fromPlace}</Text>
                  </View>
                </HStack>
                <HStack style={{top: -79}}>
                  <FontAwesome
                    name={'dot-circle-o'}
                    style={{marginRight: 10}}
                  />
                  <View style={{flexDirection: 'column'}}>
                    <Text
                      style={{
                        fontWeight: 'normal',
                        fontSize: 15,
                        color: 'blue',
                      }}>
                      Drop-off location
                    </Text>
                    <Text style={{fontSize: 15}}>{this.state.toPlace}</Text>
                  </View>
                </HStack>

                <Box style={{top: -90, flexDirection: 'column'}}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: 'bold',
                      alignSelf: 'flex-end',
                      marginRight: 10,
                    }}>
                    {this.props.route.params.orders.currency}{' '}
                    {NewTotal + Math.round((MinuteCharge * 10) / 10)}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: 'bold',
                      alignSelf: 'flex-end',
                      marginRight: 10,
                    }}>
                    {this.props.route.params.orders.PaymentMethod}{' '}
                    {Math.round((MinuteCharge * 10) / 10) > 0
                      ? '(' +
                        this.props.route.params.orders.total.toString() +
                        ' +' +
                        Math.round((MinuteCharge * 10) / 10).toString() +
                        ' Add. Time)'
                      : null}
                    {this.props.route.params.orders.tip > 0
                      ? '(' +
                        this.props.route.params.orders.total.toString() +
                        ' +' +
                        this.props.route.params.orders.tip.toString() +
                        ' tip)'
                      : null}
                  </Text>
                  <View style={{flexDirection: 'row'}}>
                    <Box>
                      <TouchableOpacity
                        onPress={() => this.onCall()}
                        style={{
                          flexDirection: 'row',
                          width: '95%',
                          borderRadius: 5,
                          borderWidth: 2,
                          borderColor: '#019fe8',
                          padding: 5,
                          marginRight: 30,
                        }}>
                        <MaterialIcons name="call" size={15} color={'black'} />
                        <Text style={{marginLeft: 10, fontSize: 14}}>
                          Call Rider
                        </Text>
                      </TouchableOpacity>
                    </Box>
                    <Box>
                      <TouchableOpacity
                        onPress={() => this.setState({visibleModal: true})}
                        style={{
                          flexDirection: 'row',
                          width: '100%',
                          borderRadius: 5,
                          borderWidth: 2,
                          borderColor: '#019fe8',
                          padding: 5,
                          marginRight: 0,
                        }}>
                        <MaterialIcons
                          name="event-note"
                          size={20}
                          color={'black'}
                        />
                        <Text style={{marginLeft: 10, fontSize: 14}}>
                          Add Note
                        </Text>
                      </TouchableOpacity>
                    </Box>
                    <Box>
                      <TouchableOpacity
                        onPress={() =>
                          this.setState({visibleAddressModal: true})
                        }
                        style={{
                          flexDirection: 'row',
                          borderRadius: 5,
                          borderWidth: 2,
                          borderColor: '#019fe8',
                          padding: 5,
                          width: SCREEN_WIDTH/4,
                          marginLeft:10
                        }}>
                        <MaterialIcons
                          name="cancel"
                          size={20}
                          color={'black'}
                        />
                        <Text
                          style={{
                            marginLeft: 10,
                            fontSize: 14,
                            textAlign: 'center',
                          }}>
                          Cancel
                        </Text>
                      </TouchableOpacity>
                    </Box>
                  </View>
                </Box>
              </Card>
            ) : (
              <Card
                style={{
                  height:
                    SCREEN_HEIGHT < 767
                      ? SCREEN_HEIGHT / 2.8
                      : SCREEN_HEIGHT / 3.2,
                      top:SCREEN_HEIGHT/1.7, 
                      padding:10
                }}>
                <Box>
                  <ActivityIndicator />
                  <Text>Searching for Rider ... </Text>
                </Box>
                <HStack style={{marginTop: 10, zIndex: 2}}>
                  <FontAwesome
                    name={'dot-circle-o'}
                    style={{marginRight: 10}}
                  />
                  <View style={{flexDirection: 'column'}}>
                    <Text
                      style={{
                        fontWeight: 'normal',
                        fontSize: 15,
                        color: 'green',
                      }}>
                      Pickup location{' '}
                    </Text>
                    <Text style={{fontSize: 15}}>{this.state.fromPlace}</Text>
                  </View>
                </HStack>
                <HStack style={{marginTop: 10}}>
                  <FontAwesome
                    name={'dot-circle-o'}
                    style={{marginRight: 10}}
                  />
                  <View style={{flexDirection: 'column'}}>
                    <Text
                      style={{
                        fontWeight: 'normal',
                        fontSize: 15,
                        color: 'blue',
                      }}>
                      Drop-off location
                    </Text>
                    <Text style={{fontSize: 15}}>{this.state.toPlace}</Text>
                  </View>
                </HStack>

                <HStack justifyContent="space-between" alignItems="center">
                  <Box style={{marginLeft: 20}}>
                    <TouchableOpacity
                      onPress={() => this.setState({visibleAddressModal: true})}
                      style={{
                        flexDirection: 'row',
                        borderRadius: 5,
                        borderWidth: 2,
                        borderColor: '#019fe8',
                        padding: 5,
                        width: SCREEN_WIDTH/4,
                      }}>
                      <MaterialIcons name="cancel" size={20} color={'black'} />
                      <Text
                        style={{
                          marginLeft: 10,
                          fontSize: 14,
                          textAlign: 'center',
                        }}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </Box>
                  <Box>
                    <TouchableOpacity
                      onPress={() => this.setState({visibleModal: true})}
                      style={{
                        flexDirection: 'row',
                        width: '100%',
                        borderRadius: 5,
                        borderWidth: 2,
                        borderColor: '#019fe8',
                        padding: 5,
                        marginRight: 5,
                      }}>
                      <MaterialIcons
                        name="event-note"
                        size={20}
                        color={'black'}
                      />
                      <Text style={{marginLeft: 10, fontSize: 14}}>
                        Add Note
                      </Text>
                    </TouchableOpacity>
                  </Box>
                  <Box>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        alignSelf: 'flex-end',
                        marginRight: 10,
                      }}>
                      {this.props.route.params.orders.currency}{' '}
                      {NewTotal + Math.round((MinuteCharge * 10) / 10)}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: 'bold',
                        alignSelf: 'flex-end',
                        marginRight: 10,
                      }}>
                      {this.props.route.params.orders.PaymentMethod}{' '}
                      {Math.round((MinuteCharge * 10) / 10) > 0
                        ? '(' +
                          this.props.route.params.orders.total.toString() +
                          ' +' +
                          Math.round((MinuteCharge * 10) / 10).toString() +
                          ' Add. Time)'
                        : null}
                      {this.props.route.params.orders.tip > 0
                        ? '(' +
                          this.props.route.params.orders.total.toString() +
                          ' +' +
                          this.props.route.params.orders.tip.toString() +
                          ' tip)'
                        : null}
                    </Text>
                  </Box>
                </HStack>
              </Card>
            )}
          </View>
          <Modal
            useNativeDriver={true}
            isVisible={this.state.visibleAddressModal}
            onSwipeComplete={this.close}
            swipeDirection={['up', 'left', 'right', 'down']}
            style={styles.view}
            onBackdropPress={() => this.setState({visibleAddressModal: false})}
            transparent={true}>
            <View style={[styles.content, {height: SCREEN_HEIGHT / 2}]}>
              <View>
                <Text> Reason of Cancellation </Text>

                <DropDownPicker
                  items={[
                    {label: 'I change my mind.', value: 'I change my mind.'},
                    {
                      label: 'I want to change location.',
                      value: 'I want to change location.',
                    },
                    {label: 'Duplicate Booking.', value: 'Duplicate Booking.'},
                    {label: 'Others.', value: 'Others.'},
                  ]}
                  defaultValue={this.state.reasonofCancel}
                  placeholder={'Reason of Cancellation'}
                  containerStyle={{height: 46}}
                  labelStyle={{
                    fontSize: 18,
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: '#b0dcf5',
                    borderColor: '#396ba0',
                  }}
                  showArrow={true}
                  style={{backgroundColor: '#396ba0', borderColor: '#396ba0'}}
                  itemStyle={{
                    justifyContent: 'center',
                  }}
                  dropDownStyle={{backgroundColor: '#ffffff'}}
                  onChangeItem={item => this.changeNow(item.value)}
                />

                {this.state.reasonofCancel == 'Others.' ? (
                  <View>
                    <Text> Specify your Reason</Text>
                    <Stack regular>
                      <Input
                        value={this.state.otherreasonofcancel}
                        onChangeText={item =>
                          this.setState({otherreasonofcancel: item})
                        }
                      />
                    </Stack>
                  </View>
                ) : null}
                <TouchableOpacity
                  onPress={() => this.cancelNow()}
                  style={{
                    borderColor: '#396ba0',
                    borderWidth: 1,
                    borderRadius: 10,
                    backgroundColor: '#396ba0',
                    padding: 10,
                    marginTop: 10,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      fontWeight: 'bold',
                      textAlign: 'center',
                    }}>
                    SUBMIT
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <Modal
            useNativeDriver={true}
            isVisible={this.state.CancelledModal}
            onSwipeComplete={this.close}
            swipeDirection={['up', 'left', 'right', 'down']}
            style={styles.view}
            transparent={true}>
            <View style={[styles.content, {height: SCREEN_HEIGHT / 3}]}>
              <Text
                style={{textAlign: 'center', fontSize: 16, fontWeight: 'bold'}}>
                Cancelled By {this.state.CancelledBy}
              </Text>
              <Text style={{textAlign: 'left'}}>Reasons: </Text>

              {this.state.RiderCancel == undefined
                ? null
                : this.state.RiderCancel.length > 0
                ? this.state.RiderCancel.map((info, index) => {
                    return (
                      <View
                        style={{
                          flexDirection: 'row',
                          paddingLeft: 30,
                          paddingBottom: 10,
                        }}
                        key={index}>
                        <Text>
                          {info.RiderName}- {info.CancelledReason}
                        </Text>
                      </View>
                    );
                  })
                : null}
              <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                <TouchableOpacity
                  onPress={() => this.PendingOrder()}
                  style={{
                    borderColor: '#396ba0',
                    borderWidth: 1,
                    borderRadius: 10,
                    backgroundColor: '#396ba0',
                    padding: 10,
                    marginTop: 10,
                    justifyContent: 'center',
                    alignSelf: 'center',
                    width: SCREEN_WIDTH / 3,
                    marginRight: 10,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      fontSize: 15,
                    }}>
                    Pending
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => this.CancelOrder()}
                  style={{
                    borderColor: '#396ba0',
                    borderWidth: 1,
                    borderRadius: 10,
                    backgroundColor: '#396ba0',
                    padding: 10,
                    marginTop: 10,
                    justifyContent: 'center',
                    alignSelf: 'center',
                    width: SCREEN_WIDTH / 3,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      fontSize: 15,
                    }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </Box>
      </Box>
    );
  }
  onUpdateNote() {
    const ref = firestore()
      .collection('orders')
      .doc(this.props.route.params.orders.OrderId);
    ref.update({
      Note: this.state.note,
    });
    this.setState({visibleModal: false});
  }
  cancelNow() {
    if (this.state.otherreasonofcancel == '') {
      Alert.alert('Declare a Reason', 'Complete the details to proceed.');
      return;
    }
    Alert.alert(
      'Proceed to Cancel?',
      'Are you sure you want to cancel?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('cancel'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            if (this.props.route.params.orders.OrderStatus != 'Pending') {
              const update_StoreTransaction = firestore()
                .collection('riders')
                .doc(this.props.route.params.orders.DeliveredBy.id);
              update_StoreTransaction.update({
                userTransactionCancelled: firestore.FieldValue.increment(1),
                TransactionCancelled: firestore.FieldValue.increment(1),
                Transactionprocessing:
                  this.props.route.params.orders.OrderStatus == 'Processing'
                    ? firestore.FieldValue.increment(-1)
                    : firestore.FieldValue.increment(0),
                TransactionPending:
                  this.props.route.params.orders.OrderStatus == 'Pending'
                    ? firestore.FieldValue.increment(-1)
                    : firestore.FieldValue.increment(0),
              });
            }
            var newUserRefGetGoins = firestore()
              .collection('users')
              .doc(auth().currentUser.uid);
            newUserRefGetGoins.update({
              cancelLimitLastDate: moment().format('MMM D, YYYY'),
              cancelCounter:
                this.state.userInfo.cancelCounter == undefined ||
                this.state.userInfo.cancelCounter == ''
                  ? 1
                  : moment().format('MMM D, YYYY') !=
                    this.state.userInfo.cancelLimitLastDate
                  ? 1
                  : firestore.FieldValue.increment(1),
            });
            const ref = firestore()
              .collection('orders')
              .doc(this.props.route.params.orders.OrderId);
            ref.update({
              OrderStatus: 'Cancelled',
              rider_id: '',
              DeliveredBy: '',
              RiderCancel: firestore.FieldValue.arrayUnion({
                RiderId: 'User',
                RiderName: 'User',
                TimeCancelled: moment().unix(),
                CancelledReason: this.state.otherreasonofcancel,
              }),
            });
            this.props.navigation.goBack();
          },
        },
      ],
      {cancelable: false},
    );
  }
  changeNow(valuelabel) {
    this.setState({
      reasonofCancel: valuelabel,
      otherreasonofcancel: valuelabel,
    });
  }
  onCall() {
    Alert.alert(
      'Proceed to Call?',
      'Are you sure you want to proceed?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('cancel'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () =>
            RNImmediatePhoneCall.immediatePhoneCall(
              this.state.DriverInfo.Mobile,
            ),
        },
      ],
      {cancelable: false},
    );
  }
  async checkOut() {
    SendSMS.send(
      {
        body: '',
        recipients: [this.state.DriverInfo.Mobile],
        successTypes: ['sent', 'queued'],
        allowAndroidSendWithoutReadPermission: true,
      },
      (completed, cancelled, error) => {
        console.log(
          'SMS Callback: completed: ' +
            completed +
            ' cancelled: ' +
            cancelled +
            'error: ' +
            error,
        );
      },
    );
  }
}

const styles = {
  line: {
    width: '100%',
    height: 1,
    backgroundColor: '#bdc3c7',
    marginBottom: 10,
    marginTop: 10,
  },
  view: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  invoice: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.2,
    borderBottomColor: '#ffffff',
    borderTopColor: '#ffffff',
  },
  centerElement: {justifyContent: 'center', alignItems: 'center'},
  content: {
    backgroundColor: 'white',
    padding: 22,
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
};

const style = StyleSheet.create({
  wrapper: {
    // marginBottom: -80,
    backgroundColor: 'white',
    height: 80,
    width: '100%',
    padding: 10,
  },
  notificationContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  sssage: {
    marginBottom: 2,
    fontSize: 14,
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  content: {
    backgroundColor: 'white',
    padding: 22,
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});
