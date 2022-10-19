import React, {Component} from 'react';
import {
  AppState,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
  StyleSheet,
  TouchableHighlight,
  FlatList,
  Image,
  TouchableOpacity,
  Text,
  View,
  ScrollView,
  PermissionsAndroid,
  Alert,
  Platform,
  ImageBackground,
} from 'react-native';
import {
  Button,
  Box,

} from 'native-base';
var {height, width} = Dimensions.get('window');
import Swiper from 'react-native-swiper';
import FastImage from 'react-native-fast-image';
import firestore from '@react-native-firebase/firestore';
import CategoryBlock from '../components/CategoryBlock';
import Loader from '../components/Loader';
import CustomHeader from './Header';
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StoreCard from '../components/StoreCard';
import Fontisto from 'react-native-vector-icons/Fontisto';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Modal from 'react-native-modal';
import {RadioButton, Divider, Badge} from 'react-native-paper';
import SegmentedControlTab from 'react-native-segmented-control-tab';
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
import Carousel, {Pagination} from 'react-native-snap-carousel';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';
import Province from './Province.json';
import HomeScreenRentals from './HomeScreenRentals';
import HomeScreenServiceOff from './HomeScreenServiceOff';
import CartBadge from '../components/CartBadge';
import auth from '@react-native-firebase/auth';
import MapboxGL, {Logger} from '@react-native-mapbox-gl/maps';
import Draggable from 'react-native-draggable';
import Icon from 'react-native-vector-icons/AntDesign';
import {FlatGrid} from 'react-native-super-grid';
import PhotoGrid from '../components/PhotoGrid';
import moment from 'moment';
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

const BannerWidth = Dimensions.get('window').width;

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

export default class HomeScreen2 extends Component {
  constructor(props) {
    super(props);
    this.Rotatevalue = new Animated.Value(0);
    this.cityRef = firestore();
    this.ref = firestore().collection('carousel');
    this.catref = firestore().collection('categories');
    this.catref = this.catref.orderBy('id', 'asc');
    this.state = {
      appState: AppState.currentState,
      product: [],
      loading: false,
      categories: [],
      dataBanner: [],
      dataCategories: [],
      dataFood: [],
      selectCatg: 0,
      rewards: [],
      featured: [],
      dataSource: [],
      selectedCity: 'All',
      visibleModal: false,
      City: '',
      country: '',
      cities: [],
      selectedFilter: 'Alphabetical-(A-Z)',
      selectedcategories: 0,
      selectedIndex: 0,
      selectedIndexRentals: 0,
      carsAvailable: [],
      cLat: null,
      cLong: null,
      Prentals: [],
      Vrentals: [],
      selectedCityUser: '',
      typeOfRate: '',
      userId: '',
      fromPlace: '',
      x: {latitude: 8.952566677309449, longitude: 125.5309380090034},
      modalSelectedCity: false,
      open: false,
      categoriesStores: ['All'],
      UserLocationCountry: '',
      AvailableOn: [],
      currentLocation: '',
      newCity: [],
      SelectedAvailableOn: [],
      searchCountry: '',
      selectedCountry: '',
      CountryNow: [{labelRider: '', currency: '', currencyPabili: ''}],
      asyncselectedCity: null,
      orders: 0,
      transportSelected: 1,
      vInfos: {
        imageArray: [],
        name: '',
        address: '',
        DetailedAddress: '',
        description: '',
        ameneties: '',
        slatitude: '',
        slongitude: '',
      },
      HotelList: [],
      storesList: [],
      Erentals: [],
      FinalCity: '',
      currentImg: 0,
      headerURLs: [],
      showURL: false,
      SelectedURL: '',
      SubCat: 'RTW',
    };
    this.arrayholder = [];
    this.FetchProfile();
  }

  FetchProfile = async () => {
    console.log('Displaying');
  };
  handleIndexChangeRentals = index => {
    this.setState({
      ...this.state,
      selectedIndexRentals: index,
    });
  };
  handleIndexChange = index => {
    this.setState({
      ...this.state,
      selectedIndex: index,
    });
  };
  handleIndexChangecategories = index => {
    this.setState({
      ...this.state,
      selectedcategories: index,
    });
  };
  onCollectionUpdate = querySnapshot => {
    querySnapshot.forEach(doc => {
      this.setState({
        product: doc.data().images,
        loading: false,
      });
    });
  };

  onCategoriesUpdate = querySnapshot => {
    const stores = [];
    querySnapshot.forEach(doc => {
      stores.push({
        datas: doc.data(),
        key: doc.id,
      });
    });
    this.setState({
      categories: stores,
      loading: false,
    });
  };

  getData = async () => {
    const asyncselectedCity = await AsyncStorage.getItem('asyncselectedCity');
    if (Platform.OS === 'android') {
      await request_device_location_runtime_permission();
    }
    Geolocation.getCurrentPosition(
      info => {
        const {coords} = info;
        this.setState({coords});
        axios
          .get(
            `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${coords.latitude}%2C${coords.longitude}&apiKey=5fcoJoPAIOye99-ssHc6TIx73yOAhtWiU1_1p1461X4`,
          )
          .then(res => {
            const UserLocationCountry = res.data.items[0].address.countryName;
            this.setState({
              UserLocationCity:
                UserLocationCountry == 'Philippines'
                  ? 'city'
                  : UserLocationCountry.trim() + '.city',
            });
            this.getAllCity();
          })
          .catch(err => {
            Alert.alert('Error', 'Internet Connection is unstable');
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
          });
        },
        error => {
          //   console.log(error)
        },
      );

    firestore()
      .collection('categories')
      .where('order', '>=', 0)
      .orderBy('order', 'asc')
      .onSnapshot(
        querySnapshot => {
          const categories = [];
          querySnapshot.forEach(doc => {
            //   console.log('doc.data(): ',doc.data())
            categories.push({
              title: doc.data().title,
              SubCat: doc.data().SubCat == undefined ? [] : doc.data().SubCat,
            });
          });
          //  console.log('categories: ', categories)
          this.setState({
            categoriesStores: categories,
          });
        },
        error => {
          //   console.log(error)
        },
      );
    // this.getUserCity();

    this.unsubscribe = this.ref
      .where(
        'city',
        '==',
        this.state.selectedCityUser == null
          ? this.state.City
          : this.state.selectedCityUser,
      )
      .onSnapshot(this.onCollectionUpdate);
    this.subscribe = this.catref.onSnapshot(this.onCategoriesUpdate);
  };

  changeBackgroundImage() {
    let newCurrentImg = 0;
    const {headerURLs, currentImg} = this.state;
    const noOfImages = headerURLs.length;
    console.log('noOfImages: ', noOfImages);
    if (currentImg !== noOfImages - 1) {
      newCurrentImg = currentImg + 1;
    }

    this.setState({currentImg: newCurrentImg});
  }
  async componentDidMount() {
    /*this.willFocusSubscription = this.props.navigation.addListener(
      'focus',
      () => {
      this.getData();
        console.log('Try')
      }
    );*/
    /* const self = this.state.headerURLs;
     setInterval(function () {
      console.log('headerURLs List', self)
    }, 3000);*/

    this.interval = setInterval(() => this.changeBackgroundImage(), 5000);
    this.setState({loading: true});
    //const asyncselectedCity= await AsyncStorage.getItem('asyncselectedCity');
    //console.log('asyncselectedCity: ', asyncselectedCity)
    const asyncselectedCity = await AsyncStorage.getItem('asyncselectedCity');
    const asyncselectedCountry = await AsyncStorage.getItem(
      'asyncselectedCountry',
    );
    this.setState({asyncselectedCity});

    if (Platform.OS === 'android') {
      await request_device_location_runtime_permission();
    }

    Geolocation.getCurrentPosition(
      info => {
        const {coords} = info;
        //console.log('coordsL ', coords)
        this.setState({coords});
        axios
          .get(
            `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${coords.latitude}%2C${coords.longitude}&apiKey=5fcoJoPAIOye99-ssHc6TIx73yOAhtWiU1_1p1461X4`,
          )
          .then(res => {
            const UserLocationCountry = res.data.items[0].address.countryName;
            console.log('UserLocationCountry ', UserLocationCountry);

            this.setState({
              UserLocationCountry: UserLocationCountry.trim(),
            });
            this.getAllCity();
          })
          .catch(err => {
            Alert.alert('Error', 'Internet Connection is unstable');
            //   console.log('Region axios: ',err)
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
          });
        },
        error => {
          //   console.log(error)
        },
      );

    firestore()
      .collection('categories')
      .where('order', '>=', 0)
      .orderBy('order', 'asc')
      .onSnapshot(
        querySnapshot => {
          const categories = [];
          querySnapshot.forEach(doc => {
            //   console.log('doc.data(): ',doc.data())
            categories.push({
              title: doc.data().title,
              SubCat: doc.data().SubCat == undefined ? [] : doc.data().SubCat,
            });
          });
          //  console.log('categories: ', categories)
          this.setState({
            categoriesStores: categories,
          });
        },
        error => {
          //   console.log(error)
        },
      );
    // this.getUserCity();

    this.unsubscribe = this.ref
      .where(
        'city',
        '==',
        asyncselectedCity == null
          ? this.state.selectedCityUser == null
            ? this.state.City
            : this.state.selectedCityUser
          : asyncselectedCity,
      )
      .onSnapshot(this.onCollectionUpdate);
    this.subscribe = this.catref.onSnapshot(this.onCategoriesUpdate);
    console.log(
      'city show ',
      asyncselectedCity == null
        ? this.state.selectedCityUser == null
          ? this.state.City
          : this.state.selectedCityUser
        : asyncselectedCity,
    );
  }

  onPrentals = querySnapshot => {
    let Prentals = [];
    querySnapshot.forEach(doc => {
      Prentals.push(doc.data());
    });
    this.setState({
      Prentals: Prentals.sort((a, b) => Number(b.arrange) - Number(a.arrange)),
    });
  };

  onVrentals = querySnapshot => {
    let Vrentals = [];
    querySnapshot.forEach(doc => {
      let Closing = false;

      if (doc.data().startDate != undefined) {
        var startTime = moment(doc.data().startDate.seconds * 1000).format(
          'H:mm:ss',
        );
        var endTime = moment(doc.data().endDate.seconds * 1000).format(
          'H:mm:ss',
        );

        currentDate = new Date();

        startDate = new Date(currentDate.getTime());
        startDate.setHours(startTime.split(':')[0]);
        startDate.setMinutes(startTime.split(':')[1]);
        startDate.setSeconds(startTime.split(':')[2]);

        endDate = new Date(currentDate.getTime());
        endDate.setHours(endTime.split(':')[0]);
        endDate.setMinutes(endTime.split(':')[1]);
        endDate.setSeconds(endTime.split(':')[2]);

        Closing = valid = startDate < currentDate && endDate > currentDate;
        //  console.log('res: ', valid = startDate < currentDate && endDate > currentDate)
      }
      let objdata = doc.data();
      let obj = Object.assign(objdata, {
        arrange:
          doc.data().wallet < 1
            ? -99999
            : doc.data().status == false ||
              (doc.data().AlwaysOpen == false && Closing == false)
            ? -99999
            : doc.data().arrange,
      });
      //   console.log('objdata: ',objdata )
      console.log('obj: ', obj.arrange);
      Vrentals.push(obj);
    });
    this.setState({
      Vrentals: Vrentals.sort((a, b) => Number(b.arrange) - Number(a.arrange)),
    });
  };
  onCollectionProducts = querySnapshot => {
    const products = [];
    querySnapshot.forEach(doc => {
      //console.log('products: ', doc.data())
      products.push({
        datas: doc.data(),
        key: doc.id,
      });
    });
    // console.log('products: ', products)
    this.setState({loading: false, carsAvailable: products});
    // this.arrayholder = products;
  };

  async getStores(db) {
    const city = [];
    await db.get().then(querySnapshot => {
      querySnapshot.docs.forEach(doc => {
        city.push(doc.data());
      });
    });
    console.log('Stores: ', city);
    this.setState({
      dataSource: city.sort((a, b) => Number(b.arrange) - Number(a.arrange)),
      loading: false,
    });
  }

