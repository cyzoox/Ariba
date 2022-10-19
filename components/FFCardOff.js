import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Image,
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
  Button,
  Text,
  HStack,
} from 'native-base';

import {RecyclerListView, DataProvider, LayoutProvider} from 'recyclerlistview';
import {LayoutUtil} from './LayoutUtil';
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
import styles from './styles';
import FastImage from 'react-native-fast-image';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import Fontisto from 'react-native-vector-icons/Fontisto';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Modal from 'react-native-modal';
import {RadioButton, Divider, Checkbox} from 'react-native-paper';
import Loader from './Loader';

import AntDesign from 'react-native-vector-icons/AntDesign';

export default class FFCardOff extends Component {
  constructor(props) {
    super(props);
    this.Rotatevalue = new Animated.Value(0);

    this.state = {
      dataProvider: new DataProvider((r1, r2) => {
        return r1 !== r2;
      }),
      layoutProvider: LayoutUtil.getLayoutProvider(0),
      viewType: 1,
      limit: 50,
      lastVisible: null,
      loading: false,
      refreshing: false,
      showMoreBtn: true,
      products: [],
      qty: 0,
      sale: false,
      count: 1,
      selectedFilter: 'Alphabetical-(A-Z)',
      searchEnabled: false,
      cart: [],
      showToast: false,
      isVisibleAddons: false,
      name: '',
      price: 0,
      image: [],
      id: '',
      sale_price: 0,
      unit: '',
      brand: '',
      activeSlide: 0,
      selectedFruits: [],
      addonss: [],
      choice: [],
      productss: [],
    };
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
    this.props.navigation.navigate('Login');
  }

  async addonsdeleteCart(item) {
    this.props.navigation.navigate('Login');
  }

  async addonsAddtoCart(item) {
    this.props.navigation.navigate('Login');
  }

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

  router(item) {
    if (!item.status || item.quantity <= 0) {
      return null;
    } else {
      if (item.addons == null || item.addons.length == 0) {
        console.log('addto cart');
        this.props.navigation.navigate('Login');
      } else {
        console.log('FoodAddons');
        this.props.navigation.navigate('Login');
      }
    }
  }

  rowRenderer = (type, data) => {
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
          }}>
          <TouchableOpacity
            style={{width: SCREEN_WIDTH / 2.1, flex: 1}}
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
      </Box>
    );
  };

  async componentDidMount() {
    this.StartImageRotationFunction();

    this.setState({loading: true});

    this.getAddonsDefault();

    this.loadProducts(false, true);
  }

  /* On unmount, we remove the listener to avoid memory leaks from using the same reference with the off() method: */
  componentWillUnmount() {
    this.unsubscribeCartItems;
    this.unsubscribeProduct && this.unsubscribeProduct();
  }

  loadProducts(loadmore, fromComponent) {
    const self = this;
    var productQuery = firestore()
      .collection('products')
      .where('category', 'array-contains', this.props.title)
      .where('status', '==', true);
    productQuery = productQuery.where('storeId', '==', this.props.storeId);

    if (this.state.searchEnabled) {
      /* If request is from a search (onChangeSearch();), we clear out the product list then load the new search results */
      /* We identify weather the trigger is from a search or a load more button click using "searchEnabled" state */
      this.setState({
        products: [],
        searchEnabled: false,
      });
    }

    switch (this.state.selectedFilter) {
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
      case 'On Sale':
        productQuery = productQuery.where('sale_price', '>', 0);
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
        if (
          change.type === 'added' &&
          change.doc.data().admin_control &&
          change.doc.data().quantity > 0
        ) {
          /* Add more items to the screen... 'quantity', '>', 0) 'admin_control', '==', true */

          productChunk.push({...change.doc.data(), pid: change.doc.id});
        } else if (
          change.type === 'modified' &&
          change.doc.data().admin_control &&
          change.doc.data().quantity > 0
        ) {
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

      this.setState(prevState => ({
        products:
          prevState.products && fromComponent
            ? [...prevState.products, ...productChunk]
            : productChunk,
        dataProvider: this.state.dataProvider.cloneWithRows(
          prevState.products && fromComponent
            ? [...prevState.products, ...productChunk]
            : productChunk,
        ),
        loading: false,
        loadingBtn: false,
        lastVisible: snapshot.docs[snapshot.docs.length - 1],
        showMoreBtn: productChunk.length < this.state.limit ? false : true,
        visibleModal: false,
      }));
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
              color: 'gray',
              paddingVertical: 5,
            }}>
            End.
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
      console.log('dataProvider: ', this.state.dataProvider)
    const RotateData = this.Rotatevalue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '368deg'],
    });

    const trans = {
      transform: [{rotate: RotateData}],
    };
    const {selectedFilter, activeSlide, productss} = this.state;
    return (
        <Box style={{ backgroundColor: '#FFF'}}>
          <HStack
            style={{backgroundColor: '#f06767', height: 46}}>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                width: 200,
                height: 36,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'white',
                marginTop: 5,
                borderRadius: 30,
              }}>
              <TouchableOpacity
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                }}
                onPress={() => {
                  this.props.navigation.navigate('Search', {
                    storeId: this.props.storeId,
                    store_name: this.props.store,
                    currency: this.props.currency,
                    StoreCountry: this.props.StoreCountry,
                    slongitude: this.props.slongitude,
                    slatitude: this.props.slatitude,
                    token: this.props.token,
                  });
                }}
                underlayColor="transparent">
                <View style={{flex: 1}}>
                  <Text style={{justifyContent: 'center', alignSelf: 'center'}}>
                    Search
                  </Text>
                </View>

                <View style={{paddingRight: 10}}>
                  <Fontisto name="search" size={20} color={'#000000'} />
                </View>
              </TouchableOpacity>
            </View>
            <Box style={{flexDirection: 'row', paddingLeft: 5, top: 10}}>
              <FontAwesome name="sliders" size={20} color={'#FFFFFF'} />
              <TouchableOpacity
                style={{paddingLeft: 5}}
                onPress={() => this.openModal()}>
                <Text style={{color: '#FFFFFF'}}>Filters</Text>
              </TouchableOpacity>
            </Box>
          </HStack>
          <Loader loading={this.state.loading} trans={trans} />
          <View style={{flex:1}}>
          <RecyclerListView
            style={{flex: 1,minHeight: SCREEN_HEIGHT, minWidth: 1,marginLeft:5}}
            rowRenderer={this.rowRenderer}
            dataProvider={this.state.dataProvider}
            layoutProvider={this.state.layoutProvider}
            renderFooter={this.renderFooter}
          />
