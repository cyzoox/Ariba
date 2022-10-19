import React, {Component} from 'react';
import {
  FlatList,
  TouchableOpacity,
  Dimensions,
  View,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableHighlight,
  Image,
  Pressable,
} from 'react-native';
import {
  Button,
  Text,
  Box,
  HStack,
  Input,StatusBar
} from 'native-base';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import FastImage from 'react-native-fast-image';
const SCREEN_WIDTH = Dimensions.get('window').width;
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomHeader from '../screens/Header';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import AntDesign from 'react-native-vector-icons/AntDesign';
import styles from './styles';
import Modal from 'react-native-modal';
import {RadioButton, Divider} from 'react-native-paper';

export default class Searchbar extends Component {
  constructor(props) {
    super(props);
    const storeId = this.props.route.params.storeId;
    const store_name = this.props.route.params.store_name;

    const notification_token = this.props.route.params.notification_token;
    this.ref = firestore()
      .collection('products')
      .where('storeId', '==', storeId);
    this.state = {
      loading: false,
      data: [],
      error: null,
      items: [],
      searchText: '',
      store_name: store_name,
      token: notification_token,
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
    };

    this.arrayholder = [];
  }
  openModal() {
    this.setState({
      visibleModal: true,
    });
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

    let newItem = {
      id: item.id,
      store_name: this.props.store,
      notification_token: this.props.token,
      note: '',
      qty: this.state.count,
      cluster: item.cluster,
    };
    let cartRef = firestore().collection('cart');
    let updatedCart = [];
    /* Push new cart item */
    updatedCart.push(newItem);
    cartRef.doc(userId).set(Object.assign({}, updatedCart));
  }

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

