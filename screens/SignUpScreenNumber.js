import React, {Component} from 'react';
import {
  Text,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Platform,
  StyleSheet,
  FlatList,
  StatusBar,
  Image,
  ScrollView,
  Animated,
} from 'react-native';
import {
  Box,
  View,
  Button,
  HStack,
  Input,Icon
} from 'native-base';
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
import LinearGradient from 'react-native-linear-gradient';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Loader from '../components/Loader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from 'react-native-vector-icons/AntDesign';
import axios from 'axios';
import {imgDefault} from './images';
import * as ImagePicker from 'react-native-image-picker';
import messaging from '@react-native-firebase/messaging';
import Geolocation from 'react-native-geolocation-service';
import moment from 'moment';

export default class SignUpScreenNumber extends Component {
  constructor(props) {
    super(props);
    this.Rotatevalue = new Animated.Value(0);
    this.cityRef = firestore().collection('city');
    this.barangayRef = firestore();
    this.ref = firestore();
    this.subscribe = null;
    this.state = {
      email: '',
      name: '',
      username: '',
      password: '',
      rePassword: '',
      mobile: this.props.route.params.phoneNumber,
      hasError: false,
      errorText: '',
      loading: false,
      barangay: [],
      address: '',
      city: '',
      province: '',
      PickerValueHolder: 'Select Barangay',
      barangayList: [],
      cityList: [],
      userTypes: [
        {userType: 'admin', userName: 'Admin User'},
        {userType: 'employee', userName: 'Employee User'},
        {userType: 'dev', userName: 'Developer User'},
      ],
      selectedCity: 'Select City/Municipality',
      selectedBarangay: 'Select Barangay',
      x: {latitude: 14.599512, longitude: 120.984222},
      userPoint: {latitude: null, longitude: null},
      LocationDone: true,
      searchResult: [],
      place: '',
      image: null,
    };
  }

  openGallery = () => {
    ImagePicker.launchImageLibrary(
      {
        maxWidth: 500,
        maxHeight: 500,
        mediaType: 'photo',
        includeBase64: true,
      },
      image => {
        if (image.didCancel == true) {
          return;
        }
        this.setState({image: image.assets[0].base64});
      },
    );
  };
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

  fetchBarangay = city => {
    this.setState({selectedCity: city});
  };

  async componentDidMount() {
    this.myCurrentLocation();
    this.StartImageRotationFunction();
    const token = await AsyncStorage.getItem('token');
    console.log('current: ', auth().currentUser.uid);
    console.log('current: ', auth().currentUser);
    const userId = auth().currentUser.uid;
    firestore()
      .collection('users')
      .where('userId', '==', userId)
      .onSnapshot(querySnapshot => {
        let city = [];
        querySnapshot.docs.forEach(doc => {
          city.push(doc.data());
        });
        console.log('city.length: ', city.length);
        if (city.length < 1) {
        } else {
          AsyncStorage.setItem('uid', auth().currentUser.uid);
          const updateRef = firestore()
            .collection('users')
            .doc(auth().currentUser.uid);
          updateRef.update({
            token: firestore.FieldValue.arrayUnion(token),
          });
          this.setState({
            loading: false,
            email: '',
            password: '',
          });
          this.props.navigation.reset({
            index: 0,
            routes: [{name: 'Home'}],
          });
        }
      });
    this.tosubscribe = this.cityRef.onSnapshot(this.onCityUpdate);
  }

  signup() {
    this.setState({loading: true});

    if (this.state.userPoint.latitude == null) {
      this.setState({
        hasError: true,
        errorText: 'Enter Complete Address!',
        loading: false,
      });
      return;
    }
    if (
      this.state.name === '' ||
      this.state.address == '' ||
      this.state.selectedCity == 'Select City/Municipality' ||
      this.state.province == ''
    ) {
      this.setState({
        hasError: true,
        errorText: 'Please fill all fields !',
        loading: false,
      });
      return;
    }

    this.setState({hasError: false});
    this.saveUserdata();
  }

