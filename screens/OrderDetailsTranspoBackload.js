import React, {Component} from 'react';
import {
  AppState,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Alert,
  Image,
  FlatList,
  SafeAreaView,
  ScrollView,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import {
  View,
  Button,
  Stack,
  Input,
  VStack,
  Text,
  Box,
  StatusBar,
  HStack,
} from 'native-base';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
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
import {FlatGrid} from 'react-native-super-grid';
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

export default class OrderDetailsTranspoBackload extends Component {
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
      .collection('charges')
      .where('status', '==', 'on process');
    const cart = this.props.route.params.orders;
    this.state = {
      appState: AppState.currentState,
      OrderStatus: cart.OrderStatus,
      adminname: cart.adminname,
      DeliveredBy: cart.DeliveredBy.Name,
      cart: cart,
      VisibleAddInfo: false,
      cLong: cart.flat,
      cLat: cart.flong,
      driver_charge: 0,
      xtra: 0,
      labor: 0,
      deliveryCharge: 0,
      pickup: 0,
      stores: [],
      paymentMethod: 'Cash on Delivery (COD)',
      billing_name: cart.Billing.name,
      billing_street: cart.Billing.address,
      billing_province: cart.Billing.province,
      billing_city: cart.Billing.billing_city,
      billing_barangay: cart.Billing.barangay,
      billing_cluster: cart.city,
      billing_nameTo: cart.billing_nameTo,
      billing_postalTo: cart.billing_postalTo,
      billing_phoneTo: cart.billing_phoneTo,
      billing_streetTo: cart.billing_streetTo,
      billing_countryTo: cart.billing_countryTo,
      billing_provinceTo: cart.billing_provinceTo,
      billing_cityTo: cart.billing_cityTo,
      billing_barangayTo: cart.billing_barangayTo,
      billing_clusterTo: cart.billing_clusterTo,
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
      note: '',
      vouchers: [],
      discount: 0,
      voucherArray: [],
      charge: 0,
      xtraCharge: 0,
      voucherCode: '',
      loading: false,
      address_list: [],
      visibleAddressModal: false,
      //subtotal: subtotal,
      minimum: 0,
      selectedIndex: 0,
      selectedIndices: [0],
      customStyleIndex: 0,
      isready: 0,
      visibleAddressModalTo: false,
      passenger: cart.passengers,
      note: cart.Note,
      AlwaysOpen: cart.needAsap,
      succeding: cart.succeding,
      amount_base: cart.amount_base,
      base_dist: cart.base_dist,
      Tolat: cart.Tolat,
      Tolong: cart.Tolong,
      showURL: false,
      ModalHelp: false,
      travelTime: cart.travelTime,
      MinuteRate: cart.MinuteRate,
      estTime: cart.estTime,
      CancelledModal: false,
      CancelledBy: '',
      RiderCancel: [],
      userInfo: null,
    };
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
    firestore()
      .collection('orders')
      .where('OrderId', '==', this.props.route.params.orders.OrderId)
      .onSnapshot(querySnapshot => {
        querySnapshot.forEach(doc => {
          console.log('travelTime: ', doc.data().travelTime);
          this.setState({
            cart: doc.data(),
            estTime: doc.data().estTime,
            MinuteRate: doc.data().MinuteRate,
            travelTime: doc.data().travelTime,
            isCancelled: doc.data().isCancelled,
            CancelledBy:
              doc.data().CancelledBy == undefined ? '' : doc.data().CancelledBy,
            RiderCancel: doc.data().RiderCancel,
          });

          if (doc.data().OrderStatus == 'For Cancel') {
            this.setState({CancelledModal: true});
          }
        });
      });

    const getData = firestore()
      .collection('charges')
      .doc(this.props.route.params.orders.adminID);
    const doc = await getData.get();
    if (!doc.exists) {
      console.log('No such document!');
    } else {
      console.log('Document data:', doc.data());
      this.setState({
        Telephone_Help: doc.data().Telephone_Help,
        email_help: doc.data().email_help,
        fb_Help: doc.data().fb_Help,
        mobile_help: doc.data().mobile_help,
      });
    }
  }
  componentWillUnmount() {
    this.appStateSubscription.remove();
  }

  footer = () => {
    return (
      <View>
        <Button
          block
          style={{alignSelf: 'center', backgroundColor: 'salmon'}}
          onPress={() => this.navigateAddress()}>
          <Text style={{color: 'white'}}>Add Address</Text>
        </Button>
      </View>
    );
  };
  ReasonOfCancel() {
    if (this.props.route.params.orders.OrderStatus != 'Pending') {
      const update_StoreTransaction = firestore()
        .collection('stores')
        .doc(this.props.route.params.orders.RentStoreId);
      update_StoreTransaction.update({
        0: firestore.FieldValue.increment(1),
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
        RiderId: '',
        RiderName: 'User',
        TimeCancelled: moment().unix(),
        CancelledReason: 'Cancelled By User',
      }),
    });
    this.props.navigation.goBack();
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
      userId: this.state.cart.userId,
      id: this.state.cart.DeliveredBy.id,
      OrderId: this.state.cart.OrderId,
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
            const updateSuccess = firestore()
              .collection('users')
              .doc(this.state.cart.userId);
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
                this.state.cart.DeliveredBy.id,
              ),
            });
            const update_RiderTransaction = firestore()
              .collection('riders')
              .doc(this.state.cart.DeliveredBy.id);
            update_RiderTransaction.update({
              TransactionCancelled: firestore.FieldValue.increment(1),
              Transactionprocessing: firestore.FieldValue.increment(-1),
            });
            const ref = firestore()
              .collection('orders')
              .doc(this.state.cart.OrderId);
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
              .doc(this.state.cart.userId);
            updateSuccess.update({
              RiderIDS: firestore.FieldValue.arrayRemove(
                this.state.cart.DeliveredBy.id,
              ),
            });
            const ref = firestore()
              .collection('orders')
              .doc(this.state.cart.OrderId);
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

    let distance = this.state.cart.distance / 1000;
    let newDistance = distance - this.state.base_dist;
    let distanceAmount = newDistance * this.state.succeding;

    let from_lat = this.state.cLat;
    let from_long = this.state.cLong;
    let to_lat = this.state.Tolat;
    let to_long = this.state.Tolong;

    const estTime = this.state.estTime;
    const TimeConsume = (this.state.travelTime + 59900) / 1000;
    const NewTravelTime = TimeConsume - estTime;
    const MinuteRate = this.state.MinuteRate;
    const minuteValue = NewTravelTime / 60;
    const MinuteCharge = minuteValue * MinuteRate;
    console.log('estTime: ', estTime);
    console.log('TimeConsume: ', TimeConsume);
    console.log('NewTravelTime: ', NewTravelTime);
    console.log('MinuteRate: ', MinuteRate);
    console.log('minuteValue: ', minuteValue);
    console.log('MinuteCharge: ', MinuteCharge);
    console.log('distanceAmount: ', distanceAmount);
    console.log('amount_base: ', this.state.amount_base);
    console.log(
      'tip: ',
      Math.round((this.props.route.params.orders.tip * 10) / 10),
    );
    console.log(
      'total: ',
      Math.round((this.props.route.params.orders.total * 10) / 10),
    );

    const MinuteChargePayable = MinuteCharge > 0 ? MinuteCharge : 0;
    const NewTotalPayable =
      MinuteChargePayable +
      Math.round((this.props.route.params.orders.total * 10) / 10) +
      Math.round((this.props.route.params.orders.tip * 10) / 10);
    console.log('MinuteChargePayable: ', MinuteChargePayable);
    console.log('NewTotalPayable: ', NewTotalPayable);
    let amountpay =
      MinuteCharge > 0
        ? MinuteCharge +
          Math.round((this.props.route.params.orders.total * 10) / 10)
        : Math.round((this.props.route.params.orders.total * 10) / 10);
    console.log('amountpay: ', amountpay);
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
          Trans. No: #00{this.props.route.params.orders.OrderNo}
          </Text>
        </HStack>
        <HStack>
        <Button
                bg="#ee4e4e"
                onPress={() => this.setState({ModalHelp: true})} >
                <MaterialIcons name="help-outline" size={25} color="white" />
              </Button>
              {this.props.route.params.orders.OrderStatus == 'Pending' ? (
                <Button
                bg="#ee4e4e"
                  onPress={() =>
                    Alert.alert(
                      'Are you Sure to Cancel?',
                      'You cannot undo this process',
                      [
                        {
                          text: 'Cancel',
                          onPress: () => console.log('Cancel Pressed'),
                          style: 'cancel',
                        },
                        {text: 'OK', onPress: () => this.ReasonOfCancel()},
                      ],
                    )
                  }>
                  <MaterialIcons name="cancel" size={25} color="white" />
                </Button>
              ) : null}
        </HStack>
      </HStack>
      </View>
          
          <Loader loading={this.state.loading} trans={trans} />

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
                zoomEnabled={true}
                scrollEnabled={true}
                pitchEnabled={true}
                style={{
                  position: 'absolute',
                  flex: 1,
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
                attributionEnabled={false}
                logoEnabled={false}>
                <MapboxGL.Camera
                  centerCoordinate={[
                    this.props.route.params.orders.flong,
                    this.props.route.params.orders.flat,
                  ]}
                  zoomLevel={15}
                />

                <MapboxGL.UserLocation
                  visible={true}
                  showsUserHeadingIndicator={true}
                />
                <MapboxGL.PointAnnotation
                  coordinate={[
                    this.props.route.params.orders.flong,
                    this.props.route.params.orders.flat,
                  ]}
                />
                <MapboxGL.PointAnnotation
                  coordinate={[
                    this.props.route.params.orders.Tolong,
                    this.props.route.params.orders.Tolat,
                  ]}
                />
              </MapboxGL.MapView>
            </View>
          </View>
          <View  style={{top:SCREEN_HEIGHT/2.3}}>
            <Card
              style={{
                height:
                  SCREEN_HEIGHT < 767 ? SCREEN_HEIGHT / 2 : SCREEN_HEIGHT / 2.2,
                  padding:10
              }}>
              <Box>
                <Box style={{flexDirection: 'row'}}>
                  <View style={{flexDirection: 'column', marginLeft: 0}}>
                    <TouchableOpacity
                      onPress={() =>
                        this.setState({
                          showURL: true,
                          SelectedURL: this.state.cart.DeliveredBy.image,
                        })
                      }>
                      <Image
                        style={{
                          width: SCREEN_HEIGHT < 767 ? 80 : 100,
                          height: SCREEN_HEIGHT < 767 ? 80 : 100,
                          borderRadius: 50,
                          borderWidth: 5,
                          borderColor: '#396ba0',
                          overflow: 'hidden',
                          top: -50,
                        }}
                        source={{uri: this.state.cart.DeliveredBy.image}}
                      />
                    </TouchableOpacity>
                    {this.state.cart.DeliveredBy.rating > 4.5 ? ( //5
                      <View style={{flexDirection: 'row', top: -50}}>
                        <MaterialIcons
                          name="star"
                          size={20}
                          color={'#FFD700'}
                        />
                        <MaterialIcons
                          name="star"
                          size={20}
                          color={'#FFD700'}
                        />
                        <MaterialIcons
                          name="star"
                          size={20}
                          color={'#FFD700'}
                        />
                        <MaterialIcons
                          name="star"
                          size={20}
                          color={'#FFD700'}
                        />
                        <MaterialIcons
                          name="star"
                          size={20}
                          color={'#FFD700'}
                        />
                      </View>
                    ) : this.state.cart.DeliveredBy.rating > 4.4 &&
                      this.state.cart.DeliveredBy.rating < 5 ? ( //4.5
                      <View style={{flexDirection: 'row', top: -50}}>
                        <MaterialIcons
                          name="star"
                          size={20}
                          color={'#FFD700'}
                        />
                        <MaterialIcons
                          name="star"
                          size={20}
                          color={'#FFD700'}
                        />
                        <MaterialIcons
                          name="star"
                          size={20}
                          color={'#FFD700'}
                        />
                        <MaterialIcons
                          name="star"
                          size={20}
                          color={'#FFD700'}
                        />
                        <MaterialIcons
                          name="star-half"
                          size={20}
                          color={'#FFD700'}
                        />
                      </View>
                    ) : this.state.cart.DeliveredBy.rating > 3.9 &&
                      this.state.cart.DeliveredBy.rating < 4.5 ? ( //4
                      <View style={{flexDirection: 'row', top: -50}}>
                        <MaterialIcons
                          name="star"
                          size={20}
                          color={'#FFD700'}
                        />
                        <MaterialIcons
                          name="star"
                          size={20}
                          color={'#FFD700'}
                        />
                        <MaterialIcons
                          name="star"
                          size={20}
                          color={'#FFD700'}
                        />
                        <MaterialIcons
                          name="star"
                          size={20}
                          color={'#FFD700'}
                        />
                        <MaterialIcons
                          name="star-outline"
                          size={20}
                          color={'#FFD700'}
                        />
                      </View>
                    ) : this.state.cart.DeliveredBy.rating > 3.4 &&
                      this.state.cart.DeliveredBy.rating < 4 ? ( //3.5
                      <View style={{flexDirection: 'row', top: -50}}>
                        <MaterialIcons
                          name="star"
                          size={20}
                          color={'#FFD700'}
                        />
                        <MaterialIcons
                          name="star"
                          size={20}
                          color={'#FFD700'}
                        />
                        <MaterialIcons
                          name="star"
                          size={20}
                          color={'#FFD700'}
                        />
                        <MaterialIcons
                          name="star-half"
                          size={20}
                          color={'#FFD700'}
                        />
                        <MaterialIcons
                          name="star-outline"
                          size={20}
                          color={'#FFD700'}
                        />
                      </View>
                    ) : this.state.cart.DeliveredBy.rating > 2.9 &&
                      this.state.cart.DeliveredBy.rating < 3.5 ? ( //3
                      <View style={{flexDirection: 'row', top: -50}}>
                        <MaterialIcons
                          name="star"
                          size={20}
                          color={'#FFD700'}
                        />
                        <MaterialIcons
                          name="star"
                          size={20}
                          color={'#FFD700'}
                        />
                        <MaterialIcons
                          name="star"
                          size={20}
                          color={'#FFD700'}
                        />
                        <MaterialIcons
                          name="star-outline"
                          size={20}
                          color={'#FFD700'}
                        />
                        <MaterialIcons
                          name="star-outline"
                          size={20}
                          color={'#FFD700'}
                        />
                      </View>
                    ) : this.state.cart.DeliveredBy.rating > 2.4 &&
                      this.state.cart.DeliveredBy.rating < 3 ? ( //2.5
                      <View style={{flexDirection: 'row', top: -50}}>
                        <MaterialIcons
                          name="star"
                          size={20}
                          color={'#FFD700'}
                        />
                        <MaterialIcons
                          name="star"
                          size={20}
                          color={'#FFD700'}
                        />
                        <MaterialIcons
                          name="star-half"
                          size={20}
                          color={'#FFD700'}
                        />
                        <MaterialIcons
                          name="star-outline"
                          size={20}
                          color={'#FFD700'}
                        />
                        <MaterialIcons
                          name="star-outline"
                          size={20}
                          color={'#FFD700'}
                        />
                      </View>
                    ) : this.state.cart.DeliveredBy.rating > 1.9 &&
                      this.state.cart.DeliveredBy.rating < 2.5 ? ( //2
                      <View style={{flexDirection: 'row', top: -50}}>
                        <MaterialIcons
                          name="star"
                          size={20}
                          color={'#FFD700'}
                        />
                        <MaterialIcons
                          name="star"
                          size={20}
                          color={'#FFD700'}
                        />
                        <MaterialIcons
                          name="star-outline"
                          size={20}
                          color={'#FFD700'}
                        />
                        <MaterialIcons
                          name="star-outline"
                          size={20}
                          color={'#FFD700'}
                        />
                        <MaterialIcons
                          name="star-outline"
                          size={20}
                          color={'#FFD700'}
                        />
                      </View>
                    ) : this.state.cart.DeliveredBy.rating > 1.4 &&
                      this.state.cart.DeliveredBy.rating < 2 ? ( //1.5
                      <View style={{flexDirection: 'row', top: -50}}>
                        <MaterialIcons
                          name="star"
                          size={20}
                          color={'#FFD700'}
                        />
                        <MaterialIcons
                          name="star-half"
                          size={20}
                          color={'#FFD700'}
                        />
                        <MaterialIcons
                          name="star-outline"
                          size={20}
                          color={'#FFD700'}
                        />
                        <MaterialIcons
                          name="star-outline"
                          size={20}
                          color={'#FFD700'}
                        />
                        <MaterialIcons
                          name="star-outline"
                          size={20}
                          color={'#FFD700'}
                        />
                      </View>
                    ) : this.state.cart.DeliveredBy.rating > 0.9 &&
                      this.state.cart.DeliveredBy.rating < 1.5 ? ( //1
                      <View style={{flexDirection: 'row', top: -50}}>
                        <MaterialIcons
                          name="star"
                          size={20}
                          color={'#FFD700'}
                        />
                        <MaterialIcons
                          name="star-outline"
                          size={20}
                          color={'#FFD700'}
                        />
                        <MaterialIcons
                          name="star-outline"
                          size={20}
                          color={'#FFD700'}
                        />
                        <MaterialIcons
                          name="star-outline"
                          size={20}
                          color={'#FFD700'}
                        />
                        <MaterialIcons
                          name="star-outline"
                          size={20}
                          color={'#FFD700'}
                        />
                      </View>
                    ) : (
                      <View style={{flexDirection: 'row', top: -50}}>
                        <MaterialIcons
                          name="star-outline"
                          size={20}
                          color={'#FFD700'}
                        />
                        <MaterialIcons
                          name="star-outline"
                          size={20}
                          color={'#FFD700'}
                        />
                        <MaterialIcons
                          name="star-outline"
                          size={20}
                          color={'#FFD700'}
                        />
                        <MaterialIcons
                          name="star-outline"
                          size={20}
                          color={'#FFD700'}
                        />
                        <MaterialIcons
                          name="star-outline"
                          size={20}
                          color={'#FFD700'}
                        />
                      </View>
                    )}
                    <Text style={{fontSize: 12, top: -50, textAlign: 'center'}}>
                      {this.state.cart.DeliveredBy.rating}{' '}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'column',
                      marginLeft: SCREEN_HEIGHT < 767 ? 0 : 10,
                    }}>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        fontSize: SCREEN_HEIGHT < 767 ? 12 : 15,
                      }}>
                      Accepted By :
                      <Text style={{fontSize: SCREEN_HEIGHT < 767 ? 12 : 15}}>
                        {this.state.DeliveredBy} ({this.state.cart.AdminName})
                      </Text>
                    </Text>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        fontSize: SCREEN_HEIGHT < 767 ? 10 : 12,
                        numberOfLines: 2,
                      }}>
                      Vehicle:{' '}
                      <Text style={{fontSize: 12}}>
                        {this.state.cart.vehicle}{' '}
                        {this.state.cart.DeliveredBy.ColorMotor}{' '}
                        {this.state.cart.DeliveredBy.MBrand}{' '}
                        {this.state.cart.DeliveredBy.VModel}{' '}
                        {this.state.cart.DeliveredBy.plateNo}{' '}
                        {this.state.cart.vehicle == 'Motorcycle'
                          ? this.state.cart.DeliveredBy.helmet +
                            ' Helmet ' +
                            this.state.cart.DeliveredBy.helmetNo
                          : null}
                      </Text>{' '}
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
                        fontSize: 13,
                        color: 'white',
                      }}>
                      ETA
                    </Text>
                    <Text
                      style={{
                        textAlign: 'center',
                        fontSize: 18,
                        color: 'white',
                      }}>
                      {this.state.cart.distance === undefined
                        ? null
                        : Math.round(
                            this.props.route.params.orders.estTime / 60,
                          ).toString()}{' '}
                      mins
                    </Text>
                  </View>
                </Box>
              </Box>
              <TouchableOpacity
                style={{top: -75, flexDirection: 'row', marginLeft: 10}}
                onPress={() => {
                  this.props.route.params.orders.OrderStatus == 'Cancelled'
                    ? null
                    : this.setState({VisibleAddInfo: true});
                }}>
                <FontAwesome name={'dot-circle-o'} style={{marginRight: 10}} />
                <View style={{flexDirection: 'column', width: '95%'}}>
                  <Text
                    style={{
                      fontWeight: 'normal',
                      fontSize: SCREEN_HEIGHT < 767 ? 12 : 14,
                      color: 'green',
                    }}>
                    Pickup location{' '}
                  </Text>
                  <Text style={{fontSize: SCREEN_HEIGHT < 767 ? 12 : 14}}>
                    {this.state.billing_street}, {this.state.billing_barangay},{' '}
                    {this.state.billing_city}, {this.state.billing_province},{' '}
                    {this.state.billing_postal}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={{top: -75, flexDirection: 'row', marginLeft: 10}}
                onPress={() => {
                  this.props.route.params.orders.OrderStatus == 'Cancelled'
                    ? null
                    : this.setState({VisibleAddInfo: true});
                }}>
                <FontAwesome name={'dot-circle-o'} style={{marginRight: 10}} />
                <View style={{flexDirection: 'column'}}>
                  <Text
                    style={{
                      fontWeight: 'normal',
                      fontSize: SCREEN_HEIGHT < 767 ? 12 : 14,
                      color: 'blue',
                    }}>
                    Drop-off location
                  </Text>
                  <Text style={{fontSize: SCREEN_HEIGHT < 767 ? 12 : 14}}>
                    {this.state.billing_streetTo},{' '}
                    {this.state.billing_barangayTo}, {this.state.billing_cityTo}
                    , {this.state.billing_provinceTo},{' '}
                    {this.state.billing_postalTo}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={{top: -70, flexDirection: 'column', marginLeft: 10}}
                onPress={() => {
                  this.props.route.params.orders.OrderStatus == 'Cancelled'
                    ? null
                    : this.setState({visibleAddressModalTo: true});
                }}>
                <View style={{flexDirection: 'row'}}>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      fontSize: SCREEN_HEIGHT < 767 ? 12 : 14,
                    }}>
                    Receiver Name:{' '}
                  </Text>
                  <Text style={{fontSize: SCREEN_HEIGHT < 767 ? 12 : 14}}>
                    {this.state.cart.Rname}{' '}
                  </Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      fontSize: SCREEN_HEIGHT < 767 ? 12 : 14,
                    }}>
                    Receiver Phone:{' '}
                  </Text>
                  <Text style={{fontSize: SCREEN_HEIGHT < 767 ? 12 : 14}}>
                    {this.state.cart.billing_phoneTo}{' '}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={{top: -70, flexDirection: 'row', marginLeft: 10}}
                onPress={() => {
                  this.props.route.params.orders.OrderStatus == 'Cancelled'
                    ? null
                    : this.setState({visibleAddressModalTo: true});
                }}>
                <View style={{flexDirection: 'row'}}>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      fontSize: SCREEN_HEIGHT < 767 ? 12 : 14,
                    }}>
                    Tip:{' '}
                    <Text style={{fontSize: 14}}>
                      {parseFloat(this.state.cart.tip)
                        .toFixed(2)
                        .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                    </Text>
                  </Text>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      fontSize: SCREEN_HEIGHT < 767 ? 12 : 14,
                      paddingLeft: SCREEN_WIDTH / 4,
                    }}>
                    Pickup Time:{' '}
                    <Text style={{fontSize: SCREEN_HEIGHT < 767 ? 12 : 14}}>
                      {this.state.cart.needAsap === true
                        ? 'ASAP'
                        : moment(this.state.cart.pickupTime * 1000).format(
                            'MMM D, YYYY h:mm a',
                          )}
                    </Text>
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={{top: -70, flexDirection: 'row', marginLeft: 10}}
                onPress={() => {
                  this.props.route.params.orders.OrderStatus == 'Cancelled'
                    ? null
                    : this.setState({visibleAddressModalTo: true});
                }}>
                <View style={{flexDirection: 'row'}}>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      fontSize: SCREEN_HEIGHT < 767 ? 12 : 14,
                      width: '25%',
                    }}>
                    Package:{' '}
                  </Text>
                  <Text
                    style={{
                      fontSize: SCREEN_HEIGHT < 767 ? 12 : 14,
                      width: '65%',
                    }}>
                    {this.state.cart.PassengerDescription}
                  </Text>
                </View>

                {this.state.cart.distance === undefined ? null : (
                  <View
                    style={{
                      flexDirection: 'column',
                      position: 'absolute',
                      right: 0,
                      top: 20,
                    }}>
                    {this.state.cart.RushHour == true ? (
                      <Text
                        style={{
                          fontSize: SCREEN_HEIGHT < 767 ? 18 : 20,
                          fontWeight: 'bold',
                          marginRight: 20,
                        }}>
                        {this.state.cart.distance === undefined
                          ? null
                          : distanceAmount <= 1
                          ? this.props.route.params.orders.currency +
                            ' ' +
                            (
                              Math.round(
                                (this.props.route.params.orders.tip * 10) / 10,
                              ) +
                              this.state.amount_base +
                              MinuteChargePayable
                            )
                              .toFixed(2)
                              .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
                          : this.props.route.params.orders.currency +
                            ' ' +
                            NewTotalPayable.toFixed(2)
                              .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
                              .toString()}
                      </Text>
                    ) : (
                      <Text
                        style={{
                          fontSize: SCREEN_HEIGHT < 767 ? 18 : 20,
                          fontWeight: 'bold',
                          marginRight: 20,
                        }}>
                        {this.state.cart.distance === undefined
                          ? null
                          : distanceAmount <= 1
                          ? this.props.route.params.orders.currency +
                            ' ' +
                            (
                              Math.round(
                                (this.props.route.params.orders.tip * 10) / 10,
                              ) +
                              this.state.amount_base +
                              MinuteChargePayable
                            )
                              .toFixed(2)
                              .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
                          : this.props.route.params.orders.currency +
                            ' ' +
                            (
                              Math.round((amountpay * 10) / 10) +
                              Math.round(
                                (this.props.route.params.orders.tip * 10) / 10,
                              )
                            )
                              .toFixed(2)
                              .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                      </Text>
                    )}
                    <Text
                      style={{
                        fontSize: SCREEN_HEIGHT < 767 ? 11 : 13,
                        fontWeight: 'bold',
                        marginBottom: 10,
                        textAlign: 'right',
                        paddingRight: 10,
                      }}>
                      {this.props.route.params.orders.PaymentMethod}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={{top: -70, flexDirection: 'row', marginLeft: 10}}
                onPress={() => {
                  this.props.route.params.orders.OrderStatus == 'Cancelled'
                    ? null
                    : this.setState({visibleAddressModalTo: true});
                }}>
                <View style={{flexDirection: 'row'}}>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      fontSize: SCREEN_HEIGHT < 767 ? 12 : 14,
                    }}>
                    Note:{' '}
                  </Text>
                  <Text style={{fontSize: SCREEN_HEIGHT < 767 ? 12 : 14}}>
                    {this.state.cart.Note}
                  </Text>
                </View>
              </TouchableOpacity>
            </Card>
            <ScrollView>
              <Modal
                isVisible={this.state.ModalHelp}
                animationInTiming={700}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                animationOutTiming={700}
                useNativeDriver={true}
                onBackdropPress={() => this.setState({ModalHelp: false})}
                transparent={true}>
                <Card
                  style={{
                    backgroundColor: 'white',
                    padding: 22,
                    borderRadius: 4,
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                  }}>
                  <ScrollView>
                    <View
                      style={{justifyContent: 'center', alignItems: 'center'}}>
                      <Text style={{fontSize: 15, fontWeight: 'bold'}}>
                        Contact Us On
                      </Text>
                    </View>
                    <Text style={{marginTop: 15, fontSize: 10}}>Facebook</Text>
                    <Stack regular style={{marginTop: 7}}>
                      <Input value={this.state.fb_Help} />
                    </Stack>

                    <Text style={{marginTop: 15, fontSize: 10}}>
                      Mobile Number
                    </Text>
                    <Stack regular style={{marginTop: 7}}>
                      <Input value={this.state.mobile_help} />
                    </Stack>

                    <Text style={{marginTop: 15, fontSize: 10}}>
                      Telephone Number
                    </Text>
                    <Stack regular style={{marginTop: 7}}>
                      <Input value={this.state.Telephone_Help} />
                    </Stack>

                    <Text style={{marginTop: 15, fontSize: 10}}>Email</Text>
                    <Stack regular style={{marginTop: 7}}>
                      <Input value={this.state.email_help} />
                    </Stack>
                  </ScrollView>
                </Card>
              </Modal>
              <Modal
                isVisible={this.state.VisibleAddInfo}
                animationInTiming={700}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                animationOutTiming={700}
                useNativeDriver={true}
                style={{margin: 0}}
                onBackButtonPress={() => this.setState({VisibleAddInfo: false})}
                onBackdropPress={() => this.setState({VisibleAddInfo: false})}
                transparent={true}>
                {this.state.cart.OrderStatus == 'Pending' ? (
                  <Card
                    style={{
                      backgroundColor: 'white',
                      padding: 22,
                      borderRadius: 4,
                      borderColor: 'rgba(0, 0, 0, 0.1)',
                      height: SCREEN_HEIGHT,
                      width: SCREEN_WIDTH,
                    }}>
                    <View
                      style={{
                        alignSelf: 'flex-end',
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        flex: 5,
                      }}>
                      <AntDesign
                        name="closecircle"
                        color="#b5b5b5"
                        size={25}
                        onPress={() => this.setState({VisibleAddInfo: false})}
                      />
                    </View>
                    <FlatList
                      data={this.state.cart.BackloadInfos.filter(item => {
                        return item.qty > 0;
                      })}
                      renderItem={({item}) => (
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 10,
                          }}>
                          <View style={{height: 60}}>
                            <View
                              style={{
                                flex: 1,
                                flexDirection: 'row',
                                width: 200,
                                height: 60,
                                alignItems: 'center',
                              }}>
                              <Text style={{paddingRight: 10, fontSize: 18}}>
                                {item.qty} X
                              </Text>

                              <Image
                                style={{
                                  width: 100,
                                  height: 100,
                                  resizeMode: 'contain',
                                  marginTop: 0,
                                }}
                                source={{uri: item.image}}
                              />

                              <View
                                style={{
                                  justifyContent: 'center',
                                  alignContent: 'center',
                                  width: SCREEN_WIDTH / 2.2,
                                  flexDirection: 'column',
                                  paddingTop: 0,
                                  paddingLeft: 10,
                                }}>
                                <Text
                                  style={{
                                    color: 'black',
                                    fontSize: 18,
                                    marginLeft: 5,
                                  }}>
                                  {item.label}
                                </Text>
                                <Text
                                  style={{
                                    color: 'black',
                                    fontSize: 18,
                                    marginLeft: 5,
                                  }}>
                                  {item.subtitle}
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>
                      )}
                      ListFooterComponent={() => (
                        <VStack>
                          <Text
                            style={{
                              marginTop: 15,
                              fontSize: 18,
                              fontWeight: 'bold',
                            }}>
                            Sender Photo
                          </Text>
                          <Stack regular style={{marginTop: 7, padding: 10}}>
                            <TouchableWithoutFeedback
                              onPress={() =>
                                this.setState({
                                  showURL: true,
                                  SelectedURL: this.state.cart.Customerimage,
                                })
                              }>
                              <Image
                                style={{
                                  width: 160,
                                  height: 160,
                                  resizeMode: 'contain',
                                  margin: 10,
                                }}
                                source={
                                  this.state.cart.Customerimage === ''
                                    ? {
                                        uri: 'https://icon-library.com/images/no-photo-icon/no-photo-icon-1.jpg',
                                      }
                                    : {uri: this.state.cart.Customerimage}
                                }
                              />
                            </TouchableWithoutFeedback>
                          </Stack>
                        </VStack>
                      )}
                    />
                  </Card>
                ) : (
                  <Card
                    style={{
                      backgroundColor: 'white',
                      padding: 22,
                      borderRadius: 4,
                      borderColor: 'rgba(0, 0, 0, 0.1)',
                      height: SCREEN_HEIGHT,
                      width: SCREEN_WIDTH,
                    }}>
                    <View
                      style={{
                        alignSelf: 'flex-end',
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        flex: 5,
                      }}>
                      <AntDesign
                        name="closecircle"
                        color="#b5b5b5"
                        size={25}
                        onPress={() => this.setState({VisibleAddInfo: false})}
                      />
                    </View>
                    <FlatList
                      data={this.state.cart.BackloadInfos.filter(item => {
                        return item.qty > 0;
                      })}
                      renderItem={({item}) => (
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 10,
                          }}>
                          <View style={{height: 60}}>
                            <View
                              style={{
                                flex: 1,
                                flexDirection: 'row',
                                width: 200,
                                height: 60,
                                alignItems: 'center',
                              }}>
                              <Text style={{paddingRight: 10, fontSize: 18}}>
                                {item.qty} X
                              </Text>

                              <Image
                                style={{
                                  width: 100,
                                  height: 100,
                                  resizeMode: 'contain',
                                  marginTop: 0,
                                }}
                                source={{uri: item.image}}
                              />

                              <View
                                style={{
                                  justifyContent: 'center',
                                  alignContent: 'center',
                                  width: SCREEN_WIDTH / 2.2,
                                  flexDirection: 'column',
                                  paddingTop: 0,
                                  paddingLeft: 10,
                                }}>
                                <Text
                                  style={{
                                    color: 'black',
                                    fontSize: 18,
                                    marginLeft: 5,
                                  }}>
                                  {item.label}
                                </Text>
                                <Text
                                  style={{
                                    color: 'black',
                                    fontSize: 18,
                                    marginLeft: 5,
                                  }}>
                                  {item.subtitle}
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>
                      )}
                      ListFooterComponent={() => (
                        <VStack>
                          <Text style={{marginTop: 15, fontSize: 10}}>
                            Sender Photo
                          </Text>
                          <Stack regular style={{marginTop: 7, padding: 10}}>
                            <TouchableWithoutFeedback
                              onPress={() =>
                                this.setState({
                                  showURL: true,
                                  SelectedURL: this.state.cart.Customerimage,
                                })
                              }>
                              <Image
                                style={{
                                  width: 160,
                                  height: 160,
                                  resizeMode: 'contain',
                                  margin: 10,
                                }}
                                source={
                                  this.state.cart.Customerimage === ''
                                    ? {
                                        uri: 'https://icon-library.com/images/no-photo-icon/no-photo-icon-1.jpg',
                                      }
                                    : {uri: this.state.cart.Customerimage}
                                }
                              />
                            </TouchableWithoutFeedback>
                          </Stack>

                          <Text style={{marginTop: 15, fontSize: 10}}>
                            Car Photo
                          </Text>
                          <Stack regular style={{marginTop: 7}}>
                            <FlatGrid
                              itemDimension={120}
                              data={this.state.cart.imagesVehicle}
                              // staticDimension={300}
                              // fixed
                              spacing={10}
                              renderItem={({item}) =>
                                item == 'AddImage' ? null : (
                                  <TouchableWithoutFeedback
                                    onPress={() =>
                                      this.setState({
                                        showURL: true,
                                        SelectedURL: item,
                                      })
                                    }>
                                    <Image
                                      style={{
                                        width: 160,
                                        height: 160,
                                        resizeMode: 'contain',
                                        margin: 10,
                                      }}
                                      source={{uri: item}}
                                    />
                                  </TouchableWithoutFeedback>
                                )
                              }
                            />
                          </Stack>
                        </VStack>
                      )}
                    />
                  </Card>
                )}
              </Modal>

              <Modal
                isVisible={this.state.showURL}
                animationInTiming={700}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                animationOutTiming={700}
                style={{marginLeft: 0}}
                useNativeDriver={true}
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

              <Modal
                useNativeDriver={true}
                isVisible={this.state.CancelledModal}
                onSwipeComplete={this.close}
                swipeDirection={['up', 'left', 'right', 'down']}
                style={styles.view}
                transparent={true}>
                <View style={[styles.content, {height: SCREEN_HEIGHT / 3}]}>
                  <Text
                    style={{
                      textAlign: 'center',
                      fontSize: 16,
                      fontWeight: 'bold',
                    }}>
                    Cancelled By {this.state.CancelledBy}
                  </Text>
                  <Text style={{textAlign: 'left'}}>Reasons: </Text>

                  {this.state.RiderCancel < 0 ||
                  this.state.RiderCancel == undefined
                    ? null
                    : this.state.RiderCancel.map((info, index) => {
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
                      })}
                  <View
                    style={{flexDirection: 'row', justifyContent: 'center'}}>
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
            </ScrollView>
          </View>
        </Box>
      </Box>
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
