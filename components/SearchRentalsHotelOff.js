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
import {LayoutUtil} from './LayoutUtil';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import moment from 'moment';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default class SearchRentalsHotelOff extends Component {
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
      dataSource: this.props.route.params.HotelList,
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
          AsyncStorage.removeItem('asyncselectedCity');
          AsyncStorage.removeItem('asyncselectedCountry');
        }
        this.setState({appState: nextAppState});
      },
    );
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
      .where('rentalType', '==', 'Hotels')
      .where('admin_control', '==', true)
      .where('status', '==', true)
      .where('city', '==', this.state.City.trim());
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
        if (change.type === 'added' && change.doc.data().admin_control) {
          /* Add more items to the screen...   const itemData = items.ProductType;
        const textData = 'Transport';*/
          if (change.doc.data().AlwaysOpen == false && Closing == true) {
          } else {
            if (change.doc.data().ProductType != 'Transport') {
              productChunk.push({...change.doc.data(), pid: change.doc.id});
            }
          }
        } else if (
          change.type === 'modified' &&
          change.doc.data().admin_control
        ) {
          /* If there is a change in realtime... */
          /* Apply the modification to the item directly without changing the current item index. */
          if (change.doc.data().AlwaysOpen == false && Closing == true) {
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
          if (change.doc.data().AlwaysOpen == false && Closing == true) {
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
    // this.appStateSubscription.remove();
  }
  searchFilterFunction = async () => {
    this.setState({loading: true});
    console.log('CIty: ', this.state.City);
    console.log('searchText: ', this.state.searchText);
    const result = this.props.route.params.HotelList.filter(items => {
      const itemData = items.name.toUpperCase();
      const textData = this.state.searchText.toUpperCase();
      return itemData.indexOf(textData) > -1;
    })
      .sort((a, b) => Number(b.arrange) - Number(a.arrange))
      .sort((a, b) => a.distance - b.distance);

    const paidResult = this.props.route.params.HotelList.filter(items => {
      const itemData = items.name.toUpperCase();
      const textData = this.state.searchText.toUpperCase();
      return itemData.indexOf(textData) == -1 && items.arrange > 0;
    })
      .sort((a, b) => Number(b.arrange) - Number(a.arrange))
      .sort((a, b) => a.distance - b.distance);

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
        transparent
        style={{justifyContent: 'center', alignContent: 'center'}}>
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
                currency: this.props.route.params.currency,
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
        <HStack alignItems="center" bg="white" rounded="md" maxW={SCREEN_WIDTH/1.4} h="38">
        
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
              <Text style={{color: '#019fe8'}}>Done</Text>
            </Button>
          </View>
        </Modal>
        <Loader loading={this.state.loading} trans={trans} />
        {this.searchFilterFunction &&
        this.state.selectedFilterBy == 'ByProductSearch' ? (
          <RecyclerListView
            style={{flex: 1, marginHorizontal: 5}}
            rowRenderer={this.rowRenderer}
            dataProvider={this.state.dataProvider}
            layoutProvider={this.state.layoutProvider}
            renderFooter={this.renderFooter}
          />
        ) : (
          <FlatList
            key={'2'}
            data={this.state.dataSource}
            renderItem={({item}) => (
              <Box transparent>
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
                            typeOfRate: this.props.route.params.typeOfRate,
                            currency: this.props.route.params.currency,
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
                      {/*                  <View style={{    textAlign: 'center',
fontSize: 16,
fontWeight: '100',
fontStyle: 'italic',
zIndex: 3,
elevation: 3,
position:'absolute',
top:115,
right:0,
flex: 1,
backgroundColor: 'tomato',
padding: 5,
maxWidth:SCREEN_WIDTH/2
}}>
<Text style={{fontStyle: "italic",fontWeight: 'bold', borderRadius: 5,  fontSize: 10, paddingLeft: 5, color: 'white'}}> AS LOW AS</Text>
<Text style={{fontStyle: "italic",fontWeight: 'bold', borderRadius: 5,  fontSize: 10, paddingLeft: 5, color: 'white'}}> {this.state.CountryNow.length == 0?'':this.state.CountryNow[0].currency}{parseFloat(item.PriceArray == undefined? 0:item.PriceArray.length >0?item.PriceArray.sort((a,b)=> a.price -b.price)[0].price:0 ).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</Text>
</View> */}
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
                                  ? Math.round(item.distance * 10) / 10 + ' m'
                                  : Math.round((item.distance / 1000) * 10) /
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
                            {this.props.route.params.currency}
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
          />
        )}
        {/* <FlatList
          data={this.state.data}
          ItemSeparatorComponent={this.ListViewItemSeparator}
          renderItem={({ item }) => this.rowRenderer(item.datas)}
          enableEmptySections={true}
          style={{ marginTop: 10 }}
          numColumns={2}
          columnWrapperStyle={{justifyContent:'space-between'}}
          keyExtractor={(item, index) => index.toString()}
          /> */}
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

              <Text style={{marginTop: 15, fontSize: 14, fontWeight: 'bold'}}>
                Label:{' '}
                <Text
                  style={{marginTop: 15, fontSize: 14, fontWeight: 'normal'}}>
                  {this.state.vInfo.rentalType == 'Vehicle'
                    ? this.state.vInfo.MBrand + ' ' + this.state.vInfo.VModel
                    : this.state.vInfo.name}{' '}
                </Text>
              </Text>

              <Text style={{marginTop: 15, fontSize: 14, fontWeight: 'bold'}}>
                Description:{' '}
                <Text
                  style={{marginTop: 15, fontSize: 14, fontWeight: 'normal'}}>
                  {this.state.vInfo.description}
                </Text>{' '}
              </Text>

              <Text style={{marginTop: 15, fontSize: 14, fontWeight: 'bold'}}>
                Ameneties:{' '}
                <Text
                  style={{marginTop: 15, fontSize: 14, fontWeight: 'normal'}}>
                  {this.state.vInfo.ameneties}
                </Text>
              </Text>
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

              <Text style={{marginTop: 15, fontSize: 14, fontWeight: 'bold'}}>
                Label:{' '}
                <Text
                  style={{marginTop: 15, fontSize: 14, fontWeight: 'normal'}}>
                  {this.state.vInfo.rentalType == 'Vehicle'
                    ? this.state.vInfo.MBrand + ' ' + this.state.vInfo.VModel
                    : this.state.vInfo.name}{' '}
                </Text>
              </Text>

              <Text style={{marginTop: 15, fontSize: 14, fontWeight: 'bold'}}>
                Description:{' '}
                <Text
                  style={{marginTop: 15, fontSize: 14, fontWeight: 'normal'}}>
                  {this.state.vInfo.description}
                </Text>{' '}
              </Text>

              <Text style={{marginTop: 15, fontSize: 14, fontWeight: 'bold'}}>
                Ameneties:{' '}
                <Text
                  style={{marginTop: 15, fontSize: 14, fontWeight: 'normal'}}>
                  {this.state.vInfo.ameneties}
                </Text>
              </Text>
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
                      currency: this.props.route.params.currency,
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

              <Text style={{marginTop: 15, fontSize: 14, fontWeight: 'bold'}}>
                Label:{' '}
                <Text
                  style={{marginTop: 15, fontSize: 14, fontWeight: 'normal'}}>
                  {this.state.vInfo.rentalType == 'Vehicle'
                    ? this.state.vInfo.MBrand + ' ' + this.state.vInfo.VModel
                    : this.state.vInfo.name}{' '}
                </Text>
              </Text>

              <Text style={{marginTop: 15, fontSize: 14, fontWeight: 'bold'}}>
                Description:{' '}
                <Text
                  style={{marginTop: 15, fontSize: 14, fontWeight: 'normal'}}>
                  {this.state.vInfo.description}
                </Text>{' '}
              </Text>

              <Text style={{marginTop: 15, fontSize: 14, fontWeight: 'bold'}}>
                Ameneties:{' '}
                <Text
                  style={{marginTop: 15, fontSize: 14, fontWeight: 'normal'}}>
                  {this.state.vInfo.ameneties}
                </Text>
              </Text>
            </ScrollView>

            <Button
              block
              style={{height: 30, backgroundColor: '#33c37d', marginTop: 10}}
              onPress={() =>
                this.props.navigation.navigate('CheckoutScreenRentals', {
                  datas: this.state.vInfo,
                  cLat: this.state.vInfo.slatitude,
                  cLong: this.state.vInfo.slongitude,
                  currency: this.props.route.params.currency,
                })
              }>
              <Text style={{color: 'white'}}>Procceed</Text>
            </Button>
          </Box>
        </Modal>
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
  categoriesName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#043D08',
    padding: 1,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  categoriesAddress: {
    fontSize: 15,
    textAlign: 'center',
    color: '#043D08',
    paddingBottom: 5,
  },
});
