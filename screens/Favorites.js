import React, {Component} from 'react';
import {
  AppState,
  StyleSheet,
  View,
  Dimensions,
  Image,
  FlatList,
  Text,
  TouchableOpacity,
  Alert,
  TextInput,
  TouchableHighlight,
  ScrollView,
  Pressable,
  Animated,
} from 'react-native';
import {
  Box,
  StatusBar,
  Button,
  HStack
} from 'native-base';
import ConfettiCannon from 'react-native-confetti-cannon';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomHeader from './Header';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import {RadioButton, Divider, Checkbox,Card} from 'react-native-paper';
import styles from '../components/styles';
import FastImage from 'react-native-fast-image';
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
import Modal from 'react-native-modal';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import auth from '@react-native-firebase/auth';
import MapboxGL, {Logger} from '@react-native-mapbox-gl/maps';
MapboxGL.setAccessToken(
  'sk.eyJ1IjoiY3l6b294IiwiYSI6ImNrdmFxNW5iODBoa2kzMXBnMGRjNXRwNHUifQ.KefOQn1CBBNu-qw1DhPblA',
);

export default class Favorites extends Component {
  constructor() {
    super();
    this.onViewableItemsChanged.bind(this);
    this.onViewableItemsChangedHotelFav.bind(this);
    this.onViewableItemsChangedServiceFav.bind(this);
    this.onViewableItemsChangedRentalPropFav.bind(this);
    this.onViewableItemsChangedRentalEqFav.bind(this);
    this.ref = firestore();
    this.annotationRef = null;
    this.unsubscribe = null;
    this.state = {
      appState: AppState.currentState,
      //defalt false and if true cannon will be fired
      shoot: false,
      dataSource: [],
      Favorites: [],
      customStyleIndex: 0,
      FoodFav: [],
      isVisibleAddons: false,
      image: [],
      activeSlide: 0,
      selectedFruits: [],
      addonss: [],
      choice: [],
      productss: [],
      cart: [],
      count: 1,
      HotelFav: [],
      RentalPropFav: [],
      RentalCarFav: [],
      RentalEqFav: [],
      ServiceFav: [],
      onScreenData: null,
      onScreenDataHotelFav: null,
      onScreenDataServiceFav: null,
      onScreenDataRentalPropFav: null,
      onScreenDataRentalCarFav: null,
      onScreenDataRentalEqFav: null,
    };
    this.onAddToCart = this.onAddToCart.bind(this);
  }

