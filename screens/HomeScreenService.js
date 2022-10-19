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
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Modal from 'react-native-modal';
import {RadioButton, Divider} from 'react-native-paper';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import AntDesign from 'react-native-vector-icons/AntDesign';
//import GetLocation from 'react-native-get-location'
import {FlatGrid} from 'react-native-super-grid';
import {SliderBox} from 'react-native-image-slider-box';
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
import auth from '@react-native-firebase/auth';
import PhotoGrid from '../components/PhotoGrid';

const BannerWidth = Dimensions.get('window').width;

export default class HomeScreenService extends Component {
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
      carsAvailable: [],
      cLat: null,
      cLong: null,
      Prentals: [],
      Vrentals: [],
      MonthlyPrice: 0,
      DayPrice: 0,
      HourPrice: 0,
      WeeklyPrice: 0,
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
    /*  GetLocation.getCurrentPosition({
      showLocationDialog: true,
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 10000
  })
  .then(location => {
      console.log('location: ', location)
     this.setState({   cLat: location.latitude,
      cLong: location.longitude})

  })
  .catch(error => {
      const { code, message } = error;
      console.log(code, message);
  })*/
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

  componentDidMount() {
    this.setState({loading: true});

    /* GetLocation.getCurrentPosition({
      showLocationDialog: true,
      enableHighAccuracy: true,
  })
  .then(location => {
      console.log('location: ', location)
     this.setState({   cLat: location.latitude,
      cLong: location.longitude})

  })
  .catch(error => {
      const { code, message } = error;
      console.warn(code, message);
  })*/
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
      Vrentals.push(doc.data());
    });
    this.setState({
      Vrentals: Vrentals,
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
      .where('city', '==', item == null ? this.state.City : item)
      .onSnapshot(this.onCollectionUpdate);
    console.log(
      'city: ',
      this.props.selectedCityUser == null
        ? this.state.City
        : this.props.selectedCityUser,
    );
    // firestore().collection('vehicles').where('succeed', '>',0).onSnapshot(this.onCollectionProducts);
    firestore()
      .collection('products')
      .where('rentalType', '==', 'Services')
      .where(
        'arrayofCity',
        'array-contains-any',
        this.props.selectedCityUser == null
          ? [this.state.City.trim()]
          : [this.props.selectedCityUser.trim()],
      )
      .onSnapshot(this.onPrentals);
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

  addToFav(id) {
    const uid = auth().currentUser.uid;
    this.setState({loading: true});
    const updateRef = firestore().collection('users').doc(uid);
    updateRef
      .update({
        ServiceFav: firestore.FieldValue.arrayUnion(id),
      })
      .then(docRef => {
        this.setState({loading: false});
        firestore()
          .collection('products')
          .where('rentalType', '==', 'Services')
          .where(
            'arrayofCity',
            'array-contains-any',
            this.props.selectedCityUser == null
              ? [this.state.City.trim()]
              : [this.props.selectedCityUser.trim()],
          )
          .onSnapshot(this.onPrentals);
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
        ServiceFav: firestore.FieldValue.arrayRemove(id),
      })
      .then(docRef => {
        this.setState({loading: false});
        firestore()
          .collection('products')
          .where('rentalType', '==', 'Services')
          .where(
            'arrayofCity',
            'array-contains-any',
            this.props.selectedCityUser == null
              ? [this.state.City.trim()]
              : [this.props.selectedCityUser.trim()],
          )
          .onSnapshot(this.onPrentals);
      })
      .catch(err => {
        this.setState({loading: false});
        console.log('err: ', err);
      });
  }

  rowRendererPrentals = data => {
    console.log('data: ', data);
    const {
      status,
      ratemode,
      newratemode,
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
      <Box
        transparent
        style={{flex: 1, justifyContent: 'center', alignContent: 'center',}}>
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
            style={{width: SCREEN_WIDTH / 2 - 5, flex: 1}}
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
            <FastImage
              style={styles.productPhoto}
              source={{
                uri: newData[0],
                headers: {Authorization: 'someAuthToken'},
                priority: FastImage.priority.normal,
              }}
              resizeMode={FastImage.resizeMode.cover}>
              {this.state.customerInfo == undefined ? null : this.state
                  .customerInfo.ServiceFav == undefined ? (
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
                  onPress={() => this.addToFav(data.id)}
                />
              ) : !this.state.customerInfo.ServiceFav.includes(data.id) ? (
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
                    marginLeft: SCREEN_WIDTH / 2.6,
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

            {!StatHourPrice ? null : (
              <Text
                style={{fontStyle: 'italic', fontSize: 12, paddingLeft: 20}}>
                Hour Rate : {this.props.currency}
                {parseFloat(HourPrice)
                  .toFixed(2)
                  .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
              </Text>
            )}

            {!StatDayPrice ? null : (
              <Text
                style={{fontStyle: 'italic', fontSize: 12, paddingLeft: 20}}>
                Daily Rate : {this.props.currency}
                {parseFloat(DayPrice)
                  .toFixed(2)
                  .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
              </Text>
            )}
            {!StatWeeklyPrice ? null : (
              <Text
                style={{fontStyle: 'italic', fontSize: 12, paddingLeft: 20}}>
                Weekly Rate : {this.props.currency}
                {parseFloat(WeeklyPrice)
                  .toFixed(2)
                  .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
              </Text>
            )}
            {!StatMonthlyPrice ? null : (
              <Text
                style={{fontStyle: 'italic', fontSize: 12, paddingLeft: 20}}>
                Montly Rate : {this.props.currency}
                {parseFloat(MonthlyPrice)
                  .toFixed(2)
                  .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
              </Text>
            )}
            {ratemode == 'Others' ? (
              <Text
                style={{fontStyle: 'italic', fontSize: 12, paddingLeft: 20}}>
                {parseFloat(DayPrice)
                  .toFixed(2)
                  .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                /{newratemode}
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
                Service Provider :{store_name}
              </Text>
            </View>
          </TouchableOpacity>
        </Box>
      </Box>
    );
  };

  render() {
    console.log('props.currency: ', this.props.currency);
    console.log('selectedCityUserService: ', this.props.selectedCityUser);

    return (
      <View>
        <FlatList
          data={this.state.Prentals}
          ItemSeparatorComponent={this.ListViewItemSeparator}
          renderItem={({item}) => this.rowRendererPrentals(item)}
          enableEmptySections={true}
          style={{marginTop: -5, marginBottom: 285}}
          numColumns={2}
          columnWrapperStyle={{justifyContent: 'space-between'}}
          keyExtractor={(item, index) => index.toString()}
        />

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
            images={this.state.vInfo.imageArray.filter(items => {
              const itemData = items;
              const textData = 'AddImage';

              return itemData.indexOf(textData) == -1;
            })}
            sliderBoxHeight={SCREEN_HEIGHT}
            resizeMode={'contain'}
            firstItem={this.state.vInfo.imageArray
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
          isVisible={this.state.VisibleAddInfoP}
          animationInTiming={700}
          animationIn="slideInUp"
          animationOut="slideOutDown"
          animationOutTiming={700}
          useNativeDriver={true}
          onBackButtonPress={() => this.setState({VisibleAddInfoP: false})}
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
              <PhotoGrid
                source={this.state.vInfo.imageArray.filter(items => {
                  const itemData = items;
                  const textData = 'AddImage';

                  return itemData.indexOf(textData) == -1;
                })}
                style={{width: SCREEN_WIDTH / 1.7}}
                onPressImage={uri =>
                  this.setState({showURL: true, SelectedURL: uri})
                }
              />

              <Text style={{marginTop: 15, fontSize: 14, fontWeight: 'bold'}}>
                Label:{' '}
                <Text
                  style={{marginTop: 15, fontSize: 13, fontWeight: 'normal'}}>
                  {this.state.vInfo.name}
                </Text>
              </Text>

              <Text style={{marginTop: 15, fontSize: 14, fontWeight: 'bold'}}>
                Description:{' '}
                <Text
                  style={{marginTop: 15, fontSize: 13, fontWeight: 'normal'}}>
                  {this.state.vInfo.description}
                </Text>
              </Text>

              <Text style={{marginTop: 15, fontSize: 14, fontWeight: 'bold'}}>
                Ameneties:{' '}
                <Text
                  style={{marginTop: 15, fontSize: 13, fontWeight: 'normal'}}>
                  {this.state.vInfo.ameneties}
                </Text>
              </Text>
            </ScrollView>

            <Button
              block
              style={{height: 50, backgroundColor: '#33c37d', marginTop: 10}}
              onPress={() =>
                this.props.navigation.navigate('CheckoutScreenService', {
                  datas: this.state.vInfo,
                  cLat: this.state.vInfo.slatitude,
                  cLong: this.state.vInfo.slongitude,
                  typeOfRate: this.props.typeOfRate,
                  currency: this.props.currency,
                  selectedCityUser:
                    this.props.selectedCityUser == null
                      ? this.state.City
                      : this.props.selectedCityUser,
                })
              }>
              <Text style={{color: 'white'}}>Proceed</Text>
            </Button>
          </Box>
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
    width: '98.7%',
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