  saveUserdata() {
    const userId = this.props.route.params.uid;
    AsyncStorage.setItem('uid', userId);
    this.ref
      .collection('users')
      .doc(userId)
      .set({
        joinedOn: moment().unix(),
        cancelLimitLastDate: moment().unix(),
        cancelCounter: 0,
        cityLong: 'none',
        cityLat: 'none',
        selectedCountry: '',
        selectedCity: 'none',
        photo: '',
        modeoflogin: 'Phone Authentication',
        Name: this.state.name,
        Username: this.state.name,
        Mobile: this.state.mobile,
        Email: '',
        Password: this.state.password,
        ordered_times: 0,
        Gender: '',
        Birthdate: '',
        userId: userId,
        status: 'New',
        Country: this.state.Country.trim(),
        Address: {
          context: this.state.context,
          Address: this.state.address,
          Barangay: this.state.selectedBarangay,
          City: this.state.selectedCity.trim(),
          Province: this.state.province.toLowerCase(),
          Country: this.state.Country.trim(),
          lat: this.state.userPoint.latitude,
          long: this.state.userPoint.longitude,
        },
        Shipping_Address: [
          {
            context: this.state.context,
            Country: this.state.Country.trim(),
            id: userId,
            default: true,
            name: this.state.name,
            phone: this.state.mobile,
            address: this.state.address,
            barangay: this.state.selectedBarangay,
            city: this.state.selectedCity.trim(),
            province: this.state.province.toLowerCase(),
            postal: '8600',
            lat: this.state.userPoint.latitude,
            long: this.state.userPoint.longitude,
          },
        ],
      })
      .then(docRef => {
        this.setState({
          loading: false,
        });
        this.props.navigation.reset({
          index: 0,
          routes: [{name: 'Home'}],
        });
      })
      .catch(error =>
        this.setState({
          loading: false,
          hasError: true,
          errorText: error,
        }),
      );
  }

  verifyEmail(email) {
    var reg =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return reg.test(email);
  }

  myCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      info => {
        const {coords} = info;
        this.setState({
          userPoint: {latitude: coords.latitude, longitude: coords.longitude},
          x: {latitude: coords.latitude, longitude: coords.longitude},
        });
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
    axios
      .get(
        `https://discover.search.hereapi.com/v1/discover?at=${this.state.userPoint.latitude},${this.state.userPoint.longitude}&q=${text}&apiKey=5fcoJoPAIOye99-ssHc6TIx73yOAhtWiU1_1p1461X4`,
      )
      .then(res => {
        console.log('Here API To', res.data.items);
        this.setState({searchResult: res.data.items});
      })
      .catch(err => {
        console.log('axios: ', err);
      });
  };
  StartImageRotationFunction() {
    this.Rotatevalue.setValue(0);
    Animated.timing(this.Rotatevalue, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: true, // Add This line
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
    return (
      <Box style={{flex: 1, backgroundColor: '#fdfdfd'}}>
        <ScrollView
          contentContainerStyle={{flexGrow: 1}}
          keyboardShouldPersistTaps="always">
          <Loader loading={this.state.loading} trans={trans} />
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingLeft: 50,
              paddingRight: 50,
              marginTop: 20,
            }}>
            <View style={{marginBottom: 10, width: '100%'}}>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  textAlign: 'left',
                  width: '100%',
                  color: '#183c57',
                }}>
                Set up your account,{' '}
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  textAlign: 'left',
                  width: '100%',
                  color: '#687373',
                }}>
                Fill in to continue{' '}
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  textAlign: 'left',
                  width: '100%',
                  color: '#183c57',
                }}>
                {this.state.errorText}{' '}
              </Text>
            </View>

            <HStack style={{marginBottom:10}}>
              
              <Input
              InputLeftElement={<Icon as={<AntDesign name="user" size={20} color={'#687373'} />} size={5} ml="2" color="#687373" />}
              w={SCREEN_WIDTH/1.5}
                placeholder="Name"
                value={this.state.name}
                onChangeText={text => this.setState({name: text})}
                placeholderTextColor="#687373"
              />
            </HStack>

            <HStack style={{marginBottom:10}}>
              
              <Input
              InputLeftElement={<Icon as={<AntDesign name="mobile1" size={20} color={'#687373'} />} size={5} ml="2" color="#687373" />}
              w={SCREEN_WIDTH/1.5}
                placeholder="Mobile Number"
                value={this.state.mobile}
                placeholderTextColor="#687373"
              />
            </HStack>
            <HStack style={{marginBottom:10}}>
              
              <Input
              InputLeftElement={<Icon as={<AntDesign name="enviromento" size={20} color={'#687373'} />} size={5} ml="2" color="#687373" />}
              w={SCREEN_WIDTH/1.5}
                placeholder="Complete Address"
                value={this.state.place}
                onChangeText={text => this.getLocation(text, 'place')}
                placeholderTextColor="#687373"
              />
            </HStack>
            {this.state.LocationDone == false ? (
              <FlatList
                data={this.state.searchResult}
                renderItem={({item}) => (
                  <View style={{padding: 10}}>
                    <TouchableOpacity
                      onPress={() => {
                        let str = item.place_name;

                        let arr = str.split(',');
                        let arrcountry = arr.length - 1;
                        console.log('str', str);
                        console.log('arr', arr);
                        console.log('selectedCity:', arr[2]);

                        const region = {
                          latitude: item.center[1],
                          latitudeDelta: 0.0999998484542477,
                          longitude: item.center[0],
                          longitudeDelta: 0.11949475854635239,
                        };
                        console.log('region: ', region);
                        this.setState({
                          context: item,
                          userPoint: {
                            latitude: item.position.lat,
                            longitude: item.position.lng,
                          },
                          province: item.address.county,
                          selectedCity: item.address.city,
                          Country: item.address.countryName,
                          selectedBarangay: item.address.district,
                          postal: item.address.postalCode,
                          address: item.address.label,
                          userPoint: {
                            latitude: item.position.lat,
                            longitude: item.position.lng,
                          },
                          place: item.address.label,
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
                        <Text style={{fontWeight: 'normal', fontSize: 14}}>
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
            <HStack style={{marginBottom:10}}>
              
              <Input
              InputLeftElement={<Icon as={<AntDesign name="enviromento" size={20} color={'#687373'} />} size={5} ml="2" color="#687373" />}
              w={SCREEN_WIDTH/1.5}
                placeholder="Detailed Address"
                onChangeText={text => this.setState({address: text})}
                placeholderTextColor="#687373"
              />
            </HStack>
            <HStack style={{marginBottom:10}}></HStack>

            {this.state.hasError ? (
              <Text
                style={{color: '#c0392b', textAlign: 'center', marginTop: 10}}>
                {this.state.errorText}
              </Text>
            ) : null}
            <View style={{alignItems: 'center'}}>
              <Button
                onPress={() => this.signup()}
                style={{
                  backgroundColor: '#ee4e4e',
                  width: '40%',
                  height: 50,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: '#ee4e4e',
                  alignSelf:'center'
                }}>
                  <Text
                    style={[
                      styles.textSign,
                      {
                        color: '#fff',
                      },
                    ]}>
                    Set up
                  </Text>
              </Button>
            </View>
            <View style={{alignItems: 'center'}}>
              <Button
                onPress={() => this.props.navigation.navigate('Login')}
                style={{
                  backgroundColor: '#ee4e4e',
                  marginVertical: 20,
                  width: '100%',
                  height: 50,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: '#ee4e4e',
                }}>
                  <Text
                    style={[
                      styles.textSign,
                      {
                        color: '#fff',
                      },
                    ]}>
                    Already have account? Sign In
                  </Text>
              </Button>
            </View>
          </View>
        </ScrollView>
      </Box>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#009387',
  },
  header: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  footer: {
    flex: 3,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  text_header: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 30,
  },
  text_footer: {
    color: '#05375a',
    fontSize: 18,
  },
  action: {
    flexDirection: 'row',
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    paddingBottom: 5,
  },
  textInput: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 0 : -12,
    paddingLeft: 10,
    color: '#05375a',
  },
  button: {
    alignItems: 'center',
    marginTop: 50,
  },
  signIn: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  textSign: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  textPrivate: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20,
  },
  color_textPrivate: {
    color: 'grey',
  },
});
