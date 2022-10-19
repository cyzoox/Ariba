import React, {Component} from 'react';
import {
  AppState,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  BackHandler,
  Alert,
  Dimensions,
  
} from 'react-native';
import {
  Text,
  Box,
  Tabs,
  Tab,
  ScrollableTab,
} from 'native-base';
import Ionicons from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from '../components/Loader';
import CustomHeader from './Header';

import Pending from './orders/Pending';
import Processing from './orders/Processing';
import Delivered from './orders/Delivered';
import Cancelled from './orders/Cancelled';
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export default class OrderScreen extends Component {
  constructor() {
    super();
    this.ref = firestore();
    this.unsubscribe = null;
    this.state = {
      appState: AppState.currentState,
      user: null,
      email: '',
      password: '',
      formValid: true,
      error: '',
      loading: false,
      dataSource: [],
      uid: '',
      customStyleIndex:0,
    };
  }

  onCollectionUpdate = querySnapshot => {
    const orders = [];
    querySnapshot.forEach(doc => {
      orders.push({
        datas: doc.data(),
        key: doc.id,
      });
    });
    this.setState({
      dataSource: orders,
      loading: false,
    });
  };

  _bootstrapAsync = async () => {
    const userId = await AsyncStorage.getItem('uid');
    this.unsubscribe = this.ref
      .collection('orders')
      .where('userId', '==', userId)
      .orderBy('OrderNo', 'asc')
      .onSnapshot(this.onCollectionUpdate);
    this.setState({uid: userId, loading: false});
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
    this.setState({loading: true});
    this._bootstrapAsync();
  }

  componentWillUnmount() {
    this.appStateSubscription.remove();
  }

  render() {
    return (
      <Box style={{flex: 1}}>
        <CustomHeader
          title="Order History"
          isHome={true}
          Cartoff={true}
          navigation={this.props.navigation}
        />
        <FlatList
            key={'7'}
            data={[
              {label: 'Transactions'},
              {label: 'Delivered'},
              {label: 'Cancelled'},
            ]}
            style={{height: 50, flexGrow: 0, backgroundColor: '#F2F2F2', marginBottom:20}}
            horizontal
            renderItem={({item, index}) => (
              <TouchableOpacity
                style={{
                  width:SCREEN_WIDTH/3,
                  justifyContent: 'center',
                  alignSelf: 'flex-start',
                  padding: 10,
                  height: 50,
                  backgroundColor:
                    this.state.customStyleIndex == index ? 'tomato' : '#F2F2F2',
                
                }}
                onPress={() => this.setState({customStyleIndex: index})}>
                <Text
                  style={{
                    textAlign: 'center',
                    color:
                      this.state.customStyleIndex == index
                        ? 'white'
                        : 'black',
                    fontWeight: 'bold',
                  }}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
          {this.state.customStyleIndex == 0?
           <Pending uid={this.state.uid} navigation={this.props.navigation} />
           :this.state.customStyleIndex == 1?
           <Delivered
              orders={this.state.dataSource}
              uid={this.state.uid}
              navigation={this.props.navigation}
            />:
            <Cancelled
              orders={this.state.dataSource}
              uid={this.state.uid}
              navigation={this.props.navigation}
            />
          }
       
      </Box>
    );
  }
}

const styles = StyleSheet.create({
  stepIndicator: {
    marginVertical: 10,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
