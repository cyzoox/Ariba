import React, {Component} from 'react';
import {
  AppState,
  FlatList,
  Platform,
  TouchableOpacity,
  Dimensions,
  View,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableHighlight,
  Image,
  Pressable,
  Animated,
} from 'react-native';
import {
  Button,
  Text,
  Box,
  HStack ,
  Stack,
  Input,
  StatusBar,
} from 'native-base';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {RecyclerListView, DataProvider, LayoutProvider} from 'recyclerlistview';
import FastImage from 'react-native-fast-image';
const SCREEN_WIDTH = Dimensions.get('window').width;
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomHeader from '../screens/Header';
import Fontisto from 'react-native-vector-icons/Fontisto';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import AntDesign from 'react-native-vector-icons/AntDesign';
import styles from './styles';
import Modal from 'react-native-modal';
import {RadioButton, Divider, Checkbox} from 'react-native-paper';
import Loader from './Loader';
import {FlatGrid} from 'react-native-super-grid';
import {LayoutUtil} from './LayoutUtil';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import moment from 'moment';
import StoreCard from './StoreCard';

export default class SearchAllOff extends Component {
  constructor(props) {
    super(props);
    this.Rotatevalue = new Animated.Value(0);
    console.log('params: ', this.props.route.params.selectedCityUser);
    this.ref = firestore().collection('products');
    this.state = {
      appState: AppState.currentState,
      dataProvider: new DataProvider((r1, r2) => {
        return r1 !== r2;
      }),
      layoutProvider: LayoutUtil.getLayoutProvider(0),
      City: this.props.route.params.selectedCityUser,
      dataSource: this.props.route.params.storeList,
      loading: false,
      data: [],
      error: null,
      items: [],
      searchText: '',
      store_name: '',
      token: [],
      cart: [],
      activeSlide: 0,
      selectedFruits: [],
      addonss: [],
      choice: [],
      productss: [],
      isVisibleAddons: false,
      name: '',
      price: 0,
      image: [],
      id: '',
      sale_price: 0,
      unit: '',
      brand: '',
      count: 1,
      searchText: '',
      cLat: null,
      cLong: null,
      Prentals: [],
      Vrentals: [],
      MonthlyPrice: 0,
      DayPrice: 0,
      HourPrice: 0,
      WeeklyPrice: 0,
      VisibleAddInfoSErvice: false,
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

        viewType: 1,
        limit: 50,
        lastVisible: null,
        refreshing: false,
        showMoreBtn: false,
        qty: 0,
        sale: false,
        selectedFilter: 'Alphabetical-(A-Z)',
        searchEnabled: false,
        showToast: false,
      },
      SliderminimumValue: [0, 5000],
      SlidermaximumValue: 10000,
      setSliderminimumValue: false,
      selectedFilterBy: 'ByProductSearch',
    };

