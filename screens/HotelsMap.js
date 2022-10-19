import React, {Component} from 'react';
import {
  AppState,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Alert,
  Image,
  TouchableWithoutFeedback,
  FlatList,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {
  Container,
  View,
  Left,
  Right,
  Button,
  Icon,
  Grid,
  Col,
  Badge,
  Title,
  Card,
  CardItem,
  Body,
  Item,
  Input,
  List,
  Picker,
  ListItem,
  Thumbnail,
  Text,
  Form,
  Textarea,
  Toast,
  Root,
  Header,
} from 'native-base';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// Our custom files and classes import
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
import AccountInfo from './checkout/AccountInfo';
import DeliveryDetails from './checkout/DeliveryDetails';
import {RadioButton, Chip, Divider} from 'react-native-paper';
//import { StackActions, NavigationActions } from 'react-navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import Modal from 'react-native-modal';
import TearLines from 'react-native-tear-lines';
import NumberFormat from 'react-number-format';
import Loader from '../components/Loader';
import CustomHeader from './Header';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import axios from 'axios';
import Rider_img from '../assets/rider.png';
import customer_img from '../assets/customer.png';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import * as ImagePicker from 'react-native-image-picker';
import {imgDefault} from './images';
import {FlatGrid} from 'react-native-super-grid';
import Geolocation from 'react-native-geolocation-service';
import MapboxGL, {Logger} from '@react-native-mapbox-gl/maps';
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

export default class HotelsMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      appState: AppState.currentState,
      cLong: this.props.route.params.cLong,
      cLat: this.props.route.params.cLat,

      routeForMap: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [
                [this.props.route.params.cLong, this.props.route.params.cLat],
                [this.props.route.params.cLong, this.props.route.params.cLat],
              ],
            },
          },
        ],
      },
    };
  }

  componentDidMount() {
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
          if (auth().currentUser.uid) {
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
        }
        this.setState({appState: nextAppState});
      },
    );

    Geolocation.getCurrentPosition(
      info => {
        const {coords} = info;
        let routeCoordinates = [];
        axios
          .get(
            `https://route.ls.hereapi.com/routing/7.2/calculateroute.json?apiKey=5fcoJoPAIOye99-ssHc6TIx73yOAhtWiU1_1p1461X4&waypoint0=geo!${coords.latitude},${coords.longitude}&waypoint1=geo!${this.props.route.params.cLat},${this.props.route.params.cLong}&mode=fastest;car;traffic:disabled&legAttributes=shape`,
          )
          .then(res => {
            res.data.response.route[0].leg[0].shape.map(m => {
              // here we are getting latitude and longitude in seperate variables because HERE sends it together, but we
              // need it seperate for <Polyline/>
              let latlong = m.split(',');
              let latitude = parseFloat(latlong[0]);
              let longitude = parseFloat(latlong[1]);
              routeCoordinates.push([longitude, latitude]);
            });
            console.log('routeCoordinates', routeCoordinates);
            this.setState({
              routeForMap: {
                type: 'FeatureCollection',
                features: [
                  {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                      type: 'LineString',
                      coordinates: routeCoordinates,
                    },
                  },
                ],
              },
              summary: res.data.response.route[0].summary,
            });
          })
          .catch(err => {
            console.log('here fron: ', err);
          });
      },
      error => console.log(error),
      {
        enableHighAccuracy: false,
        timeout: 2000,
        maximumAge: 3600000,
      },
    );
  }

  componentWillUnmount() {
    this.appStateSubscription.remove();
  }

  render() {
    return (
      <Root>
        <Container style={{backgroundColor: '#CCCCCC'}}>
          <Header
            androidStatusBarColor="#2c3e50"
            style={{display: 'none'}}
            style={{backgroundColor: '#019fe8'}}>
            <Left style={{flex: 1}}>
              <Button
                transparent
                onPress={() => this.props.navigation.goBack()}>
                <MaterialIcons name="arrow-back" size={25} color="white" />
              </Button>
            </Left>
            <Body style={{flex: 3}}>
              <Title style={{color: 'white'}}>Booking Shares</Title>
            </Body>
          </Header>

          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: Dimensions.get('window').width,
                height: Dimensions.get('window').height,
              }}>
              <MapboxGL.MapView
                zoomEnabled={true}
                scrollEnabled={true}
                pitchEnabled={true}
                style={{
                  position: 'absolute',
                  flex: 1,
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}>
                <MapboxGL.Camera
                  centerCoordinate={[
                    this.props.route.params.cLong,
                    this.props.route.params.cLat,
                  ]}
                  zoomLevel={15}
                  followUserMode={'normal'}
                  followUserLocation
                />

                <MapboxGL.ShapeSource
                  id="shapeSource"
                  shape={this.state.routeForMap}>
                  <MapboxGL.LineLayer
                    id="lineLayer"
                    style={{
                      lineWidth: 5,
                      lineJoin: 'bevel',
                      lineColor: '#ff0000',
                    }}
                  />
                </MapboxGL.ShapeSource>

                <MapboxGL.UserLocation
                  visible={true}
                  showsUserHeadingIndicator={true}
                />

                <MapboxGL.PointAnnotation
                  coordinate={[
                    this.props.route.params.cLong,
                    this.props.route.params.cLat,
                  ]}
                />
              </MapboxGL.MapView>

              {/* <MapView
      provider={PROVIDER_GOOGLE}
      zoomEnabled={true}
        showsUserLocation={true}
        scrollEnabled={true}
                pitchEnabled={true}
        style={{ position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0}}
          region={{
            latitude: this.state.cLong,
            longitude:this.state.cLat,
           latitudeDelta: 0.01,
              longitudeDelta: 0.005
          }}
          >
        
          <MapView.Marker
             coordinate={{latitude: this.state.cLong, longitude: this.state.cLat}}
             title={"Location"}
             description={'Location Here'}
             image={Rider_img}
          />
          </MapView>*/}
            </View>
          </View>
          <View></View>
        </Container>
      </Root>
    );
  }
}

const styles = {
  line: {
    width: '100%',
    height: 1,
    backgroundColor: '#bdc3c7',
    marginBottom: 10,
    marginTop: 10,
  },
  view: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  invoice: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.2,
    borderBottomColor: '#ffffff',
    borderTopColor: '#ffffff',
  },
  centerElement: {justifyContent: 'center', alignItems: 'center'},
  content: {
    backgroundColor: 'white',
    padding: 22,
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
};
