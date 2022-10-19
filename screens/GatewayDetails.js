import React, {Component} from 'react';
import {
  AppState,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Platform,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  FlatList,
  PermissionsAndroid,
} from 'react-native';
import {
  Button,
  StatusBar,
  Box,
  HStack
} from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {WebView} from 'react-native-webview';

export default class GatewayDetails extends Component {
  constructor() {
    super();
    this.state = {
      appState: AppState.currentState,
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
  }

  componentWillUnmount() {
    this.appStateSubscription.remove();
  }

  render() {
    return (
      <Box style={{flex: 1, backgroundColor: '#fdfdfd'}}>
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
        </HStack>
      </HStack>
      </View>

        <WebView source={{uri: this.props.route.params.url}} />
      </Box>
    );
  }
}
