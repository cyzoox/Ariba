import React, {Component} from 'react';
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  BackHandler,
  Alert,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import {
  Box,
  Text,
  View,
  Image,
} from 'native-base';
import {Card} from 'react-native-paper'
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import moment from 'moment';
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from '../../components/Loader';
import CustomHeader from '../Header';
import {
  Collapse,
  CollapseHeader,
  CollapseBody,
} from 'accordion-collapse-react-native';
import StepIndicator from 'react-native-step-indicator';
import {paddingLeft} from 'styled-system';
const secondIndicatorStyles = {
  stepIndicatorSize: 20,
  currentStepIndicatorSize: 20,
  separatorStrokeWidth: 2,
  currentStepStrokeWidth: 3,
  stepStrokeCurrentColor: 'rgba(94,163,58,1)',
  stepStrokeWidth: 3,
  separatorStrokeFinishedWidth: 4,
  stepStrokeFinishedColor: 'rgba(94,163,58,1)',
  stepStrokeUnFinishedColor: '#aaaaaa',
  separatorFinishedColor: 'rgba(94,163,58,1)',
  separatorUnFinishedColor: '#aaaaaa',
  stepIndicatorFinishedColor: 'rgba(94,163,58,1)',
  stepIndicatorUnFinishedColor: '#ffffff',
  stepIndicatorCurrentColor: '#ffffff',
  stepIndicatorLabelFontSize: 9,
  currentStepIndicatorLabelFontSize: 9,
  stepIndicatorLabelCurrentColor: 'rgba(94,163,58,1)',
  stepIndicatorLabelFinishedColor: '#ffffff',
  stepIndicatorLabelUnFinishedColor: '#aaaaaa',
  labelColor: '#999999',
  labelSize: 9,
  currentStepLabelColor: 'rgba(94,163,58,1)',
};

