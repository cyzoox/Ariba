/**
 * This is the Product component
 **/

// React native and others libraries imports
import React, {Component} from 'react';
import {
  AsyncStorage,
  Dimensions,
  TouchableHighlight,
  Image,
} from 'react-native';
import {
  View,
  Col,
  Card,
  CardItem,
  Body,
  Button,
  Left,
  ListItem,
  List,
  Content,
  Thumbnail,
  Right,
  Text,
  Grid,
  Icon,
} from 'native-base';
import moment from 'moment';
import FastImage from 'react-native-fast-image';
import AntDesign from 'react-native-vector-icons/AntDesign';
import styles from './styles';
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
    console.log(' slat StoreCard', this.props.product.slongitude);
    const status = this.props.product.status;
    let Closing = false;

    if (this.props.product.startDate != undefined) {
      console.log(
        'this.props.product.startDate.seconds: ',
        moment(this.props.product.startDate.seconds * 1000).format('H:mm:ss'),
      );
      console.log(
        'this.props.product.endDate.seconds: ',
        moment(this.props.product.endDate.seconds * 1000).format('H:mm:ss'),
      );
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
      console.log(
        'res: ',
        (valid = startDate < currentDate && endDate > currentDate),
      );
    }
    console.log('alwaysOpen: ', this.props.product.AlwaysOpen);
    return (
      <Card
        style={{
          flex: 1,
          marginHorizontal: 10,
          borderRadius: 10,
          backgroundColor: '#6ccddc',
        }}>
        {this.props.product.withAddons == true ? (
          <TouchableHighlight
            underlayColor="rgba(73,182,77,1,0.9)"
            onPress={
              status && !this.props.product.AlwaysOpen && Closing == true
                ? () =>
                    this.props.navigation.navigate('Fastfood', {
                      store: this.props.product,
                      slongitude: this.props.product.slongitude,
                      slatitude: this.props.product.slatitude,
                      navigation: this.props.navigation,
                      name: this.props.product.name,
                    })
                : this.props.product.AlwaysOpen
                ? () =>
                    this.props.navigation.navigate('Fastfood', {
                      store: this.props.product,
                      slongitude: this.props.product.slongitude,
                      slatitude: this.props.product.slatitude,
                      navigation: this.props.navigation,
                      name: this.props.product.name,
                    })
                : null
            }>
            <View>
              <FastImage
                style={[
                  styles.categoriesPhoto,
                  {borderTopLeftRadius: 10, borderTopRightRadius: 10},
                ]}
                source={{
                  uri: this.props.product.foreground,
                  headers: {Authorization: 'someAuthToken'},
                  priority: FastImage.priority.normal,
                }}
                resizeMode={FastImage.resizeMode.cover}
              />
              {status &&
              !this.props.product.AlwaysOpen &&
              Closing == true ? null : this.props.product.AlwaysOpen ? null : (
                <View style={styles.subtitleclose}>
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontStyle: 'italic',
                      fontWeight: 'bold',
                    }}>
                    Store unavailable
                  </Text>
                </View>
              )}

              <Text style={[styles.categoriesName, {color: '#274a6e'}]}>
                {this.props.product.name}{' '}
              </Text>
            </View>
          </TouchableHighlight>
        ) : (
          <TouchableHighlight
            underlayColor="rgba(73,182,77,1,0.9)"
            onPress={
              status && !this.props.product.AlwaysOpen && Closing == true
                ? () =>
                    this.props.navigation.navigate('Products', {
                      store: this.props.product,
                      slongitude: this.props.product.slongitude,
                      slatitude: this.props.product.slatitude,
                      navigation: this.props.navigation,
                      name: this.props.product.name,
                    })
                : this.props.product.AlwaysOpen
                ? () =>
                    this.props.navigation.navigate('Products', {
                      store: this.props.product,
                      slongitude: this.props.product.slongitude,
                      slatitude: this.props.product.slatitude,
                      navigation: this.props.navigation,
                      name: this.props.product.name,
                    })
                : null
            }>
            <View>
              <FastImage
                style={styles.categoriesPhoto}
                source={{
                  uri: this.props.product.foreground,
                  headers: {Authorization: 'someAuthToken'},
                  priority: FastImage.priority.normal,
                }}
                resizeMode={FastImage.resizeMode.cover}
              />
              {!this.props.product.status ||
              (!this.props.product.AlwaysOpen && !Closing) ? (
                <View style={styles.subtitleclose}>
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontStyle: 'italic',
                      fontWeight: 'bold',
                    }}>
                    Store unavailable
                  </Text>
                </View>
              ) : null}

              <Text style={[styles.categoriesName, {color: '#274a6e'}]}>
                {this.props.product.name}{' '}
              </Text>
            </View>
          </TouchableHighlight>
        )}
      </Card>
    );
  }
}
