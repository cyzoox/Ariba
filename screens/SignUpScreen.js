import React, {Component} from 'react';
import {
  Text,
  TouchableOpacity,
  TextInput,
  Platform,
  StyleSheet,
  FlatList,
  StatusBar,
  Image,
  ScrollView,
  Animated,Dimensions
} from 'react-native';
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
import {
  Box,
  View,
  Button,
  Stack,
  Input,
  HStack,
  Icon,
} from 'native-base';
import {Card,} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Loader from '../components/Loader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from 'react-native-vector-icons/AntDesign';
import axios from 'axios';
import {imgDefault} from './images';
import * as ImagePicker from 'react-native-image-picker';
import Geolocation from 'react-native-geolocation-service';
import moment from 'moment';


export default class SignUpScreen extends Component {
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
      mobile: '',
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

  componentDidMount() {
    this.myCurrentLocation();
    this.StartImageRotationFunction();
    this.tosubscribe = this.cityRef.onSnapshot(this.onCityUpdate);
  }

  signup() {
    this.setState({loading: true});
    if (this.state.image == null) {
      this.setState({
        hasError: true,
        errorText: 'Upload Photo of you!',
        loading: false,
      });
      return;
    }
    if (this.state.userPoint.latitude == null) {
      this.setState({
        hasError: true,
        errorText: 'Enter Complete Address!',
        loading: false,
      });
      return;
    }
    if (
      this.state.email === '' ||
      this.state.name === '' ||
      this.state.password === '' ||
      this.state.rePassword === '' ||
      this.state.address == '' ||
      this.state.selectedBarangay == 'Select Barangay' ||
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
    if (!this.verifyEmail(this.state.email)) {
      this.setState({
        hasError: true,
        errorText: 'Please enter a valid email address !',
        loading: false,
      });
      return;
    }

    if (this.state.mobile.length < 11 || this.state.mobile.length > 11) {
      this.setState({
        hasError: true,
        errorText: 'Mobile number must contains at least 11 characters !',
        loading: false,
      });
      return;
    }
    if (this.state.password.length < 6) {
      this.setState({
        hasError: true,
        errorText: 'Passwords must contains at least 6 characters !',
        loading: false,
      });
      return;
    }
    if (this.state.password !== this.state.rePassword) {
      this.setState({
        hasError: true,
        errorText: 'Passwords does not match !',
        loading: false,
      });
      return;
    }
    this.setState({hasError: false});
    const {email, password} = this.state;
    auth()
      .createUserWithEmailAndPassword(email, password)
      .then(() => {
        this.saveUserdata();
      })
      .catch(error => {
        this.setState({
          hasError: true,
          errorText: error.message,
          loading: false,
        }); // Using this line
      });
  }
  barangayList
  saveUserdata() {
    if(barangay === undefined){
      alert('No barangay selected.')
    }
    if(barangayList === undefined){
      alert('No barangay selected.')
    }
    let base64Img = `data:image/jpg;base64,${this.state.image}`;
    let data = {
      file: base64Img,
      upload_preset: 'bgzuxcoc',
    };
    let CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/kusinahanglan/upload';

    fetch(CLOUDINARY_URL, {
      body: JSON.stringify(data),
      headers: {
        'content-type': 'application/json',
      },
      method: 'POST',
    })
      .then(async r => {
        let data = await r.json();


        const newDocumentID = firestore().collection('users').doc().id;
        const userId = auth().currentUser.uid;
        console.log(userId)
        AsyncStorage.setItem('uid', userId);
        let userData = {
          joinedOn: moment().unix(),
          cancelLimitLastDate: moment().unix(),
          cancelCounter: 0,
          cityLong: 'none',
          cityLat: 'none',
          selectedCountry: '',
          selectedCity: 'none',
          photo: 'https' + data.url.slice(4),
          Name: this.state.name,
          Username: this.state.name,
          Mobile: this.state.mobile,
          Email: this.state.email,
          Password: this.state.password,
          ordered_times: 0,
          Gender: '',
          Birthdate: '',
          userId: userId,
          status: 'New',
          Country: this.state.Country.trim(),
          Address: {
            context: this.state.context,
            Country: this.state.Country.trim(),
            Address: this.state.address,
            Barangay: this.state.selectedBarangay,
            City: this.state.selectedCity.trim(),
            Province: this.state.province.toLowerCase(),
            lat: this.state.userPoint.latitude,
            long: this.state.userPoint.longitude,
          },
          token: [],
          Shipping_Address: [
            {
              context: this.state.context,
              Country: this.state.Country.trim(),
              id: newDocumentID,
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

              cityLong: 'none',
              cityLat: 'none',
            },
          ],
        }
        console.log(userData)
        this.ref
          .collection('users')
          .doc(userId)
          .set(userData)
          .then(docRef => {
            this.setState({
              loading: false,
            });
            this.props.navigation.navigate('Home');
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
    console.log('text: ', text);
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
    /* axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${text}.json?access_token=sk.eyJ1IjoiY3l6b294IiwiYSI6ImNrdmFxNW5iODBoa2kzMXBnMGRjNXRwNHUifQ.KefOQn1CBBNu-qw1DhPblA`)
     .then(res => {
    
    console.log('res: ', res.data.features[0]);
    let str = res.data.features[0].place_name;

let arr = str.split(',');

console.log("str", str)
console.log("arr", arr)

    this.setState({searchResult:res.data.features })
       }).catch(err => {
          console.log('axios: ',err)
       })


*/
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
                Create your account,{' '}
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  textAlign: 'left',
                  width: '100%',
                  color: '#687373',
                }}>
                Signup to continue{' '}
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
            {/*<Stack>
                 <MapView
                 
             style={{ height: 300, width: 300}}
    initialRegion={{
      latitude: this.state.x.latitude,
      longitude: 	this.state.x.longitude,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    }}
     >
      <MapView.Marker
      draggable
      key={'index'}
      coordinate={this.state.x}
       onDragEnd={(e) => this.setState({ x: e.nativeEvent.coordinate, userPoint: e.nativeEvent.coordinate })}
      title={'Location'}
      description={'Long press to move the marker'}
    />
    </MapView>

            </Stack>
            <Button onPress={this.myCurrentLocation} style={{backgroundColor: '#183c57', marginVertical: 20,width: '100%',
                                                                                      height: 50,
                                                                                      justifyContent: 'center',
                                                                                      alignItems: 'center',
                                                                                      borderRadius: 10, borderWidth: 1, borderColor: '#183c57'}}><Text style={[styles.textSign, {
                                                                                        color:'#fff'
                                                                                    }]}>Get your Location</Text></Button>*/}
            <View>
              <Text>Upload Your Photo</Text>

              <TouchableOpacity
                onPress={this.openGallery}
                style={{justifyContent: 'center', alignContent: 'center'}}>
                <Image
                  style={{
                    width: 160,
                    height: 160,
                    resizeMode: 'contain',
                    margin: 10,
                  }}
                  source={
                    this.state.image === null
                      ? imgDefault
                      : {uri: `data:image;base64,${this.state.image}`}
                  }
                />
              </TouchableOpacity>
            </View>
            <HStack style={{marginBottom:10}}>
              
              <Input
              InputLeftElement={<Icon as={<AntDesign name="mail" size={20} color={'#687373'} />} size={5} ml="2" color="#687373" />}
              w={SCREEN_WIDTH/1.5}
              placeholder="Email"
                onChangeText={text => this.setState({email: text})}
                keyboardType="email-address"
                placeholderTextColor="#687373"
                
              />
            </HStack>
            <HStack style={{marginBottom:10}}>
              
              <Input
              InputLeftElement={<Icon as={<AntDesign name="user" size={20} color={'#687373'} />} size={5} ml="2" color="#687373" />}
              w={SCREEN_WIDTH/1.5}
                placeholder="Name"
                onChangeText={text => this.setState({name: text})}
                placeholderTextColor="#687373"
              />
            </HStack>

            <HStack style={{marginBottom:10}}>
              
              <Input
              InputLeftElement={<Icon as={<AntDesign name="mobile1" size={20} color={'#687373'} />} size={5} ml="2" color="#687373" />}
              w={SCREEN_WIDTH/1.5}
                placeholder="Mobile Number"
                onChangeText={text => this.setState({mobile: text})}
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
                value={this.state.address}
                onChangeText={text => this.setState({address: text})}
                placeholderTextColor="#687373"
              />
            </HStack>
            <HStack style={{marginBottom:10}}></HStack>
            <HStack style={{marginBottom:10}}>
              
              <Input
              InputLeftElement={<Icon as={<AntDesign name="key" size={20} color={'#687373'} />} size={5} ml="2" color="#687373" />}
              w={SCREEN_WIDTH/1.5}
                placeholder="Password"
                onChangeText={text => this.setState({password: text})}
                secureTextEntry={true}
                placeholderTextColor="#687373"
              />
            </HStack>
            <HStack style={{marginBottom:10}}>
             
              <Input
              InputLeftElement={<Icon as={ <AntDesign name="key" size={20} color={'#687373'} />} size={5} ml="2" color="#687373" />}
              w={SCREEN_WIDTH/1.5}
                placeholder="Repeat your password"
                onChangeText={text => this.setState({rePassword: text})}
                secureTextEntry={true}
                placeholderTextColor="#687373"
              />
            </HStack>
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
                        color: '#fff',textAlign:'center'
                      },
                    ]}>
                    Sign Up
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
