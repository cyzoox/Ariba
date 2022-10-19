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
  Box,
  View,
  Button,
  Stack,
  Input,
  VStack,
  Select,
  HStack ,
  Text,
  useToast as Toast,
  StatusBar,
} from 'native-base';
import SelectDropdown from 'react-native-select-dropdown'
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Octicons from 'react-native-vector-icons/Octicons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
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
import {FlatGrid} from 'react-native-super-grid';
import {SliderBox} from 'react-native-image-slider-box';
import MapboxGL, {Logger} from '@react-native-mapbox-gl/maps';
import PhotoGrid from '../components/PhotoGrid';
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

export default class CheckoutScreenHotels extends Component {
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
      phone: 'Select Phone Number',
      visibleAddressModal: false,
      SelectedPricing:
        datas.StatHourPrice3 == true
          ? 'Hour3'
          : datas.StatHourPrice6 == true
          ? '6Hour'
          : datas.StatHourPrice12 == true
          ? '12Hour'
          : datas.StatDayPrice == true
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
      passenger: datas.minGuest.toString(),
      note: '',
      AlwaysOpen: true,
      Customerimage: null,
      Duration: '0',
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
      SelectedMode: 'Over the Counter',
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
      isGuest: true,
      guestName: '',
      AlwaysOpen: true,
      admin_control: true,
      Storestatus: true,
      StoreendDate: null,
      StorestartDate: null,
      StorestartDate: null,
      Nearby: [],
      showNearby: false,
      CommonFacilities: [],
      showCommonFacilities: false,
      importantNote: [],
      showimportantNote: false,
    };
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
        this.setState({Customerimage: image.assets[0].base64});
      },
    );
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
            importantNote:
              doc.data().importantNote == undefined
                ? []
                : doc.data().importantNote,
            notification_token: doc.data().notification_token,
            storewallet: doc.data().bank,
            bank: doc.data().bank,
            gcash: doc.data().gcash,
            AlwaysOpen: doc.data().AlwaysOpen,
            admin_control: doc.data().admin_control,
            Storestatus: doc.data().status,

            StoreendDate:
              doc.data().endDate == undefined ? null : doc.data().endDate,
            StorestartDate:
              doc.data().startDate == undefined ? null : doc.data().startDate,
            Nearby: doc.data().Nearby == undefined ? [] : doc.data().Nearby,
            CommonFacilities:
              doc.data().CommonFacilities == undefined
                ? []
                : doc.data().CommonFacilities,
          });
        });
      });

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
      'D-MM-YYYY HH:mm:ss',
    );
    let out_check_extension = moment(this.state.newDateend * 1000).format(
      'D-MM-YYYY HH:mm:ss',
    );

    const a = moment(this.state.newstartDate * 1000);
    const b = moment(this.state.newDateend * 1000);

    const diff = b.diff(a, 'hour');
    console.log('in_check_extension', in_check_extension);
    console.log('out_check_extension', out_check_extension);
    console.log('diff', diff);
    console.log('a', a);
    console.log('b', b);

    const total =
      this.state.SelectedPricing == 'Hour3'
        ? this.state.datas.HourPrice3
        : this.state.SelectedPricing == '6Hour'
        ? this.state.datas.HourPrice6
        : this.state.SelectedPricing == '12Hour'
        ? this.state.datas.HourPrice12
        : this.state.SelectedPricing == 'Day'
        ? Math.round(diff / 24) *
          (Math.round(this.state.datas.DayPrice * 10) / 10)
        : this.state.SelectedPricing == 'Hour'
        ? (Math.round(diff * 10) / 10) *
          (Math.round(this.state.datas.HourPrice * 10) / 10)
        : this.state.SelectedPricing == 'Weekly'
        ? (Math.round(this.state.Duration * 10) / 10) *
          (Math.round(this.state.datas.WeeklyPrice * 10) / 10)
        : (Math.round(this.state.Duration * 10) / 10) *
          (Math.round(this.state.datas.MonthlyPrice * 10) / 10);

    if (this.state.isGuest == false && this.state.guestName == '') {
      this.setState({warningText: 'Enter Guest Name', warningModal: true});
      return;
    }
    if (this.state.SelectedPricing == undefined) {
      this.setState({warningText: 'Choose Rate', warningModal: true});
      return;
    }
    if (this.state.passenger == '0' || this.state.passenger == '') {
      this.setState({
        warningText: 'Enter Number of Person',
        warningModal: true,
      });
      return;
    }
    if (this.state.startDate == undefined) {
      this.setState({warningText: 'Enter Check in Date', warningModal: true});
      return;
    }

    if (
      this.state.SelectedPricing == 'Day' ||
      this.state.SelectedPricing == 'Hour'
    ) {
      if (this.state.Dateend == undefined) {
        this.setState({
          warningText: 'Enter Check out Date',
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
    let StatHourPrice3 =
      this.state.datas.StatHourPrice3 == true ? 'Hour3' : null;
    let StatHourPrice6 =
      this.state.datas.StatHourPrice6 == true ? '6Hour' : null;
    let StatHourPrice12 =
      this.state.datas.StatHourPrice12 == true ? '12Hour' : null;
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
      this.state.SelectedPricing == 'Hour3'
        ? this.state.datas.HourPrice3
        : this.state.SelectedPricing == '6Hour'
        ? this.state.datas.HourPrice6
        : this.state.SelectedPricing == '12Hour'
        ? this.state.datas.HourPrice12
        : this.state.SelectedPricing == 'Hour'
        ? this.state.datas.HourPrice
        : this.state.SelectedPricing == 'Day'
        ? this.state.datas.DayPrice
        : this.state.SelectedPricing == 'Weekly'
        ? this.state.datas.WeeklyPrice
        : this.state.datas.MonthlyPrice;

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
    let modesp = ['Over the Counter'];

    let Closing = false;

    return (
      <Box>
        <Box style={{backgroundColor: 'white'}}>
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

          <FlatList
          style={{height:SCREEN_HEIGHT-78}}
            ListHeaderComponent={
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <View>
                  <View style={{flexDirection: 'row', width: SCREEN_WIDTH}}>
                    <Text
                      style={{fontSize: 18, fontWeight: 'bold', margin: 10}}>
                      {this.state.datas.name.toUpperCase()}{' '}
                    </Text>
                    <Text style={{fontSize: 16, marginTop: 10}}>
                      {this.state.SelectedPricing == undefined
                        ? 'Select Mode of Pricing'
                        : parseFloat(pricetoPay)
                            .toFixed(2)
                            .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
                            .toString()}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        textDecorationLine: 'line-through',
                        marginTop: 5,
                      }}>
                      {' '}
                      {this.state.datas.origPrice == undefined ||
                      this.state.datas.origPrice == 0
                        ? null
                        : parseFloat(this.state.datas.origPrice)
                            .toFixed(2)
                            .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
                            .toString()}
                    </Text>
                    <Text style={{fontSize: 14, marginTop: 10}}>
                      {' '}
                      Per{' '}
                      {this.state.SelectedPricing == 'Hour3'
                        ? 'Hour3s'
                        : this.state.SelectedPricing}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      borderBottomWidth: 0.5,
                      borderBottomColor: 'gray',
                      marginBottom: this.state.Nearby.length > 0 ? 10 : 30,
                    }}>
                    <Ionicons
                      name="people"
                      color="gray"
                      size={25}
                      style={{alignSelf: 'center', marginLeft: 5}}
                      onPress={() => this.setState({VisibleAddInfo: false})}
                    />

                    <View
                      style={{
                        justifyContent: 'space-between',
                        marginLeft: 20,
                        width: SCREEN_WIDTH / 2.7,
                      }}>
                      <Text style={{fontSize: 14}}>
                        Good for {this.state.datas.maxGuest} person
                      </Text>
                    </View>
                  </View>
                  {this.state.CommonFacilities.length > 0 ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        borderBottomWidth: 0.5,
                        borderBottomColor: 'gray',
                        marginBottom: this.state.Nearby.length > 0 ? 10 : 30,
                      }}>
                      <View>
                        <FlatList
                          data={this.state.CommonFacilities}
                          // staticDimension={300}
                          // fixed
                          numColumns={2}
                          renderItem={({item, index}) =>
                            index < 2 ? (
                              <TouchableOpacity
                                style={{
                                  flexDirection: 'row',
                                  width: SCREEN_WIDTH / 2,
                                }}
                                onPress={() =>
                                  this.setState({showCommonFacilities: true})
                                }
                                index={index}>
                                <MaterialCommunityIcons
                                  name={'checkbox-marked-circle-outline'}
                                  color="gray"
                                  size={16}
                                  style={{alignSelf: 'center', marginLeft: 5}}
                                />

                                <View
                                  style={{
                                    justifyContent: 'space-between',
                                    marginLeft: 5,
                                  }}>
                                  <Text style={{fontSize: 16}}>
                                    {item.CommonFacilities[0].label}
                                  </Text>
                                </View>
                              </TouchableOpacity>
                            ) : null
                          }
                        />
                        {this.state.Nearby.length > 2 ? (
                          <TouchableOpacity
                            onPress={() =>
                              this.setState({showCommonFacilities: true})
                            }>
                            <Text
                              style={{
                                fontSize: 16,
                                textAlign: 'center',
                                color: '#019fe8',
                              }}>
                              Show All
                            </Text>
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    </View>
                  ) : null}

                  {this.state.Nearby.length > 0 ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        borderBottomWidth: 0.5,
                        borderBottomColor: 'gray',
                      }}>
                      <View style={{justifyContent: 'space-between'}}>
                        <Text
                          style={{
                            fontSize: 16,
                            textAlign: 'left',
                            fontWeight: 'bold',
                            marginLeft: 10,
                          }}>
                          Nearby Places
                        </Text>
                        <FlatList
                          data={this.state.Nearby}
                          // staticDimension={300}
                          // fixed
                          renderItem={({item, index}) =>
                            index < 2 ? (
                              <TouchableOpacity
                                style={{
                                  flexDirection: 'row',
                                  width: SCREEN_WIDTH,
                                }}
                                onPress={() =>
                                  this.setState({showNearby: true})
                                }
                                index={index}>
                                {item.category[0].icon == 'MaterialIcons' ? (
                                  <MaterialIcons
                                    name={item.category[0].iconName}
                                    color="gray"
                                    size={16}
                                    style={{alignSelf: 'center', marginLeft: 5}}
                                  />
                                ) : item.category[0].icon == 'Ionicons' ? (
                                  <Ionicons
                                    name={item.category[0].iconName}
                                    color="gray"
                                    size={16}
                                    style={{alignSelf: 'center', marginLeft: 5}}
                                  />
                                ) : item.category[0].icon ==
                                  'MaterialCommunityIcons' ? (
                                  <MaterialCommunityIcons
                                    name={item.category[0].iconName}
                                    color="gray"
                                    size={16}
                                    style={{alignSelf: 'center', marginLeft: 5}}
                                  />
                                ) : (
                                  <FontAwesome5
                                    name={item.category[0].iconName}
                                    color="gray"
                                    size={16}
                                    style={{alignSelf: 'center', marginLeft: 5}}
                                  />
                                )}

                                <View
                                  style={{
                                    justifyContent: 'space-between',
                                    marginLeft: 20,
                                  }}>
                                  <Text style={{fontSize: 16}}>
                                    {item.name}
                                  </Text>
                                  <Text style={{fontSize: 14, color: 'gray'}}>
                                    {item.category[0].label}
                                  </Text>
                                </View>
                                <Text
                                  style={{
                                    fontSize: 14,
                                    alignSelf: 'center',
                                    position: 'absolute',
                                    right: 10,
                                  }}>
                                  {item.distance} {item.unit}
                                </Text>
                              </TouchableOpacity>
                            ) : null
                          }
                        />
                        {this.state.Nearby.length > 2 ? (
                          <TouchableOpacity
                            onPress={() => this.setState({showNearby: true})}>
                            <Text
                              style={{
                                fontSize: 16,
                                textAlign: 'center',
                                color: '#019fe8',
                              }}>
                              Show All
                            </Text>
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    </View>
                  ) : null}

                  {this.state.importantNote.length > 0 ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        borderBottomWidth: 0.5,
                        borderBottomColor: 'gray',
                        marginBottom: 30,
                      }}>
                      <View style={{justifyContent: 'space-between'}}>
                        <Text
                          style={{
                            fontSize: 16,
                            textAlign: 'left',
                            fontWeight: 'bold',
                            marginLeft: 10,
                          }}>
                          Important Note
                        </Text>

                        <FlatList
                          data={this.state.importantNote}
                          // staticDimension={300}
                          // fixed

                          renderItem={({item, index}) =>
                            index < 2 ? (
                              <TouchableOpacity
                                style={{flexDirection: 'row'}}
                                onPress={() =>
                                  this.setState({showimportantNote: true})
                                }
                                index={index}>
                                <Entypo
                                  name="dot-single"
                                  color="gray"
                                  size={16}
                                  style={{alignSelf: 'center', marginLeft: 5}}
                                />

                                <View
                                  style={{
                                    justifyContent: 'space-between',
                                    marginLeft: 5,
                                  }}>
                                  <Text style={{fontSize: 16}}>{item}</Text>
                                </View>
                              </TouchableOpacity>
                            ) : null
                          }
                        />
                        {this.state.importantNote.length > 2 ? (
                          <TouchableOpacity
                            onPress={() =>
                              this.setState({showimportantNote: true})
                            }>
                            <Text
                              style={{
                                fontSize: 16,
                                textAlign: 'center',
                                color: '#019fe8',
                              }}>
                              Show All
                            </Text>
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    </View>
                  ) : null}
                </View>
              </View>
            }
            data={['item']}
            renderItem={item => (
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
            )}
            ListFooterComponent={
              <View>
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
              </View>
            }
          />
          <Modal
            isVisible={this.state.showNearby}
            onBackButtonPress={() => this.setState({showNearby: false})}
            animationInTiming={700}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            animationOutTiming={700}
            useNativeDriver={true}
            style={{margin: 0}}
            onBackdropPress={() => this.setState({showNearby: false})}
            transparent={true}>
            <Box
              style={{
                backgroundColor: 'white',
                padding: 22,
                borderRadius: 4,
                borderColor: 'rgba(0, 0, 0, 0.1)',
              }}>
              <Text
                style={{fontSize: 18, textAlign: 'center', fontWeight: 'bold'}}>
                Nearby Places
              </Text>
              <FlatList
                data={this.state.Nearby}
                // staticDimension={300}
                // fixed
                renderItem={({item, index}) => (
                  <Box>
                    <Box>
                      <TouchableOpacity
                        style={{
                          flexDirection: 'row',
                          width: SCREEN_WIDTH / 1.2,
                        }}
                        onPress={() => this.setState({showNearby: false})}>
                        {item.category[0].icon == 'MaterialIcons' ? (
                          <MaterialIcons
                            name={item.category[0].iconName}
                            color="gray"
                            size={16}
                            style={{alignSelf: 'center', marginLeft: 5}}
                          />
                        ) : item.category[0].icon == 'Ionicons' ? (
                          <Ionicons
                            name={item.category[0].iconName}
                            color="gray"
                            size={16}
                            style={{alignSelf: 'center', marginLeft: 5}}
                          />
                        ) : item.category[0].icon ==
                          'MaterialCommunityIcons' ? (
                          <MaterialCommunityIcons
                            name={item.category[0].iconName}
                            color="gray"
                            size={16}
                            style={{alignSelf: 'center', marginLeft: 5}}
                          />
                        ) : (
                          <FontAwesome5
                            name={item.category[0].iconName}
                            color="gray"
                            size={16}
                            style={{alignSelf: 'center', marginLeft: 5}}
                          />
                        )}

                        <View
                          style={{
                            justifyContent: 'space-between',
                            marginLeft: 20,
                          }}>
                          <Text style={{fontSize: 14}}>{item.name}</Text>
                          <Text style={{fontSize: 12, color: 'gray'}}>
                            {item.category[0].label}
                          </Text>
                        </View>
                        <Text
                          style={{
                            fontSize: 14,
                            alignSelf: 'center',
                            position: 'absolute',
                            right: 50,
                          }}>
                          {item.distance} {item.unit}
                        </Text>
                      </TouchableOpacity>
                    </Box>
                  </Box>
                )}
              />
            </Box>
          </Modal>

          <Modal
            isVisible={this.state.showCommonFacilities}
            onBackButtonPress={() =>
              this.setState({showCommonFacilities: false})
            }
            animationInTiming={700}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            animationOutTiming={700}
            useNativeDriver={true}
            style={{margin: 0}}
            onBackdropPress={() => this.setState({showCommonFacilities: false})}
            transparent={true}>
            <Box
              style={{
                backgroundColor: 'white',
                padding: 2,
                borderRadius: 4,
                borderColor: 'rgba(0, 0, 0, 0.1)',
              }}>
              <Text
                style={{fontSize: 17, textAlign: 'center', fontWeight: 'bold'}}>
                Common Facilities
              </Text>
              <FlatList
                data={this.state.CommonFacilities}
                // staticDimension={300}
                // fixed
                numColumns={2}
                renderItem={({item, index}) => (
                  <Box style={{padding: 5, width: SCREEN_WIDTH / 2.1}}>
                    <TouchableOpacity
                      style={{flexDirection: 'row'}}
                      onPress={() =>
                        this.setState({showCommonFacilities: false})
                      }>
                      <MaterialCommunityIcons
                        name={'checkbox-marked-circle-outline'}
                        color="gray"
                        size={16}
                        style={{alignSelf: 'center', marginLeft: 0}}
                      />

                      <View
                        style={{
                          justifyContent: 'space-between',
                          marginLeft: 5,
                        }}>
                        <Text style={{fontSize: 14, width: SCREEN_WIDTH / 2.5}}>
                          {item.CommonFacilities[0].label}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </Box>
                )}
              />
            </Box>
          </Modal>

          <Modal
            isVisible={this.state.showimportantNote}
            onBackButtonPress={() => this.setState({showimportantNote: false})}
            animationInTiming={700}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            animationOutTiming={700}
            useNativeDriver={true}
            style={{margin: 0}}
            onBackdropPress={() => this.setState({showimportantNote: false})}
            transparent={true}>
            <Box
              style={{
                backgroundColor: 'white',
                padding: 2,
                borderRadius: 4,
                borderColor: 'rgba(0, 0, 0, 0.1)',
                padding: 5,
                paddingTop: 5,
                paddingBottom: 10,
              }}>
              <Text
                style={{fontSize: 17, textAlign: 'center', fontWeight: 'bold'}}>
                Important Notes
              </Text>
              <FlatList
                data={this.state.importantNote}
                // staticDimension={300}
                // fixed

                renderItem={({item, index}) => (
                  <View style={{padding: 5, width: SCREEN_WIDTH - 20}}>
                    <TouchableOpacity
                      style={{flexDirection: 'row'}}
                      onPress={() => this.setState({showimportantNote: false})}>
                      <Entypo
                        name="dot-single"
                        color="gray"
                        size={16}
                        style={{alignSelf: 'center', marginLeft: 0}}
                      />

                      <View
                        style={{
                          justifyContent: 'space-between',
                          marginLeft: 5,
                        }}>
                        <Text style={{fontSize: 14, width: SCREEN_WIDTH - 32}}>
                          {item}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}
              />
            </Box>
          </Modal>
          <Modal
            isVisible={this.state.VisibleAddInfo}
            onBackButtonPress={() => this.setState({VisibleAddInfo: false})}
            animationInTiming={700}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            animationOutTiming={700}
            useNativeDriver={true}
            style={{margin: 0}}
            onBackdropPress={() => this.setState({VisibleAddInfo: false})}
            transparent={true}>
            <Box
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
              <ScrollView style={{top: 10, marginBottom: 10}}>
                <View style={styles.inputContainer}>
                  <TouchableOpacity
                    style={{
                      padding: 10,
                      height: '100%',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRightColor: '#ccc',
                      borderRightWidth: 1,
                      width: SCREEN_WIDTH / 2.5,
                      flexDirection: 'row',
                    }}
                    onPress={() =>
                      this.setState({isGuest: !this.state.isGuest})
                    }>
                    {this.state.isGuest ? (
                      <MaterialCommunityIcons
                        name={'heart-circle'}
                        size={25}
                        color="#33c37d"
                      />
                    ) : (
                      <MaterialCommunityIcons
                        name={'heart-circle-outline'}
                        size={25}
                        color="#666"
                      />
                    )}

                    <Text>I'm the guest</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      padding: 10,
                      height: '100%',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: SCREEN_WIDTH / 2.5,
                      flexDirection: 'row',
                    }}
                    onPress={() =>
                      this.setState({isGuest: !this.state.isGuest})
                    }>
                    {!this.state.isGuest ? (
                      <MaterialCommunityIcons
                        name={'heart-circle'}
                        size={25}
                        color="#33c37d"
                      />
                    ) : (
                      <MaterialCommunityIcons
                        name={'heart-circle-outline'}
                        size={25}
                        color="#666"
                      />
                    )}
                    <Text style={{marginTop: -10}}>
                      I'm booking for other guest
                    </Text>
                  </TouchableOpacity>
                </View>

                {this.state.isGuest ? null : (
                  <Text
                    style={{marginTop: 5, fontSize: 13, fontWeight: 'bold'}}>
                    Guest Fullname
                  </Text>
                )}
                {this.state.isGuest ? null : (
                  <HStack 
                    icon
                    style={{
                      backgroundColor: '#f7f8fa',
                      borderRadius: 10,
                      left: -25,
                      width: SCREEN_WIDTH / 1.06,
                    }}>
                    <Box style={{left: 10}}>
                      <Button style={{backgroundColor: '#FFFFFF'}}>
                        <Fontisto name={'person'} size={25} color="#b5b5b5" />
                      </Button>
                    </Box>
                    <Box>
                      <Input
                        value={this.state.guestName}
                        onChangeText={text => {
                          this.setState({guestName: text});
                        }}
                        placeholderTextColor="#687373"
                        style={{marginLeft:10}}
                        w={SCREEN_WIDTH / 1.3}
                      />
                    </Box>
                  </HStack >
                )}
                {this.state.AlwaysOpen == false &&
                this.state.StorestartDate != null ? (
                  <View>
                    <Text
                      style={{marginTop: 5, fontSize: 13, fontWeight: 'bold'}}>
                      Check-in after / Check-out before
                    </Text>

                    <HStack 
                      icon
                      style={{
                        backgroundColor: '#f7f8fa',
                        borderRadius: 10,
                        left: -25,
                        width: SCREEN_WIDTH / 1.06,
                      }}>
                      <Box style={{left: 10}}>
                        <Button style={{backgroundColor: '#FFFFFF'}}>
                          <FontAwesome5
                            name={'user-clock'}
                            size={20}
                            color="#b5b5b5"
                          />
                        </Button>
                      </Box>
                      <Box>
                        <Input
                          value={
                            moment(
                              this.state.StorestartDate.seconds * 1000,
                            ).format('h:mm a') +
                            '   /    ' +
                            moment(
                              this.state.StoreendDate.seconds * 1000,
                            ).format('h:mm a')
                          }
                          placeholderTextColor="#687373"
                          style={{marginLeft:10}}
                        w={SCREEN_WIDTH / 1.3}
                        />
                      </Box>
                    </HStack >
                  </View>
                ) : null}
                <Text style={{marginTop: 5, fontSize: 13, fontWeight: 'bold'}}>
                  Price
                </Text>

                <HStack 
                  icon
                  style={{
                    backgroundColor: '#f7f8fa',
                    borderRadius: 10,
                    left: -25,
                    width: SCREEN_WIDTH / 1.06,
                  }}>
                  <Box style={{left: 10}}>
                    <Button style={{backgroundColor: '#FFFFFF'}}>
                      <FontAwesome5
                        name={'money-bill'}
                        size={20}
                        color="#b5b5b5"
                      />
                    </Button>
                  </Box>
                  <Box>
                    <Input
                      value={
                        this.state.SelectedPricing == undefined
                          ? 'Select Mode of Pricing'
                          : parseFloat(pricetoPay)
                              .toFixed(2)
                              .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
                              .toString() +
                            '/' +
                            this.state.SelectedPricing
                      }
                      placeholderTextColor="#687373"
                      style={{marginLeft:10}}
                        w={SCREEN_WIDTH / 1.3}
                    />
                  </Box>
                </HStack >

                <Text style={{marginTop: 5, fontSize: 13, fontWeight: 'bold'}}>
                  Number of Person
                </Text>
                <HStack 
                  icon
                  style={{
                    backgroundColor: '#f7f8fa',
                    borderRadius: 10,
                    left: -25,
                    width: SCREEN_WIDTH / 1.06,
                  }}>
                  <Box style={{left: 10}}>
                    <Button style={{backgroundColor: '#FFFFFF'}}>
                      <Fontisto name={'persons'} size={25} color="#b5b5b5" />
                    </Button>
                  </Box>
                  <Box>
                    <Input
                      value={this.state.passenger}
                      keyboardType={'number-pad'}
                      onChangeText={text => {
                        isNaN(text)
                          ? null
                          : parseFloat(text) < this.state.datas.minGuest
                          ? Alert.alert(
                              'Invalid Input',
                              'Minimum Guest is ' + this.state.datas.minGuest,
                            )
                          : parseFloat(text) > this.state.datas.maxGuest
                          ? Alert.alert(
                              'Invalid Input',
                              'Maximum Guest is ' + this.state.datas.maxGuest,
                            )
                          : this.setState({passenger: text});
                      }}
                      placeholderTextColor="#687373"
                      style={{marginLeft:10}}
                        w={SCREEN_WIDTH / 1.3}
                    />
                  </Box>
                </HStack >

                <Text style={{marginTop: 5, fontSize: 13, fontWeight: 'bold'}}>
                  Check in Date
                </Text>
                <HStack 
                  icon
                  style={{
                    backgroundColor: '#f7f8fa',
                    borderRadius: 10,
                    left: -25,
                    width: SCREEN_WIDTH / 1.06,
                  }}>
                  <Box style={{left: 10}}>
                    <Button style={{backgroundColor: '#FFFFFF'}}>
                      <MaterialCommunityIcons
                        name={'calendar-clock'}
                        size={25}
                        color="#b5b5b5"
                      />
                    </Button>
                  </Box>
                  <Box>
                    <TouchableOpacity
                      onPress={this.showDatePicker}
                      style={{marginLeft:10,width:SCREEN_WIDTH / 1.3, marginTop:15, paddingLeft:10}}
                      >
                      <Text style={{width:SCREEN_WIDTH / 1.3}}>
                        {this.state.startDate === ''
                          ? 'Check in Date/Time'
                          : this.state.SelectedPricing == 'Day'
                          ? moment(this.state.startDate).format('MMM D, YYYY')
                          : moment(this.state.startDate).format(
                              'MMM D, YYYY h:mm a',
                            )}
                      </Text>
                    </TouchableOpacity>

                    <DateTimePickerModal
                      isVisible={this.state.isDatePickerVisible}
                      mode={
                        this.state.SelectedPricing == 'Day'
                          ? 'date'
                          : 'datetime'
                      }
                      onConfirm={this.handleConfirm}
                      onCancel={this.hideDatePicker}
                    />
                  </Box>
                </HStack >

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
                  <HStack 
                    icon
                    style={{
                      backgroundColor: '#f7f8fa',
                      borderRadius: 10,
                      left: -25,
                      width: SCREEN_WIDTH / 1.06,
                    }}>
                    <Box style={{left: 10}}>
                      <Button style={{backgroundColor: '#FFFFFF'}}>
                        <MaterialCommunityIcons
                          name={'calendar-week'}
                          size={25}
                          color="#b5b5b5"
                        />
                      </Button>
                    </Box>
                    <Box>
                      <Input
                        placeholder={this.state.Duration}
                        value={this.state.Duration}
                        keyboardType={'number-pad'}
                        onChangeText={text => {
                          isNaN(text) ? null : this.setState({Duration: text});
                        }}
                        placeholderTextColor="#687373"
                        style={{marginLeft:10}}
                        w={SCREEN_WIDTH / 1.3}
                      />
                    </Box>
                  </HStack >
                ) : null}

                {
                  <Text
                    style={{marginTop: 5, fontSize: 13, fontWeight: 'bold'}}>
                    Check out Date
                  </Text>
                }
                {this.state.SelectedPricing == 'Weekly' ? (
                  <HStack 
                    icon
                    style={{
                      backgroundColor: '#f7f8fa',
                      borderRadius: 10,
                      left: -25,
                      width: SCREEN_WIDTH / 1.06,
                    }}>
                    <Box style={{left: 10}}>
                      <Button style={{backgroundColor: '#FFFFFF'}}>
                        <MaterialCommunityIcons
                          name={'calendar-check'}
                          size={25}
                          color="#b5b5b5"
                        />
                      </Button>
                    </Box>
                    <Box>
                      <TouchableOpacity style={{marginLeft:10,width:SCREEN_WIDTH / 1.3, marginTop:15, paddingLeft:10}}>
                        <Text style={{width:SCREEN_WIDTH / 1.3}}>
                          {this.state.startDate === ''
                            ? 'Check in Date/Time'
                            : moment(this.state.startDate)
                                .add(7 * parseInt(this.state.Duration), 'days')
                                .format('MMM D, YYYY h:mm a')}
                        </Text>
                      </TouchableOpacity>
                    </Box>
                  </HStack >
                ) : this.state.SelectedPricing == 'Monthly' ? (
                  <HStack 
                    icon
                    style={{
                      backgroundColor: '#f7f8fa',
                      borderRadius: 10,
                      left: -25,
                      width: SCREEN_WIDTH / 1.06,
                    }}>
                    <Box style={{left: 10}}>
                      <Button style={{backgroundColor: '#FFFFFF'}}>
                        <MaterialCommunityIcons
                          name={'calendar-check'}
                          size={25}
                          color="#b5b5b5"
                        />
                      </Button>
                    </Box>
                    <Box>
                      <TouchableOpacity style={{marginLeft:10,width:SCREEN_WIDTH / 1.3, marginTop:15, paddingLeft:10}}>
                        <Text style={{width: SCREEN_WIDTH / 1.3}}>
                          {this.state.startDate === ''
                            ? 'Check in Date/Time'
                            : moment(this.state.startDate)
                                .add(30 * parseInt(this.state.Duration), 'days')
                                .format('MMM D, YYYY h:mm a')}
                        </Text>
                      </TouchableOpacity>
                    </Box>
                  </HStack >
                ) : this.state.SelectedPricing == 'Hour3' ? (
                  <HStack 
                    icon
                    style={{
                      backgroundColor: '#f7f8fa',
                      borderRadius: 10,
                      left: -25,
                      width: SCREEN_WIDTH / 1.06,
                    }}>
                    <Box style={{left: 10}}>
                      <Button style={{backgroundColor: '#FFFFFF'}}>
                        <MaterialCommunityIcons
                          name={'calendar-check'}
                          size={25}
                          color="#b5b5b5"
                        />
                      </Button>
                    </Box>
                    <Box>
                      <TouchableOpacity style={{marginLeft:10,width:SCREEN_WIDTH / 1.3, marginTop:15, paddingLeft:10}}>
                        <Text style={{width: SCREEN_WIDTH / 1.3}}>
                          {this.state.startDate === ''
                            ? 'Check in Date/Time'
                            : moment(this.state.startDate)
                                .add(3, 'hours')
                                .format('MMM D, YYYY h:mm a')}
                        </Text>
                      </TouchableOpacity>
                    </Box>
                  </HStack >
                ) : this.state.SelectedPricing == '6Hour' ? (
                  <HStack 
                    icon
                    style={{
                      backgroundColor: '#f7f8fa',
                      borderRadius: 10,
                      left: -25,
                      width: SCREEN_WIDTH / 1.06,
                    }}>
                    <Box style={{left: 10}}>
                      <Button style={{backgroundColor: '#FFFFFF'}}>
                        <MaterialCommunityIcons
                          name={'calendar-check'}
                          size={25}
                          color="#b5b5b5"
                        />
                      </Button>
                    </Box>
                    <Box>
                      <TouchableOpacity style={{marginLeft:10,width:SCREEN_WIDTH / 1.3, marginTop:15, paddingLeft:10}}>
                        <Text style={{width: SCREEN_WIDTH / 1.3}}>
                          {this.state.startDate === ''
                            ? 'Check in Date/Time'
                            : moment(this.state.startDate)
                                .add(6, 'hours')
                                .format('MMM D, YYYY h:mm a')}
                        </Text>
                      </TouchableOpacity>
                    </Box>
                  </HStack >
                ) : this.state.SelectedPricing == '12Hour' ? (
                  <HStack 
                    icon
                    style={{
                      backgroundColor: '#f7f8fa',
                      borderRadius: 10,
                      left: -25,
                      width: SCREEN_WIDTH / 1.06,
                    }}>
                    <Box style={{left: 10}}>
                      <Button style={{backgroundColor: '#FFFFFF'}}>
                        <MaterialCommunityIcons
                          name={'calendar-check'}
                          size={25}
                          color="#b5b5b5"
                        />
                      </Button>
                    </Box>
                    <Box>
                      <TouchableOpacity style={{marginLeft:10,width:SCREEN_WIDTH / 1.3, marginTop:15, paddingLeft:10}}>
                        <Text style={{width: SCREEN_WIDTH / 1.3}}>
                          {this.state.startDate === ''
                            ? 'Check in Date/Time'
                            : moment(this.state.startDate)
                                .add(12, 'hours')
                                .format('MMM D, YYYY h:mm a')}
                        </Text>
                      </TouchableOpacity>
                    </Box>
                  </HStack >
                ) : (
                  <HStack 
                    icon
                    style={{
                      backgroundColor: '#f7f8fa',
                      borderRadius: 10,
                      left: -25,
                      width: SCREEN_WIDTH / 1.06,
                    }}>
                    <Box style={{left: 10}}>
                      <Button style={{backgroundColor: '#FFFFFF'}}>
                        <MaterialCommunityIcons
                          name={'calendar-check'}
                          size={25}
                          color="#b5b5b5"
                        />
                      </Button>
                    </Box>
                    <Box>
                      <TouchableOpacity
                        onPress={this.showDatePickerend}
                        style={{marginLeft:10,width:SCREEN_WIDTH / 1.3, marginTop:15, paddingLeft:10}}>
                        <Text style={{width:SCREEN_WIDTH / 1.3}}>
                          {this.state.startDate === ''
                            ? 'Check in Date/Time'
                            : this.state.SelectedPricing == 'Day'
                            ? moment(this.state.Dateend).format('MMM D, YYYY')
                            : moment(this.state.Dateend).format(
                                'MMM D, YYYY h:mm a',
                              )}
                        </Text>
                      </TouchableOpacity>
                      <DateTimePickerModal
                        isVisible={this.state.isDatePickerVisibleend}
                        mode={
                          this.state.SelectedPricing == 'Day'
                            ? 'date'
                            : 'datetime'
                        }
                        onConfirm={this.handleConfirmend}
                        onCancel={this.hideDatePickerend}
                      />
                    </Box>
                  </HStack >
                )}
                <Text style={{marginTop: 5, fontSize: 13, fontWeight: 'bold'}}>
                  Mode of Payment
                </Text>
                <HStack 
                  icon
                  style={{
                    backgroundColor: '#f7f8fa',
                    borderRadius: 10,
                    left: -25,
                    width: SCREEN_WIDTH / 1.06,
                  }}>
                  <Box style={{left: 10}}>
                    <Button style={{backgroundColor: '#FFFFFF'}}>
                      <FontAwesome
                        name={'cc-mastercard'}
                        size={20}
                        color="#b5b5b5"
                      />
                    </Button>
                    
                  </Box>
                  <SelectDropdown
	data={["Over the Counter", this.state.bank != undefined &&
    this.state.gcash.bankAvail == true ? "Bank Transfer":null, this.state.gcash != undefined &&
    this.state.gcash.gcashavail == true ? "Gcash":null,]}
  buttonStyle={{width: SCREEN_WIDTH / 1.06}}
  defaultValue={this.state.SelectedMode}
	onSelect={(selectedItem, index) => {
    this.setState({SelectedMode: selectedItem})
	}}
	buttonTextAfterSelection={(selectedItem, index) => {
		return selectedItem
	}}
	rowTextForSelection={(item, index) => {
		return item
	}}