  _bootstrapAsync = async (selected, item, city) => {
    console.log('Reading bootstrapasync');
    const asyncselectedCity = await AsyncStorage.getItem('asyncselectedCity');
    const asyncselectedCountry = await AsyncStorage.getItem(
      'asyncselectedCountry',
    );
    console.log('asyncselectedCountry:', asyncselectedCountry);
    console.log('asyncselectedCity:', asyncselectedCity);
    const NewCityItem =
      asyncselectedCity == null ? item.trim() : asyncselectedCity.trim();
    console.log('NewCityItem: ', NewCityItem.trim());
    console.log('cities: ', city);
    console.log(
      'cities find: ',
      city.find(items => items.label === NewCityItem),
    );
    const NewValueofCityUser = city.find(items => items.label === NewCityItem);

    console.log('NewValueofCityUser: ', NewValueofCityUser);
    console.log('typeOfRates: ', NewValueofCityUser.typeOfRate);
    this.setState({
      selectedCityUser: item,
      typeOfRate: NewValueofCityUser.typeOfRate,
      FinalCity: NewCityItem,
      headerURLs: NewValueofCityUser.headerPhotos,
    });
    this.ref
      .where('city', '==', NewCityItem)
      .onSnapshot(this.onCollectionUpdate);

    const newUserLocationCountry =
      asyncselectedCountry == null
        ? this.state.UserLocationCountry.trim() == 'Philippines'
          ? 'city'
          : this.state.UserLocationCountry.trim() + '.city'
        : asyncselectedCountry.trim() == 'Philippines'
        ? 'city'
        : asyncselectedCountry + '.city';
    console.log('newUserLocationCountry: ', newUserLocationCountry);
    firestore()
      .collection(newUserLocationCountry)
      .doc(NewCityItem)
      .collection('vehicles')
      .where('Arrange', '!=', 0)
      .orderBy('Arrange', 'asc')
      .onSnapshot(this.onCollectionProducts);
    this.cityRef
      .collection('products')
      .where('rentalType', '==', 'Property')
      .where('arrayofCity', 'array-contains-any', [NewCityItem])
      .onSnapshot(this.onPrentals);
    this.cityRef
      .collection('products')
      .where('rentalType', '==', 'Vehicle')
      .where('arrayofCity', 'array-contains-any', [NewCityItem])
      .onSnapshot(this.onVrentals);

    firestore()
      .collection('stores')
      .where('selectedAccount', '==', 'Hotels')
      .where('arrayofCity', 'array-contains-any', [NewCityItem])
      .onSnapshot(this.onCollectionStoreHotels);
    firestore()
      .collection('stores')
      .where('selectedAccount', '==', 'Rental')
      .where('arrayofCity', 'array-contains-any', [NewCityItem])
      .where('PropertyCounter', '>', 0)
      .onSnapshot(this.onCollectionStoreRental);
    this.cityRef
      .collection('products')
      .where('rentalType', '==', 'Equipment')
      .where('arrayofCity', 'array-contains-any', [NewCityItem])
      .onSnapshot(this.onErentals);

    firestore()
      .collection('stores')
      .where('arrayofCity', 'array-contains-any', [NewCityItem])
      .where('Account', '==', 'Food Delivery')
      .where('wallet', '>', 0)
      .onSnapshot(querySnapshot => {
        const city = [];
        querySnapshot.docs.forEach(async doc => {
          let Closing = false;

          if (doc.data().startDate != undefined) {
            var startTime = moment(doc.data().startDate.seconds * 1000).format(
              'H:mm:ss',
            );
            var endTime = moment(doc.data().endDate.seconds * 1000).format(
              'H:mm:ss',
            );

            currentDate = new Date();

            startDate = new Date(currentDate.getTime());
            startDate.setHours(startTime.split(':')[0]);
            startDate.setMinutes(startTime.split(':')[1]);
            startDate.setSeconds(startTime.split(':')[2]);

            endDate = new Date(currentDate.getTime());
            endDate.setHours(endTime.split(':')[0]);
            endDate.setMinutes(endTime.split(':')[1]);
            endDate.setSeconds(endTime.split(':')[2]);

            Closing = valid = startDate < currentDate && endDate > currentDate;
            //  console.log('res: ', valid = startDate < currentDate && endDate > currentDate)
          }
          let objdata = doc.data();
          let distance = null;

          await axios
            .get(
              `https://route.ls.hereapi.com/routing/7.2/calculateroute.json?apiKey=5fcoJoPAIOye99-ssHc6TIx73yOAhtWiU1_1p1461X4&waypoint0=geo!${
                this.state.coords.latitude
              },${this.state.coords.longitude}&waypoint1=geo!${
                doc.data().slatitude
              },${
                doc.data().slongitude
              }&mode=fastest;car;traffic:disabled&legAttributes=shape`,
            )
            .then(res => {
              distance = res.data.response.route[0].summary.distance;
              console.log('distancess: ', res.data.response.route[0].summary);
            });
          console.log('distance: ', distance);
          let obj = Object.assign(objdata, {
            arrange:
              doc.data().wallet < 1
                ? 1
                : doc.data().status == false ||
                  (doc.data().AlwaysOpen == false && Closing == false)
                ? 1
                : doc.data().arrange == ''
                ? 2
                : doc.data().arrange,
            distance: distance,
          });
          //   console.log('objdata: ',objdata )
          console.log('obj: ', obj.arrange);
          city.push(obj);
        });
        // console.log('Stores: ',city )
        this.setState({
          dataSource: city,
          loading: false,
        });
      });
  };

  onErentals = querySnapshot => {
    let Vrentals = [];
    querySnapshot.forEach(doc => {
      let Closing = false;

      if (doc.data().startDate != undefined) {
        var startTime = moment(doc.data().startDate.seconds * 1000).format(
          'H:mm:ss',
        );
        var endTime = moment(doc.data().endDate.seconds * 1000).format(
          'H:mm:ss',
        );

        currentDate = new Date();

        startDate = new Date(currentDate.getTime());
        startDate.setHours(startTime.split(':')[0]);
        startDate.setMinutes(startTime.split(':')[1]);
        startDate.setSeconds(startTime.split(':')[2]);

        endDate = new Date(currentDate.getTime());
        endDate.setHours(endTime.split(':')[0]);
        endDate.setMinutes(endTime.split(':')[1]);
        endDate.setSeconds(endTime.split(':')[2]);

        Closing = valid = startDate < currentDate && endDate > currentDate;
        //  console.log('res: ', valid = startDate < currentDate && endDate > currentDate)
      }
      let objdata = doc.data();
      let obj = Object.assign(objdata, {
        arrange:
          doc.data().wallet < 1
            ? -99999
            : doc.data().status == false ||
              (doc.data().AlwaysOpen == false && Closing == false)
            ? -99999
            : doc.data().arrange,
      });
      //   console.log('objdata: ',objdata )
      console.log('obj: ', obj.arrange);
      Vrentals.push(obj);
    });
    this.setState({
      Erentals: Vrentals.sort((a, b) => Number(b.arrange) - Number(a.arrange)),
    });
  };
  onCollectionStoreHotels = querySnapshot => {
    let Stores = [];
    querySnapshot.forEach(async doc => {
      let Closing = false;

      if (doc.data().startDate != undefined) {
        var startTime = moment(doc.data().startDate.seconds * 1000).format(
          'H:mm:ss',
        );
        var endTime = moment(doc.data().endDate.seconds * 1000).format(
          'H:mm:ss',
        );

        currentDate = new Date();

        startDate = new Date(currentDate.getTime());
        startDate.setHours(startTime.split(':')[0]);
        startDate.setMinutes(startTime.split(':')[1]);
        startDate.setSeconds(startTime.split(':')[2]);

        endDate = new Date(currentDate.getTime());
        endDate.setHours(endTime.split(':')[0]);
        endDate.setMinutes(endTime.split(':')[1]);
        endDate.setSeconds(endTime.split(':')[2]);

        Closing = valid = startDate < currentDate && endDate > currentDate;
        //  console.log('res: ', valid = startDate < currentDate && endDate > currentDate)
      }
      let objdata = doc.data();

      let distance = null;

      await axios
        .get(
          `https://route.ls.hereapi.com/routing/7.2/calculateroute.json?apiKey=5fcoJoPAIOye99-ssHc6TIx73yOAhtWiU1_1p1461X4&waypoint0=geo!${
            this.state.coords.latitude
          },${this.state.coords.longitude}&waypoint1=geo!${
            doc.data().slatitude
          },${
            doc.data().slongitude
          }&mode=fastest;car;traffic:disabled&legAttributes=shape`,
        )
        .then(res => {
          distance = res.data.response.route[0].summary.distance;
          //    console.log('distancess: ',res.data.response.route[0].summary)
        });
      //  console.log('distance: ',distance)

      let obj = Object.assign(objdata, {
        arrange:
          doc.data().wallet < 1
            ? -99999
            : doc.data().status == false ||
              (doc.data().AlwaysOpen == false && Closing == false)
            ? -99999
            : doc.data().arrange,
        distance: distance,
      });
      //   console.log('objdata: ',objdata )
      // console.log('obj: ',obj.arrange )
      if (obj.wallet > 0) {
        Stores.push(obj);
      }
    });

    this.setState({
      HotelList: Stores,
    });
  };
  onCollectionStoreRental = querySnapshot => {
    let Stores = [];
    querySnapshot.forEach(doc => {
      let Closing = false;

      if (doc.data().startDate != undefined) {
        var startTime = moment(doc.data().startDate.seconds * 1000).format(
          'H:mm:ss',
        );
        var endTime = moment(doc.data().endDate.seconds * 1000).format(
          'H:mm:ss',
        );

        currentDate = new Date();

        startDate = new Date(currentDate.getTime());
        startDate.setHours(startTime.split(':')[0]);
        startDate.setMinutes(startTime.split(':')[1]);
        startDate.setSeconds(startTime.split(':')[2]);

        endDate = new Date(currentDate.getTime());
        endDate.setHours(endTime.split(':')[0]);
        endDate.setMinutes(endTime.split(':')[1]);
        endDate.setSeconds(endTime.split(':')[2]);

        Closing = valid = startDate < currentDate && endDate > currentDate;
        //  console.log('res: ', valid = startDate < currentDate && endDate > currentDate)
      }
      let objdata = doc.data();
      let obj = Object.assign(objdata, {
        arrange:
          doc.data().wallet < 1
            ? -99999
            : doc.data().status == false ||
              (doc.data().AlwaysOpen == false && Closing == false)
            ? -99999
            : doc.data().arrange,
      });
      //   console.log('objdata: ',objdata )
      console.log('obj: ', obj.arrange);
      if (obj.wallet > 0) {
        Stores.push(obj);
      }
    });
    this.setState({
      storesList: Stores.sort((a, b) => Number(b.arrange) - Number(a.arrange)),
    });
  };

  rowRendererErentals = data => {
    const {
      name,
      DayPrice,
      HourPrice,
      MonthlyPrice,
      StatDayPrice,
      StatHourPrice,
      StatMonthlyPrice,
      StatWeeklyPrice,
      WeeklyPrice,
      MBrand,
      VModel,
      ColorMotor,
      imageArray,
      brand,
      store_name,
    } = data;
    const newData = imageArray.filter(items => {
      const itemData = items;
      const textData = 'AddImage';

      return itemData.indexOf(textData) == -1;
    });
    return (
      <Box
        style={{flex: 1, justifyContent: 'center', alignContent: 'center', marginBottom:10}}>
        <Box
          style={{
            paddingBottom: 0,
            marginBottom: 0,
            paddingLeft: 0,
            paddingRight: 0,
            paddingTop: 0,
            borderRadius: 20,
            borderWidth: 1,
            width: SCREEN_WIDTH / 2 - 5,
            backgroundColor:'white'
          }}>
          <TouchableOpacity
            style={{width: SCREEN_WIDTH / 2 - 5, flex: 1,}}
            onPress={() =>
              this.setState({
                vInfos: data,
                VisibleAddInfo: true,
                MonthlyPrice: data.MonthlyPrice.toString(),
                DayPrice: data.DayPrice.toString(),
                HourPrice: data.HourPrice.toString(),
                WeeklyPrice: data.WeeklyPrice.toString(),
              })
            }>
            <FastImage
              style={styles.productPhoto}
              source={{
                uri: newData[0],
                headers: {Authorization: 'someAuthToken'},
                priority: FastImage.priority.normal,
              }}
              resizeMode={FastImage.resizeMode.cover}>
              {!StatHourPrice ? null : (
                <View
                  style={{
                    backgroundColor: 'white',
                    width: 70,
                    height: 35,
                    flexDirection: 'column',
                    alignSelf: 'flex-end',
                    position: 'absolute',
                  }}>
                  <Text
                    style={{
                      fontStyle: 'italic',
                      borderRadius: 5,
                      fontSize: 12,
                      paddingLeft: 5,
                    }}>
                    {this.props.currency}
                    {parseFloat(HourPrice)
                      .toFixed(2)
                      .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}{' '}
                  </Text>
                  <Text
                    style={{
                      fontStyle: 'italic',
                      borderRadius: 5,
                      fontSize: 10,
                      paddingLeft: 5,
                    }}>
                    /Hour
                  </Text>
                </View>
              )}

              {!StatDayPrice ? null : (
                <View
                  style={{
                    backgroundColor: 'white',
                    width: 70,
                    height: 35,
                    flexDirection: 'column',
                    alignSelf: 'flex-end',
                    position: 'absolute',
                  }}>
                  <Text
                    style={{
                      fontStyle: 'italic',
                      borderRadius: 5,
                      fontSize: 12,
                      paddingLeft: 5,
                    }}>
                    {this.props.currency}
                    {parseFloat(DayPrice)
                      .toFixed(2)
                      .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}{' '}
                  </Text>
                  <Text
                    style={{
                      fontStyle: 'italic',
                      borderRadius: 5,
                      fontSize: 10,
                      paddingLeft: 5,
                    }}>
                    /Day
                  </Text>
                </View>
              )}
              {!StatWeeklyPrice ? null : (
                <View
                  style={{
                    backgroundColor: 'white',
                    width: 70,
                    height: 35,
                    flexDirection: 'column',
                    alignSelf: 'flex-end',
                    position: 'absolute',
                  }}>
                  <Text
                    style={{
                      fontStyle: 'italic',
                      borderRadius: 5,
                      fontSize: 12,
                      paddingLeft: 5,
                    }}>
                    {this.props.currency}
                    {parseFloat(WeeklyPrice)
                      .toFixed(2)
                      .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}{' '}
                  </Text>
                  <Text
                    style={{
                      fontStyle: 'italic',
                      borderRadius: 5,
                      fontSize: 10,
                      paddingLeft: 5,
                    }}>
                    /Week
                  </Text>
                </View>
              )}
              {!StatMonthlyPrice ? null : (
                <View
                  style={{
                    backgroundColor: 'white',
                    width: 70,
                    height: 35,
                    flexDirection: 'column',
                    alignSelf: 'flex-end',
                    position: 'absolute',
                  }}>
                  <Text
                    style={{
                      fontStyle: 'italic',
                      borderRadius: 5,
                      fontSize: 12,
                      paddingLeft: 5,
                    }}>
                    {this.props.currency}
                    {parseFloat(MonthlyPrice)
                      .toFixed(2)
                      .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}{' '}
                  </Text>
                  <Text
                    style={{
                      fontStyle: 'italic',
                      borderRadius: 5,
                      fontSize: 10,
                      paddingLeft: 5,
                    }}>
                    /Month
                  </Text>
                </View>
              )}
            </FastImage>

            <View style={{height: 20, flexShrink: 1}}>
              <Text numberOfLines={1} style={styles.categoriesStoreName}>
                {name}
              </Text>
            </View>
            <View style={{flexDirection: 'row'}}>
              <Text
                style={{fontStyle: 'italic', fontSize: 10, paddingLeft: 20}}>
                Brand :{MBrand}
              </Text>
            </View>
            <Text style={{fontStyle: 'italic', fontSize: 10, paddingLeft: 20}}>
              Model : {VModel}
            </Text>
            <Text style={{fontStyle: 'italic', fontSize: 10, paddingLeft: 20}}>
              Color : {ColorMotor}
            </Text>
          </TouchableOpacity>
        </Box>
      </Box>
    );
  };
  async getUserCity() {
    const userId = await AsyncStorage.getItem('uid');
    this.setState({userId: userId});
    //  console.log('userId: ', userId)
    //  this.subscribe = this.cityRef.collection('users').where('userId','==', userId).onSnapshot(this.onCityUpdate)
  }