    this.arrayholder = [];
  }

  _incrementCount = () => {
    this.setState(prevState => ({count: prevState.count + 1}));
  };

  _decrementCount = () => {
    this.setState(prevState => ({count: prevState.count - 1}));
  };
  checkDrinkm(drink, object) {
    const {choice} = this.state;
    var i;
    for (i = 0; i < object.length; i++) {
      if (object[i].isChecked === 'checked') {
        object[i].isChecked = 'checked';
      }
    }
    drink.isChecked = 'checked';

    let updatedCart = choice;
    let item = updatedCart.find(item => drink.id === item.id);
    if (item) {
      let itemIndex = updatedCart.findIndex(item => drink.id === item.id);
      updatedCart.splice(itemIndex, 1);
      choice.push(drink);
    } else {
      choice.push(drink);
    }
    console.log(choice);
    this.setState({refresh: true});
  }
  checkDrinkmunchecked(drink, object) {
    const {choice} = this.state;
    var i;
    for (i = 0; i < object.length; i++) {
      if (object[i].isChecked === 'unchecked') {
        object[i].isChecked = 'unchecked';
      }
    }
    drink.isChecked = 'unchecked';

    let updatedCart = choice;
    let item = updatedCart.find(item => drink.id === item.id);
    if (item) {
      let itemIndex = updatedCart.findIndex(item => drink.id === item.id);
      updatedCart.splice(itemIndex, 1);
      choice.push(drink);
    } else {
      choice.push(drink);
    }
    console.log(choice);
    this.setState({refresh: true});
  }
  checkDrink(drink, object) {
    const {choice} = this.state;
    var i;
    for (i = 0; i < object.length; i++) {
      if (object[i].isChecked === 'checked') {
        object[i].isChecked = 'unchecked';
      }
    }
    drink.isChecked = 'checked';

    let updatedCart = choice;
    let item = updatedCart.find(item => drink.id === item.id);
    if (item) {
      let itemIndex = updatedCart.findIndex(item => drink.id === item.id);
      updatedCart.splice(itemIndex, 1);
      choice.push(drink);
    } else {
      choice.push(drink);
    }
    console.log(choice);
    this.setState({refresh: true});
  }

  getAddonsTotal = () => {
    const {choice, productss} = this.state;
    let total = 0;
    productss.map((object, d) =>
      object.data.map((drink, i) => {
        if (drink.isChecked === 'checked') {
          total += drink.price;
        }
      }),
    );
    console.log(total);
    return total;
  };

  getAddonsDefault = () => {
    const {choice, productss} = this.state;
    let item = [];
    productss.map((object, d) =>
      object.data.map((drink, i) => {
        if (drink.isChecked === 'checked') {
          choice.push(drink);
        }
      }),
    );
    for (var value of choice) {
      if (item.indexOf(value) === -1) {
        item.push(value);
      }
    }
    return item;
  };

  async addonsAddtoCart(item) {
    this.props.navigation.navigate('Login');
  }

  renderImage = ({item}) => (
    <TouchableHighlight>
      <View style={styles.imageContainer}>
        <Image style={styles.image} source={{uri: item}} />
      </View>
    </TouchableHighlight>
  );

  async onAddToCart(item) {
    const {cart} = this.state;
    this.props.navigation.navigate('Login');
  }

  onCollectionUpdate = querySnapshot => {
    const products = [];
    querySnapshot.forEach(doc => {
      products.push({
        datas: doc.data(),
        key: doc.id,
      });
    });
    this.setState({
      loading: false,
      data: products.filter(items => {
        const itemData = items.datas.ProductType;
        const textData = 'Transport';
        return itemData.indexOf(textData) == -1;
      }),
    });
    // this.arrayholder = products;
  };

  async componentDidMount() {
    this.StartImageRotationFunction();
    this.setState({loading: true});

    //firestore().collection('products').where('city', '==', this.state.City.trim()).where('admin_control', '==', true).where('status', '==', true).onSnapshot(this.onCollectionUpdate);
    this.loadProducts(false, true);
  }

  loadProducts(loadmore, fromComponent) {
    if (this.state.selectedFilterBy == 'ByStoreSearch') {
      this.setState({visibleModal: false});
      return;
    }
    const self = this;
    var productQuery = firestore()
      .collection('products')
      .where('section', '==', 'Fastfood')
      .where('rentalType', '==', 'Foods')
      .where('admin_control', '==', true)
      .where('status', '==', true)
      .where('city', '==', this.state.City.trim());
    productQuery =
      this.state.searchText === ''
        ? productQuery
        : productQuery.where('keywords', 'array-contains-any', [
            this.state.searchText.toLocaleLowerCase(),
          ]);

    if (this.state.searchEnabled) {
      /* If request is from a search (onChangeSearch();), we clear out the product list then load the new search results */
      /* We identify weather the trigger is from a search or a load more button click using "searchEnabled" state */
      this.setState({
        products: [],
        searchEnabled: false,
      });
    }

    switch (this.state.selectedFilter) {
      case 'PriceRange':
        productQuery = productQuery
          .where(
            'FinalPrice',
            '>=',
            parseFloat(this.state.SliderminimumValue[0]),
          )
          .where(
            'FinalPrice',
            '<=',
            parseFloat(this.state.SliderminimumValue[1]),
          )
          .orderBy('FinalPrice', 'asc');
        break;
      case 'Price-Ascending':
        productQuery = productQuery.orderBy('price', 'asc');
        break;
      case 'Price-Descending':
        productQuery = productQuery.orderBy('price', 'desc');
        break;
      case 'Alphabetical-(A-Z)':
        productQuery = productQuery.orderBy('name', 'asc');
        break;
      case 'Alphabetical-(Z-A)':
        productQuery = productQuery.orderBy('name', 'desc');
        break;

      default:
        productQuery = productQuery.orderBy('price', 'asc');
    }
    productQuery = productQuery.limit(50);
    /* If there's a last item set, we start the query after that item using startAfter() method */
    if (loadmore && this.state.lastVisible) {
      productQuery = productQuery.startAfter(this.state.lastVisible);
    }

    this.unsubscribeProducts = productQuery.onSnapshot(snapshot => {
      /* The onSnapshot() method registers a continuous listener that triggers every time something has changed, use get() to only call it once (disable realtime) */
      let productChunk = [];

      snapshot.docChanges().forEach(function (change) {
        let Closing = false;
        if (change.doc.data().startDate != undefined) {
          var startTime = moment(
            change.doc.data().startDate.seconds * 1000,
          ).format('H:mm:ss');
          var endTime = moment(change.doc.data().endDate.seconds * 1000).format(
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

          console.log('startTime: ', startTime);
          console.log('endTime: ', endTime);
          console.log('endTime: ', currentDate);
          Closing = startDate < currentDate && endDate > currentDate;
          console.log('res Closing: ', Closing);
        }
        console.log('AlwaysOpen: ', change.doc.data().AlwaysOpen);
        console.log('Closing: ', Closing);
        console.log('store_name: ', change.doc.data().store_name);
        if (
          change.type === 'added' &&
          change.doc.data().admin_control &&
          change.doc.data().quantity > 0
        ) {
          /* Add more items to the screen...   const itemData = items.ProductType;
        const textData = 'Transport';*/
          if (change.doc.data().AlwaysOpen == false && Closing == false) {
          } else {
            if (change.doc.data().ProductType != 'Transport') {
              productChunk.push({...change.doc.data(), pid: change.doc.id});
            }
          }
        } else if (
          change.type === 'modified' &&
          change.doc.data().admin_control &&
          change.doc.data().quantity > 0
        ) {
          /* If there is a change in realtime... */
          /* Apply the modification to the item directly without changing the current item index. */
          if (change.doc.data().AlwaysOpen == false && Closing == false) {
          } else {
            self.setState({
              products: self.state.products.map(el =>
                el.pid === change.doc.id
                  ? {...change.doc.data(), pid: change.doc.id}
                  : el,
              ),
            });
          }
        } else if (change.type === 'removed') {
          if (change.doc.data().AlwaysOpen == false && Closing == false) {
          } else {
            let updatedProductList = Object.values(
              self.state.products,
            ); /* Clone it first */
            let itemIndex = updatedProductList.findIndex(
              item => change.doc.id === item.pid,
            ); /* Get the index of the item we want to delete */

            /* Remove item from the cloned cart state */
            updatedProductList.splice(itemIndex, 1);
            /* Update state to remove item from screen */
            self.setState({
              products: updatedProductList,
            });
          }
        }
      });

      console.log(
        'productChunk s:',
        productChunk.sort((a, b) => Number(b.arrange) - Number(a.arrange)),
      );
      console.log('limit: ', this.state.limit);
      this.setState(prevState => ({
        products:
          prevState.products && fromComponent
            ? [
                ...prevState.products,
                ...productChunk.sort(
                  (a, b) => Number(b.arrange) - Number(a.arrange),
                ),
              ]
            : productChunk.sort(
                (a, b) => Number(b.arrange) - Number(a.arrange),
              ),
        dataProvider: this.state.dataProvider.cloneWithRows(
          prevState.products && fromComponent
            ? [
                ...prevState.products,
                ...productChunk.sort(
                  (a, b) => Number(b.arrange) - Number(a.arrange),
                ),
              ]
            : productChunk.sort(
                (a, b) => Number(b.arrange) - Number(a.arrange),
              ),
        ),
        loading: false,
        loadingBtn: false,
        lastVisible: snapshot.docs[snapshot.docs.length - 1],
        showMoreBtn: productChunk.length < 50 ? false : true,
        visibleModal: false,
      }));
    });
  }
  componentWillUnmount() {
    //this.appStateSubscription.remove();
  }
  searchFilterFunction = async () => {
    this.setState({loading: true});
    console.log('CIty: ', this.state.City);
    console.log('searchText: ', this.state.searchText);
    const result = this.props.route.params.storeList
      .filter(items => {
        const itemData = items.name.toUpperCase();
        const textData = this.state.searchText.toUpperCase();
        return itemData.indexOf(textData) > -1;
      })
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
      });

    const paidResult = this.props.route.params.storeList
      .filter(items => {
        const itemData = items.name.toUpperCase();
        const textData = this.state.searchText.toUpperCase();
        return itemData.indexOf(textData) == -1 && items.arrange > 0;
      })
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
      });

    this.setState({dataSource: result.concat(paidResult), loading: false});
  };

  FoodAddons(item) {
    let img = [];
    let add = [];
    this.setState({
      isVisibleAddons: true,
      name: item.name,
      price: item.price,
      image: img.concat(item.featured_image),
      id: item.id,
      sale_price: item.sale_price,
      unit: item.unit,
      brand: item.brand,
      productss: item.addons,
      addonss: item,
    });
  }

  router(item) {
    if (!item.status || item.quantity <= 0 || !item.admin_control) {
      return null;
    } else {
      if (item.addons == null || item.addons == 0) {
        this.onAddToCart(item);
      } else {
        this.FoodAddons(item);
      }
    }
  }

  rowRenderer = (type, data) => {
    const {
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
      MBrand,
      VModel,
      name,
      price,
      quantity,
      ProductType,
      rentalType,
      featured_image,
      unit,
      status,
      id,
      admin_control,
      storeId,
      sale_price,
      sale_description,
      brand,
      store_name,
    } = data;
    const newimageArray = imageArray == undefined ? [] : imageArray;
    const newData = newimageArray.filter(items => {
      const itemData = items;
      const textData = 'AddImage';

      return itemData.indexOf(textData) == -1;
    });

    return (
      <Box
        bg="white"
        style={{justifyContent: 'center', alignContent: 'center'}}>
        {rentalType == 'Services' ? (
          <Box
            style={{
              backgroundColor: '#fff1f3',
              paddingBottom: 0,
              marginBottom: 0,
              paddingLeft: 0,
              paddingRight: 0,
              paddingTop: 0,
              borderRadius: 20,
              borderWidth: 0.5,
              width: SCREEN_WIDTH / 2 - 10,
            }}>
            <TouchableOpacity
              style={{width: SCREEN_WIDTH / 2 - 10, flex: 1}}
              onPress={() =>
                this.setState({
                  vInfo: data,
                  VisibleAddInfoSErvice: true,
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
                <View
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.4)',
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                  }}>
                  <View style={{height: 20, flexShrink: 1}}>
                    <Text numberOfLines={1} style={styles.categoriesStoreName}>
                      {name}
                    </Text>
                  </View>
                  {!admin_control || !status ? (
                    <View style={styles.text}>
                      <Text style={styles.title}>Unavailable</Text>
                    </View>
                  ) : quantity <= 0 ? (
                    <View style={styles.text}>
                      <Text style={styles.title}>Out of Stock</Text>
                    </View>
                  ) : null}

                  <View style={{flexDirection: 'row'}}>
                    <Text
                      style={{
                        fontStyle: 'italic',
                        fontSize: 10,
                        paddingLeft: 20,
                      }}>
                      Service Provider :{store_name}
                    </Text>
                  </View>
                  <View>
                    {!StatHourPrice ? null : (
                      <Text
                        style={{
                          fontStyle: 'italic',
                          fontSize: 10,
                          paddingLeft: 20,
                        }}>
                        Hour Rate : {this.props.route.params.currency}
                        {parseFloat(HourPrice)
                          .toFixed(2)
                          .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                      </Text>
                    )}

                    {!StatDayPrice ? null : (
                      <Text
                        style={{
                          fontStyle: 'italic',
                          fontSize: 10,
                          paddingLeft: 20,
                        }}>
                        Daily Rate : {this.props.route.params.currency}
                        {parseFloat(DayPrice)
                          .toFixed(2)
                          .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                      </Text>
                    )}
                    {!StatWeeklyPrice ? null : (
                      <Text
                        style={{
                          fontStyle: 'italic',
                          fontSize: 10,
                          paddingLeft: 20,
                        }}>
                        Weekly Rate : {this.props.route.params.currency}
                        {parseFloat(WeeklyPrice)
                          .toFixed(2)
                          .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                      </Text>
                    )}
                    {!StatMonthlyPrice ? null : (
                      <Text
                        style={{
                          fontStyle: 'italic',
                          fontSize: 10,
                          paddingLeft: 20,
                        }}>
                        Hour Rate : {this.props.route.params.currency}
                        {parseFloat(MonthlyPrice)
                          .toFixed(2)
                          .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                      </Text>
                    )}
                  </View>
                </View>
              </FastImage>
            </TouchableOpacity>
          </Box>
        ) : rentalType == 'Property' ? (
          <Box
            style={{
              paddingBottom: 0,
              marginBottom: 0,
              paddingLeft: 0,
              paddingRight: 0,
              paddingTop: 0,
              borderRadius: 20,
              borderWidth: 1,
              width: SCREEN_WIDTH / 2 - 10,
            }}>
            <TouchableOpacity
              style={{width: SCREEN_WIDTH / 2 - 10, flex: 1}}
              onPress={() =>
                this.setState({
                  vInfo: data,
                  VisibleAddInfoP: true,
                  MonthlyPrice: data.MonthlyPrice.toString(),
                  DayPrice: data.DayPrice.toString(),
                  HourPrice: data.HourPrice.toString(),
                  WeeklyPrice: data.WeeklyPrice.toString(),
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
              <View style={{flexDirection: 'row'}}>
                <Text
                  style={{fontStyle: 'italic', fontSize: 10, paddingLeft: 20}}>
                  Location :{address}
                </Text>
              </View>

              {!StatHourPrice ? null : (
                <Text
                  style={{fontStyle: 'italic', fontSize: 10, paddingLeft: 20}}>
                  Hour Rate : {this.props.route.params.currency}
                  {parseFloat(HourPrice)
                    .toFixed(2)
                    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                </Text>
              )}

              {!StatDayPrice ? null : (
                <Text
                  style={{fontStyle: 'italic', fontSize: 10, paddingLeft: 20}}>
                  Daily Rate : {this.props.route.params.currency}
                  {parseFloat(DayPrice)
                    .toFixed(2)
                    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                </Text>
              )}
              {!StatWeeklyPrice ? null : (
                <Text
                  style={{fontStyle: 'italic', fontSize: 10, paddingLeft: 20}}>
                  Weekly Rate : {this.props.route.params.currency}
                  {parseFloat(WeeklyPrice)
                    .toFixed(2)
                    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                </Text>
              )}
              {!StatMonthlyPrice ? null : (
                <Text
                  style={{fontStyle: 'italic', fontSize: 10, paddingLeft: 20}}>
                  Hour Rate : {this.props.route.params.currency}
                  {parseFloat(MonthlyPrice)
                    .toFixed(2)
                    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                </Text>
              )}
            </TouchableOpacity>
          </Box>
        ) : rentalType == 'Hotels' ? (
          <Box
            style={{
              backgroundColor: '#fff1f3',
              paddingBottom: 0,
              marginBottom: 0,
              paddingLeft: 0,
              paddingRight: 0,
              paddingTop: 0,
              borderRadius: 20,
              borderWidth: 0.5,
              width: SCREEN_WIDTH / 2 - 10,
            }}>
            <TouchableOpacity
              style={{width: SCREEN_WIDTH / 2 - 10, flex: 1}}
              onPress={() =>
                this.props.navigation.navigate('CheckoutScreenHotels', {
                  datas: data,
                  cLat: data.slatitude,
                  cLong: data.slongitude,
                  typeOfRate: this.props.route.params.typeOfRate,
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
                <View
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.4)',
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                  }}>
                  <View style={{height: 20, flexShrink: 1}}>
                    <Text numberOfLines={1} style={styles.categoriesStoreName}>
                      {name}
                    </Text>
                  </View>
                  {!admin_control || !status ? (
                    <View style={styles.text}>
                      <Text style={styles.title}>Unavailable</Text>
                    </View>
                  ) : quantity <= 0 ? (
                    <View style={styles.text}>
                      <Text style={styles.title}>Out of Stock</Text>
                    </View>
                  ) : null}

                  <View style={{flexDirection: 'row'}}>
                    <Text
                      style={{
                        fontStyle: 'italic',
                        fontSize: 10,
                        paddingLeft: 20,
                      }}>
                      Location :{address}
                    </Text>
                  </View>
                  <View>
                    {!data.StatHourPrice3 ? null : (
                      <Text
                        style={{
                          fontStyle: 'italic',
                          fontSize: 10,
                          paddingLeft: 20,
                        }}>
                        Hour Rate : {this.props.route.params.currency}
                        {parseFloat(data.HourPrice3)
                          .toFixed(2)
                          .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                      </Text>
                    )}

                    {!data.StatHourPrice6 ? null : (
                      <Text
                        style={{
                          fontStyle: 'italic',
                          fontSize: 10,
                          paddingLeft: 20,
                        }}>
                        Hour Rate : {this.props.route.params.currency}
                        {parseFloat(data.HourPrice6)
                          .toFixed(2)
                          .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                      </Text>
                    )}

                    {!data.StatHourPrice12 ? null : (
                      <Text
                        style={{
                          fontStyle: 'italic',
                          fontSize: 10,
                          paddingLeft: 20,
                        }}>
                        Hour Rate : {this.props.route.params.currency}
                        {parseFloat(data.HourPrice12)
                          .toFixed(2)
                          .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                      </Text>
                    )}

                    {!StatHourPrice ? null : (
                      <Text
                        style={{
                          fontStyle: 'italic',
                          fontSize: 10,
                          paddingLeft: 20,
                        }}>
                        Hour Rate : {this.props.route.params.currency}
                        {parseFloat(HourPrice)
                          .toFixed(2)
                          .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                      </Text>
                    )}

                    {!StatDayPrice ? null : (
                      <Text
                        style={{
                          fontStyle: 'italic',
                          fontSize: 10,
                          paddingLeft: 20,
                        }}>
                        Daily Rate : {this.props.route.params.currency}
                        {parseFloat(DayPrice)
                          .toFixed(2)
                          .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                      </Text>
                    )}
                    {!StatWeeklyPrice ? null : (
                      <Text
                        style={{
                          fontStyle: 'italic',
                          fontSize: 10,
                          paddingLeft: 20,
                        }}>
                        Weekly Rate : {this.props.route.params.currency}
                        {parseFloat(WeeklyPrice)
                          .toFixed(2)
                          .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                      </Text>
                    )}
                    {!StatMonthlyPrice ? null : (
                      <Text
                        style={{
                          fontStyle: 'italic',
                          fontSize: 10,
                          paddingLeft: 20,
                        }}>
                        Hour Rate : {this.props.route.params.currency}
                        {parseFloat(MonthlyPrice)
                          .toFixed(2)
                          .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                      </Text>
                    )}
                  </View>
                </View>
              </FastImage>
            </TouchableOpacity>
          </Box>
        ) : rentalType == 'Vehicle' || rentalType == 'Equipment' ? (
          <Box
            style={{
              backgroundColor: '#fff1f3',
              paddingBottom: 0,
              marginBottom: 0,
              paddingLeft: 0,
              paddingRight: 0,
              paddingTop: 0,
              borderRadius: 20,
              borderWidth: 0.5,
              width: SCREEN_WIDTH / 2 - 10,
            }}>
            <TouchableOpacity
              style={{width: SCREEN_WIDTH / 2 - 10, flex: 1}}
              onPress={() =>
                this.setState({
                  vInfo: data,
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
                <View
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.4)',
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                  }}>
                  <View style={{height: 20, flexShrink: 1}}>
                    <Text numberOfLines={1} style={styles.categoriesStoreName}>
                      {name}
                    </Text>
                  </View>
                  {!admin_control || !status ? (
                    <View style={styles.text}>
                      <Text style={styles.title}>Unavailable</Text>
                    </View>
                  ) : quantity <= 0 ? (
                    <View style={styles.text}>
                      <Text style={styles.title}>Out of Stock</Text>
                    </View>
                  ) : null}

                  <Text
                    style={{
                      fontStyle: 'italic',
                      fontSize: 10,
                      paddingLeft: 20,
                    }}>
                    Brand : {brand}
                  </Text>
                  <Text
                    style={{
                      fontStyle: 'italic',
                      fontSize: 10,
                      paddingLeft: 20,
                    }}>
                    Model : {VModel}
                  </Text>
                  <Text
                    style={{
                      fontStyle: 'italic',
                      fontSize: 10,
                      paddingLeft: 20,
                    }}>
                    Color : {ColorMotor}
                  </Text>

                  <View>
                    {!StatHourPrice ? null : (
                      <Text
                        style={{
                          fontStyle: 'italic',
                          fontSize: 10,
                          paddingLeft: 20,
                        }}>
                        Hour Rate : {this.props.route.params.currency}
                        {parseFloat(HourPrice)
                          .toFixed(2)
                          .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                      </Text>
                    )}

                    {!StatDayPrice ? null : (
                      <Text
                        style={{
                          fontStyle: 'italic',
                          fontSize: 10,
                          paddingLeft: 20,
                        }}>
                        Daily Rate : {this.props.route.params.currency}
                        {parseFloat(DayPrice)
                          .toFixed(2)
                          .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                      </Text>
                    )}
                    {!StatWeeklyPrice ? null : (
                      <Text
                        style={{
                          fontStyle: 'italic',
                          fontSize: 10,
                          paddingLeft: 20,
                        }}>
                        Weekly Rate : {this.props.route.params.currency}
                        {parseFloat(WeeklyPrice)
                          .toFixed(2)
                          .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                      </Text>
                    )}
                    {!StatMonthlyPrice ? null : (
                      <Text
                        style={{
                          fontStyle: 'italic',
                          fontSize: 10,
                          paddingLeft: 20,
                        }}>
                        Hour Rate : {this.props.route.params.currency}
                        {parseFloat(MonthlyPrice)
                          .toFixed(2)
                          .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                      </Text>
                    )}
                  </View>
                </View>
              </FastImage>
            </TouchableOpacity>
          </Box>
        ) : (
          <Box
            style={{
              backgroundColor: '#fff1f3',
              paddingBottom: 0,
              marginBottom: 0,
              paddingLeft: 0,
              paddingRight: 0,
              paddingTop: 0,
              borderRadius: 20,
              borderWidth: 0.5,
              width: SCREEN_WIDTH / 2 - 10,
            }}>
            <TouchableOpacity
              style={{width: SCREEN_WIDTH / 2 - 10, flex: 1}}
              onPress={() => this.router(data)}>
              <FastImage
                style={styles.productPhoto}
                source={{
                  uri: featured_image,
                  headers: {Authorization: 'someAuthToken'},
                  priority: FastImage.priority.normal,
                }}
                resizeMode={FastImage.resizeMode.cover}>
                <View
                  style={{
                    backgroundColor: 'rgba(49,49,49, 0.8)',
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                  }}>
                  <View style={{height: 20, flexShrink: 1}}>
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: 14,
                        fontWeight: 'bold',
                        color: 'white',
                        padding: 1,
                        paddingHorizontal: 20,
                        width: SCREEN_WIDTH / 2,
                      }}>
                      {name}
                    </Text>
                  </View>
                  {!admin_control || !status ? (
                    <View style={styles.text}>
                      <Text style={styles.title}>Unavailable</Text>
                    </View>
                  ) : quantity <= 0 ? (
                    <View style={styles.text}>
                      <Text style={styles.title}>Out of Stock</Text>
                    </View>
                  ) : null}

                  {brand == '' ? null : (
                    <Text
                      style={{
                        fontStyle: 'italic',
                        color: 'white',
                        fontSize: 10,
                        paddingLeft: 20,
                      }}>
                      Brand : {brand}
                    </Text>
                  )}

                  {sale_price ? (
                    <View style={{flexDirection: 'row'}}>
                      <Text style={styles.categoriesPrice}>
                        {this.props.currency}
                        {sale_price}
                        <Text style={[styles.categoriesPrice, {fontSize: 10}]}>
                          / {unit}
                        </Text>
                      </Text>
                      <Text style={styles.categoriesPriceSale}>
                        {this.props.currency}
                        {price}
                        <Text
                          style={[styles.categoriesPriceSale, {fontSize: 10}]}>
                          / {unit}
                        </Text>
                      </Text>
                    </View>
                  ) : (
                    <View>
                      <Text style={styles.categoriesPrice}>
                        {this.props.currency}
                        {price}
                        <Text style={[styles.categoriesPrice, {fontSize: 10}]}>
                          / {unit}
                        </Text>
                      </Text>
                    </View>
                  )}
                </View>
              </FastImage>
            </TouchableOpacity>
          </Box>
        )}
      </Box>
    );
  };
  openModal() {
    this.setState({
      visibleModal: true,
    });
  }

  renderFooter = () => {
    try {
      // Check If Loading
      if (this.state.showMoreBtn) {
        return (
          <Button
            block
            success
            style={{margin: 5}}
            onPress={() => this.loadProducts(true, true)}>
            <Text>Load More</Text>
          </Button>
        );
      } else {
        return (
          <Text
            style={{
              justifyContent: 'center',
              alignSelf: 'center',
              color: '#f0ac12',
              paddingVertical: 5,
            }}>
            End of result.
          </Text>
        );
      }
    } catch (error) {
      console.log(error);
    }
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
    console.log('alpaOrder', this.state.alpaOrder);
    const {selectedFilter, activeSlide, productss} = this.state;
    return (
      <Box style={{flex: 1}}>
        <CustomHeader
          title={'Search from ' + this.state.store_name}
          fromPlace={this.props.route.params.fromPlace}
          navigation={this.props.navigation}
          currency={this.props.route.params.currency}
        />
         <StatusBar bg="#ee4e4e" barStyle="light-content" />
      <Box safeAreaTop bg="#ee4e4e" />
      <HStack bg="#ee4e4e" px="1" py="3" justifyContent="space-between" alignItems="center" w="100%" maxW={SCREEN_WIDTH}>
        <HStack alignItems="center" rounded="md" bg="white" maxW={SCREEN_WIDTH/1.4} h="38">
        
           <Input
           size="xs"
           rounded="md"
           InputLeftElement={<Fontisto
            name="search"
            size={20}
            color={'#000000'}
            onPress={() => {
              this.state.selectedFilterBy == ''
                ? this.loadProducts()
                : this.searchFilterFunction();
            }}
            style={{paddingLeft:10}}
          />}
              placeholder="Search..."
              onChangeText={text => this.setState({searchText: text})}
              onSubmitEditing={() => {
                this.state.selectedFilterBy == ''
                  ? this.loadProducts()
                  : this.searchFilterFunction();
              }}
              style={{top:5}}
            />
{this.state.PriceOrder == false ? (
              <TouchableOpacity
                style={{flexDirection: 'row'}}
                onPress={() => {
                  this.setState({
                    PriceOrder: !this.state.PriceOrder,
                    selectedFilter:
                      this.state.PriceOrder == true
                        ? 'Price-Ascending'
                        : 'Price-Descending',
                  });
                  this.loadProducts();
                }}>
                <Fontisto
                  name="arrow-swap"
                  size={20}
                  color={'#FFFFFF'}
                  onPress={() => {
                    this.setState({
                      PriceOrder: !this.state.PriceOrder,
                      selectedFilter:
                        this.state.PriceOrder == true
                          ? 'Price-Ascending'
                          : 'Price-Descending',
                    });
                  }}
                  style={{transform: [{rotate: '90deg'}, {rotateY: '180deg'}]}}
                />
                <View style={{flexDirection: 'column'}}>
                  <Text style={{fontSize: 9, color: 'white'}}>9</Text>
                  <Text style={{fontSize: 9, color: 'white'}}>0</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={{flexDirection: 'row'}}
                onPress={() => {
                  this.setState({
                    PriceOrder: !this.state.PriceOrder,
                    selectedFilter:
                      this.state.PriceOrder == true
                        ? 'Price-Ascending'
                        : 'Price-Descending',
                  });
                  this.loadProducts();
                }}>
                <Fontisto
                  name="arrow-swap"
                  size={20}
                  color={'#FFFFFF'}
                  onPress={() => {
                    this.setState({
                      PriceOrder: !this.state.PriceOrder,
                      selectedFilter:
                        this.state.PriceOrder == true
                          ? 'Price-Ascending'
                          : 'Price-Descending',
                    });
                  }}
                  style={{transform: [{rotate: '90deg'}]}}
                />
                <View style={{flexDirection: 'column'}}>
                  <Text style={{fontSize: 9, color: 'white'}}>0</Text>
                  <Text style={{fontSize: 9, color: 'white'}}>9</Text>
                </View>
              </TouchableOpacity>
            )}
            {this.state.alpaOrder == false ? (
              <TouchableOpacity
                style={{flexDirection: 'row'}}
                onPress={() => {
                  this.setState({
                    alpaOrder: !this.state.alpaOrder,
                    selectedFilter:
                      this.state.alpaOrder == true
                        ? 'Alphabetical-(A-Z)'
                        : 'Alphabetical-(Z-A)',
                  });
                  this.loadProducts();
                }}>
                <Fontisto
                  name="arrow-swap"
                  size={20}
                  color={'#FFFFFF'}
                  onPress={() => {
                    this.setState({
                      alpaOrder: !this.state.alpaOrder,
                      selectedFilter:
                        this.state.alpaOrder == true
                          ? 'Alphabetical-(A-Z)'
                          : 'Alphabetical-(Z-A)',
                    });
                    this.loadProducts();
                  }}
                  style={{
                    transform: [{rotate: '90deg'}, {rotateY: '180deg'}],
                    marginLeft: 10,
                  }}
                />
                <View style={{flexDirection: 'column'}}>
                  <Text style={{fontSize: 9, color: 'white'}}>Z</Text>
                  <Text style={{fontSize: 9, color: 'white'}}>A</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={{flexDirection: 'row'}}
                onPress={() => {
                  this.setState({
                    alpaOrder: !this.state.alpaOrder,
                    selectedFilter:
                      this.state.alpaOrder == true
                        ? 'Alphabetical-(A-Z)'
                        : 'Alphabetical-(Z-A)',
                  });
                  this.loadProducts();
                }}>
                <Fontisto
                  name="arrow-swap"
                  size={20}
                  color={'#FFFFFF'}
                  onPress={() => {
                    this.setState({
                      alpaOrder: !this.state.alpaOrder,
                      selectedFilter:
                        this.state.alpaOrder == true
                          ? 'Alphabetical-(A-Z)'
                          : 'Alphabetical-(Z-A)',
                    });
                    this.loadProducts();
                  }}
                  style={{transform: [{rotate: '90deg'}], marginLeft: 15}}
                />
                <View style={{flexDirection: 'column'}}>
                  <Text style={{fontSize: 9, color: 'white'}}>A</Text>
                  <Text style={{fontSize: 9, color: 'white'}}>Z</Text>
                </View>
              </TouchableOpacity>
            )}

<TouchableOpacity
              style={{flexDirection: 'column'}}
              onPress={() => {
                this.setState({visibleModal: !this.state.visibleModal});
              }}>
              <FontAwesome
                name="sliders"
                size={20}
                color={'#FFFFFF'}
                onPress={() => {
                  this.setState({visibleModal: !this.state.visibleModal});
                }}
                style={{marginLeft: 10}}
              />
            </TouchableOpacity>
        </HStack>
        <HStack>


        </HStack>
      </HStack>
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
            <Text
              style={{
                justifyContent: 'center',
                textAlign: 'center',
                paddingVertical: 10,
                color: '#019fe8',
                fontWeight: 'bold',
              }}>
              Price Range
            </Text>
            <Divider />
            <View style={{flexDirection: 'row'}}>
              <Text style={{color: 'gray', fontWeight: 'bold', fontSize: 13}}>
                {parseFloat(this.state.SliderminimumValue[0])
                  .toFixed(2)
                  .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
                  .toString()}
              </Text>
              <Text
                style={{
                  position: 'absolute',
                  right: 0,
                  color: 'gray',
                  fontWeight: 'bold',
                  fontSize: 13,
                }}>
                {parseFloat(this.state.SliderminimumValue[1])
                  .toFixed(2)
                  .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
                  .toString()}
              </Text>
            </View>
            <MultiSlider
              markerStyle={{
                ...Platform.select({
                  ios: {
                    height: 30,
                    width: 30,
                    shadowColor: '#000000',
                    shadowOffset: {
                      width: 0,
                      height: 3,
                    },
                    shadowRadius: 1,
                    shadowOpacity: 0.1,
                  },
                  android: {
                    height: 30,
                    width: 30,
                    borderRadius: 50,
                    backgroundColor: '#1792E8',
                  },
                }),
              }}
              pressedMarkerStyle={{
                ...Platform.select({
                  android: {
                    height: 30,
                    width: 30,
                    borderRadius: 20,
                    backgroundColor: '#148ADC',
                  },
                }),
              }}
              selectedStyle={{
                backgroundColor: '#1792E8',
              }}
              trackStyle={{
                backgroundColor: '#CECECE',
              }}
              touchDimensions={{
                height: 40,
                width: 40,
                borderRadius: 20,
                slipDisplacement: 40,
              }}
              values={this.state.SliderminimumValue}
              sliderLength={SCREEN_WIDTH - 70}
              onValuesChange={values => {
                this.setState({
                  SliderminimumValue: values,
                  selectedFilter: 'PriceRange',
                });
              }}
              min={0}
              max={this.state.SlidermaximumValue}
              allowOverlap={false}
              minMarkerOverlapDistance={10}
            />
            <View style={{flexDirection: 'row'}}>
              <RadioButton
                value="ByProductSearch"
                status={
                  this.state.selectedFilterBy === 'ByProductSearch'
                    ? 'checked'
                    : 'unchecked'
                }
                onPress={() => {
                  this.setState({selectedFilterBy: 'ByProductSearch'});
                }}
              />
              <Text style={{padding: 5}}>Search by Product (Default)</Text>
            </View>
            <View style={{flexDirection: 'row'}}>
              <RadioButton
                value="ByStoreSearch"
                status={
                  this.state.selectedFilterBy === 'ByStoreSearch'
                    ? 'checked'
                    : 'unchecked'
                }
                onPress={() => {
                  this.setState({selectedFilterBy: 'ByStoreSearch'});
                }}
              />
              <Text style={{padding: 5}}>Search by Store</Text>
            </View>

            <Button
              bordered
              block
              style={{
                marginVertical: 10,
                justifyContent: 'center',
                textAlign: 'center',
                borderColor: '#019fe8',
              }}
              onPress={() => this.loadProducts()}>
              <Text style={{color: 'white'}}>Done</Text>
            </Button>
          </View>
        </Modal>
        <Loader loading={this.state.loading} trans={trans} />
        {this.searchFilterFunction &&
        this.state.selectedFilterBy == 'ByProductSearch' ? (
          <RecyclerListView
            style={{flex: 1, marginHorizontal: 5, marginTop:10}}
            rowRenderer={this.rowRenderer}
            dataProvider={this.state.dataProvider}
            layoutProvider={this.state.layoutProvider}
            renderFooter={this.renderFooter}
          />
        ) : (
          <FlatList
            data={this.state.dataSource}
            renderItem={({item}) => (
              <Box
                style={{
                  marginTop: 10,
                  width: SCREEN_WIDTH - 30,
                  alignSelf: 'center',
                }}>
                <StoreCard
                  product={item}
                  navigation={this.props.navigation}
                  typeOfRate={this.props.route.params.typeOfRate}
                  fromPlace={this.props.route.params.fromPlace}
                  currency={this.props.route.params.currency}
                />
              </Box>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        )}
     
        <Modal
          isVisible={this.state.VisibleAddInfoSErvice}
          animationInTiming={700}
          animationIn="slideInUp"
          animationOut="slideOutDown"
          animationOutTiming={700}
          useNativeDriver={true}
          onBackdropPress={() => this.setState({VisibleAddInfoSErvice: false})}
          transparent={true}>
          <Box
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
                data={this.state.vInfo.imageArray.filter(items => {
                  const itemData = items;
                  const textData = 'AddImage';

                  return itemData.indexOf(textData) == -1;
                })}
                // staticDimension={300}
                // fixed
                spacing={10}
                renderItem={({item}) => (
                  <Image
                    style={{
                      width: 160,
                      height: 160,
                      resizeMode: 'contain',
                      margin: 10,
                    }}
                    source={{uri: item}}
                  />
                )}
              />

              <Text style={{marginTop: 15, fontSize: 10}}>Label</Text>
              <Stack regular style={{marginTop: 7}}>
                <Input
                  placeholder={this.state.vInfo.name}
                  value={this.state.vInfo.name}
                  placeholderTextColor="#687373"
                />
              </Stack>
              <Text style={{marginTop: 15, fontSize: 10}}>Description</Text>
              <Stack regular style={{marginTop: 7}}>
                <Input
                  value={this.state.vInfo.description}
                  placeholderTextColor="#687373"
                />
              </Stack>

              <Text style={{marginTop: 15, fontSize: 10}}>Ameneties</Text>
              <Stack regular style={{marginTop: 7}}>
                <Input
                  value={this.state.vInfo.ameneties}
                  placeholderTextColor="#687373"
                />
              </Stack>
            </ScrollView>

            <Button
              block
              style={{height: 30, backgroundColor: '#33c37d', marginTop: 10}}
              onPress={() =>
                this.props.navigation.navigate('CheckoutScreenService', {
                  datas: this.state.vInfo,
                  cLat: this.state.vInfo.slatitude,
                  cLong: this.state.vInfo.slongitude,
                  selectedCityUser:
                    this.props.selectedCityUser == null
                      ? this.state.City
                      : this.props.selectedCityUser,
                })
              }>
              <Text style={{color: 'white'}}>Procceed</Text>
            </Button>
          </Box>
        </Modal>
        <Modal
          isVisible={this.state.VisibleAddInfo}
          animationInTiming={700}
          animationIn="slideInUp"
          animationOut="slideOutDown"
          animationOutTiming={700}
          useNativeDriver={true}
          onBackdropPress={() => this.setState({VisibleAddInfo: false})}
          transparent={true}>
          <Box
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
                data={this.state.vInfo.imageArray.filter(items => {
                  const itemData = items;
                  const textData = 'AddImage';

                  return itemData.indexOf(textData) == -1;
                })}
                // staticDimension={300}
                // fixed
                spacing={10}
                renderItem={({item}) => (
                  <Image
                    style={{
                      width: 160,
                      height: 160,
                      resizeMode: 'contain',
                      margin: 10,
                    }}
                    source={{uri: item}}
                  />
                )}
              />

              <Text style={{marginTop: 15, fontSize: 10}}>Label</Text>
              <Stack regular style={{marginTop: 7}}>
                <Input
                  placeholder={this.state.vInfo.name}
                  value={this.state.vInfo.name}
                  placeholderTextColor="#687373"
                />
              </Stack>
              <Text style={{marginTop: 15, fontSize: 10}}>Location</Text>
              <Stack regular style={{marginTop: 7}}>
                <Input
                  placeholder={this.state.vInfo.address}
                  value={this.state.vInfo.address}
                  placeholderTextColor="#687373"
                />
              </Stack>

              <Text style={{marginTop: 15, fontSize: 10}}>
                Detailed Address
              </Text>
              <Stack regular style={{marginTop: 7}}>
                <Input
                  value={this.state.vInfo.DetailedAddress}
                  placeholderTextColor="#687373"
                />
              </Stack>
              <Text style={{marginTop: 15, fontSize: 10}}>Description</Text>
              <Stack regular style={{marginTop: 7}}>
                <Input
                  value={this.state.vInfo.description}
                  placeholderTextColor="#687373"
                />
              </Stack>

              <Text style={{marginTop: 15, fontSize: 10}}>Ameneties</Text>
              <Stack regular style={{marginTop: 7}}>
                <Input
                  value={this.state.vInfo.ameneties}
                  placeholderTextColor="#687373"
                />
              </Stack>
            </ScrollView>

            <Button
              block
              style={{height: 30, backgroundColor: '#33c37d', marginTop: 10}}
              onPress={() => {
                this.state.vInfo.rentalType == 'Equipment'
                  ? this.props.navigation.navigate('CheckoutScreenEquipment', {
                      datas: this.state.vInfo,
                      typeOfRate: this.props.route.params.typeOfRate,
                      cLat: this.state.vInfo.slatitude,
                      cLong: this.state.vInfo.slongitude,
                    })
                  : this.props.navigation.navigate('CheckoutScreenRentals', {
                      datas: this.state.vInfo,
                      cLat: this.state.vInfo.slatitude,
                      cLong: this.state.vInfo.slongitude,
                    });
              }}>
              <Text style={{color: 'white'}}>Procceed</Text>
            </Button>
          </Box>
        </Modal>

        <Modal
          isVisible={this.state.VisibleAddInfoP}
          animationInTiming={700}
          animationIn="slideInUp"
          animationOut="slideOutDown"
          animationOutTiming={700}
          useNativeDriver={true}
          onBackdropPress={() => this.setState({VisibleAddInfoP: false})}
          transparent={true}>
          <Box
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
                data={this.state.vInfo.imageArray.filter(items => {
                  const itemData = items;
                  const textData = 'AddImage';

                  return itemData.indexOf(textData) == -1;
                })}
                // staticDimension={300}
                // fixed
                spacing={10}
                renderItem={({item}) => (
                  <Image
                    style={{
                      width: 160,
                      height: 160,
                      resizeMode: 'contain',
                      margin: 10,
                    }}
                    source={{uri: item}}
                  />
                )}
              />

              <Text style={{marginTop: 15, fontSize: 10}}>Label</Text>
              <Stack regular style={{marginTop: 7}}>
                <Input
                  placeholder={this.state.vInfo.name}
                  value={this.state.vInfo.name}
                  placeholderTextColor="#687373"
                />
              </Stack>
              <Text style={{marginTop: 15, fontSize: 10}}>Location</Text>
              <Stack regular style={{marginTop: 7}}>
                <Input
                  placeholder={this.state.vInfo.address}
                  value={this.state.vInfo.address}
                  placeholderTextColor="#687373"
                />
              </Stack>

              <Text style={{marginTop: 15, fontSize: 10}}>
                Detailed Address
              </Text>
              <Stack regular style={{marginTop: 7}}>
                <Input
                  value={this.state.vInfo.DetailedAddress}
                  placeholderTextColor="#687373"
                />
              </Stack>
              <Text style={{marginTop: 15, fontSize: 10}}>Description</Text>
              <Stack regular style={{marginTop: 7}}>
                <Input
                  value={this.state.vInfo.description}
                  placeholderTextColor="#687373"
                />
              </Stack>

              <Text style={{marginTop: 15, fontSize: 10}}>Ameneties</Text>
              <Stack regular style={{marginTop: 7}}>
                <Input
                  value={this.state.vInfo.ameneties}
                  placeholderTextColor="#687373"
                />
              </Stack>
            </ScrollView>

            <Button
              block
              style={{height: 30, backgroundColor: '#33c37d', marginTop: 10}}
              onPress={() =>
                this.props.navigation.navigate('CheckoutScreenRentals', {
                  datas: this.state.vInfo,
                  cLat: this.state.vInfo.slatitude,
                  cLong: this.state.vInfo.slongitude,
                })
              }>
              <Text style={{color: 'white'}}>Procceed</Text>
            </Button>
          </Box>
        </Modal>
        <Modal
          isVisible={this.state.isVisibleAddons}
          onBackButtonPress={() => this.setState({isVisibleAddons: false})}
          animationInTiming={500}
          animationOutTiming={500}
          useNativeDriver={true}
          animationIn="slideInRight"
          animationOut="slideOutRight"
          style={style.modal}>
          <ScrollView style={styles.container}>
            <View style={styles.carouselContainer}>
              <View style={[styles.carousel, {height: 200}]}>
                <Carousel
                  ref={c => {
                    this.slider1Ref = c;
                  }}
                  data={this.state.image}
                  renderItem={this.renderImage}
                  sliderWidth={SCREEN_WIDTH}
                  itemWidth={SCREEN_WIDTH}
                  inactiveSlideScale={1}
                  inactiveSlideOpacity={1}
                  firstItem={0}
                  loop={false}
                  autoplay={false}
                  autoplayDelay={500}
                  autoplayInterval={3000}
                  onSnapToItem={index => this.setState({activeSlide: index})}
                />
                <Pagination
                  dotsLength={this.state.image.length}
                  activeDotIndex={activeSlide}
                  containerStyle={styles.paginationContainer}
                  dotColor="rgba(255, 255, 255, 0.92)"
                  dotStyle={styles.paginationDot}
                  inactiveDotColor="white"
                  inactiveDotOpacity={0.4}
                  inactiveDotScale={0.6}
                  carouselRef={this.slider1Ref}
                  tappableDots={!!this.slider1Ref}
                />
              </View>
            </View>
            <View>
              <View style={{flexDirection: 'row', width: SCREEN_WIDTH}}>
                <Text style={styles.infoRecipeName}>{this.state.name}</Text>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: 'bold',
                    position: 'absolute',
                    right: 20,
                    top: 10,
                  }}>
                  {this.props.route.params.currency} {this.state.price}
                </Text>
              </View>
              <View style={{flex: 1, padding: 10, backgroundColor: 'white'}}>
                {productss.map((object, d) => (
                  <View key={d}>
                    <Divider style={{height: 1}} />
                    <Text
                      style={{
                        fontSize: 15,
                        marginVertical: 2,
                        fontWeight: 'bold',
                        marginLeft: 10,
                      }}>
                      {object.title}
                    </Text>
                    <Text
                      style={{fontSize: 12, marginVertical: 2, marginLeft: 10}}>
                      (
                      {object.mode == 'single'
                        ? 'Select one'
                        : 'Select up to 2'}
                      )
                    </Text>
                    {object.data.map((drink, i) => (
                      <View key={i}>
                        {object.mode == 'single' ? (
                          <Box
                            style={{flexDirection: 'row', flex: 1}}
                            button
                            onPress={() => this.checkDrink(drink, object.data)}>
                            <View style={{justifyContent: 'flex-start'}}>
                              <RadioButton
                                value={drink.price}
                                status={drink.isChecked}
                                onPress={() =>
                                  this.checkDrink(drink, object.data)
                                }
                              />
                            </View>
                            <View
                              style={{justifyContent: 'flex-start', flex: 5}}>
                              <Text style={{fontSize: 12, marginTop:10}}>{drink.label}</Text>
                            </View>
                            <View style={{justifyContent: 'flex-end', flex: 1, bottom:10}}>
                              <Text style={{fontSize: 13}}>
                                {this.props.route.params.currency}
                                {drink.price}
                              </Text>
                            </View>
                          </Box>
                        ) : (
                          <Box
                            style={{flexDirection: 'row', flex: 1}}
                            button
                            onPress={() => {
                              drink.isChecked == 'checked'
                                ? this.checkDrinkmunchecked(drink, object.data)
                                : this.checkDrinkm(drink, object.data);
                            }}>
                            <View style={{justifyContent: 'flex-start'}}>
                              <Checkbox
                                value={drink.price}
                                status={drink.isChecked}
                                onPress={() => {
                                  drink.isChecked == 'checked'
                                    ? this.checkDrinkmunchecked(
                                        drink,
                                        object.data,
                                      )
                                    : this.checkDrinkm(drink, object.data);
                                }}
                              />
                            </View>
                            <View
                              style={{justifyContent: 'flex-start', flex: 5}}>
                              <Text style={{fontSize: 12, marginTop:10}}>{drink.label}</Text>
                            </View>
                            <View style={{justifyContent: 'flex-end', flex: 1, bottom:10}}>
                              <Text style={{fontSize: 13}}>
                                {this.props.route.params.currency}
                                {drink.price}
                              </Text>
                            </View>
                          </Box>
                        )}
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
          <Box
            style={{flexDirection: 'row', justifyContent: 'space-around'}}>
            <Box
              style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
              <Pressable
                onPress={() => {
                  this.state.count < 2 ? null : this._decrementCount();
                }}
                style={{
                  backgroundColor: this.state.count < 2 ? 'gray' : '#019fe8',
                  borderRadius: 30,
                }}>
                <AntDesign
                  name="minus"
                  size={25}
                  color={'white'}
                  style={{textAlign: 'center', padding: 10}}
                />
              </Pressable>
              <Button bg="white">
                <Text
                  style={{fontSize: 25, textAlign: 'center', color: 'black'}}>
                  {this.state.count}
                </Text>
              </Button>
              <Pressable
                onPress={() => this._incrementCount()}
                style={{backgroundColor: '#019fe8', borderRadius: 30}}>
                <AntDesign
                  name="plus"
                  size={25}
                  color={'white'}
                  style={{textAlign: 'center', padding: 10}}
                />
              </Pressable>
            </Box>
            <Box>
              <Button
                block
                style={{backgroundColor: '#019fe8', borderRadius: 10, color:'white'}}
                onPress={() => this.addonsAddtoCart(this.state.addonss)}>
                <Text>Add to Cart</Text>
              </Button>
            </Box>
          </Box>
          <TouchableHighlight
            onPress={() => this.setState({isVisibleAddons: false})}
            style={styles.btnContainer}>
            <AntDesign name="closecircleo" size={20} color={'#019fe8'} />
          </TouchableHighlight>
        </Modal>
      </Box>
    );
  }
}

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
  modal: {
    backgroundColor: 'white',
    margin: 0, // This is the important style you need to set
    alignItems: undefined,
    justifyContent: undefined,
  },
  drinkCard: {
    paddingLeft: 2,
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 5,
    backgroundColor: 'white',
    height: 40,
  },
});
