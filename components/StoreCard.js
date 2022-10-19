/**
 * This is the Product component
 **/

// React native and others libraries imports
import React, {Component} from 'react';
import {
  Dimensions,
  TouchableHighlight,
  View,Text
} from 'react-native';
import {
  Box
} from 'native-base';
import moment from 'moment';
import FastImage from 'react-native-fast-image';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import styles from './styles';
const SCREEN_WIDTH = Dimensions.get('window').width;
// Our custom files and classes import

// screen sizing

export default class StoreCard extends Component {
  state = {
    visibleModal: false,
    quantity: 1,
    products: {},
    cartItems: {},
    loading: false,
  };

  render() {
    //  console.log('StoreCard',this.props.product)
    const status = this.props.product.status;
    let Closing = false;

    if (this.props.product.startDate != undefined) {
      // console.log('this.props.product.startDate.seconds: ', moment(this.props.product.startDate.seconds*1000).format('H:mm:ss'))
      //   console.log('this.props.product.endDate.seconds: ', moment(this.props.product.endDate.seconds*1000).format('H:mm:ss'))
      var startTime = moment(
        this.props.product.startDate.seconds * 1000,
      ).format('H:mm:ss');
      var endTime = moment(this.props.product.endDate.seconds * 1000).format(
        'H:mm:ss',
      );

      currentDate = new Date();

      startDate = new Date(currentDate.getTime());
      startDate.setHours(startTime.split(':')[0]);
      startDate.setMinutes(startTime.split(':')[1]);
      startDate.setSeconds(startTime.split(':')[2]);

      endDate = new Date(currentDate.getTime());
      endDate.setHours(endTime.split(':')[0]);
      endDate.setMinutes(endTime.split(':')[1]);
      endDate.setSeconds(endTime.split(':')[2]);

      Closing = valid = startDate < currentDate && endDate > currentDate;
      //console.log('res: ', valid = startDate < currentDate && endDate > currentDate)
    }
    //console.log('wallet: ', this.props.product.wallet  )
    return this.props.product.status == false ? null : (
      <Box
        style={{
          flex: 1,
          marginHorizontal: 10,
          flexDirection: 'row',
          backgroundColor: '#313131',
        }}>
        <TouchableHighlight
          underlayColor="rgba(73,182,77,1,0.8)"
          onPress={
            this.props.product.wallet < 1
              ? null
              : status && !this.props.product.AlwaysOpen && Closing == true
              ? () =>
                  this.props.navigation.navigate('Fastfood', {
                    store: this.props.product,
                    slongitude: this.props.product.slongitude,
                    slatitude: this.props.product.slatitude,
                    navigation: this.props.navigation,
                    name: this.props.product.name,
                    fromPlace: this.props.fromPlace,
                    currency:
                      this.props.currency == undefined
                        ? ''
                        : this.props.currency,
                  })
              : this.props.product.AlwaysOpen
              ? () =>
                  this.props.navigation.navigate('Fastfood', {
                    store: this.props.product,
                    slongitude: this.props.product.slongitude,
                    slatitude: this.props.product.slatitude,
                    navigation: this.props.navigation,
                    name: this.props.product.name,
                    currency:
                      this.props.currency == undefined
                        ? ''
                        : this.props.currency,
                    fromPlace: this.props.fromPlace,
                  })
              : null
          }>
          <FastImage
            style={{width: SCREEN_WIDTH - 30, height: 100}}
            source={{
              uri: this.props.product.foreground,
              headers: {Authorization: 'someAuthToken'},
              priority: FastImage.priority.normal,
            }}
            resizeMode={FastImage.resizeMode.cover}>
            {this.props.product.wallet < 1 ? (
              <View style={styles.subtitleclose}>
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontStyle: 'italic',
                    fontWeight: 'bold',
                  }}>
                  Unavailable
                </Text>
              </View>
            ) : status && !this.props.product.AlwaysOpen && Closing == false ? (
              <View style={styles.subtitleclose}>
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontStyle: 'italic',
                    fontWeight: 'bold',
                  }}>
                  Opens At{' '}
                  {moment(this.props.product.startDate.seconds * 1000).format(
                    'h:mm a',
                  )}{' '}
                  -{' '}
                  {moment(this.props.product.endDate.seconds * 1000).format(
                    'h:mm a',
                  )}
                </Text>
              </View>
            ) : status &&
              !this.props.product.AlwaysOpen &&
              Closing == true ? null : this.props.product.AlwaysOpen ? null : (
              <View style={styles.subtitleclose}>
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontStyle: 'italic',
                    fontWeight: 'bold',
                  }}>
                  Currently Unavailable
                </Text>
              </View>
            )}

            <View
              style={{
                position: 'absolute',
                right: 0,
                backgroundColor: 'rgba(49,49,49, 0.8)',
                height: 100,
                padding: 10,
                width: SCREEN_WIDTH / 2.5,
              }}>
              <Text
                numberOfLines={2}
                style={[
                  styles.categoriesName,
                  {
                    color: 'white',
                    fontSize: 15,
                    paddingLeft: 2,
                    fontWeight: 'normal',
                    textAlign: 'center',
                  },
                ]}>
                {this.props.product.name}{' '}
              </Text>
              <Text
                note
                numberOfLines={2}
                style={[
                  styles.categoriesName,
                  {
                    color: 'white',
                    fontSize: 10.5,
                    fontWeight: 'normal',
                    textAlign: 'center',
                  },
                ]}>
                {this.props.product.address}
              </Text>

              {this.props.product.NumberofDeliveries == 0 ? (
                <View
                  style={{
                    flexDirection: 'row',
                    bottom: 5,
                    position: 'absolute',
                    left: 5,
                  }}>
                  <MaterialIcons name="star" size={13} color={'#f7d801'} />
                  <Text style={{fontSize: 10.5, color: '#d6d6d6', left: 3}}>
                    0 ({this.props.product.NumberofDeliveries} ratings)
                  </Text>
                </View>
              ) : (
                <View
                  style={{
                    flexDirection: 'row',
                    bottom: 5,
                    position: 'absolute',
                    left: 5,
                  }}>
                  <MaterialIcons name="star" size={13} color={'#f7d801'} />
                  <Text style={{fontSize: 10.5, color: '#d6d6d6', left: 3}}>
                    {1 * this.props.product.star1 +
                      2 * this.props.product.star2 +
                      3 * this.props.product.star3 +
                      4 * this.props.product.star4 +
                      (5 * this.props.product.star5) /
                        this.props.product.NumberofDeliveries}{' '}
                    ({this.props.product.NumberofDeliveries} ratings)
                  </Text>
                </View>
              )}

              {this.props.product.distance == null ? null : (
                <View
                  style={{
                    flexDirection: 'row',
                    bottom: 5,
                    position: 'absolute',
                    right: 5,
                  }}>
                  <MaterialIcons
                    name="location-pin"
                    size={13}
                    color={'#10823c'}
                  />
                  <Text style={{fontSize: 13, color: '#d6d6d6', left: 3}}>
                    {Math.round(this.props.product.distance * 10) / 10 < 1000
                      ? Math.round(this.props.product.distance * 10) / 10 + ' m'
                      : Math.round((this.props.product.distance / 1000) * 10) /
                          10 +
                        ' km'}{' '}
                  </Text>
                </View>
              )}
            </View>
          </FastImage>
        </TouchableHighlight>
      </Box>
    );
  }
}