  async getCountryCity(PressedCountrycode) {
    this.setState({loading: true});
    //  console.log('getCountryCity')
    // console.log('PressedCountrycode: ', PressedCountrycode)

    const asyncselectedCountry = await AsyncStorage.getItem(
      'asyncselectedCountry',
    );
    const city = [];
    const collect =
      asyncselectedCountry == null
        ? PressedCountrycode == 'Philippines'
          ? 'city'
          : this.state.UserLocationCountry + '.city'
        : asyncselectedCountry + '.city';
    //   console.log('collect: ', collect)
    //     console.log('UserLocationCountry: ', this.state.UserLocationCountry)
    //          console.log('selectedCountry: ', this.state.selectedCountry)
    firestore()
      .collection(collect)
      .where(
        'country',
        '==',
        asyncselectedCountry == null
          ? PressedCountrycode
          : asyncselectedCountry,
      )
      .onSnapshot(querySnapshot => {
        querySnapshot.docs.forEach(doc => {
          city.push(doc.data());
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
    //       console.log('CountryNow: ', CountryNow)

    //  console.log('getCountryCity city: ', city)
    this.setState({
      CountryNow:
        CountryNow.length < 1
          ? [{labelRider: '', currency: '', currencyPabili: ''}]
          : CountryNow,
      cities: city,
      loading: false,
    });
  }

  async getAllCity() {
    this.setState({loading: true});
    const city = [];
    const asyncselectedCountry = await AsyncStorage.getItem(
      'asyncselectedCountry',
    );
    // const asyncselectedCity= await AsyncStorage.getItem('asyncselectedCity');
    const collect =
      asyncselectedCountry == null
        ? this.state.UserLocationCountry.trim() == 'Philippines'
          ? 'city'
          : this.state.UserLocationCountry.trim() + '.city'
        : asyncselectedCountry.trim() == 'Philippines'
        ? 'city'
        : asyncselectedCountry + '.city';
    //    console.log('getAllCity collect: ', collect)
    //     console.log('UserLocationCountry: ', this.state.UserLocationCountry)
    //           console.log('selectedCountry: ', this.state.selectedCountry)
    firestore()
      .collection(collect)
      .onSnapshot(querySnapshot => {
        querySnapshot.docs.forEach(doc => {
          city.push(doc.data());
          //    console.log('collect data: ', doc.data())
        });

        Geolocation.getCurrentPosition(
          info => {
            const {coords} = info;
            //console.log('coordsL ', coords)

            axios
              .get(
                `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${coords.latitude}%2C${coords.longitude}&apiKey=5fcoJoPAIOye99-ssHc6TIx73yOAhtWiU1_1p1461X4`,
              )
              .then(res => {
                const item = res.data.items[0];
                // console.log('res: ', res.data.features[0]);
                let str = res.data.items[0].address.label;

                let CityWeAreNow = res.data.items[0].address.city;
                const UserLocation = res.data.items[0].address.city;
                //console.log('UserLocation: ', UserLocation)

                this.setState({
                  selectedCityUser: UserLocation,

                  x: {latitude: coords.latitude, longitude: coords.longitude},
                  loading: false,
                });

                this._bootstrapAsync(true, UserLocation, city);
              })
              .catch(err => {
                Alert.alert('Error', 'Internet Connection is unstable');
                // console.log('Region axios: ',err)
              });
          },
          error => console.log(error),
          {
            enableHighAccuracy: false,
            timeout: 2000,
            maximumAge: 3600000,
          },
        );
      });

    const CountryNow = this.state.AvailableOn.filter(items => {
      const itemData = items.label;
      const textData =
        asyncselectedCountry == null
          ? this.state.UserLocationCountry
          : asyncselectedCountry;

      return itemData.indexOf(textData) > -1;
    });
    console.log('city: ', city);
    console.log('CountryNow: ', CountryNow);
    this.setState({
      cities: city,
      CountryNow,
    });
  }

  onCityUpdate = async querySnapshot => {
    const userId = await AsyncStorage.getItem('uid');
    // console.log('userId: ', userId)
    let Address = '';

    querySnapshot.forEach(doc => {
      (Address = doc.data().Address.City),
        this.setState({
          City: doc.data().Address.City,
        });
    });
    const addresspass = userId == null ? this.state.cities[0].label : Address;
    //   console.log('addresspass: ', addresspass)
    this._bootstrapAsync(false, addresspass, this.state.cities);
  };

  openModal() {
    this.setState({
      visibleModal: true,
    });
  }
  renderCategories() {
    let cat = [];
    //console.log('carousel : ', this.state.categories )
    for (var i = 0; i < this.state.categories.length; i++) {
      cat.push(
        <CategoryBlock
          key={this.state.categories[i].datas.id}
          id={this.state.categories[i].datas.id}
          image={this.state.categories[i].datas.image}
          title={this.state.categories[i].datas.title}
          navigation={this.props.navigation}
        />,
      );
    }
    return cat;
  }

  rowRenderer = data => {
    const {
      SeatingCapicty,
      LoadCapacity,
      name,
      quantity,
      image,
      unit,
      vehicle,
      id,
      base,
      base_fare,
      succeed,
      ColorMotor,
      brand,
      store_name,
    } = data;

    return (
      <Box
        transparent
        style={{flex: 1, justifyContent: 'center', alignContent: 'center', marginBottom:10}}>
        <Box
          style={{
            paddingBottom: 0,
            marginBottom: 0,
            paddingLeft: 0,
            paddingRight: 0,
            paddingTop: 0,
            borderRadius: 20,
            borderWidth: 1,
            width: SCREEN_WIDTH / 2 - 5,
            backgroundColor: '#333333',
          }}>
          <TouchableOpacity
            style={{width: SCREEN_WIDTH / 2 - 5, flex: 1}}
            onPress={() => this.props.navigation.navigate('Login')}>
            <Swiper
              style={{
                width: '100%',
                height: 150,
                shadowOffset: {
                  width: 0,
                  height: 3,
                },
                borderTopRightRadius: 20,
                borderTopLeftRadius: 20,
                shadowRadius: 5,
                shadowOpacity: 1.0,
                elevation: 3,
              }}
              key={image.length}
              showsButtons={false}
              autoplay={true}
              autoplayTimeout={3}>
              {image.map((itembann, index) => {
                return itembann == 'AddImage' ? null : (
                  <Image
                    style={styles.productPhoto}
                    resizeMode="cover"
                    source={{uri: itembann}}
                    key={index}
                  />
                );
              })}
            </Swiper>
            <View style={{height: 20, flexShrink: 1, flexDirection: 'row'}}>
              <Text
                numberOfLines={1}
                style={[
                  styles.categoriesStoreName,
                  {
                    color: 'white',
                    fontWeight: 'normal',
                    width: SCREEN_WIDTH / 4,
                  },
                ]}>
                {vehicle}
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  styles.categoriesStoreName,
                  {color: 'white', fontWeight: 'normal'},
                ]}>
                {this.state.CountryNow[0].currency}
                {this.state.typeOfRate == 'Municipal Rate'
                  ? base_fare
                  : this.state.typeOfRate == 'City Rate'
                  ? 'City'
                  : 'Metro'}
              </Text>
            </View>
            <View
              style={{
                height: 20,
                flexShrink: 1,
                marginBottom: 5,
                flexDirection: 'row',
              }}>
              {SeatingCapicty == undefined || SeatingCapicty == '' ? null : (
                <Text
                  numberOfLines={1}
                  style={[
                    styles.categoriesStoreName,
                    {
                      color: 'white',
                      fontWeight: 'normal',
                      width: SCREEN_WIDTH / 4.5,
                    },
                  ]}>
                  <MaterialCommunityIcons
                    name={'seat-passenger'}
                    size={15}
                    color={'white'}
                  />
                  {SeatingCapicty}
                </Text>
              )}
              {LoadCapacity == undefined || LoadCapacity == '' ? null : (
                <Text
                  numberOfLines={1}
                  style={[
                    styles.categoriesStoreName,
                    {color: 'white', fontWeight: 'normal'},
                  ]}>
                  <MaterialCommunityIcons
                    name={'weight'}
                    size={15}
                    color={'white'}
                  />{' '}
                  {LoadCapacity}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </Box>
      </Box>
    );
  };

  setOpen = open => {
    this.setState({
      open,
    });
  };

  rowRendererVrentals = data => {
    const {
      admin_control,
      name,
      DayPrice,
      HourPrice,
      MonthlyPrice,
      StatDayPrice,
      StatHourPrice,
      StatMonthlyPrice,
      StatWeeklyPrice,
      WeeklyPrice,
      MBrand,
      VModel,
      ColorMotor,
      imageArray,
      brand,
      store_name,
    } = data;
    const newData = imageArray.filter(items => {
      const itemData = items;
      const textData = 'AddImage';

      return itemData.indexOf(textData) == -1;
    });
    return (
      <Box
        transparent
        style={{flex: 1, justifyContent: 'center', alignContent: 'center', marginBottom:10}}>
        <Box
          style={{
            paddingBottom: 0,
            marginBottom: 0,
            paddingLeft: 0,
            paddingRight: 0,
            paddingTop: 0,
            borderRadius: 20,
            borderWidth: 1,
            width: SCREEN_WIDTH / 2 - 5,
            backgroundColor: '#333333',
          }}>
          <TouchableOpacity
            style={{width: SCREEN_WIDTH / 2 - 5, flex: 1}}
            onPress={() =>
              this.setState({
                vInfos: data,
                VisibleAddInfo: true,
                MonthlyPrice: data.MonthlyPrice.toString(),
                DayPrice: data.DayPrice.toString(),
                HourPrice: data.HourPrice.toString(),
                WeeklyPrice: data.WeeklyPrice.toString(),
              })
            }>
            <FastImage
              style={styles.productPhoto}
              source={{
                uri: newData[0],
                headers: {Authorization: 'someAuthToken'},
                priority: FastImage.priority.normal,
              }}
              resizeMode={FastImage.resizeMode.cover}></FastImage>

            <View style={{height: 20, flexShrink: 1}}>
              <Text
                numberOfLines={1}
                style={[
                  styles.categoriesStoreName,
                  {color: 'white', fontWeight: 'normal'},
                ]}>
                {VModel}{' '}
                {!StatHourPrice
                  ? null
                  : this.state.CountryNow[0].currency +
                    parseFloat(HourPrice)
                      .toFixed(2)
                      .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                {!StatDayPrice
                  ? null
                  : this.state.CountryNow[0].currency +
                    parseFloat(DayPrice)
                      .toFixed(2)
                      .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                {!StatWeeklyPrice
                  ? null
                  : this.state.CountryNow[0].currency +
                    parseFloat(WeeklyPrice)
                      .toFixed(2)
                      .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                {!StatMonthlyPrice
                  ? null
                  : this.state.CountryNow[0].currency +
                    parseFloat(MonthlyPrice)
                      .toFixed(2)
                      .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
              </Text>
            </View>
          </TouchableOpacity>
        </Box>
      </Box>
    );
  };

  StartImageRotationFunction() {
    this.Rotatevalue.setValue(0);
    Animated.timing(this.Rotatevalue, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: true, // Add This line
    }).start(() => this.StartImageRotationFunction());
  }

  onPressSearchMenu() {
    this.props.navigation.navigate('Account');
  }
  componentWillUnmount() {
    //  this.appStateSubscription.remove();
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
  onPressPabili() {
    if (this.state.CountryNow.length == 0) {
      this.getData;
    } else {
      this.props.navigation.navigate('Pabili', {
        typeOfRate: this.state.typeOfRate,
        selectedCityUser: this.state.selectedCityUser,
        cLat: this.state.x.latitude,
        cLong: this.state.x.longitude,
        fromPlace: this.state.fromPlace,
        code: this.state.CountryNow[0].code,
        context: this.state.context,
        currency:
          this.state.CountryNow.length == 0
            ? ''
            : this.state.CountryNow[0].currency,
        billing_streetTo: this.state.billing_streetTo,
        billing_provinceTo: this.state.billing_provinceTo,
        currentLocation: this.state.currentLocation,
        UserLocationCountry: this.state.UserLocationCountry,
      });
    }
  }

  render() {
    //console.log('selectedCityUser Homescreen: ',this.state.selectedCityUser)
    //  console.log('UserLocationCountry typeOfRate: ', this.state.UserLocationCountry)
    console.log('FinalCity: ', this.state.FinalCity);
    const RotateData = this.Rotatevalue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '368deg'],
    });

    const trans = {
      transform: [{rotate: RotateData}],
    };

    //console.log('selectedCityUser Homescreen: ',this.state.selectedCityUser)
    //  console.log('UserLocationCountry typeOfRate: ', this.state.UserLocationCountry)
    //  console.log('CountryNow: ', this.state.CountryNow)

    return (
      <View style={{backgroundColor: '#a3b6c9'}}>
        <View
          androidStatusBarColor="#396ba0"
          style={{backgroundColor: '#396ba0', height: 150}}
          elevated={true}>
          <ImageBackground
            source={
              this.state.headerURLs.length == 0
                ? require('../assets/header.gif')
                : {uri: this.state.headerURLs[this.state.currentImg]}
            }
            resizeMode="cover"
            style={{height: 150, width: SCREEN_WIDTH}}>
            <Box style={{flex: 3, width: '100%', flexDirection: 'row'}}>
              {/*<Image style={{  width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: 'white', overflow: "hidden"}} source={require('../assets/logo.png')} />
               */}

              <View
                style={{
                  flexDirection: 'column',
                  width: '90%',
                  marginLeft: 15,
                  marginTop: 20,
                  paddingLeft: 10,
                }}>
                <View
                  style={{
                    flex: 1,
                    alignSelf: 'flex-end',
                    position: 'absolute',
                    right: 0,
                  }}>
                  <CartBadge
                    navigation={this.props.navigation}
                    fromPlace={this.state.fromPlace}
                    currency={
                      this.state.CountryNow.length == 0
                        ? ''
                        : this.state.CountryNow.length == 0
                        ? ''
                        : this.state.CountryNow[0].currency
                    }
                  />
                </View>

                <View style={{width: SCREEN_WIDTH / 2.5, marginTop: 10}}></View>
              </View>
            </Box>
          </ImageBackground>
        </View>

        {
          /// Map and pabili
        }
        <View style={{backgroundColor: '#ee4e4e', height: 60}}>
          <View style={{flex: 1, flexDirection: 'row', width: 200, height: 60}}>
            <MapboxGL.MapView
              style={{height: 60, width: SCREEN_WIDTH / 2, marginLeft: -10}}
              attributionEnabled={false}
              logoEnabled={false}
              onPress={() => this.onPressPabili()}>
              <MapboxGL.Camera
                centerCoordinate={[
                  this.state.x.longitude,
                  this.state.x.latitude,
                ]}
                zoomLevel={11}
                followUserMode={'normal'}
              />

              <MapboxGL.PointAnnotation
                coordinate={[this.state.x.longitude, this.state.x.latitude]}
              />
            </MapboxGL.MapView>
            <TouchableOpacity
              style={{
                justifyContent: 'center',
                alignContent: 'center',
                width: SCREEN_WIDTH / 2.2,
                flexDirection: 'column',
                paddingTop: 0,
                paddingLeft: 10,
              }}
              onPress={() => this.onPressPabili()}>
              <Text
                style={{
                  fontSize: 11,
                  paddingLeft: 5,
                  color: 'white',
                  left: 80,
                }}>
                Starts at{' '}
              </Text>
              <Text style={{fontSize: 20, paddingLeft: 5, color: 'white'}}>
                {this.state.CountryNow.length == 0
                  ? ''
                  : this.state.CountryNow[0].labelRider}{' '}
                {this.state.CountryNow.length == 0
                  ? ''
                  : this.state.CountryNow[0].currencyPabili}{' '}
                {this.state.CountryNow.length == 0
                  ? ''
                  : this.state.CountryNow[0].pabiliminim}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View
          transparent
          style={{
            width: SCREEN_WIDTH - 30,
            alignSelf: 'center',
            borderRadius: 10,
            backgroundColor: '#a3b6c9',
            marginTop: 10,
            flexDirection: 'row',
          }}>
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity
              style={{
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 12,
                },
                shadowOpacity: 0.58,
                shadowRadius: 16.0,
                elevation: 24,
                width: SCREEN_WIDTH / 6,
              }}
              onPress={() => this.setState({selectedIndex: 0})}>
              <MaterialIcons
                name={'storefront'}
                size={this.state.selectedIndex == 0 ? 30 : 30}
                color={this.state.selectedIndex == 0 ? 'white' : '#525252'}
                style={{
                  alignSelf: 'center',
                  backgroundColor:
                    this.state.selectedIndex == 0 ? '#ee4e4e' : 'white',
                  borderRadius: 15,
                  padding: 5,
                }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 12,
                },
                shadowOpacity: 0.58,
                shadowRadius: 16.0,
                elevation: 24,
                width: SCREEN_WIDTH / 6,
              }}
              onPress={() => this.setState({selectedIndex: 1})}>
              <Ionicons
                name={'md-key-outline'}
                size={this.state.selectedIndex == 1 ? 30 : 30}
                color={this.state.selectedIndex == 1 ? 'white' : '#525252'}
                style={{
                  alignSelf: 'center',
                  backgroundColor:
                    this.state.selectedIndex == 1 ? '#1c9fef' : 'white',
                  borderRadius: 15,
                  padding: 5,
                }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 12,
                },
                shadowOpacity: 0.58,
                shadowRadius: 16.0,
                elevation: 24,
                width: SCREEN_WIDTH / 6,
              }}
              onPress={() => this.setState({selectedIndex: 2})}>
              <MaterialCommunityIcons
                name={'car-multiple'}
                size={this.state.selectedIndex == 2 ? 30 : 30}
                color={this.state.selectedIndex == 2 ? 'white' : '#525252'}
                style={{
                  alignSelf: 'center',
                  backgroundColor:
                    this.state.selectedIndex == 2 ? '#28ae07' : 'white',
                  borderRadius: 15,
                  padding: 5,
                }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{width: SCREEN_WIDTH / 6}}
              onPress={() => this.setState({selectedIndex: 3})}>
              <MaterialCommunityIcons
                name={'account-hard-hat'}
                size={this.state.selectedIndex == 3 ? 30 : 30}
                color={this.state.selectedIndex == 3 ? 'white' : '#525252'}
                style={{
                  alignSelf: 'center',
                  backgroundColor:
                    this.state.selectedIndex == 3 ? '#f6a60d' : 'white',
                  borderRadius: 15,
                  padding: 5,
                }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 12,
                },
                shadowOpacity: 0.58,
                shadowRadius: 16.0,
                elevation: 24,
                width: SCREEN_WIDTH / 6,
              }}
              onPress={() => this.onPressSearchMenu()}>
              <MaterialCommunityIcons
                name={'menu'}
                size={this.state.selectedIndex == 4 ? 35 : 30}
                color={this.state.selectedIndex == 4 ? '#396ba0' : '#525252'}
                style={{
                  alignSelf: 'center',
                  backgroundColor: 'white',
                  borderRadius: 15,
                  padding: 5,
                }}
              />
            </TouchableOpacity>
            {this.state.selectedIndex == 0 ? (
              <TouchableOpacity
                style={{width: SCREEN_WIDTH / 6}}
                onPress={() => {
                  this.state.selectedcategories == 0
                    ? this.props.navigation.navigate('SearchAllOff', {
                        storeList: this.state.dataSource
                          .sort(function (a, b) {
                            // Sort by votes
                            // If the first item has a higher number, move it down
                            // If the first item has a lower number, move it up
                            if (Number(a.arrange) > Number(b.arrange))
                              return -1;
                            if (Number(b.arrange) < Number(a.arrange)) return 1;

                            // If the votes number is the same between both items, sort alphabetically
                            // If the first item comes first in the alphabet, move it up
                            // Otherwise move it down
                            if (a.distance > b.distance) return 1;
                            if (a.distance < b.distance) return -1;
                          })
                          .filter(items => {
                            const itemData = items.section;
                            const textData =
                              this.state.categoriesStores[
                                this.state.selectedcategories
                              ].title;

                            return itemData.indexOf(textData) > -1;
                          }),
                        cLat: this.state.x.latitude,
                        cLong: this.state.x.longitude,
                        selectedCityUser: this.state.FinalCity,
                        typeOfRate: this.state.typeOfRate,
                        currency:
                          this.state.CountryNow.length == 0
                            ? ''
                            : this.state.CountryNow[0].currency,
                        fromPlace: this.state.fromPlace,
                      })
                    : this.state.selectedcategories == 1
                    ? this.props.navigation.navigate('SearchAllProducedOff', {
                        storeList: this.state.dataSource
                          .sort(function (a, b) {
                            // Sort by votes
                            // If the first item has a higher number, move it down
                            // If the first item has a lower number, move it up
                            if (Number(a.arrange) > Number(b.arrange))
                              return -1;
                            if (Number(b.arrange) < Number(a.arrange)) return 1;

                            // If the votes number is the same between both items, sort alphabetically
                            // If the first item comes first in the alphabet, move it up
                            // Otherwise move it down
                            if (a.distance > b.distance) return 1;
                            if (a.distance < b.distance) return -1;
                          })
                          .filter(items => {
                            const itemData = items.section;
                            const textData =
                              this.state.categoriesStores[
                                this.state.selectedcategories
                              ].title;

                            return itemData.indexOf(textData) > -1;
                          }),
                        cLat: this.state.x.latitude,
                        cLong: this.state.x.longitude,
                        selectedCityUser:
                          this.state.selectedCityUser == null
                            ? this.state.City
                            : this.state.selectedCityUser,
                        typeOfRate: this.state.typeOfRate,
                        currency:
                          this.state.CountryNow.length == 0
                            ? ''
                            : this.state.CountryNow[0].currency,
                        fromPlace: this.state.fromPlace,
                      })
                    : this.props.navigation.navigate('SearchAllMerchOff', {
                        storeList: this.state.dataSource
                          .sort(function (a, b) {
                            // Sort by votes
                            // If the first item has a higher number, move it down
                            // If the first item has a lower number, move it up
                            if (Number(a.arrange) > Number(b.arrange))
                              return -1;
                            if (Number(b.arrange) < Number(a.arrange)) return 1;

                            // If the votes number is the same between both items, sort alphabetically
                            // If the first item comes first in the alphabet, move it up
                            // Otherwise move it down
                            if (a.distance > b.distance) return 1;
                            if (a.distance < b.distance) return -1;
                          })
                          .filter(items => {
                            const itemData = items.section;
                            const textData =
                              this.state.categoriesStores[
                                this.state.selectedcategories
                              ].title;

                            return itemData.indexOf(textData) > -1;
                          }),
                        cLat: this.state.x.latitude,
                        cLong: this.state.x.longitude,
                        selectedCityUser:
                          this.state.selectedCityUser == null
                            ? this.state.City
                            : this.state.selectedCityUser,
                        typeOfRate: this.state.typeOfRate,
                        currency:
                          this.state.CountryNow.length == 0
                            ? ''
                            : this.state.CountryNow[0].currency,
                        fromPlace: this.state.fromPlace,
                      });
                }}
                underlayColor="transparent">
                <Fontisto
                  name="search"
                  size={20}
                  color={'#525252'}
                  style={{
                    alignSelf: 'flex-start',
                    backgroundColor: 'white',
                    borderRadius: 15,
                    padding: 9,
                  }}
                />
              </TouchableOpacity>
            ) : this.state.selectedIndex == 1 ? (
              <TouchableOpacity
                style={{width: SCREEN_WIDTH / 6}}
                onPress={() => {
                  this.state.selectedIndexRentals == 0
                    ? this.props.navigation.navigate('SearchRentalsHotelOff', {
                        HotelList: this.state.HotelList.sort(
                          (a, b) => Number(b.arrange) - Number(a.arrange),
                        ).sort((a, b) => a.distance - b.distance),
                        cLat: this.state.x.latitude,
                        cLong: this.state.x.longitude,
                        selectedCityUser: this.state.FinalCity,
                        typeOfRate: this.state.typeOfRate,
                        currency:
                          this.state.CountryNow.length == 0
                            ? ''
                            : this.state.CountryNow[0].currency,
                        fromPlace: this.state.fromPlace,
                      })
                    : this.state.selectedIndex == 3
                    ? this.props.navigation.navigate('SearchServicesOff', {
                        selectedCityUser: this.state.FinalCity,
                        typeOfRate: this.state.typeOfRate,
                        currency:
                          this.state.CountryNow.length == 0
                            ? ''
                            : this.state.CountryNow[0].currency,
                        fromPlace: this.state.fromPlace,
                      })
                    : this.state.selectedIndexRentals == 1
                    ? this.props.navigation.navigate(
                        'SearchRentalsPropertyOff',
                        {
                          storesList: this.state.storesList,
                          cLat: this.state.x.latitude,
                          cLong: this.state.x.longitude,
                          selectedCityUser: this.state.FinalCity,
                          typeOfRate: this.state.typeOfRate,
                          currency:
                            this.state.CountryNow.length == 0
                              ? ''
                              : this.state.CountryNow[0].currency,
                          fromPlace: this.state.fromPlace,
                        },
                      )
                    : this.props.navigation.navigate('SearchRentalsEqOff', {
                        selectedCityUser: this.state.FinalCity,
                        typeOfRate: this.state.typeOfRate,
                        currency:
                          this.state.CountryNow.length == 0
                            ? ''
                            : this.state.CountryNow[0].currency,
                        fromPlace: this.state.fromPlace,
                      });
                }}
                underlayColor="transparent">
                <Fontisto
                  name="search"
                  size={20}
                  color={'#525252'}
                  style={{
                    alignSelf: 'flex-start',
                    backgroundColor: 'white',
                    borderRadius: 15,
                    padding: 9,
                  }}
                />
              </TouchableOpacity>
            ) : this.state.selectedIndex == 2 ? (
              <TouchableOpacity
                style={{width: SCREEN_WIDTH / 6}}
                onPress={() => {
                  this.state.transportSelected == 0
                    ? this.props.navigation.navigate('SearchRentalsCarOff', {
                        country: this.state.UserLocationCountry.trim(),
                        cLat: this.state.x.latitude,
                        cLong: this.state.x.longitude,
                        typeOfRate: this.state.typeOfRate,
                        selectedCityUser: this.state.selectedCityUser,
                        fromPlace: this.state.fromPlace,
                        currency: this.state.CountryNow[0].currency,
                        code: this.state.CountryNow[0].code,
                        cityLat: this.state.x.latitude,
                        cityLong: this.state.x.longitude,
                      })
                    : this.props.navigation.navigate('SearchTaxiOff', {
                        selectedCityUser: this.state.FinalCity,
                        typeOfRate: this.state.typeOfRate,
                        currency:
                          this.state.CountryNow.length == 0
                            ? ''
                            : this.state.CountryNow[0].currency,
                        fromPlace: this.state.fromPlace,
                      });
                }}
                underlayColor="transparent">
                <Fontisto
                  name="search"
                  size={20}
                  color={'#525252'}
                  style={{
                    alignSelf: 'flex-start',
                    backgroundColor: 'white',
                    borderRadius: 15,
                    padding: 9,
                  }}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={{width: SCREEN_WIDTH / 6}}
                onPress={() => {
                  this.state.selectedIndex == 1
                    ? this.props.navigation.navigate('SearchRentalsOff', {
                        selectedCityUser: this.state.FinalCity,
                        typeOfRate: this.state.typeOfRate,
                        currency:
                          this.state.CountryNow.length == 0
                            ? ''
                            : this.state.CountryNow[0].currency,
                        fromPlace: this.state.fromPlace,
                      })
                    : this.state.selectedIndex == 3
                    ? this.props.navigation.navigate('SearchServicesOff', {
                        selectedCityUser: this.state.FinalCity,
                        typeOfRate: this.state.typeOfRate,
                        currency:
                          this.state.CountryNow.length == 0
                            ? ''
                            : this.state.CountryNow[0].currency,
                        fromPlace: this.state.fromPlace,
                      })
                    : this.props.navigation.navigate('SearchAllOff', {
                        storeList: this.state.dataSource
                          .sort(function (a, b) {
                            // Sort by votes
                            // If the first item has a higher number, move it down
                            // If the first item has a lower number, move it up
                            if (Number(a.arrange) > Number(b.arrange))
                              return -1;
                            if (Number(b.arrange) < Number(a.arrange)) return 1;

                            // If the votes number is the same between both items, sort alphabetically
                            // If the first item comes first in the alphabet, move it up
                            // Otherwise move it down
                            if (a.distance > b.distance) return 1;
                            if (a.distance < b.distance) return -1;
                          })
                          .filter(items => {
                            const itemData = items.section;
                            const textData =
                              this.state.categoriesStores[
                                this.state.selectedcategories
                              ].title;

                            return itemData.indexOf(textData) > -1;
                          }),
                        cLat: this.state.x.latitude,
                        cLong: this.state.x.longitude,
                        selectedCityUser: this.state.FinalCity,
                        typeOfRate: this.state.typeOfRate,
                        currency:
                          this.state.CountryNow.length == 0
                            ? ''
                            : this.state.CountryNow[0].currency,
                        fromPlace: this.state.fromPlace,
                      });
                }}
                underlayColor="transparent">
                <Fontisto
                  name="search"
                  size={20}
                  color={'#525252'}
                  style={{
                    alignSelf: 'flex-start',
                    backgroundColor: 'white',
                    borderRadius: 15,
                    padding: 9,
                  }}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {this.state.selectedIndex == 0 ? (
          <View style={{flexDirection: 'row', marginLeft: 30}}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                marginLeft: 2,
                marginBottom: 2,
              }}>
              Delivery
            </Text>
          </View>
        ) : this.state.selectedIndex == 1 ? (
          <View style={{flexDirection: 'row', marginLeft: 30, marginBottom: 2}}>
            <Text style={{fontSize: 18, fontWeight: 'bold', marginLeft: 2}}>
              Rentals
            </Text>
          </View>
        ) : this.state.selectedIndex == 2 ? (
          <View style={{flexDirection: 'row', marginLeft: 30}}>
            <Text style={{fontSize: 18, fontWeight: 'bold', marginLeft: 2}}>
              Transportation
            </Text>
          </View>
        ) : (
          <View style={{flexDirection: 'row', marginLeft: 30}}>
            <Text style={{fontSize: 18, fontWeight: 'bold', marginLeft: 2}}>
              Services
            </Text>
          </View>
        )}

