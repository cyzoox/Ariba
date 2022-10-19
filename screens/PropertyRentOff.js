import React, {Component} from 'react';
import {
  AppState,
  Platform,
  StyleSheet,
  View,
  Image,
  ImageBackground,
  Dimensions,
} from 'react-native';
import DynamicTabView from 'react-native-dynamic-tab-view';
import {
  Text,
  Box,
} from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PRCardOff from '../components/PRCardOff';
import auth from '@react-native-firebase/auth';
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export default class PropertyRentOff extends Component {
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

  _renderItem = (item, index) => {
    return (
      <View key={item['key']} style={{backgroundColor: '#ffffff', flex: 1}}>
        <PRCardOff
          title={item['title']}
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
                width: '85%',
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
                }}
                source={{uri: this.state.storeImage}}
              />
              <View
                style={{
                  flexDirection: 'column',
                  width: '100%',
                  marginLeft: 10,
                  marginTop: 20,
                }}>
                <Text style={{color: 'white', fontSize: 18}}>
                  {this.state.storeName}
                </Text>
                <Text style={{color: 'white', fontSize: 12, width: '100%'}}>
                  {this.state.storeAddress}
                </Text>
              </View>
            </Box>
          </ImageBackground>
        </Box>
        <DynamicTabView
          data={this.state.category}
          renderTab={this._renderItem}
          defaultIndex={this.state.defaultIndex}
          containerStyle={styles.container}
          headerBackgroundColor={'white'}
          headerTextStyle={styles.headerText}
          onChangeTab={this.onChangeTab}
          headerUnderlayColor={'#019fe8'}
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
