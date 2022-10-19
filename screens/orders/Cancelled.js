import React, {Component} from 'react';
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  BackHandler,
  Alert,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import {
  Box,
  Text,
  View,
  Stack,
  HStack
} from 'native-base';
import {Card} from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from '../../components/Loader';
import CustomHeader from '../Header';
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export default class Cancelled extends Component {
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
    };
  }

  componentDidMount() {
    this.StartImageRotationFunction();
  }

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
    return (
      <Box style={{flex: 1}}>
        <Loader loading={this.state.loading} trans={trans} />
        <ScrollView>
          <FlatList
            data={this.props.orders.filter((item)=> {return item.datas.OrderStatus == 'Cancelled'})}
            renderItem={({item}) => (
              <View style={{marginBottom:10,}}>
                <Card style={{padding:10}}>
                  <HStack
                  justifyContent="space-between" alignItems="center"
                      >
                     <Stack style={{paddingLeft: 10, width: SCREEN_WIDTH/1.3}}>
                      <TouchableOpacity onPress={() => {
                        item.datas.SubProductType == 'Pabili'
                          ? this.props.navigation.navigate(
                              'OrderDetailsPabili',
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
                      }} >
                        <Text style={{fontSize: 14, fontWeight: '900'}}>
                          Transaction Number: #00{item.datas.OrderNo}
                        </Text>
                        <Text note style={{color: 'black', fontSize: 12}}>
                          {item.datas.OrderDetails.Date_Ordered}
                        </Text>
                        <Text note style={{color: 'black', fontSize: 12}}>
                          {item.datas.SubProductType == 'Pabili'
                            ? 'Book a Rider'
                            : item.datas.ProductType == 'Foods'
                            ? 'Delivery'
                            : item.datas.ProductType == 'Transport'
                            ? 'Ride'
                            : item.datas.ProductType}
                        </Text>
                        <View style={{flexDirection: 'row'}}>
                          <Ionicons
                            name={'ios-location-sharp'}
                            style={{marginRight: 10}}
                            color={'green'}
                          />
                          <Text note style={{color: 'black', fontSize: 12}}>
                            {item.datas.Billing.address}
                          </Text>
                        </View>
                        {item.datas.SubProductType == 'Pabili' ? (
                          <View style={{flexDirection: 'row'}}>
                            <Ionicons
                              name={'ios-location-sharp'}
                              style={{marginRight: 10}}
                              color={'tomato'}
                            />
                            <Text note style={{color: 'black', fontSize: 12}}>
                              {item.datas.billing_streetTo}
                            </Text>
                          </View>
                        ) : item.datas.ProductType == 'Foods' ||
                          item.datas.ProductType == 'Hotels' ||
                          item.datas.ProductType == 'Rentals' ? null : (
                          <View style={{flexDirection: 'row'}}>
                            <Ionicons
                              name={'ios-location-sharp'}
                              style={{marginRight: 10}}
                              color={'tomato'}
                            />
                            <Text note style={{color: 'black', fontSize: 12}}>
                              {item.datas.billing_streetTo}
                            </Text>
                          </View>
                        )}
                        </TouchableOpacity>
                      </Stack>
                      <Box>
                      <TouchableOpacity onPress={() => {
                        item.datas.SubProductType == 'Pabili'
                          ? this.props.navigation.navigate(
                              'OrderDetailsPabili',
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
                        <Text style={{color: 'salmon', fontStyle: 'italic'}}>
                          View
                        </Text>
                        </TouchableOpacity>
                      </Box>
                    </HStack>
                  </Card>
              </View>
            )}
          />
        </ScrollView>
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