        {this.state.selectedIndex == 1 ? (
          <View style={{flexDirection: 'row', marginLeft: 15}}>
            <TouchableOpacity
              style={{
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 12,
                },
                shadowOpacity: 0.58,
                shadowRadius: 16.0,
                elevation: 24,
                width: (SCREEN_WIDTH - 50) / 3,
                backgroundColor:
                  this.state.selectedIndexRentals == 0 ? '#1c9fef' : 'white',
                borderRadius: 15,
                padding: 5,
                flexDirection: 'row',
              }}
              onPress={() => this.setState({selectedIndexRentals: 0})}>
              <FontAwesome5
                name={'hotel'}
                size={15}
                color={
                  this.state.selectedIndexRentals == 0 ? 'white' : '#5580ad'
                }
              />
              <Text
                style={{
                  color:
                    this.state.selectedIndexRentals == 0 ? 'white' : 'black',
                  fontSize: 13,
                  fontWeight: 'bold',
                }}>
                {' '}
                Hotels etc.
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 12,
                },
                shadowOpacity: 0.58,
                shadowRadius: 16.0,
                elevation: 24,
                width: (SCREEN_WIDTH - 50) / 3,
                backgroundColor:
                  this.state.selectedIndexRentals == 1 ? '#1c9fef' : 'white',
                borderRadius: 15,
                padding: 5,
                flexDirection: 'row',
                marginLeft: 10,
                marginRight: 10,
              }}
              onPress={() => this.setState({selectedIndexRentals: 1})}>
              <MaterialIcons
                name={'house'}
                size={15}
                color={
                  this.state.selectedIndexRentals == 1 ? 'white' : '#5580ad'
                }
              />
              <Text
                style={{
                  color:
                    this.state.selectedIndexRentals == 1 ? 'white' : 'black',
                  fontSize: 13,
                  fontWeight: 'bold',
                }}>
                {' '}
                Property
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 12,
                },
                shadowOpacity: 0.58,
                shadowRadius: 16.0,
                elevation: 24,
                width: (SCREEN_WIDTH - 50) / 3,
                backgroundColor:
                  this.state.selectedIndexRentals == 3 ? '#1c9fef' : 'white',
                borderRadius: 15,
                padding: 5,
                flexDirection: 'row',
              }}
              onPress={() => this.setState({selectedIndexRentals: 3})}>
              <FontAwesome5
                name={'tools'}
                size={15}
                color={
                  this.state.selectedIndexRentals == 3 ? 'white' : '#5580ad'
                }
              />
              <Text
                style={{
                  color:
                    this.state.selectedIndexRentals == 3 ? 'white' : 'black',
                  fontSize: 13,
                  fontWeight: 'bold',
                }}>
                {' '}
                Equipment
              </Text>
            </TouchableOpacity>
          </View>
        ) : this.state.selectedIndex == 2 ? (
          <View style={{flexDirection: 'row', marginLeft: 15, marginBottom: 5}}>
            <TouchableOpacity
              style={{
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 12,
                },
                shadowOpacity: 0.58,
                shadowRadius: 16.0,
                elevation: 24,
                width: (SCREEN_WIDTH - 50) / 3.9,
                backgroundColor:
                  this.state.transportSelected == 0 ? '#28ae07' : 'white',
                borderRadius: 15,
                padding: 5,
                flexDirection: 'row',
              }}
              onPress={() => this.setState({transportSelected: 0})}>
              <MaterialIcons
                name={'local-taxi'}
                size={15}
                color={this.state.transportSelected == 0 ? 'white' : '#28ae07'}
              />
              <Text
                style={{
                  color: this.state.transportSelected == 0 ? 'white' : 'black',
                  fontWeight: 'bold',
                }}>
                Car Rent
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 12,
                },
                shadowOpacity: 0.58,
                shadowRadius: 16.0,
                elevation: 24,
                width: (SCREEN_WIDTH - 50) / 3.7,
                backgroundColor:
                  this.state.transportSelected == 1 ? '#28ae07' : 'white',
                borderRadius: 15,
                padding: 5,
                flexDirection: 'row',
                marginLeft: 5,
                marginRight: 5,
              }}
              onPress={() => this.setState({transportSelected: 1})}>
              <MaterialIcons
                name={'car-rental'}
                size={15}
                color={this.state.transportSelected == 1 ? 'white' : '#28ae07'}
              />
              <Text
                style={{
                  color: this.state.transportSelected == 1 ? 'white' : 'black',
                  fontWeight: 'bold',
                }}>
                Commute
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 12,
                },
                shadowOpacity: 0.58,
                shadowRadius: 16.0,
                elevation: 24,
                width: (SCREEN_WIDTH - 50) / 4.7,
                backgroundColor:
                  this.state.transportSelected == 2 ? '#28ae07' : 'white',
                borderRadius: 15,
                padding: 5,
                flexDirection: 'row',
                marginRight: 5,
              }}
              onPress={() => this.setState({transportSelected: 2})}>
              <FontAwesome5
                name={'truck-loading'}
                size={15}
                color={this.state.transportSelected == 2 ? 'white' : '#28ae07'}
              />
              <Text
                style={{
                  color: this.state.transportSelected == 2 ? 'white' : 'black',
                  fontWeight: 'bold',
                }}>
                {' '}
                Mover
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 12,
                },
                shadowOpacity: 0.58,
                shadowRadius: 16.0,
                elevation: 24,
                width: (SCREEN_WIDTH - 50) / 3.5,
                backgroundColor:
                  this.state.transportSelected == 3 ? '#28ae07' : 'white',
                borderRadius: 15,
                padding: 5,
                flexDirection: 'row',
              }}
              onPress={() => {
                this.state.userId == null
                  ? this.props.navigation.navigate('Login')
                  : this.state.x.latitude == null
                  ? Alert.alert('Enable Location')
                  : this.props.navigation.navigate(
                      'CheckoutTransportBackload',
                      {
                        datas: null,
                        cLat: this.state.x.latitude,
                        cLong: this.state.x.longitude,
                        typeOfRate: this.state.typeOfRate,
                        selectedCityUser: this.state.selectedCityUser,
                        fromPlace: this.state.fromPlace,
                        UserLocationCountry: this.state.UserLocationCountry,
                        currency: this.state.CountryNow[0].currency,
                        code: this.state.CountryNow[0].code,
                        cityLat: this.state.customerInfo.cityLat,
                        cityLong: this.state.customerInfo.cityLong,
                      },
                    );
              }}>
              <FontAwesome5
                name={'truck-loading'}
                size={15}
                color={this.state.transportSelected == 3 ? 'white' : '#28ae07'}
              />
              <Text
                style={{
                  color: this.state.transportSelected == 3 ? 'white' : 'black',
                  fontWeight: 'bold',
                }}>
                {' '}
                Backload
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
        <Loader loading={this.state.loading} trans={trans} />

        {this.state.selectedIndex == 0 ? (
          <View >
            <View style={{flexDirection: 'row', marginLeft: 15}}>
              <TouchableOpacity
                style={{
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 12,
                  },
                  shadowOpacity: 0.58,
                  shadowRadius: 16.0,
                  elevation: 24,
                  width: (SCREEN_WIDTH - 50) / 3,
                  backgroundColor:
                    this.state.selectedcategories == 0 ? '#ee4e4e' : 'white',
                  borderRadius: 15,
                  padding: 5,
                  flexDirection: 'row',
                }}
                onPress={() => this.setState({selectedcategories: 0})}>
                <FontAwesome5
                  name={'hamburger'}
                  size={15}
                  color={
                    this.state.selectedcategories == 0 ? 'white' : '#f06767'
                  }
                />
                <Text
                  style={{
                    color:
                      this.state.selectedcategories == 0 ? 'white' : 'black',
                    fontWeight: 'bold',
                  }}>
                  {' '}
                  Fastfood
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 12,
                  },
                  shadowOpacity: 0.58,
                  shadowRadius: 16.0,
                  elevation: 24,
                  width: (SCREEN_WIDTH - 50) / 3,
                  backgroundColor:
                    this.state.selectedcategories == 1 ? '#ee4e4e' : 'white',
                  borderRadius: 15,
                  padding: 5,
                  flexDirection: 'row',
                  marginLeft: 10,
                  marginRight: 10,
                }}
                onPress={() => this.setState({selectedcategories: 1})}>
                <MaterialCommunityIcons
                  name={'fruit-watermelon'}
                  size={15}
                  color={
                    this.state.selectedcategories == 1 ? 'white' : '#f06767'
                  }
                />
                <Text
                  style={{
                    color:
                      this.state.selectedcategories == 1 ? 'white' : 'black',
                    fontWeight: 'bold',
                  }}>
                  {' '}
                  Produce etc.
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 12,
                  },
                  shadowOpacity: 0.58,
                  shadowRadius: 16.0,
                  elevation: 24,
                  width: (SCREEN_WIDTH - 50) / 3,
                  backgroundColor:
                    this.state.selectedcategories == 2 ? '#ee4e4e' : 'white',
                  borderRadius: 15,
                  padding: 5,
                  flexDirection: 'row',
                }}
                onPress={() => this.setState({selectedcategories: 2})}>
                <Fontisto
                  name={'shopping-bag-1'}
                  size={17}
                  color={
                    this.state.selectedcategories == 2 ? 'white' : '#f06767'
                  }
                />
                <Text
                  style={{
                    color:
                      this.state.selectedcategories == 2 ? 'white' : 'black',
                    fontWeight: 'bold',
                    marginLeft: 20,
                  }}>
                  {' '}
                  Mall
                </Text>
              </TouchableOpacity>
            </View>

            {this.state.selectedcategories != 2 ? null : (
              <View style={{flexDirection: 'row', marginLeft: 15}}>
                <FlatList
                  key={'5'}
                  data={
                    this.state.categoriesStores[this.state.selectedcategories]
                      .SubCat
                  }
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{marginTop: 10}}
                  renderItem={({item}) => (
                    <TouchableOpacity
                      key={item.title}
                      style={{
                        shadowColor: '#000',
                        shadowOffset: {
                          width: 0,
                          height: 12,
                        },
                        shadowOpacity: 0.58,
                        shadowRadius: 16.0,
                        elevation: 24,
                        marginRight: 10,
                        backgroundColor:
                          this.state.SubCat == item.title ? '#ee4e4e' : 'white',
                        borderRadius: 15,
                        padding: 5,
                        flexDirection: 'row',
                      }}
                      onPress={() => this.setState({SubCat: item.title})}>
                      {item.IconFile == 'MaterialCommunityIcons' ? (
                        <MaterialCommunityIcons
                          name={item.IconName}
                          size={15}
                          color={
                            this.state.SubCat == item.title
                              ? 'white'
                              : '#f06767'
                          }
                        />
                      ) : (
                        <MaterialIcons
                          name={item.IconName}
                          size={15}
                          color={
                            this.state.SubCat == item.title
                              ? 'white'
                              : '#f06767'
                          }
                        />
                      )}

                      <Text
                        style={{
                          color:
                            this.state.SubCat == item.title ? 'white' : 'black',
                          fontWeight: 'bold',
                        }}>
                        {' '}
                        {item.title}
                      </Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item, index) => index.toString()}
                  refreshing={this.state.loading}
                  onRefresh={this.getData}
                />
              </View>
            )}

            {this.state.selectedcategories != 2 ? (
              <FlatList
                key={'6'}
                style={{height: SCREEN_HEIGHT/1.8, marginBottom: 350}}
                data={this.state.dataSource
                  .sort(function (a, b) {
                    // Sort by votes
                    // If the first item has a higher number, move it down
                    // If the first item has a lower number, move it up
                    if (Number(a.arrange) > Number(b.arrange)) return -1;
                    if (Number(b.arrange) < Number(a.arrange)) return 1;

                    // If the votes number is the same between both items, sort alphabetically
                    // If the first item comes first in the alphabet, move it up
                    // Otherwise move it down
                    if (a.distance > b.distance) return 1;
                    if (a.distance < b.distance) return -1;
                  })
                  .filter(items => {
                    const itemData = items.section;
                    const textData =
                      this.state.categoriesStores[this.state.selectedcategories]
                        .title;

                    return itemData.indexOf(textData) > -1;
                  })}
                renderItem={({item}) => (
                  <Box
                    transparent
                    style={{
                      borderRadius: 10,
                      marginTop: 10,
                      width: SCREEN_WIDTH - 30,
                      alignSelf: 'center',
                      marginLeft:-20
                    }}
                    key={item.id}>
                    <StoreCard
                      product={item}
                      navigation={this.props.navigation}
                      typeOfRate={this.state.typeOfRate}
                      fromPlace={this.state.fromPlace}
                      currency={
                        this.state.CountryNow.length == 0
                          ? ''
                          : this.state.CountryNow[0].currency
                      }
                    />
                  </Box>
                )}
                keyExtractor={(item, index) => index.toString()}
                refreshing={this.state.loading}
                onRefresh={this.getData}
              />
            ) : (
              <FlatList
                key={'7'}
                style={{height: SCREEN_HEIGHT/1.8}}
                data={this.state.dataSource
                  .sort(function (a, b) {
                    // Sort by votes
                    // If the first item has a higher number, move it down
                    // If the first item has a lower number, move it up
                    if (Number(a.arrange) > Number(b.arrange)) return -1;
                    if (Number(b.arrange) < Number(a.arrange)) return 1;

                    // If the votes number is the same between both items, sort alphabetically
                    // If the first item comes first in the alphabet, move it up
                    // Otherwise move it down
                    if (a.distance > b.distance) return 1;
                    if (a.distance < b.distance) return -1;
                  })
                  .filter(items => {
                    if (items.SubCat != undefined) {
                      const itemData = items.SubCat;
                      const textData = this.state.SubCat;

                      return itemData.indexOf(textData) > -1;
                    }
                  })}
                renderItem={({item}) => (
                  <Box
                    transparent
                    style={{
                      borderRadius: 10,
                      marginTop: 10,
                      width: SCREEN_WIDTH - 30,
                      alignSelf: 'center',
                      marginLeft:-20
                    }}
                    key={item.id}>
                    <StoreCard
                      product={item}
                      navigation={this.props.navigation}
                      typeOfRate={this.state.typeOfRate}
                      fromPlace={this.state.fromPlace}
                      currency={
                        this.state.CountryNow.length == 0
                          ? ''
                          : this.state.CountryNow[0].currency
                      }
                    />
                  </Box>
                )}
                keyExtractor={(item, index) => index.toString()}
                refreshing={this.state.loading}
                onRefresh={this.getData}
              />
            )}
            
          </View>
        ) : this.state.selectedIndex == 1 ? (
          <View>
            {this.state.selectedIndexRentals == 0 ? (
              <FlatList
                key={'2'}
                style={{height: SCREEN_HEIGHT / 1.7, marginBottom:350}}
                data={this.state.HotelList.sort(
                  (a, b) => Number(b.arrange) - Number(a.arrange),
                ).sort((a, b) => a.distance - b.distance)}
                renderItem={({item}) => (
                  <Box  style={{
                    marginTop: 10,
                    width: SCREEN_WIDTH - 30,
                    alignSelf: 'center',
                    marginLeft:0, 
                    backgroundColor:'white'
                  }}>
                    <Box>
                      <TouchableHighlight
                        underlayColor="rgba(73,182,77,1,0.9)"
                        onPress={() =>
                          item.status === true
                            ? this.props.navigation.navigate('PropertyHotel', {
                                store: item,
                                cLat: item.slatitude,
                                cLong: item.slongitude,
                                navigation: this.props.navigation,
                                typeOfRate: this.state.typeOfRate,
                                currency:
                                  this.state.CountryNow.length == 0
                                    ? ''
                                    : this.state.CountryNow[0].currency,
                              })
                            : console.log('false')
                        }>
                        <View>
                          <FastImage
                            style={styles.categoriesPhoto}
                            source={{
                              uri: item.background,
                              headers: {Authorization: 'someAuthToken'},
                              priority: FastImage.priority.normal,
                            }}
                            resizeMode={FastImage.resizeMode.cover}
                          />
                         
                          {item.status == true ? null : (
                            <View style={styles.subtitleclose}>
                              <Text
                                style={{
                                  color: '#FFFFFF',
                                  fontStyle: 'italic',
                                  fontWeight: 'bold',
                                }}>
                                Unavailable
                              </Text>
                            </View>
                          )}
                          <View style={{flexDirection: 'row'}}>
                            <View
                              style={{
                                flexDirection: 'column',
                                width: SCREEN_WIDTH / 1.5,
                                justifyContent: 'center',
                              }}>
                              <Text style={styles.categoriesName}>
                                {item.name}{' '}
                              </Text>
                              <Text note style={styles.categoriesAddress}>
                                {item.address}{' '}
                                {item.distance == null ? null : (
                                  <Text
                                    note
                                    style={{
                                      fontSize: 13,
                                      marginLeft: 5,
                                      bottom: 0,
                                      fontWeight: 'bold',
                                    }}>
                                    {Math.round(item.distance * 10) / 10 < 1000
                                      ? Math.round(item.distance * 10) / 10 +
                                        ' m'
                                      : Math.round(
                                          (item.distance / 1000) * 10,
                                        ) /
                                          10 +
                                        ' km'}
                                  </Text>
                                )}
                              </Text>
                            </View>
                            <View
                              style={{
                                flexDirection: 'column',
                                justifyContent: 'center',
                              }}>
                              <Text
                                style={{
                                  fontStyle: 'italic',
                                  fontWeight: 'bold',
                                  textAlign: 'center',
                                  borderRadius: 5,
                                  fontSize: 10,
                                  color: 'black',
                                }}>
                                {' '}
                                AS LOW AS
                              </Text>
                              <Text
                                style={{
                                  fontStyle: 'italic',
                                  fontWeight: 'bold',
                                  borderRadius: 5,
                                  textAlign: 'center',
                                  fontSize: 14,
                                  color: 'black',
                                }}>
                                {' '}
                                {this.state.CountryNow.length == 0
                                  ? ''
                                  : this.state.CountryNow[0].currency}
                                {parseFloat(
                                  item.PriceArray == undefined
                                    ? 0
                                    : item.PriceArray.length > 0
                                    ? item.PriceArray.sort(
                                        (a, b) => a.price - b.price,
                                      )[0].price
                                    : 0,
                                )
                                  .toFixed(2)
                                  .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                                {item.PriceArray == undefined
                                  ? ''
                                  : item.PriceArray.length > 0
                                  ? item.PriceArray.sort(
                                      (a, b) => a.mode - b.price,
                                    )[0].mode == undefined
                                    ? ''
                                    : '/' +
                                      item.PriceArray.sort(
                                        (a, b) => a.mode - b.price,
                                      )[0].mode
                                  : ''}
                              </Text>
                              <View style={{flexDirection: 'row'}}>
                                {item.star1 == undefined ? (
                                  <View style={{flexDirection: 'row'}}>
                                    <MaterialIcons
                                      name="star"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                  </View>
                                ) : item.star1 * 1 +
                                    item.star2 * 2 +
                                    item.star3 * 3 +
                                    item.star4 * 4 +
                                    (item.star5 * 5) /
                                      (item.star1 +
                                        item.star2 +
                                        item.star3 +
                                        item.star4 +
                                        item.star5) >
                                  4.5 ? ( //5
                                  <View style={{flexDirection: 'row'}}>
                                    <MaterialIcons
                                      name="star"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                  </View>
                                ) : item.star1 * 1 +
                                    item.star2 * 2 +
                                    item.star3 * 3 +
                                    item.star4 * 4 +
                                    (item.star5 * 5) /
                                      (item.star1 +
                                        item.star2 +
                                        item.star3 +
                                        item.star4 +
                                        item.star5) >
                                    4.4 &&
                                  item.star1 * 1 +
                                    item.star2 * 2 +
                                    item.star3 * 3 +
                                    item.star4 * 4 +
                                    (item.star5 * 5) /
                                      (item.star1 +
                                        item.star2 +
                                        item.star3 +
                                        item.star4 +
                                        item.star5) <
                                    5 ? ( //4.5
                                  <View style={{flexDirection: 'row'}}>
                                    <MaterialIcons
                                      name="star"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star-half"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                  </View>
                                ) : item.star1 * 1 +
                                    item.star2 * 2 +
                                    item.star3 * 3 +
                                    item.star4 * 4 +
                                    (item.star5 * 5) /
                                      (item.star1 +
                                        item.star2 +
                                        item.star3 +
                                        item.star4 +
                                        item.star5) >
                                    3.9 &&
                                  item.star1 * 1 +
                                    item.star2 * 2 +
                                    item.star3 * 3 +
                                    item.star4 * 4 +
                                    (item.star5 * 5) /
                                      (item.star1 +
                                        item.star2 +
                                        item.star3 +
                                        item.star4 +
                                        item.star5) <
                                    4.5 ? ( //4
                                  <View style={{flexDirection: 'row'}}>
                                    <MaterialIcons
                                      name="star"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star-outline"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                  </View>
                                ) : item.star1 * 1 +
                                    item.star2 * 2 +
                                    item.star3 * 3 +
                                    item.star4 * 4 +
                                    (item.star5 * 5) /
                                      (item.star1 +
                                        item.star2 +
                                        item.star3 +
                                        item.star4 +
                                        item.star5) >
                                    3.4 &&
                                  item.star1 * 1 +
                                    item.star2 * 2 +
                                    item.star3 * 3 +
                                    item.star4 * 4 +
                                    (item.star5 * 5) /
                                      (item.star1 +
                                        item.star2 +
                                        item.star3 +
                                        item.star4 +
                                        item.star5) <
                                    4 ? ( //3.5
                                  <View style={{flexDirection: 'row'}}>
                                    <MaterialIcons
                                      name="star"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star-half"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star-outline"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                  </View>
                                ) : item.star1 * 1 +
                                    item.star2 * 2 +
                                    item.star3 * 3 +
                                    item.star4 * 4 +
                                    (item.star5 * 5) /
                                      (item.star1 +
                                        item.star2 +
                                        item.star3 +
                                        item.star4 +
                                        item.star5) >
                                    2.9 &&
                                  item.star1 * 1 +
                                    item.star2 * 2 +
                                    item.star3 * 3 +
                                    item.star4 * 4 +
                                    (item.star5 * 5) /
                                      (item.star1 +
                                        item.star2 +
                                        item.star3 +
                                        item.star4 +
                                        item.star5) <
                                    3.5 ? ( //3
                                  <View style={{flexDirection: 'row'}}>
                                    <MaterialIcons
                                      name="star"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star-outline"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star-outline"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                  </View>
                                ) : item.star1 * 1 +
                                    item.star2 * 2 +
                                    item.star3 * 3 +
                                    item.star4 * 4 +
                                    (item.star5 * 5) /
                                      (item.star1 +
                                        item.star2 +
                                        item.star3 +
                                        item.star4 +
                                        item.star5) >
                                    2.4 &&
                                  item.star1 * 1 +
                                    item.star2 * 2 +
                                    item.star3 * 3 +
                                    item.star4 * 4 +
                                    (item.star5 * 5) /
                                      (item.star1 +
                                        item.star2 +
                                        item.star3 +
                                        item.star4 +
                                        item.star5) <
                                    3 ? ( //2.5
                                  <View style={{flexDirection: 'row'}}>
                                    <MaterialIcons
                                      name="star"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star-half"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star-outline"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star-outline"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                  </View>
                                ) : item.star1 * 1 +
                                    item.star2 * 2 +
                                    item.star3 * 3 +
                                    item.star4 * 4 +
                                    (item.star5 * 5) /
                                      (item.star1 +
                                        item.star2 +
                                        item.star3 +
                                        item.star4 +
                                        item.star5) >
                                    1.9 &&
                                  item.star1 * 1 +
                                    item.star2 * 2 +
                                    item.star3 * 3 +
                                    item.star4 * 4 +
                                    (item.star5 * 5) /
                                      (item.star1 +
                                        item.star2 +
                                        item.star3 +
                                        item.star4 +
                                        item.star5) <
                                    2.5 ? ( //2
                                  <View style={{flexDirection: 'row'}}>
                                    <MaterialIcons
                                      name="star"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star-outline"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star-outline"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star-outline"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                  </View>
                                ) : item.star1 * 1 +
                                    item.star2 * 2 +
                                    item.star3 * 3 +
                                    item.star4 * 4 +
                                    (item.star5 * 5) /
                                      (item.star1 +
                                        item.star2 +
                                        item.star3 +
                                        item.star4 +
                                        item.star5) >
                                    1.4 &&
                                  item.star1 * 1 +
                                    item.star2 * 2 +
                                    item.star3 * 3 +
                                    item.star4 * 4 +
                                    (item.star5 * 5) /
                                      (item.star1 +
                                        item.star2 +
                                        item.star3 +
                                        item.star4 +
                                        item.star5) <
                                    2 ? ( //1.5
                                  <View style={{flexDirection: 'row'}}>
                                    <MaterialIcons
                                      name="star"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star-half"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star-outline"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star-outline"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star-outline"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                  </View>
                                ) : item.star1 * 1 +
                                    item.star2 * 2 +
                                    item.star3 * 3 +
                                    item.star4 * 4 +
                                    (item.star5 * 5) /
                                      (item.star1 +
                                        item.star2 +
                                        item.star3 +
                                        item.star4 +
                                        item.star5) >
                                    0.9 &&
                                  item.star1 * 1 +
                                    item.star2 * 2 +
                                    item.star3 * 3 +
                                    item.star4 * 4 +
                                    (item.star5 * 5) /
                                      (item.star1 +
                                        item.star2 +
                                        item.star3 +
                                        item.star4 +
                                        item.star5) <
                                    1.5 ? ( //1
                                  <View style={{flexDirection: 'row'}}>
                                    <MaterialIcons
                                      name="star"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star-outline"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star-outline"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star-outline"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star-outline"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                  </View>
                                ) : (
                                  <View style={{flexDirection: 'row'}}>
                                    <MaterialIcons
                                      name="star-outline"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star-outline"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star-outline"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star-outline"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                    <MaterialIcons
                                      name="star-outline"
                                      size={15}
                                      color={'#f2b524'}
                                    />
                                  </View>
                                )}
                              </View>
                            </View>
                          </View>
                          {/*  <Text note style={styles.categoriesAddress}>Room Rates: {parseFloat(item.PriceArray == undefined? 0:item.PriceArray.length >0?item.PriceArray.sort((a,b)=> a.price -b.price)[0].price:0 ).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')} - {parseFloat(item.PriceArray == undefined? 0:item.PriceArray.length >0?item.PriceArray.sort((a,b)=> b.price - a.price)[0].price:0).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</Text>
                           */}
                        </View>
                      </TouchableHighlight>
                    </Box>
                  </Box>
                )}
                keyExtractor={(item, index) => index.toString()}
              />
            ) : this.state.selectedIndexRentals == 1 ? (
              <FlatList
                key={'3'}
                style={{height: SCREEN_HEIGHT / 1.7, marginBottom:350}}
                data={this.state.storesList}
                renderItem={({item}) => (
                  <Box style={{
                    marginTop: 10,
                    width: SCREEN_WIDTH - 30,
                    alignSelf: 'center',
                    marginLeft:0, 
                    backgroundColor:'white'
                  }}>
                    <Box >
                      <TouchableHighlight
                        underlayColor="rgba(73,182,77,1,0.9)"
                        onPress={() =>
                          item.status === true
                            ? this.props.navigation.navigate('PropertyRent', {
                                store: item,
                                cLat: item.slatitude,
                                cLong: item.slongitude,
                                navigation: this.props.navigation,
                                typeOfRate: this.state.typeOfRate,
                                currency:
                                  this.state.CountryNow.length == 0
                                    ? ''
                                    : this.state.CountryNow[0].currency,
                              })
                            : console.log('false')
                        }>
                        <View>
                          <FastImage
                            style={styles.categoriesPhoto}
                            source={{
                              uri: item.background,
                              headers: {Authorization: 'someAuthToken'},
                              priority: FastImage.priority.normal,
                            }}
                            resizeMode={FastImage.resizeMode.cover}
                          />

                      
                          {item.status == true ? null : (
                            <View style={styles.subtitleclose}>
                              <Text
                                style={{
                                  color: '#FFFFFF',
                                  fontStyle: 'italic',
                                  fontWeight: 'bold',
                                }}>
                                Unavailable
                              </Text>
                            </View>
                          )}

                          <View style={{flexDirection: 'row'}}>
                            <View
                              style={{
                                flexDirection: 'column',
                                width: SCREEN_WIDTH / 1.6,
                                justifyContent: 'center',
                              }}>
                              <Text style={styles.categoriesName}>
                                {item.name}{' '}
                              </Text>
                              <Text note style={styles.categoriesAddress}>
                                Good for{' '}
                                {parseFloat(
                                  item.PropertyPriceArray == undefined
                                    ? 0
                                    : item.PropertyPriceArray.length > 0
                                    ? item.PropertyPriceArray.sort(
                                        (a, b) => a.maxGuest - b.maxGuest,
                                      )[0].maxGuest
                                    : 0,
                                )}
                                -{' '}
                                {parseFloat(
                                  item.PropertyPriceArray == undefined
                                    ? 0
                                    : item.PropertyPriceArray.length > 0
                                    ? item.PropertyPriceArray.sort(
                                        (a, b) => b.maxGuest - a.maxGuest,
                                      )[0].maxGuest
                                    : 0,
                                )}{' '}
                                Persons
                              </Text>
                            </View>
                            <View
                              style={{
                                flexDirection: 'column',
                                justifyContent: 'center',
                              }}>
                              <Text
                                style={{
                                  fontStyle: 'italic',
                                  fontWeight: 'bold',
                                  textAlign: 'center',
                                  borderRadius: 5,
                                  fontSize: 10,
                                  color: 'black',
                                }}>
                                {' '}
                                AS LOW AS
                              </Text>
                              <Text
                                style={{
                                  fontStyle: 'italic',
                                  fontWeight: 'bold',
                                  borderRadius: 5,
                                  textAlign: 'center',
                                  fontSize: 14,
                                  color: 'black',
                                }}>
                                {' '}
                                {this.state.CountryNow.length == 0
                                  ? ''
                                  : this.state.CountryNow[0].currency}
                                {parseFloat(
                                  item.PropertyPriceArray == undefined
                                    ? 0
                                    : item.PropertyPriceArray.length > 0
                                    ? item.PropertyPriceArray.sort(
                                        (a, b) => a.price - b.price,
                                      )[0].price
                                    : 0,
                                )
                                  .toFixed(2)
                                  .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                                {item.PropertyPriceArray == undefined
                                  ? ''
                                  : item.PropertyPriceArray.length > 0
                                  ? item.PropertyPriceArray.sort(
                                      (a, b) => a.mode - b.price,
                                    )[0].mode == undefined
                                    ? ''
                                    : '/' +
                                      item.PropertyPriceArray.sort(
                                        (a, b) => a.mode - b.price,
                                      )[0].mode
                                  : ''}
                              </Text>
                              {item.star1 == undefined ? (
                                <View style={{flexDirection: 'row'}}>
                                  <MaterialIcons
                                    name="star"
                                    size={20}
                                    color={'#f2b524'}
                                  />
                                  <MaterialIcons
                                    name="star"
                                    size={20}
                                    color={'#f2b524'}
                                  />
                                  <MaterialIcons
                                    name="star"
                                    size={20}
                                    color={'#f2b524'}
                                  />
                                  <MaterialIcons
                                    name="star"
                                    size={20}
                                    color={'#f2b524'}
                                  />
                                  <MaterialIcons
                                    name="star"
                                    size={20}
                                    color={'#f2b524'}
                                  />
                                </View>
                              ) : item.star1 * 1 +
                                  item.star2 * 2 +
                                  item.star3 * 3 +
                                  item.star4 * 4 +
                                  (item.star5 * 5) /
                                    (item.star1 +
                                      item.star2 +
                                      item.star3 +
                                      item.star4 +
                                      item.star5) >
                                4.5 ? ( //5
                                <View style={{flexDirection: 'row'}}>
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
                              ) : item.star1 * 1 +
                                  item.star2 * 2 +
                                  item.star3 * 3 +
                                  item.star4 * 4 +
                                  (item.star5 * 5) /
                                    (item.star1 +
                                      item.star2 +
                                      item.star3 +
                                      item.star4 +
                                      item.star5) >
                                  4.4 &&
                                item.star1 * 1 +
                                  item.star2 * 2 +
                                  item.star3 * 3 +
                                  item.star4 * 4 +
                                  (item.star5 * 5) /
                                    (item.star1 +
                                      item.star2 +
                                      item.star3 +
                                      item.star4 +
                                      item.star5) <
                                  5 ? ( //4.5
                                <View style={{flexDirection: 'row'}}>
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
                              ) : item.star1 * 1 +
                                  item.star2 * 2 +
                                  item.star3 * 3 +
                                  item.star4 * 4 +
                                  (item.star5 * 5) /
                                    (item.star1 +
                                      item.star2 +
                                      item.star3 +
                                      item.star4 +
                                      item.star5) >
                                  3.9 &&
                                item.star1 * 1 +
                                  item.star2 * 2 +
                                  item.star3 * 3 +
                                  item.star4 * 4 +
                                  (item.star5 * 5) /
                                    (item.star1 +
                                      item.star2 +
                                      item.star3 +
                                      item.star4 +
                                      item.star5) <
                                  4.5 ? ( //4
                                <View style={{flexDirection: 'row'}}>
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
                              ) : item.star1 * 1 +
                                  item.star2 * 2 +
                                  item.star3 * 3 +
                                  item.star4 * 4 +
                                  (item.star5 * 5) /
                                    (item.star1 +
                                      item.star2 +
                                      item.star3 +
                                      item.star4 +
                                      item.star5) >
                                  3.4 &&
                                item.star1 * 1 +
                                  item.star2 * 2 +
                                  item.star3 * 3 +
                                  item.star4 * 4 +
                                  (item.star5 * 5) /
                                    (item.star1 +
                                      item.star2 +
                                      item.star3 +
                                      item.star4 +
                                      item.star5) <
                                  4 ? ( //3.5
                                <View style={{flexDirection: 'row'}}>
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
                              ) : item.star1 * 1 +
                                  item.star2 * 2 +
                                  item.star3 * 3 +
                                  item.star4 * 4 +
                                  (item.star5 * 5) /
                                    (item.star1 +
                                      item.star2 +
                                      item.star3 +
                                      item.star4 +
                                      item.star5) >
                                  2.9 &&
                                item.star1 * 1 +
                                  item.star2 * 2 +
                                  item.star3 * 3 +
                                  item.star4 * 4 +
                                  (item.star5 * 5) /
                                    (item.star1 +
                                      item.star2 +
                                      item.star3 +
                                      item.star4 +
                                      item.star5) <
                                  3.5 ? ( //3
                                <View style={{flexDirection: 'row'}}>
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
                              ) : item.star1 * 1 +
                                  item.star2 * 2 +
                                  item.star3 * 3 +
                                  item.star4 * 4 +
                                  (item.star5 * 5) /
                                    (item.star1 +
                                      item.star2 +
                                      item.star3 +
                                      item.star4 +
                                      item.star5) >
                                  2.4 &&
                                item.star1 * 1 +
                                  item.star2 * 2 +
                                  item.star3 * 3 +
                                  item.star4 * 4 +
                                  (item.star5 * 5) /
                                    (item.star1 +
                                      item.star2 +
                                      item.star3 +
                                      item.star4 +
                                      item.star5) <
                                  3 ? ( //2.5
                                <View style={{flexDirection: 'row'}}>
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
                              ) : item.star1 * 1 +
                                  item.star2 * 2 +
                                  item.star3 * 3 +
                                  item.star4 * 4 +
                                  (item.star5 * 5) /
                                    (item.star1 +
                                      item.star2 +
                                      item.star3 +
                                      item.star4 +
                                      item.star5) >
                                  1.9 &&
                                item.star1 * 1 +
                                  item.star2 * 2 +
                                  item.star3 * 3 +
                                  item.star4 * 4 +
                                  (item.star5 * 5) /
                                    (item.star1 +
                                      item.star2 +
                                      item.star3 +
                                      item.star4 +
                                      item.star5) <
                                  2.5 ? ( //2
                                <View style={{flexDirection: 'row'}}>
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
                              ) : item.star1 * 1 +
                                  item.star2 * 2 +
                                  item.star3 * 3 +
                                  item.star4 * 4 +
                                  (item.star5 * 5) /
                                    (item.star1 +
                                      item.star2 +
                                      item.star3 +
                                      item.star4 +
                                      item.star5) >
                                  1.4 &&
                                item.star1 * 1 +
                                  item.star2 * 2 +
                                  item.star3 * 3 +
                                  item.star4 * 4 +
                                  (item.star5 * 5) /
                                    (item.star1 +
                                      item.star2 +
                                      item.star3 +
                                      item.star4 +
                                      item.star5) <
                                  2 ? ( //1.5
                                <View style={{flexDirection: 'row'}}>
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
                              ) : item.star1 * 1 +
                                  item.star2 * 2 +
                                  item.star3 * 3 +
                                  item.star4 * 4 +
                                  (item.star5 * 5) /
                                    (item.star1 +
                                      item.star2 +
                                      item.star3 +
                                      item.star4 +
                                      item.star5) >
                                  0.9 &&
                                item.star1 * 1 +
                                  item.star2 * 2 +
                                  item.star3 * 3 +
                                  item.star4 * 4 +
                                  (item.star5 * 5) /
                                    (item.star1 +
                                      item.star2 +
                                      item.star3 +
                                      item.star4 +
                                      item.star5) <
                                  1.5 ? ( //1
                                <View style={{flexDirection: 'row'}}>
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
                                <View style={{flexDirection: 'row'}}>
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
                            </View>
                          </View>
                          {/*  <Text note style={styles.categoriesAddress}>Room Rates: {parseFloat(item.PriceArray == undefined? 0:item.PriceArray.length >0?item.PriceArray.sort((a,b)=> a.price -b.price)[0].price:0 ).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')} - {parseFloat(item.PriceArray == undefined? 0:item.PriceArray.length >0?item.PriceArray.sort((a,b)=> b.price - a.price)[0].price:0).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</Text>
                           */}
                        </View>
                      </TouchableHighlight>
                    </Box>
                  </Box>
                )}
                keyExtractor={(item, index) => index.toString()}
              />
            ) : (
              <FlatList
                key={'#'}
                data={this.state.Erentals}
                ItemSeparatorComponent={this.ListViewItemSeparator}
                renderItem={({item}) => this.rowRendererErentals(item)}
                enableEmptySections={true}
                style={{marginTop: 10, marginBottom: 35}}
                numColumns={2}
                columnWrapperStyle={{justifyContent: 'space-between'}}
                keyExtractor={(item, index) => index.toString()}
              />
            )}
          </View>
        ) : this.state.selectedIndex == 2 ? (
          <View>
            {
              this.state.transportSelected == 0 ? (
                <FlatList
                  key={'4'}
                  data={this.state.carsAvailable.filter(items => {
                    const itemData = items.datas.subCat;
                    const textData = 'commute';

                    return itemData.indexOf(textData) > -1;
                  })}
                  ItemSeparatorComponent={this.ListViewItemSeparator}
                  renderItem={({item}) => this.rowRenderer(item.datas)}
                  enableEmptySections={true}
                  style={{marginTop: 0, marginBottom: 315}}
                  numColumns={2}
                  columnWrapperStyle={{justifyContent: 'space-between'}}
                  keyExtractor={(item, index) => index.toString()}
                  refreshing={this.state.loading}
                  onRefresh={this.getData}
                />
              ) : this.state.transportSelected == 1 ? (
                <FlatList
                  key={'_'}
                  data={this.state.Vrentals}
                  ItemSeparatorComponent={this.ListViewItemSeparator}
                  renderItem={({item}) => this.rowRendererVrentals(item)}
                  enableEmptySections={true}
                  style={{marginTop: 0, marginBottom: 315}}
                  numColumns={2}
                  columnWrapperStyle={{justifyContent: 'space-between'}}
                  keyExtractor={(item, index) => index.toString()}
                  refreshing={this.state.loading}
                  onRefresh={this.getData}
                />
              ) : (
                <FlatList
                  key={'8'}
                  data={this.state.carsAvailable.filter(items => {
                    const itemData = items.datas.subCat;
                    const textData = 'mover';

                    return itemData.indexOf(textData) > -1;
                  })}
                  ItemSeparatorComponent={this.ListViewItemSeparator}
                  renderItem={({item}) => this.rowRenderer(item.datas)}
                  enableEmptySections={true}
                  style={{marginTop: 0, marginBottom: 315}}
                  numColumns={2}
                  columnWrapperStyle={{justifyContent: 'space-between'}}
                  keyExtractor={(item, index) => index.toString()}
                  refreshing={this.state.loading}
                  onRefresh={this.getData}
                />
              )
          
            }
          </View>
        ) : (
          <HomeScreenServiceOff
            navigation={this.props.navigation}
            selectedCityUser={this.state.FinalCity}
            typeOfRate={this.state.typeOfRate}
            currency={
              this.state.CountryNow.length == 0
                ? ''
                : this.state.CountryNow[0].currency
            }
          />
        )}
        {/*this.state.orders > 0 ?<Draggable z={12}  x={200}
            y={300} renderSize={56}  children={   <View>
        <Icon.Button name="profile" size={25} color={'white'} backgroundColor="none" style={{ backgroundColor:'#f06767' }} onPress={()=> this.props.navigation.navigate("Orders")} ></Icon.Button>
     
          <Badge style={{position: 'absolute', top: -3, right: 3, backgroundColor: '#ee4e4e'}}>
            <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
            {this.state.orders}
            </Text>
          </Badge>
      </View>
  } isCircle /> : null*/}
        <Modal
          isVisible={this.state.VisibleAddInfo}
          animationInTiming={700}
          animationIn="slideInUp"
          animationOut="slideOutDown"
          animationOutTiming={700}
          style={{margin: 0}}
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
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: 10,
                }}>
                <Text
                  style={{color: 'tomato', fontWeight: 'bold', fontSize: 16}}>
                  Detailed Information
                </Text>
              </View>
              <Text style={{marginTop: 15, fontSize: 16, fontWeight: 'bold'}}>
                Photos
              </Text>
              <PhotoGrid
                source={this.state.vInfos.imageArray.filter(items => {
                  const itemData = items;
                  const textData = 'AddImage';

                  return itemData.indexOf(textData) == -1;
                })}
                style={{width: SCREEN_WIDTH / 1.7}}
                onPressImage={uri =>
                  this.setState({showURL: true, SelectedURL: uri})
                }
              />

              <Text style={{marginTop: 15, fontSize: 16, fontWeight: 'bold'}}>
                Label:{' '}
                <Text
                  style={{marginTop: 15, fontSize: 16, fontWeight: 'normal'}}>
                  {this.state.vInfos.rentalType == 'Equipment'
                    ? this.state.vInfos.name
                    : this.state.vInfos.MBrand +
                      ' ' +
                      this.state.vInfos.VModel}{' '}
                </Text>
              </Text>
              {this.state.vInfos.rentalType == 'Equipment' ? null : (
                <Text style={{marginTop: 15, fontSize: 16, fontWeight: 'bold'}}>
                  Color:{' '}
                  <Text
                    style={{marginTop: 15, fontSize: 16, fontWeight: 'normal'}}>
                    {this.state.vInfos.ColorMotor}{' '}
                  </Text>
                </Text>
              )}
              {this.state.vInfos.rentalType == 'Equipment' ? null : (
                <Text style={{marginTop: 15, fontSize: 16, fontWeight: 'bold'}}>
                  Type:{' '}
                  <Text
                    style={{marginTop: 15, fontSize: 16, fontWeight: 'normal'}}>
                    {this.state.vInfos.name}{' '}
                  </Text>
                </Text>
              )}
              <Text style={{marginTop: 15, fontSize: 16, fontWeight: 'bold'}}>
                Location:{' '}
                <Text
                  style={{marginTop: 15, fontSize: 16, fontWeight: 'normal'}}>
                  {this.state.vInfos.address}
                </Text>
              </Text>

              <Text style={{marginTop: 15, fontSize: 16, fontWeight: 'bold'}}>
                Detailed Address:{' '}
                <Text
                  style={{marginTop: 15, fontSize: 16, fontWeight: 'normal'}}>
                  {this.state.vInfos.DetailedAddress}
                </Text>
              </Text>

              <Text style={{marginTop: 15, fontSize: 16, fontWeight: 'bold'}}>
                Description:{' '}
                <Text
                  style={{marginTop: 15, fontSize: 16, fontWeight: 'normal'}}>
                  {this.state.vInfos.description}
                </Text>{' '}
              </Text>

              <Text style={{marginTop: 15, fontSize: 16, fontWeight: 'bold'}}>
                Ameneties:{' '}
                <Text
                  style={{marginTop: 15, fontSize: 16, fontWeight: 'normal'}}>
                  {this.state.vInfos.ameneties}
                </Text>
              </Text>
            </ScrollView>

            <Button
              block
              style={{height: 50, backgroundColor: '#33c37d', marginTop: 10}}
              onPress={() => this.props.navigation.navigate('Login')}>
              <Text style={{color: 'white'}}>Proceed</Text>
            </Button>
          </Box>
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
            images={this.state.vInfos.imageArray.filter(items => {
              const itemData = items;
              const textData = 'AddImage';

              return itemData.indexOf(textData) == -1;
            })}
            sliderBoxHeight={SCREEN_HEIGHT}
            resizeMode={'contain'}
            firstItem={this.state.vInfos.imageArray
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
      </View>
    );
  }
}

