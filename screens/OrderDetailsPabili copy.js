import React, {Component} from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
  Image,
  FlatList,
  SafeAreaView,
  ScrollView,
  BackHandler,
  Keyboard,
  PermissionsAndroid,
} from 'react-native';
import {
  Container,
  View,
  Left,
  Right,
  Button,
  Icon,
  Grid,
  Col,
  Badge,
  Card,
  CardItem,
  Body,
  Item,
  Input,
  List,
  ListItem,
  Thumbnail,
  Text,
  Form,
  Textarea,
  Toast,
  Root,
} from 'native-base';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
// Our custom files and classes import
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
import {RadioButton, Chip, Divider} from 'react-native-paper';
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
    /* this.backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      this.backAction
    );*/
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
    this.unsubscribe && this.unsubscribe();
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
                : doc.data().DeliveredBy.eta.toString(),
            ratings: doc.data().DeliveredBy.ratings,
          });
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

  render() {
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

    return (
      <Root>
        <Container style={{backgroundColor: '#CCCCCC'}}>
          <CustomHeader
            title="Checkout"
            Cartoff={true}
            navigation={this.props.navigation}
          />
          <Loader loading={this.state.loading} />
          <Loader loading={this.state.isLoading} />

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
                height: Dimensions.get('window').height,
              }}>
              <MapboxGL.MapView
                style={{
                  flex: 1,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}>
                <MapboxGL.Camera
                  centerCoordinate={[
                    this.props.route.params.cLong,
                    this.props.route.params.cLat,
                  ]}
                  zoomLevel={15}
                  followUserMode={'normal'}
                  followUserLocation
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
                  onUpdate={this.onUserLocationUpdate}
                />

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
                {this.state.Tolat == undefined ? null : (
                  <MapboxGL.PointAnnotation
                    coordinate={[this.state.Tolong, this.state.Tolat]}
                  />
                )}
                {this.state.OrderStatus == 'Processing' ? (
                  <MapboxGL.PointAnnotation
                    coordinate={[this.state.RLong, this.state.RLat]}
                  />
                ) : null}
              </MapboxGL.MapView>

              {/* <MapView
            testID="map"
        provider={PROVIDER_GOOGLE}
      
        showsUserLocation={true}
          style={{ position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0}}
         mapPadding={{ right: 0, top: SCREEN_HEIGHT/1.4, bottom: 150 }}
    initialRegion={this.state.region}
    showsMyLocationButton={true}
    pitchEnabled={false}
          showsBuildings={true}
          maxZoomLevel={17.5}
          loadingEnabled={true}
zoomTapEnabled={false}
      zoomEnabled={true}
        scrollEnabled={true}
       
          >
              
             {this.state.routeForMap && (
                <Polyline
                  key="editingPolyline"
                  coordinates={this.state.routeForMap}
                  strokeColor="#019fe8"
                  fillColor="#019fe8"
                  strokeWidth={5}
                />
              )}
              {console.log('clat: ', this.props.route.params.cLat)}
               {console.log('flat: ', this.state.flat)}
          { this.state.x == undefined? null:  
            this.state.x != undefined && this.state.flat == this.props.route.params.clat?
             <MapView.Marker
             coordinate={{latitude: this.state.x.latitude, longitude: this.state.x.longitude}}
             title={"From"}
             description={this.state.fromPlace}
             image={Rider_img}
          />
            : <MapView.Marker
             coordinate={{latitude: this.state.flat, longitude: this.state.flong}}
             title={"From"}
             description={this.state.fromPlace}
             image={Rider_img}
          />}
           {  this.state.Tolat == undefined? null:
         
           <MapView.Marker
             coordinate={{latitude: this.state.Tolat, longitude: this.state.Tolong}}
             title={"To"}
             description={this.state.toPlace}
             image={customer_img}
       />}
   {  this.state.OrderStatus == 'Processing'?
         
           <MapView.Marker
             coordinate={{latitude: this.state.RLat, longitude: this.state.RLong}}
             title={"To"}
             description={this.state.toPlace}
             image={marker}
       />:null}
          
          </MapView>*/}
              <Card></Card>

              {/* <Card style={{ left: 0, top: 0, position: 'absolute'}}>
   <CardItem>
  <FontAwesome name={'dot-circle-o'} style={{ marginRight: 10}}/> 
   <View style={{flexDirection: 'column'}}>

   
                    <Text style={{fontWeight: 'normal', fontSize: 12, color: 'green'}}>Pickup location </Text>
                      
                    {!this.state.loading &&
                   
                    <View regular style={{width: '99%', height: 40}}>
                    <Text style={{fontSize: 13}} >{this.state.fromPlace}
                       </Text>
                         </View>      }
                         </View> 
                </CardItem>
                
               
                <CardItem>
                  <FontAwesome name={'dot-circle-o'} style={{ marginRight: 10}}/> 
                <View style={{flexDirection: 'column'}}>
              
  
                    <Text style={{fontWeight: 'normal', fontSize: 12, color: 'blue'}}>Drop-off location</Text>
                 
                    {!this.state.loading &&
                       
                    <View regular style={{width: '99%', height: 40}}>
                     <Text style={{fontSize: 13}} >{this.state.toPlace}
                       </Text>
                  
                         </View>  
                   }
                   </View>
                  
                </CardItem>
              

<View style={{
    borderStyle: 'dotted',
    borderWidth: 1,
    borderRadius: 1,
    width: 1,
    height: '50%', position: 'absolute', left: 21, top: '25%'
  }}>
</View>
             
         </Card>*/}
            </View>
          </View>
          <View>
            {this.state.OrderStatus == 'Cancelled' ||
            this.state.OrderStatus == 'Delivered' ? (
              <Card style={{height: SCREEN_HEIGHT / 4}}>
                <CardItem>
                  <FontAwesome
                    name={'dot-circle-o'}
                    style={{marginRight: 10}}
                  />
                  <View style={{flexDirection: 'column'}}>
                    <Text
                      style={{
                        fontWeight: 'normal',
                        fontSize: 11,
                        color: 'green',
                      }}>
                      Pickup location{' '}
                    </Text>
                    <Text style={{fontSize: 12}}>{this.state.fromPlace}</Text>
                  </View>
                </CardItem>
                <CardItem>
                  <FontAwesome
                    name={'dot-circle-o'}
                    style={{marginRight: 10}}
                  />
                  <View style={{flexDirection: 'column'}}>
                    <Text
                      style={{
                        fontWeight: 'normal',
                        fontSize: 11,
                        color: 'blue',
                      }}>
                      Drop-off location
                    </Text>
                    <Text style={{fontSize: 12}}>{this.state.toPlace}</Text>
                  </View>
                </CardItem>
                <View
                  style={{
                    borderStyle: 'dotted',
                    borderWidth: 1,
                    borderRadius: 1,
                    width: 1,
                    height: '35%',
                    position: 'absolute',
                    left: 21,
                    top: '17%',
                  }}></View>
                <Text style={{fontSize: 12, marginLeft: 20}}>
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
                        <Text style={{fontSize: 10}}>
                          {item.CancelledReason} by {item.RiderName}
                        </Text>
                      </View>
                    ))
                  : null}
              </Card>
            ) : this.state.OrderStatus == 'Processing' ? (
              <Card style={{height: SCREEN_HEIGHT / 2.5}}>
                <CardItem>
                  <Body style={{flexDirection: 'row'}}>
                    <View style={{flexDirection: 'column', marginLeft: 10}}>
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
                        style={{fontSize: 10, top: -50, textAlign: 'center'}}>
                        {this.state.ratings}{' '}
                      </Text>
                    </View>
                    <View style={{flexDirection: 'column', marginLeft: 10}}>
                      <Text style={{fontSize: 15}}>
                        {this.state.DriverInfo.Name}{' '}
                      </Text>
                      <Text style={{fontSize: 12}}>
                        {this.state.DriverInfo.ColorMotor}{' '}
                        {this.state.DriverInfo.MBrand}{' '}
                        {this.state.DriverInfo.VModel}
                      </Text>
                      <Text style={{fontSize: 12}}>
                        Plate Number :
                        <Text style={{fontSize: 10}}>
                          {this.state.DriverInfo.PlateNo}{' '}
                        </Text>
                      </Text>
                    </View>
                  </Body>

                  <Right style={{top: -80}}>
                    <View
                      style={{
                        backgroundColor: 'white',
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: 'black',
                        width: '30%',
                      }}>
                      <Text
                        style={{
                          textAlign: 'center',
                          borderBottomWidth: 1,
                          borderBottomColor: 'black',
                          fontSize: 12,
                        }}>
                        ETA
                      </Text>
                      <Text style={{textAlign: 'center', fontSize: 12}}>
                        {this.state.eta.toString()}mins
                      </Text>
                    </View>
                  </Right>
                </CardItem>
                <CardItem style={{top: -64}}>
                  <FontAwesome
                    name={'dot-circle-o'}
                    style={{marginRight: 10}}
                  />
                  <View style={{flexDirection: 'column'}}>
                    <Text
                      style={{
                        fontWeight: 'normal',
                        fontSize: 11,
                        color: 'green',
                      }}>
                      Pickup location{' '}
                    </Text>
                    <Text style={{fontSize: 12}}>{this.state.fromPlace}</Text>
                  </View>
                </CardItem>
                <CardItem style={{top: -79}}>
                  <FontAwesome
                    name={'dot-circle-o'}
                    style={{marginRight: 10}}
                  />
                  <View style={{flexDirection: 'column'}}>
                    <Text
                      style={{
                        fontWeight: 'normal',
                        fontSize: 11,
                        color: 'blue',
                      }}>
                      Drop-off location
                    </Text>
                    <Text style={{fontSize: 12}}>{this.state.toPlace}</Text>
                  </View>
                </CardItem>
                <View
                  style={{
                    borderStyle: 'dotted',
                    borderWidth: 1,
                    borderRadius: 1,
                    width: 1,
                    height: '18%',
                    position: 'absolute',
                    left: 21,
                    top: '42%',
                  }}></View>

                <CardItem style={{top: -90, flexDirection: 'column'}}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: 'bold',
                      alignSelf: 'flex-end',
                      marginRight: 10,
                    }}>
                    PHP {this.props.route.params.orders.total.toString()}
                  </Text>
                  <View style={{flexDirection: 'row'}}>
                    <Body>
                      <TouchableOpacity
                        onPress={() => this.onCall()}
                        style={{
                          flexDirection: 'row',
                          width: '95%',
                          borderRadius: 5,
                          borderWidth: 2,
                          borderColor: '#019fe8',
                          padding: 10,
                          marginRight: 30,
                        }}>
                        <MaterialIcons name="call" size={15} color={'black'} />
                        <Text style={{marginLeft: 10, fontSize: 15}}>
                          Call Rider
                        </Text>
                      </TouchableOpacity>
                    </Body>
                    <Body>
                      <TouchableOpacity
                        onPress={() => this.checkOut()}
                        style={{
                          flexDirection: 'row',
                          width: '100%',
                          borderRadius: 5,
                          borderWidth: 2,
                          borderColor: '#019fe8',
                          padding: 10,
                          marginRight: 5,
                        }}>
                        <Entypo name="message" size={20} color={'black'} />
                        <Text style={{marginLeft: 10, fontSize: 15}}>
                          Text Rider
                        </Text>
                      </TouchableOpacity>
                    </Body>
                    <Right>
                      <TouchableOpacity
                        onPress={() =>
                          this.setState({visibleAddressModal: true})
                        }
                        style={{
                          flexDirection: 'row',
                          borderRadius: 5,
                          borderWidth: 2,
                          borderColor: '#019fe8',
                          padding: 10,
                          width: '85%',
                        }}>
                        <MaterialIcons
                          name="cancel"
                          size={20}
                          color={'black'}
                        />
                        <Text
                          style={{
                            marginLeft: 10,
                            fontSize: 15,
                            textAlign: 'center',
                          }}>
                          Cancel
                        </Text>
                      </TouchableOpacity>
                    </Right>
                  </View>
                </CardItem>
              </Card>
            ) : (
              <Card style={{height: SCREEN_HEIGHT / 3.8}}>
                <CardItem style={{zIndex: 3}}>
                  <ActivityIndicator />
                  <Text>Searching for Rider ... </Text>
                </CardItem>
                <CardItem style={{marginTop: -15, zIndex: 2}}>
                  <FontAwesome
                    name={'dot-circle-o'}
                    style={{marginRight: 10}}
                  />
                  <View style={{flexDirection: 'column'}}>
                    <Text
                      style={{
                        fontWeight: 'normal',
                        fontSize: 11,
                        color: 'green',
                      }}>
                      Pickup location{' '}
                    </Text>
                    <Text style={{fontSize: 12}}>{this.state.fromPlace}</Text>
                  </View>
                </CardItem>
                <CardItem style={{marginTop: -15}}>
                  <FontAwesome
                    name={'dot-circle-o'}
                    style={{marginRight: 10}}
                  />
                  <View style={{flexDirection: 'column'}}>
                    <Text
                      style={{
                        fontWeight: 'normal',
                        fontSize: 11,
                        color: 'blue',
                      }}>
                      Drop-off location
                    </Text>
                    <Text style={{fontSize: 12}}>{this.state.toPlace}</Text>
                  </View>
                </CardItem>
                <View
                  style={{
                    borderStyle: 'dotted',
                    borderWidth: 1,
                    borderRadius: 1,
                    width: 1,
                    zIndex: 10,
                    height: '28%',
                    position: 'absolute',
                    left: 21,
                    top: '32%',
                  }}></View>
                <View style={{flexDirection: 'row'}}>
                  <Left style={{marginLeft: 20}}>
                    <TouchableOpacity
                      onPress={() => this.setState({visibleAddressModal: true})}
                      style={{
                        flexDirection: 'row',
                        borderRadius: 5,
                        borderWidth: 2,
                        borderColor: '#019fe8',
                        padding: 10,
                        width: '85%',
                      }}>
                      <MaterialIcons name="cancel" size={20} color={'black'} />
                      <Text
                        style={{
                          marginLeft: 10,
                          fontSize: 15,
                          textAlign: 'center',
                        }}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </Left>
                  <Body>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        alignSelf: 'flex-end',
                        marginRight: 10,
                      }}>
                      PHP {this.props.route.params.orders.total.toString()}
                    </Text>
                  </Body>
                </View>
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
                    <Item regular>
                      <Input
                        value={this.state.otherreasonofcancel}
                        onChangeText={item =>
                          this.setState({otherreasonofcancel: item})
                        }
                      />
                    </Item>
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
        </Container>
      </Root>
    );
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
          onPress: () => RNImmediatePhoneCall.immediatePhoneCall('0123456789'),
        },
      ],
      {cancelable: false},
    );
  }
  async checkOut() {
    SendSMS.send(
      {
        body: '',
        recipients: ['9876543210'],
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
