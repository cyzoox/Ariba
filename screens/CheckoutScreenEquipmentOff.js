import React, {Component} from 'react';
import {
  AppState,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Alert,
  Image,
  TouchableWithoutFeedback,
  FlatList,
  SafeAreaView,
  ScrollView,
  Animated,
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
  Title,
  Card,
  CardItem,
  Body,
  Item,
  Input,
  List,
  Picker,
  ListItem,
  Thumbnail,
  Text,
  Form,
  Textarea,
  Toast,
  Root,
  Header,
} from 'native-base';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// Our custom files and classes import
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
import AccountInfo from './checkout/AccountInfo';
import DeliveryDetails from './checkout/DeliveryDetails';
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
import {FlatGrid} from 'react-native-super-grid';
import MapboxGL, {Logger} from '@react-native-mapbox-gl/maps';
import PhotoGrid from '../components/PhotoGrid';
import {SliderBox} from 'react-native-image-slider-box';
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

export default class CheckoutScreenEquipmentOff extends Component {
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
    const datas = this.props.route.params.datas;
    this.state = {
      appState: AppState.currentState,
      // slatitude:cart[0].slatitude,
      //slongitude:cart[0].slongitude,
      // cartItems: cart,
      VisibleAddInfo: false,
      datas: datas,
      cLong: this.props.route.params.cLong,
      cLat: this.props.route.params.cLat,
      driver_charge: 0,
      xtra: 0,
      labor: 0,
      deliveryCharge: 0,
      pickup: 0,
      stores: [],
      paymentMethod: 'Cash on Delivery (COD)',
      billing_name: '',
      billing_postal: '',
      billing_phone: '',
      billing_street: '',
      billing_country: '',
      billing_province: '',
      billing_city: '',
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
      SelectedPricing:
        datas.StatDayPrice == true
          ? 'Day'
          : datas.StatHourPrice == true
          ? 'Hour'
          : datas.StatWeeklyPrice == true
          ? 'Weekly'
          : 'Monthly',
      minimum: 0,
      selectedIndex: 0,
      selectedIndices: [0],
      customStyleIndex: 0,
      isready: 0,
      visibleAddressModalTo: false,
      phone: 'Select Phone Number',
      passenger: '1',
      note: '',
      AlwaysOpen: true,
      Customerimage: null,
      Duration: '1',
      FinalCheckout: false,
      warningText: '',
      warningModal: false,
      MBrand: '',
      MotorCR: '',
      MotorOR: '',
      ColorMotor: '',
      PlateNo: '',
      VModel: '',
      notification_token: [],
      storewallet: 0,
      showURL: false,
      SelectedURL: '',
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
      admin_token: [],
      AlwaysOpen: true,
      admin_control: true,
      Storestatus: true,
      StoreendDate: null,
      StorestartDate: null,
    };
  }

  openGallery = () => {
    /* ImagePicker.launchImageLibrary({
        maxWidth: 500,
        maxHeight: 500,
        mediaType: 'photo',
        includeBase64: true,
    }, image => {
     
        if(image.didCancel== true){
  return;
        }
    this.setState({Customerimage:image.assets[0].base64})
                 })
 */
  };
  showDatePickerend = () => {
    this.setState({isDatePickerVisibleend: true});
  };

  hideDatePickerend = () => {
    this.setState({isDatePickerVisibleend: false});
  };

  handleConfirmend = date => {
    console.warn('A date has been picked: ', date);
    this.setState({Dateend: date, newDateend: moment(date).unix()});
    this.hideDatePickerend();
  };

  showDatePicker = () => {
    this.setState({isDatePickerVisible: true});
  };

  hideDatePicker = () => {
    this.setState({isDatePickerVisible: false});
  };

  handleConfirm = date => {
    console.warn('A date has been picked: ', date);
    this.setState({startDate: date, newstartDate: moment(date).unix()});
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
              loading: false,
            }); /* !!!! setState is running multiple times here, figure out how to detect when child_added completed*/
          });
        } else {
          self.setState({vouchers: [], loading: false});
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
        Toast.show({
          text: 'Inapplicable Voucher',
          position: 'center',
          type: 'warning',
          textStyle: {textAlign: 'center'},
        });
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
    //this.setState({loading: true})
    firestore()
      .collection('admin_token')
      .where('city', '==', this.props.route.params.datas.city)
      .onSnapshot(
        querySnapshot => {
          const orders = [];
          querySnapshot.forEach(doc => {
            this.setState({
              admin_token: doc.data().tokens,
            });
          });
        },
        error => {
          console.log(error);
        },
      );
    this._bootstrapAsync();
    //this.getAdminCharge();
    //this.subscribe = this.chargeref.onSnapshot(this.onCollectionUpdateCharge);
    //  this.storeID();
    // this.storeIDS();
    // this.component();
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
    this.billinglistener = this.billingRef
      .collection('users')
      .where('userId', '==', userId)
      .onSnapshot(this.onCollectionUpdateBilling);

    this.ordercounters = this.ordercounters
      .collection('orderCounter')
      .onSnapshot(this.OrderCounter);
    firestore()
      .collection('stores')
      .where('id', '==', this.props.route.params.datas.storeId)
      .onSnapshot(querySnapshot => {
        querySnapshot.forEach(doc => {
          this.setState({
            notification_token: doc.data().notification_token,
            storewallet: doc.data().wallet,
            AlwaysOpen: doc.data().AlwaysOpen,
            admin_control: doc.data().admin_control,
            Storestatus: doc.data().status,
            StoreendDate:
              doc.data().endDate == undefined ? null : doc.data().endDate,
            StorestartDate:
              doc.data().startDate == undefined ? null : doc.data().startDate,
          });
        });
      });

    this.setState({uid: userId});

    firestore()
      .collection('charges')
      .where('id', '==', this.props.route.params.datas.adminID)
      .onSnapshot(querySnapshot => {
        querySnapshot.forEach(doc => {
          console.log('adminname: ', doc.data().name);
          this.setState({
            adminname: doc.data().name,
          });
        });
      });
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
      this.setState({
        account_name: doc.data().Name,
        account_address: doc.data().Address.Address,
        account_city: doc.data().Address.City,
        account_barangay: doc.data().Address.Barangay,
        account_province: doc.data().Address.Province,
        account_email: doc.data().Email,
        account_number: doc.data().Mobile,
        account_cluster: doc.data().Address.Cluster,
        account_status: doc.data().status,
        phone: doc.data().Mobile,
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

    //total = this.calculateLaborCharge() + this.calculatePickupCharge() + this.state.deliveryCharge;

    return total;
  }

  extraKMCharges() {
    //total = this.calculateLaborCharge() + this.calculatePickupCharge() + this.state.deliveryCharge;

    return 0;
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
          billing_province: item.province,
          billing_barangay: item.barangay,
          billing_city: item.city,
          billing_street: item.address,
          billing_postal: item.postal,
          USERlat: item.lat,
          USERlong: item.long,
          flat: item.lat,
          flong: item.long,
          loading: false,
        });
        //this.checkbarangay(item.barangay);

        const {slatitude, slongitude} = this.state;
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
    this.setState({
      billing_name: item.name,
      billing_phone: item.phone,
      billing_province: item.province,
      billing_city: item.city,
      billing_street: item.address,
      billing_postal: item.postal,
      billing_barangay: item.barangay,

      visibleAddressModal: false,

      loading: false,
    });
    //this.checkbarangay(item.barangay);

    const {slatitude, slongitude} = this.state;
  }
  changeAddressto(item) {
    this.setState({
      billing_nameTo: item.name,
      billing_phoneTo: item.phone,
      billing_provinceTo: item.province,
      billing_cityTo: item.city,
      billing_streetTo: item.address,
      billing_postalTo: item.postal,
      billing_barangayTo: item.barangay,
      flatTo: item.lat,
      flongTo: item.long,
      visibleAddressModalTo: false,
      loading: false,
    });
    //this.checkbarangay(item.barangay);

    const {flat, flong} = this.state;
  }
  changePaymentMethod(item) {
    this.setState({
      paymentMethod: item.datas.label,
      visiblePaymentModal: false,
    });
  }
  openGalleryLicense = () => {
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
        this.setState({ImageLicense: image.assets[0].base64});
        const base64Img = `data:image/jpg;base64,${image.assets[0].base64}`;
        const data = {
          file: base64Img,
          upload_preset: 'bgzuxcoc',
        };
        const CLOUDINARY_URL =
          'https://api.cloudinary.com/v1_1/kusinahanglan/upload';
        fetch(CLOUDINARY_URL, {
          body: JSON.stringify(data),
          headers: {
            'content-type': 'application/json',
          },
          method: 'POST',
        }).then(async r => {
          let data = await r.json();
          this.setState({ImageLicenseLink: 'https' + data.url.slice(4)});
        });
      },
    );
  };
  openGallerylaunchCameraLicense = () => {
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
        this.setState({ImageLicense: image.assets[0].base64});
        const base64Img = `data:image/jpg;base64,${image.assets[0].base64}`;
        const data = {
          file: base64Img,
          upload_preset: 'bgzuxcoc',
        };
        const CLOUDINARY_URL =
          'https://api.cloudinary.com/v1_1/kusinahanglan/upload';
        fetch(CLOUDINARY_URL, {
          body: JSON.stringify(data),
          headers: {
            'content-type': 'application/json',
          },
          method: 'POST',
        }).then(async r => {
          let data = await r.json();
          this.setState({ImageLicenseLink: 'https' + data.url.slice(4)});
        });
      },
    );
  };

  openGalleryID = () => {
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
        this.setState({ImageID: image.assets[0].base64});
        const base64Img = `data:image/jpg;base64,${image.assets[0].base64}`;
        const data = {
          file: base64Img,
          upload_preset: 'bgzuxcoc',
        };
        const CLOUDINARY_URL =
          'https://api.cloudinary.com/v1_1/kusinahanglan/upload';
        fetch(CLOUDINARY_URL, {
          body: JSON.stringify(data),
          headers: {
            'content-type': 'application/json',
          },
          method: 'POST',
        }).then(async r => {
          let data = await r.json();
          this.setState({ImageIDLink: 'https' + data.url.slice(4)});
        });
      },
    );
  };
  openGallerylaunchCameraID = () => {
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
        this.setState({ImageID: image.assets[0].base64});
        const base64Img = `data:image/jpg;base64,${image.assets[0].base64}`;
        const data = {
          file: base64Img,
          upload_preset: 'bgzuxcoc',
        };
        const CLOUDINARY_URL =
          'https://api.cloudinary.com/v1_1/kusinahanglan/upload';
        fetch(CLOUDINARY_URL, {
          body: JSON.stringify(data),
          headers: {
            'content-type': 'application/json',
          },
          method: 'POST',
        }).then(async r => {
          let data = await r.json();
          this.setState({ImageIDLink: 'https' + data.url.slice(4)});
        });
      },
    );
  };

  handleCustomIndexSelect = (index: number) => {
    //handle tab selection for custom Tab Selection SegmentedControlTab
    this.setState(prevState => ({...prevState, customStyleIndex: index}));
  };

  navigateAddress() {
    this.setState({visibleAddressModal: false});
    this.props.navigation.navigate('Address');
  }

  FinalCheckouts() {
    let in_check_extension = moment(this.state.newstartDate * 1000).format(
      'DD-MM-YYYY HH:mm:ss',
    );
    let out_check_extension = moment(this.state.newDateend * 1000).format(
      'DD-MM-YYYY HH:mm:ss',
    );
    const a = moment(this.state.newstartDate * 1000);
    const b = moment(this.state.newDateend * 1000);
    const diff = b.diff(a, 'hours');
    console.log('diff', diff);
    const diffdays = b.diff(a, 'days');
    console.log('diffdays: ', diffdays);
    console.log('in_check_extension: ', in_check_extension);
    console.log('out_check_extension: ', out_check_extension);

    const total =
      this.state.SelectedPricing == 'Day'
        ? (Math.round((diff / 24) * 10) / 10) *
          (Math.round(this.state.datas.DayPrice * 10) / 10)
        : this.state.SelectedPricing == 'Hour'
        ? (Math.round(diff * 10) / 10) *
          (Math.round(this.state.datas.HourPrice * 10) / 10)
        : this.state.SelectedPricing == 'Weekly'
        ? (Math.round(this.state.Duration * 10) / 10) *
          (Math.round(this.state.datas.WeeklyPrice * 10) / 10)
        : (Math.round(this.state.Duration * 10) / 10) *
          (Math.round(this.state.datas.MonthlyPrice * 10) / 10);

    if (this.state.datas.rentalType == 'Vehicle') {
      if (this.state.ImageLicenseLink == undefined) {
        Alert.alert(
          'Upload Driver License',
          'Plase make sure the details are clear',
        );
        return;
      }
      if (this.state.ImageIDLink == undefined) {
        Alert.alert(
          'Upload valid I.D',
          'Plase make sure the details are clear',
        );
        return;
      }
    }
    if (this.state.SelectedPricing == undefined) {
      this.setState({warningText: 'Choose Rate', warningModal: true});
      return;
    }

    if (this.state.startDate == undefined) {
      this.setState({
        warningText: 'Enter Start Date of Rental',
        warningModal: true,
      });
      return;
    }

    if (
      this.state.SelectedPricing == 'Day' ||
      this.state.SelectedPricing == 'Hour'
    ) {
      if (this.state.Dateend == undefined) {
        this.setState({
          warningText: 'Enter End Date of REntal',
          warningModal: true,
        });
        return;
      }
    }
    this.setState({numberofhours: diff, FinalCheckout: true, total: total});
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

  StartImageRotationFunction() {
    this.Rotatevalue.setValue(0);
    Animated.timing(this.Rotatevalue, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: true, // Add this line
    }).start(() => this.StartImageRotationFunction());
  }

  ReferenceNo1(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  ReferenceNo2(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  ReferenceNo3(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  ReferenceNo4(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  ReferenceNo5(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  ReferenceNo6(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
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

    let StatDayPrice = this.state.datas.StatDayPrice == true ? 'Day' : null;
    let StatHourPrice = this.state.datas.StatHourPrice == true ? 'Hour' : null;
    let StatWeeklyPrice =
      this.state.datas.StatWeeklyPrice == true ? 'Weekly' : null;
    let StatMonthlyPrice =
      this.state.datas.StatMonthlyPrice == true ? 'Monthly' : null;
    let DropdownSelect = [
      StatHourPrice,
      StatDayPrice,
      StatWeeklyPrice,
      StatMonthlyPrice,
    ];
    let pricetoPay =
      this.state.SelectedPricing == 'Hour'
        ? this.state.datas.HourPrice
        : this.state.SelectedPricing == 'Day'
        ? this.state.datas.DayPrice
        : this.state.SelectedPricing == 'Weekly'
        ? this.state.datas.WeeklyPrice
        : this.state.datas.MonthlyPrice;
    console.log('cLat: ', this.state.cLat);

    let out =
      this.state.SelectedPricing == 'Weekly'
        ? moment(this.state.startDate)
            .add(7 * parseInt(this.state.Duration), 'days')
            .unix()
        : this.state.SelectedPricing == 'Monthly'
        ? moment(this.state.startDate)
            .add(30 * parseInt(this.state.Duration), 'days')
            .unix()
        : moment(this.state.Dateend).unix();
    console.log('imageArray: ', this.state.datas.imageArray);

    console.log('this.state.startDate: ', this.state.startDate);
    let Closing = false;

    if (this.state.StorestartDate != null) {
      console.log(
        'this.props.product.startDate.seconds: ',
        moment(this.state.StorestartDate.seconds * 1000).format('H:mm:ss'),
      );
      console.log(
        'this.props.product.endDate.seconds: ',
        moment(this.state.StoreendDate.seconds * 1000).format('H:mm:ss'),
      );
      var startTime = moment(this.state.StorestartDate.seconds * 1000).format(
        'H:mm:ss',
      );
      var endTime = moment(this.state.StoreendDate.seconds * 1000).format(
        'H:mm:ss',
      );
      var selectedDate = moment(this.state.newstartDate * 1000).format(
        'DD-MM-YYYY HH:mm:ss',
      );
      currentDate = new Date();
      var currentDateselectedDate =
        this.state.startDate == undefined ? new Date() : this.state.startDate;
      console.log('selectedDate: ', selectedDate);
      console.log('currentDate: ', currentDate);

      startDate = new Date(currentDateselectedDate.getTime());

      startDate.setHours(startTime.split(':')[0]);
      startDate.setMinutes(startTime.split(':')[1]);
      startDate.setSeconds(startTime.split(':')[2]);

      endDate = new Date(currentDateselectedDate.getTime());
      endDate.setHours(endTime.split(':')[0]);
      endDate.setMinutes(endTime.split(':')[1]);
      endDate.setSeconds(endTime.split(':')[2]);
      console.log('startDate: ', startDate);
      console.log('endDate: ', endDate);
      console.log('currentDateselectedDate: ', currentDateselectedDate);
      Closing = valid =
        startDate < currentDateselectedDate &&
        endDate > currentDateselectedDate;
      console.log(
        'res: ',
        (valid =
          startDate < currentDateselectedDate &&
          endDate > currentDateselectedDate),
      );
    }
    return (
      <Root>
        <Container style={{backgroundColor: '#CCCCCC'}}>
          <Header
            androidStatusBarColor="#2c3e50"
            style={{display: 'none'}}
            style={{backgroundColor: '#183c57'}}>
            <Left style={{flex: 3, flexDirection: 'row'}}>
              <Button
                transparent
                onPress={() => this.props.navigation.goBack()}>
                <MaterialIcons name="arrow-back" size={25} color="white" />
              </Button>
              <Title style={{color: 'white', marginTop: 7, marginLeft: 10}}>
                Ariba
              </Title>
            </Left>
          </Header>
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
                justifyContent: 'flex-end',
                alignItems: 'center',
                width: Dimensions.get('window').width,
                height: Dimensions.get('window').height,
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
                }}>
                <MapboxGL.Camera
                  centerCoordinate={[
                    this.props.route.params.cLat,
                    this.props.route.params.cLong,
                  ]}
                  zoomLevel={15}
                  followUserMode={'normal'}
                />

                <MapboxGL.UserLocation
                  visible={true}
                  showsUserHeadingIndicator={true}
                />

                <MapboxGL.PointAnnotation
                  coordinate={[
                    this.props.route.params.cLat,
                    this.props.route.params.cLong,
                  ]}
                />
              </MapboxGL.MapView>

              {/*<MapView
      provider={PROVIDER_GOOGLE}
      zoomEnabled={true}
        showsUserLocation={true}
        scrollEnabled={true}
                pitchEnabled={true}
        style={{ position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0}}
          region={{
            latitude: this.state.cLong,
            longitude:this.state.cLat,
           latitudeDelta: 0.01,
              longitudeDelta: 0.005
          }}
          >
        
          <MapView.Marker
             coordinate={{latitude: this.state.cLong, longitude: this.state.cLat}}
             title={"Location"}
             description={'Location Here'}
             image={Rider_img}
          />
          </MapView>*/}
            </View>
          </View>
          <View>
            <ScrollView>
              <Card>
                <CardItem
                  button
                  onPress={() => this.setState({visibleAddressModal: true})}>
                  <Text style={{fontWeight: 'bold'}}>Address: </Text>
                  {!this.state.loading && (
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'column',
                        paddingHorizontal: 10,
                      }}>
                      <Text style={{fontSize: 14}}>
                        {this.state.datas.address} (
                        {this.state.datas.DetailedAddress})
                      </Text>
                    </View>
                  )}
                </CardItem>
                {this.state.datas.rentalType != 'Property' ? null : (
                  <CardItem
                    button
                    onPress={() =>
                      this.setState({visibleAddressModalTo: true})
                    }>
                    <Left
                      style={{
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start',
                      }}>
                      <Text style={{fontWeight: 'bold', fontSize: 15}}>
                        Property:
                      </Text>
                      <Text>{this.state.datas.name}</Text>
                      <Text style={{fontSize: 14}}>
                        {!this.state.AlwaysOpen && this.state.startDate != null
                          ? '(' +
                            moment(
                              this.state.StorestartDate.seconds * 1000,
                            ).format('h:mm a') +
                            '-' +
                            moment(
                              this.state.StoreendDate.seconds * 1000,
                            ).format('h:mm a') +
                            ')'
                          : null}
                      </Text>
                    </Left>
                    <Body>
                      <Text style={{fontWeight: 'bold'}}>Description:</Text>
                      <Text>{this.state.datas.description}</Text>
                    </Body>
                    <Right>
                      <Text style={{fontWeight: 'bold'}}>Ameneties:</Text>
                      <Text>{this.state.datas.ameneties}</Text>
                    </Right>
                  </CardItem>
                )}
                {this.state.datas.rentalType != 'Vehicle' ? null : (
                  <CardItem
                    button
                    onPress={() =>
                      this.setState({visibleAddressModalTo: true})
                    }>
                    <Text style={{fontWeight: 'bold'}}>Vehicle: </Text>
                    <Left>
                      <Text>{this.state.datas.name}</Text>
                    </Left>
                    <Body>
                      <Text style={{fontWeight: 'bold'}}>Brand & Model:</Text>
                      <Text>
                        {this.state.datas.MBrand} {this.state.datas.VModel}
                      </Text>
                    </Body>
                    <Right>
                      <Text style={{fontWeight: 'bold'}}>Ameneties:</Text>
                      <Text>{this.state.datas.ameneties}</Text>
                    </Right>
                  </CardItem>
                )}
              </Card>

              <View
                style={{height: 40, alignItems: 'center', marginBottom: 10}}>
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
                  onPress={() => this.setState({VisibleAddInfo: true})}>
                  <Text style={{color: '#ffffff'}}>Book Now</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>

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
            <Card
              style={{
                backgroundColor: 'white',
                padding: 22,
                borderRadius: 4,
                borderColor: 'rgba(0, 0, 0, 0.1)',
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
                  color="gray"
                  size={25}
                  onPress={() => this.setState({VisibleAddInfo: false})}
                />
              </View>
              <ScrollView>
                {this.state.datas.rentalType == 'Vehicle' ? (
                  <Text
                    style={{marginTop: 5, fontSize: 13, fontWeight: 'bold'}}>
                    Driver License
                  </Text>
                ) : null}
                {this.state.datas.rentalType == 'Vehicle' ? (
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
                          this.state.ImageLicense == undefined
                            ? require('./license.png')
                            : {
                                uri: `data:image;base64,${this.state.ImageLicense}`,
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
                          this.openGalleryLicense();
                        }}
                      />
                      <MaterialIcons
                        name="photo-camera"
                        size={30}
                        style={{marginTop: 20}}
                        onPress={() => {
                          this.openGallerylaunchCameraLicense();
                        }}
                      />
                    </View>
                  </View>
                ) : null}
                {this.state.datas.rentalType == 'Vehicle' ? (
                  <Text
                    style={{marginTop: 5, fontSize: 13, fontWeight: 'bold'}}>
                    Valid I.D
                  </Text>
                ) : null}
                {this.state.datas.rentalType == 'Vehicle' ? (
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
                          this.state.ImageID == null
                            ? require('./id.png')
                            : {uri: `data:image;base64,${this.state.ImageID}`}
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
                          this.openGalleryID();
                        }}
                      />
                      <MaterialIcons
                        name="photo-camera"
                        size={30}
                        style={{marginTop: 20}}
                        onPress={() => {
                          this.openGallerylaunchCameraID();
                        }}
                      />
                    </View>
                  </View>
                ) : null}

                <Text style={{marginTop: 5, fontSize: 13, fontWeight: 'bold'}}>
                  Price
                </Text>
                <ListItem
                  icon
                  style={{
                    backgroundColor: '#f7f8fa',
                    borderRadius: 10,
                    left: -25,
                    width: SCREEN_WIDTH / 1.14,
                  }}>
                  <Left style={{left: 10}}>
                    <Button style={{backgroundColor: '#FFFFFF'}}>
                      <FontAwesome5
                        name={'money-bill'}
                        size={20}
                        color="#b5b5b5"
                      />
                    </Button>
                  </Left>
                  <Body>
                    <Input
                      value={
                        this.state.SelectedPricing == undefined
                          ? 'Select Mode of Pricing'
                          : parseFloat(pricetoPay)
                              .toFixed(2)
                              .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
                              .toString() +
                            ' /' +
                            this.state.SelectedPricing
                      }
                      placeholderTextColor="#687373"
                    />
                  </Body>
                </ListItem>

                {this.state.datas.rentalType == 'Vehicle' ? (
                  <Text
                    style={{marginTop: 5, fontSize: 13, fontWeight: 'bold'}}>
                    Number of Person
                  </Text>
                ) : null}
                {this.state.datas.rentalType == 'Vehicle' ? (
                  <ListItem
                    icon
                    style={{
                      backgroundColor: '#f7f8fa',
                      borderRadius: 10,
                      left: -25,
                      width: SCREEN_WIDTH / 1.14,
                    }}>
                    <Left style={{left: 10}}>
                      <Button style={{backgroundColor: '#FFFFFF'}}>
                        <Fontisto name={'persons'} size={25} color="#b5b5b5" />
                      </Button>
                    </Left>
                    <Body>
                      <Input
                        value={this.state.passenger}
                        keyboardType={'number-pad'}
                        onChangeText={text => {
                          isNaN(text) ? null : this.setState({passenger: text});
                        }}
                        placeholderTextColor="#687373"
                      />
                    </Body>
                  </ListItem>
                ) : null}

                <Text style={{marginTop: 5, fontSize: 13, fontWeight: 'bold'}}>
                  Start Date of Rental
                </Text>
                <ListItem
                  icon
                  style={{
                    backgroundColor: '#f7f8fa',
                    borderRadius: 10,
                    left: -25,
                    width: SCREEN_WIDTH / 1.14,
                  }}>
                  <Left style={{left: 10}}>
                    <Button style={{backgroundColor: '#FFFFFF'}}>
                      <MaterialCommunityIcons
                        name={'calendar-clock'}
                        size={25}
                        color="#b5b5b5"
                      />
                    </Button>
                  </Left>
                  <Body>
                    <TouchableOpacity
                      onPress={this.showDatePicker}
                      style={{width: '90%'}}>
                      <Text style={{width: '90%'}}>
                        {this.state.startDate === ''
                          ? 'Start Date/Time'
                          : moment(this.state.startDate).format(
                              'MMM D, YYYY h:mm a',
                            )}
                      </Text>
                    </TouchableOpacity>
                  </Body>
                </ListItem>
                <DateTimePickerModal
                  isVisible={this.state.isDatePickerVisible}
                  mode="datetime"
                  onConfirm={this.handleConfirm}
                  onCancel={this.hideDatePicker}
                />

                {this.state.SelectedPricing == 'Weekly' ||
                this.state.SelectedPricing == 'Monthly' ? (
                  <Text
                    style={{marginTop: 5, fontSize: 13, fontWeight: 'bold'}}>
                    No of{' '}
                    {this.state.SelectedPricing == 'Weekly'
                      ? 'Week'
                      : this.state.SelectedPricing == 'Monthly'
                      ? 'Month'
                      : null}
                  </Text>
                ) : null}
                {this.state.SelectedPricing == 'Weekly' ||
                this.state.SelectedPricing == 'Monthly' ? (
                  <ListItem
                    icon
                    style={{
                      backgroundColor: '#f7f8fa',
                      borderRadius: 10,
                      left: -25,
                      width: SCREEN_WIDTH / 1.14,
                    }}>
                    <Left style={{left: 10}}>
                      <Button style={{backgroundColor: '#FFFFFF'}}>
                        <MaterialCommunityIcons
                          name={'calendar-week'}
                          size={25}
                          color="#b5b5b5"
                        />
                      </Button>
                    </Left>
                    <Body>
                      <Input
                        placeholder={this.state.Duration}
                        value={this.state.Duration}
                        keyboardType={'number-pad'}
                        onChangeText={text => {
                          isNaN(text) ? null : this.setState({Duration: text});
                        }}
                        placeholderTextColor="#687373"
                      />
                    </Body>
                  </ListItem>
                ) : null}

                <Text style={{marginTop: 5, fontSize: 13, fontWeight: 'bold'}}>
                  End Date of Rental
                </Text>
                {this.state.SelectedPricing == 'Weekly' ? (
                  <ListItem
                    icon
                    style={{
                      backgroundColor: '#f7f8fa',
                      borderRadius: 10,
                      left: -25,
                      width: SCREEN_WIDTH / 1.14,
                    }}>
                    <Left style={{left: 10}}>
                      <Button style={{backgroundColor: '#FFFFFF'}}>
                        <MaterialCommunityIcons
                          name={'calendar-check'}
                          size={25}
                          color="#b5b5b5"
                        />
                      </Button>
                    </Left>
                    <Body>
                      <TouchableOpacity style={{width: '90%'}}>
                        <Text style={{width: '90%'}}>
                          {this.state.startDate === ''
                            ? 'Start Date/Time'
                            : moment(this.state.startDate)
                                .add(7 * parseInt(this.state.Duration), 'days')
                                .format('MMM D, YYYY h:mm a')}
                        </Text>
                      </TouchableOpacity>
                    </Body>
                  </ListItem>
                ) : this.state.SelectedPricing == 'Monthly' ? (
                  <ListItem
                    icon
                    style={{
                      backgroundColor: '#f7f8fa',
                      borderRadius: 10,
                      left: -25,
                      width: SCREEN_WIDTH / 1.14,
                    }}>
                    <Left style={{left: 10}}>
                      <Button style={{backgroundColor: '#FFFFFF'}}>
                        <MaterialCommunityIcons
                          name={'calendar-check'}
                          size={25}
                          colorcolor="#b5b5b5"
                        />
                      </Button>
                    </Left>
                    <Body>
                      <TouchableOpacity style={{width: '90%'}}>
                        <Text style={{width: '90%'}}>
                          {this.state.startDate === ''
                            ? 'Start Date/Time'
                            : moment(this.state.startDate)
                                .add(30 * parseInt(this.state.Duration), 'days')
                                .format('MMM D, YYYY h:mm a')}
                        </Text>
                      </TouchableOpacity>
                    </Body>
                  </ListItem>
                ) : (
                  <ListItem
                    icon
                    style={{
                      backgroundColor: '#f7f8fa',
                      borderRadius: 10,
                      left: -25,
                      width: SCREEN_WIDTH / 1.14,
                    }}>
                    <Left style={{left: 10}}>
                      <Button style={{backgroundColor: '#FFFFFF'}}>
                        <MaterialCommunityIcons
                          name={'calendar-check'}
                          size={25}
                          color="#b5b5b5"
                        />
                      </Button>
                    </Left>
                    <Body>
                      <TouchableOpacity
                        onPress={this.showDatePickerend}
                        style={{width: '90%'}}>
                        <Text style={{width: '90%'}}>
                          {this.state.startDate === ''
                            ? 'Start Date/Time'
                            : moment(this.state.Dateend).format(
                                'MMM D, YYYY h:mm a',
                              )}
                        </Text>
                      </TouchableOpacity>
                      <DateTimePickerModal
                        isVisible={this.state.isDatePickerVisibleend}
                        mode="datetime"
                        onConfirm={this.handleConfirmend}
                        onCancel={this.hideDatePickerend}
                      />
                    </Body>
                  </ListItem>
                )}

                <Text style={{marginTop: 5, fontSize: 13, fontWeight: 'bold'}}>
                  Phone Number
                </Text>
                <ListItem
                  icon
                  style={{
                    backgroundColor: '#f7f8fa',
                    borderRadius: 10,
                    left: -25,
                    width: SCREEN_WIDTH / 1.14,
                  }}>
                  <Left style={{left: 10}}>
                    <Button style={{backgroundColor: '#FFFFFF'}}>
                      <AntDesign name={'mobile1'} size={25} color="#b5b5b5" />
                    </Button>
                  </Left>
                  <Body>
                    <Picker
                      selectedValue={this.state.phone}
                      onValueChange={(itemValue, itemIndex) =>
                        this.setState({phone: itemValue})
                      }>
                      <Picker.Item
                        label={this.state.phone}
                        value={this.state.phone}
                      />
                      {this.state.address_list.map((user, index) => (
                        <Picker.Item
                          label={user.phone}
                          value={user.phone}
                          key={index}
                        />
                      ))}
                    </Picker>
                  </Body>
                </ListItem>

                <Text style={{marginTop: 5, fontSize: 13, fontWeight: 'bold'}}>
                  Note
                </Text>
                <ListItem
                  icon
                  style={{
                    backgroundColor: '#f7f8fa',
                    borderRadius: 10,
                    left: -25,
                    width: SCREEN_WIDTH / 1.14,
                  }}>
                  <Left style={{left: 10}}>
                    <Button style={{backgroundColor: '#FFFFFF'}}>
                      <AntDesign name={'book'} size={25} color="#b5b5b5" />
                    </Button>
                  </Left>
                  <Body>
                    <Input
                      value={this.state.note}
                      onChangeText={text => {
                        this.setState({note: text});
                      }}
                      placeholderTextColor="#687373"
                    />
                  </Body>
                </ListItem>

                <Text style={{marginTop: 5, fontSize: 13, fontWeight: 'bold'}}>
                  Description
                </Text>
                <ListItem
                  icon
                  style={{
                    backgroundColor: '#f7f8fa',
                    borderRadius: 10,
                    left: -25,
                    width: SCREEN_WIDTH / 1.14,
                  }}>
                  <Left style={{left: 10}}>
                    <Button style={{backgroundColor: '#FFFFFF'}}>
                      <MaterialIcons
                        name={'description'}
                        size={25}
                        color="#b5b5b5"
                      />
                    </Button>
                  </Left>
                  <Body>
                    <Input
                      value={this.state.datas.description}
                      placeholderTextColor="#687373"
                    />
                  </Body>
                </ListItem>

                <PhotoGrid
                  source={this.state.datas.imageArray.filter(items => {
                    const itemData = items;
                    const textData = 'AddImage';

                    return itemData.indexOf(textData) == -1;
                  })}
                  onPressImage={uri =>
                    this.setState({showURL: true, SelectedURL: uri})
                  }
                />
              </ScrollView>
              <Button
                block
                style={{height: 30, backgroundColor: '#33c37d', marginTop: 10}}
                onPress={() => {
                  this.state.uid == null
                    ? null
                    : this.state.storewallet < 1
                    ? null
                    : this.state.Storestatus &&
                      !this.state.AlwaysOpen &&
                      Closing == true
                    ? this.FinalCheckouts()
                    : this.state.AlwaysOpen
                    ? this.FinalCheckouts()
                    : null;
                }}>
                <Text style={{color: 'white'}}>
                  {this.state.uid == null
                    ? 'Log in to Continue'
                    : this.state.storewallet < 1
                    ? 'Unavailable'
                    : this.state.Storestatus &&
                      !this.state.AlwaysOpen &&
                      Closing == true
                    ? 'Continue Booking'
                    : this.state.AlwaysOpen
                    ? 'Continue Booking'
                    : 'Unavailable'}
                </Text>
              </Button>
            </Card>
          </Modal>
          <Modal
            isVisible={this.state.warningModal}
            animationInTiming={500}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            animationOutTiming={500}
            useNativeDriver={true}
            onBackButtonPress={() => this.setState({warningModal: false})}
            onBackdropPress={() => this.setState({warningModal: false})}
            transparent={true}>
            <View style={styles.content}>
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: 10,
                }}>
                <Text style={{color: 'tomato', fontWeight: 'bold'}}>
                  Error!
                </Text>
              </View>

              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: 10,
                }}>
                <Text style={{color: 'black', fontWeight: 'bold'}}>
                  {this.state.warningText}
                </Text>
              </View>
              <Button
                block
                style={{height: 30, backgroundColor: '#019fe8'}}
                onPress={() => this.setState({warningModal: false})}>
                <Text style={{color: 'white'}}>Ok</Text>
              </Button>
            </View>
          </Modal>
          <Modal
            isVisible={this.state.showURL}
            animationInTiming={700}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            animationOutTiming={700}
            useNativeDriver={true}
            onBackButtonPress={() => this.setState({showURL: false})}
            onBackdropPress={() => this.setState({showURL: false})}
            transparent={true}>
            <SliderBox
              images={this.state.datas.imageArray.filter(items => {
                const itemData = items;
                const textData = 'AddImage';

                return itemData.indexOf(textData) == -1;
              })}
              sliderBoxHeight={SCREEN_HEIGHT}
              resizeMode={'contain'}
              firstItem={this.state.datas.imageArray
                .filter(items => {
                  const itemData = items;
                  const textData = 'AddImage';

                  return itemData.indexOf(textData) == -1;
                })
                .indexOf(this.state.SelectedURL)}
              onCurrentImagePressed={index => this.setState({showURL: false})}
              paginationBoxStyle={{
                position: 'absolute',
                bottom: 0,
                padding: 0,
                alignItems: 'center',
                alignSelf: 'center',
                justifyContent: 'center',
                paddingVertical: 10,
              }}
              ImageComponentStyle={{marginLeft: -25}}
            />
          </Modal>
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
                  Your booking is on process
                </Text>
                <Text
                  style={{
                    color: 'black',
                    fontWeight: '600',
                    textAlign: 'center',
                  }}>
                  Please wait for confirmation
                </Text>
              </View>
              <Button
                block
                style={{height: 30, backgroundColor: '#019fe8'}}
                onPress={() => this.OrderSuccess()}>
                <Text style={{color: 'white'}}>Ok</Text>
              </Button>
            </View>
          </Modal>

          <Modal
            isVisible={this.state.FinalCheckout}
            animationInTiming={500}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            animationOutTiming={500}
            useNativeDriver={true}
            onBackButtonPress={() => this.setState({FinalCheckout: false})}
            onBackdropPress={() => this.state.FinalCheckout}
            transparent={true}>
            <View style={styles.content}>
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
                  color="gray"
                  size={25}
                  onPress={() => this.setState({FinalCheckout: false})}
                />
              </View>
              <TearLines ref="top" />

              <ScrollView style={styles.invoice}>
                <Text
                  style={{fontSize: 18, fontWeight: 'bold', color: '#1aad57'}}>
                  Billing Receipt
                </Text>

                <List>
                  <View style={{paddingVertical: 15}}>
                    <View style={{flexDirection: 'row'}}>
                      <Body
                        style={{
                          flex: 1,
                          justifyContent: 'flex-start',
                          alignItems: 'flex-start',
                        }}>
                        <Text style={{fontSize: 13, fontWeight: 'bold'}}>
                          {this.state.datas.name}
                        </Text>

                        <Text note style={{fontSize: 13}}>
                          Address: {this.state.datas.address}
                        </Text>
                        <Text note style={{fontSize: 13}}>
                          by {this.state.datas.store_name}
                        </Text>
                      </Body>
                      <Right style={{textAlign: 'right'}}>
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: 'bold',
                            marginBottom: 10,
                          }}>
                          {this.props.route.params.currency}
                          {Math.round(parseFloat(pricetoPay) * 10) / 10}
                        </Text>
                      </Right>
                    </View>
                  </View>
                </List>

                <View>
                  <Grid style={{padding: 8}}>
                    <Col>
                      <Text style={{fontSize: 13, color: 'green'}}>
                        Duration ({this.state.SelectedPricing})
                      </Text>
                    </Col>
                    <Col>
                      <NumberFormat
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
                          this.state.SelectedPricing == 'Day'
                            ? Math.round((this.state.numberofhours / 24) * 10) /
                              10
                            : this.state.SelectedPricing == 'Hour'
                            ? Math.round(this.state.numberofhours * 10) / 10
                            : this.state.SelectedPricing == 'Weekly'
                            ? Math.round(this.state.Duration * 10) / 10
                            : Math.round(this.state.Duration * 10) / 10
                        }
                        displayType={'text'}
                        thousandSeparator={true}
                      />
                    </Col>
                  </Grid>

                  <View style={styles.line} />
                  <Grid style={{padding: 8}}>
                    <Col>
                      <Text style={{fontSize: 13, color: 'green'}}>Total</Text>
                    </Col>
                    <Col>
                      <NumberFormat
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
                        value={Math.round(this.state.total * 10) / 10}
                        displayType={'text'}
                        thousandSeparator={true}
                        prefix={this.props.route.params.currency}
                      />
                    </Col>
                  </Grid>
                </View>
              </ScrollView>
              <View
                style={{height: 40, alignItems: 'center', marginBottom: 10}}>
                <TouchableOpacity
                  style={[
                    styles.centerElement,
                    {
                      backgroundColor: '#019fe8',
                      width: SCREEN_WIDTH - 50,
                      height: 40,
                      borderRadius: 5,
                      padding: 10,
                    },
                  ]}
                  onPress={() => this.checkOut()}>
                  <Text style={{color: '#ffffff'}}>Book Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </Container>
      </Root>
    );
  }

  async checkOut() {
    let StatDayPrice = this.state.datas.StatDayPrice == true ? 'Day' : null;
    let StatHourPrice = this.state.datas.StatHourPrice == true ? 'Hour' : null;
    let StatWeeklyPrice =
      this.state.datas.StatWeeklyPrice == true ? 'Weekly' : null;
    let StatMonthlyPrice =
      this.state.datas.StatMonthlyPrice == true ? 'Monthly' : null;
    let pricetoPay =
      this.state.SelectedPricing == 'Hour'
        ? this.state.datas.HourPrice
        : this.state.SelectedPricing == 'Day'
        ? this.state.datas.DayPrice
        : this.state.SelectedPricing == 'Weekly'
        ? this.state.datas.WeeklyPrice
        : this.state.datas.MonthlyPrice;
    if (
      this.state.phone == '' ||
      this.state.phone == undefined ||
      this.state.phone == 'Select Phone Number'
    ) {
      Alert.alert('Add Phone Number', '', [{text: 'OK'}]);
      return;
    }
    if (this.state.datas.rentalType == 'Vehicle') {
      if (this.state.ImageLicenseLink == undefined) {
        Alert.alert(
          'Upload Driver License',
          'Plase make sure the details are clear',
        );
        return;
      }
      if (this.state.ImageIDLink == undefined) {
        Alert.alert(
          'Upload valid I.D',
          'Plase make sure the details are clear',
        );
        return;
      }
    }

    if (this.state.startDate == undefined) {
      Alert.alert('Set Date of Rental', '', [{text: 'OK'}]);
      return;
    }
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
    const token = await AsyncStorage.getItem('token');
    const updatecounts = firestore().collection('orderCounter').doc('orders');
    const updateUserOrders = firestore().collection('users').doc(userId);

    let in_check_extension = moment(this.state.newstartDate * 1000).format(
      'DD-MM-YYYY HH:mm:ss',
    );
    let out_check_extension = moment(this.state.newDateend * 1000).format(
      'DD-MM-YYYY HH:mm:ss',
    );

    const a = moment(in_check_extension.toString());
    const b = moment(out_check_extension.toString());
    const diff = b.diff(a, 'hours');
    const update_StoreTransaction = firestore()
      .collection('stores')
      .doc(this.state.datas.storeId);
    update_StoreTransaction.update({
      TransactionPending: firestore.FieldValue.increment(1),
    });
    const dataNow = {
      refNo:
        this.ReferenceNo1(1) +
        this.ReferenceNo2(1) +
        this.ReferenceNo3(1) +
        this.ReferenceNo4(1) +
        this.ReferenceNo5(1) +
        this.ReferenceNo6(1),
      adminname: this.state.adminname,
      currency: this.props.route.params.currency,
      admin_token: this.state.admin_token
        .concat(this.state.notification_token)
        .filter(a => a),
      city: this.state.datas.city.trim(),
      ImageLicenseLink:
        this.state.ImageLicenseLink == undefined
          ? ''
          : this.state.ImageLicenseLink,
      ImageIDLink:
        this.state.ImageIDLink == undefined ? '' : this.state.ImageIDLink,
      typeOfRate: this.props.route.params.typeOfRate,
      rentalType: this.state.datas.rentalType,
      OrderNo: this.state.counter,
      OrderId: newDocumentID,
      OrderStatus: 'Pending',
      numberofhours: diff,
      total: Math.round(this.state.total * 10) / 10,
      SelectedPricing: this.state.SelectedPricing,
      pricetoPay: pricetoPay,
      passenger: this.state.passenger,
      startDate: moment(this.state.startDate).unix(),
      Duration: this.state.Duration,
      Dateend:
        this.state.SelectedPricing == 'Weekly'
          ? moment(this.state.startDate)
              .add(7 * parseInt(this.state.Duration), 'days')
              .unix()
          : this.state.SelectedPricing == 'Monthly'
          ? moment(this.state.startDate)
              .add(30 * parseInt(this.state.Duration), 'days')
              .unix()
          : moment(this.state.Dateend).unix(),
      MotorCR:
        this.state.datas.MotorCR == undefined ? '' : this.state.datas.MotorCR,
      MotorOR:
        this.state.datas.MotorOR == undefined ? '' : this.state.datas.MotorOR,
      MBrand:
        this.state.datas.MBrand == undefined ? '' : this.state.datas.MBrand,
      ColorMotor:
        this.state.datas.ColorMotor == undefined
          ? ''
          : this.state.datas.ColorMotor,
      PlateNo:
        this.state.datas.PlateNo == undefined ? '' : this.state.datas.PlateNo,
      VModel:
        this.state.datas.VModel == undefined ? '' : this.state.datas.VModel,
      brand:
        this.state.datas.MBrand == undefined ? '' : this.state.datas.MBrand,
      needAsap: this.state.AlwaysOpen,
      pickupTime:
        this.state.startDate === undefined ? null : this.state.startDate,
      DetailedAddress: this.state.datas.DetailedAddress,
      MonthlyPrice: parseFloat(this.state.datas.MonthlyPrice),
      DayPrice: parseFloat(this.state.datas.DayPrice),
      HourPrice: parseFloat(this.state.datas.HourPrice),
      WeeklyPrice: parseFloat(this.state.datas.WeeklyPrice),
      StatDayPrice: this.state.datas.StatDayPrice,
      StatHourPrice: this.state.datas.StatHourPrice,
      StatWeeklyPrice: this.state.datas.StatWeeklyPrice,
      StatMonthlyPrice: this.state.datas.StatMonthlyPrice,
      ameneties: this.state.datas.ameneties,
      imageArray: this.state.datas.imageArray,
      keywords: this.state.datas.keywords,
      address: this.state.datas.address,
      name: this.state.datas.name,
      adminID: this.state.datas.adminID,
      AccountInfo: {
        name: this.state.account_name,
        address: this.state.account_address,
        phone: this.state.phone,
        email: this.state.account_email,
        barangay:
          this.state.account_barangay == undefined
            ? ''
            : this.state.account_barangay,
        city: this.state.account_city.trim(),
        province: this.state.account_province.toLowerCase(),
        status: this.state.account_status,
      },
      Billing: {
        name: this.state.billing_name,
        address: this.state.billing_street,
        phone: this.state.phone,
        barangay:
          this.state.billing_barangay == undefined
            ? ''
            : this.state.billing_barangay,
        province: this.state.billing_province.toLowerCase(),
        billing_city: this.state.billing_city.trim(),
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

      billing_nameTo: this.state.billing_nameTo,
      billing_phoneTo: this.state.phone,
      billing_provinceTo: this.state.billing_provinceTo.toLowerCase(),
      billing_cityTo: this.state.billing_cityTo,
      billing_streetTo: this.state.billing_streetTo,
      billing_postalTo: this.state.billing_postalTo,
      billing_barangayTo: this.state.billing_barangayTo,
      Timestamp: moment().unix(),
      user_token: this.state.notification_token.filter(a => a),
      Note: this.state.note,
      PaymentMethod: this.state.paymentMethod,
      DeliveredBy: '',
      rider_id: '',
      isCancelled: false,
      userId: userId,
      flat: this.state.datas.slatitude,
      flong: this.state.datas.slongitude,
      discount: this.state.discount,
      voucherUsed: this.state.voucherCode,
      RentStoreId: this.state.datas.storeId,
      RentStoreName: this.state.datas.store_name,
      ProductType: 'Rentals',
    };
    console.log('dataNowe: ', dataNow);

    this.checkoutref
      .collection('orders')
      .doc(newDocumentID)
      .set(dataNow)
      .then(
        updatecounts.update({counter: firestore.FieldValue.increment(1)}),
        updateUserOrders.update({
          ordered_times: firestore.FieldValue.increment(1),
        }),

        this.setState({
          loading: false,
          visibleModal: true,
        }),
      )
      .catch(error => Alert.alert('Try Again', '', [{text: 'OK'}]));
  }
}

const styles = {
  inputContainer: {
    marginTop: 5,
    marginBottom: 10,
    width: '100%',
    height: SCREEN_HEIGHT / 15,
    borderColor: '#ccc',
    borderRadius: 3,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  iconStyle: {
    padding: 10,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightColor: '#ccc',
    borderRightWidth: 1,
    width: 50,
  },
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
