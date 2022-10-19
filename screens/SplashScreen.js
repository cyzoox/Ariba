import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import {fcmService} from './FCM/FCMService'
import {Container, Header} from 'native-base';
import {Easing} from 'react-native-reanimated';
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

class SplashScreen extends React.Component {
  constructor(props) {
    super(props);
    this.Rotatevalue = new Animated.Value(0);
    this.startValue = new Animated.Value(0);
    this.startValueShares = new Animated.Value(0);
    this.startValueWidth = new Animated.Value(SCREEN_WIDTH / 3);
    this.startValueHeight = new Animated.Value(SCREEN_HEIGHT / 3);

    this.state = {
      startValue: new Animated.Value(0),
      endValue: -SCREEN_HEIGHT / 1.08,
      endValueShares: -(SCREEN_HEIGHT / 2.2),
      duration: 2600,
    };
  }

  performTimeConsumingTask = async () => {
    return new Promise(resolve =>
      setTimeout(() => {
        resolve('result');
      }, 400),
    );
  };

  async componentDidMount() {
    this.StartImageRotationFunction();
    this.startAnimationBooking();
    this.zoomInNow();
    this.zoomInNowHeight();
    const data = await this.performTimeConsumingTask();
    const isLoggedIn = await AsyncStorage.getItem('uid');
    const locationPermission = await AsyncStorage.getItem('loc_perm');

      if (data !== null) {
        setTimeout(() => {
          
    if(locationPermission === 'not_granted'){
      this.props.navigation.navigate('LocationPerm')
    }else{
          this.props.navigation.reset({
            index: 0,
            routes: [{name: isLoggedIn ? 'Home' : 'Home2'}],
          });
        }
        }, 2000);
      }
    
    
  }
  zoomInNow() {
    this.startValueWidth.setValue(SCREEN_WIDTH / 4);
    Animated.timing(this.startValueWidth, {
      toValue: SCREEN_WIDTH,
      duration: 2600,
      useNativeDriver: false,
    }).start(() => this.zoomInNow());
  }

  zoomInNowHeight() {
    this.startValueHeight.setValue(SCREEN_HEIGHT / 4);
    Animated.timing(this.startValueHeight, {
      toValue: SCREEN_HEIGHT / 2,
      duration: 2600,
      useNativeDriver: false,
    }).start(() => this.zoomInNowHeight());
  }
  StartImageRotationFunction() {
    this.Rotatevalue.setValue(0);
    Animated.timing(this.Rotatevalue, {
      toValue: 1,
      duration: 2600,
      useNativeDriver: false, // Add This line
    }).start(() => this.StartImageRotationFunction());
  }

  startAnimationBooking() {
    this.startValue.setValue(0);
    Animated.timing(this.startValue, {
      toValue: this.state.endValue,
      duration: this.state.duration,
      useNativeDriver: false,
    }).start(() => this.startAnimationBooking());
  }

  render() {
    return (
      <View style={styles.viewStyles}>
        {/*<Header
          androidStatusBarColor="white"
          style={{
            display: 'none',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        />*/}

        <Animated.Image
          style={[
            {
              width: this.startValueWidth,
              height: this.startValueHeight,
              resizeMode: 'contain',
              opacity: this.Rotatevalue,
              top: SCREEN_WIDTH / 2.5,
            },
          ]}
          source={require('../assets/ariba2.png')}
        />
        <Animated.Image
          style={[
            {
              width: SCREEN_WIDTH / 2,
              height: SCREEN_HEIGHT / 2.5,
              resizeMode: 'contain',
              top: SCREEN_HEIGHT / 1.5,
              transform: [
                {
                  translateY: this.startValue,
                },
              ],
            },
          ]}
          source={require('../assets/ariba.png')}
        />
      </View>
    );
  }
}

const styles = {
  viewStyles: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },

  textStyles: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
  },
  backgroundImage: {
    resizeMode: 'cover', // or 'stretch'
  },
};

export default SplashScreen;