  async addonsAddtoCart(item) {
    const {cart} = this.state;
    const userId = auth().currentUser.uid;
    if (userId) {
      firestore()
        .collection('stores')
        .doc(item.storeId)
        .get()
        .then(snapshot => {
          let id = item.id;
          let cluster = item.cluster;
          let cluster_is_existing =
            Object.keys(cart).length &&
            Object.values(cart).find(item => cluster === item.cluster);
          if (cluster_is_existing == 0 || cluster_is_existing) {
            let newItem = {
              id: item.id,
              store_name: item.store_name,
              notification_token: snapshot.data().notification_token,
              total_addons: this.getAddonsTotal(),
              note: '',
              cluster: item.cluster,
              adminID: item.adminID,
              choice: this.getAddonsDefault(),
              qty: this.state.count,
              StoreCountry: item.Country,
              slongitude: item.slongitude,
              slatitude: item.slatitude,
            };
            console.log('newItem: ', newItem);
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
              'Note',
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
        });
    } else {
      this.setState({
        isVisibleAddons: false,
        productss: [],
        count: 1,
        choice: [],
      });
      this.props.navigation.navigate('Login');
    }
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
  async onAddToCart(item) {
    const {cart} = this.state;
    const userId = auth().currentUser.uid;
    if (userId) {
      firestore()
        .collection('stores')
        .doc(item.storeId)
        .get()
        .then(snapshot => {
          let id = item.id;
          let cluster = item.cluster;
          let cluster_is_existing =
            Object.keys(cart).length &&
            Object.values(cart).find(item => cluster === item.cluster);
          if (cluster_is_existing == 0 || cluster_is_existing) {
            AsyncStorage.setItem('cluster', item.cluster);
            let is_existing =
              Object.keys(cart).length &&
              Object.values(cart).find(
                item => id === item.id,
              ); /* Check if item already exists in cart from state */
            if (!is_existing) {
              let newItem = {
                id: item.id,
                store_name: item.store_name,
                StoreCountry: item.Country,
                slongitude: item.slongitude,
                slatitude: item.slatitude,
                notification_token: snapshot.data().notification_token,
                note: '',
                qty: 1,
                cluster: item.cluster,
                adminID: item.adminID,
              };
              let updatedCart = Object.values(cart); /* Clone it first */
              let cartRef = firestore().collection('cart');

              /* Push new cart item */
              updatedCart.push(newItem);
              console.log('updatedCart: ', updatedCart);
              /* Set updated cart in firebase, no need to use setState because we already have a realtime cart listener in the componentDidMount() */
              cartRef
                .doc(userId)
                .set(Object.assign({}, updatedCart))
                .then(() => {});
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
              'Note',
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
        });
    } else {
      this.props.navigation.navigate('Login');
    }
  }
  FoodAddons(item) {
    let img = [];
    let add = [];
    this.setState({
      isVisibleAddons: true,
      StoreCountry: this.props.StoreCountry,
      slongitude: this.props.slongitude,
      slatitude: this.props.slatitude,
      name: item.name,
      price: item.price,
      image: img.concat(item.featured_image),
      id: item.id,
      sale_price: item.sale_price,
      unit: item.unit,
      brand: item.brand,
      productss: item.addons,
      addonss: item,
      adminID: item.adminID,
    });
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

  onCollectionUpdate = querySnapshot => {
    const vouchers = [];
    querySnapshot.forEach(doc => {
      vouchers.push({
        datas: doc.data(),
        key: doc.id,
      });
    });
    this.setState({
      dataSource: vouchers,
    });
  };

  async component() {
    const userId = auth().currentUser.uid;
    //Time out to fire the cannon
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
    this.unsubscribe = this.ref
      .collection('vouchers')
      .onSnapshot(this.onCollectionUpdate);
    const self = this;
    let updatedCart = [];
    /* Listen to realtime cart changes */
    this.unsubscribeCartItems = firestore()
      .collection('users')
      .doc(userId)
      .onSnapshot(snapshotCart => {
        if (snapshotCart.data()) {
          this.setState({Favorites: snapshotCart.data(), loading: false});
          const foodFav =
            snapshotCart.data().FoodFav == undefined
              ? []
              : snapshotCart.data().FoodFav;
          const hotelFav =
            snapshotCart.data().HotelFav == undefined
              ? []
              : snapshotCart.data().HotelFav;
          const rentalPropFav =
            snapshotCart.data().RentalPropFav == undefined
              ? []
              : snapshotCart.data().RentalPropFav;
          const rentalCarFav =
            snapshotCart.data().RentalCarFav == undefined
              ? []
              : snapshotCart.data().RentalCarFav;
          const rentalEqFav =
            snapshotCart.data().RentalEqFav == undefined
              ? []
              : snapshotCart.data().RentalEqFav;
          const serviceFav =
            snapshotCart.data().ServiceFav == undefined
              ? []
              : snapshotCart.data().ServiceFav;

          console.log('foodFav: ', foodFav);
          for (index = 0; index < foodFav.length; index++) {
            console.log('index: ', index);
            console.log('foodFav[index]: ', foodFav[index]);
            firestore()
              .collection('products')
              .where('id', '==', foodFav[index])
              .onSnapshot(snapshotProduct => {
                snapshotProduct.docChanges().forEach(function (change) {
                  if (change.type === 'added') {
                    self.setState({
                      FoodFav: self.state.FoodFav.concat([change.doc.data()]),
                    });
                  } else if (change.type === 'modified') {
                    const newData = self.state.FoodFav.filter(items => {
                      const itemData = items.id;
                      const textData = change.doc.data().id;
                      return itemData.indexOf(textData) == -1;
                    });
                    self.setState({
                      FoodFav: newData.concat([change.doc.data()]),
                    });
                  } else if (change.type === 'removed') {
                    const newData = self.state.FoodFav.filter(items => {
                      const itemData = items.id;
                      const textData = change.doc.data().id;
                      return itemData.indexOf(textData) == -1;
                    });
                    self.setState({FoodFav: newData});
                  }
                });
              });
          }
          for (index = 0; index < hotelFav.length; index++) {
            console.log('index: ', index);
            console.log('foodFav[index]: ', hotelFav[index]);
            firestore()
              .collection('products')
              .where('id', '==', hotelFav[index])
              .onSnapshot(snapshotProduct => {
                snapshotProduct.docChanges().forEach(function (change) {
                  if (change.type === 'added') {
                    self.setState({
                      HotelFav: self.state.HotelFav.concat([change.doc.data()]),
                    });
                  } else if (change.type === 'modified') {
                    const newData = self.state.HotelFav.filter(items => {
                      const itemData = items.id;
                      const textData = change.doc.data().id;
                      return itemData.indexOf(textData) == -1;
                    });
                    self.setState({
                      HotelFav: newData.concat([change.doc.data()]),
                    });
                  } else if (change.type === 'removed') {
                    const newData = self.state.HotelFav.filter(items => {
                      const itemData = items.id;
                      const textData = change.doc.data().id;
                      return itemData.indexOf(textData) == -1;
                    });
                    self.setState({HotelFav: newData});
                  }
                });
              });
          }

          for (index = 0; index < rentalPropFav.length; index++) {
            console.log('index: ', index);
            console.log('foodFav[index]: ', rentalPropFav[index]);
            firestore()
              .collection('products')
              .where('id', '==', rentalPropFav[index])
              .onSnapshot(snapshotProduct => {
                snapshotProduct.docChanges().forEach(function (change) {
                  if (change.type === 'added') {
                    self.setState({
                      RentalPropFav: self.state.RentalPropFav.concat([
                        change.doc.data(),
                      ]),
                    });
                  } else if (change.type === 'modified') {
                    const newData = self.state.RentalPropFav.filter(items => {
                      const itemData = items.id;
                      const textData = change.doc.data().id;
                      return itemData.indexOf(textData) == -1;
                    });
                    self.setState({
                      RentalPropFav: newData.concat([change.doc.data()]),
                    });
                  } else if (change.type === 'removed') {
                    const newData = self.state.RentalPropFav.filter(items => {
                      const itemData = items.id;
                      const textData = change.doc.data().id;
                      return itemData.indexOf(textData) == -1;
                    });
                    self.setState({RentalPropFav: newData});
                  }
                });
              });
          }

          for (index = 0; index < rentalCarFav.length; index++) {
            console.log('index: ', index);
            console.log('foodFav[index]: ', rentalCarFav[index]);
            firestore()
              .collection('products')
              .where('id', '==', rentalCarFav[index])
              .onSnapshot(snapshotProduct => {
                snapshotProduct.docChanges().forEach(function (change) {
                  if (change.type === 'added') {
                    self.setState({
                      RentalCarFav: self.state.RentalCarFav.concat([
                        change.doc.data(),
                      ]),
                    });
                  } else if (change.type === 'modified') {
                    const newData = self.state.RentalCarFav.filter(items => {
                      const itemData = items.id;
                      const textData = change.doc.data().id;
                      return itemData.indexOf(textData) == -1;
                    });
                    self.setState({
                      RentalCarFav: newData.concat([change.doc.data()]),
                    });
                  } else if (change.type === 'removed') {
                    const newData = self.state.RentalCarFav.filter(items => {
                      const itemData = items.id;
                      const textData = change.doc.data().id;
                      return itemData.indexOf(textData) == -1;
                    });
                    self.setState({RentalCarFav: newData});
                  }
                });
              });
          }

          for (index = 0; index < rentalEqFav.length; index++) {
            console.log('index: ', index);
            console.log('foodFav[index]: ', rentalEqFav[index]);
            firestore()
              .collection('products')
              .where('id', '==', rentalEqFav[index])
              .onSnapshot(snapshotProduct => {
                snapshotProduct.docChanges().forEach(function (change) {
                  if (change.type === 'added') {
                    self.setState({
                      RentalEqFav: self.state.RentalEqFav.concat([
                        change.doc.data(),
                      ]),
                    });
                  } else if (change.type === 'modified') {
                    const newData = self.state.RentalEqFav.filter(items => {
                      const itemData = items.id;
                      const textData = change.doc.data().id;
                      return itemData.indexOf(textData) == -1;
                    });
                    self.setState({
                      RentalEqFav: newData.concat([change.doc.data()]),
                    });
                  } else if (change.type === 'removed') {
                    const newData = self.state.RentalEqFav.filter(items => {
                      const itemData = items.id;
                      const textData = change.doc.data().id;
                      return itemData.indexOf(textData) == -1;
                    });
                    self.setState({RentalEqFav: newData});
                  }
                });
              });
          }

          for (index = 0; index < serviceFav.length; index++) {
            console.log('index: ', index);
            console.log('foodFav[index]: ', serviceFav[index]);
            firestore()
              .collection('products')
              .where('id', '==', serviceFav[index])
              .onSnapshot(snapshotProduct => {
                snapshotProduct.docChanges().forEach(function (change) {
                  if (change.type === 'added') {
                    self.setState({
                      ServiceFav: self.state.ServiceFav.concat([
                        change.doc.data(),
                      ]),
                    });
                  } else if (change.type === 'modified') {
                    const newData = self.state.ServiceFav.filter(items => {
                      const itemData = items.id;
                      const textData = change.doc.data().id;
                      return itemData.indexOf(textData) == -1;
                    });
                    self.setState({
                      ServiceFav: newData.concat([change.doc.data()]),
                    });
                  } else if (change.type === 'removed') {
                    const newData = self.state.ServiceFav.filter(items => {
                      const itemData = items.id;
                      const textData = change.doc.data().id;
                      return itemData.indexOf(textData) == -1;
                    });
                    self.setState({ServiceFav: newData});
                  }
                });
              });
          }
        } else {
          this.setState({Favorites: [], loading: false});
        }
      });
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
    this.setState({loading: true});

    this.component();
  }

  componentWillUnmount() {
    this.appStateSubscription.remove();
  }

  addToFav(id) {
    const uid = auth().currentUser.uid;
    this.setState({loading: true});
    const updateRef = firestore().collection('users').doc(uid);
    updateRef
      .update({
        FoodFav: firestore.FieldValue.arrayUnion(id),
      })
      .then(docRef => {
        this.setState({
          loading: false,
          shoot: false,
          dataSource: [],
          Favorites: [],
          customStyleIndex: 0,
          FoodFav: [],
          isVisibleAddons: false,
          image: [],
          activeSlide: 0,
          selectedFruits: [],
          addonss: [],
          choice: [],
          productss: [],
          cart: [],
          count: 1,
          HotelFav: [],
          RentalPropFav: [],
          RentalCarFav: [],
          RentalEqFav: [],
          ServiceFav: [],
          onScreenData: null,
        });
        this.component();
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
        FoodFav: firestore.FieldValue.arrayRemove(id),
      })
      .then(docRef => {
        this.setState({
          loading: false,
          shoot: false,
          dataSource: [],
          Favorites: [],
          customStyleIndex: 0,
          FoodFav: [],
          isVisibleAddons: false,
          image: [],
          activeSlide: 0,
          selectedFruits: [],
          addonss: [],
          choice: [],
          productss: [],
          cart: [],
          count: 1,
          HotelFav: [],
          RentalPropFav: [],
          RentalCarFav: [],
          RentalEqFav: [],
          ServiceFav: [],
          onScreenData: null,
        });
        this.component();
      })
      .catch(err => {
        this.setState({loading: false});
        console.log('err: ', err);
      });
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
        this.setState({
          loading: false,
          shoot: false,
          dataSource: [],
          Favorites: [],
          customStyleIndex: 0,
          FoodFav: [],
          isVisibleAddons: false,
          image: [],
          activeSlide: 0,
          selectedFruits: [],
          addonss: [],
          choice: [],
          productss: [],
          cart: [],
          count: 1,
          HotelFav: [],
          RentalPropFav: [],
          RentalCarFav: [],
          RentalEqFav: [],
          ServiceFav: [],
          onScreenData: null,
        });
        this.component();
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
        this.setState({
          loading: false,
          shoot: false,
          dataSource: [],
          Favorites: [],
          customStyleIndex: 0,
          FoodFav: [],
          isVisibleAddons: false,
          image: [],
          activeSlide: 0,
          selectedFruits: [],
          addonss: [],
          choice: [],
          productss: [],
          cart: [],
          count: 1,
          HotelFav: [],
          RentalPropFav: [],
          RentalCarFav: [],
          RentalEqFav: [],
          ServiceFav: [],
          onScreenData: null,
        });
        this.component();
      })
      .catch(err => {
        this.setState({loading: false});
        console.log('err: ', err);
      });
  }

  addToFavProp(id) {
    const uid = auth().currentUser.uid;
    this.setState({loading: true});
    const updateRef = firestore().collection('users').doc(uid);
    updateRef
      .update({
        RentalPropFav: firestore.FieldValue.arrayUnion(id),
      })
      .then(docRef => {
        this.setState({
          loading: false,
          shoot: false,
          dataSource: [],
          Favorites: [],
          customStyleIndex: 0,
          FoodFav: [],
          isVisibleAddons: false,
          image: [],
          activeSlide: 0,
          selectedFruits: [],
          addonss: [],
          choice: [],
          productss: [],
          cart: [],
          count: 1,
          HotelFav: [],
          RentalPropFav: [],
          RentalCarFav: [],
          RentalEqFav: [],
          ServiceFav: [],
          onScreenData: null,
        });
        this.component();
      })
      .catch(err => {
        this.setState({loading: false});
        console.log('err: ', err);
      });
  }

  removeFavProp(id) {
    const uid = auth().currentUser.uid;
    this.setState({loading: true});
    const updateRef = firestore().collection('users').doc(uid);
    updateRef
      .update({
        RentalPropFav: firestore.FieldValue.arrayRemove(id),
      })
      .then(docRef => {
        this.setState({
          loading: false,
          shoot: false,
          dataSource: [],
          Favorites: [],
          customStyleIndex: 0,
          FoodFav: [],
          isVisibleAddons: false,
          image: [],
          activeSlide: 0,
          selectedFruits: [],
          addonss: [],
          choice: [],
          productss: [],
          cart: [],
          count: 1,
          HotelFav: [],
          RentalPropFav: [],
          RentalCarFav: [],
          RentalEqFav: [],
          ServiceFav: [],
          onScreenData: null,
        });
        this.component();
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
        this.setState({
          loading: false,
          shoot: false,
          dataSource: [],
          Favorites: [],
          customStyleIndex: 0,
          FoodFav: [],
          isVisibleAddons: false,
          image: [],
          activeSlide: 0,
          selectedFruits: [],
          addonss: [],
          choice: [],
          productss: [],
          cart: [],
          count: 1,
          HotelFav: [],
          RentalPropFav: [],
          RentalCarFav: [],
          RentalEqFav: [],
          ServiceFav: [],
          onScreenData: null,
        });
        this.component();
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
        this.setState({
          loading: false,
          shoot: false,
          dataSource: [],
          Favorites: [],
          customStyleIndex: 0,
          FoodFav: [],
          isVisibleAddons: false,
          image: [],
          activeSlide: 0,
          selectedFruits: [],
          addonss: [],
          choice: [],
          productss: [],
          cart: [],
          count: 1,
          HotelFav: [],
          RentalPropFav: [],
          RentalCarFav: [],
          RentalEqFav: [],
          ServiceFav: [],
          onScreenData: null,
        });
        this.component();
      })
      .catch(err => {
        this.setState({loading: false});
        console.log('err: ', err);
      });
  }

  addToFavEq(id) {
    const uid = auth().currentUser.uid;
    this.setState({loading: true});
    const updateRef = firestore().collection('users').doc(uid);
    updateRef
      .update({
        RentalEqFav: firestore.FieldValue.arrayUnion(id),
      })
      .then(docRef => {
        this.setState({
          loading: false,
          shoot: false,
          dataSource: [],
          Favorites: [],
          customStyleIndex: 0,
          FoodFav: [],
          isVisibleAddons: false,
          image: [],
          activeSlide: 0,
          selectedFruits: [],
          addonss: [],
          choice: [],
          productss: [],
          cart: [],
          count: 1,
          HotelFav: [],
          RentalPropFav: [],
          RentalCarFav: [],
          RentalEqFav: [],
          ServiceFav: [],
          onScreenData: null,
        });
        this.component();
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
        this.setState({
          loading: false,
          shoot: false,
          dataSource: [],
          Favorites: [],
          customStyleIndex: 0,
          FoodFav: [],
          isVisibleAddons: false,
          image: [],
          activeSlide: 0,
          selectedFruits: [],
          addonss: [],
          choice: [],
          productss: [],
          cart: [],
          count: 1,
          HotelFav: [],
          RentalPropFav: [],
          RentalCarFav: [],
          RentalEqFav: [],
          ServiceFav: [],
          onScreenData: null,
        });
        this.component();
      })
      .catch(err => {
        this.setState({loading: false});
        console.log('err: ', err);
      });
  }

  addToFavSer(id) {
    const uid = auth().currentUser.uid;
    this.setState({loading: true});
    const updateRef = firestore().collection('users').doc(uid);
    updateRef
      .update({
        ServiceFav: firestore.FieldValue.arrayUnion(id),
      })
      .then(docRef => {
        this.setState({
          loading: false,
          shoot: false,
          dataSource: [],
          Favorites: [],
          customStyleIndex: 0,
          FoodFav: [],
          isVisibleAddons: false,
          image: [],
          activeSlide: 0,
          selectedFruits: [],
          addonss: [],
          choice: [],
          productss: [],
          cart: [],
          count: 1,
          HotelFav: [],
          RentalPropFav: [],
          RentalCarFav: [],
          RentalEqFav: [],
          ServiceFav: [],
          onScreenData: null,
        });
        this.component();
      })
      .catch(err => {
        this.setState({loading: false});
        console.log('err: ', err);
      });
  }

  removeFavSer(id) {
    const uid = auth().currentUser.uid;
    this.setState({loading: true});
    const updateRef = firestore().collection('users').doc(uid);
    updateRef
      .update({
        ServiceFav: firestore.FieldValue.arrayRemove(id),
      })
      .then(docRef => {
        this.setState({
          loading: false,
          shoot: false,
          dataSource: [],
          Favorites: [],
          customStyleIndex: 0,
          FoodFav: [],
          isVisibleAddons: false,
          image: [],
          activeSlide: 0,
          selectedFruits: [],
          addonss: [],
          choice: [],
          productss: [],
          cart: [],
          count: 1,
          HotelFav: [],
          RentalPropFav: [],
          RentalCarFav: [],
          RentalEqFav: [],
          ServiceFav: [],
          onScreenData: null,
        });
        this.component();
      })
      .catch(err => {
        this.setState({loading: false});
        console.log('err: ', err);
      });
  }

  router(item) {
    if (!item.status || item.quantity <= 0) {
      return null;
    } else {
      if (item.addons == null || item.addons.length == 0) {
        console.log('addto cart');
        this.onAddToCart(item);
      } else {
        console.log('FoodAddons');
        this.FoodAddons(item);
      }
    }
  }

  handleCustomIndexSelect = (index: number) => {
    //handle tab selection for custom Tab Selection SegmentedControlTab
    this.setState(prevState => ({...prevState, customStyleIndex: index}));
  };

  onViewableItemsChanged = ({viewableItems, changed}) => {
    console.log('Visible items are', viewableItems);

    console.log('Changed in this iteration', changed);
    const lenghtData =
      viewableItems.length == 0 ? changed.length : viewableItems.length;
    this.setState({
      onScreenData:
        viewableItems[lenghtData - 1].item == undefined
          ? changed[lenghtData - 1].item
          : viewableItems[lenghtData - 1].item,
    });
  };

  onViewableItemsChangedHotelFav = ({viewableItems, changed}) => {
    console.log('Visible items are', viewableItems);

    console.log('Changed in this iteration', changed);
    const lenghtData =
      viewableItems.length == 0 ? changed.length : viewableItems.length;
    this.setState({
      onScreenDataHotelFav:
        viewableItems[lenghtData - 1].item == undefined
          ? changed[lenghtData - 1].item
          : viewableItems[lenghtData - 1].item,
    });
  };

  onViewableItemsChangedRentalPropFav = ({viewableItems, changed}) => {
    console.log('Visible items are', viewableItems);

    console.log('Changed in this iteration', changed);
    const lenghtData =
      viewableItems.length == 0 ? changed.length : viewableItems.length;
    this.setState({
      onScreenDataRentalPropFav:
        viewableItems[lenghtData - 1].item == undefined
          ? changed[lenghtData - 1].item
          : viewableItems[lenghtData - 1].item,
    });
  };
  onViewableItemsChangedRentalCarFav = ({viewableItems, changed}) => {
    console.log('Visible items are', viewableItems);

    console.log('Changed in this iteration', changed);
    const lenghtData =
      viewableItems.length == 0 ? changed.length : viewableItems.length;
    this.setState({
      onScreenDataRentalCarFav:
        viewableItems[lenghtData - 1].item == undefined
          ? changed[lenghtData - 1].item
          : viewableItems[lenghtData - 1].item,
    });
  };
  onViewableItemsChangedRentalEqFav = ({viewableItems, changed}) => {
    console.log('Visible items are', viewableItems);

    console.log('Changed in this iteration', changed);
    const lenghtData =
      viewableItems.length == 0 ? changed.length : viewableItems.length;
    this.setState({
      onScreenDataRentalEqFav:
        viewableItems[lenghtData - 1].item == undefined
          ? changed[lenghtData - 1].item
          : viewableItems[lenghtData - 1].item,
    });
  };
  onViewableItemsChangedServiceFav = ({viewableItems, changed}) => {
    console.log('Visible items are', viewableItems);

    console.log('Changed in this iteration', changed);
    const lenghtData =
      viewableItems.length == 0 ? changed.length : viewableItems.length;
    this.setState({
      onScreenDataServiceFav:
        viewableItems[lenghtData - 1].item == undefined
          ? changed[lenghtData - 1].item
          : viewableItems[lenghtData - 1].item,
    });
  };
  render() {
    console.log('FoodFav: ', this.state.FoodFav);
    console.log('HotelFav: ', this.state.HotelFav);
    console.log('RentalPropFav: ', this.state.RentalPropFav);
    console.log('RentalCarFav: ', this.state.RentalCarFav);
    console.log('RentalEqFav: ', this.state.RentalEqFav);
    console.log('ServiceFav: ', this.state.ServiceFav);
    return (
      <Box>
        <Box style={style.Box}>
        <View>
      <StatusBar bg="#ee4e4e" barStyle="light-content" />
      <Box safeAreaTop bg="#ee4e4e" />
      <HStack bg="#ee4e4e" px="1" py="3" justifyContent="space-between" alignItems="center" w="100%">
        <HStack alignItems="center">
        <Button bg="#ee4e4e"  onPress={() => this.props.navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={25} color="white" />
          </Button>
          <Text style={{color:'white', fontSize:20, fontWeight:'bold'}}>
          Favorites
          </Text>
        </HStack>
        <HStack>
        </HStack>
      </HStack>
      </View>

          <FlatList
            key={'7'}
            data={[
              {label: 'Foods'},
              {label: 'Hotels'},
              {label: 'Property Rental'},
              {label: 'Car Rental'},
              {label: 'Equipment Rental'},
              {label: 'Service'},
            ]}
            style={{height: 50, flexGrow: 0, backgroundColor: '#F2F2F2', marginBottom:20}}
            horizontal
            renderItem={({item, index}) => (
              <TouchableOpacity
                style={{
                  justifyContent: 'center',
                  alignSelf: 'flex-start',
                  padding: 10,
                  height: 50,
                  backgroundColor:
                    this.state.customStyleIndex == index ? 'white' : '#F2F2F2',
                }}
                onPress={() => this.setState({customStyleIndex: index})}>
                <Text
                  style={{
                    textAlign: 'center',
                    color:
                      this.state.customStyleIndex == index
                        ? '#888888'
                        : 'black',
                    fontWeight: 'bold',
                  }}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
          {this.state.customStyleIndex == 0 ? (
            <View>
              <FlatList
                key={'6'}
                data={this.state.FoodFav}
                numColumns={2}
                renderItem={({item, index}) => (
                  <Card style={{borderRadius: 20, width: SCREEN_WIDTH / 2.1,marginLeft:5}}>
                    <Box
                      style={{
                        backgroundColor: '#fff1f3',
                        paddingBottom: 0,
                        marginBottom: 0,
                        paddingLeft: 0,
                        paddingRight: 0,
                        paddingTop: 0,
                        borderRadius: 20,
                      }}>
                      <TouchableOpacity
                        style={{width: SCREEN_WIDTH / 2.1, flex: 1}}
                        onPress={() => this.router(item)}>
                        <FastImage
                          style={{
                            width: '100%',
                            height: 150,
                            shadowColor: '#cccccc',
                            backgroundColor: '#cccccc',
                            shadowOffset: {
                              width: 0,
                              height: 3,
                            },
                            borderRadius: 20,
                            shadowRadius: 5,
                            shadowOpacity: 1.0,
                            elevation: 3,
                          }}
                          source={{
                            uri: item.featured_image,
                            headers: {Authorization: 'someAuthToken'},
                            priority: FastImage.priority.normal,
                          }}
                          resizeMode={FastImage.resizeMode.cover}>
                          {this.state.Favorites == undefined ? null : this.state
                              .Favorites.FoodFav == undefined ? (
                            <AntDesign
                              name="hearto"
                              size={21}
                              color="salmon"
                              style={{
                                backgroundColor: 'white',
                                width: 32,
                                marginLeft: SCREEN_WIDTH / 2.9,
                                height: 32,
                                marginTop: 5,
                                padding: 5,
                                borderRadius: 5,
                              }}
                              onPress={() => this.addToFav(item.id)}
                            />
                          ) : !this.state.Favorites.FoodFav.includes(
                              item.id,
                            ) ? (
                            <AntDesign
                              name="hearto"
                              size={21}
                              color="salmon"
                              style={{
                                backgroundColor: 'white',
                                width: 32,
                                marginLeft: SCREEN_WIDTH / 2.7,
                                height: 32,
                                marginTop: 5,
                                padding: 5,
                                borderRadius: 5,
                              }}
                              onPress={() => this.addToFav(item.id)}
                            />
                          ) : (
                            <AntDesign
                              name="heart"
                              size={21}
                              color="salmon"
                              style={{
                                backgroundColor: 'white',
                                width: 32,
                                marginLeft: SCREEN_WIDTH / 2.7,
                                height: 32,
                                marginTop: 5,
                                padding: 5,
                                borderRadius: 5,
                              }}
                              onPress={() => this.removeFav(item.id)}
                            />
                          )}

                          <View
                            style={{
                              backgroundColor: 'rgba(49,49,49, 0.8)',
                              position: 'absolute',
                              bottom: 0,
                              width: '100%',
                            }}>
                            <View
                              style={{
                                height: 20,
                                flexShrink: 1,
                                flexDirection: 'row',
                              }}>
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
                                {item.name}
                              </Text>
                            </View>
                            {!item.admin_control || !item.status ? (
                              <View style={styles.text}>
                                <Text style={styles.title}>Unavailable</Text>
                              </View>
                            ) : item.quantity <= 0 ? (
                              <View style={styles.text}>
                                <Text style={styles.title}>Out of Stock</Text>
                              </View>
                            ) : null}

                            {item.brand == '' ? null : (
                              <Text
                                style={{
                                  fontStyle: 'italic',
                                  color: 'white',
                                  fontSize: 10,
                                  paddingLeft: 20,
                                }}>
                                Brand : {item.brand}
                              </Text>
                            )}

                            {item.sale_price ? (
                              <View style={{flexDirection: 'row'}}>
                                <Text style={styles.categoriesPrice}>
                                  ₱ {item.sale_price}
                                  <Text
                                    style={[
                                      styles.categoriesPrice,
                                      {fontSize: 10},
                                    ]}>
                                    / {item.unit}
                                  </Text>
                                </Text>
                                <Text style={styles.categoriesPriceSale}>
                                  ₱{item.price}
                                  <Text
                                    style={[
                                      styles.categoriesPriceSale,
                                      {fontSize: 10},
                                    ]}>
                                    / {item.unit}
                                  </Text>
                                </Text>
                              </View>
                            ) : (
                              <View>
                                <Text style={styles.categoriesPrice}>
                                  ₱{item.price}
                                  <Text
                                    style={[
                                      styles.categoriesPrice,
                                      {fontSize: 10},
                                    ]}>
                                    / {item.unit}
                                  </Text>
                                </Text>
                              </View>
                            )}
                          </View>
                        </FastImage>
                      </TouchableOpacity>
                    </Box>
                  </Card>
                )}
              />
            </View>
          ) : this.state.customStyleIndex == 1 ? (
            //Custome index else
            <View
              style={{
                position: 'absolute',

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
                  top: 105,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
                attributionEnabled={false}
                logoEnabled={false}>
                <MapboxGL.UserLocation
                  visible={true}
                  showsUserHeadingIndicator={true}
                />
                {this.state.HotelFav && this.state.HotelFav.length > 0 ? (
                  <MapboxGL.Camera
                    centerCoordinate={[
                      this.state.onScreenDataHotelFav == null
                        ? this.state.HotelFav[0].slongitude
                        : this.state.onScreenDataHotelFav.slongitude,
                      this.state.onScreenDataHotelFav == null
                        ? this.state.HotelFav[0].slatitude
                        : this.state.onScreenDataHotelFav.slatitude,
                    ]}
                    zoomLevel={15}
                    followUserMode={'normal'}
                  />
                ) : null}
                {this.state.HotelFav && this.state.HotelFav.length > 0
                  ? this.state.HotelFav.map((info, index) => (
                      <MapboxGL.MarkerView
                        id={'marker'}
                        coordinate={[info.slongitude, info.slatitude]}>
                        <TouchableOpacity
                          style={{
                            height:
                              this.state.onScreenDataHotelFav == null
                                ? 50
                                : this.state.onScreenDataHotelFav.id == info.id
                                ? 70
                                : 50,
                            width:
                              this.state.onScreenDataHotelFav == null
                                ? 100
                                : this.state.onScreenDataHotelFav.id == info.id
                                ? 120
                                : 100,
                            backgroundColor:
                              this.state.onScreenDataHotelFav == null
                                ? 'red'
                                : this.state.onScreenDataHotelFav.id == info.id
                                ? '#28ae07'
                                : 'red',
                            zIndex:
                              this.state.onScreenDataHotelFav == null
                                ? 0
                                : this.state.onScreenDataHotelFav.id == info.id
                                ? 1
                                : 0,
                            borderRadius: 50,
                            borderColor: '#fff',
                            borderWidth: 3,
                          }}
                          onPress={feature => {
                            this.props.navigation.navigate(
                              'CheckoutScreenHotels',
                              {
                                datas: info,
                                cLat: info.slatitude,
                                cLong: info.slongitude,
                                typeOfRate: this.props.route.params.typeOfRate,
                                currency: this.props.route.params.currency,
                              },
                            );
                          }}>
                          {
                            //<Image style={{width: 10, height: 10}} resizeMode="cover" source={{uri:info.imageArray[0]== 'AddImage'?info.imageArray[1]:info.imageArray[0]}} key={index} />
                          }
                          <MaterialCommunityIcons
                            name="home-city"
                            size={10}
                            color="white"
                            style={{alignSelf: 'center', paddingTop: 2}}
                          />

                          <Text
                            style={{
                              fontWeight: 'bold',
                              alignSelf: 'center',
                              color: 'white',
                              fontSize: 10,
                            }}>
                            {info.name}
                          </Text>
                          {!info.StatHourPrice3 ? null : (
                            <Text
                              style={{
                                fontSize: 10,
                                fontWeight: 'bold',
                                alignSelf: 'center',
                                color: 'white',
                                padding: 1,
                              }}>
                              {' '}
                              {this.props.route.params.currency}
                              {parseFloat(info.HourPrice3)
                                .toFixed(0)
                                .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                            </Text>
                          )}
                          {!info.StatHourPrice6 ? null : (
                            <Text
                              style={{
                                fontSize: 10,
                                fontWeight: 'bold',
                                alignSelf: 'center',
                                color: 'white',
                                padding: 1,
                              }}>
                              {' '}
                              {this.props.route.params.currency}
                              {parseFloat(info.HourPrice6)
                                .toFixed(0)
                                .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                            </Text>
                          )}
                          {!info.StatHourPrice12 ? null : (
                            <Text
                              style={{
                                fontSize: 10,
                                fontWeight: 'bold',
                                alignSelf: 'center',
                                color: 'white',
                                padding: 1,
                              }}>
                              {' '}
                              {this.props.route.params.currency}
                              {parseFloat(info.HourPrice12)
                                .toFixed(0)
                                .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                            </Text>
                          )}
                          {!info.StatHourPrice ? null : (
                            <Text
                              style={{
                                fontSize: 10,
                                fontWeight: 'bold',
                                alignSelf: 'center',
                                color: 'white',
                                padding: 1,
                              }}>
                              {' '}
                              {this.props.route.params.currency}
                              {parseFloat(info.HourPrice)
                                .toFixed(0)
                                .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                            </Text>
                          )}

                          {!info.StatDayPrice ? null : (
                            <Text
                              style={{
                                fontSize: 10,
                                fontWeight: 'bold',
                                alignSelf: 'center',
                                color: 'white',
                                padding: 1,
                              }}>
                              {' '}
                              {this.props.route.params.currency}
                              {parseFloat(info.DayPrice)
                                .toFixed(0)
                                .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                            </Text>
                          )}
                          {!info.StatWeeklyPrice ? null : (
                            <Text
                              style={{
                                fontSize: 10,
                                fontWeight: 'bold',
                                alignSelf: 'center',
                                color: 'white',
                                padding: 1,
                              }}>
                              {' '}
                              {this.props.route.params.currency}
                              {parseFloat(info.WeeklyPrice)
                                .toFixed(0)
                                .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                            </Text>
                          )}
                          {!info.StatMonthlyPrice ? null : (
                            <Text
                              style={{
                                fontSize: 10,
                                alignSelf: 'center',
                                fontWeight: 'bold',
                                color: 'white',
                                padding: 1,
                              }}>
                              {' '}
                              {this.props.route.params.currency}
                              {parseFloat(info.MonthlyPrice)
                                .toFixed(0)
                                .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                            </Text>
                          )}
                        </TouchableOpacity>
                      </MapboxGL.MarkerView>
                    ))
                  : null}
              </MapboxGL.MapView>

              <FlatList
                key={'5'}
                data={this.state.HotelFav}
                horizontal
                style={{bottom: 0, position: 'absolute', flex: 100}}
                onViewableItemsChanged={this.onViewableItemsChangedHotelFav}
                viewabilityConfig={{viewAreaCoveragePercentThreshold: 50}}
                renderItem={({item, index}) => (
                  <Card
                    transparent
                    style={{
                      flex: 1,
                      width: SCREEN_WIDTH / 2.1,
                      marginRight: 10,
                    }}>
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
                      }}>
                      <TouchableOpacity
                        style={{width: SCREEN_WIDTH / 2, flex: 1}}
                        onPress={feature => {
                          this.props.navigation.navigate(
                            'CheckoutScreenHotels',
                            {
                              datas: item,
                              cLat: item.slatitude,
                              cLong: item.slongitude,
                              typeOfRate: this.props.route.params.typeOfRate,
                              currency: this.props.route.params.currency,
                            },
                          );
                        }}>
                        <FastImage
                          style={styles.productPhoto}
                          source={{
                            uri:
                              item.imageArray[0] == 'AddImage'
                                ? item.imageArray[1]
                                : item.imageArray[0],
                            headers: {Authorization: 'someAuthToken'},
                            priority: FastImage.priority.normal,
                          }}
                          resizeMode={FastImage.resizeMode.cover}>
                          {this.state.Favorites == undefined ? null : this.state
                              .Favorites.HotelFav == undefined ? (
                            <AntDesign
                              name="hearto"
                              size={21}
                              color="salmon"
                              style={{
                                backgroundColor: 'white',
                                width: 32,
                                marginLeft: SCREEN_WIDTH / 2.9,
                                height: 32,
                                marginTop: 5,
                                padding: 5,
                                borderRadius: 5,
                              }}
                              onPress={() => this.addToFavHotel(item.id)}
                            />
                          ) : !this.state.Favorites.HotelFav.includes(
                              item.id,
                            ) ? (
                            <AntDesign
                              name="hearto"
                              size={21}
                              color="salmon"
                              style={{
                                backgroundColor: 'white',
                                width: 32,
                                marginLeft: SCREEN_WIDTH / 2.9,
                                height: 32,
                                marginTop: 5,
                                padding: 5,
                                borderRadius: 5,
                              }}
                              onPress={() => this.addToFavHotel(item.id)}
                            />
                          ) : (
                            <AntDesign
                              name="heart"
                              size={21}
                              color="salmon"
                              style={{
                                backgroundColor: 'white',
                                width: 32,
                                marginLeft: SCREEN_WIDTH / 2.9,
                                height: 32,
                                marginTop: 5,
                                padding: 5,
                                borderRadius: 5,
                              }}
                              onPress={() => this.removeFavHotel(item.id)}
                            />
                          )}
                          <View
                            style={{
                              backgroundColor: 'rgba(49,49,49, 0.8)',
                              position: 'absolute',
                              bottom: 0,
                              width: '100%',
                              height: 50,
                            }}>
                            <Text
                              numberOfLines={1}
                              style={{
                                fontSize: 15,
                                color: 'white',
                                padding: 1,
                                paddingLeft: 10,
                              }}>
                              {item.name}
                            </Text>
                            <View
                              style={{
                                height: 50,
                                flexShrink: 1,
                                flexDirection: 'row',
                              }}>
                              {!item.StatHourPrice3 ? null : (
                                <Text
                                  style={{
                                    fontSize: 14,
                                    fontWeight: 'bold',
                                    color: 'white',
                                    padding: 1,
                                  }}>
                                  {' '}
                                  {this.props.route.params.currency}
                                  {parseFloat(item.HourPrice3)
                                    .toFixed(0)
                                    .replace(
                                      /(\d)(?=(\d{3})+(?!\d))/g,
                                      '$1,',
                                    )}{' '}
                                  Good for {item.maxGuest}
                                </Text>
                              )}
                              {!item.StatHourPrice6 ? null : (
                                <Text
                                  style={{
                                    fontSize: 14,
                                    fontWeight: 'bold',
                                    color: 'white',
                                    padding: 1,
                                  }}>
                                  {' '}
                                  {this.props.route.params.currency}
                                  {parseFloat(item.HourPrice6)
                                    .toFixed(0)
                                    .replace(
                                      /(\d)(?=(\d{3})+(?!\d))/g,
                                      '$1,',
                                    )}{' '}
                                  Good for {item.maxGuest}
                                </Text>
                              )}
                              {!item.StatHourPrice12 ? null : (
                                <Text
                                  style={{
                                    fontSize: 14,
                                    fontWeight: 'bold',
                                    color: 'white',
                                    padding: 1,
                                  }}>
                                  {' '}
                                  {this.props.route.params.currency}
                                  {parseFloat(item.HourPrice12)
                                    .toFixed(0)
                                    .replace(
                                      /(\d)(?=(\d{3})+(?!\d))/g,
                                      '$1,',
                                    )}{' '}
                                  Good for {item.maxGuest}
                                </Text>
                              )}
                              {!item.StatHourPrice ? null : (
                                <Text
                                  style={{
                                    fontSize: 14,
                                    fontWeight: 'bold',
                                    color: 'white',
                                    padding: 1,
                                  }}>
                                  {' '}
                                  {this.props.route.params.currency}
                                  {parseFloat(item.HourPrice)
                                    .toFixed(0)
                                    .replace(
                                      /(\d)(?=(\d{3})+(?!\d))/g,
                                      '$1,',
                                    )}{' '}
                                  Good for {item.maxGuest}
                                </Text>
                              )}

                              {!item.StatDayPrice ? null : (
                                <Text
                                  style={{
                                    fontSize: 14,
                                    fontWeight: 'bold',
                                    color: 'white',
                                    padding: 1,
                                  }}>
                                  {' '}
                                  {this.props.route.params.currency}
                                  {parseFloat(item.DayPrice)
                                    .toFixed(0)
                                    .replace(
                                      /(\d)(?=(\d{3})+(?!\d))/g,
                                      '$1,',
                                    )}{' '}
                                  Good for {item.maxGuest}
                                </Text>
                              )}
                              {!item.StatWeeklyPrice ? null : (
                                <Text
                                  style={{
                                    fontSize: 14,
                                    fontWeight: 'bold',
                                    color: 'white',
                                    padding: 1,
                                  }}>
                                  {' '}
                                  {this.props.route.params.currency}
                                  {parseFloat(item.WeeklyPrice)
                                    .toFixed(0)
                                    .replace(
                                      /(\d)(?=(\d{3})+(?!\d))/g,
                                      '$1,',
                                    )}{' '}
                                  Good for {item.maxGuest}
                                </Text>
                              )}
                              {!item.StatMonthlyPrice ? null : (
                                <Text
                                  style={{
                                    fontSize: 14,
                                    fontWeight: 'bold',
                                    color: 'white',
                                    padding: 1,
                                  }}>
                                  {' '}
                                  {this.props.route.params.currency}
                                  {parseFloat(item.MonthlyPrice)
                                    .toFixed(0)
                                    .replace(
                                      /(\d)(?=(\d{3})+(?!\d))/g,
                                      '$1,',
                                    )}{' '}
                                  Good for {item.maxGuest}
                                </Text>
                              )}
                            </View>
                            {!item.admin_control || !item.status ? (
                              <View style={styles.text}>
                                <Text style={styles.title}>Unavailable</Text>
                              </View>
                            ) : null}
                          </View>
                        </FastImage>
                      </TouchableOpacity>
                    </Box>
                  </Card>
                )}
              />
            </View>
          ) : this.state.customStyleIndex == 2 ? (
            //Custome index else
            <View
              style={{
                position: 'absolute',

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
                  top: 105,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
                attributionEnabled={false}
                logoEnabled={false}>
                <MapboxGL.UserLocation
                  visible={true}
                  showsUserHeadingIndicator={true}
                />
                {this.state.RentalPropFav &&
                this.state.RentalPropFav.length > 0 ? (
                  <MapboxGL.Camera
                    centerCoordinate={[
                      this.state.onScreenDataRentalPropFav == null
                        ? this.state.RentalPropFav[0].slatitude
                        : this.state.onScreenDataRentalPropFav.slatitude,
                      this.state.onScreenDataRentalPropFav == null
                        ? this.state.RentalPropFav[0].slongitude
                        : this.state.onScreenDataRentalPropFav.slongitude,
                    ]}
                    zoomLevel={15}
                    followUserMode={'normal'}
                  />
                ) : null}
                {this.state.RentalPropFav && this.state.RentalPropFav.length > 0
                  ? this.state.RentalPropFav.map((info, index) => (
                      <MapboxGL.MarkerView
                        id={'marker'}
                        coordinate={[info.slatitude, info.slongitude]}>
                        <TouchableOpacity
                          style={{
                            height:
                              this.state.onScreenDataRentalPropFav == null
                                ? 50
                                : this.state.onScreenDataRentalPropFav.id ==
                                  info.id
                                ? 70
                                : 50,
                            width:
                              this.state.onScreenDataRentalPropFav == null
                                ? 100
                                : this.state.onScreenDataRentalPropFav.id ==
                                  info.id
                                ? 120
                                : 100,
                            backgroundColor:
                              this.state.onScreenDataRentalPropFav == null
                                ? 'red'
                                : this.state.onScreenDataRentalPropFav.id ==
                                  info.id
                                ? '#28ae07'
                                : 'red',
                            zIndex:
                              this.state.onScreenDataRentalPropFav == null
                                ? 0
                                : this.state.onScreenDataRentalPropFav.id ==
                                  info.id
                                ? 1
                                : 0,
                            borderRadius: 50,
                            borderColor: '#fff',
                            borderWidth: 3,
                          }}
                          onPress={feature => {
                            this.props.navigation.navigate(
                              'CheckoutScreenRentals',
                              {
                                datas: info,
                                cLat: info.slatitude,
                                cLong: info.slongitude,
                                typeOfRate: this.props.route.params.typeOfRate,
                                currency: this.props.route.params.currency,
                              },
                            );
                          }}>
                          <MaterialCommunityIcons
                            name="home-city"
                            size={10}
                            color="white"
                            style={{alignSelf: 'center', paddingTop: 5}}
                          />
                          <Text
                            style={{
                              alignSelf: 'center',
                              color: 'white',
                              fontSize: 10,
                            }}>
                            {info.name}
                          </Text>
                          {!info.StatHourPrice ? null : (
                            <Text
                              style={{
                                fontSize: 10,
                                alignSelf: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                padding: 1,
                              }}>
                              {' '}
                              {this.props.route.params.currency}
                              {parseFloat(info.HourPrice)
                                .toFixed(0)
                                .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                            </Text>
                          )}

                          {!info.StatDayPrice ? null : (
                            <Text
                              style={{
                                fontSize: 10,
                                alignSelf: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                padding: 1,
                              }}>
                              {' '}
                              {this.props.route.params.currency}
                              {parseFloat(info.DayPrice)
                                .toFixed(0)
                                .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                            </Text>
                          )}
                          {!info.StatWeeklyPrice ? null : (
                            <Text
                              style={{
                                fontSize: 10,
                                alignSelf: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                padding: 1,
                              }}>
                              {' '}
                              {this.props.route.params.currency}
                              {parseFloat(info.WeeklyPrice)
                                .toFixed(0)
                                .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                            </Text>
                          )}
                          {!info.StatMonthlyPrice ? null : (
                            <Text
                              style={{
                                fontSize: 10,
                                alignSelf: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                padding: 1,
                              }}>
                              {' '}
                              {this.props.route.params.currency}
                              {parseFloat(info.MonthlyPrice)
                                .toFixed(0)
                                .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                            </Text>
                          )}
                        </TouchableOpacity>
                      </MapboxGL.MarkerView>
                    ))
                  : null}
              </MapboxGL.MapView>

              <FlatList
                key={'4'}
                data={this.state.RentalPropFav}
                horizontal
                style={{bottom: 0, position: 'absolute', flex: 100}}
                onViewableItemsChanged={
                  this.onViewableItemsChangedRentalPropFav
                }
                viewabilityConfig={{viewAreaCoveragePercentThreshold: 50}}
                renderItem={({item, index}) => (
                  <Card
                    transparent
                    style={{
                      flex: 1,
                      width: SCREEN_WIDTH / 2.1,
                      marginRight: 10,
                    }}>
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
                      }}>
                      <TouchableOpacity
                        style={{width: SCREEN_WIDTH / 2, flex: 1}}
                        onPress={feature => {
                          this.props.navigation.navigate(
                            'CheckoutScreenRentals',
                            {
                              datas: item,
                              cLat: item.slatitude,
                              cLong: item.slongitude,
                              typeOfRate: this.props.route.params.typeOfRate,
                              currency: this.props.route.params.currency,
                            },
                          );
                        }}>
                        <FastImage
                          style={styles.productPhoto}
                          source={{
                            uri:
                              item.imageArray[0] == 'AddImage'
                                ? item.imageArray[1]
                                : item.imageArray[0],
                            headers: {Authorization: 'someAuthToken'},
                            priority: FastImage.priority.normal,
                          }}
                          resizeMode={FastImage.resizeMode.cover}>
                          {this.state.Favorites == undefined ? null : this.state
                              .Favorites.RentalPropFav == undefined ? (
                            <AntDesign
                              name="hearto"
                              size={21}
                              color="salmon"
                              style={{
                                backgroundColor: 'white',
                                width: 32,
                                marginLeft: SCREEN_WIDTH / 2.7,
                                height: 32,
                                marginTop: 5,
                                padding: 5,
                                borderRadius: 5,
                              }}
                              onPress={() => this.addToFavProp(item.id)}
                            />
                          ) : !this.state.Favorites.RentalPropFav.includes(
                              item.id,
                            ) ? (
                            <AntDesign
                              name="hearto"
                              size={21}
                              color="salmon"
                              style={{
                                backgroundColor: 'white',
                                width: 32,
                                marginLeft: SCREEN_WIDTH / 2.7,
                                height: 32,
                                marginTop: 5,
                                padding: 5,
                                borderRadius: 5,
                              }}
                              onPress={() => this.addToFavProp(item.id)}
                            />
                          ) : (
                            <AntDesign
                              name="heart"
                              size={21}
                              color="salmon"
                              style={{
                                backgroundColor: 'white',
                                width: 32,
                                marginLeft: SCREEN_WIDTH / 2.7,
                                height: 32,
                                marginTop: 5,
                                padding: 5,
                                borderRadius: 5,
                              }}
                              onPress={() => this.removeFavProp(item.id)}
                            />
                          )}
                          <View
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.4)',
                              position: 'absolute',
                              bottom: 0,
                              width: '100%',
                              height: 50,
                            }}>
                            <Text
                              numberOfLines={1}
                              style={{
                                fontSize: 15,
                                color: 'black',
                                padding: 1,
                                paddingLeft: 10,
                              }}>
                              {item.name}
                            </Text>
                            <View
                              style={{
                                height: 50,
                                flexShrink: 1,
                                flexDirection: 'row',
                              }}>
                              {!item.StatHourPrice ? null : (
                                <Text
                                  style={{
                                    fontSize: 14,
                                    fontWeight: 'bold',
                                    color: 'black',
                                    padding: 1,
                                  }}>
                                  {' '}
                                  {this.props.route.params.currency}
                                  {parseFloat(item.HourPrice)
                                    .toFixed(0)
                                    .replace(
                                      /(\d)(?=(\d{3})+(?!\d))/g,
                                      '$1,',
                                    )}{' '}
                                  Good for {item.maxGuest}
                                </Text>
                              )}

                              {!item.StatDayPrice ? null : (
                                <Text
                                  style={{
                                    fontSize: 14,
                                    fontWeight: 'bold',
                                    color: 'black',
                                    padding: 1,
                                  }}>
                                  {' '}
                                  {this.props.route.params.currency}
                                  {parseFloat(item.DayPrice)
                                    .toFixed(0)
                                    .replace(
                                      /(\d)(?=(\d{3})+(?!\d))/g,
                                      '$1,',
                                    )}{' '}
                                  Good for {item.maxGuest}
                                </Text>
                              )}
                              {!item.StatWeeklyPrice ? null : (
                                <Text
                                  style={{
                                    fontSize: 14,
                                    fontWeight: 'bold',
                                    color: 'black',
                                    padding: 1,
                                  }}>
                                  {' '}
                                  {this.props.route.params.currency}
                                  {parseFloat(item.WeeklyPrice)
                                    .toFixed(0)
                                    .replace(
                                      /(\d)(?=(\d{3})+(?!\d))/g,
                                      '$1,',
                                    )}{' '}
                                  Good for {item.maxGuest}
                                </Text>
                              )}
                              {!item.StatMonthlyPrice ? null : (
                                <Text
                                  style={{
                                    fontSize: 14,
                                    fontWeight: 'bold',
                                    color: 'black',
                                    padding: 1,
                                  }}>
                                  {' '}
                                  {this.props.route.params.currency}
                                  {parseFloat(item.MonthlyPrice)
                                    .toFixed(0)
                                    .replace(
                                      /(\d)(?=(\d{3})+(?!\d))/g,
                                      '$1,',
                                    )}{' '}
                                  Good for {item.maxGuest}
                                </Text>
                              )}
                            </View>
                            {!item.admin_control || !item.status ? (
                              <View style={styles.text}>
                                <Text style={styles.title}>Unavailable</Text>
                              </View>
                            ) : null}
                          </View>
                        </FastImage>
                      </TouchableOpacity>
                    </Box>
                  </Card>
                )}
              />
            </View>
          ) : this.state.customStyleIndex == 3 ? (
            //Custome index else
            <View
              style={{
                position: 'absolute',

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
                  top: 105,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
                attributionEnabled={false}
                logoEnabled={false}>
                <MapboxGL.UserLocation
                  visible={true}
                  showsUserHeadingIndicator={true}
                />
                {this.state.RentalCarFav &&
                this.state.RentalCarFav.length > 0 ? (
                  <MapboxGL.Camera
                    centerCoordinate={[
                      this.state.onScreenDataRentalCarFav == null
                        ? this.state.RentalCarFav[0].slatitude
                        : this.state.onScreenDataRentalCarFav.slatitude,
                      this.state.onScreenDataRentalCarFav == null
                        ? this.state.RentalCarFav[0].slongitude
                        : this.state.onScreenDataRentalCarFav.slongitude,
                    ]}
                    zoomLevel={15}
                    followUserMode={'normal'}
                  />
                ) : null}
                {this.state.RentalCarFav && this.state.RentalCarFav.length > 0
                  ? this.state.RentalCarFav.map((info, index) => (
                      <MapboxGL.MarkerView
                        id={'marker'}
                        coordinate={[info.slatitude, info.slongitude]}>
                        <TouchableOpacity
                          style={{
                            height:
                              this.state.onScreenDataRentalCarFav == null
                                ? 50
                                : this.state.onScreenDataRentalCarFav.id ==
                                  info.id
                                ? 70
                                : 50,
                            width:
                              this.state.onScreenDataRentalCarFav == null
                                ? 100
                                : this.state.onScreenDataRentalCarFav.id ==
                                  info.id
                                ? 120
                                : 100,
                            backgroundColor:
                              this.state.onScreenDataRentalCarFav == null
                                ? 'red'
                                : this.state.onScreenDataRentalCarFav.id ==
                                  info.id
                                ? '#28ae07'
                                : 'red',
                            zIndex:
                              this.state.onScreenDataRentalCarFav == null
                                ? 0
                                : this.state.onScreenDataRentalCarFav.id ==
                                  info.id
                                ? 1
                                : 0,
                            borderRadius: 50,
                            borderColor: '#fff',
                            borderWidth: 3,
                          }}
                          onPress={feature => {
                            this.props.navigation.navigate(
                              'CheckoutScreenEquipment',
                              {
                                datas: info,
                                typeOfRate: this.props.route.params.typeOfRate,
                                cLat: info.slatitude,
                                cLong: info.slongitude,
                                currency: this.props.route.params.currency,
                              },
                            );
                          }}>
                          <MaterialIcons
                            name="car-rental"
                            size={10}
                            color="white"
                            style={{alignSelf: 'center', paddingTop: 5}}
                          />
                          <Text
                            style={{
                              alignSelf: 'center',
                              color: 'white',
                              fontSize: 10,
                            }}>
                            {info.ColorMotor} {info.MBrand} {info.VModel}{' '}
                          </Text>
                          {!info.StatHourPrice ? null : (
                            <View
                              style={{
                                flexDirection: 'row',
                                alignSelf: 'center',
                              }}>
                              <Text
                                style={{
                                  fontSize: 10,
                                  alignSelf: 'center',
                                  color: 'white',
                                  fontStyle: 'italic',
                                  borderRadius: 5,
                                  fontSize: 10,
                                }}>
                                {this.props.route.params.currency}
                                {parseFloat(info.HourPrice)
                                  .toFixed(2)
                                  .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 10,
                                  alignSelf: 'center',
                                  color: 'white',
                                  fontStyle: 'italic',
                                  borderRadius: 5,
                                  fontSize: 10,
                                }}>
                                /Hour
                              </Text>
                            </View>
                          )}

                          {!info.StatDayPrice ? null : (
                            <View
                              style={{
                                flexDirection: 'row',
                                alignSelf: 'center',
                              }}>
                              <Text
                                style={{
                                  fontSize: 10,
                                  alignSelf: 'center',
                                  color: 'white',
                                  fontStyle: 'italic',
                                  borderRadius: 5,
                                  fontSize: 10,
                                }}>
                                {this.props.route.params.currency}
                                {parseFloat(info.DayPrice)
                                  .toFixed(2)
                                  .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 10,
                                  alignSelf: 'center',
                                  color: 'white',
                                  fontStyle: 'italic',
                                  borderRadius: 5,
                                  fontSize: 10,
                                }}>
                                /Day
                              </Text>
                            </View>
                          )}
                          {!info.StatWeeklyPrice ? null : (
                            <View
                              style={{
                                flexDirection: 'row',
                                alignSelf: 'center',
                              }}>
                              <Text
                                style={{
                                  fontSize: 10,
                                  alignSelf: 'center',
                                  color: 'white',
                                  fontStyle: 'italic',
                                  borderRadius: 5,
                                  fontSize: 10,
                                }}>
                                {this.props.route.params.currency}
                                {parseFloat(info.WeeklyPrice)
                                  .toFixed(2)
                                  .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 10,
                                  alignSelf: 'center',
                                  color: 'white',
                                  fontStyle: 'italic',
                                  borderRadius: 5,
                                  fontSize: 10,
                                }}>
                                /Week
                              </Text>
                            </View>
                          )}
                          {!info.StatMonthlyPrice ? null : (
                            <View
                              style={{
                                flexDirection: 'row',
                                alignSelf: 'center',
                              }}>
                              <Text
                                style={{
                                  fontSize: 10,
                                  alignSelf: 'center',
                                  color: 'white',
                                  fontStyle: 'italic',
                                  borderRadius: 5,
                                  fontSize: 10,
                                }}>
                                {this.props.route.params.currency}
                                {parseFloat(info.MonthlyPrice)
                                  .toFixed(2)
                                  .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 10,
                                  alignSelf: 'center',
                                  color: 'white',
                                  fontStyle: 'italic',
                                  borderRadius: 5,
                                  fontSize: 10,
                                }}>
                                /Month
                              </Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      </MapboxGL.MarkerView>
                    ))
                  : null}
              </MapboxGL.MapView>

              <FlatList
                key={'3'}
                data={this.state.RentalCarFav}
                horizontal
                style={{bottom: 0, position: 'absolute', flex: 100}}
                onViewableItemsChanged={this.onViewableItemsChangedRentalCarFav}
                viewabilityConfig={{viewAreaCoveragePercentThreshold: 50}}
                renderItem={({item, index}) => (
                  <Card
                    transparent
                    style={{
                      flex: 1,
                      width: SCREEN_WIDTH / 2.1,
                      marginRight: 10,
                    }}>
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
                      }}>
                      <TouchableOpacity
                        style={{width: SCREEN_WIDTH / 2 - 5, flex: 1}}
                        onPress={feature => {
                          this.props.navigation.navigate(
                            'CheckoutScreenEquipment',
                            {
                              datas: item,
                              typeOfRate: this.props.route.params.typeOfRate,
                              cLat: item.slatitude,
                              cLong: item.slongitude,
                              currency: this.props.route.params.currency,
                            },
                          );
                        }}>
                        <FastImage
                          style={styles.productPhoto}
                          source={{
                            uri:
                              item.imageArray[0] == 'AddImage'
                                ? item.imageArray[1]
                                : item.imageArray[0],
                            headers: {Authorization: 'someAuthToken'},
                            priority: FastImage.priority.normal,
                          }}
                          resizeMode={FastImage.resizeMode.cover}>
                          {this.state.Favorites == undefined ? null : this.state
                              .Favorites.RentalCarFav == undefined ? (
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
                              onPress={() => this.addToFavCar(item.id)}
                            />
                          ) : !this.state.Favorites.RentalCarFav.includes(
                              item.id,
                            ) ? (
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
                              onPress={() => this.addToFavCar(item.id)}
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
                              onPress={() => this.removeFavCar(item.id)}
                            />
                          )}
                          {!item.StatHourPrice ? null : (
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
                                {this.props.route.params.currency}
                                {parseFloat(item.HourPrice)
                                  .toFixed(2)
                                  .replace(
                                    /(\d)(?=(\d{3})+(?!\d))/g,
                                    '$1,',
                                  )}{' '}
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

                          {!item.StatDayPrice ? null : (
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
                                {this.props.route.params.currency}
                                {parseFloat(item.DayPrice)
                                  .toFixed(2)
                                  .replace(
                                    /(\d)(?=(\d{3})+(?!\d))/g,
                                    '$1,',
                                  )}{' '}
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
                          {!item.StatWeeklyPrice ? null : (
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
                                {this.props.route.params.currency}
                                {parseFloat(item.WeeklyPrice)
                                  .toFixed(2)
                                  .replace(
                                    /(\d)(?=(\d{3})+(?!\d))/g,
                                    '$1,',
                                  )}{' '}
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
                          {!item.StatMonthlyPrice ? null : (
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
                                {this.props.route.params.currency}
                                {parseFloat(item.MonthlyPrice)
                                  .toFixed(2)
                                  .replace(
                                    /(\d)(?=(\d{3})+(?!\d))/g,
                                    '$1,',
                                  )}{' '}
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
                          <Text
                            numberOfLines={1}
                            style={styles.categoriesStoreName}>
                            {item.MBrand} {item.VModel}{' '}
                          </Text>
                        </View>
                        <View style={{flexDirection: 'row'}}>
                          <Text
                            style={{
                              fontStyle: 'italic',
                              fontSize: 10,
                              paddingLeft: 20,
                            }}>
                            Color : {item.ColorMotor}
                          </Text>
                        </View>
                        <Text
                          style={{
                            fontStyle: 'italic',
                            fontSize: 10,
                            paddingLeft: 20,
                          }}>
                          Type :{item.name}
                        </Text>
                      </TouchableOpacity>
                    </Box>
                  </Card>
                )}
              />
            </View>
          ) : this.state.customStyleIndex == 4 ? (
            //Custome index else
            <View
              style={{
                position: 'absolute',

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
                  top: 105,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
                attributionEnabled={false}
                logoEnabled={false}>
                <MapboxGL.UserLocation
                  visible={true}
                  showsUserHeadingIndicator={true}
                />
                {this.state.RentalEqFav && this.state.RentalEqFav.length > 0 ? (
                  <MapboxGL.Camera
                    centerCoordinate={[
                      this.state.onScreenDataRentalEqFav == null
                        ? this.state.RentalEqFav[0].slatitude
                        : this.state.onScreenDataRentalEqFav.slatitude,
                      this.state.onScreenDataRentalEqFav == null
                        ? this.state.RentalEqFav[0].slongitude
                        : this.state.onScreenDataRentalEqFav.slongitude,
                    ]}
                    zoomLevel={15}
                    followUserMode={'normal'}
                  />
                ) : null}
                {this.state.RentalEqFav && this.state.RentalEqFav.length > 0
                  ? this.state.RentalEqFav.map((info, index) => (
                      <MapboxGL.MarkerView
                        id={'marker'}
                        coordinate={[info.slatitude, info.slongitude]}>
                        <TouchableOpacity
                          style={{
                            height:
                              this.state.onScreenDataRentalEqFav == null
                                ? 50
                                : this.state.onScreenDataRentalEqFav.id ==
                                  info.id
                                ? 70
                                : 50,
                            width:
                              this.state.onScreenDataRentalEqFav == null
                                ? 100
                                : this.state.onScreenDataRentalEqFav.id ==
                                  info.id
                                ? 120
                                : 100,
                            backgroundColor:
                              this.state.onScreenDataRentalEqFav == null
                                ? 'red'
                                : this.state.onScreenDataRentalEqFav.id ==
                                  info.id
                                ? '#28ae07'
                                : 'red',
                            zIndex:
                              this.state.onScreenDataRentalEqFav == null
                                ? 0
                                : this.state.onScreenDataRentalEqFav.id ==
                                  info.id
                                ? 1
                                : 0,
                            borderRadius: 50,
                            borderColor: '#fff',
                            borderWidth: 3,
                          }}
                          onPress={feature => {
                            this.props.navigation.navigate(
                              'CheckoutScreenEquipment',
                              {
                                datas: info,
                                typeOfRate: this.props.route.params.typeOfRate,
                                cLat: info.slatitude,
                                cLong: info.slongitude,
                                currency: this.props.route.params.currency,
                              },
                            );
                          }}>
                          <MaterialCommunityIcons
                            name="tools"
                            size={10}
                            color="white"
                            style={{alignSelf: 'center', paddingTop: 5}}
                          />
                          <Text
                            style={{
                              alignSelf: 'center',
                              color: 'white',
                              fontSize: 10,
                            }}>
                            {info.name}
                          </Text>
                          {!info.StatHourPrice ? null : (
                            <View
                              style={{
                                flexDirection: 'row',
                                alignSelf: 'center',
                              }}>
                              <Text
                                style={{
                                  fontSize: 10,
                                  alignSelf: 'center',
                                  color: 'white',
                                  fontStyle: 'italic',
                                  borderRadius: 5,
                                  fontSize: 10,
                                }}>
                                {this.props.route.params.currency}
                                {parseFloat(info.HourPrice)
                                  .toFixed(2)
                                  .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 10,
                                  alignSelf: 'center',
                                  color: 'white',
                                  fontStyle: 'italic',
                                  borderRadius: 5,
                                  fontSize: 10,
                                }}>
                                /Hour
                              </Text>
                            </View>
                          )}

                          {!info.StatDayPrice ? null : (
                            <View
                              style={{
                                flexDirection: 'row',
                                alignSelf: 'center',
                              }}>
                              <Text
                                style={{
                                  fontSize: 10,
                                  alignSelf: 'center',
                                  color: 'white',
                                  fontStyle: 'italic',
                                  borderRadius: 5,
                                  fontSize: 10,
                                }}>
                                {this.props.route.params.currency}
                                {parseFloat(info.DayPrice)
                                  .toFixed(2)
                                  .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 10,
                                  alignSelf: 'center',
                                  color: 'white',
                                  fontStyle: 'italic',
                                  borderRadius: 5,
                                  fontSize: 10,
                                }}>
                                /Day
                              </Text>
                            </View>
                          )}
                          {!info.StatWeeklyPrice ? null : (
                            <View
                              style={{
                                flexDirection: 'row',
                                alignSelf: 'center',
                              }}>
                              <Text
                                style={{
                                  fontSize: 10,
                                  alignSelf: 'center',
                                  color: 'white',
                                  fontStyle: 'italic',
                                  borderRadius: 5,
                                  fontSize: 10,
                                }}>
                                {this.props.route.params.currency}
                                {parseFloat(info.WeeklyPrice)
                                  .toFixed(2)
                                  .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 10,
                                  alignSelf: 'center',
                                  color: 'white',
                                  fontStyle: 'italic',
                                  borderRadius: 5,
                                  fontSize: 10,
                                }}>
                                /Week
                              </Text>
                            </View>
                          )}
                          {!info.StatMonthlyPrice ? null : (
                            <View
                              style={{
                                flexDirection: 'row',
                                alignSelf: 'center',
                              }}>
                              <Text
                                style={{
                                  fontSize: 10,
                                  alignSelf: 'center',
                                  color: 'white',
                                  fontStyle: 'italic',
                                  borderRadius: 5,
                                  fontSize: 10,
                                }}>
                                {this.props.route.params.currency}
                                {parseFloat(info.MonthlyPrice)
                                  .toFixed(2)
                                  .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 10,
                                  alignSelf: 'center',
                                  color: 'white',
                                  fontStyle: 'italic',
                                  borderRadius: 5,
                                  fontSize: 10,
                                }}>
                                /Month
                              </Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      </MapboxGL.MarkerView>
                    ))
                  : null}
              </MapboxGL.MapView>

              <FlatList
                key={'2'}
                data={this.state.RentalEqFav}
                horizontal
                style={{bottom: 0, position: 'absolute', flex: 100}}
                onViewableItemsChanged={this.onViewableItemsChangedRentalEqFav}
                viewabilityConfig={{viewAreaCoveragePercentThreshold: 50}}
                renderItem={({item, index}) => (
                  <Card
                    transparent
                    style={{
                      flex: 1,
                      width: SCREEN_WIDTH / 2.1,
                      marginRight: 10,
                    }}>
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
                      }}>
                      <TouchableOpacity
                        style={{width: SCREEN_WIDTH / 2 - 5, flex: 1}}
                        onPress={feature => {
                          this.props.navigation.navigate(
                            'CheckoutScreenEquipment',
                            {
                              datas: item,
                              typeOfRate: this.props.route.params.typeOfRate,
                              cLat: item.slatitude,
                              cLong: item.slongitude,
                              currency: this.props.route.params.currency,
                            },
                          );
                        }}>
                        <FastImage
                          style={styles.productPhoto}
                          source={{
                            uri:
                              item.imageArray[0] == 'AddImage'
                                ? item.imageArray[1]
                                : item.imageArray[0],
                            headers: {Authorization: 'someAuthToken'},
                            priority: FastImage.priority.normal,
                          }}
                          resizeMode={FastImage.resizeMode.cover}>
                          {this.state.Favorites == undefined ? null : this.state
                              .Favorites.RentalEqFav == undefined ? (
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
                              onPress={() => this.addToFavEq(item.id)}
                            />
                          ) : !this.state.Favorites.RentalEqFav.includes(
                              item.id,
                            ) ? (
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
                              onPress={() => this.addToFavEq(item.id)}
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
                              onPress={() => this.removeFavEq(item.id)}
                            />
                          )}

                          {!item.StatHourPrice ? null : (
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
                                {this.props.route.params.currency}
                                {parseFloat(item.HourPrice)
                                  .toFixed(2)
                                  .replace(
                                    /(\d)(?=(\d{3})+(?!\d))/g,
                                    '$1,',
                                  )}{' '}
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

                          {!item.StatDayPrice ? null : (
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
                                {this.props.route.params.currency}
                                {parseFloat(item.DayPrice)
                                  .toFixed(2)
                                  .replace(
                                    /(\d)(?=(\d{3})+(?!\d))/g,
                                    '$1,',
                                  )}{' '}
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
                          {!item.StatWeeklyPrice ? null : (
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
                                {this.props.route.params.currency}
                                {parseFloat(item.WeeklyPrice)
                                  .toFixed(2)
                                  .replace(
                                    /(\d)(?=(\d{3})+(?!\d))/g,
                                    '$1,',
                                  )}{' '}
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
                          {!item.StatMonthlyPrice ? null : (
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
                                {this.props.route.params.currency}
                                {parseFloat(item.MonthlyPrice)
                                  .toFixed(2)
                                  .replace(
                                    /(\d)(?=(\d{3})+(?!\d))/g,
                                    '$1,',
                                  )}{' '}
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
                          <Text
                            numberOfLines={1}
                            style={styles.categoriesStoreName}>
                            {item.MBrand} {item.VModel}{' '}
                          </Text>
                        </View>
                        <View style={{flexDirection: 'row'}}>
                          <Text
                            style={{
                              fontStyle: 'italic',
                              fontSize: 10,
                              paddingLeft: 20,
                            }}>
                            Color : {item.ColorMotor}
                          </Text>
                        </View>
                        <Text
                          style={{
                            fontStyle: 'italic',
                            fontSize: 10,
                            paddingLeft: 20,
                          }}>
                          Type :{item.name}
                        </Text>
                      </TouchableOpacity>
                    </Box>
                  </Card>
                )}
              />
            </View>
          ) : (
            //Custome index else
            <View
              style={{
                position: 'absolute',

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
                  top: 105,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
                attributionEnabled={false}
                logoEnabled={false}>
                <MapboxGL.UserLocation
                  visible={true}
                  showsUserHeadingIndicator={true}
                />
                {this.state.ServiceFav && this.state.ServiceFav.length > 0 ? (
                  <MapboxGL.Camera
                    centerCoordinate={[
                      this.state.onScreenDataServiceFav == null
                        ? this.state.ServiceFav[0].slongitude
                        : this.state.onScreenDataServiceFav.slongitude,
                      this.state.onScreenDataServiceFav == null
                        ? this.state.ServiceFav[0].slatitude
                        : this.state.onScreenDataServiceFav.slatitude,
                    ]}
                    zoomLevel={15}
                    followUserMode={'normal'}
                  />
                ) : null}
                {this.state.ServiceFav && this.state.ServiceFav.length > 0
                  ? this.state.ServiceFav.map((info, index) => (
                      <MapboxGL.MarkerView
                        id={'marker'}
                        coordinate={[info.slongitude, info.slatitude]}>
                        <TouchableOpacity
                          style={{
                            height:
                              this.state.onScreenDataServiceFav == null
                                ? 50
                                : this.state.onScreenDataServiceFav.id ==
                                  info.id
                                ? 70
                                : 50,
                            width:
                              this.state.onScreenDataServiceFav == null
                                ? 100
                                : this.state.onScreenDataServiceFav.id ==
                                  info.id
                                ? 120
                                : 100,
                            backgroundColor:
                              this.state.onScreenDataServiceFav == null
                                ? 'red'
                                : this.state.onScreenDataServiceFav.id ==
                                  info.id
                                ? '#28ae07'
                                : 'red',
                            zIndex:
                              this.state.onScreenDataServiceFav == null
                                ? 0
                                : this.state.onScreenDataServiceFav.id ==
                                  info.id
                                ? 1
                                : 0,

                            borderRadius: 50,
                            borderColor: '#fff',
                            borderWidth: 3,
                          }}
                          onPress={feature => {
                            this.props.navigation.navigate(
                              'CheckoutScreenService',
                              {
                                datas: info,
                                cLat: info.slatitude,
                                cLong: info.slongitude,
                                typeOfRate: this.props.route.params.typeOfRate,
                                currency: this.props.route.params.currency,
                                selectedCityUser:
                                  this.props.route.params.selectedCityUser,
                              },
                            );
                          }}>
                          <MaterialCommunityIcons
                            name="home-city"
                            size={10}
                            color="white"
                            style={{alignSelf: 'center', paddingTop: 5}}
                          />
                          <Text
                            style={{
                              alignSelf: 'center',
                              color: 'white',
                              fontSize: 10,
                              fontWeight: 'bold',
                            }}>
                            {info.name}
                          </Text>
                          {!info.StatHourPrice ? null : (
                            <Text
                              style={{
                                fontSize: 10,
                                fontWeight: 'bold',
                                alignSelf: 'center',
                                color: 'white',
                                padding: 1,
                              }}>
                              {this.props.route.params.currency}
                              {parseFloat(info.HourPrice)
                                .toFixed(2)
                                .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                              /Hour
                            </Text>
                          )}

                          {!info.StatDayPrice ? null : (
                            <Text
                              style={{
                                fontSize: 10,
                                fontWeight: 'bold',
                                alignSelf: 'center',
                                color: 'white',
                                padding: 1,
                              }}>
                              {this.props.route.params.currency}
                              {parseFloat(info.DayPrice)
                                .toFixed(2)
                                .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                              /Day
                            </Text>
                          )}
                          {!info.StatWeeklyPrice ? null : (
                            <Text
                              style={{
                                fontSize: 10,
                                fontWeight: 'bold',
                                alignSelf: 'center',
                                color: 'white',
                                padding: 1,
                              }}>
                              {this.props.route.params.currency}
                              {parseFloat(info.WeeklyPrice)
                                .toFixed(2)
                                .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                              /Week
                            </Text>
                          )}
                          {!info.StatMonthlyPrice ? null : (
                            <Text
                              style={{
                                fontSize: 10,
                                fontWeight: 'bold',
                                alignSelf: 'center',
                                color: 'white',
                                padding: 1,
                              }}>
                              {this.props.route.params.currency}
                              {parseFloat(info.MonthlyPrice)
                                .toFixed(2)
                                .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                              /Month
                            </Text>
                          )}
                          {info.ratemode == 'Others' ? (
                            <Text
                              style={{
                                fontSize: 10,
                                fontWeight: 'bold',
                                alignSelf: 'center',
                                color: 'white',
                                padding: 1,
                              }}>
                              {parseFloat(info.DayPrice)
                                .toFixed(2)
                                .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                              /{info.newratemode}
                            </Text>
                          ) : null}
                        </TouchableOpacity>
                      </MapboxGL.MarkerView>
                    ))
                  : null}
              </MapboxGL.MapView>

              <FlatList
                key={'1'}
                data={this.state.ServiceFav}
                horizontal
                style={{bottom: 0, position: 'absolute', flex: 100}}
                onViewableItemsChanged={this.onViewableItemsChangedServiceFav}
                viewabilityConfig={{viewAreaCoveragePercentThreshold: 50}}
                renderItem={({item, index}) => (
                  <Card
                    transparent
                    style={{
                      flex: 1,
                      width: SCREEN_WIDTH / 2.1,
                      marginRight: 10,
                    }}>
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
                      }}>
                      <TouchableOpacity
                        style={{width: SCREEN_WIDTH / 2 - 5, flex: 1}}
                        onPress={feature => {
                          this.props.navigation.navigate(
                            'CheckoutScreenService',
                            {
                              datas: item,
                              cLat: item.slatitude,
                              cLong: item.slongitude,
                              typeOfRate: this.props.route.params.typeOfRate,
                              currency: this.props.route.params.currency,
                              selectedCityUser:
                                this.props.route.params.selectedCityUser,
                            },
                          );
                        }}>
                        <FastImage
                          style={styles.productPhoto}
                          source={{
                            uri:
                              item.imageArray[0] == 'AddImage'
                                ? item.imageArray[1]
                                : item.imageArray[0],
                            headers: {Authorization: 'someAuthToken'},
                            priority: FastImage.priority.normal,
                          }}
                          resizeMode={FastImage.resizeMode.cover}>
                          {this.state.Favorites == undefined ? null : this.state
                              .Favorites.ServiceFav == undefined ? (
                            <AntDesign
                              name="hearto"
                              size={21}
                              color="salmon"
                              style={{
                                backgroundColor: 'white',
                                width: 32,
                                marginLeft: SCREEN_WIDTH / 2.6,
                                height: 32,
                                marginTop: 5,
                                padding: 5,
                                borderRadius: 5,
                              }}
                              onPress={() => this.addToFavSer(item.id)}
                            />
                          ) : !this.state.Favorites.ServiceFav.includes(
                              item.id,
                            ) ? (
                            <AntDesign
                              name="hearto"
                              size={21}
                              color="salmon"
                              style={{
                                backgroundColor: 'white',
                                width: 32,
                                marginLeft: SCREEN_WIDTH / 2.6,
                                height: 32,
                                marginTop: 5,
                                padding: 5,
                                borderRadius: 5,
                              }}
                              onPress={() => this.addToFavSer(item.id)}
                            />
                          ) : (
                            <AntDesign
                              name="heart"
                              size={21}
                              color="salmon"
                              style={{
                                backgroundColor: 'white',
                                width: 32,
                                marginLeft: SCREEN_WIDTH / 2.6,
                                height: 32,
                                marginTop: 5,
                                padding: 5,
                                borderRadius: 5,
                              }}
                              onPress={() => this.removeFavSer(item.id)}
                            />
                          )}
                        </FastImage>
                        <View style={{height: 20, flexShrink: 1}}>
                          <Text
                            numberOfLines={1}
                            style={styles.categoriesStoreName}>
                            {item.name}
                          </Text>
                        </View>

                        {!item.StatHourPrice ? null : (
                          <Text
                            style={{
                              fontStyle: 'italic',
                              fontSize: 12,
                              paddingLeft: 20,
                            }}>
                            Hour Rate : {this.props.route.params.currency}
                            {parseFloat(item.HourPrice)
                              .toFixed(2)
                              .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                          </Text>
                        )}

                        {!item.StatDayPrice ? null : (
                          <Text
                            style={{
                              fontStyle: 'italic',
                              fontSize: 12,
                              paddingLeft: 20,
                            }}>
                            Daily Rate : {this.props.route.params.currency}
                            {parseFloat(item.DayPrice)
                              .toFixed(2)
                              .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                          </Text>
                        )}
                        {!item.StatWeeklyPrice ? null : (
                          <Text
                            style={{
                              fontStyle: 'italic',
                              fontSize: 12,
                              paddingLeft: 20,
                            }}>
                            Weekly Rate : {this.props.route.params.currency}
                            {parseFloat(item.WeeklyPrice)
                              .toFixed(2)
                              .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                          </Text>
                        )}
                        {!item.StatMonthlyPrice ? null : (
                          <Text
                            style={{
                              fontStyle: 'italic',
                              fontSize: 12,
                              paddingLeft: 20,
                            }}>
                            Montly Rate : {this.props.route.params.currency}
                            {parseFloat(item.MonthlyPrice)
                              .toFixed(2)
                              .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                          </Text>
                        )}
                        {item.ratemode == 'Others' ? (
                          <Text
                            style={{
                              fontStyle: 'italic',
                              fontSize: 12,
                              paddingLeft: 20,
                            }}>
                            {parseFloat(item.DayPrice)
                              .toFixed(2)
                              .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                            /{item.newratemode}
                          </Text>
                        ) : null}
                        <View style={{flexDirection: 'row'}}>
                          <Text
                            style={{
                              fontStyle: 'italic',
                              fontSize: 10,
                              paddingLeft: 20,
                              paddingBottom: 5,
                            }}>
                            Service Provider :{item.store_name}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </Box>
                  </Card>
                )}
              />
            </View>
          )}

          <Modal
            isVisible={this.state.isVisibleAddons}
            onBackButtonPress={() => this.setState({isVisibleAddons: false})}
            animationInTiming={500}
            animationOutTiming={500}
            animationIn="slideInRight"
            animationOut="slideOutRight"
            useNativeDriver={true}
            style={style.modal}>
            <ScrollView style={styles.container}>
              <View style={styles.carouselContainer}>
                <View style={[styles.carousel, {height: 200}]}>
                  {console.log('image: ', this.state.image)}

                  <FastImage
                    source={{
                      uri: this.state.image[0],
                      headers: {Authorization: 'someAuthToken'},
                      priority: FastImage.priority.normal,
                    }}
                    resizeMode={FastImage.resizeMode.cover}></FastImage>
                </View>
              </View>
              <View>
                <View style={{flexDirection: 'row', width: SCREEN_WIDTH}}>
                  <Text style={styles.infoRecipeName}>{this.state.name}</Text>
                  <Text
                    style={{
                      fontSize: 17,
                      fontWeight: 'bold',
                      position: 'absolute',
                      right: 20,
                      top: 10,
                    }}>
                    {this.props.route.params.currency} {this.state.price}
                  </Text>
                </View>
                <View style={{flex: 1, padding: 10, backgroundColor: 'white'}}>
                  {this.state.productss.map((object, d) => (
                    <View key={d}>
                      <Divider style={{height: 1}} />
                      <Text
                        style={{
                          fontSize: 17,
                          marginVertical: 2,
                          fontWeight: 'bold',
                          marginLeft: 10,
                        }}>
                        {object.title}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          marginVertical: 2,
                          marginLeft: 10,
                        }}>
                        (
                        {object.mode == 'Single'
                          ? 'Select one'
                          : 'Select up to 2'}
                        )
                      </Text>
                      {object.data.map((drink, i) => (
                        <View key={i}>
                          {object.mode == 'Single' ? (
                            <Box
                              style={{flexDirection: 'row', flex: 1}}
                              button
                              onPress={() =>
                                this.checkDrink(drink, object.data)
                              }>
                              <View style={{justifyContent: 'flex-start'}}>
                                <RadioButton
                                  value={drink.price}
                                  status={drink.isChecked}
                                  color={'red'}
                                  onPress={() =>
                                    this.checkDrink(drink, object.data)
                                  }
                                />
                              </View>
                              <View
                                style={{justifyContent: 'flex-start', flex: 5}}>
                                <Text style={{fontSize: 14}}>
                                  {drink.label}
                                </Text>
                              </View>
                              <View
                                style={{justifyContent: 'flex-end', flex: 1}}>
                                <Text
                                  style={{fontSize: 15, fontWeight: 'bold'}}>
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
                                  ? this.checkDrinkmunchecked(
                                      drink,
                                      object.data,
                                    )
                                  : this.checkDrinkm(drink, object.data);
                              }}>
                              <View style={{justifyContent: 'flex-start'}}>
                                <Checkbox
                                  value={drink.price}
                                  status={drink.isChecked}
                                  color={'red'}
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
                                <Text style={{fontSize: 14}}>
                                  {drink.label}
                                </Text>
                              </View>
                              <View
                                style={{justifyContent: 'flex-end', flex: 1}}>
                                <Text
                                  style={{fontSize: 15, fontWeight: 'bold'}}>
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
                <Button transparent>
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
                  style={{backgroundColor: '#019fe8', borderRadius: 10}}
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
      </Box>
    );
  }
}

const style = StyleSheet.create({
  Box: {
  },
  cardLayoutView: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff9c4',
  },
  paragraphHeading: {
    margin: 24,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'green',
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    textAlign: 'center',
  },
  logo: {
    height: 130,
    width: 130,
    marginBottom: 20,
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
