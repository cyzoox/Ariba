import React, {Component} from 'react';
import {
  AppState,
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  PermissionsAndroid,
  Dimensions,
} from 'react-native';
import {
  HStack,
  StatusBar,
  Input,
  Button,
  Select,
  useToast as Toast,
  Box,
  Switch,
} from 'native-base';
import {Card} from 'react-native-paper'
import ConfettiCannon from 'react-native-confetti-cannon';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';
import {ToggleButton} from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import axios from 'axios';
import marker from '../assets/icons-marker.png';
import Province from './Province.json';
import DropDownPicker from 'react-native-dropdown-picker';
import Geolocation from 'react-native-geolocation-service';
import MapboxGL, {Logger} from '@react-native-mapbox-gl/maps';
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
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

export default class Address extends Component {
  constructor(props) {
    super(props);
    this.cityRef = firestore().collection('city');
    this.barangayRef = firestore();
    this.ref = firestore();
    this.subscribe = null;
    this.state = {
      appState: AppState.currentState,
      email: '',
      name: '',
      username: '',
      password: '',
      rePassword: '',
      mobile: '',
      hasError: false,
      errorText: '',
      loading: false,
      barangay: [],
      address: '',
      postal: '',
      city: '',
      province: '',
      PickerValueHolder: '',
      barangayList: [],
      cityList: [],
      userTypes: [
        {userType: 'admin', userName: 'Admin User'},
        {userType: 'employee', userName: 'Employee User'},
        {userType: 'dev', userName: 'Developer User'},
      ],
      selectedCity: '',
      selectedBarangay: '',
      address_list: [],
      Edit: false,
      isDefault: false,
      id: '',
      AvailableOn: [],
      visibleEditModal: false,
      x: {latitude: 14.599512, longitude: 120.984222},
      region: [120.984222, 14.599512],
      userPoint: {latitude: null, longitude: null},
      searchResult: [],
      LocationDone: false,
      Country: '',
      context: [],
      pickerOpen:false,
    };
  }

  async component() {
    let userId = await AsyncStorage.getItem('uid');
    /* Listen to realtime cart changes */
    this.unsubscribeCartItems = firestore()
      .collection('users')
      .doc(userId)
      .onSnapshot(snapshotCart => {
        if (snapshotCart.data()) {
          this.setState({
            address_list: Object.values(snapshotCart.data().Shipping_Address),
          });
        } else {
          this.setState({address_list: [], loading: false});
        }
      });
  }

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
    if (Platform.OS === 'android') {
      await request_device_location_runtime_permission();
    }