/>
                </HStack >

                {this.state.SelectedMode == 'Bank Transfer' ? (
                  <Box style={{padding: 20, borderRadius: 20}}>
                    <Box bordered style={{flexDirection: 'column'}}>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: 'bold',
                          textAlign: 'left',
                        }}>
                        {this.state.bank.bankname}{' '}
                        <Text style={{fontSize: 13}}>
                          ({this.state.bank.accname})
                        </Text>
                      </Text>
                      <Text style={{padding: 10, textAlign: 'center'}}>
                        {this.state.bank.accno}
                      </Text>
                    </Box>
                    <Text style={{fontSize: 13, fontWeight: 'bold'}}>
                      Instruction:{' '}
                      <Text style={{fontSize: 13}}>
                        ({this.state.bank.bankNote})
                      </Text>
                    </Text>
                  </Box>
                ) : this.state.SelectedMode == 'Gcash' ? (
                  <Box style={{padding: 20, borderRadius: 20}}>
                    <Box bordered style={{flexDirection: 'column'}}>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: 'bold',
                          textAlign: 'left',
                        }}>
                        {this.state.gcash.gcashnumber}
                      </Text>
                      <Text style={{padding: 10, textAlign: 'center'}}>
                        {this.state.gcash.gcashaccount}
                      </Text>
                    </Box>
                    <Text style={{fontSize: 13, fontWeight: 'bold'}}>
                      Instruction:{' '}
                      <Text style={{fontSize: 13}}>
                        ({this.state.gcash.gcashnote})
                      </Text>
                    </Text>
                  </Box>
                ) : null}
                <Text style={{marginTop: 5, fontSize: 13, fontWeight: 'bold'}}>
                  Phone Number
                </Text>
                <HStack 
                  icon
                  style={{
                    backgroundColor: '#f7f8fa',
                    borderRadius: 10,
                    left: -25,
                    width: SCREEN_WIDTH / 1.06,
                  }}>
                  <Box style={{left: 10}}>
                    <Button style={{backgroundColor: '#FFFFFF'}}>
                      <AntDesign name={'mobile1'} size={25} color="#b5b5b5" />
                    </Button>
                  </Box>
                  <Box>
                  <SelectDropdown
	data={[this.state.address_list.map(a => a.phone)]}
  buttonStyle={{width: SCREEN_WIDTH / 1.06}}
  defaultValue={this.state.phone}
	onSelect={(selectedItem, index) => {
    this.setState({phone: selectedItem})
	}}
	buttonTextAfterSelection={(selectedItem, index) => {
		return selectedItem
	}}
	rowTextForSelection={(item, index) => {
		return item
	}}
