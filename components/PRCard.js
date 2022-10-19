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
  Animated,
} from 'react-native';
import {
  Button,
  Text,
  Box,
  HStack
} from 'native-base';

import {RecyclerListView, DataProvider, LayoutProvider} from 'recyclerlistview';
import {LayoutUtil} from './LayoutUtil';
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
import styles from './styles';
import FastImage from 'react-native-fast-image';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Modal from 'react-native-modal';
import {RadioButton, Divider} from 'react-native-paper';
import Loader from './Loader';

import AntDesign from 'react-native-vector-icons/AntDesign';

export default class PRCard extends Component {
  constructor(props) {
    super(props);
    this.Rotatevalue = new Animated.Value(0);
    this.cartRef = firestore().collection('cart');
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

  onSelectionsChange = selectedFruits => {
    // selectedFruits is array of { label, value }
    this.setState({selectedFruits});
  };

  router(item) {
    console.log('working here only Redirect');
    if (!item.status) {
      return null;
    } else {
      console.log('Redirect');
      this.props.navigation.navigate('CheckoutScreenRentals', {
        datas: item,
        cLat: item.slatitude,
        cLong: item.slongitude,
        typeOfRate: this.props.typeOfRate,
        currency: this.props.currency,
      });
    }
  }

  rowRenderer = (type, data) => {
    const {
      origPrice,
      name,
      price,
      quantity,
      maxGuest,
      imageArray,
      unit,
      status,
      id,
      admin_control,
      storeId,
      DayPrice,
      HourPrice,
      MonthlyPrice,
      StatDayPrice,
      StatHourPrice,
      StatMonthlyPrice,
      StatWeeklyPrice,
      WeeklyPrice,
      brand,
      cluster,
      addons,
    } = data;
    const newData = imageArray.filter(items => {
      const itemData = items;
      const textData = 'AddImage';

      return itemData.indexOf(textData) == -1;
    });
    return (
      <Box
        transparent
        style={{flex: 1, justifyContent: 'center', alignContent: 'center', top:-80}}>
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
            onPress={() => this.router(data)}>
            <FastImage
              style={styles.productPhoto}
              source={{
                uri: newData[0],
                headers: {Authorization: 'someAuthToken'},
                priority: FastImage.priority.normal,
              }}
              resizeMode={FastImage.resizeMode.cover}>
              {this.state.customerInfo == undefined ? null : this.state
                  .customerInfo.RentalPropFav == undefined ? (
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
                  onPress={() => this.addToFav(data.id)}
                />
              ) : !this.state.customerInfo.RentalPropFav.includes(data.id) ? (
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
                    marginLeft: SCREEN_WIDTH / 2.7,
                    height: 32,
                    marginTop: 5,
                    padding: 5,
                    borderRadius: 5,
                  }}
                  onPress={() => this.removeFav(data.id)}
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
                  {name}
                </Text>
                <View style={{height: 50, flexShrink: 1, flexDirection: 'row'}}>
                  {!StatHourPrice ? null : (
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: 'bold',
                        color: 'white',
                        padding: 1,
                      }}>
                      {' '}
                      {this.props.currency}
                      {parseFloat(HourPrice)
                        .toFixed(0)
                        .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                    </Text>
                  )}

                  {!StatDayPrice ? null : (
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: 'bold',
                        color: 'white',
                        padding: 1,
                      }}>
                      {' '}
                      {this.props.currency}
                      {parseFloat(DayPrice)
                        .toFixed(0)
                        .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                    </Text>
                  )}
                  {!StatWeeklyPrice ? null : (
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: 'bold',
                        color: 'white',
                        padding: 1,
                      }}>
                      {' '}
                      {this.props.currency}
                      {parseFloat(WeeklyPrice)
                        .toFixed(0)
                        .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                    </Text>
                  )}
                  {!StatMonthlyPrice ? null : (
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: 'bold',
                        color: 'white',
                        padding: 1,
                      }}>
                      {' '}
                      {this.props.currency}
                      {parseFloat(MonthlyPrice)
                        .toFixed(0)
                        .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                    </Text>
                  )}
                  {origPrice == undefined || origPrice == 0 ? null : (
                    <Text
                      style={{
                        fontSize: 10,
                        color: 'white',
                        padding: 1,
                        textDecorationLine: 'line-through',
                      }}>
                      {' '}
                      {this.props.currency}
                      {parseFloat(origPrice)
                        .toFixed(0)
                        .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                    </Text>
                  )}
                  <Text
                    style={{
                      fontSize: 14,
                      paddingLeft: 5,
                      fontWeight: 'bold',
                      color: 'white',
                      padding: 1,
                    }}>
                    Good for {maxGuest}
                  </Text>
                </View>
                {!admin_control || !status ? (
                  <View style={styles.text}>
                    <Text style={styles.title}>Currently Unavailable</Text>
                  </View>
                ) : null}
              </View>
            </FastImage>
          </TouchableOpacity>
        </Box>
      </Box>
    );
  };

  async componentDidMount() {
    this.StartImageRotationFunction();
    const userId = auth().currentUser.uid;
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
    this.setState({loading: true});

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
      .where('rentalType', '==', 'Property');
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
        productQuery = productQuery.orderBy('name', 'asc');
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
          /* Add more items to the screen... */
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
    const {selectedFilter, activeSlide, productss} = this.state;
    return (
      <Box>
        <Box style={{flex: 1, backgroundColor: '#FFF'}}>
          <Box
            style={{backgroundColor: '#019fe8', height: 46}}>
            <View
               style={{
                flex: 1,
                flexDirection: 'row',
                width: SCREEN_WIDTH-20,
                height: 36,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'white',
                marginTop: 5,
                borderRadius: 30,
                marginBottom:5,
                marginLeft:5
               }}>
              <TouchableOpacity
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                }}
                onPress={() => {
                  this.props.navigation.navigate('SearchProperty', {
                    storeId: this.props.storeId,
                    store_name: this.props.store,
                    typeOfRate: this.props.typeOfRate,
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
          </Box>
          <Loader loading={this.state.loading} trans={trans} />
          <RecyclerListView
            style={{flex: 1, marginHorizontal: 5,minHeight: SCREEN_HEIGHT/1.39}}
            rowRenderer={this.rowRenderer}
            dataProvider={this.state.dataProvider}
            layoutProvider={this.state.layoutProvider}
            renderFooter={this.renderFooter}
          />

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
                <Text style={{color: '#019fe8'}}>Done</Text>
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
                <View style={styles.carousel}>
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
                <Text style={styles.infoRecipeName}>{this.state.name}</Text>
                <Text style={{fontSize: 17, textAlign: 'center'}}>
                  {this.props.currency}
                  {this.state.price}
                </Text>
                <View style={{flex: 1, padding: 10, backgroundColor: 'white'}}>
                  {productss.map((object, d) => (
                    <View key={d}>
                      <Divider />
                      <Text
                        style={{
                          fontSize: 15,
                          marginVertical: 5,
                          fontWeight: 'bold',
                          marginLeft: 10,
                        }}>
                        {object.title}
                      </Text>
                      {object.data.map((drink, i) => (
                        <View key={i}>
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
                              <Text style={{fontSize: 12}}>{drink.label}</Text>
                            </View>
                            <View style={{justifyContent: 'flex-end', flex: 1}}>
                              <Text style={{fontSize: 13}}>
                                {this.props.currency}
                                {drink.price}
                              </Text>
                            </View>
                          </Box>
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
                <Button transparent onPress={() => this._decrementCount()}>
                  <AntDesign name="minus" size={30} color={'#019fe8'} />
                </Button>
                <Button transparent>
                  <Text
                    style={{fontSize: 25, textAlign: 'center', color: 'black'}}>
                    {this.state.count}
                  </Text>
                </Button>
                <Button transparent onPress={() => this._incrementCount()}>
                  <AntDesign name="plus" size={30} color={'#019fe8'} />
                </Button>
              </Box>
              <Box>
                <Button
                  block
                  style={{backgroundColor: '#019fe8'}}
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
