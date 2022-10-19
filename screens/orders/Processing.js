import React, {Component} from 'react';
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  BackHandler,
  Alert,
  ScrollView,
  Animated,
} from 'react-native';
import {
  Container,
  Header,
  Icon,
  Accordion,
  Text,
  View,
  Card,
  CardItem,
  Thumbnail,
  Body,
  Left,
  Right,
  Button,
  List,
  ListItem,
} from 'native-base';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from '../../components/Loader';
import CustomHeader from '../Header';

export default class Processing extends Component {
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
      dataSource: this.props.orders,
      uid: this.props.uid,
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
    console.log(
      'datas Processing: ',
      this.props.orders.filter(item => {
        const itemData = item.datas.OrderStatus;
        const textData = 'Processing' || 'On the way';

        return itemData.indexOf(textData) > -1;
      }),
    );
    const newOrders = this.props.orders.filter(item => {
      const itemData = item.datas.OrderStatus;
      const textData = 'On the way';
      const textDataProcessing = 'Processing';

      return itemData === 'Processing'
        ? itemData.indexOf(textDataProcessing) > -1
        : itemData.indexOf(textData) > -1;
    });
    return (
      <Container style={{flex: 1}}>
        <Loader loading={this.state.loading} trans={trans} />
        <ScrollView>
          <FlatList
            data={newOrders}
            renderItem={({item}) => (
              <View>
                {item.datas.OrderStatus == 'Processing' ||
                item.datas.OrderStatus == 'On the way' ? (
                  <Card>
                    {console.log('pros: ', item.datas)}
                    <CardItem
                      button
                      onPress={() => {
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
                      <Body style={{paddingLeft: 10, flex: 3}}>
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
                      </Body>
                      <Right>
                        <Text style={{color: 'salmon', fontStyle: 'italic'}}>
                          View
                        </Text>
                      </Right>
                    </CardItem>
                  </Card>
                ) : null}
              </View>
            )}
          />
        </ScrollView>
      </Container>
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