const styles = StyleSheet.create({
  imageBanner: {
    height: width / 2 - 20,
    width: BannerWidth - 20,
    borderRadius: 5,
  },
  divCategorie: {
    backgroundColor: 'red',
    margin: 5,
    alignItems: 'center',
    borderRadius: 5,
    padding: 3,
  },
  titleCatg: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  imageFood: {
    width: width / 2 - 20 - 10,
    height: width / 2 - 20 - 30,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: -45,
  },
  divFood: {
    width: width / 2 - 20,
    padding: 10,
    borderRadius: 10,
    marginTop: 55,
    marginBottom: 5,
    marginLeft: 10,
    alignItems: 'center',
    elevation: 8,
    shadowOpacity: 0.3,
    shadowRadius: 50,
    backgroundColor: 'white',
  },

  categoriesPhoto: {
    width: '100%',
    height: 150,
    shadowColor: 'blue',
    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowRadius: 5,
    shadowOpacity: 1.0,
    elevation: 3,
  },
  productPhoto: {
    width: '100%',
    height: 150,
    shadowColor: 'blue',
    backgroundColor: '#cccccc',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    shadowRadius: 5,
    shadowOpacity: 1.0,
    elevation: 3,
  },
  favorite: {
    zIndex: 3,
    elevation: 3,
    position: 'absolute',
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
    borderTopRightRadius: 20,
  },
  subtitlSale: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '100',
    fontStyle: 'italic',
    zIndex: 3,
    elevation: 3,
    position: 'absolute',
    flex: 1,
    backgroundColor: '#4caf50',
    padding: 5,
    borderTopLeftRadius: 20,
  },
  subtitleopen: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '100',
    fontStyle: 'italic',
    zIndex: 3,
    elevation: 3,
    position: 'absolute',
    flex: 1,
    backgroundColor: '#4caf50',
    padding: 5,
    borderTopLeftRadius: 20,
  },
  subtitleclose: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '100',
    fontStyle: 'italic',
    zIndex: 3,
    elevation: 3,
    position: 'absolute',
    flex: 1,
    backgroundColor: 'tomato',
    padding: 5,
  },
  textoverlay: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '100',
    fontStyle: 'italic',
    zIndex: 3,
    elevation: 3,
    position: 'absolute',
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 5,
    color: '#ffffff',
  },
  categoriesName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#043D08',
    padding: 1,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  categoriesStoreName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
    padding: 1,
    paddingHorizontal: 20,
  },
  categoriesAddress: {
    fontSize: 15,
    textAlign: 'center',
    color: '#043D08',
    paddingBottom: 5,
  },
  categoriesPrice: {
    fontSize: 15,
    paddingLeft: 20,
    fontWeight: 'bold',
    color: 'tomato',
    padding: 1,
  },
  categoriesPriceSale: {
    fontSize: 10,
    color: '#043D08',
    padding: 1,
    textDecorationLine: 'line-through',
  },
  categoriesInfo: {
    marginTop: 3,
    marginBottom: 5,
  },
  text: {
    width: Dimensions.get('window').width / 2 - 10,
    height: 200,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
    elevation: 3,
  },
  title: {
    textAlign: 'center',
    color: '#fdfdfd',
    fontSize: 15,
    fontWeight: '900',
    fontWeight: 'bold',
    textShadowColor: 'black',
    textShadowOffset: {width: -1, height: 0},
    textShadowRadius: 10,
  },
  categoriesItemContainer: {
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    margin: 5,
    backgroundColor: '#ffffb2',
  },
  btnContainer: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 180,
    padding: 8,
    margin: 10,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
    position: 'absolute',
  },
  btnIcon: {
    height: 17,
    width: 17,
  },
  carouselContainer: {
    minHeight: 100,
  },
  carousel: {},

  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: 250,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    width: SCREEN_WIDTH,
    height: 250,
  },
  paginationContainer: {
    flex: 1,
    position: 'absolute',
    alignSelf: 'center',
    paddingVertical: 8,
    marginTop: 200,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 0,
  },
  infoRecipeContainer: {
    flex: 1,
    margin: 25,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  infoPhoto: {
    height: 20,
    width: 20,
    marginRight: 0,
  },
  infoRecipe: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  category: {
    fontSize: 14,
    fontWeight: 'bold',
    margin: 10,
    color: '#2cd18a',
  },
  infoDescriptionRecipe: {
    textAlign: 'left',
    fontSize: 16,
    marginTop: 30,
    margin: 15,
  },
  infoRecipeName: {
    fontSize: 20,
    margin: 10,
    color: 'black',
    textAlign: 'center',
  },
});

const style = StyleSheet.create({
  container: {
    flex: 1,
  },

  headerContainer: {
    marginTop: 5,
  },
  headerText: {
    color: 'black',
  },
  tabItemContainer: {
    backgroundColor: '#cf6bab',
  },
  content: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
});