/>
                  </Box>
                </HStack >

                <Text style={{marginTop: 5, fontSize: 13, fontWeight: 'bold'}}>
                  Note
                </Text>
                <HStack 
                  icon
                  style={{
                    backgroundColor: '#f7f8fa',
                    borderRadius: 10,
                    left: -25,
                    width: SCREEN_WIDTH / 1.06,
                  }}>
                  <Box style={{left: 10}}>
                    <Button style={{backgroundColor: '#FFFFFF'}}>
                      <AntDesign name={'book'} size={25} color="#b5b5b5" />
                    </Button>
                  </Box>
                  <Box>
                    <Input
                      placeholder={
                        this.state.note == '' ? 'Note' : this.state.note
                      }
                      value={this.state.note}
                      onChangeText={text => {
                        this.setState({note: text});
                      }}
                      placeholderTextColor="#687373"
                      style={{marginLeft:10}}
                        w={SCREEN_WIDTH / 1.3}
                    />
                  </Box>
                </HStack >
              </ScrollView>
              <Button
                style={{height: 50, backgroundColor: '#33c37d', marginTop: 10}}
                onPress={() => {
                  this.state.uid == null
                    ? null
                    : this.state.storewallet < 1
                    ? null
                    : this.FinalCheckouts();
                }}>
                <Text style={{color: 'white'}}>
                  {this.state.uid == null
                    ? 'Log in to Continue'
                    : this.state.storewallet < 1
                    ? 'Unavailable'
                    : 'Continue Booking'}
                </Text>
              </Button>
            </Box>
          </Modal>
          <Modal
            isVisible={this.state.warningModal}
            onBackButtonPress={() => this.setState({warningModal: false})}
            animationInTiming={500}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            animationOutTiming={500}
            useNativeDriver={true}
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
                style={{height: 50, backgroundColor: '#019fe8'}}
                onPress={() => this.setState({warningModal: false})}>
                <Text style={{color: 'white'}}>Ok</Text>
              </Button>
            </View>
          </Modal>
          <Modal
            isVisible={this.state.showURL}
            onBackButtonPress={() => this.setState({showURL: false})}
            animationInTiming={700}
            style={{marginLeft: 5}}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            animationOutTiming={700}
            useNativeDriver={true}
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
            onBackButtonPress={() => this.OrderSuccess()}
            animationInTiming={500}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            animationOutTiming={500}
            useNativeDriver={true}
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
                style={{height: 50, backgroundColor: '#019fe8'}}
                onPress={() => this.OrderSuccess()}>
                <Text style={{color: 'white'}}>Ok</Text>
              </Button>
            </View>
          </Modal>

          <Modal
            isVisible={this.state.FinalCheckout}
            onBackButtonPress={() => this.setState({FinalCheckout: false})}
            animationInTiming={500}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            animationOutTiming={500}
            useNativeDriver={true}
            onBackdropPress={() => this.setState({FinalCheckout: false})}
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

                <VStack>
                  <View style={{paddingVertical: 15}}>
                    <View style={{flexDirection: 'row'}}>
                      <Box
                        style={{
                          flex: 1,
                          justifyContent: 'flex-start',
                          alignItems: 'flex-start',
                        }}>
                        <Text style={{fontSize: 13, fontWeight: 'bold'}}>
                          {this.state.datas.name}
                        </Text>
                        <Text note style={{fontSize: 13}}>
                          {this.state.passenger} Person/s
                        </Text>
                        <Text note style={{fontSize: 13}}>
                          Address: {this.state.datas.address}
                        </Text>
                        <Text note style={{fontSize: 13}}>
                          by {this.state.datas.store_name}
                        </Text>
                      </Box>
                      <Box style={{textAlign: 'right'}}>
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: 'bold',
                            marginBottom: 10,
                          }}>
                          {this.props.route.params.currency}
                          {Math.round(parseFloat(pricetoPay) * 10) / 10}
                        </Text>
                      </Box>
                    </View>
                  </View>
                </VStack>

                <View>
                  <Box style={{padding: 8}}>
                    <Box>
                      <Text style={{fontSize: 13, color: 'green'}}>
                        Sub Total
                      </Text>
                    </Box>
                    <Box>
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
                        value={Math.round(parseFloat(pricetoPay) * 10) / 10}
                        displayType={'text'}
                        thousandSeparator={true}
                        prefix={this.props.route.params.currency}
                      />
                    </Box>
                  </Box>
                  <Box style={{padding: 8}}>
                    <Box>
                      <Text style={{fontSize: 13, color: 'green'}}>
                        Duration ({this.state.SelectedPricing})
                      </Text>
                    </Box>
                    <Box>
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
                          this.state.SelectedPricing == 'Day'
                            ? Math.round(this.state.numberofhours / 24)
                            : this.state.SelectedPricing == 'Hour'
                            ? Math.round(
                                parseFloat(this.state.numberofhours) * 10,
                              ) / 10
                            : this.state.SelectedPricing == 'Weekly'
                            ? Math.round(parseFloat(this.state.Duration) * 10) /
                              10
                            : Math.round(parseFloat(this.state.Duration) * 10) /
                              10
                        }
                        displayType={'text'}
                        thousandSeparator={true}
                      />
                    </Box>
                  </Box>

                  <View style={styles.line} />
                  <Box style={{padding: 8}}>
                    <Box>
                      <Text style={{fontSize: 13, color: 'green'}}>Total</Text>
                    </Box>
                    <Box>
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
                        value={Math.round(this.state.total * 10) / 10}
                        displayType={'text'}
                        thousandSeparator={true}
                        prefix={this.props.route.params.currency}
                      />
                    </Box>
                  </Box>
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
                  onPress={() => {
                    Math.round(this.state.total * 10) / 10 < 1
                      ? Alert.alert('Invalid Total')
                      : this.checkOut();
                  }}>
                  <Text style={{color: '#ffffff'}}>Book Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </Box>
      </Box>
    );
  }

  async checkOut() {
    let StatDayPrice = this.state.datas.StatDayPrice == true ? 'Day' : null;
    let StatHourPrice = this.state.datas.StatHourPrice == true ? 'Hour' : null;
    let StatHourPrice3 =
      this.state.datas.StatHourPrice3 == true ? 'Hour3' : null;
    let StatHourPrice6 =
      this.state.datas.StatHourPrice6 == true ? '6Hour' : null;
    let StatHourPrice12 =
      this.state.datas.StatHourPrice12 == true ? '12Hour' : null;
    let StatWeeklyPrice =
      this.state.datas.StatWeeklyPrice == true ? 'Weekly' : null;
    let StatMonthlyPrice =
      this.state.datas.StatMonthlyPrice == true ? 'Monthly' : null;
    let pricetoPay =
      this.state.SelectedPricing == 'Hour3'
        ? this.state.datas.HourPrice3
        : this.state.SelectedPricing == '6Hour'
        ? this.state.datas.HourPrice6
        : this.state.SelectedPricing == '12Hour'
        ? this.state.datas.HourPrice12
        : this.state.SelectedPricing == 'Hour'
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
    if (this.state.passenger == '0' || this.state.passenger == '') {
      Alert.alert('Declare number of Person', '', [{text: 'OK'}]);
      return;
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
      productId: this.state.datas.id,
      refNo:
        this.ReferenceNo1(1) +
        this.ReferenceNo2(1) +
        this.ReferenceNo3(1) +
        this.ReferenceNo4(1) +
        this.ReferenceNo5(1) +
        this.ReferenceNo6(1),
      guestName: this.state.guestName,
      isGuest: this.state.isGuest,
      currency: this.props.route.params.currency,
      admin_token: this.state.admin_token
        .concat(this.state.notification_token)
        .filter(a => a),
      city: this.state.datas.city.trim(),
      typeOfRate: this.props.route.params.typeOfRate,
      rentalType: 'Hotels',
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
        this.state.SelectedPricing == 'Hour3'
          ? moment(this.state.startDate).add(3, 'hour').unix()
          : this.state.SelectedPricing == '6Hour'
          ? moment(this.state.startDate).add(6, 'hour').unix()
          : this.state.SelectedPricing == '12Hour'
          ? moment(this.state.startDate).add(12, 'hour').unix()
          : this.state.SelectedPricing == 'Weekly'
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
      HourPrice3: parseFloat(this.state.datas.HourPrice3),
      HourPrice6: parseFloat(this.state.datas.HourPrice6),
      HourPrice12: parseFloat(this.state.datas.HourPrice12),
      StatHourPrice3: this.state.datas.StatHourPrice3,
      StatHourPrice6: this.state.datas.StatHourPrice6,
      StatHourPrice12: this.state.datas.StatHourPrice12,
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
      user_token: this.state.notification_token,
      Note: this.state.note,
      PaymentMethod: this.state.SelectedMode,
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
      ProductType: 'Hotels',
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
