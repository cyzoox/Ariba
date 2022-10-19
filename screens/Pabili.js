import React, {Component} from 'react';
import {
  AppState,
  StyleSheet,
  TouchableWithoutFeedback,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  Dimensions,
  Alert,
  Image,
  FlatList,
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
  Stack,
  Input,
  VStack,
  Select,
  HStack,
  Text,
  Box,
  StatusBar,
} from 'native-base';
import SelectDropdown from 'react-native-select-dropdown'
import firestore from '@react-native-firebase/firestore';
import Clipboard from '@react-native-clipboard/clipboard';

import auth from '@react-native-firebase/auth';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// Our custom files and classes import
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
import DeliveryDetails from './checkout/DeliveryDetails';
import {RadioButton, Chip, Divider} from 'react-native-paper';
//import { StackActions, NavigationActions } from 'react-navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import Modal from 'react-native-modal';
import TearLines from 'react-native-tear-lines';
import {NumericFormat} from 'react-number-format';
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
import Geolocation from 'react-native-geolocation-service';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Octicons from 'react-native-vector-icons/Octicons';
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

export default class Pabili extends Component {
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
    const newUserLocationCountry =
      this.props.route.params.UserLocationCountry == 'Philippines'
        ? 'vehicles'
        : this.props.route.params.UserLocationCountry + '.vehicles';
    this.chargeref = firestore()
      .collection(newUserLocationCountry)
      .where('vehicle', '==', 'Motorcycle');
    this.state = {
      appState: AppState.currentState,
      VisibleAddInfo: false,
      datas: [],
      cLong: this.props.route.params.cLong,
      cLat: this.props.route.params.cLat,
      driver_charge: 0,
      xtra: 0,
      labor: 0,
      deliveryCharge: 0,
      pickup: 0,
      stores: [],
      paymentMethod: 'Cash',
      billing_name: '',
      billing_postal: '',
      billing_phone: '',
      billing_street: this.props.route.params.billing_streetTo,
      billing_country: '',
      billing_province: this.props.route.params.billing_provinceTo,
      billing_context: this.props.route.params.context,
      billing_city: this.props.route.params.currentLocation,
      billing_barangay: '',
      billing_cluster: '',
      billing_nameTo: '',
      billing_postalTo: '',
      billing_phoneTo: '',
      billing_streetTo: '',
      billing_countryTo: '',
      billing_provinceTo: '',
      billing_cityTo: '',
      billing_barangayTo: '',
      billing_clusterTo: '',
      billing_streetcurrent: this.props.route.params.billing_streetTo,
      billing_countrycurrent: '',
      billing_provincecurrent: this.props.route.params.billing_provinceTo,
      billing_citycurrent: this.props.route.params.currentLocation,
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
      visibleAddressModalToPin: true,
      passenger: '1',
      note: '',
      AlwaysOpen: true,
      Customerimage: null,
      Metro: 0,
      City: 0,
      SCity: 0,
      SMetro: 0,
      warningModal: false,
      fromPlace: this.props.route.params.fromPlace,
      flat: this.props.route.params.cLat,
      flong: this.props.route.params.cLong,

      region: {
        latitude: this.props.route.params.cLat,
        longitude: this.props.route.params.cLong,
        // latitudeDelta: 0.0005,
        //longitudeDelta: 0.05
        latitudeDelta: 0.01,
        longitudeDelta: 0.005,
      },
      Currentlat: this.props.route.params.cLat,
      Currentlong: this.props.route.params.cLong,
      currentPlace: this.props.route.params.fromPlace,
      searchResult: [],
      searchResultto: [],
      toPlace: '',
      isLoading: false,
      keyboard: false,
      photo: '',
      PBasekm: 0,
      PbaseFare: 0,
      Psucceeding: 0,
      CityPBasekm: 0,
      CityPbaseFare: 0,
      CityPsucceeding: 0,
      MetroPsucceeding: 0,
      MetroPBasekm: 0,
      MetroPbaseFare: 0,
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
      listModal: false,
      avoildingViewList: false,
      ItemList: [],
      paymentMethods: [],
      VisibleAddInfo: false,
      listNo: 5,
      ListValue: [],
      pabiliList: [],
      history: [],
      estCost: '0',
      AddTipModal: false,
      willingtopay: false,
      tip50: true,
      tip100: false,
      tip200: false,
      tipcustom: false,
      tip: 0,
      ridersList: [],
    };
  }

  onRegionChange = region => {
    console.log('region: ', region);
    console.log('visibleAddressModalPin: ', this.state.visibleAddressModalPin);
    console.log(
      'visibleAddressModalToPin: ',
      this.state.visibleAddressModalToPin,
    );
    if (
      this.state.visibleAddressModal == true ||
      this.state.visibleAddressModalPin == true
    ) {
      this.setState({isLoading: true, keyboard: false});
      axios
        .get(
          `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${region[1]}%2C${region[0]}&apiKey=5fcoJoPAIOye99-ssHc6TIx73yOAhtWiU1_1p1461X4`,
        )
        .then(res => {
          console.log('revgeo', res.data.items);

          let str = res.data.items[0].address.label;
          console.log('str', str);

          this.setState({
            billing_province: res.data.items[0].address.county,
            billing_city: res.data.items[0].address.city,
            billing_context: res.data.items[0],
            billing_street: res.data.items[0].title,
            billing_postal: res.data.items[0].address.postalCode,
            billing_barangay: res.data.items[0].address.district,
            billing_country: res.data.items[0].address.countryName,
            flat: region[1],
            flong: region[0],
            cLong: region[0],
            cLat: region[1],
            region: {
              latitude: region[1],
              longitude: region[0],
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            },
            showfromBotton: true,
            fromPlace: res.data.items[0].address.label,
            x: {latitude: region[1], longitude: region[0]},
            isLoading: false,
            LocationDoneto: true,
          });

          console.log('Tolong: ', this.state.Tolong);
          if (this.state.Tolong != undefined) {
            console.log('working here');
            this.setState({isLoading: true});
            firestore()
              .collection('riders')
              .where('Account', '==', 'Foods')
              .where('status', '==', true)
              .where('wallet', '>', 0)
              .where('arrayofCity', 'array-contains-any', [
                this.state.billing_cityTo,
              ])

              .onSnapshot(QuerySnapshot => {
                const riders = [];

                QuerySnapshot.forEach(documentSnapshot => {
                  riders.push({
                    ...documentSnapshot.data(),
                    key: documentSnapshot.id,
                  });
                });
                this.setState({ridersList: riders});

                console.log('riders1: ', riders);
              });
            let routeCoordinates = [];
            axios
              .get(
                `https://route.ls.hereapi.com/routing/7.2/calculateroute.json?apiKey=5fcoJoPAIOye99-ssHc6TIx73yOAhtWiU1_1p1461X4&waypoint0=geo!${region[1]},${region[0]}&waypoint1=geo!${this.state.Tolat},${this.state.Tolong}&mode=fastest;car;traffic:disabled&legAttributes=shape`,
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
                console.log('routeCoordinates', routeCoordinates);
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
              })
              .catch(err => {
                console.log('here fron: ', err);
              });
          }
        })
        .catch(err => {
          console.log('visibleAddressModal Region axios: ', err);
        });

      return;
    }
    console.log('visibleAddressModalTo: ', this.state.visibleAddressModalTo);
    console.log(
      'visibleAddressModalToPin: ',
      this.state.visibleAddressModalToPin,
    );
    if (
      this.state.visibleAddressModalTo == true ||
      this.state.visibleAddressModalToPin == true
    ) {
      this.setState({isLoading: true, keyboard: false});

      axios
        .get(
          `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${region[1]}%2C${region[0]}&apiKey=5fcoJoPAIOye99-ssHc6TIx73yOAhtWiU1_1p1461X4`,
        )
        .then(res => {
          const {flat, flong} = this.state;
          let from_lat = flat;
          let from_long = flong;
          let to_lat = region[1];
          let to_long = region[0];
          // [125.53647997480391, 8.93336215559458]
          console.log('to_lat: ', to_lat);
          console.log('to_long: ', to_long);
          let routeCoordinates = [];
          let str = res.data.items[0].address.label;

          console.log('str', str);
          this.setState({
            Tolat: region[1],
            Tolong: region[0],
            billing_provinceTo: res.data.items[0].address.county,
            billing_cityTo: res.data.items[0].address.city,
            billing_contextTo: res.data.items[0],
            billing_streetTo: res.data.items[0].title,
            billing_postalTo: res.data.items[0].address.postalCode,
            billing_barangayTo: res.data.items[0].address.district,
            billing_countryTo: res.data.items[0].address.countryName,
            flatTo: region[1],
            flongTo: region[0],
            region: {
              latitude: region[1],
              longitude: region[0],
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            },
            toPlace: res.data.items[0].address.label,
            LocationDoneto: true,
            LocationDone: true,
            isLoading: false,
          });

          if (this.state.flat != undefined) {
            this.setState({isLoading: true});
            firestore()
              .collection('riders')
              .where('Account', '==', 'Foods')
              .where('status', '==', true)
              .where('wallet', '>', 0)
              .where('arrayofCity', 'array-contains-any', [
                res.data.items[0].address.city,
              ])

              .onSnapshot(
                QuerySnapshot => {
                  const riders = [];

                  QuerySnapshot.forEach(documentSnapshot => {
                    riders.push({
                      ...documentSnapshot.data(),
                      key: documentSnapshot.id,
                    });
                  });
                  this.setState({ridersList: riders});

                  console.log('riders2: ', riders);
                },

                error => {
                  console.log('riders2: ', error);
                },
              );
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

                console.log('summary: ', res.data.response.route[0].summary);
                console.log('routeCoordinates', routeCoordinates);
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
              })
              .catch(err => {
                console.log('here drop off: ', err);
              });
          }
        })
        .catch(err => {
          this.setState({isLoading: false});

          Alert.alert('Error', 'Internet Connection is unstable');
          console.log('Region visibleAddressModalTo axios: ', err);
        });
    }
  };

  getLocationType = (text, field) => {
    const state = this.state;
    state[field] = text;
    this.setState(state);
    console.log('text: ', text);
    axios
      .get(
        `https://discover.search.hereapi.com/v1/discover?at=${this.props.route.params.cLat},${this.props.route.params.cLong}&q=${text}&apiKey=5fcoJoPAIOye99-ssHc6TIx73yOAhtWiU1_1p1461X4`,
      )
      .then(res => {
        //  console.log('Here API', res.data.items)
        this.setState({searchResult: res.data.items});
      })
      .catch(err => {
        console.log('axios: ', err);
      });
  };
  getLocationTypeto = (text, field) => {
    const state = this.state;
    state[field] = text;
    this.setState(state);
    console.log('text: ', text);
    axios
      .get(
        `https://discover.search.hereapi.com/v1/discover?at=${this.props.route.params.cLat},${this.props.route.params.cLong}&q=${text}&apiKey=5fcoJoPAIOye99-ssHc6TIx73yOAhtWiU1_1p1461X4`,
      )
      .then(res => {
        // console.log('Here API To', res.data.items)
        this.setState({searchResultto: res.data.items});
      })
      .catch(err => {
        console.log('axios: ', err);
      });
  };

  showDatePicker = () => {
    this.setState({isDatePickerVisible: true});
  };

  hideDatePicker = () => {
    this.setState({isDatePickerVisible: false});
  };

  handleConfirm = date => {
    console.warn('A date has been picked: ', date);
    this.setState({startDate: date});
    this.hideDatePicker();
  };

  checkbarangay(data) {
    const ref = firestore().collection('barangay').doc(data);

    ref.get().then(doc => {
      if (doc.exists) {
        const data = doc.data();
        this.setState({
          barangay_km: data.kilometer,
          barangay_status: data.status,
          charge: data.charge,
          selectedBarangayCluster: data.cluster,
        });
        this.calculateXtraKm(data.charge, data.cluster);
      }
    });
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
    this.StartImageRotationFunction();
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

        axios
          .get(
            `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${coords.latitude}%2C${coords.longitude}&apiKey=5fcoJoPAIOye99-ssHc6TIx73yOAhtWiU1_1p1461X4`,
          )

          .then(res => {
            this.setState({
              Tolat: region[1],
              Tolong: region[0],

              //   summary: res.data.response.route[0].summary,

              billing_provinceTo: res.data.items[0].address.county,
              billing_cityTo: res.data.items[0].address.city,
              billing_contextTo: res.data.items[0],
              billing_streetTo: res.data.items[0].title,
              billing_postalTo: res.data.items[0].address.postalCode,
              billing_barangayTo: res.data.items[0].address.district,
              billing_countryTo: res.data.items[0].address.countryName,
              flatTo: region[1],
              flongTo: region[0],
              region: {
                latitude: region[1],
                longitude: region[0],
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
              },
              toPlace: res.data.items[0].address.label,
              LocationDoneto: true,
              LocationDone: true,
              isLoading: false,
            });
          })
          .catch(err => {
            console.log('Region axios: ', err);
          });
      },
      error => console.log(error),
      {
        enableHighAccuracy: false,
        timeout: 2000,
        maximumAge: 3600000,
      },
    );
    const newUserLocationCountry =
      this.props.route.params.UserLocationCountry.trim() == 'Philippines'
        ? 'AppShare'
        : this.props.route.params.UserLocationCountry.trim() + '.AppShare';

    firestore()
      .collection(newUserLocationCountry)
      .where('label', '==', 'rides')
      .onSnapshot(querySnapshot => {
        querySnapshot.forEach(doc => {
          console.log('modeOfPayment', doc.data().modeOfPayment);
          this.setState({
            paymentMethods:
              doc.data().modeOfPayment == undefined
                ? []
                : doc.data().modeOfPayment,
          });
        });
      });
    this.chargeref.onSnapshot(querySnapshot => {
      querySnapshot.forEach(doc => {
        console.log('doc.data(): ', doc.data());
        this.setState({
          PBasekm: doc.data().PBasekm,
          PbaseFare: doc.data().PbaseFare,
          Psucceeding: doc.data().Psucceeding,
          CityPBasekm: doc.data().CityPBasekm,
          CityPbaseFare: doc.data().CityPbaseFare,
          CityPsucceeding: doc.data().CityPsucceeding,
          MetroPsucceeding: doc.data().MetroPsucceeding,
          MetroPBasekm: doc.data().MetroPBasekm,
          MetroPbaseFare: doc.data().MetroPbaseFare,
        });
      });
    });
    this._bootstrapAsync();

    firestore()
      .collection('Pabili')
      .where('uid', '==', auth().currentUser.uid)
      .orderBy('timeStamp')
      .onSnapshot(QuerySnapshot => {
        const list = [];

        QuerySnapshot.forEach(documentSnapshot => {
          list.push({
            ...documentSnapshot.data(),
            key: documentSnapshot.id,
          });
        });

        this.setState({
          pabiliList: list,
        });
      });
  }

  componentWillUnmount() {
    this.appStateSubscription.remove();
    this.unsubscribe && this.unsubscribe();
    this.subscribe && this.subscribe();
    this.billinglistener && this.billinglistener();
    this.ordercounters && this.ordercounters();
  }
  getAdminCharge = async () => {
    console.log('Get AdminId: ', this.state.cartItems[0]);
    const getAdminId = this.state.cartItems[0];
    this.ordercounters
      .collection('charges')
      .where('id', '==', getAdminId.adminID)
      .onSnapshot(querySnapshot => {
        querySnapshot.forEach(doc => {
          this.setState({
            del_charge: doc.data().del_charge,
            driverCharge: doc.data().driverCharge,
            extra_charge: doc.data().extra_charge,
            labor_charge: doc.data().labor_charge,
            pickup_charge: doc.data().pickup_charge,
            succeding: doc.data().succeding,
            amount_base: doc.data().del_charge,
            base_dist: doc.data().base_dist,
          });
        });
      });
  };

  cartCount() {
    let total = 0;
    this.state.cartItems.forEach(item => {
      total += item.qty;
    });

    return total;
  }

  _bootstrapAsync = async () => {
    const userId = await AsyncStorage.getItem('uid');
    this.billinglistener = firestore()
      .collection('users')
      .where('userId', '==', userId)
      .onSnapshot(this.onCollectionUpdateBilling);

    this.ordercounters = this.ordercounters
      .collection('orderCounter')
      .onSnapshot(this.OrderCounter);
    firestore()
      .collection('users')
      .doc(userId)
      .collection('history')
      .onSnapshot(this.history);

    this.setState({uid: userId});
  };

  onCPaymentMethodUpdate = querySnapshot => {
    const methods = [];
    querySnapshot.forEach(doc => {
      this.setState({
        palawan_name: doc.data().palawan_receiver,
        palawan_number: doc.data().palawan_number,
        bank_number: doc.data().bank_number,
        bank_name: doc.data().bank_name,
        gcash_number: doc.data().gcash_number,
        bank_name2: doc.data().bank_name2,
        bank_number2: doc.data().bank_number2,
        paypal_uname: doc.data().paypal_uname,
        paypal_email: doc.data().paypal_email,
      });
    });
  };

  onCPaymentOptionUpdate = querySnapshot => {
    const payments = [];
    querySnapshot.forEach(doc => {
      payments.push({
        datas: doc.data(),
        key: doc.id,
      });
    });
    this.setState({
      payments: payments,
    });
  };

  history = querySnapshot => {
    let history = [];
    querySnapshot.forEach(doc => {
      history.push(doc.data());
    });
    // console.log('history: ',history)
    this.setState({
      history,
    });
  };
  OrderCounter = querySnapshot => {
    querySnapshot.forEach(doc => {
      this.setState({
        counter: doc.data().counter,
      });
    });
  };

  onCollectionUpdateBilling = querySnapshot => {
    querySnapshot.forEach(doc => {
      console.log('User Info: ', doc.data().photo);
      this.setState({
        userToken: doc.data().token,
        account_name: doc.data().Name,
        account_address: doc.data().Address.Address,
        account_city: doc.data().Address.City,
        account_barangay: doc.data().Address.Barangay,
        account_province: doc.data().Address.Province,
        account_email: doc.data().Email,
        account_number: doc.data().Mobile,
        account_cluster: doc.data().Address.Cluster,
        account_status: doc.data().status,
        photo: doc.data().photo,
        address_list: Object.values(doc.data().Shipping_Address),
      });
    });
    this.defaultShippingAddress();
  };

  onCollectionUpdateCharge = querySnapshot => {
    querySnapshot.forEach(doc => {
      this.setState({
        driver_charge: doc.data().driverCharge,
        xtra: doc.data().extra_charge,
        labor: doc.data().labor_charge,
        deliveryCharge: doc.data().del_charge,
        pickup: doc.data().pickup_charge,
      });
    });
  };

  async calculateXtraKm(charge, clustering) {
    let total = 0;
    const cluster = await AsyncStorage.getItem('cluster');

    if (clustering == cluster) {
      total = 0;
    } else {
      total = charge;
    }
    this.setState({xtraCharge: total});
  }

  calculateOverAllTotal() {
    const {
      paymentMethod,
      minimum,
      selectedIndex,
      selectedIndices,
      customStyleIndex,
    } = this.state;
    let total = 0;
    if (customStyleIndex === 0) {
      total =
        this.state.subtotal +
        this.calculateTotalDeliveryCharge() +
        this.extraKMCharges();
    } else if (customStyleIndex === 1) {
      total = this.state.subtotal + this.extraKMCharges();
    }
    return total;
  }

  calculateLaborCharge() {
    let total = 0;
    this.state.cartItems.forEach(item => {
      if (item.sale_price) {
        total += item.qty * item.sale_price * item.labor_charge;
      } else {
        total += item.qty * item.price * item.labor_charge;
      }
    });
    return total;
  }

  calculatePickupCharge() {
    let total = 0;

    total = this.state.pickup * this.storeID().length;
    return total;
  }

  calculateTotalDeliveryCharge() {
    let total = 0;

    total = this.state.amount_base;

    return total;
  }

  extraKMCharges() {
    let total = 0;
    let distance =
      this.state.summary === undefined
        ? 0
        : parseFloat(this.state.summary.distance / 1000);
    let NewDistance = distance - this.state.base_dist;
    let extrakm = NewDistance > 0 ? NewDistance * this.state.succeding : 0;
    console.log('extrakm: ', extrakm);
    total = extrakm;
    return total;
  }
  storeIDS() {
    let store = {};
    this.state.cartItems.forEach(item => {
      store[item.storeId] = 'Pending';
    });

    return store;
  }

  storeID() {
    let store = [];
    let uniqueArray = [];
    this.state.cartItems.forEach(item => {
      store.push(item.storeId);
    });
    for (var value of store) {
      if (uniqueArray.indexOf(value) === -1) {
        uniqueArray.push(value);
      }
    }

    return uniqueArray;
  }

  token() {
    let store = [];
    let uniqueArray = [];
    this.state.cartItems.forEach(item => {
      store.push(...item.notification_token);
    });
    for (var value of store) {
      if (uniqueArray.indexOf(value) === -1) {
        uniqueArray.push(value);
      }
    }
    return uniqueArray;
  }

  defaultShippingAddress() {
    this.state.address_list.forEach(item => {
      if (item.default) {
        // console.log('item.lat: ', item.lat);
        //  console.log('item.long: ', item.long);

        this.setState({
          billing_name: item.name,
          billing_phone: item.phone,
        });

        const {slatitude, slongitude} = this.state;

        let from_lat = slatitude;
        let from_long = slongitude;
        let to_lat = item.lat;
        let to_long = item.long;

        let routeCoordinates = [];

        /*axios.get(`https://route.ls.hereapi.com/routing/7.2/calculateroute.json?apiKey=5fcoJoPAIOye99-ssHc6TIx73yOAhtWiU1_1p1461X4&waypoint0=geo!${from_lat},${from_long}&waypoint1=geo!${to_lat},${to_long}&mode=fastest;car;traffic:disabled&legAttributes=shape`)
          .then(res => {
         
              res.data.response.route[0].leg[0].shape.map(m => {
                // here we are getting latitude and longitude in seperate variables because HERE sends it together, but we
                // need it seperate for <Polyline/>
                let latlong = m.split(',');
                let latitude = parseFloat(latlong[0]);
                let longitude = parseFloat(latlong[1]);
                routeCoordinates.push([longitude,latitude]);
            })
            this.setState({
              ULat: item.lat,
              ULong:item.long,
                // here we can access route summary which will show us how long does it take to pass the route, distance etc.
                summary: res.data.response.route[0].summary,
                
                isready: 1,
                loading: false,
            })
         
            }).catch(err => {
           // console.log(err)
            })*/
      }
    });
  }

  OrderSuccess() {
    this.props.navigation.reset({
      index: 0,
      routes: [{name: 'Home'}],
    });
    this.setState({visibleModal: false});
  }

  changeAddress(item) {}
  changeAddressto(itemLat, itemLong) {}
  changePaymentMethod(item) {
    this.setState({
      paymentMethod: item.datas.label,
      visiblePaymentModal: false,
    });
  }

  handleCustomIndexSelect = (index: number) => {
    //handle tab selection for custom Tab Selection SegmentedControlTab
    this.setState(prevState => ({...prevState, customStyleIndex: index}));
  };

  navigateAddress() {
    this.setState({visibleAddressModal: false});
    this.props.navigation.navigate('Address');
  }

  deleteHistory(docID) {
    firestore()
      .collection('users')
      .doc(auth().currentUser.uid)
      .collection('history')
      .doc(docID)
      .delete();
  }

  footer = () => {
    return (
      <View>
        <Button
          block
          style={{alignSelf: 'center', backgroundColor: '#019fe8'}}
          onPress={() => this.navigateAddress()}>
          <Text style={{color: 'white'}}>Add Address</Text>
        </Button>
      </View>
    );
  };

  onRegionWillChange(regionFeature) {
    console.log('user regionFeature!', regionFeature);
  }

  onRegionDidChange(regionFeature) {
    console.log('user onRegionDidChange!', regionFeature);
  }

  onRegionIsChanging(regionFeature) {
    console.log('user onRegionIsChanging!', regionFeature);
  }
  currentPickup() {
    console.log('Get current Location');
    const long = this.props.route.params.cLong;
    const lat = this.props.route.params.cLat;
    this.setState({isLoading: true, keyboard: false});
    axios
      .get(
        `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${lat}%2C${long}&apiKey=5fcoJoPAIOye99-ssHc6TIx73yOAhtWiU1_1p1461X4`,
      )
      .then(res => {
        this.setState({
          billing_province: res.data.items[0].address.county,
          billing_city: res.data.items[0].address.city,
          billing_context: res.data.items[0],
          billing_street: res.data.items[0].title,
          billing_postal: res.data.items[0].address.postalCode,
          billing_barangay: res.data.items[0].address.district,
          billing_country: res.data.items[0].address.countryName,
          flat: lat,
          flong: long,
          cLong: long,
          cLat: lat,

          showfromBotton: true,
          fromPlace: this.props.route.params.fromPlace,
          x: {latitude: lat, longitude: long},
          isLoading: false,
          LocationDoneto: true,
        });

        console.log('Tolong: ', this.state.Tolong);
        if (this.state.Tolong != undefined) {
          firestore()
            .collection('riders')
            .where('Account', '==', 'Foods')
            .where('status', '==', true)
            .where('wallet', '>', 0)
            .where('arrayofCity', 'array-contains-any', [
              res.data.items[0].address.city,
            ])

            .onSnapshot(QuerySnapshot => {
              const riders = [];

              QuerySnapshot.forEach(documentSnapshot => {
                riders.push({
                  ...documentSnapshot.data(),
                  key: documentSnapshot.id,
                });
              });
              this.setState({ridersList: riders});

              console.log('riders3: ', riders);
            });
          console.log('working here');
          this.setState({isLoading: true});
          firestore()
            .collection('riders')
            .where('Account', '==', 'Foods')
            .where('status', '==', true)
            .where('wallet', '>', 0)
            .where('arrayofCity', 'array-contains-any', [
              this.state.billing_cityTo,
            ])

            .onSnapshot(QuerySnapshot => {
              const riders = [];

              QuerySnapshot.forEach(documentSnapshot => {
                riders.push({
                  ...documentSnapshot.data(),
                  key: documentSnapshot.id,
                });
              });
              this.setState({ridersList: riders});

              console.log('riders4: ', riders);
            });
          let routeCoordinates = [];
          axios
            .get(
              `https://route.ls.hereapi.com/routing/7.2/calculateroute.json?apiKey=5fcoJoPAIOye99-ssHc6TIx73yOAhtWiU1_1p1461X4&waypoint0=geo!${lat},${long}&waypoint1=geo!${this.state.Tolat},${this.state.Tolong}&mode=fastest;car;traffic:disabled&legAttributes=shape`,
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
              console.log('routeCoordinates', routeCoordinates);
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
            })
            .catch(err => {
              console.log('here fron: ', err);
            });
        }
      })
      .catch(err => {
        console.log('currentPickup Region axios: ', err);
      });
  }

  currentDropoff() {
    console.log('Get current Location');
    const long = this.props.route.params.cLong;
    const lat = this.props.route.params.cLat;
    this.setState({isLoading: true, keyboard: false});

    axios
      .get(
        `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${lat}%2C${long}&apiKey=5fcoJoPAIOye99-ssHc6TIx73yOAhtWiU1_1p1461X4`,
      )

      .then(res => {
        const {flat, flong} = this.state;
        let from_lat = flat;
        let from_long = flong;
        let to_lat = lat;
        let to_long = long;
        // [125.53647997480391, 8.93336215559458]
        console.log('to_latcurrentDropoff: ', to_lat);
        console.log('to_longcurrentDropoff: ', to_long);
        let routeCoordinates = [];

        this.setState({
          billing_contextTo: this.props.route.params.context,
          Tolat: lat,
          Tolong: long,
          billing_provinceTo: res.data.items[0].address.county,
          billing_cityTo: res.data.items[0].address.city,
          billing_contextTo: res.data.items[0],
          billing_streetTo: res.data.items[0].title,
          billing_postalTo: res.data.items[0].address.postalCode,
          billing_barangayTo: res.data.items[0].address.district,
          billing_countryTo: res.data.items[0].address.countryName,
          flatTo: lat,
          flongTo: long,
          region: {
            latitude: lat,
            longitude: long,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          },
          toPlace: this.props.route.params.fromPlace,
          LocationDoneto: true,
          LocationDone: true,
          isLoading: false,
        });

        if (this.state.flat != undefined) {
          this.setState({isLoading: true});
          firestore()
            .collection('riders')
            .where('Account', '==', 'Foods')
            .where('status', '==', true)
            .where('wallet', '>', 0)
            .where('arrayofCity', 'array-contains-any', [
              res.data.items[0].address.city,
            ])

            .onSnapshot(QuerySnapshot => {
              const riders = [];

              QuerySnapshot.forEach(documentSnapshot => {
                riders.push({
                  ...documentSnapshot.data(),
                  key: documentSnapshot.id,
                });
              });
              this.setState({ridersList: riders});

              console.log('riders5: ', riders);
            });
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

              console.log(
                'summary:currentDropoff ',
                res.data.response.route[0].summary,
              );
              console.log('routeCoordinatescurrentDropoff', routeCoordinates);
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
            })
            .catch(err => {
              console.log('here drop offcurrentDropoff: ', err);
            });
        }
      })
      .catch(err => {
        this.setState({isLoading: false});

        Alert.alert('Error', 'Internet Connection is unstable');
        console.log('Region visibleAddressModalTo axios: ', err);
      });
  }

  SwitchLocation() {
    const DataValue = {
      billing_context:
        this.state.billing_contextTo == undefined
          ? null
          : this.state.billing_contextTo,
      billing_province:
        this.state.billing_provinceTo == undefined
          ? null
          : this.state.billing_provinceTo,
      billing_city:
        this.state.billing_cityTo == undefined
          ? null
          : this.state.billing_cityTo,
      billing_street:
        this.state.billing_streetTo == undefined
          ? null
          : this.state.billing_streetTo,
      billing_postal:
        this.state.billing_postalTo == undefined
          ? null
          : this.state.billing_postalTo,
      billing_barangay:
        this.state.billing_barangayTo == undefined
          ? null
          : this.state.billing_barangayTo,
      flat: this.state.Tolat == undefined ? null : this.state.Tolat,
      flong: this.state.Tolong == undefined ? null : this.state.Tolong,
      cLong: this.state.Tolong == undefined ? null : this.state.Tolong,
      cLat: this.state.Tolat == undefined ? null : this.state.Tolat,
      fromPlace: this.state.toPlace == undefined ? null : this.state.toPlace,
      x:
        this.state.flatTo == undefined
          ? null
          : {latitude: this.state.flatTo, longitude: this.state.flongTo},

      billing_contextTo:
        this.state.billing_context == undefined
          ? null
          : this.state.billing_context,
      Tolat: this.state.flat == undefined ? null : this.state.flat,
      Tolong: this.state.flong == undefined ? null : this.state.flong,
      billing_provinceTo:
        this.state.billing_province == undefined
          ? null
          : this.state.billing_province,
      billing_cityTo:
        this.state.billing_city == undefined ? null : this.state.billing_city,
      billing_streetTo:
        this.state.billing_street == undefined
          ? null
          : this.state.billing_street,
      billing_postalTo:
        this.state.billing_postal == undefined
          ? null
          : this.state.billing_postal,
      billing_barangayTo:
        this.state.billing_barangay == undefined
          ? null
          : this.state.billing_barangay,
      flatTo: this.state.flat == undefined ? null : this.state.flat,
      flongTo: this.state.flong == undefined ? null : this.state.flong,
      toPlace: this.state.fromPlace == undefined ? null : this.state.fromPlace,
    };

    console.log('DataValue: ', DataValue);
    this.setState(DataValue);
  }

  pushAItem() {
    let ItemList = this.state.ItemList;
    ItemList.push(this.state.pabiliItem);
    this.setState({ItemList: ItemList, pabiliItem: ''});
  }

  updateTextInput = (text, field) => {
    const state = this.state;
    state[field] = text;
    console.log('field: ', field);

    this.setState({ListValue: {...this.state.ListValue, [field]: text}});
  };

  onNameUpdate = (item, value) => {
    firestore()
      .collection('Pabili')
      .doc(item.key)
      .update({
        name: value,
      })
      .then(() => {
        console.log('User updated!');
      });
  };

  onQtyUpdate = (item, value) => {
    firestore()
      .collection('Pabili')
      .doc(item.key)
      .update({
        qty: parseInt(value),
      })
      .then(() => {
        console.log('User updated!');
      });
  };

  onUnitUpdate = (item, value) => {
    firestore()
      .collection('Pabili')
      .doc(item.key)
      .update({
        unit: value,
      })
      .then(() => {
        console.log('User updated!');
      });
  };

  async pushAItem() {
    // Create a new batch instance
    const batch = firestore().batch();

    this.state.ItemList.forEach(doc => {
      var docRef = firestore().collection('Pabili').doc(); //automatically generate unique id
      batch.set(docRef, doc);
    });

    return batch.commit();
  }

  addList() {
    firestore()
      .collection('Pabili')
      .add({
        name: 'Added Stack',
        qty: 0,
        unit: 'unit',
        uid: auth().currentUser.uid,
        timeStamp: moment().unix(),
      })
      .then(() => {
        console.log('User added!');
      });
  }

  addListBulk() {
    for (i = 0; i < 3; i++) {
      firestore()
        .collection('Pabili')
        .add({
          name: 'Added Stack',
          qty: 0,
          unit: 'unit',
          uid: auth().currentUser.uid,
          timeStamp: moment().unix(),
        })
        .then(() => {
          console.log('User added!');
        });
    }
  }

  StartImageRotationFunction() {
    this.Rotatevalue.setValue(0);
    Animated.timing(this.Rotatevalue, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: true, // Add this line
    }).start(() => this.StartImageRotationFunction());
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

    let distance =
      this.state.summary === undefined
        ? null
        : this.state.summary.distance / 1000;

    let newDistance = distance - this.state.PBasekm;
    let distanceAmount = newDistance * this.state.Psucceeding;
    const NewdistanceAmount = distanceAmount > 0 ? distanceAmount : 0;
    let amountpay = this.state.PbaseFare + NewdistanceAmount;

    let distanceAmountCity = newDistance * this.state.CityPsucceeding;
    const NewdistanceAmountCity =
      distanceAmountCity > 0 ? distanceAmountCity : 0;
    let amountpayCity = this.state.CityPbaseFare + NewdistanceAmountCity;

    let distanceAmountMetro = newDistance * this.state.MetroPsucceeding;
    const NewdistanceAmountMetro =
      distanceAmountMetro > 0 ? distanceAmountMetro : 0;
    let amountpayMetro = this.state.MetroPbaseFare + NewdistanceAmountMetro;

    const actualAmountPay =
      this.props.route.params.typeOfRate == 'Municipal Rate'
        ? amountpay
        : this.props.route.params.typeOfRate == 'City Rate'
        ? amountpayCity
        : amountpayMetro;
    const typeOfRate = this.props.route.params.typeOfRate;
    // console.log('newDistance: ', newDistance);
    // console.log('actualAmountPay: ', actualAmountPay);
    //  console.log('distanceAmountCity: ', distanceAmountCity);

    //console.log('pabiliItem: ', this.state.pabiliItem);
    //console.log('this.state.ItemList:', this.state.ItemList)

    console.log('ridersList: ', this.state.ridersList);
    console.log('billing_city View: ', this.state.billing_city);
    console.log('billing_cityTo View: ', this.state.billing_cityTo);

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
        </HStack>
      </HStack>
      </View>
          <Loader loading={this.state.loading} trans={trans} />
          <Modal isVisible={this.state.listModal} useNativeDriver={true}>
            <View
              style={{
                position: 'absolute',
                width: Dimensions.get('window').width,
                height: Dimensions.get('window').height,
                marginLeft: -20,
                backgroundColor: 'white',
              }}>
              {this.state.pabiliList.length == 0 ? null : (
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
                      padding: 5,
                    }}>
                    <Text
                      style={{
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontSize: SCREEN_HEIGHT < 767 ? 15 : 18,
                      }}>
                      Stack
                    </Text>
                  </View>
                </View>
              )}

              {this.state.pabiliList.length == 0 ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 10,
                  }}>
                  <Button
                    onPress={() => this.addListBulk()}
                    success
                    bordered
                    rounded
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
                      Add Item
                    </Text>
                  </Button>
                </View>
              ) : (
                <FlatList
                  style={{marginTop: this.state.keyboard == true ? 100 : 0}}
                  data={this.state.pabiliList}
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
                          <Input
                            onSubmitEditing={e =>
                              this.onNameUpdate(item, e.nativeEvent.text)
                            }
                            placeholder={item.name}
                            onFocus={() => this.setState({keyboard: true})}
                            onBlur={() => this.setState({keyboard: false})}
                          />
                        </Box>
                      </HStack>
                    );
                  }}
                  keyExtractor={item => item.id}
                  ListFooterComponent={() => (
                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: 10,
                      }}>
                      <Button
                        onPress={() => this.addList()}
                        success
                        bordered
                        rounded
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
                          +
                        </Text>
                      </Button>
                    </View>
                  )}
                />
              )}
              <Button
                style={{
                  alignSelf: 'center',
                  backgroundColor: '#019fe8',
                  width: '100%',
                  alignContent: 'center',
                }}
                onPress={() =>
                  this.setState({listModal: false, VisibleAddInfo: true})
                }>
                <Text
                  style={{color: 'white', width: '100%', textAlign: 'center'}}>
                  Proceed
                </Text>
              </Button>
            </View>
          </Modal>
          <Modal
            isVisible={this.state.visibleModalPickup}
            useNativeDriver={true}
            onBackdropPress={() =>
              this.setState({
                visibleModalPickup: false,
                visibleAddressModal: false,
                visibleAddressModalPin: false,
              })
            }
            transparent={true}>
            <View
              style={{
                position: 'absolute',
                width: Dimensions.get('window').width,
                height: Dimensions.get('window').height,
                marginLeft: -20,
              }}>
              <MapboxGL.MapView
                style={{flex: 1}}
                onPress={e => {
                  this.state.visibleAddressModal == true
                    ? this.onRegionChange(e.geometry.coordinates)
                    : this.state.visibleAddressModalTo == true
                    ? this.onRegionChange(e.geometry.coordinates)
                    : null;
                }}
                //onRegionWillChange={this.onRegionWillChange}
                //        onRegionIsChanging={this.onRegionIsChanging}
                attributionEnabled={false}
                logoEnabled={false}>
                <MapboxGL.Camera
                  centerCoordinate={[
                    this.props.route.params.cLong,
                    this.props.route.params.cLat,
                  ]}
                  zoomLevel={15}
                  followUserMode={'normal'}
                />

                <MapboxGL.UserLocation
                  visible={true}
                  showsUserHeadingIndicator={true}
                />

                {this.state.x == undefined ? (
                  <MapboxGL.PointAnnotation
                    coordinate={[this.state.flong, this.state.flat]}
                    onSelected={() => console.log('Marker Selected')}
                  />
                ) : (
                  <MapboxGL.PointAnnotation
                    coordinate={[this.state.x.longitude, this.state.x.latitude]}
                    onSelected={() => console.log('Marker Selected')}
                  />
                )}
              </MapboxGL.MapView>

              <Box
                style={{
                  left: 0,
                  top: this.state.keyboard == true ? 130 : 0,
                  position: 'absolute',
                  width: SCREEN_WIDTH / 1.01,
                }}>
                <View
                  style={{
                    backgroundColor:'white',
                    borderWidth: 1.5,
                    borderColor: 'rgba(238, 238, 238, 1)',
                    borderRadius: 20,
                    flexDirection: 'row',
                    margin: 5,
                  }}
                  onPress={() =>
                    this.setState({
                      visibleAddressModal: true,
                      visibleAddressModalto: false,
                    })
                  }>
                  <MaterialIcons
                    name="arrow-back"
                    size={25}
                    color="black"
                    onPress={() =>
                      this.setState({
                        visibleModalPickup: false,
                        visibleAddressModal: false,
                        visibleAddressModalPin: false,
                      })
                    }
                    style={{width: 40, top: 8}}
                  />

                  {!this.state.loading && (
                    <View
                      regular
                      style={{
                        height: 40,
                        flexDirection: 'row',
                        width: SCREEN_WIDTH / 1.2,
                      }}>
                      <Input
                        value={this.state.fromPlace}
                        placeholder="Choose Drop-off location"
                        style={{fontSize: 17,width: SCREEN_WIDTH / 1.3,}}
                        onChangeText={text =>
                          this.getLocationType(text, 'fromPlace')
                        }
                        onFocus={() =>
                          this.setState({
                            visibleAddressModal: true,
                            visibleAddressModalto: false,
                            keyboard: true,
                            LocationDone: false,
                          })
                        }
                        onBlur={() => this.setState({keyboard: false})}
                      />
                      <FontAwesome
                        name={'times-circle-o'}
                        style={{marginRight: 5, top: 10}}
                        size={20}
                        onPress={() =>
                          this.setState({fromPlace: '', x: undefined})
                        }
                      />
                    </View>
                  )}
                </View>
             

                {this.state.LocationDone == false ? (
                  <View>
                    <FlatList
                    style={{backgroundColor:'white'}}
                      ListHeaderComponent={
                        this.state.fromPlace ==
                        this.props.route.params.fromPlace ? null : this.state
                            .toPlace ==
                          this.props.route.params.fromPlace ? null : (
                          <View style={{padding: 10, marginLeft: 50}}>
                            <TouchableOpacity
                              style={{flexDirection: 'row'}}
                              onPress={() => this.currentPickup()}>
                              <MaterialIcons
                                name="my-location"
                                size={20}
                                color="black"
                              />
                              <Text style={{paddingLeft: 10}}>
                                Your location
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )
                      }
                      data={this.state.searchResult}
                      renderItem={({item}) => (
                        <View style={{padding: 10, marginLeft: 50,}}>
                          <TouchableOpacity
                            onPress={() => {
                              const region = {
                                latitude: item.position.lat,
                                latitudeDelta: 0.0999998484542477,
                                longitude: item.position.lng,
                                longitudeDelta: 0.11949475854635239,
                              };
                              console.log('region: ', region);

                              const {Tolat, Tolong} = this.state;
                              let from_lat = Tolat;
                              let from_long = Tolong;
                              let to_lat = item.position.lat;
                              let to_long = item.position.lng;
                              console.log('to_lat: ', to_lat);
                              console.log('to_long: ', to_long);
                              let routeCoordinates = [];

                              const SetData = {
                                flat: item.position.lat,
                                flong: item.position.lng,
                                cLat: item.position.lat,
                                cLong: item.position.lng,

                                billing_province: item.address.county,
                                billing_city: item.address.city,
                                billing_context: item,
                                billing_street:
                                  item.address.street == undefined
                                    ? ''
                                    : item.address.street,
                                billing_postal: item.address.postalCode,
                                billing_barangay: item.address.district,
                                region: {
                                  latitude: item.position.lat,
                                  longitude: item.position.lng,
                                  latitudeDelta: 0.1,
                                  longitudeDelta: 0.1,
                                },
                                showfromBotton: true,
                                fromPlace: item.address.label,
                                x: {
                                  latitude: item.position.lat,
                                  longitude: item.position.lng,
                                },
                                isLoading: false,
                                LocationDone: true,
                              };
                              console.log('SetData: ', SetData);
                              this.setState(SetData);

                              const newDocumentID = firestore()
                                .collection('users')
                                .doc(auth().currentUser.uid)
                                .collection('history')
                                .doc().id;
                              firestore()
                                .collection('users')
                                .doc(auth().currentUser.uid)
                                .collection('history')
                                .doc(newDocumentID)
                                .set({
                                  fromPlace: item.address.label,
                                  id: newDocumentID,
                                  region: {
                                    latitude: item.position.lat,
                                    longitude: item.position.lng,
                                    latitudeDelta: 0.1,
                                    longitudeDelta: 0.1,
                                  },
                                  billing_province: item.address.county,
                                  billing_city: item.address.city,
                                  billing_context: item,
                                  billing_street:
                                    item.address.street == undefined
                                      ? ''
                                      : item.address.street,
                                  billing_postal: item.address.postalCode,
                                  billing_barangay: item.address.district,
                                  rlat: item.position.lat,
                                  rlong: item.position.lng,
                                  context: item,
                                  place_name: item.address.label,
                                });

                              if (this.state.Tolong != undefined) {
                                firestore()
                                  .collection('riders')
                                  .where('Account', '==', 'Foods')
                                  .where('status', '==', true)
                                  .where('wallet', '>', 0)
                                  .where('arrayofCity', 'array-contains-any', [
                                    this.state.billing_cityTo,
                                  ])

                                  .onSnapshot(QuerySnapshot => {
                                    const riders = [];

                                    QuerySnapshot.forEach(documentSnapshot => {
                                      riders.push({
                                        ...documentSnapshot.data(),
                                        key: documentSnapshot.id,
                                      });
                                    });
                                    this.setState({ridersList: riders});

                                    console.log('riders6: ', riders);
                                  });
                                axios
                                  .get(
                                    `https://route.ls.hereapi.com/routing/7.2/calculateroute.json?apiKey=5fcoJoPAIOye99-ssHc6TIx73yOAhtWiU1_1p1461X4&waypoint0=geo!${from_lat},${from_long}&waypoint1=geo!${to_lat},${to_long}&mode=fastest;car;traffic:disabled&legAttributes=shape`,
                                  )
                                  .then(res => {
                                    res.data.response.route[0].leg[0].shape.map(
                                      m => {
                                        // here we are getting latitude and longitude in seperate variables because HERE sends it together, but we
                                        // need it seperate for <Polyline/>
                                        let latlong = m.split(',');
                                        let latitude = parseFloat(latlong[0]);
                                        let longitude = parseFloat(latlong[1]);
                                        routeCoordinates.push([
                                          longitude,
                                          latitude,
                                        ]);
                                      },
                                    );

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

                                      summary:
                                        res.data.response.route[0].summary,
                                    });

                                    //console.log('sum: ', res.data.response.route[0].summary);
                                  })
                                  .catch(err => {
                                    // console.log(err)
                                  });
                              }
                            }}
                            style={{
                              borderBottomWidth: 1,
                              borderBottomColor: '#bcbdbf',
                            }}>
                            <Text style={{fontSize: 18}}>{item.title}</Text>
                            <Text style={{fontWeight: 'bold', fontSize: 15}}>
                              {Math.round((item.distance / 1000) * 10) / 10}km{' '}
                              <Text
                                style={{fontWeight: 'normal', fontSize: 14}}>
                                {item.address.street == undefined
                                  ? ''
                                  : item.address.street}
                                , {item.address.district}, {item.address.city},{' '}
                                {item.address.countryName}
                              </Text>
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                      keyExtractor={item => item.id}
                    />

                    <FlatList
                      data={this.state.history}
                      renderItem={({item}) => (
                        <View style={{padding: 10, marginLeft: 50}}>
                          <TouchableOpacity
                            onLongPress={() => this.deleteHistory(item.id)}
                            onPress={() => {
                              let str = item.fromPlace;

                              const Newprovince = item.billing_province;
                              const region = {
                                latitude: item.rlat,
                                latitudeDelta: 0.0999998484542477,
                                longitude: item.rlong,
                                longitudeDelta: 0.11949475854635239,
                              };

                              const {Tolat, Tolong} = this.state;
                              let from_lat = Tolat;
                              let from_long = Tolong;
                              let to_lat = item.rlat;
                              let to_long = item.rlong;
                              console.log('to_lat: ', to_lat);
                              console.log('to_long: ', to_long);
                              let routeCoordinates = [];

                              this.setState({
                                flat: item.rlat,
                                flong: item.rlong,
                                cLat: item.rlat,
                                cLong: item.rlong,

                                billing_province: Newprovince,
                                billing_city: item.billing_city,
                                billing_context: item.context,
                                billing_street: item.billing_street,
                                billing_postal: item.billing_postal,
                                billing_barangay: item.billing_barangay,
                                region: {
                                  latitude: item.rlat,
                                  longitude: item.rlong,
                                  latitudeDelta: 0.1,
                                  longitudeDelta: 0.1,
                                },
                                showfromBotton: true,
                                fromPlace: item.fromPlace,
                                x: {latitude: item.rlat, longitude: item.rlong},
                                isLoading: false,
                                LocationDone: true,
                              });

                              if (this.state.Tolong != undefined) {
                                firestore()
                                  .collection('riders')
                                  .where('Account', '==', 'Foods')
                                  .where('status', '==', true)
                                  .where('wallet', '>', 0)
                                  .where('arrayofCity', 'array-contains-any', [
                                    this.state.billing_cityTo,
                                  ])

                                  .onSnapshot(QuerySnapshot => {
                                    const riders = [];

                                    QuerySnapshot.forEach(documentSnapshot => {
                                      riders.push({
                                        ...documentSnapshot.data(),
                                        key: documentSnapshot.id,
                                      });
                                    });
                                    this.setState({ridersList: riders});

                                    console.log('riders7: ', riders);
                                  });
                                axios
                                  .get(
                                    `https://route.ls.hereapi.com/routing/7.2/calculateroute.json?apiKey=5fcoJoPAIOye99-ssHc6TIx73yOAhtWiU1_1p1461X4&waypoint0=geo!${from_lat},${from_long}&waypoint1=geo!${to_lat},${to_long}&mode=fastest;car;traffic:disabled&legAttributes=shape`,
                                  )
                                  .then(res => {
                                    res.data.response.route[0].leg[0].shape.map(
                                      m => {
                                        // here we are getting latitude and longitude in seperate variables because HERE sends it together, but we
                                        // need it seperate for <Polyline/>
                                        let latlong = m.split(',');
                                        let latitude = parseFloat(latlong[0]);
                                        let longitude = parseFloat(latlong[1]);
                                        routeCoordinates.push([
                                          longitude,
                                          latitude,
                                        ]);
                                      },
                                    );

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

                                      summary:
                                        res.data.response.route[0].summary,
                                    });

                                    //console.log('sum: ', res.data.response.route[0].summary);
                                  })
                                  .catch(err => {
                                    // console.log(err)
                                  });
                              }
                            }}>
                            <Text style={{fontSize: 17}}>
                              {item.place_name}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                      keyExtractor={item => item.id}
                    />
                  </View>
                ) : null}
              </Box>
              <View style={{height: 40, alignItems: 'center'}}>
                <TouchableOpacity
                  style={[
                    styles.centerElement,
                    {
                      backgroundColor: '#019fe8',
                      width: SCREEN_WIDTH,
                      height: 40,
                      borderRadius: 5,
                      padding: 10,
                    },
                  ]}
                  onPress={() =>
                    this.setState({
                      visibleModalPickup: false,
                      visibleAddressModal: false,
                      visibleAddressModalPin: false,
                    })
                  }>
                  <Text style={{color: '#ffffff'}}>DONE</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          <Modal
            isVisible={this.state.visibleModalDropoff}
            useNativeDriver={true}
            onBackdropPress={() => this.setState({visibleModalDropoff: false})}
            transparent={true}>
            <View
              style={{
                position: 'absolute',
                width: Dimensions.get('window').width,
                height: Dimensions.get('window').height,
                marginLeft: -20,
              }}>
              <MapboxGL.MapView
                style={{flex: 1}}
                onPress={e => {
                  this.state.visibleAddressModal == true
                    ? this.onRegionChange(e.geometry.coordinates)
                    : this.state.visibleAddressModalTo == true
                    ? this.onRegionChange(e.geometry.coordinates)
                    : null;
                }}
                //onRegionWillChange={this.onRegionWillChange}
                //        onRegionIsChanging={this.onRegionIsChanging}
                attributionEnabled={false}
                logoEnabled={false}>
                <MapboxGL.Camera
                  centerCoordinate={
                    this.state.Tolat == undefined
                      ? [
                          this.props.route.params.cLong,
                          this.props.route.params.cLat,
                        ]
                      : [this.state.Tolong, this.state.Tolat]
                  }
                  zoomLevel={15}
                  followUserMode={'normal'}
                />

                <MapboxGL.UserLocation
                  visible={true}
                  showsUserHeadingIndicator={true}
                />

                {this.state.Tolat == undefined ? null : (
                  <MapboxGL.PointAnnotation
                    coordinate={[this.state.Tolong, this.state.Tolat]}
                    onSelected={() => console.log('Marker Selected')}
                  />
                )}
              </MapboxGL.MapView>

              <Box
                style={{
                  left: 0,
                  top: this.state.keyboard == true ? 130 : 0,
                  position: 'absolute',
                  width: SCREEN_WIDTH / 1.01,
                }}>
                <View
                  style={{
                    backgroundColor:'white',
                    borderWidth: 1.5,
                    borderColor: 'rgba(238, 238, 238, 1)',
                    borderRadius: 20,
                    flexDirection: 'row',
                    margin: 5,
                  }}
                  onPress={() =>
                    this.setState({
                      visibleAddressModal: true,
                      visibleAddressModalTo: false,
                    })
                  }>
                  <MaterialIcons
                    name="arrow-back"
                    size={25}
                    color="black"
                    onPress={() => this.setState({visibleModalDropoff: false})}
                    style={{width: 40, top: 8}}
                  />

                  {!this.state.loading && (
                    <View
                      regular
                      style={{
                        height: 40,
                        flexDirection: 'row',
                        width: SCREEN_WIDTH / 1.2,
                      }}>
                      <Input
                        value={this.state.toPlace}
                        placeholder="Choose Pick-up location"
                        style={{fontSize: 17,width: SCREEN_WIDTH / 1.3,}}
                        onChangeText={text =>
                          this.getLocationTypeto(text, 'toPlace')
                        }
                        onFocus={() =>
                          this.setState({
                            visibleAddressModalTo: true,
                            visibleAddressModal: false,
                            keyboard: true,
                            LocationDoneto: false,
                          })
                        }
                        onBlur={() => this.setState({keyboard: false})}
                      />
                      <FontAwesome
                        name={'times-circle-o'}
                        style={{marginRight: 5, top: 10}}
                        size={20}
                        onPress={() =>
                          this.setState({toPlace: '', Tolat: undefined})
                        }
                      />
                    </View>
                  )}
                </View>
             

                {this.state.LocationDoneto == false ? (
                  <View>
                    <FlatList
                    style={{backgroundColor:'white'}}
                      ListHeaderComponent={
                        this.state.toPlace ==
                        this.props.route.params.fromPlace ? null : this.state
                            .fromPlace ==
                          this.props.route.params.fromPlace ? null : (
                          <View style={{padding: 10, marginLeft: 50}}>
                            <TouchableOpacity
                              style={{flexDirection: 'row'}}
                              onPress={() => this.currentDropoff()}>
                              <MaterialIcons
                                name="my-location"
                                size={20}
                                color="black"
                                onPress={() => this.currentDropoff()}
                              />
                              <Text style={{paddingLeft: 10}}>
                                Your location
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )
                      }
                      data={this.state.searchResultto}
                      renderItem={({item}) => (
                        <View style={{padding: 10, marginLeft: 50}}>
                          <TouchableOpacity
                            onPress={() => {
                              this.setState({isLoading: true});

                              const region = {
                                latitude: item.position.lat,
                                latitudeDelta: 0.0999998484542477,
                                longitude: item.position.lng,
                                longitudeDelta: 0.11949475854635239,
                              };
                              console.log('region: ', region);

                              const {flat, flong} = this.state;
                              let from_lat = flat;
                              let from_long = flong;
                              let to_lat = item.position.lat;
                              let to_long = item.position.lng;
                              console.log('to_lat: ', to_lat);
                              console.log('to_long: ', to_long);
                              let routeCoordinates = [];

                              this.setState({
                                Tolat: item.position.lat,
                                Tolong: item.position.lng,

                                billing_provinceTo: item.address.county,
                                billing_cityTo: item.address.city,
                                billing_contextTo: item,
                                billing_streetTo:
                                  item.address.street == undefined
                                    ? ''
                                    : item.address.street,
                                billing_postalTo: item.address.postalCode,
                                billing_barangayTo: item.address.district,
                                flatTo: item.position.lat,
                                flongTo: item.position.lng,
                                region: {
                                  latitude: item.position.lat,
                                  longitude: item.position.lng,
                                  latitudeDelta: 0.1,
                                  longitudeDelta: 0.1,
                                },
                                toPlace: item.address.label,
                                LocationDoneto: true,
                                visibleAddressModalTo: false,
                                isLoading: false,
                              });
                              const newDocumentID = firestore()
                                .collection('users')
                                .doc(auth().currentUser.uid)
                                .collection('history')
                                .doc().id;
                              firestore()
                                .collection('users')
                                .doc(auth().currentUser.uid)
                                .collection('history')
                                .doc(newDocumentID)
                                .set({
                                  fromPlace: item.address.label,
                                  id: newDocumentID,
                                  region: {
                                    latitude: item.position.lat,
                                    longitude: item.position.lng,
                                    latitudeDelta: 0.1,
                                    longitudeDelta: 0.1,
                                  },
                                  billing_province: item.address.county,
                                  billing_city: item.address.city,
                                  billing_context: item,
                                  billing_street:
                                    item.address.street == undefined
                                      ? ''
                                      : item.address.street,
                                  billing_postal: item.address.postalCode,
                                  billing_barangay: item.address.district,
                                  rlat: item.position.lat,
                                  rlong: item.position.lng,
                                  context: item,
                                  place_name: item.address.label,
                                });
                              if (this.state.flat != undefined) {
                                firestore()
                                  .collection('riders')
                                  .where('Account', '==', 'Foods')
                                  .where('status', '==', true)
                                  .where('wallet', '>', 0)
                                  .where('arrayofCity', 'array-contains-any', [
                                    this.state.billing_cityTo,
                                  ])

                                  .onSnapshot(QuerySnapshot => {
                                    const riders = [];

                                    QuerySnapshot.forEach(documentSnapshot => {
                                      riders.push({
                                        ...documentSnapshot.data(),
                                        key: documentSnapshot.id,
                                      });
                                    });
                                    this.setState({ridersList: riders});

                                    console.log('riders8: ', riders);
                                  });
                                axios
                                  .get(
                                    `https://route.ls.hereapi.com/routing/7.2/calculateroute.json?apiKey=5fcoJoPAIOye99-ssHc6TIx73yOAhtWiU1_1p1461X4&waypoint0=geo!${from_lat},${from_long}&waypoint1=geo!${to_lat},${to_long}&mode=fastest;car;traffic:disabled&legAttributes=shape`,
                                  )
                                  .then(res => {
                                    res.data.response.route[0].leg[0].shape.map(
                                      m => {
                                        // here we are getting latitude and longitude in seperate variables because HERE sends it together, but we
                                        // need it seperate for <Polyline/>
                                        let latlong = m.split(',');
                                        let latitude = parseFloat(latlong[0]);
                                        let longitude = parseFloat(latlong[1]);
                                        routeCoordinates.push([
                                          longitude,
                                          latitude,
                                        ]);
                                      },
                                    );

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

                                      summary:
                                        res.data.response.route[0].summary,
                                    });

                                    //console.log('sum: ', res.data.response.route[0].summary);
                                  })
                                  .catch(err => {
                                    // console.log(err)
                                  });
                              }
                            }}
                            style={{
                              borderBottomWidth: 1,
                              borderBottomColor: '#bcbdbf',
                            }}>
                            <Text style={{fontSize: 18}}>{item.title}</Text>
                            <Text style={{fontWeight: 'bold', fontSize: 15}}>
                              {Math.round((item.distance / 1000) * 10) / 10}km{' '}
                              <Text
                                style={{fontWeight: 'normal', fontSize: 14}}>
                                {item.address.street}, {item.address.district},{' '}
                                {item.address.city}, {item.address.countryName}
                              </Text>
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                      keyExtractor={item => item.id}
                    />

                    <FlatList
                      data={this.state.history}
                      renderItem={({item}) => (
                        <View style={{padding: 10, marginLeft: 50}}>
                          <TouchableOpacity
                            onLongPress={() => this.deleteHistory(item.id)}
                            onPress={() => {
                              this.setState({isLoading: true});
                              let str = item.fromPlace;

                              const Newprovince = item.billing_province;
                              const region = {
                                latitude: item.rlat,
                                latitudeDelta: 0.0999998484542477,
                                longitude: item.rlong,
                                longitudeDelta: 0.11949475854635239,
                              };

                              const {flat, flong} = this.state;
                              let from_lat = flat;
                              let from_long = flong;
                              let to_lat = item.rlat;
                              let to_long = item.rlong;
                              console.log('to_lat: ', to_lat);
                              console.log('to_long: ', to_long);
                              let routeCoordinates = [];

                              this.setState({
                                Tolat: item.rlat,
                                Tolong: item.rlong,

                                billing_provinceTo: Newprovince.toLowerCase(),
                                billing_cityTo: item.billing_city,
                                billing_contextTo: item.context,
                                billing_streetTo: item.billing_street,
                                billing_postalTo: item.billing_postal,
                                billing_barangayTo: item.billing_barangay,

                                flatTo: item.rlat,
                                flongTo: item.rlong,
                                region: {
                                  latitude: item.rlat,
                                  longitude: item.rlong,
                                  latitudeDelta: 0.1,
                                  longitudeDelta: 0.1,
                                },
                                toPlace: item.fromPlace,
                                LocationDoneto: true,
                                visibleAddressModalTo: false,
                                isLoading: false,
                              });

                              if (this.state.flat != undefined) {
                                firestore()
                                  .collection('riders')
                                  .where('Account', '==', 'Foods')
                                  .where('status', '==', true)
                                  .where('wallet', '>', 0)
                                  .where('arrayofCity', 'array-contains-any', [
                                    this.state.billing_cityTo,
                                  ])

                                  .onSnapshot(QuerySnapshot => {
                                    const riders = [];

                                    QuerySnapshot.forEach(documentSnapshot => {
                                      riders.push({
                                        ...documentSnapshot.data(),
                                        key: documentSnapshot.id,
                                      });
                                    });
                                    this.setState({ridersList: riders});

                                    console.log('riders9: ', riders);
                                  });
                                axios
                                  .get(
                                    `https://route.ls.hereapi.com/routing/7.2/calculateroute.json?apiKey=5fcoJoPAIOye99-ssHc6TIx73yOAhtWiU1_1p1461X4&waypoint0=geo!${from_lat},${from_long}&waypoint1=geo!${to_lat},${to_long}&mode=fastest;car;traffic:disabled&legAttributes=shape`,
                                  )
                                  .then(res => {
                                    res.data.response.route[0].leg[0].shape.map(
                                      m => {
                                        // here we are getting latitude and longitude in seperate variables because HERE sends it together, but we
                                        // need it seperate for <Polyline/>
                                        let latlong = m.split(',');
                                        let latitude = parseFloat(latlong[0]);
                                        let longitude = parseFloat(latlong[1]);
                                        routeCoordinates.push([
                                          longitude,
                                          latitude,
                                        ]);
                                      },
                                    );

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

                                      summary:
                                        res.data.response.route[0].summary,
                                    });

                                    //console.log('sum: ', res.data.response.route[0].summary);
                                  })
                                  .catch(err => {
                                    // console.log(err)
                                  });
                              }
                            }}>
                            <Text style={{fontSize: 17}}>
                              {item.place_name}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                      keyExtractor={item => item.id}
                    />
                  </View>
                ) : null}
              </Box>
              {this.state.toPlace == '' ? null : (
                <View style={{height: 40, alignItems: 'center'}}>
                  <TouchableOpacity
                    style={[
                      styles.centerElement,
                      {
                        backgroundColor: '#019fe8',
                        width: SCREEN_WIDTH,
                        height: 40,
                        borderRadius: 5,
                        padding: 10,
                      },
                    ]}
                    onPress={() => this.setState({visibleModalDropoff: false})}>
                    <Text style={{color: '#ffffff'}}>DONE</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </Modal>

          <Loader loading={this.state.isLoading} trans={trans} />
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
                style={{flex: 1}}
                onPress={e => {
                  this.state.visibleAddressModal == true
                    ? this.onRegionChange(e.geometry.coordinates)
                    : this.state.visibleAddressModalTo == true
                    ? this.onRegionChange(e.geometry.coordinates)
                    : null;
                }}
                //onRegionWillChange={this.onRegionWillChange}
                //        onRegionIsChanging={this.onRegionIsChanging}
                attributionEnabled={false}
                logoEnabled={false}>
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
                />
                {console.log('ridersList: ', this.state.ridersList.length)}
                {this.state.ridersList && this.state.ridersList.length > 0
                  ? this.state.ridersList.map((item, index) =>
                      item.Lat == '' ? null : (
                        <MapboxGL.PointAnnotation
                          coordinate={[item.Long, item.Lat]}>
                          {console.log('item.Lat: ', item.Long, item.Lat)}
                          <View
                            style={{
                              height: 35,
                              width: 35,
                              backgroundColor:
                                item.busyStatus == undefined
                                  ? '#10823c'
                                  : item.busyStatus == false
                                  ? '#10823c'
                                  : 'red',
                              borderRadius: 50,
                              borderColor: '#fff',
                              borderWidth: 3,
                            }}>
                            <MaterialCommunityIcons
                              name="racing-helmet"
                              size={20}
                              color="white"
                              style={{
                                justifyContent: 'center',
                                alignSelf: 'center',
                                padding: 5,
                              }}
                            />
                          </View>
                        </MapboxGL.PointAnnotation>
                      ),
                    )
                  : null}
                {this.state.x == null ? null : this.state.x == undefined ? (
                  <MapboxGL.PointAnnotation
                    coordinate={[this.state.flong, this.state.flat]}
                    onSelected={() => console.log('Marker Selected')}
                  />
                ) : (
                  <MapboxGL.PointAnnotation
                    coordinate={[this.state.x.longitude, this.state.x.latitude]}
                    onSelected={() => console.log('Marker Selected')}
                  />
                )}
                {this.state.Tolat == undefined ? null : (
                  <MapboxGL.PointAnnotation
                    coordinate={[this.state.Tolong, this.state.Tolat]}
                    onSelected={() => console.log('Marker Selected')}
                  />
                )}
              </MapboxGL.MapView>

              <Box></Box>

              <Box
                style={{
                  left: 0,
                  top: 0,
                  position: 'absolute',
                  width: SCREEN_WIDTH,
                  backgroundColor:'white',
                  paddingLeft:20,
                  paddingTop:20,
                  paddingBottom:20
                }}>
                <HStack
                style={{marginBottom:10}}
                  onPress={() =>
                    this.setState({
                      visibleAddressModal: true,
                      visibleAddressModalto: false,
                    })
                  }>
                  <View
                    style={{
                      marginRight: 5,
                      marginLeft: -15,
                      flexDirection: 'column',
                    }}>
                    <FontAwesome
                      name={'dot-circle-o'}
                      color={'green'}
                      size={22}
                      style={{textAlign: 'center'}}
                    />
                    <Text style={{fontSize: 13, fontWeight: 'bold'}}>
                      Pick up
                    </Text>
                  </View>
                  <View style={{flexDirection: 'column'}}>
                    {/*
                    <Text style={{fontWeight: 'normal', fontSize: 17, color: 'green'}}>Pickup location </Text>
   */}
                    {!this.state.loading && (
                      <View
                        regular
                        style={{
                          borderWidth: 1.5,
                          borderColor: 'rgba(238, 238, 238, 1)',
                          borderRadius: 5,
                          width: SCREEN_WIDTH / 1.29,
                          padding: 5,
                        }}>
                        <TouchableWithoutFeedback
                          style={{width: SCREEN_WIDTH / 1.02}}
                          onPress={() =>
                            this.setState({
                              visibleModalDropoff: true,
                              visibleAddressModalTo: true,
                              visibleAddressModal: false,
                              visibleAddressModalToPin: true,
                            })
                          }>
                          <Text style={{fontSize: 17}}>
                            {this.state.toPlace == ''
                              ? 'Enter Pick-up Location Here'
                              : this.state.toPlace ==
                                this.props.route.params.fromPlace
                              ? 'Your Location'
                              : this.state.toPlace}
                          </Text>
                        </TouchableWithoutFeedback>
                      </View>
                    )}
                  </View>
                </HStack>

                <HStack
                  onPress={() =>
                    this.setState({
                      visibleAddressModalTo: true,
                      visibleAddressModal: false,
                    })
                  }>
                  <View
                    style={{
                      marginRight: 4,
                      marginLeft: -15,
                      flexDirection: 'column',
                    }}>
                    <FontAwesome
                      name={'map-marker'}
                      color={'tomato'}
                      size={22}
                      style={{textAlign: 'center'}}
                    />
                    <Text style={{fontSize: 13, fontWeight: 'bold'}}>
                      Drop off
                    </Text>
                  </View>
                  <View style={{flexDirection: 'row'}}>
                    {/*
                    <Text style={{fontWeight: 'normal', fontSize: 17, color: 'blue',marginTop: -20}}>Drop-off location</Text>
  */}
                    {!this.state.loading && (
                      <View
                        regular
                        style={{
                          borderWidth: 1,
                          borderColor: 'rgba(238, 238, 238, 1)',
                          borderRadius: 5,
                          width: SCREEN_WIDTH / 1.29,
                          padding: 5,
                        }}>
                        <TouchableWithoutFeedback
                          style={{width: SCREEN_WIDTH / 1.02}}
                          onPress={() =>
                            this.setState({
                              visibleModalPickup: true,
                              visibleAddressModalPin: true,
                            })
                          }>
                          <Text style={{fontSize: 17}}>
                            {this.state.fromPlace == ''
                              ? 'Enter Drop-off Location Here'
                              : this.state.fromPlace ==
                                this.props.route.params.fromPlace
                              ? 'Your Location'
                              : this.state.fromPlace}
                          </Text>
                        </TouchableWithoutFeedback>
                      </View>
                    )}
                    <MaterialIcons
                      name="swap-vert"
                      size={30}
                      onPress={() => this.SwitchLocation()}
                      style={{marginTop: 7}}
                    />
                  </View>
                </HStack>
              </Box>
            </View>
          </View>
          <View>
            {this.state.summary === undefined ? null : parseFloat(
                this.state.summary.distance / 1000,
              ) > 85 ? (
              <View
                style={{height: 40, alignItems: 'center', marginBottom: 10}}>
                <TouchableOpacity
                  style={[
                    styles.centerElement,
                    {
                      backgroundColor: 'gray',
                      width: SCREEN_WIDTH - 10,
                      height: 40,
                      borderRadius: 5,
                      padding: 10,
                    },
                  ]}>
                  <Text style={{color: '#ffffff'}}>
                    {'Distance is more than 85km '}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View
                style={{height: 40, alignItems: 'center', marginBottom: 10,marginTop:SCREEN_HEIGHT/1.2}}>
                <TouchableOpacity
                  style={[
                    styles.centerElement,
                    {
                      backgroundColor: '#019fe8',
                      width: SCREEN_WIDTH - 10,
                      height: 40,
                      borderRadius: 5,
                      padding: 10,
                    },
                  ]}
                  onPress={() => {
                    this.state.uid == null
                      ? this.props.navigation.navigate('Login')
                      : Alert.alert(
                          'From: ' + this.state.fromPlace,
                          'To: ' + this.state.toPlace,
                          [
                            {
                              text: 'Cancel',
                              onPress: () => console.log('Cancel Pressed'),
                              style: 'cancel',
                            },
                            /*  { text: "Proceed with VStack", onPress: () =>this.setState({listModal: true}) },*/
                            {
                              text: 'Proceed',
                              onPress: () =>
                                this.setState({VisibleAddInfo: true}),
                            },
                          ],
                        );
                  }}>
                  <Text style={{color: '#ffffff'}}>
                    {this.state.uid == null
                      ? 'Log in to Continue'
                      : 'Book Now  ' +
                        this.props.route.params.currency +
                        ' ' +
                        Math.round((actualAmountPay * 10) / 10)}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <Modal
            isVisible={this.state.VisibleAddInfo}
            animationInTiming={700}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            animationOutTiming={700}
            useNativeDriver={true}
            onBackButtonPress={() => this.setState({VisibleAddInfo: false})}
            onBackdropPress={() => this.setState({VisibleAddInfo: false})}
            transparent={true}>
            <Box
              style={{
                backgroundColor: 'white',
                padding: 22,
                borderRadius: 4,
                borderColor: 'rgba(0, 0, 0, 0.1)',
              }}>
              <View>
                <Text style={{marginTop: 15, fontSize: 10}}>
                  Mode of payment
                </Text>
                <Stack>
                <SelectDropdown
	data={[this.state.paymentMethods.map(a => a.Paymentstatus == true ? a.label:'')].concat('Cash')}
  buttonStyle={{width: SCREEN_WIDTH / 1.58}}
  defaultValue={this.state.paymentMethod}
	onSelect={(selectedItem, index) => {
    this.setState({paymentMethod: selectedItem})
	}}
	buttonTextAfterSelection={(selectedItem, index) => {
		return selectedItem
	}}
	rowTextForSelection={(item, index) => {
		return item
	}}
/>
                  
                </Stack>
                <Text style={{marginTop: 15, fontSize: 10}}>
                  Estimated Cost
                </Text>
                <Stack>
                  <Input
                    onChangeText={text => {
                      isNaN(text) ? null : this.setState({estCost: text});
                    }}
                    keyboardType={'number-pad'}
                    value={this.state.estCost}
                  />
                </Stack>

                <Box>
                  <Box
                    style={{
                      flex: 2,
                      justifyContent: 'center',
                      alignContent: 'center',
                    }}>
                    <Text style={{fontSize: 17, fontWeight: 'bold'}}>
                      Delivery Cost:{' '}
                      <NumericFormat
                        renderText={text => (
                          <Text
                            style={{
                              paddingLeft: SCREEN_WIDTH / 2 - 60,
                              fontWeight: 'bold',
                            }}>
                            {text}
                          </Text>
                        )}
                        value={
                          parseFloat(this.state.tip) +
                          Math.round((actualAmountPay * 10) / 10)
                        }
                        displayType={'text'}
                        thousandSeparator={true}
                        prefix={this.props.route.params.currency}
                      />
                    </Text>
                  </Box>
                </Box>
                <HStack
                  alignItems="center"
                  style={{
                    backgroundColor: '#f7f8fa',
                    borderRadius: 10,
                    left: 0,
                    width: SCREEN_WIDTH / 1.26,
                    top: 10,
                  }}>
                  <Box style={{left: 10}}>
                    <Button style={{backgroundColor: '#FFFFFF',}}>
                      <FontAwesome5
                        name={'hand-holding-usd'}
                        size={25}
                        color="#b5b5b5"
                      />
                    </Button>
                  </Box>
                  <Box style={{left:10}}>
                    {this.state.willingtopay == false ? (
                      <MaterialCommunityIcons
                        name="checkbox-blank-outline"
                        size={25}
                        color="gray"
                        onPress={() =>
                          this.setState({willingtopay: true, tip: 50})
                        }>
                        <Text style={{fontSize: 15, color: 'black'}}>Tip</Text>
                      </MaterialCommunityIcons>
                    ) : (
                      <MaterialCommunityIcons
                        name="checkbox-marked-outline"
                        size={25}
                        color="green"
                        onPress={() =>
                          this.setState({willingtopay: false, tip: 0})
                        }>
                        <Text style={{fontSize: 15, color: 'black'}}>Tip</Text>
                      </MaterialCommunityIcons>
                    )}
                  </Box>
                  <Box>
                    {this.state.willingtopay == false ? null : (
                      <View
                        style={{
                          height: 45,
                          flexDirection: 'row',
                          paddingTop: 0,
                          right: -10,
                        }}>
                        <TouchableOpacity
                          style={{
                            padding: 5,
                            height: '100%',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderColor: '#ccc',
                            borderWidth: 1,
                            borderRightWidth: 0,
                            width: SCREEN_WIDTH / 9,
                            flexDirection: 'row',
                          }}
                          onPress={() =>
                            this.setState({
                              tip50: !this.state.tip50,
                              tip: 50,
                              tip100: false,
                              tip200: false,
                              tipcustom: false,
                            })
                          }>
                          <Text
                            style={{
                              color: this.state.tip50 ? '#33c37d' : '#666',
                              fontWeight: this.state.tip50 ? 'bold' : 'normal',
                            }}>
                            50
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{
                            padding: 5,
                            height: '100%',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderColor: '#ccc',
                            borderWidth: 1,
                            borderRightWidth: 0,
                            width: SCREEN_WIDTH / 9,
                            flexDirection: 'row',
                          }}
                          onPress={() =>
                            this.setState({
                              tip100: !this.state.tip100,
                              tip: 100,
                              tip50: false,
                              tip200: false,
                              tipcustom: false,
                            })
                          }>
                          <Text
                            style={{
                              marginTop: 0,
                              color: this.state.tip100 ? '#33c37d' : '#666',
                              fontWeight: this.state.tip100 ? 'bold' : 'normal',
                            }}>
                            100
                          </Text>
                        </TouchableOpacity>

                        <View
                          style={{
                            padding: 5,
                            height: '100%',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderColor: '#ccc',
                            borderWidth: 1,
                            width: SCREEN_WIDTH / 4.5,
                            flexDirection: 'row',
                          }}>
                          <Input
                            placeholder={
                              this.state.tip == 50 ||
                              this.state.tip == 100 ||
                              this.state.tip == 0
                                ? 'Custom'
                                : this.state.tip.toString()
                            }
                            value={
                              this.state.tip == 50 ||
                              this.state.tip == 100 ||
                              this.state.tip == 0
                                ? null
                                : this.state.tip.toString()
                            }
                            onChangeText={text => {
                              isNaN(text) ? null : this.setState({tip: text});
                            }}
                            placeholderTextColor="#687373"
                            keyboardType={'number-pad'}
                          />
                        </View>
                      </View>
                    )}
                  </Box>
                </HStack>
              </View>

              <View style={{flexDirection: 'row'}}>
                <Button
                  block
                  style={{
                    height: 50,
                    backgroundColor: '#019fe8',
                    marginTop: 30,
                    marginRight: SCREEN_WIDTH / 4,
                  }}
                  onPress={() => this.setState({listModal: true})}>
                  <Text style={{color: 'white'}}>Add Item</Text>
                </Button>
                <Button
                  block
                  style={{
                    height: 50,
                    backgroundColor: '#33c37d',
                    marginTop: 30,
                  }}
                  onPress={() => this.checkOut()}>
                  <Text style={{color: 'white'}}>Procceed</Text>
                </Button>
              </View>
            </Box>
          </Modal>
        </Box>
      </Box>
    );
  }

  async checkOut() {
    console.log('this.state.photo: ', this.state.photo);

    this.setState({loading: true});

    let distance =
      this.state.summary === undefined
        ? null
        : this.state.summary.distance / 1000;

    let newDistance = distance - this.state.PBasekm;
    let distanceAmount = newDistance * this.state.Psucceeding;
    const NewdistanceAmount = distanceAmount > 0 ? distanceAmount : 0;
    let amountpay = this.state.PbaseFare + NewdistanceAmount;

    let distanceAmountCity = newDistance * this.state.CityPsucceeding;
    const NewdistanceAmountCity =
      distanceAmountCity > 0 ? distanceAmountCity : 0;
    let amountpayCity = this.state.CityPbaseFare + NewdistanceAmountCity;

    let distanceAmountMetro = newDistance * this.state.MetroPsucceeding;
    const NewdistanceAmountMetro =
      distanceAmountMetro > 0 ? distanceAmountMetro : 0;
    let amountpayMetro = this.state.MetroPbaseFare + NewdistanceAmountMetro;

    const actualAmountPay =
      this.props.route.params.typeOfRate == 'Municipal Rate'
        ? amountpay
        : this.props.route.params.typeOfRate == 'City Rate'
        ? amountpayCity
        : amountpayMetro;
    const typeOfRate = this.props.route.params.typeOfRate;

    const newDocumentID = this.checkoutref.collection('orders').doc().id;

    const today = this.state.currentDate;
    const timeStamp = new Date().getTime();
    const date_ordered = moment(today).format('MMMM Do YYYY, h:mm:ss a');
    const week_no = moment(today, 'MMDDYYYY').isoWeek();
    const time = moment(today).format('h:mm:ss a');
    const date = moment(today).format('MMMM D, YYYY');
    const day = moment(today).format('dddd');
    const month = moment(today).format('MMMM');
    const year = moment(today).format('YYYY');
    const userId = await AsyncStorage.getItem('uid');
    const updatecounts = firestore().collection('orderCounter').doc('orders');
    const updateUserOrders = firestore().collection('users').doc(userId);

    const DatasValue = {
      travelTime: 0,
      AdditionalMinute: 0,
      AdditionalMinMinute: 0,
      toPlace: this.state.toPlace,
      fromPlace: this.state.fromPlace,
      PickupNotifUser: false,
      PickupNotifRider: false,
      DropoffNotifUser: false,
      DropoffNotifRider: false,
      ItemList: this.state.pabiliList,
      currency: this.props.route.params.currency,
      Customerimage: this.state.photo,
      OrderNo: this.state.counter,
      OrderId: newDocumentID,
      OrderStatus: 'Pending',
      adminID: '',
      originalAddress: this.props.route.params.fromPlace,
      AccountInfo: {
        name: this.state.account_name,
        address: this.state.account_address,
        phone: this.state.account_number,
        email: this.state.account_email,
        barangay:
          this.state.account_barangay == undefined
            ? ''
            : this.state.account_barangay,
        city: this.state.account_city.trim(),
        province: this.state.account_province.toLowerCase(),
        status: this.state.account_status,
      },
      DeliveredBy: {
        ColorMotor: '',
        MBrand: '',
        Name: '',
        PlateNo: '',
        VModel: '',
        eta: 0,
        id: '',
        ratings: 0,
        token: [],
      },
      Billing: {
        context: this.state.billing_context,
        name: this.state.account_name,
        address: this.state.billing_street,
        phone: this.state.account_number,
        barangay:
          this.state.billing_barangay == undefined
            ? ''
            : this.state.billing_barangay,
        province: this.state.billing_province.toLowerCase(),
        billing_city: this.state.billing_city.trim(),
        billing_country: this.state.billing_country,
      },
      OrderDetails: {
        Date_Ordered: date_ordered,
        Preffered_Delivery_Time_Date: this.state.preffered_delivery_time,
        Week_No: week_no,
        Year: year,
        Month: month,
        Time: time,
        Date: date,
        Day: day,
        Timestamp: timeStamp,
      },
      billing_countryTo: this.state.billing_countryTo,
      billing_contextTo: this.state.billing_contextTo,
      billing_nameTo: this.state.account_name,
      billing_phoneTo: this.state.account_number,
      billing_provinceTo: this.state.billing_provinceTo.toLowerCase(),
      billing_cityTo: this.state.billing_cityTo,
      billing_streetTo: this.state.billing_streetTo,
      billing_postalTo: this.state.billing_postalTo,
      billing_barangayTo: this.state.billing_barangayTo,
      Timestamp: moment().unix(),
      user_token: this.state.userToken == undefined ? [] : this.state.userToken,
      Note: this.state.note,
      PaymentMethod: this.state.paymentMethod,
      DeliveredBy: '',
      rider_id: '',
      isCancelled: false,
      userId: userId,
      distance: this.state.summary.distance,
      flat: this.state.flat,
      flong: this.state.flong,
      Tolong: this.state.Tolong,
      Tolat: this.state.Tolat,
      discount: this.state.discount,
      voucherUsed: this.state.voucherCode,
      km: this.state.summary.distance / 1000,
      total: Math.round((actualAmountPay * 10) / 10),
      exkm: newDistance,
      estTime: this.state.summary.baseTime,
      succeding:
        this.props.route.params.typeOfRate == 'Municipal Rate'
          ? this.state.Psucceeding
          : this.props.route.params.typeOfRate == 'City Rate'
          ? this.state.CityPsucceeding
          : this.state.MetroPsucceeding,
      amount_base:
        this.props.route.params.typeOfRate == 'Municipal Rate'
          ? this.state.PbaseFare
          : this.props.route.params.typeOfRate == 'City Rate'
          ? this.state.CityPbaseFare
          : this.state.MetroPbaseFare,
      base_dist:
        this.props.route.params.typeOfRate == 'Municipal Rate'
          ? this.state.PBasekm
          : this.props.route.params.typeOfRate == 'City Rate'
          ? this.state.PBasekm
          : this.state.PBasekm,
      delivery_charge: Math.round((actualAmountPay * 10) / 10),
      extraKmCharge: 0,
      subtotal: 0,
      ProductType: 'Foods',
      SubProductType: 'Pabili',
      estCost: this.state.estCost,
      tip: this.state.tip,
    };
    console.log('DatasValue: ', DatasValue);
    this.state.pabiliList.map(info =>
      firestore().collection('Pabili').doc(info.key).delete(),
    );

    this.checkoutref
      .collection('orders')
      .doc(newDocumentID)
      .set(DatasValue)
      .then(
        updatecounts.update({counter: firestore.FieldValue.increment(1)}),
        updateUserOrders.update({
          ordered_times: firestore.FieldValue.increment(1),
        }),

        this.setState({
          loading: false,
        }),
        this.props.navigation.navigate('pabiliOrderDetails', {
          orders: DatasValue,
          currency: this.props.route.params.currency,
        }),
      )
      .catch(error => Alert.alert('Try Again', '', [{text: 'OK'}]));
  }
}

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
