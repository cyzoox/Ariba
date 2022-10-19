import React, {Component} from 'react';
import {
  View,
  Text,
  Button,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Platform,
  StyleSheet,
  StatusBar,
  BackHandler,
  Alert,
  Animated,
} from 'react-native';
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
import firestore from '@react-native-firebase/firestore';
import { Box} from 'native-base';
import {Card,} from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import Loader from '../components/Loader';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
//import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import messaging from '@react-native-firebase/messaging';
GoogleSignin.configure({
  offlineAccess: true,
  webClientId:
    '557927849659-a50j6os003hsno774va8d5op9sdl109b.apps.googleusercontent.com',
});

export default class SignInScreen extends Component {
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
    };
  }
  componentDidMount() {
    this.StartImageRotationFunction();
    messaging()
      .getToken()
      .then(token => {
        console.log('token: ', token);
        AsyncStorage.setItem('token', token);
      });
  }
  userLogin = async () => {
    console.log('working here 1');
    const token = await AsyncStorage.getItem('token');
    if (this.state.email === '' && this.state.password === '') {
      Alert.alert('Enter details to signin!');
    } else {
      this.setState({
        loading: true,
      });
      auth()
        .signInWithEmailAndPassword(this.state.email, this.state.password)
        .then(res => {
          messaging()
            .getToken()
            .then(token => {
              firestore()
                .collection('users')
                .doc(auth().currentUser.uid)
                .update({token: firestore.FieldValue.arrayUnion(token)});
              firestore()
                .collection('users')
                .where('userId', '==', auth().currentUser.uid)
                .onSnapshot(querySnapshot => {
                  querySnapshot.forEach(doc => {
                    if (doc.data().userId == auth().currentUser.uid) {
                      const usersRef = firestore()
                        .collection('users')
                        .doc(auth().currentUser.uid);
                      const updateRef = firestore()
                        .collection('users')
                        .doc(auth().currentUser.uid);
                      updateRef.update({
                        token: firestore.FieldValue.arrayUnion(token),
                      });
                      usersRef.get().then(docSnapshot => {
                        if (docSnapshot.exists) {
                          usersRef.onSnapshot(doc => {
                            console.log('working here 2');
                            console.log('current: ', auth().currentUser.uid);
                            AsyncStorage.setItem('uid', auth().currentUser.uid);
                            this.setState({
                              loading: false,
                              email: '',
                              password: '',
                            });
                            this.props.navigation.reset({
                              index: 0,
                              routes: [{name: 'Home'}],
                            });
                          });
                        } else {
                          this.setState({
                            errorMessage: 'Invalid Email or Password',
                            loading: false,
                          });
                        }
                      });
                    }
                  });
                });
            });
        })

        .catch(error =>
          this.setState({errorMessage: error.message, loading: false}),
        );
    }
  };

  async onFacebookButtonPress() {
    // Attempt login with permissions
    /*  const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
      
        if (result.isCancelled) {
          throw 'User cancelled the login process';
        }
        this.setState({
            loading: true,
          })
        // Once signed in, get the users AccesToken
        const data = await AccessToken.getCurrentAccessToken();
      
        if (!data) {
          throw 'Something went wrong obtaining access token';
        }
      
        // Create a Firebase credential with the AccessToken
        const facebookCredential = auth.FacebookAuthProvider.credential(data.accessToken);
  
        console.log(facebookCredential)
      
        // Sign-in the user with the credential
         auth().signInWithCredential(facebookCredential).then((res) => {
          this.props.navigation.navigate('SignUpScreenFB', {'uid':auth().currentUser.uid, 'email':auth().currentUser.email, 'displayName':auth().currentUser.displayName})
               
 /* firestore().collection('users').where('userId', '==', auth().currentUser.uid).onSnapshot(querySnapshot => {

                    querySnapshot.forEach(doc => {
                      if(doc.data().userId == auth().currentUser.uid){
                           this.setState({
                loading: false,
              })
            console.log('fb')
                console.log('current: ', auth().currentUser.uid)
                console.log('current: ', auth().currentUser)
                this.props.navigation.navigate('SignUpScreenFB', {'uid':auth().currentUser.uid, 'email':auth().currentUser.email, 'displayName':auth().currentUser.displayName})
               
                      }
                    })
              })
*/
    /*
           }).catch(error => this.setState({ errorMessage: error.message, loading: false }));
           */
  }

  async onGoogleButtonPress() {
    // Get the users ID token
    console.log('Pressed');
    this.setState({
      loading: true,
    });
    const {idToken} = await GoogleSignin.signIn();

    console.log('idToken: ', idToken);

    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    console.log('googleCredential: ', googleCredential);
    // Sign-in the user with the credential
    auth()
      .signInWithCredential(googleCredential)
      .then(async res => {
        console.log('working google');
        console.log('current: ', auth().currentUser.uid);
        console.log('currentUser: ', auth().currentUser);
        this.props.navigation.navigate('SignUpScreenGoogle', {
          uid: auth().currentUser.uid,
          email: auth().currentUser.email,
        });
        /*firestore().collection('users').where('userId', '==', auth().currentUser.uid).onSnapshot(querySnapshot => {

                    querySnapshot.forEach(doc => {
                      if(doc.data().userId == auth().currentUser.uid){
                        
                      }
                    })
              })*/
      })
      .catch(error =>
        this.setState({errorMessage: error.message, loading: false}),
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
    return (
      <Box style={styles.container}>
        <Loader loading={this.state.loading} trans={trans} />
        <View>
          <View style={styles.header}>
            <Text style={styles.error}>{this.state.errorMessage}</Text>
          </View>
          <View style={styles.header}>
            <Text style={styles.text_header}>Welcome!</Text>
          </View>

          <Card
            style={{
              backgroundColor: '#ffffff',
              marginTop: SCREEN_HEIGHT < 767 ? -40 : 0,
            }}>
            <Text style={styles.text_footer}>Email</Text>
            <View style={styles.action}>
              <FontAwesome name="user-o" color="#05375a" size={20} />
              <TextInput
                placeholder="Your Email"
                style={styles.textInput}
                autoCapitalize="none"
                onChangeText={text => this.setState({email: text})}
              />
            </View>

            <Text style={[styles.text_footer, {}]}>Password</Text>
            <View style={styles.action}>
              <Feather name="lock" color="#05375a" size={20} />
              <TextInput
                placeholder="Your Password"
                secureTextEntry={true}
                style={styles.textInput}
                autoCapitalize="none"
                onChangeText={text => this.setState({password: text})}
              />
              <TouchableOpacity></TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => this.props.navigation.navigate('ForgotPass')}>
              <Text
                style={{
                  color: '#ee4e4e',
                  marginTop: 15,
                  justifyContent: 'center',
                  alignSelf: 'center',
                }}>
                Forgot password?
              </Text>
            </TouchableOpacity>
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
                onPress={() => this.userLogin()}>
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
                    Sign In
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              <View>
                <Text style={{textAlign: 'center'}}>Sign In with </Text>
                <View style={{flexDirection: 'row'}}>
                  <MaterialCommunityIcons
                    name="facebook"
                    size={45}
                    color="#1872ea"
                    onPress={() => this.onFacebookButtonPress()}
                  />
                  <FontAwesome
                    name="google-plus-official"
                    size={45}
                    style={{marginRight: 5}}
                    color="#d83834"
                    onPress={() => this.onGoogleButtonPress()}
                  />
                  <TouchableOpacity
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: 'black',
                      alignContent: 'center',
                      justifyContent: 'center',
                      marginTop: 2,
                    }}
                    onPress={() =>
                      this.props.navigation.navigate('SignupNumber')
                    }>
                    <FontAwesome
                      name="phone"
                      size={30}
                      color="white"
                      style={{textAlign: 'center'}}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => this.props.navigation.navigate('Signup')}
                style={[
                  styles.signIn,
                  {
                    borderColor: '#ee4e4e',
                    borderWidth: 1,
                    marginTop: 15,
                  },
                ]}>
                <Text
                  style={[
                    styles.textSign,
                    {
                      color: '#ee4e4e',
                    },
                  ]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => this.props.navigation.navigate('Gateway1')}>
                <Text
                  style={{
                    color: '#ee4e4e',
                    marginTop: 15,
                    justifyContent: 'center',
                    alignSelf: 'center',
                  }}>
                  Partner with Us
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      </Box>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ee4e4e',
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
    marginTop: SCREEN_HEIGHT < 767 ? -10 : 50,
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
