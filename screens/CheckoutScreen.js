import React, {Component} from 'react';
import {
  AppState,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Alert,
  FlatList,
  SafeAreaView,
  ScrollView,
  Animated,
} from 'react-native';
import {
  View,
  Button,
  HStack,
  Select,
  Input,
  VStack,
  Image,
  Text,
  useToast as Toast,
  Box,
} from 'native-base';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
// Our custom files and classes import
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
import AccountInfo from './checkout/AccountInfo';
import DeliveryDetails from './checkout/DeliveryDetails';
import {RadioButton, Chip, Divider,Card} from 'react-native-paper';
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
import {imgDefault} from './images';
import * as ImagePicker from 'react-native-image-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
/*const resetAction = StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: 'Home' })],
});*/

export default class Checkout extends Component {
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
    const cart = this.props.route.params.cartItems;
    const subtotal = this.props.route.params.subtotal;
    this.state = {
      appState: AppState.currentState,
      slatitude: cart[0].slatitude,
      slongitude: cart[0].slongitude,
      cartItems: cart,
      driver_charge: 0,
      xtra: 0,
      labor: 0,
      deliveryCharge: 0,
      pickup: 0,
      stores: [],
      paymentMethod: '(COD)',
      billing_name: '',
      billing_postal: '',
      billing_phone: '',
      billing_street: '',
      billing_country: '',
      billing_province: '',
      billing_city: '',
      billing_barangay: '',
      billing_cluster: '',
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
      subtotal: subtotal,
      minimum: 0,
      selectedIndex: 0,
      selectedIndices: [0],
      customStyleIndex: 0,
      isready: 0,
      USERAdd: 0,
      StoreDeduction: 0,
      sameCountry: '',
      base_dist: 0,
      deliveryCharge: 0,
      pickup: 0,
      succeding: 0,
      minimumToID: 0,
      summary: {distance: 0},
      admin_token: [],
      Ridertokens: [],
      UploadId: false,
      vID: '',
      ImageTobeUploaded: null,
      ApprovalRequest: false,
      storeAddress: '',
      paymentMethods: [],
      AddTipModal: false,
      tip50: true,
      tip100: false,
      tip200: false,
      tipcustom: false,
      tip: 0,
      Storesection: '',
    };
  }

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

  async component() {
    let userId = await AsyncStorage.getItem('uid');
    const self = this;

    /* This will also be triggered when new items are added to or removed from cart  */
    self.unsubscribeCartItems = firestore()
      .collection('user_vouchers')
      .doc(userId)
      .onSnapshot(snapshot => {
        let updatedCart = []; /* Set empty array cart by default */

        if (snapshot.data() && Object.keys(snapshot.data()).length) {
          /* Loop through list of cart item IDs  */
          Object.values(snapshot.data()).forEach(function (
            snapshotCart,
            index,
          ) {
            updatedCart.push({...snapshotCart});
            self.setState({
              vouchers: updatedCart,
            }); /* !!!! setState is running multiple times here, figure out how to detect when child_added completed*/
          });
        } else {
          self.setState({vouchers: []});
        }
      });
  }

  checkVoucherDetails(data) {
    const {voucherArray} = this.state;
    let total = 0;
    let discount = this.state.discount;
    if (this.state.voucherCode != data.id || !this.state.voucherCode) {
      this.state.cartItems.forEach(item => {
        if (item.storeId == data.store_id) {
          if (item.sale_price) {
            total += item.sale_price * item.qty;
          } else {
            total += item.price * item.qty;
          }
        }
      });
      console.log('vtotal: ', total);
      console.log('discount: ', this.state.discount);
      if (total >= parseFloat(data.minimum)) {
        this.setState({
          discount: data.amount,
          voucherCode: data.id,
          isVisible: false,
        });
      } else {
        Alert.alert('Inapplicable Voucher')
        this.setState({isVisible: false});
      }
    } else {
      Alert.alert('Voucher already in-use.', '', [{text: 'OK'}]);
      this.setState({isVisible: false});
    }
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
    firestore()
      .collection('stores')
      .where('cluster', '==', this.state.cartItems[0].cluster)
      .onSnapshot(
        querySnapshot => {
          const AvailableOn = [];
          querySnapshot.forEach(doc => {
            AvailableOn.push(doc.data());
            this.setState({
              Storesection: doc.data().section,
              arrayofCity: doc.data().arrayofCity,
              storeAddress:
                doc.data().address +
                ' ' +
                doc.data().city +
                ' ' +
                doc.data().province,
            });
          });
        },
        error => {
          console.log(error);
        },
      );

    this.StartImageRotationFunction();
    this.setState({loading: true});
    firestore()
      .collection('admin_token')
      .where('city', '==', this.props.route.params.cartItems[0].city)
      .onSnapshot(
        querySnapshot => {
          const orders = [];
          querySnapshot.forEach(doc => {
            this.setState({
              Ridertokens: doc.data().Ridertokens,
              admin_token: doc.data().tokens,
            });
          });
        },
        error => {
          console.log(error);
        },
      );
    this._bootstrapAsync();

    this.storeID();
    this.storeIDS();
    this.component();
  }

  componentWillUnmount() {
    this.appStateSubscription.remove();
    this.unsubscribe && this.unsubscribe();
    this.subscribe && this.subscribe();
    this.billinglistener && this.billinglistener();
    this.paymentslistener && this.paymentslistener();
    this.paymentsmethodlistener && this.paymentsmethodlistener();
    this.ordercounters && this.ordercounters();
  }

  cartCount() {
    let total = 0;
    this.state.cartItems.forEach(item => {
      total += item.qty;
    });

    return total;
  }

  _bootstrapAsync = async () => {
    const userId = auth().currentUser.uid;
    this.billinglistener = this.billingRef
      .collection('users')
      .where('userId', '==', userId)
      .onSnapshot(this.onCollectionUpdateBilling);
    this.paymentslistener = this.paymentsRef
      .collection('payment_options')
      .onSnapshot(this.onCPaymentOptionUpdate);
    this.paymentsmethodlistener = this.paymentMethodRef
      .collection('payment_methods')
      .onSnapshot(this.onCPaymentMethodUpdate);
    this.ordercounters = this.ordercounters
      .collection('orderCounter')
      .onSnapshot(this.OrderCounter);

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

  OrderCounter = querySnapshot => {
    querySnapshot.forEach(doc => {
      this.setState({
        counter: doc.data().counter,
      });
    });
  };

  onCollectionUpdateBilling = querySnapshot => {
    querySnapshot.forEach(doc => {
      console.log('get userId');
      this.setState({
        context: doc.data().context == undefined ? [] : doc.data().context,
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
        ApprovalRequest: doc.data().ApprovalRequest,
        address_list: Object.values(doc.data().Shipping_Address),
      });
      this.defaultShippingAddress();
    });
  };

  /*  onCollectionUpdateCharge = (querySnapshot) => {
    querySnapshot.forEach((doc) => {
     this.setState({
       base_dist: doc.data().base_dist,
       deliveryCharge: doc.data().del_charge,
       pickup: doc.data().pickup,
       succeding: doc.data().succeding,
       isLoading: false,
    });
    
    });
    
    }*/

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
        this.state.USERAdd +
        this.calculateTotalDeliveryCharge() +
        this.extraKMCharges() +
        parseFloat(this.state.tip);
    } else if (customStyleIndex === 1) {
      total = this.state.subtotal + this.state.USERAdd + this.state.tip;
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

    total = this.state.deliveryCharge;

    //total = this.calculateLaborCharge() + this.calculatePickupCharge() + this.state.deliveryCharge;

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
    //console.log('extrakms: ', extrakm)
    //console.log('NewDistance: ', NewDistance)
    //console.log('succeding: ', this.state.succeding)
    total = extrakm;

    //total = this.calculateLaborCharge() + this.calculatePickupCharge() + this.state.deliveryCharge;

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
    console.log('working Hr');
    this.state.address_list.forEach(item => {
      console.log('item.default', item.default);
      if (item.default) {
        console.log(this.state.cartItems[0].Country.trim());
        this.setState({
          sameCountry:
            item.Country.trim() == this.state.cartItems[0].Country.trim()
              ? ''
              : 'Store and Delivery Address Country is not the same',
        });
        const databasecharge =
          item.Country.trim() == 'Philippines'
            ? 'AppShare'
            : item.Country.trim() + '.AppShare';
        firestore()
          .collection(databasecharge)
          .where(
            'label',
            '==',
            this.state.Storesection == 'Fastfood'
              ? 'foodStore'
              : this.state.Storesection == 'Produce etc.'
              ? 'produceStore'
              : 'merchStore',
          )
          .onSnapshot(querySnapshot => {
            querySnapshot.forEach(doc => {
              this.setState({
                USERAdd: doc.data().USERAdd,
                StoreDeduction: doc.data().StoreDeduction,
                minimumToID: doc.data().minimumToID,
                paymentMethods:
                  doc.data().paymentMethods == undefined
                    ? doc.data().modeOfPayment
                    : doc.data().paymentMethods,
              });
            });
          });

        firestore()
          .collection(databasecharge)
          .where('label', '==', 'deliveryCharge')
          .onSnapshot(querySnapshot => {
            querySnapshot.forEach(doc => {
              this.setState({
                base_dist: doc.data().base_dist,
                deliveryCharge: doc.data().del_charge,
                pickup: doc.data().pickup,
                succeding: doc.data().succeding,

                isLoading: false,
              });
            });
          });

        this.setState({
          Country: item.Country,
          billing_context: item.context == undefined ? [] : item.context,
          billing_name: item.name,
          billing_phone: item.phone,
          billing_province: item.province,
          billing_barangay: item.barangay,
          billing_city: item.city.trim(),
          billing_street: item.address,
          billing_postal: item.postal,
          ULat: item.lat,
          ULong: item.long,
        });
        //this.checkbarangay(item.barangay);

        const {slatitude, slongitude} = this.state;

        let from_lat = slatitude;
        let from_long = slongitude;
        let to_lat = item.lat;
        let to_long = item.long;
        console.log('slongitude: ', slongitude);
        console.log('slatitude: ', slatitude);
        console.log('USERlat: ', item.lat);
        console.log('USERlong: ', item.long);
        let routeCoordinates = [];
        //       console.log('get route')
        console.log('item.Country: ', item.Country);
        console.log(
          'this.state.cartItems[0].Country: ',
          this.state.cartItems[0].Country,
        );
        if (item.Country == this.state.cartItems[0].Country) {
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
                routeCoordinates.push({
                  latitude: latitude,
                  longitude: longitude,
                });
              });
              this.setState({
                ULat: item.lat,
                ULong: item.long,
                // here we can access route summary which will show us how long does it take to pass the route, distance etc.
                summary: res.data.response.route[0].summary,
                // NOTE just add this 'isLoading' field now, I'll explain it later
                isready: 1,
                loading: false,
              });
              console.log('sum: ', res.data.response.route[0].summary);
            })
            .catch(err => {
              this.setState({
                loading: false,
                summary: {distance: 0},
              });
              console.log('sum err: ', err);
            });
        } else {
          this.setState({
            loading: false,
          });
        }
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

  changeAddress(item) {
    console.log(item.Country.trim());
    console.log(this.state.cartItems[0].Country.trim());
    console.log(
      'changeAddress not the same country: ',
      item.Country.trim() == this.state.cartItems[0].Country.trim(),
    );
    this.setState({
      loading: true,
      sameCountry:
        item.Country.trim() == this.state.cartItems[0].Country.trim()
          ? ''
          : 'Store and Delivery Address Country is not the same',
    });

    console.log('changeAddress item.Country: ', item.Country.trim());
    const databasecharge =
      item.Country == 'Philippines'
        ? 'AppShare'
        : item.Country.trim() + '.AppShare';
    console.log('changeAddress databasecharge: ', databasecharge);
    firestore()
      .collection(databasecharge)
      .where(
        'label',
        '==',
        this.state.Storesection == 'Fastfood'
          ? 'foodStore'
          : this.state.Storesection == 'Produce etc.'
          ? 'produceStore'
          : 'merchStore',
      )
      .onSnapshot(querySnapshot => {
        querySnapshot.forEach(doc => {
          console.log('databasecharge doc.data()', doc.data());
          this.setState({
            USERAdd: doc.data().USERAdd,
            StoreDeduction: doc.data().StoreDeduction,
            minimumToID: doc.data().minimumToID,
            paymentMethods: doc.data().modeOfPayment,
          });
        });
      });

    firestore()
      .collection(databasecharge)
      .where('label', '==', 'deliveryCharge')
      .onSnapshot(querySnapshot => {
        querySnapshot.forEach(doc => {
          this.setState({
            base_dist: doc.data().base_dist,
            deliveryCharge: doc.data().del_charge,
            pickup: doc.data().pickup,
            succeding: doc.data().succeding,
            isLoading: false,
          });

          //   console.log('doc.data().succeding: ',doc.data().succeding)
        });
      });

    this.setState({
      billing_context: item.context == undefined ? [] : item.context,
      billing_name: item.name,
      billing_phone: item.phone,
      billing_province: item.province,
      billing_city: item.city.trim(),
      billing_street: item.address,
      billing_postal: item.postal,
      billing_barangay: item.barangay,

      visibleAddressModal: false,
    });
    //this.checkbarangay(item.barangay);

    const {slatitude, slongitude} = this.state;
    let from_lat = slatitude;
    let from_long = slongitude;
    let to_lat = item.lat;
    let to_long = item.long;
    // console.log('slongitude: ', slongitude);
    //console.log('slatitude: ', slatitude);
    console.log('USERlat: ', item.lat);
    console.log('USERlong: ', item.long);
    let routeCoordinates = [];
    // console.log('get route')
    if (item.Country == this.state.cartItems[0].Country) {
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
            routeCoordinates.push({latitude: latitude, longitude: longitude});
          });
          this.setState({
            ULat: item.lat,
            ULong: item.long,
            // here we can access route summary which will show us how long does it take to pass the route, distance etc.
            summary: res.data.response.route[0].summary,
            // NOTE just add this 'isLoading' field now, I'll explain it later
            isLoading: false,
            loading: false,
          });
          console.log('sum: ', res.data.response.route[0].summary);
        })
        .catch(err => {
          // console.log(err)
          this.setState({
            loading: false,
            summary: {distance: 0},
          });
        });
    } else {
      this.setState({
        loading: false,
      });
    }
  }
  calculateDistance() {
    const {slatitude, slongitude, ULat, ULong} = this.state;
    let from_lat = slatitude;
    let from_long = slongitude;
    let to_lat = ULat;
    let to_long = ULong;
    //  ULat: item.lat,
    //ULong:item.long,
    // console.log('slongitude: ', slongitude);
    //console.log('slatitude: ', slatitude);
    let routeCoordinates = [];
    // console.log('get route')

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
          routeCoordinates.push({latitude: latitude, longitude: longitude});
        });
        this.setState({
          // here we can access route summary which will show us how long does it take to pass the route, distance etc.
          summary: res.data.response.route[0].summary,
          // NOTE just add this 'isLoading' field now, I'll explain it later
          isLoading: false,
        });
        console.log('sum: ', res.data.response.route[0].summary);
      })
      .catch(err => {
        // console.log(err)
        Alert.alert(
          "Sorry we can't catch that",
          'Your address maybe too far please try again.',
        );
        this.setState({
          loading: false,
          summary: {distance: 0},
        });
      });
  }
  changePaymentMethod(item) {
    this.setState({
      paymentMethod: item == 'COD' ? '(COD)' : item.Label,
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

  openGallery = () => {
    ImagePicker.launchImageLibrary(
      {
        maxWidth: 500,
        maxHeight: 500,
        mediaType: 'photo',
        includeBase64: true,
      },
      image => {
        if (image.didCancel == true) {
          return;
        }
        this.setState({ImageTobeUploaded: image.assets[0].base64});
      },
    );
  };

  openGallerylaunchCamera = () => {
    ImagePicker.launchCamera(
      {
        title: 'Take Image',
        type: 'capture',
        includeBase64: true,
        options: {
          saveToPhotos: true,
          mediaType: 'photo',
          includeBase64: true,
        },
      },
      image => {
        if (image.didCancel == true) {
          return;
        }
        this.setState({ImageTobeUploaded: image.assets[0].base64});
      },
    );
  };

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
    console.log('paymentMethods: ', this.state.summary.distance);
    //console.log('paymentMethods: ', this.state.paymentMethods);
    //console.log('fromPlace: ', this.props.route.params.fromPlace);
    //console.log('minimumToID: ', this.state.minimumToID);
    //console.log('extraKMCharges: ', this.extraKMCharges());
    //console.log('StoreDeduction: ', this.state.StoreDeduction);
    //console.log('newDeduction: ', (Math.round(this.state.subtotal*10)/10)*this.state.StoreDeduction );
    console.log('cartItems: ', this.state.cartItems[0]);
    return (
      <Box>
        <Box style={{backgroundColor: '#CCCCCC'}}>
          <CustomHeader
            title="Checkout"
            Cartoff={true}
            navigation={this.props.navigation}
          />
          <Loader loading={this.state.loading} trans={trans} />
          <SegmentedControlTab
            values={['Delivery', 'Pick-up']}
            selectedIndex={customStyleIndex}
            onTabPress={this.handleCustomIndexSelect}
            borderRadius={0}
            tabsContainerStyle={{height: 50, backgroundColor: '#F2F2F2'}}
            tabStyle={{
              backgroundColor: '#F2F2F2',
              borderWidth: 0,
              borderColor: 'transparent',
            }}
            activeTabStyle={{backgroundColor: 'white', marginTop: 2}}
            tabTextStyle={{color: '#444444', fontWeight: 'bold'}}
            activeTabTextStyle={{color: '#888888'}}
          />
          {customStyleIndex === 2 && (
            <View
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <Card
                style={{
                  justifyContent: 'center',
                  alignContent: 'center',
                  padding: 20,
                }}>
                <Text style={{textAlign: 'center'}}>Coming Soon</Text>
                <Text>This feature is not yet available</Text>
              </Card>
            </View>
          )}

          {customStyleIndex === 0 && (
            <ScrollView style={{height: SCREEN_HEIGHT/1.5}}>
              <SafeAreaView>
                <Card
                  elevation={5}
                  style={{borderColor: '#ddd', padding: 5, flex: 1}}>
                  <Box header>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: '#1aad57',
                      }}>
                      Delivery Details
                    </Text>
                    <Box />
                    <Box
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                      }}>
                      <TouchableOpacity
                        style={{paddingRight: 5}}
                        onPress={() =>
                          this.setState({visibleAddressModal: true})
                        }>
                        <Text style={{color: 'red', fontStyle: 'italic'}}>
                          Edit
                        </Text>
                      </TouchableOpacity>
                    </Box>
                  </Box>
                  {!this.state.loading && (
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'column',
                        paddingHorizontal: 10,
                      }}>
                      <Text style={{fontSize: 14}}>
                        {this.state.billing_name} | {this.state.billing_phone}{' '}
                        {'\n'}
                        {this.state.billing_street},{' '}
                        {this.state.billing_barangay}, {this.state.billing_city}
                        , {this.state.billing_province},{' '}
                        {this.state.billing_postal}
                      </Text>
                    </View>
                  )}
                </Card>
                <Modal
                  useNativeDriver={true}
                  isVisible={this.state.visibleAddressModal}
                  onSwipeComplete={this.close}
                  swipeDirection={['up', 'left', 'right', 'down']}
                  style={styles.view}
                  onBackButtonPress={() =>
                    this.setState({visibleAddressModal: false})
                  }
                  onBackdropPress={() =>
                    this.setState({visibleAddressModal: false})
                  }
                  transparent={true}>
                  <View style={styles.content}>
                    <View>
                      <Text style={{textAlign: 'center', paddingVertical: 15}}>
                        {' '}
                        Select Address{' '}
                      </Text>
                      <FlatList
                        data={this.state.address_list}
                        ListFooterComponent={this.footer}
                        renderItem={({item}) => (
                          <Card transparent>
                            <Box
                              style={{
                                borderRadius: 10,
                                borderWidth: 0.1,
                                marginHorizontal: 10,
                                borderColor: 'tomato',
                              }}
                              button
                              onPress={() => this.changeAddress(item)}>
                              <View style={{flex: 1, flexDirection: 'column'}}>
                                <Text style={{fontSize: 14}}>
                                  {item.name} | {item.phone} {'\n'}
                                  {item.address}, {item.barangay},{' '}
                                  {item.city.trim()}, {item.province},{' '}
                                  {item.postal}
                                </Text>
                              </View>
                            </Box>
                          </Card>
                        )}
                        keyExtractor={item => item.key}
                      />
                    </View>
                  </View>
                </Modal>
                <Modal
                  useNativeDriver={true}
                  isVisible={this.state.UploadId}
                  onSwipeComplete={this.close}
                  swipeDirection={['up', 'left', 'right', 'down']}
                  style={styles.view}
                  onBackButtonPress={() => this.setState({UploadId: false})}
                  onBackdropPress={() => this.setState({UploadId: false})}
                  transparent={true}>
                  <View style={styles.content}>
                    <View>
                      <Text
                        style={{
                          textAlign: 'left',
                          paddingVertical: 15,
                          color: 'salmon',
                        }}>
                        Note:
                        <Text style={{color: 'black', fontSize: 12}}>
                          You need to attach valid ID for the new user who order
                          more than {this.state.minimumToID}.
                        </Text>{' '}
                      </Text>
                      <Text>Upload Valid I.D</Text>
                      <Select
                        selectedValue={this.state.vID}
                        onValueChange={(itemValue, itemIndex) =>
                          this.setState({vID: itemValue})
                        }>
                        <Select.Item
                          label={
                            this.state.vID == ''
                              ? 'Select Valid I.D'
                              : this.state.vID
                          }
                          value={this.state.vID}
                        />
                        <Select.Item label={'Passport'} value={'Passport'} />
                        <Select.Item
                          label={'Professional Regulatory Commission (PRC) ID'}
                          value={'Professional Regulatory Commission (PRC) ID'}
                        />
                        <Select.Item
                          label={'NBI Clearance'}
                          value={'NBI Clearance'}
                        />
                        <Select.Item
                          label={'GSIS e-card / GSIS ID (membership ID)'}
                          value={'GSIS e-card / GSIS ID (membership ID)'}
                        />
                        <Select.Item
                          label={'SSS ID/ Unified Multipurpose ID (UMID)'}
                          value={'SSS ID/ Unified Multipurpose ID (UMID)'}
                        />
                        <Select.Item label={'IBP ID'} value={'IBP ID'} />
                        <Select.Item
                          label={'Drivers License'}
                          value={'Drivers License'}
                        />
                        <Select.Item
                          label={'Philhealth'}
                          value={'Philhealth'}
                        />
                        <Select.Item
                          label={'Immigrant Certificate of Registration'}
                          value={'Immigrant Certificate of Registration'}
                        />
                        <Select.Item
                          label={'Postal ID '}
                          value={'Postal ID '}
                        />
                        <Select.Item label={'Voters ID'} value={'Voters ID'} />
                        <Select.Item label={'TIN'} value={'TIN'} />
                      </Select>

                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignContent: 'center',
                        }}>
                        <TouchableOpacity>
                          <Image
                            style={{
                              width: 160,
                              height: 160,
                              resizeMode: 'contain',
                              margin: 10,
                            }}
                            source={
                              this.state.ImageTobeUploaded == null
                                ? require('./id.png')
                                : {
                                    uri: `data:image;base64,${this.state.ImageTobeUploaded}`,
                                  }
                            }
                          />
                          {
                            // <ActivityIndicator size="large" color="#00ff00" style={{position: 'absolute', right: 0, flex: 1}}/>
                          }
                        </TouchableOpacity>
                        <View
                          style={{
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignContent: 'center',
                          }}>
                          <MaterialIcons
                            name="photo"
                            size={30}
                            onPress={() => {
                              this.openGallery();
                            }}
                          />
                          <MaterialIcons
                            name="photo-camera"
                            size={30}
                            style={{marginTop: 20}}
                            onPress={() => {
                              this.openGallerylaunchCamera();
                            }}
                          />
                        </View>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.centerElement,
                        {
                          backgroundColor: '#019fe8',
                          width: SCREEN_WIDTH / 1.2,
                          height: 40,
                          borderRadius: 5,
                          padding: 10,
                        },
                      ]}
                      onPress={() => this.submitValidID()}>
                      <Text style={{color: '#ffffff'}}>Submit</Text>
                    </TouchableOpacity>
                  </View>
                </Modal>
              </SafeAreaView>
              <Card
                elevation={5}
                style={{borderColor: '#ddd', padding: 5, flex: 1}}>
                <Box header>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: 'bold',
                      color: '#1aad57',
                    }}>
                    Payment Method
                  </Text>
                  <Box />
                  <Box
                    style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                    <TouchableOpacity
                      style={{paddingRight: 5}}
                      onPress={() =>
                        this.setState({visiblePaymentModal: true})
                      }>
                      <Text style={{color: 'red', fontStyle: 'italic'}}>
                        Edit
                      </Text>
                    </TouchableOpacity>
                  </Box>
                </Box>

                <View style={{flexDirection: 'row'}}>
                  <RadioButton
                    value={this.state.paymentMethod}
                    status={'checked'}
                  />

                  <Text style={{padding: 5}}>{this.state.paymentMethod}</Text>
                </View>
                <Modal
                  useNativeDriver={true}
                  isVisible={this.state.visiblePaymentModal}
                  onSwipeComplete={this.close}
                  swipeDirection={['up', 'left', 'right', 'down']}
                  style={styles.view}
                  onBackButtonPress={() =>
                    this.setState({visiblePaymentModal: false})
                  }
                  onBackdropPress={() =>
                    this.setState({visiblePaymentModal: false})
                  }
                  transparent={true}>
                  <View style={styles.content}>
                    <View>
                      <Text style={{textAlign: 'center', paddingVertical: 15}}>
                        {' '}
                        Select Payment Method{' '}
                      </Text>
                      <Card transparent>
                        <Box
                          style={{
                            borderRadius: 10,
                            borderWidth: 0.1,
                            marginHorizontal: 10,
                            borderColor: 'tomato',
                          }}
                          button
                          onPress={() => this.changePaymentMethod('COD')}>
                          <View style={{flex: 1, flexDirection: 'column'}}>
                            <Text style={{fontSize: 14}}>
                              {' '}
                              Cash on Delivery (COD)
                            </Text>
                          </View>
                        </Box>
                      </Card>
                      <FlatList
                        data={this.state.paymentMethods}
                        renderItem={({item}) => (
                          <Card transparent>
                            <Box
                              style={{
                                borderRadius: 10,
                                borderWidth: 0.1,
                                marginHorizontal: 10,
                                borderColor: 'tomato',
                              }}
                              button
                              onPress={() => this.changePaymentMethod(item)}>
                              <View style={{flex: 1, flexDirection: 'column'}}>
                                <Text style={{fontSize: 14}}>
                                  {' '}
                                  {item.Label}
                                </Text>
                              </View>
                            </Box>
                          </Card>
                        )}
                        keyExtractor={item => item.key}
                      />
                    </View>
                  </View>
                </Modal>
               
              </Card>

              <Card
                elevation={5}
                style={{borderColor: '#ddd', padding: 5, flex: 1}}>
                <Box style={{flexDirection: 'column'}}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: 'bold',
                      color: '#1aad57',
                      alignSelf: 'flex-start',
                    }}>
                    Rider Tip
                  </Text>
                  <HStack
                    icon
                    style={{
                      backgroundColor: '#f7f8fa',
                      borderRadius: 10,
                      width: SCREEN_WIDTH / 1.1,
                    }}>
                    <Box style={{left: 10}}>
                      <Button style={{backgroundColor: '#FFFFFF'}}>
                        <FontAwesome5
                          name={'hand-holding-usd'}
                          size={25}
                          color="#b5b5b5"
                        />
                      </Button>
                    </Box>
                    <Box>
                      {this.state.willingtopay == false ? null : (
                        <View
                          style={{
                            height: 40,
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
                                AddTipModal: true,
                              })
                            }>
                            <Text
                              style={{
                                color:
                                  this.state.AddTipModal == false
                                    ? '#666'
                                    : this.state.tip50
                                    ? '#33c37d'
                                    : '#666',
                                fontWeight: this.state.tip50
                                  ? 'bold'
                                  : 'normal',
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
                                AddTipModal: true,
                              })
                            }>
                            <Text
                              style={{
                                marginTop: 0,
                                color: this.state.tip100 ? '#33c37d' : '#666',
                                fontWeight: this.state.tip100
                                  ? 'bold'
                                  : 'normal',
                              }}>
                              100
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={{
                              padding: 5,
                              height: '100%',
                              justifyContent: 'center',
                              borderColor: '#ccc',
                              borderWidth: 1,
                              borderRightWidth: 0,
                              alignItems: 'center',
                              width: SCREEN_WIDTH / 6,
                              flexDirection: 'row',
                            }}
                            onPress={() =>
                              this.setState({
                                tipcustom: !this.state.tipcustom,
                                tip: 0,
                                tip100: false,
                                tip200: false,
                                tip50: false,
                                AddTipModal: true,
                              })
                            }>
                            <Text
                              style={{
                                marginTop: 0,
                                fontSize: 12,
                                color: this.state.tipcustom
                                  ? '#33c37d'
                                  : '#666',
                                fontWeight: this.state.tipcustom
                                  ? 'bold'
                                  : 'normal',
                              }}>
                              Custom
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
                              width: SCREEN_WIDTH / 4,
                              flexDirection: 'row',
                            }}>
                            <Input
                              placeholder={
                                this.state.tip == 0
                                  ? 'Tip Amount'
                                  : this.state.tip.toString()
                              }
                              value={this.state.tip.toString()}
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
                </Box>
              </Card>
              <View>
                <TearLines ref="top" />
                <View
                  style={styles.invoice}
                  onLayout={e => {
                    this.refs.top.onLayout(e);
                  }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: 'bold',
                      color: '#1aad57',
                    }}>
                    Billing Receipt
                  </Text>

                  <VStack>
                    <FlatList
                      data={this.state.cartItems}
                      renderItem={({item}) => (
                        <View style={{paddingVertical: 5}}>
                          {!item.sale_price ? (
                            <View style={{flexDirection: 'row'}}>
                              <Box
                                style={{
                                  flex: 1,
                                  justifyContent: 'flex-start',
                                  alignItems: 'flex-start',
                                }}>
                                <Text
                                  style={{fontSize: 13, fontWeight: 'bold'}}>
                                  {item.name}
                                </Text>
                                <Text note style={{fontSize: 13}}>
                                  {item.qty} {item.unit} x
                                  {this.props.route.params.currency}
                                  {item.price}
                                </Text>
                                {item.choice == null ||
                                item.choice == undefined ? null : (
                                  <View>
                                    {item.choice.map((choice, index) =>
                                      choice.isChecked == 'unchecked' ? null : (
                                        <View
                                          key={index}
                                          style={{flexDirection: 'row'}}>
                                          {console.log('10 ', choice)}
                                          <Text>{choice.label}</Text>
                                          <Text>
                                            {' '}
                                            {choice.price.toFixed(2)}
                                          </Text>
                                        </View>
                                      ),
                                    )}
                                    {console.log('Choice: ', item.choice)}
                                  </View>
                                )}
                                <Text note style={{fontSize: 13}}>
                                  Brand: {item.brand}
                                </Text>
                                <Text note style={{fontSize: 13}}>
                                  by {item.store_name}
                                </Text>
                                <Text note style={{fontSize: 13}}>
                                  Note: {item.note}
                                </Text>
                              </Box>
                              <Box style={{textAlign: 'right'}}>
                                {item.choice == null || item.choice == [] ? (
                                  <Text
                                    style={{
                                      fontSize: 13,
                                      fontWeight: 'bold',
                                      marginBottom: 10,
                                    }}>
                                    {this.props.route.params.currency}
                                    {Math.round(item.price * item.qty * 10) /
                                      10}
                                  </Text>
                                ) : (
                                  <Text
                                    style={{
                                      fontSize: 13,
                                      fontWeight: 'bold',
                                      marginBottom: 10,
                                    }}>
                                    {this.props.route.params.currency}
                                    {Math.round(
                                      (item.price * item.qty +
                                        item.total_addons * item.qty) *
                                        10,
                                    ) / 10}
                                  </Text>
                                )}
                              </Box>
                            </View>
                          ) : (
                            <View style={{flexDirection: 'row'}}>
                              <Box
                                style={{
                                  flex: 1,
                                  justifyContent: 'flex-start',
                                  alignItems: 'flex-start',
                                }}>
                                <Text
                                  style={{fontSize: 13, fontWeight: 'bold'}}>
                                  {item.name}
                                </Text>
                                <Text note style={{fontSize: 13}}>
                                  {item.qty} {item.unit} x{' '}
                                  <Text
                                    style={{
                                      textDecorationLine: 'line-through',
                                      fontSize: 13,
                                    }}>
                                    {' '}
                                    {this.props.route.params.currency}
                                    {item.price}
                                  </Text>
                                  {this.props.route.params.currency}
                                  {item.sale_price}
                                </Text>
                                {item.choice == null ||
                                item.choice == undefined ? null : (
                                  <View style={{marginLeft: 10}}>
                                    {item.choice.map((choice, index) =>
                                      choice.isChecked == 'unchecked' ? null : (
                                        <View
                                          key={index}
                                          style={{flexDirection: 'row'}}>
                                          {console.log('10')}
                                          <Text note style={{fontSize: 13}}>
                                            {choice.label}
                                          </Text>
                                          <Text note style={{fontSize: 13}}>
                                            {' '}
                                            {choice.price.toFixed(2)}
                                          </Text>
                                        </View>
                                      ),
                                    )}
                                    {console.log('Choice: ', item.choice)}
                                  </View>
                                )}
                                <Text note style={{fontSize: 13}}>
                                  Brand: {item.brand}
                                </Text>
                                <Text note style={{fontSize: 13}}>
                                  by {item.store_name}
                                </Text>
                                <Text note style={{fontSize: 13}}>
                                  Note: {item.note}
                                </Text>
                              </Box>
                              <Box style={{textAlign: 'right'}}>
                                {item.choice == null || item.choice == [] ? (
                                  <Text
                                    style={{
                                      fontSize: 13,
                                      fontWeight: 'bold',
                                      marginBottom: 10,
                                    }}>
                                    {this.props.route.params.currency}
                                    {Math.round(
                                      item.sale_price * item.qty * 10,
                                    ) / 10}
                                  </Text>
                                ) : (
                                  <Text
                                    style={{
                                      fontSize: 13,
                                      fontWeight: 'bold',
                                      marginBottom: 10,
                                    }}>
                                    {this.props.route.params.currency}
                                    {Math.round(
                                      (item.sale_price * item.qty +
                                        item.total_addons * item.qty) *
                                        10,
                                    ) / 10}
                                  </Text>
                                )}
                              </Box>
                            </View>
                          )}
                        </View>
                      )}
                      keyExtractor={item => item.key}
                    />
                  </VStack>

                  <View>
                    <Box style={{padding: 8, flexDirection: 'column'}}>
                      <HStack>
                        <Text style={{fontSize: 13, color: 'tomato'}}>
                          You have ordered{' '}
                          <Text
                            style={{
                              textDecorationLine: 'underline',
                              color: 'tomato',
                              fontSize: 13,
                              fontWeight: 'bold',
                            }}>
                            {this.cartCount()}
                          </Text>{' '}
                          item/s
                        </Text>
                      </HStack>
                      {/*  <HStack>
                                <Text style={{fontSize: 13,  color:'red', fontWeight:'bold'}}>FREE DELIVERY when you reached {this.props.route.params.currency}{minimum}</Text>
                          </HStack>*/}
                    </Box>
                    <HStack style={{padding: 8}} justifyContent="space-between">
                      <HStack>
                        <Text style={{fontSize: 13, color: 'green'}}>
                          Sub Total
                        </Text>
                      </HStack>
                      <HStack >
                        <NumericFormat
                          renderText={text => (
                            <Text
                              style={{
                                textAlign: 'right',
                                fontSize: 13,
                                color: 'green',
                              }}>
                              {text}
                            </Text>
                          )}
                          value={Math.round(this.state.subtotal * 10) / 10}
                          displayType={'text'}
                          thousandSeparator={true}
                          prefix={this.props.route.params.currency}
                        />
                      </HStack>
                    </HStack>
                    <HStack style={{padding: 8}} justifyContent="space-between">
                      <HStack>
                        <Text style={{fontSize: 13, color: 'green'}}>
                          Distance
                        </Text>
                      </HStack>
                      <HStack>
                        <NumericFormat
                          renderText={text => (
                            <Text
                              style={{
                                textAlign: 'right',
                                fontSize: 13,
                                color: 'green',
                              }}>
                              {text}
                            </Text>
                          )}
                          value={parseFloat(this.state.summary.distance / 1000)}
                          displayType={'text'}
                          thousandSeparator={true}
                          suffix={' km'}
                        />
                      </HStack>
                    </HStack>
                    <HStack style={{padding: 8}} justifyContent="space-between">
                      <HStack>
                        <Text style={{fontSize: 13, color: 'green'}}>
                          Delivery Charge
                        </Text>
                      </HStack>
                      <HStack>
                        <NumericFormat
                          renderText={text => (
                            <Text
                              style={{
                                textAlign: 'right',
                                fontSize: 13,
                                color: 'green',
                              }}>
                              {text}
                            </Text>
                          )}
                          value={
                            Math.round(
                              (this.calculateTotalDeliveryCharge() +
                                this.extraKMCharges()) *
                                10,
                            ) / 10
                          }
                          displayType={'text'}
                          thousandSeparator={true}
                          prefix={this.props.route.params.currency}
                        />
                      </HStack>
                    </HStack>
                    {this.state.USERAdd > 0 ? (
                      <HStack style={{padding: 8}} justifyContent="space-between">
                        <HStack>
                          <Text style={{fontSize: 13, color: 'green'}}>
                            Reservation Charge
                          </Text>
                        </HStack>
                        <HStack>
                          <NumericFormat
                            renderText={text => (
                              <Text
                                style={{
                                  textAlign: 'right',
                                  fontSize: 13,
                                  color: 'green',
                                }}>
                                {text}
                              </Text>
                            )}
                            value={Math.round(this.state.USERAdd * 10) / 10}
                            displayType={'text'}
                            thousandSeparator={true}
                            prefix={this.props.route.params.currency}
                          />
                        </HStack>
                      </HStack>
                    ) : null}

                    {this.state.discount != 0 ? (
                      <HStack style={{padding: 8}} justifyContent="space-between">
                        <HStack>
                          <Text style={{fontSize: 13, color: 'tomato'}}>
                            Discount
                          </Text>
                        </HStack>
                        <HStack>
                          <Text
                            style={{
                              textAlign: 'right',
                              fontSize: 13,
                              color: 'tomato',
                            }}>
                            {' '}
                            - {this.props.route.params.currency}
                            {this.state.discount}
                          </Text>
                        </HStack>
                      </HStack>
                    ) : null}
                    <View style={styles.line} />
                    <HStack style={{padding: 8}} justifyContent="space-between">
                      <HStack>
                        <Text style={{fontSize: 13, color: 'green'}}>
                          Total
                        </Text>
                      </HStack>
                      <HStack>
                        <Text
                          style={{
                            textAlign: 'right',
                            fontSize: 15,
                            color: 'green',
                          }}>
                          {this.props.route.params.currency}
                          {Math.round(this.calculateOverAllTotal() * 10) / 10 -
                            this.state.discount}
                        </Text>
                      </HStack>
                    </HStack>
                  </View>
                </View>
              </View>
            </ScrollView>
          )}
          {customStyleIndex === 1 && (
            <ScrollView style={{height: SCREEN_HEIGHT/1.5}}>
              <SafeAreaView>
                <Card
                  elevation={5}
                  style={{borderColor: '#ddd', padding: 5, flex: 1}}>
                  <Box header>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: 'tomato',
                      }}>
                      Pick-up Details
                    </Text>
                    <Box />
                    <Box
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                      }}>
                      <TouchableOpacity
                        style={{paddingRight: 5}}
                        onPress={() =>
                          this.setState({visibleAddressModal: true})
                        }>
                        <Text style={{color: 'red', fontStyle: 'italic'}}>
                          Edit
                        </Text>
                      </TouchableOpacity>
                    </Box>
                  </Box>
                  {!this.state.loading && (
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'column',
                        paddingHorizontal: 10,
                      }}>
                      <Text style={{fontSize: 14}}>
                        {this.state.billing_name} | {this.state.billing_phone}{' '}
                        {'\n'}
                        {this.state.billing_street},{' '}
                        {this.state.billing_barangay}, {this.state.billing_city}
                        , {this.state.billing_province},{' '}
                        {this.state.billing_postal}
                      </Text>
                    </View>
                  )}
                </Card>
                <Modal
                  useNativeDriver={true}
                  isVisible={this.state.visibleAddressModal}
                  onSwipeComplete={this.close}
                  swipeDirection={['up', 'left', 'right', 'down']}
                  style={styles.view}
                  onBackButtonPress={() =>
                    this.setState({visibleAddressModal: false})
                  }
                  onBackdropPress={() =>
                    this.setState({visibleAddressModal: false})
                  }
                  transparent={true}>
                  <View style={styles.content}>
                    <View>
                      <Text style={{textAlign: 'center', paddingVertical: 15}}>
                        {' '}
                        Select Address{' '}
                      </Text>
                      <FlatList
                        data={this.state.address_list}
                        ListFooterComponent={this.footer}
                        renderItem={({item}) => (
                          <Card transparent>
                            <Box
                              style={{
                                borderWidth: 0.1,
                                marginHorizontal: 10,
                                borderColor: 'tomato',
                              }}
                              button
                              onPress={() => this.changeAddress(item)}>
                              <View style={{flex: 1, flexDirection: 'column'}}>
                                <Text style={{fontSize: 12}}>
                                  {item.name} | {item.phone} {'\n'}
                                  {item.address}, {item.barangay},{' '}
                                  {item.city.trim()}, {item.province},{' '}
                                  {item.postal}
                                </Text>
                              </View>
                            </Box>
                          </Card>
                        )}
                        keyExtractor={item => item.key}
                      />
                    </View>
                  </View>
                </Modal>
              </SafeAreaView>
              <Card
                elevation={5}
                style={{borderColor: '#ddd', padding: 5, flex: 1}}>
                <Box header>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: 'bold',
                      color: '#1aad57',
                    }}>
                    Payment Method
                  </Text>
                  <Box />
                  <Box
                    style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                    <TouchableOpacity
                      style={{paddingRight: 5}}
                      onPress={() =>
                        this.setState({visiblePaymentModal: true})
                      }>
                      <Text style={{color: 'red', fontStyle: 'italic'}}>
                        Edit
                      </Text>
                    </TouchableOpacity>
                  </Box>
                </Box>

                <View style={{flexDirection: 'row'}}>
                  <RadioButton
                    value={this.state.paymentMethod}
                    status={'checked'}
                  />

                  <Text style={{padding: 5}}>{this.state.paymentMethod}</Text>
                </View>
                <Modal
                  useNativeDriver={true}
                  isVisible={this.state.visiblePaymentModal}
                  onSwipeComplete={this.close}
                  swipeDirection={['up', 'left', 'right', 'down']}
                  style={styles.view}
                  onBackButtonPress={() =>
                    this.setState({visiblePaymentModal: false})
                  }
                  onBackdropPress={() =>
                    this.setState({visiblePaymentModal: false})
                  }
                  transparent={true}>
                  <View style={styles.content}>
                    <View>
                      <Text style={{textAlign: 'center', paddingVertical: 15}}>
                        {' '}
                        Select Payment Method{' '}
                      </Text>
                      <FlatList
                        data={this.state.payments}
                        renderItem={({item}) => (
                          <Card transparent>
                            <Box
                              style={{
                                borderRadius: 10,
                                borderWidth: 0.1,
                                marginHorizontal: 10,
                                borderColor: 'tomato',
                              }}
                              button
                              onPress={() => this.changePaymentMethod(item)}>
                              <View style={{flex: 1, flexDirection: 'column'}}>
                                <Text style={{fontSize: 14}}>
                                  {' '}
                                  {item.datas.label}
                                </Text>
                              </View>
                            </Box>
                          </Card>
                        )}
                        keyExtractor={item => item.key}
                      />
                    </View>
                  </View>
                </Modal>
               
              </Card>
              <View>
                <TearLines ref="top" />
                <View
                  style={styles.invoice}
                  onLayout={e => {
                    this.refs.top.onLayout(e);
                  }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: 'bold',
                      color: '#1aad57',
                    }}>
                    Billing Receipt
                  </Text>

                  <VStack>
                    <FlatList
                      data={this.state.cartItems}
                      renderItem={({item}) => (
                        <View style={{paddingVertical: 5}}>
                          {!item.sale_price ? (
                            <View style={{flexDirection: 'row'}}>
                              <Box
                                style={{
                                  flex: 1,
                                  justifyContent: 'flex-start',
                                  alignItems: 'flex-start',
                                }}>
                                <Text
                                  style={{fontSize: 13, fontWeight: 'bold'}}>
                                  {item.name}
                                </Text>
                                <Text note style={{fontSize: 13}}>
                                  {item.qty} {item.unit} x
                                  {this.props.route.params.currency}
                                  {item.price}
                                </Text>
                                <Text note style={{fontSize: 13}}>
                                  Brand: {item.brand}
                                </Text>
                                <Text note style={{fontSize: 13}}>
                                  by {item.store_name}
                                </Text>
                                <Text note style={{fontSize: 13}}>
                                  Note: {item.note}
                                </Text>
                              </Box>
                              <Box style={{textAlign: 'right'}}>
                                {item.choice == null || item.choice == [] ? (
                                  <Text
                                    style={{
                                      fontSize: 13,
                                      fontWeight: 'bold',
                                      marginBottom: 10,
                                    }}>
                                    {this.props.route.params.currency}
                                    {Math.round(item.price * item.qty * 10) /
                                      10}
                                  </Text>
                                ) : (
                                  <Text
                                    style={{
                                      fontSize: 13,
                                      fontWeight: 'bold',
                                      marginBottom: 10,
                                    }}>
                                    {this.props.route.params.currency}
                                    {Math.round(
                                      (item.price * item.qty +
                                        item.total_addons * item.qty) *
                                        10,
                                    ) / 10}
                                  </Text>
                                )}
                              </Box>
                            </View>
                          ) : (
                            <View style={{flexDirection: 'row'}}>
                              <Box
                                style={{
                                  flex: 1,
                                  justifyContent: 'flex-start',
                                  alignItems: 'flex-start',
                                }}>
                                <Text
                                  style={{fontSize: 13, fontWeight: 'bold'}}>
                                  {item.name}
                                </Text>
                                <Text note style={{fontSize: 13}}>
                                  {item.qty} {item.unit} x{' '}
                                  <Text
                                    style={{
                                      textDecorationLine: 'line-through',
                                      fontSize: 13,
                                    }}>
                                    {' '}
                                    {this.props.route.params.currency}
                                    {item.price}
                                  </Text>
                                  {this.props.route.params.currency}
                                  {item.sale_price}
                                </Text>
                                <Text note style={{fontSize: 13}}>
                                  Brand: {item.brand}
                                </Text>
                                <Text note style={{fontSize: 13}}>
                                  by {item.store_name}
                                </Text>
                                <Text note style={{fontSize: 13}}>
                                  Note: {item.note}
                                </Text>
                              </Box>
                              <Box style={{textAlign: 'right'}}>
                                {item.choice == null || item.choice == [] ? (
                                  <Text
                                    style={{
                                      fontSize: 13,
                                      fontWeight: 'bold',
                                      marginBottom: 10,
                                    }}>
                                    {this.props.route.params.currency}
                                    {Math.round(
                                      item.sale_price * item.qty * 10,
                                    ) / 10}
                                  </Text>
                                ) : (
                                  <Text
                                    style={{
                                      fontSize: 13,
                                      fontWeight: 'bold',
                                      marginBottom: 10,
                                    }}>
                                    {this.props.route.params.currency}
                                    {Math.round(
                                      (item.sale_price * item.qty +
                                        item.total_addons * item.qty) *
                                        10,
                                    ) / 10}
                                  </Text>
                                )}
                              </Box>
                            </View>
                          )}
                        </View>
                      )}
                      keyExtractor={item => item.key}
                    />
                  </VStack>

                  <View>
                    <Box style={{padding: 8, flexDirection: 'column'}}>
                      <HStack>
                        <Text style={{fontSize: 13, color: 'tomato'}}>
                          You have ordered{' '}
                          <Text
                            style={{
                              textDecorationLine: 'underline',
                              color: 'tomato',
                              fontSize: 13,
                              fontWeight: 'bold',
                            }}>
                            {this.cartCount()}
                          </Text>{' '}
                          item/s
                        </Text>
                      </HStack>
                    </Box>
                    <HStack style={{padding: 8}} justifyContent="space-between">
                      <HStack>
                        <Text style={{fontSize: 13, color: 'green'}}>
                          Sub Total
                        </Text>
                      </HStack>
                      <HStack>
                        <NumericFormat
                          renderText={text => (
                            <Text
                              style={{
                                textAlign: 'right',
                                fontSize: 13,
                                color: 'green',
                              }}>
                              {text}
                            </Text>
                          )}
                          value={Math.round(this.state.subtotal * 10) / 10}
                          displayType={'text'}
                          thousandSeparator={true}
                          prefix={this.props.route.params.currency}
                        />
                      </HStack>
                    </HStack>
                    <HStack style={{padding: 8}} justifyContent="space-between">
                      <HStack>
                        <Text style={{fontSize: 13, color: 'green'}}>
                          Distance
                        </Text>
                      </HStack>
                      <HStack>
                        <NumericFormat
                          renderText={text => (
                            <Text
                              style={{
                                textAlign: 'right',
                                fontSize: 13,
                                color: 'green',
                              }}>
                              {text}
                            </Text>
                          )}
                          value={parseFloat(this.state.summary.distance / 1000)}
                          displayType={'text'}
                          thousandSeparator={true}
                          suffix={' km'}
                        />
                      </HStack>
                    </HStack>
                    {this.state.USERAdd > 0 ? (
                      <HStack style={{padding: 8}} justifyContent="space-between">
                        <HStack>
                          <Text style={{fontSize: 13, color: 'green'}}>
                            Reservation Charge
                          </Text>
                        </HStack>
                        <HStack>
                          <NumericFormat
                            renderText={text => (
                              <Text
                                style={{
                                  textAlign: 'right',
                                  fontSize: 13,
                                  color: 'green',
                                }}>
                                {text}
                              </Text>
                            )}
                            value={Math.round(this.state.USERAdd * 10) / 10}
                            displayType={'text'}
                            thousandSeparator={true}
                            prefix={this.props.route.params.currency}
                          />
                        </HStack>
                      </HStack>
                    ) : null}
                    {this.state.discount != 0 ? (
                      <HStack style={{padding: 8}} justifyContent="space-between">
                        <HStack>
                          <Text style={{fontSize: 13, color: 'tomato'}}>
                            Discount
                          </Text>
                        </HStack>
                        <HStack>
                          <Text
                            style={{
                              textAlign: 'right',
                              fontSize: 13,
                              color: 'tomato',
                            }}>
                            {' '}
                            - {this.props.route.params.currency}
                            {this.state.discount}
                          </Text>
                        </HStack>
                      </HStack>
                    ) : null}
                    <View style={styles.line} />
                    <HStack style={{padding: 8}} justifyContent="space-between">
                      <HStack>
                        <Text style={{fontSize: 13, color: 'green'}}>
                          Total
                        </Text>
                      </HStack>
                      <HStack>
                        <Text
                          style={{
                            textAlign: 'right',
                            fontSize: 15,
                            color: 'green',
                          }}>
                          {this.props.route.params.currency}
                          {Math.round(this.calculateOverAllTotal() * 10) / 10 -
                            this.state.discount}
                        </Text>
                      </HStack>
                    </HStack>
                  </View>
                </View>
              </View>
            </ScrollView>
          )}

          {customStyleIndex === 2 ? null : (
            <View
              style={{
                backgroundColor: '#fff',
                borderTopWidth: 2,
                borderColor: '#f6f6f6',
                paddingVertical: 5,
              }}>
              <View style={{flexDirection: 'row'}}>
                <View style={[styles.centerElement, {width: 60}]}>
                  <View style={[styles.centerElement, {width: 32, height: 32}]}>
                    <MaterialCommunityIcons
                      name="ticket"
                      size={20}
                      color="#f0ac12"
                    />
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    flexGrow: 1,
                    flexShrink: 1,
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <Text style={{fontSize: 15}}>Voucher</Text>
                  <View style={{paddingRight: 40}}>
                    <TouchableOpacity
                      onPress={() => this.setState({isVisible: true})}>
                      <Text
                        style={{
                          paddingHorizontal: 10,
                          backgroundColor: '#f0f0f0',
                          height: 25,
                          borderRadius: 4,
                          color: 'tomato',
                          fontSize: 15,
                        }}>
                        Enter Voucher
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <View style={{flexDirection: 'row'}}>
                <View
                  style={{
                    flexDirection: 'row',
                    flexGrow: 1,
                    flexShrink: 1,
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: 10,
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      paddingRight: 20,
                      alignItems: 'center',
                      paddingLeft: 20,
                    }}>
                    <Text
                      style={{
                        color: '#8f8f8f',
                        paddingRight: 30,
                        fontSize: 17,
                      }}>
                      Over-all Total:{' '}
                    </Text>
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
                        Math.round(this.calculateOverAllTotal() * 10) / 10 -
                        this.state.discount
                      }
                      displayType={'text'}
                      thousandSeparator={true}
                      prefix={this.props.route.params.currency}
                    />
                  </View>
                </View>
              </View>
              {this.state.sameCountry != '' ? (
                <View style={{height: 32, alignItems: 'center'}}>
                  <TouchableOpacity
                    disabled
                    style={[
                      styles.centerElement,
                      {
                        backgroundColor: 'gray',
                        width: SCREEN_WIDTH - 10,
                        height: 40,
                        borderRadius: 5,
                        padding: 10,
                      },
                    ]}
                    onPress={() => this.checkOut()}>
                    <Text style={{color: '#ffffff', fontSize: 12}}>
                      {this.state.sameCountry}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : this.state.summary.distance == 0 ? (
                <View style={{height: 40, alignItems: 'center'}}>
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
                    onPress={() => this.calculateDistance()}>
                    <Text style={{color: '#ffffff'}}>Calculate Distance</Text>
                  </TouchableOpacity>
                </View>
              ) : parseFloat(this.state.summary.distance / 1000) > 85 ? (
                <View style={{height: 32, alignItems: 'center'}}>
                  <TouchableOpacity
                    disabled
                    style={[
                      styles.centerElement,
                      {
                        backgroundColor: 'gray',
                        width: SCREEN_WIDTH - 10,
                        height: 40,
                        borderRadius: 5,
                        padding: 10,
                      },
                    ]}
                    onPress={() => this.checkOut()}>
                    <Text style={{color: '#ffffff', fontSize: 12}}>
                      Distance is more than 85 km
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : customStyleIndex == 0 &&
                this.state.ApprovalRequest == true &&
                this.state.account_status == 'New' ? (
                <View style={{height: 32, alignItems: 'center'}}>
                  <TouchableOpacity
                    disabled
                    style={[
                      styles.centerElement,
                      {
                        backgroundColor: 'gray',
                        width: SCREEN_WIDTH - 10,
                        height: 40,
                        borderRadius: 5,
                        padding: 10,
                      },
                    ]}
                    onPress={() => this.checkOut()}>
                    <Text style={{color: '#ffffff', fontSize: 12}}>
                      Your Request is Processing
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : customStyleIndex == 0 &&
                this.state.account_status == 'New' &&
                Math.round(this.state.subtotal * 10) / 10 >
                  this.state.minimumToID ? (
                <View style={{height: 40, alignItems: 'center'}}>
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
                    onPress={() => this.setState({UploadId: true})}>
                    <Text style={{color: '#ffffff'}}>
                      Upload Valid ID for New User
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : customStyleIndex == 0 &&
                this.calculateTotalDeliveryCharge() + this.extraKMCharges() >
                  0 ? (
                <View style={{height: 40, alignItems: 'center'}}>
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
                    onPress={() => this.checkOut()}>
                    <Text style={{color: '#ffffff'}}>Place Order</Text>
                  </TouchableOpacity>
                </View>
              ) : this.state.isready == 1 ? (
                <View style={{height: 40, alignItems: 'center'}}>
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
                    onPress={() => this.checkOut()}>
                    <Text style={{color: '#ffffff'}}>Place Order</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{height: 32, alignItems: 'center'}}>
                  <TouchableOpacity
                    disabled
                    style={[
                      styles.centerElement,
                      {
                        backgroundColor: 'gray',
                        width: SCREEN_WIDTH - 10,
                        height: 40,
                        borderRadius: 5,
                        padding: 10,
                      },
                    ]}
                    onPress={() => this.checkOut()}>
                    <Text style={{color: '#ffffff'}}>Place Order</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          <Modal
            isVisible={this.state.visibleModal}
            animationInTiming={500}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            animationOutTiming={500}
            useNativeDriver={true}
            onBackButtonPress={() => this.OrderSuccess()}
            onBackdropPress={() => this.OrderSuccess()}
            transparent={true}>
            <View style={styles.content}>
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: 10,
                }}>
                <Text style={{color: 'tomato', fontWeight: 'bold'}}>
                  Thank you for using Ariba!
                </Text>
              </View>
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: 20,
                }}>
                <Image
                  style={{height: 150, width: 150}}
                  source={require('../assets/check.png')}
                />
              </View>
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: 10,
                }}>
                <Text style={{color: 'black', fontWeight: 'bold'}}>
                  Your Order is Queued!
                </Text>
                <Text
                  style={{
                    color: 'black',
                    fontWeight: '600',
                    textAlign: 'center',
                  }}>
                  Please wait patiently.
                </Text>
              </View>
              <Button
                block
                style={{height: 50, backgroundColor: '#019fe8'}}
                onPress={() => this.OrderSuccess()}>
                <Text style={{color: 'white'}}>Ok</Text>
              </Button>
            </View>
          </Modal>
          <Modal
            animationInTiming={500}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            animationOutTiming={500}
            useNativeDriver={true}
            isVisible={this.state.isVisible}
            onBackButtonPress={() => this.setState({isVisible: false})}
            onBackdropPress={() => this.setState({isVisible: false})}
            transparent={true}>
            <View style={styles.content}>
              <Text style={{textAlign: 'center'}}>Select Voucher</Text>
              <Divider />
              <FlatList
                data={this.state.vouchers}
                renderItem={({item}) => (
                  <Card transparent>
                    {item.status == 'available' && (
                      <Box style={{borderWidth: 0.1}}>
                        <View
                          style={{flexDirection: 'column', paddingRight: 10}}>
                          <Image
                            style={{
                              padding: 0,
                              margin: 0,
                              height: 30,
                              width: 30,
                            }}
                            source={{uri: item.store_image}}
                          />
                          <Text style={{fontSize: 7, textAlign: 'center'}}>
                            {item.store_name}
                          </Text>
                        </View>
                        <Box style={{paddingLeft: 10}}>
                          <Text style={{fontSize: 14, fontWeight: 'bold'}}>
                            {this.props.route.params.currency}
                            {item.amount} off
                          </Text>
                          <Text note style={{color: '#019fe8', fontSize: 10}}>
                            Min. Spend {item.minimum}
                          </Text>
                        </Box>
                        <Box
                          style={{
                            justifyContent: 'flex-end',
                            alignContent: 'flex-end',
                          }}>
                          <TouchableOpacity
                            onPress={() => this.checkVoucherDetails(item)}>
                            <Text
                              style={{color: '#019fe8', fontStyle: 'italic'}}>
                              Apply
                            </Text>
                          </TouchableOpacity>
                        </Box>
                      </Box>
                    )}
                  </Card>
                )}
                keyExtractor={item => item.id}
              />
            </View>
          </Modal>

          <Modal
            isVisible={this.state.AddTipModals}
            animationInTiming={700}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            animationOutTiming={700}
            useNativeDriver={true}
            onBackdropPress={() => this.setState({AddTipModals: false, tip: 0})}
            transparent={true}>
            <Card style={style.content}>
              <Box>
                <Box
                  style={{
                    flex: 2,
                    justifyContent: 'center',
                    alignContent: 'center',
                  }}>
                  <Text style={{fontSize: 17, fontWeight: 'bold'}}>
                    New Total with Tip:{' '}
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
                        Math.round(this.calculateOverAllTotal() * 10) / 10 -
                        this.state.discount
                      }
                      displayType={'text'}
                      thousandSeparator={true}
                      prefix={this.props.route.params.currency}
                    />
                  </Text>
                </Box>
              </Box>
              <HStack
                icon
                style={{
                  backgroundColor: '#f7f8fa',
                  borderRadius: 10,
                  left: -25,
                  width: SCREEN_WIDTH / 1.26,
                  top: 10,
                }}>
                <Box style={{left: 10}}>
                  <Button style={{backgroundColor: '#FFFFFF'}}>
                    <FontAwesome5
                      name={'hand-holding-usd'}
                      size={25}
                      color="#b5b5b5"
                    />
                  </Button>
                </Box>
                <Box>
                  {this.state.willingtopay == false ? null : (
                    <View
                      style={{
                        height: 40,
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

                      <TouchableOpacity
                        style={{
                          padding: 5,
                          height: '100%',
                          justifyContent: 'center',
                          borderColor: '#ccc',
                          borderWidth: 1,
                          borderRightWidth: 0,
                          alignItems: 'center',
                          width: SCREEN_WIDTH / 6,
                          flexDirection: 'row',
                        }}
                        onPress={() =>
                          this.setState({
                            tipcustom: !this.state.tipcustom,
                            tip: 0,
                            tip100: false,
                            tip200: false,
                            tip50: false,
                          })
                        }>
                        <Text
                          style={{
                            marginTop: 0,
                            fontSize: 12,
                            color: this.state.tipcustom ? '#33c37d' : '#666',
                            fontWeight: this.state.tipcustom
                              ? 'bold'
                              : 'normal',
                          }}>
                          Custom
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
                          width: SCREEN_WIDTH / 4,
                          flexDirection: 'row',
                        }}>
                        <Input
                          placeholder={
                            this.state.tip == 0
                              ? 'Tip Amount'
                              : this.state.tip.toString()
                          }
                          value={this.state.tip.toString()}
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

              <Button
                block
                style={{height: 50, backgroundColor: '#33c37d', marginTop: 30}}
                onPress={() => this.finalCheckout()}>
                <Text style={{color: 'white'}}>Proceed to Checkout</Text>
              </Button>
            </Card>
          </Modal>
        </Box>
      </Box>
    );
  }
  async submitValidID() {
    const userId = await AsyncStorage.getItem('uid');
    console.log('pressed');
    if (this.state.vID == '') {
      Alert.alert('Complete the field', 'Please Select Valid Id');
      return;
    }
    if (this.state.ImageTobeUploaded == null) {
      Alert.alert('Complete the field', 'Please Upload Your I.D');
      return;
    }
    this.setState({loading: true});
    let base64Img = `data:image/jpg;base64,${this.state.ImageTobeUploaded}`;
    let data = {
      file: base64Img,
      upload_preset: 'bgzuxcoc',
    };
    let CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/kusinahanglan/upload';
    fetch(CLOUDINARY_URL, {
      body: JSON.stringify(data),
      headers: {
        'content-type': 'application/json',
      },
      method: 'POST',
    })
      .then(async r => {
        let data = await r.json();
        console.log('url: ', 'https' + data.url.slice(4));
        firestore()
          .collection('users')
          .doc(userId)
          .update({
            ValidId: 'https' + data.url.slice(4),
            IDType: this.state.vID,
            ApprovalRequest: true,
            RequestTime: moment().unix(),
          });
        this.setState({loading: false, UploadId: false});
        Alert.alert(
          'Submission Complete!',
          'We will process your verification',
        );
      })
      .catch(err =>
        Alert.alert('Upload Image Failed', err, [
          {
            text: 'OK',
            onPress: () => this.setState({DetailsModal: false, loading: false}),
          },
        ]),
      );
  }

  async checkOut() {
    Alert.alert('Proceed to check-out?', '', [
      {text: 'Cancel', onPress: () => null},
      {text: 'Yes', onPress: () => this.finalCheckout()},
    ]);
  }

  async finalCheckout() {
    this.setState({loading: true});
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
    const updateNote = firestore().collection('users').doc(userId);
    const getAdminId = this.state.cartItems[0];
    const datavalue = {
      storeAddress: this.state.storeAddress,
      admin_token: this.state.admin_token.concat(this.state.Ridertokens),
      city: this.state.cartItems[0].city,
      currency: this.props.route.params.currency,
      deductionStorePercentage: this.state.StoreDeduction,
      StoreDeduction:
        (Math.round(this.state.subtotal * 10) / 10) * this.state.StoreDeduction,
      USERAdd: this.state.USERAdd,
      SubProductType: 'Delivery',
      OrderNo: this.state.counter,
      OrderId: newDocumentID,
      Mode: this.state.customStyleIndex === 1 ? 'Pick-up' : 'Delivery',
      OrderStatus: this.state.customStyleIndex === 1 ? 'Processing' : 'Pending',
      adminID: getAdminId.adminID,
      originalAddress: this.props.route.params.fromPlace,
      AccountInfo: {
        context: this.state.context,
        name: this.state.account_name,
        address: this.state.account_address,
        phone: this.state.account_number,
        email: this.state.account_email,
        barangay:
          this.state.billing_barangay == undefined
            ? ''
            : this.state.billing_barangay,
        city: this.state.account_city.trim(),
        province: this.state.account_province.toLowerCase(),
        status: this.state.account_status,
        arrayofCity: this.state.arrayofCity,
      },
      Billing: {
        context: this.state.billing_context,
        name: this.state.billing_name,
        address: this.state.billing_street,
        phone: this.state.billing_phone,
        barangay:
          this.state.billing_barangay == undefined
            ? ''
            : this.state.billing_barangay,
        province: this.state.billing_province.toLowerCase(),
        city: this.state.billing_city,
        billing_city: this.state.billing_city,
        arrayofCity: this.state.arrayofCity,
      },
      arrayofCity: this.state.arrayofCity,
      Products: this.state.cartItems,
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
      Timestamp: moment().unix(),
      notification_token: this.token().filter(a => a),
      user_token: this.state.userToken,
      Note: this.state.note,
      StoreIds: this.storeID(),
      Stores: this.storeIDS(),
      PaymentMethod: this.state.paymentMethod,
      DeliveredBy: '',
      rider_id: '',
      isCancelled: false,
      userId: userId,
      subtotal: this.state.subtotal,
      delivery_charge: this.calculateTotalDeliveryCharge(),
      extraKmCharge: this.extraKMCharges(),
      distance: this.state.summary.distance,
      ULat: this.state.ULat,
      ULong: this.state.ULong,
      discount: this.state.discount,
      voucherUsed: this.state.voucherCode,
      ProductType: 'Foods',
      tip: this.state.tip,
    };
    console.log('datavalue: ', datavalue);

    this.checkoutref
      .collection('orders')
      .doc(newDocumentID)
      .set(datavalue)
      .then(docRef => {
        this.state.cartItems.forEach(item => {
          this.updateref
            .collection('products')
            .doc(item.id)
            .update({quantity: firestore.FieldValue.increment(-item.qty)});
        });
      })
      .then(
        updatecounts.update({counter: firestore.FieldValue.increment(1)}),
        updateUserOrders.update({
          ordered_times: firestore.FieldValue.increment(1),
        }),
        this.deleteCart(),
        this.onVoucherUse(),
        this.setState({
          loading: false,
          visibleModal: true,
        }),
      );
  }

  async deleteCart() {
    const userId = await AsyncStorage.getItem('uid');
    AsyncStorage.removeItem('cluster');
    firestore()
      .collection('cart')
      .doc(userId)
      .delete()
      .catch(function (error) {
        //  console.log("Error deleting documents: ", error);
      });
  }

  async onVoucherUse() {
    let userId = await AsyncStorage.getItem('uid');
    let cartRef = firestore().collection('user_vouchers').doc(userId);
    if (this.state.voucherCode) {
      /* Get current cart contents */
      cartRef.get().then(snapshot => {
        let updatedCart = Object.values(snapshot.data()); /* Clone it first */
        let itemIndex = updatedCart.findIndex(
          item => this.state.voucherCode === item.id,
        ); /* Get the index of the item we want to delete */

        /* Set item quantity */
        updatedCart[itemIndex]['status'] = 'used';

        /* Set updated cart in firebase, no need to use setState because we already have a realtime cart listener in the componentDidMount() */
        cartRef.set(Object.assign({}, updatedCart));
      });
    }
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
