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
  Input,
  
  Box,
  HStack ,
  Stack,
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
import Carousel, {Pagination} from 'react-native-snap-carousel';
import AntDesign from 'react-native-vector-icons/AntDesign';
import styles from './styles';
import Modal from 'react-native-modal';
import {RadioButton, Divider} from 'react-native-paper';
import Loader from './Loader';
import {FlatGrid} from 'react-native-super-grid';
import {TaxiLayoutUtil} from './TaxiLayoutUtil';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import Swiper from 'react-native-swiper';
import moment from 'moment';

export default class SearchTaxi extends Component {
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
      layoutProvider: TaxiLayoutUtil.getLayoutProvider(0),
      City: this.props.route.params.selectedCityUser,
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
    };

    this.arrayholder = [];
  }

  _incrementCount = () => {
    this.setState(prevState => ({count: prevState.count + 1}));
  };

  _decrementCount = () => {
    this.setState(prevState => ({count: prevState.count - 1}));
  };

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
    return choice;
  };

  async addonsdeleteCart(item) {
    const userId = auth().currentUser.uid;
    AsyncStorage.setItem('cluster', item.cluster);
    firestore()
      .collection('cart')
      .doc(userId)
      .delete()
      .catch(function (error) {
        console.log('Error deleting documents: ', error);
      });
    let name = item.name.concat(' Added to Cart');
    let newItem = {
      id: item.id,
      store_name: item.store_name,
      notification_token: this.state.token,
      slongitude: item.slongitude,
      slatitude: item.slatitude,
      total_addons: this.getAddonsTotal(),
      note: '',
      cluster: item.cluster,
      choice: this.getAddonsDefault(),
      qty: this.state.count,
      adminID: item.adminID,
    };
    let cartRef = firestore().collection('cart');
    let updatedCart = [];
    /* Push new cart item */
    updatedCart.push(newItem);
    cartRef.doc(userId).set(Object.assign({}, updatedCart));

    this.setState({
      isVisibleAddons: false,
      productss: [],
      count: 1,
      choice: [],
    });
  }

  async addonsAddtoCart(item) {
    const {cart} = this.state;
    const userId = auth().currentUser.uid;
    if (userId) {
      let id = item.id;
      let cluster = item.cluster;
      let cluster_is_existing =
        Object.keys(cart).length &&
        Object.values(cart).find(item => cluster === item.cluster);
      if (cluster_is_existing == 0 || cluster_is_existing) {
        let newItem = {
          id: item.id,
          store_name: this.state.store_name,
          notification_token: this.state.token,
          slongitude: item.slongitude,
          slatitude: item.slatitude,
          total_addons: this.getAddonsTotal(),
          note: '',
          qty: 1,
          cluster: item.cluster,
          choice: this.getAddonsDefault(),
          qty: this.state.count,
          adminID: item.adminID,
        };
        let updatedCart = Object.values(cart); /* Clone it first */
        let cartRef = firestore().collection('cart');

        /* Push new cart item */
        updatedCart.push(newItem);

        /* Set updated cart in firebase, no need to use setState because we already have a realtime cart listener in the componentDidMount() */
        cartRef
          .doc(userId)
          .set(Object.assign({}, updatedCart))
          .then(() => {});

        this.setState({
          isVisibleAddons: false,
          productss: [],
          count: 1,
          choice: [],
        });
      } else {
        Alert.alert(
          'Discard Changes?',
          'This product belongs to other store, adding this product will delete the items in your cart.',
          [
            {
              text: 'Cancel',
              onPress: () => console.log('Cancel Pressed'),
              style: 'cancel',
            },
            {text: 'OK', onPress: () => this.addonsdeleteCart(item)},
          ],
          {cancelable: false},
        );
      }
    } else {
      this.setState({
        isVisibleAddons: false,
        productss: [],
        count: 1,
        choice: [],
      });
      this.props.navigation.navigate('Auth');
    }
  }

  renderImage = ({item}) => (
    <TouchableHighlight>
      <View style={styles.imageContainer}>
        <Image style={styles.image} source={{uri: item}} />
      </View>
    </TouchableHighlight>
  );

  async deleteCart(item) {
    const userId = auth().currentUser.uid;
    AsyncStorage.setItem('cluster', item.cluster);
    firestore()
      .collection('cart')
      .doc(userId)
      .delete()
      .catch(function (error) {
        console.log('Error deleting documents: ', error);
      });
    let name = item.name.concat(' Added to Cart');
    let newItem = {
      id: item.id,
      store_name: this.state.store_name,
      notification_token: this.state.token,
      slongitude: item.slongitude,
      slatitude: item.slatitude,
      note: '',
      qty: 1,
      adminID: item.adminID,
      cluster: item.cluster,
    };
    let cartRef = firestore().collection('cart');
    let updatedCart = [];
    /* Push new cart item */
    updatedCart.push(newItem);
    cartRef.doc(userId).set(Object.assign({}, updatedCart));
  }

  async onAddToCart(item) {
    const {cart} = this.state;
    const userId = auth().currentUser.uid;
    if (userId) {
      let id = item.id;
      let cluster = item.cluster;

      let cluster_is_existing =
        Object.keys(cart).length &&
        Object.values(cart).find(item => cluster === item.cluster);
      if (cluster_is_existing == 0 || cluster_is_existing) {
        let is_existing =
          Object.keys(cart).length &&
          Object.values(cart).find(
            item => id === item.id,
          ); /* Check if item already exists in cart from state */
        if (!is_existing) {
          let newItem = {
            id: item.id,
            store_name: this.state.store_name,
            notification_token: this.state.token,
            slongitude: item.slongitude,
            slatitude: item.slatitude,
            note: '',
            qty: 1,
            adminID: item.adminID,
            cluster: item.cluster,
          };
          let updatedCart = Object.values(cart); /* Clone it first */
          let cartRef = firestore().collection('cart');

          /* Push new cart item */
          updatedCart.push(newItem);

          /* Set updated cart in firebase, no need to use setState because we already have a realtime cart listener in the componentDidMount() */
          cartRef.doc(userId).set(Object.assign({}, updatedCart));
        } else {
          let product =
            Object.keys(cart).length &&
            Object.values(cart).find(
              item => id === item.id,
            ); /* Check if item exists in cart from state */

          if (product) {
            if (product.qty >= item.quantity) {
              /* Do not allow save if user is trying to checkout more than what is available on stock */
            } else if (product.qty <= item.quantity) {
              let cartRef = firestore().collection('cart');

              /* Get current cart contents */
              cartRef
                .doc(userId)
                .get()
                .then(snapshot => {
                  let updatedCart = Object.values(
                    snapshot.data(),
                  ); /* Clone it first */
                  let itemIndex = updatedCart.findIndex(
                    item => id === item.id,
                  ); /* Get the index of the item we want to delete */

                  /* Set item quantity */
                  updatedCart[itemIndex]['qty'] =
                    updatedCart[itemIndex]['qty'] + 1;

                  /* Set updated cart in firebase, no need to use setState because we already have a realtime cart listener in the componentDidMount() */
                  cartRef.doc(userId).set(Object.assign({}, updatedCart));
                });
            }
          }
        }
      } else {
        Alert.alert(
          'Discard Changes?',
          'This product belongs to other store, adding this product will delete the items in your cart.',
          [
            {
              text: 'Cancel',
              onPress: () => console.log('Cancel Pressed'),
              style: 'cancel',
            },
            {text: 'OK', onPress: () => this.deleteCart(item)},
          ],
          {cancelable: false},
        );
      }
    } else {
      this.props.navigation.navigate('Login');
    }
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

    const userId = auth().currentUser.uid;
    this.setState({loading: true, userId});
    firestore()
      .collection('users')
      .where('userId', '==', userId)
      .onSnapshot(
        querySnapshot => {
          querySnapshot.forEach(doc => {
            this.setState({customerInfo: doc.data()});
            console.log('customerInfo ', doc.data());
          });
        },
        error => {
          //   console.log(error)
        },
      );
    //firestore().collection('products').where('city', '==', this.state.City.trim()).where('admin_control', '==', true).where('status', '==', true).onSnapshot(this.onCollectionUpdate);
    this.loadProducts(false, true);

    if (userId) {
      /* Listen to realtime cart changes */
      this.unsubscribeCartItems = firestore()
        .collection('cart')
        .doc(userId)
        .onSnapshot(snapshotCart => {
          if (snapshotCart.data()) {
            this.setState({cart: snapshotCart.data()});
          } else {
            this.setState({cart: []});
          }
        });
    }
  }

  loadProducts(loadmore, fromComponent) {
    const self = this;
    const NewCityItem = this.props.route.params.selectedCityUser.trim();

    const newUserLocationCountry =
      this.props.route.params.country.trim() == 'Philippines'
        ? 'city'
        : this.props.route.params.country.trim() + '.city';
    console.log('newUserLocationCountry: ', newUserLocationCountry);

    var productQuery = firestore()
      .collection(newUserLocationCountry)
      .doc(NewCityItem)
      .collection('vehicles')
      .where('vehicle', '!=', '');
    productQuery =
      this.state.searchText === ''
        ? productQuery
        : productQuery.where('keywords', 'array-contains-any', [
            this.state.searchText.toLowerCase(),
          ]);

    if (this.state.searchEnabled) {
      /* If request is from a search (onChangeSearch();), we clear out the product list then load the new search results */
      /* We identify weather the trigger is from a search or a load more button click using "searchEnabled" state */
      this.setState({
        products: [],
        searchEnabled: false,
      });
    }
    console.log('selectedFilter: ', this.state.selectedFilter);

    switch (this.state.selectedFilter) {
      case 'Alphabetical-(A-Z)':
        productQuery = productQuery.orderBy('vehicle', 'asc');
        break;
      case 'Alphabetical-(Z-A)':
        productQuery = productQuery.orderBy('vehicle', 'desc');
        break;

      default:
        productQuery = productQuery.orderBy('vehicle', 'asc');
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
        if (change.type === 'added') {
          /* Add more items to the screen...   const itemData = items.ProductType;
        const textData = 'Transport';*/
          productChunk.push({...change.doc.data(), pid: change.doc.id});
        } else if (change.type === 'modified') {
          /* If there is a change in realtime... */
          /* Apply the modification to the item directly without changing the current item index. */
          self.setState({
            products: self.state.products.map(el =>
              el.pid === change.doc.id
                ? {...change.doc.data(), pid: change.doc.id}
                : el,
            ),
          });
        } else if (change.type === 'removed') {
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
      });
      console.log(
        'productChunk rentals :',
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
    this.appStateSubscription.remove();
  }

  searchFilterFunction = async () => {
    this.setState({loading: true});
    console.log('CIty: ', this.state.City);
    console.log('searchText: ', this.state.searchText);
    const userId = auth().currentUser.uid;
    firestore()
      .collection('products')
      .where('keywords', 'array-contains-any', [this.state.searchText])
      .where('admin_control', '==', true)
      .where('city', '==', this.state.City.trim())
      .onSnapshot(querySnapshot => {
        const products = [];
        console.log('working here');
        console.log('querySnapshot: ', querySnapshot);
        querySnapshot.forEach(doc => {
          console.log('search: ', doc.data());
          products.push({
            datas: doc.data(),
            key: doc.id,
          });
        });
        this.setState({
          data: products
            .sort((a, b) => Number(b.datas.arrange) - Number(a.datas.arrange))
            .filter(items => {
              const itemData = items.datas.ProductType;
              const textData = 'Transport';
              return itemData.indexOf(textData) == -1;
            }),
          loading: false,
        });
      });

    if (userId) {
      /* Listen to realtime cart changes */
      this.unsubscribeCartItems = firestore()
        .collection('cart')
        .doc(userId)
        .onSnapshot(snapshotCart => {
          if (snapshotCart.data()) {
            this.setState({cart: snapshotCart.data()});
          } else {
            this.setState({cart: []});
          }
        });
    }

    /*

      const newData = this.arrayholder.filter(item => {      
        const itemData = `${item.datas.name.toUpperCase()}   
         ${item.datas.brand.toUpperCase()}`;
        
         const textData = text.toUpperCase();
          
         return itemData.indexOf(textData) > -1;
      });
      if(text == ""){
        this.setState({ data: [] }); 
      }else{
        this.setState({ data: newData }); 
      }
      */
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

  addToFavHotel(id) {
    const uid = auth().currentUser.uid;
    this.setState({loading: true});
    const updateRef = firestore().collection('users').doc(uid);
    updateRef
      .update({
        HotelFav: firestore.FieldValue.arrayUnion(id),
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

  removeFavHotel(id) {
    const uid = auth().currentUser.uid;
    this.setState({loading: true});
    const updateRef = firestore().collection('users').doc(uid);
    updateRef
      .update({
        HotelFav: firestore.FieldValue.arrayRemove(id),
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

  addToFav(id) {
    const uid = auth().currentUser.uid;
    this.setState({loading: true});
    const updateRef = firestore().collection('users').doc(uid);
    updateRef
      .update({
        RentalPropFav: firestore.FieldValue.arrayUnion(id),
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
        RentalPropFav: firestore.FieldValue.arrayRemove(id),
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

  rowRenderer = (type, data) => {
    const {
      name,
      quantity,
      image,
      unit,
      vehicle,
      id,
      base,
      base_fare,
      City,
      Metro,
      succeed,
      ColorMotor,
      brand,
      store_name,
    } = data;

    return (
      <Box
        transparent
        style={{flex: 1, justifyContent: 'center', alignContent: 'center'}}>
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
            backgroundColor: '#333333',
          }}>
          <TouchableOpacity
            style={{width: SCREEN_WIDTH / 2 - 10, flex: 1}}
            onPress={() => {
              this.state.userId == null
                ? this.props.navigation.navigate('Login')
                : this.props.route.params.cLat == null
                ? Alert.alert('Enable Location')
                : this.props.navigation.navigate('CheckoutTransport', {
                    datas: data,
                    cLat: this.props.route.params.cLat,
                    cLong: this.props.route.params.cLong,
                    typeOfRate: this.props.route.params.typeOfRate,
                    selectedCityUser: this.props.route.params.selectedCityUser,
                    fromPlace: this.props.route.params.fromPlace,
                    UserLocationCountry: this.props.route.params.country,
                    currency: this.props.route.params.currency,
                    code: this.props.route.params.code,
                    cityLat: this.props.route.params.cityLat,
                    cityLong: this.props.route.params.cityLong,
                  });
            }}>
            {image.map((itembann, index) => {
              return itembann == 'AddImage' ? null : (
                <Image
                  style={style.productPhoto}
                  resizeMode="cover"
                  source={{uri: itembann}}
                  key={index}
                />
              );
            })}
            <View style={{height: 20, flexShrink: 1, marginBottom: 5}}>
              <Text
                numberOfLines={1}
                style={[
                  styles.categoriesStoreName,
                  {color: 'white', fontWeight: 'normal'},
                ]}>
                {vehicle} {this.props.route.params.currency}
                {this.props.route.params.typeOfRate == 'Municipal Rate'
                  ? base_fare
                  : this.props.route.params.typeOfRate == 'City Rate'
                  ? City
                  : Metro}
              </Text>
            </View>
          </TouchableOpacity>
        </Box>
      </Box>
    );
  };

  addToFavEq(id) {
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

  removeFavEq(id) {
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

  addToFavCar(id) {
    const uid = auth().currentUser.uid;
    this.setState({loading: true});
    const updateRef = firestore().collection('users').doc(uid);
    updateRef
      .update({
        RentalCarFav: firestore.FieldValue.arrayUnion(id),
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

  removeFavCar(id) {
    const uid = auth().currentUser.uid;
    this.setState({loading: true});
    const updateRef = firestore().collection('users').doc(uid);
    updateRef
      .update({
        RentalCarFav: firestore.FieldValue.arrayRemove(id),
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
    console.log('SearchRental');
    const {selectedFilter, activeSlide, productss} = this.state;
    return (
      <View style={{flex: 1}}>
        <CustomHeader
          title={'Search from ' + this.state.store_name}
          navigation={this.props.navigation}
          fromPlace={this.props.route.params.fromPlace}
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
       

        <Loader loading={this.state.loading} trans={trans} />
        {this.searchFilterFunction && (
          <RecyclerListView
            style={{flex: 1, marginHorizontal: 5}}
            rowRenderer={this.rowRenderer}
            dataProvider={this.state.dataProvider}
            layoutProvider={this.state.layoutProvider}
            renderFooter={this.renderFooter}
          />
        )}
      </View>
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
});