</View>
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
                Select Filter
              </Text>
              <Divider />
              <View style={{flexDirection: 'row'}}>
                <RadioButton
                  value="Price-Ascending"
                  status={
                    selectedFilter === 'Price-Ascending'
                      ? 'checked'
                      : 'unchecked'
                  }
                  onPress={() => {
                    this.setState({selectedFilter: 'Price-Ascending'});
                  }}
                />
                <Text style={{padding: 5}}>Price-Ascending</Text>
              </View>
              <View style={{flexDirection: 'row'}}>
                <RadioButton
                  value="Price-Descending"
                  status={
                    selectedFilter === 'Price-Descending'
                      ? 'checked'
                      : 'unchecked'
                  }
                  onPress={() => {
                    this.setState({selectedFilter: 'Price-Descending'});
                  }}
                />
                <Text style={{padding: 5}}>Price-Descending</Text>
              </View>
              <View style={{flexDirection: 'row'}}>
                <RadioButton
                  value="Alphabetical-(A-Z)"
                  status={
                    selectedFilter === 'Alphabetical-(A-Z)'
                      ? 'checked'
                      : 'unchecked'
                  }
                  onPress={() => {
                    this.setState({selectedFilter: 'Alphabetical-(A-Z)'});
                  }}
                />
                <Text style={{padding: 5}}>Alphabetical-(A-Z)</Text>
              </View>
              <View style={{flexDirection: 'row'}}>
                <RadioButton
                  value="Alphabetical-(Z-A)"
                  status={
                    selectedFilter === 'Alphabetical-(Z-A)'
                      ? 'checked'
                      : 'unchecked'
                  }
                  onPress={() => {
                    this.setState({selectedFilter: 'Alphabetical-(Z-A)'});
                  }}
                />
                <Text style={{padding: 5}}>Alphabetical-(Z-A)</Text>
              </View>
              <View style={{flexDirection: 'row'}}>
                <RadioButton
                  value="On Sale"
                  status={
                    selectedFilter === 'On Sale' ? 'checked' : 'unchecked'
                  }
                  onPress={() => {
                    this.setState({selectedFilter: 'On Sale'});
                  }}
                />
                <Text style={{padding: 5}}>On Sale</Text>
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
