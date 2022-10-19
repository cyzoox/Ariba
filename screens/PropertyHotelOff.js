import React, {Component} from 'react';
import {
  AppState,
  Platform,
  StyleSheet,
  View,
  Image,
  ImageBackground,
  FlatList,
  Dimensions,
} from 'react-native';
import DynamicTabView from 'react-native-dynamic-tab-view';
import {
  Text,
  Box,
} from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomHeader from './Header';
import HotelCardOff from '../components/HotelCardOff';
import auth from '@react-native-firebase/auth';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

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

export default class PropertyHotelOff extends Component {
  constructor(props) {
    super(props);
    const store = this.props.route.params.store;
    const slatitude = this.props.route.params.slatitude;
    const slongitude = this.props.route.params.slongitude;
    this.state = {
      appState: AppState.currentState,
      defaultIndex: 0,
      storeImage: store.foreground,
      storeAddress: store.address + ' ' + store.city + ' ' + store.province,
      storeName: store.name,
      category: store.subcategory,
      name: store.name,
      store_id: store.id,
      token: store.notification_token,
      visibleModal: false,
      count: 0,
      dataProvider: [],
      slongitude: slongitude,
      slatitude: slatitude,
      background: store.background,
    };
  }

  _renderItem = (item, index) => {
    return (
      <View key={item} style={{backgroundColor: '#ffffff', }}>
        <HotelCardOff
          title={item['title']}
          storeInfo={this.props.route.params.store}
          store={this.state.name}
          storeId={this.state.store_id}
          token={this.state.token}
          slatitude={this.state.slatitude}
          slongitude={this.state.slongitude}
          typeOfRate={this.props.route.params.typeOfRate}
          currency={this.props.route.params.currency}
          navigation={this.props.navigation}
        />
      </View>
    );
  };

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
          AsyncStorage.removeItem('asyncselectedCity');
          AsyncStorage.removeItem('asyncselectedCountry');
        }
        this.setState({appState: nextAppState});
      },
    );
  }
  componentWillUnmount() {
    this.appStateSubscription.remove();
  }

  onChangeTab = index => {};

  render() {
    console.log('typeOfRate: ', this.props.route.params.typeOfRate);
    return (
      <Box style={{flex: 1}}>
        <Box
          style={{height: SCREEN_HEIGHT / 6}}>
          <ImageBackground
            source={{uri: this.state.background}}
            resizeMode="cover"
            style={{height: SCREEN_HEIGHT / 6}}>
            <Box
              style={{
                flex: 2,
                width: '100%',
                marginTop: 20,
                flexDirection: 'row',
              }}>
              <Image
                style={{
                  width: SCREEN_HEIGHT / 8,
                  height: SCREEN_HEIGHT / 8,
                  borderRadius: 50,
                  borderWidth: 2,
                  borderColor: 'white',
                  overflow: 'hidden',
                  marginLeft: '5%',
                }}
                source={{uri: this.state.storeImage}}
              />
              <View
                style={{
                  flexDirection: 'column',
                  width: '80%',
                  marginLeft: 15,
                  marginTop: 20,
                  backgroundColor: 'rgba(255, 255, 255, 0.4)',
                  paddingLeft: 10,
                }}>
                <Text
                  style={{color: 'white', fontSize: 18, fontWeight: 'bold'}}>
                  {this.state.storeName}
                </Text>
                <Text style={{color: 'white', fontSize: 12, width: '80%'}}>
                  {this.state.storeAddress}
                </Text>
              </View>
            </Box>
          </ImageBackground>
        </Box>
        <View style={{backgroundColor: '#019fe8', height: 80}}>
          <View style={{flex: 1, flexDirection: 'row', width: 200, height: 80}}>
            <MapboxGL.MapView
              style={{height: 80, width: SCREEN_WIDTH / 2, marginLeft: -10}}
              attributionEnabled={false}
              logoEnabled={false}
              onPress={() =>
                this.props.navigation.navigate('HotelsMap', {
                  cLat: this.props.route.params.store.slatitude,
                  cLong: this.props.route.params.store.slongitude,
                })
              }>
              <MapboxGL.Camera
                centerCoordinate={[
                  this.props.route.params.store.slongitude,
                  this.props.route.params.store.slatitude,
                ]}
                zoomLevel={11}
                followUserMode={'normal'}
              />
              <MapboxGL.PointAnnotation
                coordinate={[
                  this.props.route.params.store.slongitude,
                  this.props.route.params.store.slatitude,
                ]}
              />
            </MapboxGL.MapView>
            <View
              style={{
                justifyContent: 'center',
                alignContent: 'center',
                width: SCREEN_WIDTH / 2.2,
                flexDirection: 'row',
                paddingTop: 8,
                paddingLeft: 10,
              }}>
              <Text style={{fontSize: 11, paddingLeft: 5, color: 'white'}}>
                {this.props.route.params.store.description}{' '}
              </Text>
            </View>
          </View>
        </View>
        <FlatList
          data={[0]}
          renderItem={this._renderItem}
          enableEmptySections={true}
          
        />
      </Box>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 0,
    paddingTop: 0,
    marginTop: 0,
    marginBottom: 0,
    height: 50,
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
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
});