    let newItem = {
      id: item.id,
      store_name: this.props.store,
      total_addons: this.getAddonsTotal(),
      notification_token: this.props.token,
      note: '',
      cluster: item.cluster,
      choice: this.getAddonsDefault(),
      qty: this.state.count,
      StoreCountry: this.props.route.params.StoreCountry,
      slongitude: this.props.route.params.slongitude,
      slatitude: this.props.route.params.slatitude,
      adminID: item.adminID,
      markup: item.markup == undefined ? false : item.markup,
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
          store_name: this.props.route.params.store_name,
          notification_token: this.props.route.params.token,
          total_addons: this.getAddonsTotal(),
          note: '',
          cluster: item.cluster,
          adminID: item.adminID,
          choice: this.getAddonsDefault(),
          qty: this.state.count,
          StoreCountry: this.props.route.params.StoreCountry,
          slongitude: this.props.route.params.slongitude,
          slatitude: this.props.route.params.slatitude,
          markup: item.markup == undefined ? false : item.markup,
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

  async onAddToCart(item) {
    const {cart} = this.state;
    const userId = auth().currentUser.uid;
    console.log(item.id);
    console.log(this.props.route.params.store_name);
    console.log(this.props.route.params.slongitude);
    console.log(this.props.route.params.slatitude);
    console.log(this.props.route.params.token);
    console.log(item.cluster);
    console.log(item.adminID);
    if (userId) {
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
            store_name: this.props.route.params.store_name,
            StoreCountry: this.props.route.params.StoreCountry,
            slongitude: this.props.route.params.slongitude,
            slatitude: this.props.route.params.slatitude,
            notification_token: this.props.route.params.token,
            note: '',
            qty: 1,
            cluster: item.cluster,
            adminID: item.adminID,
            markup: item.markup == undefined ? false : item.markup,
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
    } else {
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

  FoodAddons(item) {
    let img = [];
    let add = [];
    this.setState({
      isVisibleAddons: true,
      StoreCountry: this.props.route.params.StoreCountry,
      slongitude: this.props.route.params.slongitude,
      slatitude: this.props.route.params.slatitude,
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
      markup: item.markup == undefined ? false : item.markup,
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

  onSelectionsChange = selectedFruits => {
    // selectedFruits is array of { label, value }
    this.setState({selectedFruits});
  };
  onCollectionUpdate = querySnapshot => {
    const products = [];
    querySnapshot.forEach(doc => {
      products.push({
        datas: doc.data(),
        key: doc.id,
      });
    });

    this.arrayholder = products;
  };

  async componentDidMount() {
    const userId = auth().currentUser.uid;
    this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate);

    if (userId) {
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

  componentWillUnmount() {
    this.unsubscribe() && this.unsubscribe;
  }
  searchFilterFunction = text => {
    const newData = this.arrayholder.filter(item => {
      const itemData = `${item.datas.name.toUpperCase()}   
         ${item.datas.brand.toUpperCase()}`;

      const textData = text.toUpperCase();

      return itemData.indexOf(textData) > -1;
    });
    if (text == '') {
      this.setState({data: []});
    } else {
      this.setState({data: newData});
    }
  };

  router(item) {
    if (!item.status || item.quantity <= 0 || !item.admin_control) {
      return null;
    } else {
      if (item.addons == null || item.addons.length == 0) {
        this.onAddToCart(item);
      } else {
        this.FoodAddons(item);
      }
    }
  }

  rowRenderer = data => {
    const {
      name,
      price,
      quantity,
      featured_image,
      unit,
      status,
      id,
      admin_control,
      storeId,
      sale_price,
      sale_description,
      brand,
      cluster,
      addons,
    } = data;
    return (
      <Box style={{borderRadius: 20}}>
        <Box
          style={{
            backgroundColor: '#fff1f3',
            paddingBottom: 0,
            marginBottom: 0,
            paddingLeft: 0,
            paddingRight: 0,
            paddingTop: 0,
            borderRadius: 20,
            width: SCREEN_WIDTH / 2 - 5,
          }}>
          <TouchableOpacity
            style={{width: SCREEN_WIDTH / 2, flex: 1}}
            onPress={() => this.router(data)}>
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
                <View style={{height: 20, flexShrink: 1, flexDirection: 'row'}}>
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
                      {this.props.route.params.currency}
                      {sale_price}
                      <Text style={[styles.categoriesPrice, {fontSize: 10}]}>
                        / {unit}
                      </Text>
                    </Text>
                    <Text style={styles.categoriesPriceSale}>
                      {this.props.route.params.currency}
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
                      {this.props.route.params.currency}
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
      </Box>

      /* <Box style={{borderRadius: 20, }}>
      <Box style={{backgroundColor:'#fff1f3', paddingBottom: 0, marginBottom: 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0,borderRadius: 20,width:SCREEN_WIDTH/2-5}}>
      <TouchableOpacity style={{width:SCREEN_WIDTH/2-5, flex: 1}} onPress={()=> this.router(data) }>
      <FastImage style={styles.productPhoto} source={{ uri: featured_image, headers: { Authorization: 'someAuthToken' },
                  priority: FastImage.priority.normal, }} 
                  resizeMode={FastImage.resizeMode.cover}
      />
      <View style={{height:20,flexShrink: 1}}>
        <Text  numberOfLines={1} style={styles.categoriesStoreName}>{name}</Text>
      </View>  
            {!admin_control || !status ? 
         <View style={styles.text}>
         <Text style={styles.title}>Unavailable</Text>
       </View>
        :   quantity  <= 0  ?
        <View style={styles.text}>
        <Text style={styles.title}>Out of Stock</Text>
      </View>
        : 
         null
      }
     
     
        <Text style={{fontStyle: "italic",  fontSize: 10, paddingLeft: 20}}>Brand : {brand}</Text>
        <Text style={{fontStyle: "italic",  fontSize: 10, paddingLeft: 20}}>In Stock :{quantity}</Text>

        {sale_price ? 
         [unit ?
        <View style={{flexDirection: "row"}}>     
            <Text style={styles.categoriesPrice}>{this.props.route.params.currency}{sale_price}</Text>
        </View> 
        :
        <View style={{flexDirection: "row"}}>     
        <Text style={styles.categoriesPriceSale}>{this.props.route.params.currency}{sale_price}/ {unit}</Text>  
      </View> 
         ]
        :
        [unit ? 
        <View>
          <Text style={styles.categoriesPrice}>{this.props.route.params.currency}{price}</Text>
        </View>
        :
        <View>
          <Text style={styles.categoriesPrice}>{this.props.route.params.currency}{price}/ {unit}</Text>
        </View>
          ]
        }
    </TouchableOpacity>
    </Box>
    </Box>*/
    );
  };

  render() {
    const {selectedFilter, activeSlide, productss} = this.state;
    return (
      <Box style={{flex: 1}}>
        <CustomHeader
          title={'Search from ' + this.state.store_name}
          navigation={this.props.navigation}
          currency={this.props.route.params.currency}
        />
          <StatusBar bg="#ee4e4e" barStyle="light-content" />
      <Box safeAreaTop bg="#ee4e4e" />
      <HStack bg="#ee4e4e" px="1" py="3" justifyContent="space-between" alignItems="center" w="100%" maxW={SCREEN_WIDTH}>
        <HStack alignItems="center" rounded="md" rounded="md" bg="white" maxW={SCREEN_WIDTH/1} h="38">
        
           <Input
           size="xs"
           rounded="md"
           InputLeftElement={<Fontisto
            name="search"
            size={20}
            color={'#000000'}
           
            style={{paddingLeft:10}}
          />}
              placeholder="Search..."
              onChangeText={text => this.searchFilterFunction(text)}
              style={{top:5}}
            />
            </HStack>
            </HStack>
       
        {this.searchFilterFunction && (
          <FlatList
            data={this.state.data}
            ItemSeparatorComponent={this.ListViewItemSeparator}
            renderItem={({item}) => this.rowRenderer(item.datas)}
            enableEmptySections={true}
            style={{marginTop: 10}}
            numColumns={2}
            columnWrapperStyle={{justifyContent: 'space-between'}}
            keyExtractor={(item, index) => index.toString()}
          />
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
                    fontSize: 17,
                    fontWeight: 'bold',
                    position: 'absolute',
                    right: 20,
                    top: 10,
                  }}>
                  {this.props.currency} {this.state.price}
                </Text>
              </View>
              <View style={{flex: 1, padding: 10, backgroundColor: 'white'}}>
                {productss.map((object, d) => (
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
                      style={{fontSize: 12, marginVertical: 2, marginLeft: 10}}>
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
                            onPress={() => this.checkDrink(drink, object.data)}>
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
                              <Text style={{fontSize: 14}}>{drink.label}</Text>
                            </View>
                            <View style={{justifyContent: 'flex-end', flex: 1}}>
                              <Text style={{fontSize: 15, fontWeight: 'bold'}}>
                                {this.props.currency}
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
                              <Text style={{fontSize: 14}}>{drink.label}</Text>
                            </View>
                            <View style={{justifyContent: 'flex-end', flex: 1}}>
                              <Text style={{fontSize: 15, fontWeight: 'bold'}}>
                                {this.props.currency}
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
