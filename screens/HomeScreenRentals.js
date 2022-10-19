import React, {Component} from 'react';
import {
  Dimensions,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Text,
  View,
  ScrollView,
  PermissionsAndroid,
  Alert,
  TouchableWithoutFeedback,
  BackHandler,
  TouchableHighlight,
} from 'react-native';
import {
  Container,
  Content,
  Button,
  Left,
  Right,
  Icon,
  Card,
  CardItem,
  Badge,
  Header,
  Toast,
  Root,
  List,
  Item,
  Input,
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
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Modal from 'react-native-modal';
import {RadioButton, Divider} from 'react-native-paper';
import SegmentedControlTab from 'react-native-segmented-control-tab';
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
import Carousel, {Pagination} from 'react-native-snap-carousel';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {FlatGrid} from 'react-native-super-grid';
import {SliderBox} from 'react-native-image-slider-box';
import Rider_img from '../assets/rider.png';
import customer_img from '../assets/customer.png';
import auth from '@react-native-firebase/auth';

const BannerWidth = Dimensions.get('window').width;
export default class HomeScreen extends Component {
  constructor(props) {
    super(props);
    this.cityRef = firestore();
    this.ref = firestore().collection('carousel');
    this.catref = firestore().collection('categories');
    this.catref = this.catref.orderBy('id', 'asc');
    this.state = {
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
      selectedCityUser: null,
      selectedIndex: 0,
      selectedIndexRentals: 0,
      HotelList: [],
      carsAvailable: [],
      cLat: null,
      cLong: null,
      Prentals: [],
      Vrentals: [],
      Erentals: [],
      MonthlyPrice: 0,
      DayPrice: 0,
      HourPrice: 0,
      WeeklyPrice: 0,
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
      EInfos: {
        imageArray: [],
        name: '',
        address: '',
        DetailedAddress: '',
        description: '',
        ameneties: '',
        slatitude: '',
        slongitude: '',
      },
      VisibleAddInfo: false,
      VisibleAddInfoP: false,
      vInfo: {
        DetailedAddress: '',
        rentalType: '',
        MonthlyPrice: '',
        DayPrice: '',
        HourPrice: '',
        WeeklyPrice: '',
        StatDayPrice: false,
        StatHourPrice: false,
        StatWeeklyPrice: false,
        StatMonthlyPrice: false,
        ameneties: '',
        keywords: '',
        address: '',
        name: '',
        MotorCR: '',
        MotorOR: '',
        MBrand: '',
        ColorMotor: '',
        PlateNo: '',
        VModel: '',
        brand: '',
        description: '',
        imageArray: [],
        showURL: false,
        SelectedURL: '',
        storesList: [],
      },
    };
    this.arrayholder = [];
  }

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

  componentWillUnmount() {
    this.backHandler.remove();
  }
  backAction() {
    this.setState({
      showURL: false,
      VisibleAddInfo: false,
      VisibleAddInfoP: false,
    });
    console.log('backPress');
  }
  componentDidMount() {
    this.setState({loading: true});

    this.getAllCity();
    this.getUserCity();
    this.unsubscribe = this.ref
      .where(
        'city',
        '==',
        this.props.selectedCityUser == null
          ? this.state.City
          : this.props.selectedCityUser,
      )
      .onSnapshot(this.onCollectionUpdate);
    this.subscribe = this.catref.onSnapshot(this.onCategoriesUpdate);
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.backAction.bind(this),
    );
  }
  onCollectionStoreHotels = querySnapshot => {
    let Stores = [];
    querySnapshot.forEach(doc => {
      if (doc.data().wallet > 0) {
        Stores.push(doc.data());
      }
    });
    console.log('HotelList: ', Stores.length);
    this.setState({
      HotelList: Stores.sort((a, b) => Number(b.arrange) - Number(a.arrange)),
    });
  };
  onCollectionStoreRental = querySnapshot => {
    let Stores = [];
    querySnapshot.forEach(doc => {
      if (doc.data().wallet > 0) {
        Stores.push(doc.data());
      }
    });
    this.setState({
      storesList: Stores.sort((a, b) => Number(b.arrange) - Number(a.arrange)),
    });
  };

  onVrentals = querySnapshot => {
    let Vrentals = [];
    querySnapshot.forEach(doc => {
      Vrentals.push(doc.data());
    });
    this.setState({
      Vrentals: Vrentals,
    });
  };

  onErentals = querySnapshot => {
    let Vrentals = [];
    querySnapshot.forEach(doc => {
      Vrentals.push(doc.data());
    });
    this.setState({
      Erentals: Vrentals.sort((a, b) => Number(b.arrange) - Number(a.arrange)),
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
    this.setState({
      dataSource: city,
    });
  }

  _bootstrapAsync = async (selected, item) => {
    console.log(selected);

    this.setState({selectedCityUser: item});
    this.ref
      .where('city', '==', this.props.selectedCityUser)
      .onSnapshot(this.onCollectionUpdate);
    console.log('citys: ', this.props.selectedCityUser);
    firestore()
      .collection('stores')
      .where('selectedAccount', '==', 'Hotels')
      .where('arrayofCity', 'array-contains-any', [
        this.props.selectedCityUser.trim(),
      ])
      .onSnapshot(this.onCollectionStoreHotels);
    firestore()
      .collection('stores')
      .where('selectedAccount', '==', 'Rental')
      .where('arrayofCity', 'array-contains-any', [
        this.props.selectedCityUser.trim(),
      ])
      .onSnapshot(this.onCollectionStoreRental);
    // firestore().collection('vehicles').where('succeed', '>',0).onSnapshot(this.onCollectionProducts);
    // this.cityRef.collection('products').where('rentalType','==', 'Vehicle').where('arrayofCity','array-contains-any',[this.props.selectedCityUser.trim()]).orderBy('arrange', 'asc').onSnapshot(this.onVrentals)
    this.cityRef
      .collection('products')
      .where('rentalType', '==', 'Equipment')
      .where('arrayofCity', 'array-contains-any', [
        this.props.selectedCityUser.trim(),
      ])
      .onSnapshot(this.onErentals);
  };
  async getUserCity() {
    const userId = await AsyncStorage.getItem('uid');
    console.log('userId: ', userId);
    this.subscribe = this.cityRef
      .collection('users')
      .where('userId', '==', userId)
      .onSnapshot(this.onCityUpdate);
  }

  async getAllCity() {
    const city = [];
    await firestore()
      .collection('city')
      .get()
      .then(querySnapshot => {
        querySnapshot.docs.forEach(doc => {
          city.push(doc.data());
        });
      });

    this.setState({
      cities: city,
    });
  }

  onCityUpdate = querySnapshot => {
    querySnapshot.forEach(doc => {
      this.setState({
        City: doc.data().Address.City,
        customerInfo: doc.data(),
      });
    });
    this._bootstrapAsync(false, null);
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

  async getLocationNow() {
    /* const granted = await PermissionsAndroid.check( PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION );

      if (granted) {
        console.log( "You can use the ACCESS_FINE_LOCATION" )
      } 
      else {
        console.log( "ACCESS_FINE_LOCATION permission denied" )
      }
     GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
            timeout: 150000,
  })
  .then(location => {
      console.log('location: ', location)
     this.setState({   cLat: location.latitude,
      cLong: location.longitude})

  })
  .catch(ex => {
    const { code, message } = ex;
    console.warn(code, message);
    if (code === 'CANCELLED') {
        //Alert.alert('Location cancelled by user or by another request');
      //  GetLocation.openGpsSettings();
      //this.getLocationNow();
    }
    if (code === 'UNAVAILABLE') {
      //  Alert.alert('Location service is disabled or unavailable');
    }
    if (code === 'TIMEOUT') {
      //  Alert.alert('Location request timed out');
    }
    if (code === 'UNAUTHORIZED') {
     //   Alert.alert('Authorization denied');
    }
});*/
  }

  rowRenderer = data => {
    const {
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
      <Card
        transparent
        style={{flex: 1, justifyContent: 'center', alignContent: 'center'}}>
        <CardItem
          style={{
            paddingBottom: 0,
            marginBottom: 0,
            paddingLeft: 0,
            paddingRight: 0,
            paddingTop: 0,
            borderRadius: 20,
            borderWidth: 1,
            width: SCREEN_WIDTH / 2 - 5,
          }}>
          <TouchableOpacity
            style={{width: SCREEN_WIDTH / 2 - 5, flex: 1}}
            onPress={() => {
              this.props.navigation.navigate('CheckoutTransport', {
                datas: data,
                typeOfRate: this.props.typeOfRate,
                cLat: this.state.cLat,
                cLong: this.state.cLong,
              });
            }}>
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
            <View style={{height: 20, flexShrink: 1}}>
              <Text numberOfLines={1} style={styles.categoriesStoreName}>
                {vehicle}
              </Text>
            </View>
            <View style={{flexDirection: 'row'}}>
              <Text
                style={{fontStyle: 'italic', fontSize: 10, paddingLeft: 20}}>
                Base Distance :{base}km
              </Text>
            </View>
            <Text style={{fontStyle: 'italic', fontSize: 10, paddingLeft: 20}}>
              Base Fare : {base_fare}
            </Text>
            <Text style={{fontStyle: 'italic', fontSize: 10, paddingLeft: 20}}>
              Succeeding : {succeed}
            </Text>
          </TouchableOpacity>
        </CardItem>
      </Card>
    );
  };

  rowRendererPrentals = data => {
    console.log('data: ', data);
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
      address,
      ameneties,
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
      <Card
        transparent
        style={{flex: 1, justifyContent: 'center', alignContent: 'center'}}>
        <CardItem
          style={{
            paddingBottom: 0,
            marginBottom: 0,
            paddingLeft: 0,
            paddingRight: 0,
            paddingTop: 0,
            borderRadius: 20,
            borderWidth: 1,
            width: SCREEN_WIDTH / 2.5 - 5,
          }}>
          <TouchableOpacity
            style={{width: SCREEN_WIDTH / 2 - 5, flex: 1}}
            onPress={() =>
              this.props.navigation.navigate('CheckoutScreenRentals', {
                datas: data,
                cLat: data.slatitude,
                cLong: data.slongitude,
                typeOfRate: this.props.typeOfRate,
                currency: this.props.currency,
              })
            }>
            <Image
              style={styles.productPhoto}
              resizeMode="cover"
              source={{uri: newData[0]}}
            />

            <View style={{height: 20, flexShrink: 1}}>
              <Text numberOfLines={1} style={styles.categoriesStoreName}>
                {name}
              </Text>
            </View>

            {!StatHourPrice ? null : (
              <Text
                style={{fontStyle: 'italic', fontSize: 10, paddingLeft: 20}}>
                Hour Rate : {this.props.currency}
                {parseFloat(HourPrice)
                  .toFixed(2)
                  .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
              </Text>
            )}

            {!StatDayPrice ? null : (
              <Text
                style={{fontStyle: 'italic', fontSize: 10, paddingLeft: 20}}>
                Daily Rate : {this.props.currency}
                {parseFloat(DayPrice)
                  .toFixed(2)
                  .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
              </Text>
            )}
            {!StatWeeklyPrice ? null : (
              <Text
                style={{fontStyle: 'italic', fontSize: 10, paddingLeft: 20}}>
                Weekly Rate : {this.props.currency}
                {parseFloat(WeeklyPrice)
                  .toFixed(2)
                  .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
              </Text>
            )}
            {!StatMonthlyPrice ? null : (
              <Text
                style={{fontStyle: 'italic', fontSize: 10, paddingLeft: 20}}>
                Hour Rate : {this.props.currency}
                {parseFloat(MonthlyPrice)
                  .toFixed(2)
                  .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
              </Text>
            )}
          </TouchableOpacity>
        </CardItem>
      </Card>
    );
  };

  addToFav(id) {
    const uid = auth().currentUser.uid;
    this.setState({loading: true});
    const updateRef = firestore().collection('users').doc(uid);
    updateRef
      .update({
        RentalEqFav: firestore.FieldValue.arrayUnion(id),
      })
      .then(docRef => {
        this.setState({loading: false});
        this.loadProducts();
      })
      .catch(err => {
        this.setState({loading: false});
        console.log('err: ', err);
      });
  }

  removeFav(id) {
    const uid = auth().currentUser.uid;
    this.setState({loading: true});
    const updateRef = firestore().collection('users').doc(uid);
    updateRef
      .update({
        RentalEqFav: firestore.FieldValue.arrayRemove(id),
      })
      .then(docRef => {
        this.setState({loading: false});
        this.loadProducts();
      })
      .catch(err => {
        this.setState({loading: false});
        console.log('err: ', err);
      });
  }

  rowRendererVrentals = data => {
    console.log('data: ', data);
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
      <Card
        transparent
        style={{flex: 1, justifyContent: 'center', alignContent: 'center'}}>
        <CardItem
          style={{
            paddingBottom: 0,
            marginBottom: 0,
            paddingLeft: 0,
            paddingRight: 0,
            paddingTop: 0,
            borderRadius: 20,
            borderWidth: 1,
            width: SCREEN_WIDTH / 2 - 5,
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
                      fontSize: 10,
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
                      fontSize: 10,
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
                      fontSize: 10,
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
                      fontSize: 10,
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
                {MBrand} {VModel}{' '}
              </Text>
            </View>
            <View style={{flexDirection: 'row'}}>
              <Text
                style={{fontStyle: 'italic', fontSize: 10, paddingLeft: 20}}>
                Color : {ColorMotor}
              </Text>
            </View>
            <Text style={{fontStyle: 'italic', fontSize: 10, paddingLeft: 20}}>
              Type :{name}
            </Text>
          </TouchableOpacity>
        </CardItem>
      </Card>
    );
  };

  rowRendererErentals = data => {
    console.log('data: ', data);
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
      <Card
        transparent
        style={{flex: 1, justifyContent: 'center', alignContent: 'center'}}>
        <CardItem
          style={{
            paddingBottom: 0,
            marginBottom: 0,
            paddingLeft: 0,
            paddingRight: 0,
            paddingTop: 0,
            borderRadius: 20,
            borderWidth: 1,
            width: SCREEN_WIDTH / 2 - 5,
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
                      fontSize: 10,
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
                      fontSize: 10,
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
                      fontSize: 10,
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
                      fontSize: 10,
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

              {this.state.customerInfo == undefined ? null : this.state
                  .customerInfo.RentalEqFav == undefined ? (
                <AntDesign
                  name="hearto"
                  size={21}
                  color="salmon"
                  style={{
                    backgroundColor: 'white',
                    width: 32,
                    marginLeft: 10,
                    height: 32,
                    marginTop: 5,
                    padding: 5,
                    borderRadius: 5,
                  }}
                  onPress={() => this.addToFav(data.id)}
                />
              ) : !this.state.customerInfo.RentalEqFav.includes(data.id) ? (
                <AntDesign
                  name="hearto"
                  size={21}
                  color="salmon"
                  style={{
                    backgroundColor: 'white',
                    width: 32,
                    marginLeft: 10,
                    height: 32,
                    marginTop: 5,
                    padding: 5,
                    borderRadius: 5,
                  }}
                  onPress={() => this.addToFav(data.id)}
                />
              ) : (
                <AntDesign
                  name="heart"
                  size={21}
                  color="salmon"
                  style={{
                    backgroundColor: 'white',
                    width: 32,
                    marginLeft: 10,
                    height: 32,
                    marginTop: 5,
                    padding: 5,
                    borderRadius: 5,
                  }}
                  onPress={() => this.removeFav(data.id)}
                />
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
        </CardItem>
      </Card>
    );
  };
  render() {
    console.log('Vrentals: ', this.state.Vrentals);
    console.log('storesList: ', this.state.storesList);
    return (
      <View>
        {/*   <SegmentedControlTab
          values={["Hotels etc.","Property","Vehicle","Equipment"]}
          selectedIndex={this.state.selectedIndexRentals}
          onTabPress={this.handleIndexChangeRentals}
          borderRadius ={1}
          tabStyle={{borderColor: 'gray', marginTop: 5}}
          tabTextStyle={{color: 'black'}}
          activeTabStyle={{backgroundColor: 'gray'}}
  />*/}
        <View style={{flexDirection: 'row', marginLeft: 30}}>
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
              width: SCREEN_WIDTH / 3.5,
              backgroundColor:
                this.state.selectedIndexRentals == 0 ? '#dadada' : 'white',
              borderRadius: 15,
              padding: 5,
              flexDirection: 'row',
            }}
            onPress={() => this.setState({selectedIndexRentals: 0})}>
            <FontAwesome5 name={'hotel'} size={15} color={'#5580ad'} />
            <Text style={{color: 'black', fontSize: 13, fontWeight: 'bold'}}>
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
              width: SCREEN_WIDTH / 3.5,
              backgroundColor:
                this.state.selectedIndexRentals == 1 ? '#dadada' : 'white',
              borderRadius: 15,
              padding: 5,
              flexDirection: 'row',
              marginLeft: 5,
              marginRight: 5,
            }}
            onPress={() => this.setState({selectedIndexRentals: 1})}>
            <MaterialIcons name={'house'} size={15} color={'#5580ad'} />
            <Text style={{color: 'black', fontSize: 13, fontWeight: 'bold'}}>
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
              width: SCREEN_WIDTH / 3.5,
              backgroundColor:
                this.state.selectedIndexRentals == 3 ? '#dadada' : 'white',
              borderRadius: 15,
              padding: 5,
              flexDirection: 'row',
            }}
            onPress={() => this.setState({selectedIndexRentals: 3})}>
            <FontAwesome5 name={'tools'} size={15} color={'#5580ad'} />
            <Text style={{color: 'black', fontSize: 13, fontWeight: 'bold'}}>
              {' '}
              Equipment
            </Text>
          </TouchableOpacity>
        </View>
        {this.state.selectedIndexRentals == 0 ? (
          <FlatList
            style={{marginBottom: 35}}
            data={this.state.HotelList}
            renderItem={({item}) => (
              <Card transparent>
                <Card>
                  <TouchableHighlight
                    underlayColor="rgba(73,182,77,1,0.9)"
                    onPress={() =>
                      item.status === true
                        ? this.props.navigation.navigate('PropertyHotel', {
                            store: item,
                            cLat: item.slatitude,
                            cLong: item.slongitude,
                            navigation: this.props.navigation,
                            typeOfRate: this.props.typeOfRate,
                            currency: this.props.currency,
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

                      <Text style={styles.categoriesName}>{item.name} </Text>
                      <Text note style={styles.categoriesAddress}>
                        {item.address}
                      </Text>
                    </View>
                  </TouchableHighlight>
                </Card>
              </Card>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        ) : this.state.selectedIndexRentals == 1 ? (
          <FlatList
            style={{marginBottom: 35}}
            data={this.state.storesList}
            renderItem={({item}) => (
              <Card transparent>
                <Card style={{flex: 1, marginHorizontal: 20}}>
                  <TouchableHighlight
                    underlayColor="rgba(73,182,77,1,0.9)"
                    onPress={() =>
                      item.status === true
                        ? this.props.navigation.navigate('PropertyRent', {
                            store: item,
                            cLat: item.slatitude,
                            cLong: item.slongitude,
                            navigation: this.props.navigation,
                            typeOfRate: this.props.typeOfRate,
                            currency: this.props.currency,
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

                      <Text style={styles.categoriesName}>{item.name} </Text>
                      <Text note style={styles.categoriesAddress}>
                        {item.address}
                      </Text>
                    </View>
                  </TouchableHighlight>
                </Card>
              </Card>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        ) : this.state.selectedIndexRentals == 2 ? (
          <FlatList
            key={'_'}
            data={this.state.Vrentals}
            ItemSeparatorComponent={this.ListViewItemSeparator}
            renderItem={({item}) => this.rowRendererVrentals(item)}
            enableEmptySections={true}
            style={{marginTop: 10, marginBottom: 35}}
            numColumns={2}
            columnWrapperStyle={{justifyContent: 'space-between'}}
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
          <Card
            style={{
              backgroundColor: 'white',
              padding: 22,
              borderRadius: 4,
              borderColor: 'rgba(0, 0, 0, 0.1)',
            }}>
            <ScrollView>
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: 10,
                }}>
                <Text style={{color: 'tomato', fontWeight: 'bold'}}>
                  Detailed Information
                </Text>
              </View>
              <Text>Photos</Text>
              <FlatGrid
                itemDimension={120}
                data={this.state.vInfos.imageArray.filter(items => {
                  const itemData = items;
                  const textData = 'AddImage';

                  return itemData.indexOf(textData) == -1;
                })}
                // staticDimension={300}
                // fixed
                spacing={10}
                renderItem={({item}) => (
                  <TouchableWithoutFeedback
                    onPress={() =>
                      this.setState({showURL: true, SelectedURL: item})
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
                )}
              />

              <Text style={{marginTop: 15, fontSize: 14, fontWeight: 'bold'}}>
                Label:{' '}
                <Text
                  style={{marginTop: 15, fontSize: 14, fontWeight: 'normal'}}>
                  {this.state.vInfos.rentalType == 'Equipment'
                    ? this.state.vInfos.name
                    : this.state.vInfos.MBrand +
                      ' ' +
                      this.state.vInfos.VModel}{' '}
                </Text>
              </Text>

              <Text style={{marginTop: 15, fontSize: 14, fontWeight: 'bold'}}>
                Location:{' '}
                <Text
                  style={{marginTop: 15, fontSize: 14, fontWeight: 'normal'}}>
                  {this.state.vInfos.address}
                </Text>
              </Text>

              <Text style={{marginTop: 15, fontSize: 14, fontWeight: 'bold'}}>
                Detailed Address:{' '}
                <Text
                  style={{marginTop: 15, fontSize: 14, fontWeight: 'normal'}}>
                  {this.state.vInfos.DetailedAddress}
                </Text>
              </Text>

              <Text style={{marginTop: 15, fontSize: 14, fontWeight: 'bold'}}>
                Description:{' '}
                <Text
                  style={{marginTop: 15, fontSize: 14, fontWeight: 'normal'}}>
                  {this.state.vInfos.description}
                </Text>{' '}
              </Text>

              <Text style={{marginTop: 15, fontSize: 14, fontWeight: 'bold'}}>
                Ameneties:{' '}
                <Text
                  style={{marginTop: 15, fontSize: 14, fontWeight: 'normal'}}>
                  {this.state.vInfos.ameneties}
                </Text>
              </Text>
            </ScrollView>

            <Button
              block
              style={{height: 30, backgroundColor: '#33c37d', marginTop: 10}}
              onPress={() => {
                this.setState({VisibleAddInfo: false});
                this.state.selectedIndexRentals == 2 ||
                this.state.selectedIndexRentals == 3
                  ? this.props.navigation.navigate('CheckoutScreenEquipment', {
                      datas: this.state.vInfos,
                      typeOfRate: this.props.typeOfRate,
                      cLat: this.state.vInfos.slatitude,
                      cLong: this.state.vInfos.slongitude,
                      currency: this.props.currency,
                    })
                  : this.props.navigation.navigate('CheckoutScreenRentals', {
                      datas: this.state.vInfos,
                      typeOfRate: this.props.typeOfRate,
                      cLat: this.state.vInfos.slatitude,
                      cLong: this.state.vInfos.slongitude,
                      currency: this.props.currency,
                    });
              }}>
              <Text style={{color: 'white'}}>Proceed</Text>
            </Button>
          </Card>
        </Modal>

        <Modal
          isVisible={this.state.VisibleAddInfoP}
          animationInTiming={700}
          animationIn="slideInUp"
          animationOut="slideOutDown"
          animationOutTiming={700}
          useNativeDriver={true}
          onBackButtonPress={() => this.setState({VisibleAddInfoP: false})}
          onBackdropPress={() => this.setState({VisibleAddInfoP: false})}
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
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: 10,
                }}>
                <Text style={{color: 'tomato', fontWeight: 'bold'}}>
                  Detailed Information
                </Text>
              </View>

              <Text style={{marginTop: 15, fontSize: 14, fontWeight: 'bold'}}>
                Label:{' '}
                <Text
                  style={{marginTop: 15, fontSize: 14, fontWeight: 'normal'}}>
                  {this.state.vInfo.name}{' '}
                </Text>
              </Text>

              <Text style={{marginTop: 15, fontSize: 14, fontWeight: 'bold'}}>
                Location:{' '}
                <Text
                  style={{marginTop: 15, fontSize: 14, fontWeight: 'normal'}}>
                  {this.state.vInfo.address}
                </Text>
              </Text>

              <FlatList
                data={this.state.Prentals.filter(items => {
                  const itemData = items.storeId;
                  const textData = this.state.vInfo.id;

                  return itemData.indexOf(textData) > -1;
                })}
                ItemSeparatorComponent={this.ListViewItemSeparator}
                renderItem={({item}) => this.rowRendererPrentals(item)}
                enableEmptySections={true}
                style={{marginTop: 10}}
                numColumns={2}
                columnWrapperStyle={{justifyContent: 'space-between'}}
                keyExtractor={(item, index) => index.toString()}
              />
            </ScrollView>
          </Card>
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
    borderTopWidth: 1,
    borderTopColor: '#ccc',
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
