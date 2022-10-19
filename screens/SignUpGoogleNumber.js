import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Platform,
  StyleSheet,
  StatusBar,
  BackHandler,
  Alert,
  FlatList,
  Image,
  Animated,
} from 'react-native';

import {Overlay} from 'react-native-elements';
import { Box, Button, HStack, Input} from 'native-base';
import {Card,} from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import Loader from '../components/Loader';
import Modal from 'react-native-modal';
import OTPTextInput from 'react-native-otp-textinput';
import CountDown from 'react-native-countdown-component';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import RNOtpVerify from 'react-native-otp-verify';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export default class SignUpGoogleNumber extends Component {
  constructor() {
    super();
    this.Rotatevalue = new Animated.Value(0);
    this.state = {
      user: null,
      email: '',
      password: '',
      formValid: true,
      errorMessage: '',
      loading: false,
      setConfirm: null,
      setCode: '',
      setVisible: false,
      timers: 60 * 4,
      setVisibletimer: '1',
      enableResend: true,
      AvailableOn: [],
      SelectedAvailableOn: [],
      searchCountry: '',
      selectedCountry: '',
      showCountry: false,
      phoneCode: 'Select Country',
      flag: '',
    };
  }

  async SignInWithPhoneNumbers(phoneNumber) {
    if (this.state.phoneCode == 'Select Country') {
      this.setState({errorMessage: 'Please Select Country', loading: false});
      return;
    }
    console.log('phoneNumber: ', phoneNumber);
    this.setState({loading: true, errorMessage: ''});
    /* auth().signInWithPhoneNumber(phoneNumber).then((res) => {
            console.log('working number')
               
           
           }).catch(error => {
               console.log('err: ', error)
                         this.setState({ errorMessage: error, loading: false })
            });*/
    const confirmation = await auth()
      .signInWithPhoneNumber(this.state.phoneCode + phoneNumber)
      .catch(error => {
        console.log('errs: ', error);
        const messageArray = error.code;
        console.log('messageArray eee: ', messageArray);
        this.setState({errorMessage: error.code, loading: false});
      });
    //setConfirm(confirmation);
    if (this.state.errorMessage == '') {
      console.log('SignInWithPhoneNumbers confirmation: ', confirmation);
      this.setState({setConfirm: confirmation, loading: false});
      this.toggleOverlay();
    }
  }
  async SignInWithPhoneNumberss(phoneNumber) {
    console.log('phoneNumber: ', phoneNumber);
    this.setState({loading: true});
    /* auth().signInWithPhoneNumber(phoneNumber).then((res) => {
          console.log('working number')
             
         
         }).catch(error => {
             console.log('err: ', error)
                       this.setState({ errorMessage: error, loading: false })
          });*/
    const confirmation = await auth().signInWithPhoneNumber(
      this.state.phoneCode + phoneNumber,
    );
    //setConfirm(confirmation);

    this.setState({setConfirm: confirmation, loading: false});
  }
  async confirmCode() {
    console.log('setCode: ', this.state.setCode.trim());
    console.log('setConfirm: ', this.state.setConfirm);
    this.setState({loading: true});
    try {
      await this.state.setConfirm.confirm(this.state.setCode.trim());
      this.setState({loading: false});
      this.toggleOverlay();
      console.log('current currentUser: ', auth().currentUser);
      this.props.navigation.navigate('SignUpScreenNumber', {
        uid: auth().currentUser.uid,
        phoneNumber: auth().currentUser.phoneNumber,
      });
    } catch (error) {
      this.setState({errorMessage: 'Invalid code', loading: false});
      console.log('error: ', error);
      console.log('Invalid code.');
    }
  }

  async confirmCodeAutomatic(otp) {
    console.log('setCode otp: ', otp);
    console.log('setConfirm otp: ', this.state.setConfirm);
    this.setState({loading: true});
    try {
      await this.state.setConfirm.confirm(otp);
      this.setState({loading: false});
      this.toggleOverlay();
      console.log('current currentUser: ', auth().currentUser);
      this.props.navigation.navigate('SignUpScreenNumber', {
        uid: auth().currentUser.uid,
        phoneNumber: auth().currentUser.phoneNumber,
      });
    } catch (error) {
      this.setState({
        errorMessage: error.message,
        loading: false,
        setVisible: false,
      });
      console.log('error confirmCodeAutomatic: ', error);
      console.log('Invalid code.');
    }
  }

  toggleOverlay = () => {
    this.setState({setVisible: !this.state.setVisible});
    //setVisible(!visible);
  };

  componentDidMount() {
    RNOtpVerify.getOtp()
      .then(p => {
        RNOtpVerify.addListener(message => {
          console.log('message addListener: ', message);
          try {
            if (message) {
              const messageArray = message.split('\n');
              console.log('messageArray: ', messageArray);
              console.log('messageArray[0]: ', messageArray[0]);
              if (messageArray[0]) {
                const otp = messageArray[0].split(' ')[0];
                if (otp.length === 6) {
                  this.setState({setVisible: true, setCode: otp.trim()});
                  console.log('otp: ', otp.trim());
                  this.confirmCodeAutomatic(otp.trim());
                }
              }
            }
          } catch (error) {
            console.log('error: ', error.message);
          }
        });
      })
      .catch(error => {
        console.log('error RNOTP'.error.message);
      });

    this.StartImageRotationFunction();

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
          console.log('AvailableOn ', AvailableOn);
          this.setState({
            AvailableOn: AvailableOn,
          });
        },
        error => {
          console.log(error);
        },
      );
  }

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
    //  console.log('current: ', auth().currentUser.uid)
    //  console.log('current currentUser: ', auth().currentUser)

    return (
      <Box style={styles.container}>
        <Loader loading={this.state.loading} trans={trans} />
        <View>
          <View style={styles.header}>
            <Text style={[styles.error, {textAlign: 'center'}]}>
              {this.state.errorMessage}
            </Text>
          </View>

          <Card style={{backgroundColor: '#ffffff'}}>
            <Button
              onPress={() => this.props.navigation.goBack()}
              style={{width: 40, backgroundColor:'white'}}>
              <MaterialIcons name="arrow-back" size={25} color="black" />
            </Button>
            <Text style={styles.text_footer}>Phone Number</Text>
            <View style={styles.action}>
              <FontAwesome name="phone" color="#05375a" size={20} />
              <TouchableOpacity
                style={{flexDirection: 'row', width: 70}}
                onPress={() => this.setState({showCountry: true})}>
                {this.state.flag == '' ? null : (
                  <Image
                    style={{
                      width: 20,
                      height: 50,
                      marginTop: -9,
                      marginLeft: 10,
                    }}
                    resizeMethod="scale"
                    resizeMode="contain"
                    source={{uri: this.state.flag}}
                  />
                )}
                {this.state.phoneCode == 'Select Country' ? (
                  <Text
                    style={{
                      flex: 1,
                      marginTop: 0,
                      paddingLeft: 10,
                      color: '#05375a',
                    }}>
                    {this.state.phoneCode}
                  </Text>
                ) : (
                  <Text
                    style={{
                      flex: 1,
                      marginTop: 5,
                      paddingLeft: 10,
                      fontWeight: 'bold',
                      color: '#05375a',
                    }}>
                    {this.state.phoneCode}
                  </Text>
                )}
              </TouchableOpacity>
              <TextInput
                placeholder="Your Phone number"
                value={this.state.email}
                style={styles.textInput}
                autoCapitalize="none"
                onChangeText={text => this.setState({email: text})}
                keyboardType={'phone-pad'}
              />
            </View>

            <View style={styles.button}>
              <TouchableOpacity
                style={[
                  styles.signIn,
                  {
                    borderColor: '#ee4e4e',
                    borderWidth: 1,
                    marginTop: 15,
                  },
                ]}
                onPress={() => this.SignInWithPhoneNumbers(this.state.email)}>
                <LinearGradient
                  colors={['#ee4e4e', '#ee1f1f']}
                  style={styles.signIn}>
                  <Text
                    style={[
                      styles.textSign,
                      {
                        color: '#fff',
                      },
                    ]}>
                    Continue
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        <Modal
          useNativeDriver={true}
          isVisible={this.state.showCountry}
          onSwipeComplete={this.close}
          swipeDirection={['up', 'left', 'right', 'down']}
          style={styles.view}
          onBackdropPress={() => this.setState({showCountry: false})}
          transparent={true}>
          <View style={styles.content}>
            <View>
              <View style={{alignSelf: 'flex-end', position: 'absolute'}}>
                <AntDesign
                  name="closecircle"
                  color="gray"
                  size={25}
                  onPress={() => this.setState({showCountry: false})}
                />
              </View>

              <Card style={{marginTop: 30}}>
                <HStack>
                  <Input
                    placeholder="Search country name..."
                    value={this.state.searchCountry}
                    onChangeText={text => {
                      this.setState({
                        SelectedAvailableOn: this.state.AvailableOn.filter(
                          items => {
                            const itemData = items.label;
                            const textData = text;

                            return itemData.indexOf(textData) > -1;
                          },
                        ),
                        searchCountry: text,
                      });
                    }}
                    placeholderTextColor="#687373"
                    onFocus={() => this.setState({keyboardav: true})}
                    onBlur={() => this.setState({keyboardav: false})}
                  />
                </HStack>
                <FlatList
                  style={{maxHeight: SCREEN_HEIGHT / 2}}
                  data={
                    this.state.SelectedAvailableOn.length < 1
                      ? this.state.AvailableOn
                      : this.state.SelectedAvailableOn
                  }
                  renderItem={({item, index}) => (
                    <Box
                      bordered
                      style={{
                        marginTop: 0,
                        width: SCREEN_WIDTH,
                        flexDirection: 'row',
                      }}
                      key={index}
                      button
                      onPress={() => {
                        this.setState({
                          selectedCountry: item.label,
                          SelectedAvailableOn: [],
                          phoneCode: item.Phone,
                          flag: item.flag,
                          showCountry: false,
                        });
                      }}>
                      <Image
                        style={{width: 70, height: 50}}
                        resizeMethod="scale"
                        resizeMode="contain"
                        source={{uri: item.flag}}
                      />
                      <Text style={{fontSize: 17, paddingLeft: 20}}>
                        {item.Phone}{' '}
                      </Text>
                    </Box>
                  )}
                  keyExtractor={(item, index) => index.toString()}
                />
              </Card>
            </View>
          </View>
        </Modal>

        <Modal
          useNativeDriver={true}
          isVisible={this.state.setVisible}
          onSwipeComplete={this.close}
          swipeDirection={['up', 'left', 'right', 'down']}
          style={styles.view}
          onBackdropPress={() => this.setState({setVisible: false})}
          transparent={true}>
          <View style={styles.content}>
            <View>
              <View style={{alignSelf: 'flex-end', position: 'absolute'}}>
                <AntDesign name="closecircle" color="gray" size={25} />
              </View>
              <Text
                style={{
                  textAlign: 'left',
                  paddingVertical: 15,
                  fontSize: 30,
                  fontWeight: 'bold',
                }}>
                One-Time PIN
              </Text>
              <View style={{marginBottom: 20, flexDirection: 'row'}}>
                <Text>Your OTP will expire in</Text>
                <CountDown
                  id={this.state.setVisibletimer}
                  until={this.state.timers}
                  onFinish={() => this.setState({enableResend: false})}
                  size={15}
                  digitStyle={{backgroundColor: '#FFF', marginTop: -10}}
                  digitTxtStyle={{color: '#ee4e4e'}}
                  timeToShow={['M', 'S']}
                  timeLabels={{m: null, s: null}}
                  separatorStyle={{marginTop: -11}}
                  showSeparator
                />
              </View>
            </View>
            <OTPTextInput
              tintColor={'#ee4e4e'}
              //value={this.state.setCode}
              inputCount={6}
              handleTextChange={e => {
                console.log('e: ', e);
                this.setState({setCode: e});
              }}
              textInputStyle={{
                borderRadius: 10,
                borderWidth: 4,
              }}
            />
            <View style={{flexDirection: 'row'}}>
              <TouchableOpacity
                onPress={() => {
                  let newval = parseFloat(this.state.setVisibletimer) + 1;
                  console.log('new setVisibletimer', newval.toString());
                  this.setState({
                    setVisibletimer: newval.toString(),
                    enableResend: true,
                  });
                  this.SignInWithPhoneNumberss(this.state.email);
                }}
                style={{
                  width: '90%',
                  height: 50,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 5,
                  borderColor:
                    this.state.enableResend == true ? 'gray' : '#ee4e4e',
                  borderWidth: 1,
                  marginTop: 15,
                  marginRight: '2.5%',
                }}
                disabled={this.state.enableResend}>
                <Text
                  style={[
                    styles.textSign,
                    {
                      color:
                        this.state.enableResend == true ? 'gray' : '#ee4e4e',
                    },
                  ]}>
                  Resend OTP
                </Text>
              </TouchableOpacity>
              {/*<TouchableOpacity
                    onPress={() => this.confirmCode()}
                    style={{      width: '45%',
                    height: 50,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 5,
                        borderColor: '#ee4e4e',
                        borderWidth: 1,
                        marginTop: 15,
                        marginLeft: '2.5%'
                    }}
                >
                    <Text style={[styles.textSign, {
                        color: '#ee4e4e'
                    }]}>Confirm</Text>
                  </TouchableOpacity>*/}
            </View>
          </View>
        </Modal>
        {/* <Overlay isVisible={this.state.setVisibles} onBackdropPress={this.toggleOverlay}>
            <View  style={{width: SCREEN_WIDTH/1.5}}>
        <Text style={styles.text_footer}>Code</Text>
        <View style={styles.action}>
           
                <TextInput 
                   // placeholder="Enter Code"
                  //  value={this.state.setCode}
                    style={styles.textInput}
                  //  autoCapitalize="none"
                    onChangeText={(text) => this.setState({setCode: text})}
                    keyboardType={'phone-pad'}
                />
               
            </View>
            <TouchableOpacity
                    onPress={() => this.confirmCode()}
                    style={[styles.signIn, {
                        borderColor: 'red',
                        borderWidth: 1,
                        marginTop: 15
                    }]}
                >
                    <Text style={[styles.textSign, {
                        color: 'red'
                    }]}>Confirm Code</Text>
                </TouchableOpacity>
           
            </View>
           </Overlay>*/}
      </Box>
    );
  }
}

const styles = StyleSheet.create({
  view: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  content: {
    backgroundColor: 'white',
    padding: 22,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  container: {
    flex: 1,
    backgroundColor: '#183c57',
  },
  header: {
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  footer: {
    width: 300,
    height: 200,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 30,
    marginBottom: 300,
  },
  text_header: {
    marginTop: 50,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 30,
  },
  error: {
    marginTop: 10,
    color: 'red',
    fontWeight: 'bold',
    fontSize: 20,
    justifyContent: 'center',
    alignContent: 'center',
  },
  text_footer: {
    color: '#05375a',
    fontSize: 18,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  action: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  textInput: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 0 : -12,
    paddingLeft: 10,
    color: '#05375a',
  },
  button: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  signIn: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  textSign: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
