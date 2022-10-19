import React, {Component} from 'react';
import {View, Image, Dimensions, SafeAreaView, ScrollView, Text} from 'react-native';
import {
  Box,
  Button,
  HStack,
  StatusBar,
} from 'native-base';
import CartBadge from '../components/CartBadge';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

class CustomHeader extends Component {
  render() {
    let {title, isHome, Cartoff} = this.props;
    return (
      <View>
      <StatusBar bg="#ee4e4e" barStyle="light-content" />
      <Box safeAreaTop bg="#ee4e4e" />
      <HStack bg="#ee4e4e" px="1" py="3" justifyContent="space-between" alignItems="center" w="100%">
        <HStack alignItems="center">
        <Button bg="#ee4e4e"  onPress={() => this.props.navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={25} color="white" />
          </Button>
          <Text style={{color:'white', fontSize:20, fontWeight:'bold'}}>
            ARIBA
          </Text>
        </HStack>
        <HStack>
        {!Cartoff ? (
            <CartBadge
              navigation={this.props.navigation}
              fromPlace={this.props.fromPlace}
              currency={this.props.currency}
            />
          ) : null}
        </HStack>
      </HStack>
      </View>
    );
  }
}

export default CustomHeader;