export default class Pending extends Component {
  constructor(props) {
    super(props);
    this.Rotatevalue = new Animated.Value(0);
    this.unsubscribe = null;
    this.state = {
      user: null,
      email: '',
      password: '',
      formValid: true,
      error: '',
      loading: false,
      dataSource: [],
    };
  }
  componentDidMount() {
    this.StartImageRotationFunction();
    this._bootstrapAsync();
  }
  getData = () => {
    this._bootstrapAsync();
  };
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
    this.unsubscribe = firestore()
      .collection('orders')
      .where('userId', '==', userId)
      .orderBy('OrderNo', 'asc')
      .onSnapshot(this.onCollectionUpdate);
    this.setState({uid: userId, loading: false});
  };

  StartImageRotationFunction() {
    this.Rotatevalue.setValue(0);
    Animated.timing(this.Rotatevalue, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: true, // Add this line
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
    const newOrders = this.state.dataSource.filter(item => {
      const itemData = item.datas.OrderStatus;
      const textData = 'Pending';
      const textDataProcessing = 'Processing';
      const textDataCancel = 'For Cancel';
      return itemData === 'Processing'
        ? itemData.indexOf(textDataProcessing) > -1
        : itemData === 'For Cancel'
        ? itemData.indexOf(textDataCancel) > -1
        : itemData.indexOf(textData) > -1;
    });

    console.log('newOrders: ', newOrders.length);
    return (
      <Box style={{flex: 1}}>
        <Loader loading={this.state.loading} trans={trans} />

        {this.props.uid ? (
          <FlatList
            key={'#'}
            refreshing={this.state.loading}
            onRefresh={this.getData}
            data={newOrders}
            renderItem={({item, index}) => (
              <View key={index} style={{marginBottom:20,}}>
                <Card style={{paddingTop:10, paddingBottom:10}}>
                  <Collapse
                    isExpanded={index == 0 ? true : false}
                    handleLongPress={() => {
                      item.datas.SubProductType == 'Backload'
                        ? this.props.navigation.navigate(
                            'OrderDetailsTranspoBackload',
                            {orders: item.datas},
                          )
                        : item.datas.SubProductType == 'Pabili'
                        ? this.props.navigation.navigate('OrderDetailsPabili', {
                            orders: item.datas,
                          })
                        : item.datas.ProductType == 'Services'
                        ? this.props.navigation.navigate(
                            'OrderDetailsService',
                            {orders: item.datas},
                          )
                        : item.datas.ProductType == 'Rentals'
                        ? this.props.navigation.navigate(
                            'OrderDetailsRentals',
                            {orders: item.datas},
                          )
                        : item.datas.ProductType == 'Hotels'
                        ? this.props.navigation.navigate('OrderDetailsHotels', {
                            orders: item.datas,
                          })
                        : item.datas.ProductType == 'Transport'
                        ? this.props.navigation.navigate(
                            'OrderDetailsTranspo',
                            {orders: item.datas},
                          )
                        : this.props.navigation.navigate('OrderDetails', {
                            orders: item.datas,
                          });
                    }}>
                    <CollapseHeader>
                      <Box>
                        <Box style={{paddingLeft: 10, flex: 3}}>
                          <View style={{width: SCREEN_WIDTH / 1.2}}>
                            <Text
                              style={{
                                fontSize: 17,
                                fontWeight: 'bold',
                                textAlign: 'center',
                              }}>
                              Thank You!
                            </Text>
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: '900',
                                textAlign: 'center',
                              }}>
                              Transaction Number: #00{item.datas.OrderNo}
                            </Text>
                            <Text
                              note
                              style={{
                                color: 'black',
                                fontSize: 14,
                                textAlign: 'center',
                              }}>
                              {item.datas.OrderDetails.Date_Ordered}
                            </Text>
                          </View>
                          <View style={{width: SCREEN_WIDTH / 1.2}}>
                            <StepIndicator
                              stepCount={3}
                              customStyles={secondIndicatorStyles}
                              currentPosition={
                                item.datas.OrderStatus == 'Pending' ? 0 : 1
                              }
                              labels={['Queued', 'Accepted', 'Completed']}
                            />
                          </View>

                          <View style={{width: SCREEN_WIDTH / 1.2}}>
                            <Text
                              note
                              style={{
                                color: 'black',
                                fontSize: 14,
                                textAlign: 'center',
                              }}>
                              {item.datas.SubProductType == 'Pabili'
                                ? 'Book a Rider'
                                : item.datas.SubProductType == 'Backload'
                                ? 'Backload'
                                : item.datas.ProductType == 'Foods' &&
                                  item.datas.Mode == 'Pick-up'
                                ? 'Pick-up (Long Press to View Details)'
                                : item.datas.ProductType == 'Foods' &&
                                  item.datas.Mode == 'Delivery'
                                ? 'Delivery'
                                : item.datas.ProductType == 'Transport'
                                ? 'Transportation'
                                : item.datas.ProductType}
                            </Text>
                          </View>
                          {item.datas.SubProductType == 'Pabili' ? null : (
                            <View style={{flexDirection: 'row'}}>
                              <Ionicons
                                name={'ios-location-sharp'}
                                style={{marginRight: 10}}
                                color={'green'}
                              />
                              <Text note style={{color: 'black', fontSize: 14}}>
                                {item.datas.Billing.address}
                              </Text>
                            </View>
                          )}
                          {item.datas.SubProductType == 'Pabili' ? null : item
                              .datas.ProductType == 'Foods' ||
                            item.datas.ProductType == 'Hotels' ||
                            item.datas.ProductType == 'Rentals' ||
                            item.datas.ProductType == 'Services' ? null : (
                            <View style={{flexDirection: 'row'}}>
                              <Ionicons
                                name={'ios-location-sharp'}
                                style={{marginRight: 10}}
                                color={'tomato'}
                              />
                              <Text note style={{color: 'black', fontSize: 14}}>
                                {item.datas.billing_streetTo}
                              </Text>
                            </View>
                          )}
                        </Box>
                      </Box>
                    </CollapseHeader>

                    <CollapseBody
                      style={{
                        flexDirection: 'row',
                        backgroundColor: '#EDEDED',
                      }}>
                      {item.datas.SubProductType == 'Pabili' ? (
                        <TouchableOpacity
                          style={{flexDirection: 'column', padding: 10}}
                          onPress={() => {
                            item.datas.SubProductType == 'Pabili'
                              ? this.props.navigation.navigate(
                                  'OrderDetailsPabili',
                                  {orders: item.datas},
                                )
                              : item.datas.ProductType == 'Services'
                              ? this.props.navigation.navigate(
                                  'OrderDetailsService',
                                  {orders: item.datas},
                                )
                              : item.datas.ProductType == 'Rentals'
                              ? this.props.navigation.navigate(
                                  'OrderDetailsRentals',
                                  {orders: item.datas},
                                )
                              : item.datas.ProductType == 'Hotels'
                              ? this.props.navigation.navigate(
                                  'OrderDetailsHotels',
                                  {orders: item.datas},
                                )
                              : item.datas.ProductType == 'Transport'
                              ? this.props.navigation.navigate(
                                  'OrderDetailsTranspo',
                                  {orders: item.datas},
                                )
                              : this.props.navigation.navigate('OrderDetails', {
                                  orders: item.datas,
                                });
                          }}>
                          {item.datas.OrderStatus == 'Processing' ? (
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'flex-start',
                                alignItems: 'flex-start',
                                width: SCREEN_WIDTH,
                                paddingLeft: 10,
                              }}>
                              <MaterialIcons
                                name={'admin-panel-settings'}
                                size={14}
                                style={{marginRight: 10}}
                                color={'tomato'}
                              />
                              <Text note style={{color: 'black', fontSize: 14}}>
                                Accepted By:{' '}
                                {item.datas.DeliveredBy.ownerRider == false
                                  ? item.datas.DeliveredBy.selectedDeliveryApp
                                  : item.datas.AdminName}
                              </Text>
                            </View>
                          ) : null}
                          {item.datas.OrderStatus == 'Processing' ? (
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'flex-start',
                                alignItems: 'flex-start',
                                width: SCREEN_WIDTH,
                                paddingLeft: 10,
                              }}>
                              <MaterialCommunityIcons
                                name={'racing-helmet'}
                                size={14}
                                style={{marginRight: 10}}
                                color={'tomato'}
                              />
                              <Text note style={{color: 'black', fontSize: 14}}>
                                Rider: {item.datas.DeliveredBy.Name}
                              </Text>
                            </View>
                          ) : null}
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'flex-start',
                              alignItems: 'flex-start',
                              width: SCREEN_WIDTH - 50,
                              paddingLeft: 10,
                            }}>
                            <Ionicons
                              name={'ios-location-sharp'}
                              size={14}
                              style={{marginRight: 10}}
                              color={'green'}
                            />
                            <Text note style={{color: 'black', fontSize: 12}}>
                              {item.datas.Billing.address}
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'flex-start',
                              alignItems: 'flex-start',
                              width: SCREEN_WIDTH - 50,
                              paddingLeft: 10,
                            }}>
                            <Ionicons
                              name={'ios-location-sharp'}
                              size={14}
                              style={{marginRight: 10}}
                              color={'tomato'}
                            />
                            <Text note style={{color: 'black', fontSize: 12}}>
                              {item.datas.billing_streetTo}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ) : item.datas.SubProductType == 'Backload' ? (
                        <TouchableOpacity
                          style={{
                            flexDirection: 'column',
                            padding: 10,
                            paddingLeft: 10,
                          }}
                          onPress={() => {
                            item.datas.SubProductType == 'Backload'
                              ? this.props.navigation.navigate(
                                  'OrderDetailsTranspoBackload',
                                  {orders: item.datas},
                                )
                              : item.datas.SubProductType == 'Pabili'
                              ? this.props.navigation.navigate(
                                  'OrderDetailsPabili',
                                  {orders: item.datas},
                                )
                              : item.datas.ProductType == 'Services'
                              ? this.props.navigation.navigate(
                                  'OrderDetailsService',
                                  {orders: item.datas},
                                )
                              : item.datas.ProductType == 'Rentals'
                              ? this.props.navigation.navigate(
                                  'OrderDetailsRentals',
                                  {orders: item.datas},
                                )
                              : item.datas.ProductType == 'Hotels'
                              ? this.props.navigation.navigate(
                                  'OrderDetailsHotels',
                                  {orders: item.datas},
                                )
                              : item.datas.ProductType == 'Transport'
                              ? this.props.navigation.navigate(
                                  'OrderDetailsTranspo',
                                  {orders: item.datas},
                                )
                              : this.props.navigation.navigate('OrderDetails', {
                                  orders: item.datas,
                                });
                          }}>
                          {item.datas.OrderStatus == 'Processing' ? (
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'flex-start',
                                alignItems: 'flex-start',
                                width: SCREEN_WIDTH,
                                paddingLeft: 10,
                              }}>
                              <MaterialIcons
                                name={'admin-panel-settings'}
                                size={14}
                                style={{marginRight: 10}}
                                color={'tomato'}
                              />
                              <Text note style={{color: 'black', fontSize: 14}}>
                                Accepted By: {item.datas.AdminName}
                              </Text>
                            </View>
                          ) : null}

                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'flex-start',
                              alignItems: 'flex-start',
                              width: SCREEN_WIDTH - 50,
                              paddingLeft: 10,
                            }}>
                            <Ionicons
                              name={'person'}
                              size={14}
                              style={{marginRight: 10}}
                              color={'tomato'}
                            />
                            <Text note style={{color: 'black', fontSize: 14}}>
                              Receiver Name: {item.datas.Rname}
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'flex-start',
                              alignItems: 'flex-start',
                              width: SCREEN_WIDTH - 50,
                              paddingLeft: 10,
                            }}>
                            <FontAwesome5
                              name={'boxes'}
                              size={14}
                              style={{marginRight: 10}}
                              color={'tomato'}
                            />
                            <Text note style={{color: 'black', fontSize: 14}}>
                              Package Description:{' '}
                              {item.datas.PassengerDescription}
                            </Text>
                          </View>
                          {item.datas.OrderStatus == 'Processing' ? (
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'flex-start',
                                alignItems: 'flex-start',
                                width: SCREEN_WIDTH - 50,
                                paddingLeft: 10,
                              }}>
                              <Ionicons
                                name={'car-sport'}
                                size={14}
                                style={{marginRight: 10}}
                                color={'tomato'}
                              />
                              <Text note style={{color: 'black', fontSize: 14}}>
                                Vehicle Information:{' '}
                                {item.datas.DeliveredBy.ColorMotor}{' '}
                                {item.datas.DeliveredBy.MBrand}{' '}
                                {item.datas.DeliveredBy.VModel}
                              </Text>
                            </View>
                          ) : null}
                          {item.datas.OrderStatus == 'Processing' ? (
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'flex-start',
                                alignItems: 'flex-start',
                                width: SCREEN_WIDTH - 50,
                                paddingLeft: 10,
                              }}>
                              <MaterialCommunityIcons
                                name={'racing-helmet'}
                                size={14}
                                style={{marginRight: 10}}
                                color={'tomato'}
                              />
                              <Text note style={{color: 'black', fontSize: 14}}>
                                Driver: {item.datas.DeliveredBy.Name}
                              </Text>
                            </View>
                          ) : null}
                        </TouchableOpacity>
                      ) : item.datas.ProductType == 'Transport' ? (
                        <TouchableOpacity
                          style={{
                            flexDirection: 'column',
                            padding: 10,
                            paddingLeft: 10,
                          }}
                          onPress={() => {
                            item.datas.SubProductType == 'Pabili'
                              ? this.props.navigation.navigate(
                                  'OrderDetailsPabili',
                                  {orders: item.datas},
                                )
                              : item.datas.ProductType == 'Services'
                              ? this.props.navigation.navigate(
                                  'OrderDetailsService',
                                  {orders: item.datas},
                                )
                              : item.datas.ProductType == 'Rentals'
                              ? this.props.navigation.navigate(
                                  'OrderDetailsRentals',
                                  {orders: item.datas},
                                )
                              : item.datas.ProductType == 'Hotels'
                              ? this.props.navigation.navigate(
                                  'OrderDetailsHotels',
                                  {orders: item.datas},
                                )
                              : item.datas.ProductType == 'Transport'
                              ? this.props.navigation.navigate(
                                  'OrderDetailsTranspo',
                                  {orders: item.datas},
                                )
                              : this.props.navigation.navigate('OrderDetails', {
                                  orders: item.datas,
                                });
                          }}>
                          {item.datas.OrderStatus == 'Processing' ? (
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'flex-start',
                                alignItems: 'flex-start',
                                width: SCREEN_WIDTH,
                                paddingLeft: 10,
                              }}>
                              <MaterialIcons
                                name={'admin-panel-settings'}
                                size={14}
                                style={{marginRight: 10}}
                                color={'tomato'}
                              />
                              <Text note style={{color: 'black', fontSize: 14}}>
                                Accepted By: {item.datas.AdminName}
                              </Text>
                            </View>
                          ) : null}

                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'flex-start',
                              alignItems: 'flex-start',
                              width: SCREEN_WIDTH - 50,
                              paddingLeft: 10,
                            }}>
                            <Ionicons
                              name={'car-sport'}
                              size={14}
                              style={{marginRight: 10}}
                              color={'tomato'}
                            />
                            <Text note style={{color: 'black', fontSize: 14}}>
                              Vehicle: {item.datas.vehicle}
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'flex-start',
                              alignItems: 'flex-start',
                              width: SCREEN_WIDTH - 50,
                              paddingLeft: 10,
                            }}>
                            <MaterialIcons
                              name={'groups'}
                              size={14}
                              style={{marginRight: 10}}
                              color={'tomato'}
                            />
                            <Text note style={{color: 'black', fontSize: 14}}>
                              Passengers: {item.datas.passengers}
                            </Text>
                          </View>
                          {item.datas.OrderStatus == 'Processing' ? (
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'flex-start',
                                alignItems: 'flex-start',
                                width: SCREEN_WIDTH - 50,
                                paddingLeft: 10,
                              }}>
                              <Ionicons
                                name={'car-sport'}
                                size={14}
                                style={{marginRight: 10}}
                                color={'tomato'}
                              />
                              <Text note style={{color: 'black', fontSize: 14}}>
                                Vehicle Information:{' '}
                                {item.datas.DeliveredBy.ColorMotor}{' '}
                                {item.datas.DeliveredBy.MBrand}{' '}
                                {item.datas.DeliveredBy.VModel}
                              </Text>
                            </View>
                          ) : null}
                          {item.datas.OrderStatus == 'Processing' ? (
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'flex-start',
                                alignItems: 'flex-start',
                                width: SCREEN_WIDTH - 50,
                                paddingLeft: 10,
                              }}>
                              <MaterialCommunityIcons
                                name={'racing-helmet'}
                                size={14}
                                style={{marginRight: 10}}
                                color={'tomato'}
                              />
                              <Text note style={{color: 'black', fontSize: 14}}>
                                Driver: {item.datas.DeliveredBy.Name}
                              </Text>
                            </View>
                          ) : null}
                        </TouchableOpacity>
                      ) : item.datas.ProductType == 'Services' ? (
                        <TouchableOpacity
                          style={{flexDirection: 'column', padding: 10}}
                          onPress={() => {
                            item.datas.SubProductType == 'Pabili'
                              ? this.props.navigation.navigate(
                                  'OrderDetailsPabili',
                                  {orders: item.datas},
                                )
                              : item.datas.ProductType == 'Services'
                              ? this.props.navigation.navigate(
                                  'OrderDetailsService',
                                  {orders: item.datas},
                                )
                              : item.datas.ProductType == 'Rentals'
                              ? this.props.navigation.navigate(
                                  'OrderDetailsRentals',
                                  {orders: item.datas},
                                )
                              : item.datas.ProductType == 'Hotels'
                              ? this.props.navigation.navigate(
                                  'OrderDetailsHotels',
                                  {orders: item.datas},
                                )
                              : item.datas.ProductType == 'Transport'
                              ? this.props.navigation.navigate(
                                  'OrderDetailsTranspo',
                                  {orders: item.datas},
                                )
                              : this.props.navigation.navigate('OrderDetails', {
                                  orders: item.datas,
                                });
                          }}>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'flex-start',
                              alignItems: 'flex-start',
                              width: SCREEN_WIDTH - 50,
                              paddingLeft: 10,
                            }}>
                            <FontAwesome5
                              name={'tools'}
                              style={{marginRight: 10}}
                              size={14}
                              color={'tomato'}
                            />
                            <Text note style={{color: 'black', fontSize: 14}}>
                              Service: {item.datas.name}
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'flex-start',
                              alignItems: 'flex-start',
                              width: SCREEN_WIDTH - 50,
                              paddingLeft: 10,
                            }}>
                            <MaterialIcons
                              name={'admin-panel-settings'}
                              size={14}
                              style={{marginRight: 10}}
                              color={'tomato'}
                            />
                            <Text note style={{color: 'black', fontSize: 14}}>
                              Provider: {item.datas.RentStoreName}{' '}
                            </Text>
                          </View>

                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'flex-start',
                              alignItems: 'flex-start',
                              width: SCREEN_WIDTH - 50,
                              paddingLeft: 10,
                            }}>
                            <MaterialCommunityIcons
                              name={'calendar-today'}
                              size={14}
                              style={{marginRight: 10}}
                              color={'tomato'}
                            />
                            <Text note style={{color: 'black', fontSize: 14}}>
                              Booking Date:{' '}
                              {moment(item.datas.startDate * 1000).format(
                                'MMM D, YYYY hh:mm a',
                              )}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ) : item.datas.ProductType == 'Hotels' ||
                        item.datas.ProductType == 'Rentals' ? (
                        <TouchableOpacity
                          style={{flexDirection: 'column', padding: 10}}
                          onPress={() => {
                            item.datas.SubProductType == 'Pabili'
                              ? this.props.navigation.navigate(
                                  'OrderDetailsPabili',
                                  {orders: item.datas},
                                )
                              : item.datas.ProductType == 'Services'
                              ? this.props.navigation.navigate(
                                  'OrderDetailsService',
                                  {orders: item.datas},
                                )
                              : item.datas.ProductType == 'Rentals'
                              ? this.props.navigation.navigate(
                                  'OrderDetailsRentals',
                                  {orders: item.datas},
                                )
                              : item.datas.ProductType == 'Hotels'
                              ? this.props.navigation.navigate(
                                  'OrderDetailsHotels',
                                  {orders: item.datas},
                                )
                              : item.datas.ProductType == 'Transport'
                              ? this.props.navigation.navigate(
                                  'OrderDetailsTranspo',
                                  {orders: item.datas},
                                )
                              : this.props.navigation.navigate('OrderDetails', {
                                  orders: item.datas,
                                });
                          }}>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'flex-start',
                              alignItems: 'flex-start',
                              width: SCREEN_WIDTH - 50,
                              paddingLeft: 10,
                            }}>
                            {item.datas.ProductType == 'Rentals' ? (
                              <MaterialIcons
                                name={'car-rental'}
                                size={14}
                                style={{marginRight: 10}}
                                color={'tomato'}
                              />
                            ) : (
                              <MaterialCommunityIcons
                                name={'bed-queen'}
                                style={{marginRight: 10}}
                                color={'tomato'}
                              />
                            )}

                            <Text note style={{color: 'black', fontSize: 14}}>
                              {item.datas.ProductType == 'Rentals'
                                ? 'Rent'
                                : 'Room'}
                              : {item.datas.name}
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'flex-start',
                              alignItems: 'flex-start',
                              width: SCREEN_WIDTH - 50,
                              paddingLeft: 10,
                            }}>
                            <MaterialIcons
                              name={'admin-panel-settings'}
                              size={14}
                              style={{marginRight: 10}}
                              color={'tomato'}
                            />
                            <Text note style={{color: 'black', fontSize: 14}}>
                              Provider: {item.datas.RentStoreName}
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'flex-start',
                              alignItems: 'flex-start',
                              width: SCREEN_WIDTH - 50,
                              paddingLeft: 10,
                            }}>
                            <MaterialIcons
                              name={'groups'}
                              size={14}
                              style={{marginRight: 10}}
                              color={'tomato'}
                            />
                            <Text note style={{color: 'black', fontSize: 14}}>
                              {item.datas.ProductType == 'Rentals'
                                ? 'Person'
                                : 'Guest'}
                              : {item.datas.passenger}
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'flex-start',
                              alignItems: 'flex-start',
                              width: SCREEN_WIDTH - 50,
                              paddingLeft: 10,
                            }}>
                            <MaterialCommunityIcons
                              name={'calendar-week-begin'}
                              size={14}
                              style={{marginRight: 10}}
                              color={'tomato'}
                            />
                            <Text note style={{color: 'black', fontSize: 14}}>
                              Check in:{' '}
                              {item.datas.SelectedPricing == 'Day'
                                ? moment(item.datas.startDate * 1000).format(
                                    'MMM D, YYYY',
                                  )
                                : moment(item.datas.startDate * 1000).format(
                                    'MMM D, YYYY hh:mm a',
                                  )}
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'flex-start',
                              alignItems: 'flex-start',
                              width: SCREEN_WIDTH - 50,
                              paddingLeft: 10,
                            }}>
                            <MaterialCommunityIcons
                              name={'calendar-weekend'}
                              size={14}
                              style={{marginRight: 10}}
                              color={'tomato'}
                            />
                            <Text note style={{color: 'black', fontSize: 14}}>
                              Check out:{' '}
                              {item.datas.SelectedPricing == 'Weekly'
                                ? moment(item.datas.startDate * 1000)
                                    .add(
                                      7 * parseInt(item.datas.Duration),
                                      'days',
                                    )
                                    .format('MMM D, YYYY hh:mm a')
                                : item.datas.SelectedPricing == 'Monthly'
                                ? moment(item.datas.startDate * 1000)
                                    .add(
                                      30 * parseInt(item.datas.Duration),
                                      'days',
                                    )
                                    .format('MMM D, YYYY hh:mm a')
                                : item.datas.SelectedPricing == 'Day'
                                ? moment(item.datas.Dateend * 1000).format(
                                    'MMM D, YYYY',
                                  )
                                : moment(item.datas.Dateend * 1000).format(
                                    'MMM D, YYYY hh:mm a',
                                  )}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ) : item.datas.ProductType == 'Foods' ? (
                        item.datas.Products == undefined ? null : item.datas
                            .Products.length > 1 ? (
                          <TouchableOpacity
                            style={{flexDirection: 'column'}}
                            onPress={() => {
                              item.datas.SubProductType == 'Pabili'
                                ? this.props.navigation.navigate(
                                    'OrderDetailsPabili',
                                    {orders: item.datas},
                                  )
                                : item.datas.ProductType == 'Services'
                                ? this.props.navigation.navigate(
                                    'OrderDetailsService',
                                    {orders: item.datas},
                                  )
                                : item.datas.ProductType == 'Rentals'
                                ? this.props.navigation.navigate(
                                    'OrderDetailsRentals',
                                    {orders: item.datas},
                                  )
                                : item.datas.ProductType == 'Hotels'
                                ? this.props.navigation.navigate(
                                    'OrderDetailsHotels',
                                    {orders: item.datas},
                                  )
                                : item.datas.ProductType == 'Transport'
                                ? this.props.navigation.navigate(
                                    'OrderDetailsTranspo',
                                    {orders: item.datas},
                                  )
                                : this.props.navigation.navigate(
                                    'OrderDetails',
                                    {orders: item.datas},
                                  );
                            }}>
                            {item.datas.OrderStatus == 'Processing' ? (
                              <View
                                style={{
                                  flexDirection: 'row',
                                  justifyContent: 'flex-start',
                                  alignItems: 'flex-start',
                                  width: SCREEN_WIDTH - 50,
                                  paddingLeft: 10,
                                }}>
                                <MaterialIcons
                                  name={'admin-panel-settings'}
                                  size={14}
                                  style={{marginRight: 10}}
                                  color={'tomato'}
                                />
                                <Text
                                  note
                                  style={{color: 'black', fontSize: 14}}>
                                  Accepted By:{' '}
                                  {item.datas.DeliveredBy.ownerRider == false
                                    ? item.datas.DeliveredBy.selectedDeliveryApp
                                    : item.datas.AdminName}
                                </Text>
                              </View>
                            ) : null}
                            {item.datas.OrderStatus == 'Processing' ? (
                              <View
                                style={{
                                  flexDirection: 'row',
                                  justifyContent: 'flex-start',
                                  alignItems: 'flex-start',
                                  width: SCREEN_WIDTH - 50,
                                  paddingLeft: 10,
                                }}>
                                <MaterialCommunityIcons
                                  name={'racing-helmet'}
                                  size={14}
                                  style={{marginRight: 10}}
                                  color={'tomato'}
                                />
                                <Text
                                  note
                                  style={{color: 'black', fontSize: 14}}>
                                  Rider: {item.datas.DeliveredBy.Name}
                                </Text>
                              </View>
                            ) : null}

                            {item.datas.Products.map((items, index) => (
                              <Card
                                
                                style={{
                                  flexDirection: 'row',
                                  width: SCREEN_WIDTH,
                                  padding:10
                                }}>
                                {items.sale_price ? (
                                  <Box
                                    style={{
                                      flexDirection: 'row',
                                      width: SCREEN_WIDTH,
                                    }}>
                                    <Image
                                      square
                                      style={{width: 40, height: 40}}
                                      source={{uri: items.featured_image}}
                                    />
                                    <Box style={{paddingLeft: 5, width: SCREEN_WIDTH/1.5,}}>
                                      <Text
                                        style={{
                                          fontSize: 14,
                                          fontWeight: 'bold',
                                        }}>
                                        {items.qty > 1
                                          ? items.qty + ' x '
                                          : null}
                                        {items.name}
                                      </Text>
                                      <Text note style={{fontSize: 14}}>
                                        Brand: {items.brand}
                                      </Text>
                                      <Text note style={{fontSize: 14}}>
                                        by {items.store_name}
                                      </Text>
                                      <Text note style={{fontSize: 14}}>
                                        Note: {items.note}
                                      </Text>
                                    </Box>
                                    <Box style={{textAlign: 'right'}}>
                                      <Text
                                        style={{
                                          fontSize: 14,
                                          fontWeight: 'bold',
                                          marginBottom: 10,
                                        }}>
                                        {item.datas.currency}
                                        {Math.round(
                                          items.sale_price * items.qty * 10,
                                        ) / 10}
                                      </Text>
                                    </Box>
                                  </Box>
                                ) : (
                                  <Box
                                    style={{
                                      flexDirection: 'row',
                                      width: SCREEN_WIDTH,
                                      padding:10
                                    }}>
                                    <Image
                                      square
                                      style={{width: 40, height: 40}}
                                      source={{uri: items.featured_image}}
                                    />
                                    <Box style={{paddingLeft: 5, width: SCREEN_WIDTH/1.5,}}>
                                      <Text
                                        style={{
                                          fontSize: 14,
                                          fontWeight: 'bold',
                                        }}>
                                        {items.qty > 1
                                          ? items.qty + ' x '
                                          : null}
                                        {items.name}
                                      </Text>

                                      <Text note style={{fontSize: 14}}>
                                        Brand: {items.brand}
                                      </Text>
                                      <Text note style={{fontSize: 14}}>
                                        by {items.store_name}
                                      </Text>
                                      <Text note style={{fontSize: 14}}>
                                        Note: {items.note}
                                      </Text>
                                      {items.choice &&
                                      items.choice.length > 1 ? (
                                        <Text
                                          note
                                          style={{
                                            fontSize: 14,
                                            fontWeight: 'bold',
                                          }}>
                                          Add ons
                                        </Text>
                                      ) : null}
                                      {items.choice && items.choice.length > 1
                                        ? items.choice.map((drink, i) =>
                                            drink.isChecked ==
                                            'unchecked' ? null : (
                                              <View
                                                style={{
                                                  marginLeft: 20,
                                                  flexDirection: 'row',
                                                  width: SCREEN_WIDTH / 1.5,
                                                }}>
                                                <View
                                                  style={{
                                                    justifyContent:
                                                      'flex-start',
                                                  }}>
                                                  <Text
                                                    style={{
                                                      fontWeight: 'bold',
                                                      fontSize: 20,
                                                    }}>
                                                    {'\u2022' + ' '}
                                                  </Text>
                                                </View>
                                                <View
                                                  style={{
                                                    justifyContent:
                                                      'flex-start',
                                                    flex: 5,
                                                    flexDirection: 'row',
                                                    marginTop: 5,
                                                  }}>
                                                  <Text style={{fontSize: 12}}>
                                                    {items.qty}x{' '}
                                                  </Text>
                                                  <Text style={{fontSize: 12}}>
                                                    {drink.label}
                                                  </Text>
                                                </View>
                                                <View
                                                  style={{
                                                    justifyContent: 'flex-end',
                                                    flex: 1,
                                                  }}>
                                                  <Text
                                                    style={{
                                                      fontSize: 12,
                                                      fontWeight: 'bold',
                                                    }}>
                                                    {item.datas.currency}
                                                    {drink.price * items.qty}
                                                  </Text>
                                                </View>
                                              </View>
                                            ),
                                          )
                                        : null}
                                    </Box>
                                    <Box style={{textAlign: 'right'}}>
                                      <Text
                                        style={{
                                          fontSize: 14,
                                          fontWeight: 'bold',
                                          marginBottom: 10,
                                        }}>
                                        {item.datas.currency}
                                        {Math.round(
                                          items.price * items.qty * 10,
                                        ) / 10}
                                      </Text>
                                    </Box>
                                  </Box>
                                )}
                              </Card>
                            ))}
                          </TouchableOpacity>
                        ) : null
                      ) : null}
                    </CollapseBody>
                  </Collapse>
                </Card>
              </View>
            )}
          />
        ) : (
          <View style={styles.container}>
            <Text style={{paddingVertical: 10}}>No orders yet</Text>
          </View>
        )}
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