    Geolocation.getCurrentPosition(
      info => {
        const {coords} = info;
        console.log('coordsL ', coords);
        this.setState({region: [coords.longitude, coords.latitude]});
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
          this.setState({
            AvailableOn: AvailableOn,
          });
        },
        error => {
          console.log(error);
        },
      );
    this.component();
  }

  componentWillUnmount() {
    this.appStateSubscription.remove();
  }

  onCityUpdate = querySnapshot => {
    const city = [];
    querySnapshot.forEach(doc => {
      city.push({
        datas: doc.data(),
        key: doc.id,
      });
    });
    this.setState({
      cityList: city,
    });
  };

  updateTextInput = (text, field) => {
    const state = this.state;
    state[field] = text;
    this.setState(state);
  };

  onBarangayUpdate = querySnapshot => {
    const barangay = [];
    querySnapshot.forEach(doc => {
      barangay.push({
        datas: doc.data(),
        key: doc.id,
      });
    });
    this.setState({
      barangayList: barangay,
    });
  };
  fetchCity = city => {
    console.log('fetchCity: ', city.label);
    this.setState({Country: city.label});
    const collect = city.label == 'Philippines' ? 'city' : city.label + '.city';
    this.subscribe = firestore()
      .collection(collect)
      .where('country', '==', city.label)
      .onSnapshot(this.onCityUpdate);
  };
  fetchBarangay = city => {
    this.setState({selectedCity: city});
    this.subscribe = this.barangayRef
      .collection('barangay')
      .where('city', '==', city)
      .onSnapshot(this.onBarangayUpdate);
  };

  async onEditSave() {
    const userId = await AsyncStorage.getItem('uid');
    let addressRef = firestore().collection('users');
    let ChangeDefaultRef = firestore().collection('users');

    /*Change Default Address*/
    if (
      this.state.newDefaultValue != undefined &&
      this.state.defaultValue != this.state.newDefaultValue
    ) {
      ChangeDefaultRef.doc(userId)
        .get()
        .then(snapshot => {
          let updatedCart = Object.values(
            snapshot.data().Shipping_Address,
          ); /* Clone it first */
          console.log('newDefaultValue: ', updatedCart);
          let itemIndex = updatedCart.findIndex(
            item => item.default == true,
          ); /* Get the index of the item we want to delete */
          console.log('newDefaultValue itemIndex: ', itemIndex);
          /* Set item quantity */
          updatedCart[itemIndex]['default'] = this.state.defaultValue;

          /* Set updated cart in firebase, no need to use setState because we already have a realtime cart listener in the componentDidMount() */
          ChangeDefaultRef.doc(userId)
            .update({Shipping_Address: updatedCart})
            .then(() => {});
        });
      /* Get current cart contents */
      addressRef
        .doc(userId)
        .get()
        .then(snapshot => {
          let updatedCart = Object.values(
            snapshot.data().Shipping_Address,
          ); /* Clone it first */
          console.log(updatedCart);
          let itemIndex = updatedCart.findIndex(
            item => this.state.id === item.id,
          ); /* Get the index of the item we want to delete */

          /* Set item quantity */

          updatedCart[itemIndex]['context'] = this.state.context;
          updatedCart[itemIndex]['postal'] = this.state.postal;
          updatedCart[itemIndex]['address'] = this.state.address;
          updatedCart[itemIndex]['city'] = this.state.selectedCity;
          updatedCart[itemIndex]['province'] =
            this.state.province.toLowerCase();
          updatedCart[itemIndex]['phone'] = this.state.mobile;
          updatedCart[itemIndex]['name'] = this.state.name;
          updatedCart[itemIndex]['lat'] = this.state.region[1];
          updatedCart[itemIndex]['long'] = this.state.region[0];
          updatedCart[itemIndex]['default'] = this.state.newDefaultValue;

          /* Set updated cart in firebase, no need to use setState because we already have a realtime cart listener in the componentDidMount() */
          addressRef
            .doc(userId)
            .update({Shipping_Address: updatedCart})
            .then(() => {
              this.setState({
                postal: '',
                address: '',
                selectedCity: '',
                selectedBarangay: '',
                province: '',
                mobile: '',
                name: '',
                id: '',
                context: [],
                visibleEditModal: false,
              });

              Alert.alert('Address updated succesfuly.')
           
            });
        });
      return;
    } else {
      /* Get current cart contents */
      addressRef
        .doc(userId)
        .get()
        .then(snapshot => {
          let updatedCart = Object.values(
            snapshot.data().Shipping_Address,
          ); /* Clone it first */
          console.log(updatedCart);
          let itemIndex = updatedCart.findIndex(
            item => this.state.id === item.id,
          ); /* Get the index of the item we want to delete */

          /* Set item quantity */

          updatedCart[itemIndex]['context'] = this.state.context;
          updatedCart[itemIndex]['postal'] = this.state.postal;
          updatedCart[itemIndex]['address'] = this.state.address;
          updatedCart[itemIndex]['city'] = this.state.selectedCity;
          updatedCart[itemIndex]['province'] =
            this.state.province.toLowerCase();
          updatedCart[itemIndex]['phone'] = this.state.mobile;
          updatedCart[itemIndex]['name'] = this.state.name;
          updatedCart[itemIndex]['lat'] = this.state.region[1];
          updatedCart[itemIndex]['long'] = this.state.region[0];

          /* Set updated cart in firebase, no need to use setState because we already have a realtime cart listener in the componentDidMount() */
          addressRef
            .doc(userId)
            .update({Shipping_Address: updatedCart})
            .then(() => {
              this.setState({
                postal: '',
                address: '',
                selectedCity: '',
                selectedBarangay: '',
                province: '',
                mobile: '',
                name: '',
                id: '',
                context: [],
                visibleEditModal: false,
              });

              Toast.show({
                text: 'Address updated succesfuly.',
                position: 'center',
                type: 'success',
                textStyle: {textAlign: 'center'},
              });
            });
        });
    }
  }

  editAddress(item) {
    this.setState({
      region: [item.long, item.lat],
      context: item.context,
      postal: item.postal,
      address: item.address,
      selectedCity: item.city,
      province: item.province,
      mobile: item.phone,
      name: item.name,
      id: item.id,
      Country: item.Country,
      defaultValue: item.default,
      visibleEditModal: true,
      x: {latitude: item.lat, longitude: item.long},
    });
    // this.fetchBarangay(item.city)
  }

  ondeleteConfirm(item) {
    Alert.alert(
      'Delete address?',
      'Are you sure you want to delete your billing address?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {text: 'OK', onPress: () => this.ondeleteAddress(item)},
      ],
      {cancelable: false},
    );
  }

  async ondeleteAddress(data) {
    let userId = await AsyncStorage.getItem('uid');
    let addressRef = firestore().collection('users');

    /* Get current cart contents */
    if (!data.default) {
      addressRef
        .doc(userId)
        .get()
        .then(snapshot => {
          let updatedCart = Object.values(
            snapshot.data().Shipping_Address,
          ); /* Clone it first */
          let itemIndex = updatedCart.findIndex(
            item => data.id === item.id,
          ); /* Get the index of the item we want to delete */

          /* Remove item from the cloned cart state */
          updatedCart.splice(itemIndex, 1);

          /* Set updated cart in firebase, no need to use setState because we already have a realtime cart listener in the componentDidMount() */
          addressRef.doc(userId).update({Shipping_Address: updatedCart});
        });
    } else {
      Alert.alert(
        'Note',
        'Default address cannot be deleted.',
        [{text: 'OK', onPress: () => console.log('ok Pressed')}],
        {cancelable: false},
      );
    }
  }

  async onCreateAddress() {
    const {address_list} = this.state;
    if (this.state.region[0] === null) {
      Toast.show({
        text: 'Pin the exact location',
        position: 'top',
        type: 'danger',
        textStyle: {textAlign: 'center'},
      });
    }
    let userId = await AsyncStorage.getItem('uid');
    const newDocumentID = firestore().collection('users').doc().id;
    let newItem = {
      Country: this.state.Country,
      id: newDocumentID,
      name: this.state.name,
      phone: this.state.mobile,
      province: this.state.province,
      city: this.state.selectedCity,
      postal: this.state.postal,
      address: this.state.address,
      context: this.state.context,
      lat: this.state.region[1],
      long: this.state.region[0],
    };
    let updatedCart = Object.values(address_list); /* Clone it first */
    let ref = firestore().collection('users').doc(userId);

    /* Push new cart item */
    updatedCart.push(newItem);

    /* Set updated cart in firebase, no need to use setState because we already have a realtime cart listener in the componentDidMount() */
    ref
      .update({
        Shipping_Address: Object.assign({}, updatedCart),
      })
      .then(() => {
        this.setState({visibleModal: false});
        Toast.show({
          text: 'Added new address',
          position: 'top',
          type: 'success',
          textStyle: {textAlign: 'center'},
        });
      });
  }

  myCurrentLocation = async () => {
    if (Platform.OS === 'android') {
      await request_device_location_runtime_permission();
    }

    Geolocation.getCurrentPosition(
      info => {
        const {coords} = info;
        console.log('coordsL ', coords);
        this.setState({region: [coords.longitude, coords.latitude]});
      },
      error => console.log(error),
      {
        enableHighAccuracy: false,
        timeout: 2000,
        maximumAge: 3600000,
      },
    );
  };
  getLocation = (text, field) => {
    const state = this.state;
    state[field] = text;
    this.setState(state);
    this.setState({LocationDone: false});
    console.log('text: ', text);
    axios
      .get(
        `https://discover.search.hereapi.com/v1/discover?at=${this.props.route.params.cLat},${this.props.route.params.cLong}&q=${text}&apiKey=5fcoJoPAIOye99-ssHc6TIx73yOAhtWiU1_1p1461X4`,
      )
      .then(res => {
        console.log('Here API To', res.data.items);
        this.setState({searchResult: res.data.items});
      })
      .catch(err => {
        console.log('axios: ', err);
      });
  };
  render() {
    console.log('cityList', this.state.cityList);
    return (
      <Box>
        <Box>
        <View>
      <StatusBar bg="#ee4e4e" barStyle="light-content" />
      <Box safeAreaTop bg="#ee4e4e" />
      <HStack bg="#ee4e4e" px="1" py="3" justifyContent="space-between" alignItems="center" w="100%">
        <HStack alignItems="center">
        <Button bg="#ee4e4e"  onPress={() => this.props.navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={25} color="white" />
          </Button>
          <Text style={{color:'white', fontSize:20, fontWeight:'bold'}}>
          My Address
          </Text>
        </HStack>
        <HStack>
        <TouchableOpacity
                onPress={() => this.setState({visibleModal: true})}>
                <Text style={{color: 'white'}}>Add Address</Text>
              </TouchableOpacity>
        </HStack>
      </HStack>
      </View>

       
          <FlatList
            data={this.state.address_list}
            renderItem={({item}) => (
              <Card style={{borderRadius:5, width: SCREEN_WIDTH-20, padding:10, alignSelf:'center', marginTop:10}}>
                <Box
                  style={{
                    
                    marginHorizontal: 10,
                  }}>
                  <Box style={{ flexDirection: 'column'}}>
                    {item.default == true ? (
                      <Text
                        style={{
                          color: 'salmon',
                          alignSelf: 'flex-end',
                          position: 'absolute',
                        }}>
                        [Default]
                      </Text>
                    ) : null}

                    <Text style={{fontSize: 13}}>
                      {item.name} | {item.phone} {'\n'}
                      {item.address}, {item.city}, {item.province},{' '}
                      {item.postal}
                    </Text>
                    <HStack justifyContent="space-between" alignItems="center" >
                      <Box style={{paddingLeft: 20, paddingTop: 10}}>
                        <TouchableOpacity
                          onPress={() => this.editAddress(item)}
                          style={{
                            backgroundColor: '#019fe8',
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                          }}>
                          <Text
                            style={{
                              color: 'white',
                              fontSize: 15,
                              fontStyle: 'italic',
                            }}>
                            Edit
                          </Text>
                        </TouchableOpacity>
                      </Box>
                      <Box style={{paddingRight: 20, paddingTop: 10,}}>
                        <TouchableOpacity
                          onPress={() => this.ondeleteConfirm(item)}
                          style={{
                            backgroundColor: '#019fe8',
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                          }}>
                          <Text
                            style={{
                              color: 'white',
                              fontSize: 15,
                              fontStyle: 'italic',
                            }}>
                            Delete
                          </Text>
                        </TouchableOpacity>
                      </Box>
                    </HStack>
                  </Box>
                </Box>
              </Card>
            )}
            keyExtractor={item => item.key}
          />

          <Modal
            useNativeDriver={true}
            isVisible={this.state.visibleModal}
            onSwipeComplete={this.close}
            swipeDirection={['up', 'left', 'right', 'down']}
            style={styles.view}
            onBackdropPress={() => this.setState({visibleModal: false})}
            transparent={true}>
            <View style={styles.content}>
              <View>
                <ScrollView keyboardShouldPersistTaps="always">
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={{marginTop: 15, fontSize: 18}}>
                      Create new address
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        this.setState({
                          visibleModal: false,
                          mobile: '',
                          location: '',
                          context: [],
                          name: '',
                          address: '',
                          postal: '',
                          city: '',
                          province: '',
                          selectedCity: 'Select City/Municipality',
                          selectedBarangay: 'Select Barangay',
                        })
                      }>
                      <AntDesign
                        name="closecircleo"
                        size={20}
                        color="#687373"
                        style={{marginTop: 5, alignContent: 'flex-end'}}
                      />
                    </TouchableOpacity>
                  </View>
                  <Box>
                    <MapboxGL.MapView
                      style={{height: 300, width: '100%'}}
                      onPress={e => {
                        this.setState({region: e.geometry.coordinates});
                      }}
                      logoEnabled={false}
                      attributionEnabled={false}
                      pitchEnabled={false}
                      zoomEnabled={true}
                      scrollEnabled={true}>
                      <MapboxGL.Camera
                        centerCoordinate={this.state.region}
                        zoomLevel={15}
                      />

                      <MapboxGL.PointAnnotation
                        coordinate={this.state.region}
                      />
                    </MapboxGL.MapView>
                    {/* <MapView
                 testID="map"
        provider={PROVIDER_GOOGLE}
        onRegionChangeComplete={this.onRegionChange}
        showsUserLocation={true}
             style={{ height: 300, width: '100%'}}
    initialRegion={this.state.region}
    showsMyLocationButton={true}
          showsBuildings={true}
          maxZoomLevel={17.5}
          loadingEnabled={true}
     >
     
    </MapView>*/}
                    {/* <View style={{ left: '50%',
  marginLeft: -16,
  marginTop: -125,
  position: 'absolute',
  top: '79.5%'}}>
        <Image style={{height: 36,
  width: 36,}} source={marker} />
      </View>*/}
                  </Box>
                  <Button
                    onPress={this.myCurrentLocation}
                    style={{
                      height: 50,
                      backgroundColor: '#019fe8',
                      marginTop: 10,
                      justifyContent: 'center',
                      alignContent: 'center',
                    }}>
                    <Text style={[styles.textSign, {color: '#fff'}]}>
                      Get your Location
                    </Text>
                  </Button>

                  <Box regular>
                    <Input
                      placeholder={'Type Address Here'}
                      value={this.state.location}
                      onChangeText={text => this.getLocation(text, 'location')}
                      placeholderTextColor="#687373"
                    />
                  </Box>
                  {this.state.LocationDone == false ? (
                    <FlatList
                      data={this.state.searchResult}
                      renderItem={({item}) => (
                        <View style={{padding: 10}}>
                          <TouchableOpacity
                            onPress={() => {
                              const region = {
                                latitude: item.position.lat,
                                latitudeDelta: 0.0999998484542477,
                                longitude: item.position.lng,
                                longitudeDelta: 0.11949475854635239,
                              };
                              console.log('region: ', region);
                              this.setState({
                                region: [item.position.lng, item.position.lat],
                                province: item.address.county,
                                selectedCity: item.address.city.trim(),
                                selectedBarangay: item.address.district,
                                Country: item.address.countryName.trim(),
                                postal: item.address.postalCode,
                                address: item.address.label,
                                context: item,
                                location: item.address.label,
                                x: {
                                  latitude: item.position.lat,
                                  longitude: item.position.lng,
                                },
                                LocationDone: true,
                              });
                            }}
                            style={{
                              borderBottomWidth: 1,
                              borderBottomColor: '#bcbdbf',
                            }}>
                            <Text style={{fontSize: 18}}>{item.title}</Text>
                            <Text style={{fontWeight: 'bold', fontSize: 15}}>
                              {Math.round((item.distance / 1000) * 10) / 10}km{' '}
                              <Text
                                style={{fontWeight: 'normal', fontSize: 14}}>
                                {item.address.street}, {item.address.district},{' '}
                                {item.address.city}, {item.address.countryName}
                              </Text>
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                      keyExtractor={item => item.id}
                    />
                  ) : null}
                  <Text style={{marginTop: 15, fontSize: 10}}>Full Name</Text>
                  <Box regular style={{marginTop: 7}}>
                    <Input
                      placeholder={this.state.name}
                      value={this.state.name}
                      onChangeText={text => this.updateTextInput(text, 'name')}
                      placeholderTextColor="#687373"
                    />
                  </Box>
                  <Text style={{marginTop: 15, fontSize: 10}}>
                    Phone Number
                  </Text>
                  <Box regular style={{marginTop: 7}}>
                    <Input
                      placeholder={this.state.mobile}
                      value={this.state.mobile}
                      keyboardType="phone-pad"
                      onChangeText={text =>
                        this.updateTextInput(text, 'mobile')
                      }
                      placeholderTextColor="#687373"
                    />
                  </Box>
                  <Text style={{marginTop: 15, fontSize: 10}}>Country</Text>

                  <DropDownPicker
                  open={this.state.pickerOpen}
                  setOpen={()=>this.setState({pickerOpen:true})}
                    showArrowIcon={true}
                    items={this.state.AvailableOn}
                    searchable={true}
                    defaultValue={this.state.Country}
                    placeholder={'Select Country'}
                    containerStyle={{height: 46}}
                    labelStyle={{
                      fontSize: 18,
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: '#b0dcf5',
                      borderColor: '#396ba0',
                    }}
                    searchPlaceholder="Search..."
                    style={{backgroundColor: '#396ba0', borderColor: '#396ba0'}}
                    itemStyle={{
                      justifyContent: 'center',
                    }}
                    dropDownStyle={{backgroundColor: '#ffffff'}}
                    onChangeItem={item => this.fetchCity(item)}
                  />
                  <Text style={{marginTop: 15, fontSize: 10}}>
                    Province/State
                  </Text>
                  <Box regular style={{marginTop: 7}}>
                    <Input
                      placeholder={this.state.province}
                      value={this.state.province}
                      onChangeText={text =>
                        this.updateTextInput(text, 'province')
                      }
                      placeholderTextColor="#687373"
                    />
                  </Box>
                  <Text style={{marginTop: 15, fontSize: 10}}>City</Text>
                  <Box>
                    <Select
                      selectedValue={this.state.selectedCity}
                      onValueChange={(itemValue, itemIndex) =>
                        this.fetchBarangay(itemValue)
                      }>
                      <Select.Item
                        label={
                          this.state.selectedCity == ''
                            ? 'Select City'
                            : this.state.selectedCityy
                        }
                        value={
                          this.state.selectedCity == ''
                            ? 'Select City'
                            : this.state.selectedCity
                        }
                      />
                      {this.state.cityList.map(user => (
                        <Select.Item
                          label={user.datas.label}
                          value={user.datas.label}
                        />
                      ))}
                    </Select>
                  </Box>

                  <Text style={{marginTop: 15, fontSize: 10}}>
                    Postal Address
                  </Text>
                  <Box regular style={{marginTop: 7}}>
                    <Input
                      placeholder={this.state.postal}
                      value={this.state.postal}
                      onChangeText={text =>
                        this.updateTextInput(text, 'postal')
                      }
                      placeholderTextColor="#687373"
                    />
                  </Box>
                  <Text style={{marginTop: 15, fontSize: 10}}>
                    Detailed Address
                  </Text>
                  <Box regular style={{marginTop: 7}}>
                    <Input
                      placeholder={this.state.address}
                      value={this.state.address}
                      onChangeText={text =>
                        this.updateTextInput(text, 'address')
                      }
                      placeholderTextColor="#687373"
                    />
                  </Box>

                  <Button
                    block
                    style={{
                      height: 50,
                      backgroundColor: '#019fe8',
                      marginTop: 10,
                    }}
                    onPress={() => this.onCreateAddress()}>
                    <Text style={{color: 'white'}}>SAVE</Text>
                  </Button>
                </ScrollView>
              </View>
            </View>
          </Modal>
          <Modal
            useNativeDriver={true}
            isVisible={this.state.visibleEditModal}
            onSwipeComplete={this.close}
            swipeDirection={['up', 'left', 'right', 'down']}
            style={styles.view}
            onBackdropPress={() => this.setState({visibleEditModal: false})}
            transparent={true}>
            <View style={styles.content}>
              <View>
                <ScrollView keyboardShouldPersistTaps="always">
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={{marginTop: 15, fontSize: 18}}>
                      Create new address
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        this.setState({
                          visibleEditModal: false,
                          mobile: '',
                          location: '',
                          name: '',
                          address: '',
                          context: [],
                          postal: '',
                          city: '',
                          province: '',
                          selectedCity: 'Select City/Municipality',
                          selectedBarangay: 'Select Barangay',
                        })
                      }>
                      <AntDesign
                        name="closecircleo"
                        size={20}
                        color="#687373"
                        style={{marginTop: 5, alignContent: 'flex-end'}}
                      />
                    </TouchableOpacity>
                  </View>
                  <Box>
                    <MapboxGL.MapView
                      style={{height: 300, width: '100%'}}
                      onPress={e => {
                        this.setState({region: e.geometry.coordinates});
                      }}
                      logoEnabled={false}
                      attributionEnabled={false}
                      pitchEnabled={false}
                      zoomEnabled={true}
                      scrollEnabled={true}>
                      <MapboxGL.Camera
                        centerCoordinate={this.state.region}
                        zoomLevel={15}
                      />

                      <MapboxGL.PointAnnotation
                        coordinate={this.state.region}
                      />
                    </MapboxGL.MapView>
                    {/*  <MapView
        provider={PROVIDER_GOOGLE}
        onRegionChangeComplete={this.onRegionChange}
        showsUserLocation={true}
             style={{ height: 300, width: '100%'}}
    initialRegion={this.state.region}
     >
     
    </MapView>
   <View style={{ left: '50%',
  marginLeft: -16,
  marginTop: -125,
  position: 'absolute',
  top: '79.5%'}}>
        <Image style={{height: 36,
  width: 36,}} source={marker} />
      </View>*/}
                  </Box>
                  <Button
                    onPress={this.myCurrentLocation}
                    style={{
                      height: 50,
                      backgroundColor: '#019fe8',
                      marginTop: 10,
                      justifyContent: 'center',
                      alignContent: 'center',
                    }}>
                    <Text style={[styles.textSign, {color: '#fff'}]}>
                      Get your Location
                    </Text>
                  </Button>

                  <Box regular>
                    <Input
                      placeholder={'Type Address Here'}
                      value={this.state.location}
                      onChangeText={text => this.getLocation(text, 'location')}
                      placeholderTextColor="#687373"
                    />
                  </Box>
                  {this.state.LocationDone == false ? (
                    <FlatList
                      data={this.state.searchResult}
                      renderItem={({item}) => (
                        <View style={{padding: 10}}>
                          <TouchableOpacity
                            onPress={() => {
                              this.setState({
                                region: [item.position.lng, item.position.lat],
                                province: item.address.county,
                                selectedCity: item.address.city.replace(
                                  'City',
                                  '',
                                ),
                                selectedBarangay: item.address.district,
                                Country: item.address.countryName.trim(),
                                postal: item.address.postalCode,
                                address: item.address.label,
                                context: item,
                                location: item.address.label,
                                x: {
                                  latitude: item.position.lat,
                                  longitude: item.position.lng,
                                },
                                LocationDone: true,
                              });
                            }}
                            style={{
                              borderBottomWidth: 1,
                              borderBottomColor: '#bcbdbf',
                            }}>
                            <Text style={{fontSize: 18}}>{item.title}</Text>
                            <Text style={{fontWeight: 'bold', fontSize: 15}}>
                              {Math.round((item.distance / 1000) * 10) / 10}km{' '}
                              <Text
                                style={{fontWeight: 'normal', fontSize: 14}}>
                                {item.address.street}, {item.address.district},{' '}
                                {item.address.city}, {item.address.countryName}
                              </Text>
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                      keyExtractor={item => item.id}
                    />
                  ) : null}

                  <Text style={{marginTop: 15, fontSize: 10}}>Full Name</Text>
                  <Box regular style={{marginTop: 7}}>
                    <Input
                      placeholder={this.state.name}
                      value={this.state.name}
                      onChangeText={text => this.updateTextInput(text, 'name')}
                      placeholderTextColor="#687373"
                    />
                  </Box>
                  <Text style={{marginTop: 15, fontSize: 10}}>
                    Phone Number
                  </Text>
                  <Box regular style={{marginTop: 7}}>
                    <Input
                      placeholder={this.state.mobile}
                      value={this.state.mobile}
                      keyboardType="phone-pad"
                      onChangeText={text =>
                        this.updateTextInput(text, 'mobile')
                      }
                      placeholderTextColor="#687373"
                    />
                  </Box>
                  <Text style={{marginTop: 15, fontSize: 10}}>Country</Text>

                  <DropDownPicker
                    open={this.state.pickerOpen}
                    setOpen={()=>this.setState({pickerOpen:true})}
                    showArrowIcon={true}
                    
                    items={this.state.AvailableOn}
                    searchable={true}
                    defaultValue={this.state.Country}
                    placeholder={'Select Country'}
                    containerStyle={{height: 46}}
                    labelStyle={{
                      fontSize: 18,
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: '#b0dcf5',
                      borderColor: '#396ba0',
                    }}
                    searchPlaceholder="Search..."
                    style={{backgroundColor: '#396ba0', borderColor: '#396ba0'}}
                    itemStyle={{
                      justifyContent: 'center',
                    }}
                    dropDownStyle={{backgroundColor: '#ffffff'}}
                    onChangeItem={item => this.fetchCity(item)}
                  />
                  <Text style={{marginTop: 15, fontSize: 10}}>
                    Province/State
                  </Text>
                  <Box regular style={{marginTop: 7}}>
                    <Input
                      placeholder={this.state.province}
                      value={this.state.province}
                      onChangeText={text =>
                        this.updateTextInput(text, 'province')
                      }
                      placeholderTextColor="#687373"
                    />
                  </Box>

                  <Text style={{marginTop: 15, fontSize: 10}}>City</Text>
                  <Box>
                    <Select
                      selectedValue={this.state.selectedCity}
                      onValueChange={(itemValue, itemIndex) =>
                        this.fetchBarangay(itemValue)
                      }>
                      <Select.Item
                        label={this.state.selectedCity}
                        value={this.state.selectedCity}
                      />
                      {this.state.cityList.map(user => (
                        <Select.Item
                          label={user.datas.label}
                          value={user.datas.label}
                        />
                      ))}
                    </Select>
                  </Box>
                  <Text style={{marginTop: 15, fontSize: 10}}>
                    Postal Address
                  </Text>
                  <Box regular style={{marginTop: 7}}>
                    <Input
                      placeholder={this.state.postal}
                      value={this.state.postal}
                      onChangeText={text =>
                        this.updateTextInput(text, 'postal')
                      }
                      placeholderTextColor="#687373"
                    />
                  </Box>
                  <Text style={{marginTop: 15, fontSize: 10}}>
                    Detailed Address
                  </Text>
                  <Box regular style={{marginTop: 7}}>
                    <Input
                      placeholder={this.state.address}
                      value={this.state.address}
                      onChangeText={text =>
                        this.updateTextInput(text, 'address')
                      }
                      placeholderTextColor="#687373"
                    />
                  </Box>
                  <Box style={{marginTop: 7}}>
                    {console.log(
                      'this.state.defaultValue: ',
                      this.state.defaultValue,
                    )}
                    <Text style={{marginTop: 15, fontSize: 12}}>
                      Set as Default Address
                    </Text>
                    {this.state.defaultValue == true ? (
                      <Switch
                        colorScheme="emerald"
                        size="lg"
                        value={
                          this.state.newDefaultValue == undefined
                            ? this.state.defaultValue
                            : this.state.newDefaultValue
                        }
                        onValueChange={() =>
                          this.setState({
                            newDefaultValue:
                              this.state.newDefaulValue == undefined
                                ? !this.state.defaultValue
                                : !this.state.newDefaultValue,
                          })
                        }
                        style={{marginLeft: '45%'}}
                      />
                    ) : (
                      <Switch
                        colorScheme="emerald"
                        size="lg"
                        style={{marginLeft: '45%'}}
                        value={
                          this.state.newDefaultValue == undefined
                            ? this.state.defaultValue
                            : this.state.newDefaultValue
                        }
                        onValueChange={() =>
                          this.setState({
                            newDefaultValue:
                              this.state.newDefaulValue == undefined
                                ? !this.state.defaultValue
                                : !this.state.newDefaultValue,
                          })
                        }
                      />
                    )}
                  </Box>
                  <Button
                    block
                    style={{
                      height: 50,
                      backgroundColor: '#019fe8',
                      marginTop: 10,
                    }}
                    onPress={() => this.onEditSave()}>
                    <Text style={{color: 'white'}}>SAVE</Text>
                  </Button>
                </ScrollView>
              </View>
            </View>
          </Modal>
        </Box>
      </Box>
    );
  }
}

const styles = StyleSheet.create({
  Box: {
    flex: 1,
  },
  view: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  content: {
    backgroundColor: 'white',
    padding: 22,
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
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
});
