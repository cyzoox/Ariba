import React, {Component} from 'react';
import {
  AppState,
  StyleSheet,
  Text,
  View,
  FlatList,
  Dimensions,
  Alert,
} from 'react-native';
import {
  Stack,
  Button,
  HStack,
  StatusBar,
  Box,
  Image,
  useToast ,
} from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Card, } from 'react-native-paper';
import ConfettiCannon from 'react-native-confetti-cannon';
import {TouchableOpacity} from 'react-native-gesture-handler';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
export default class VoucherScreen extends Component {
  constructor() {
    super();
    this.ref = firestore();
    this.unsubscribe = null;
    this.state = {
      appState: AppState.currentState,
      //defalt false and if true cannon will be fired
      shoot: false,
      dataSource: [],
      vouchers: [],
    };
  }

  onCollectionUpdate = querySnapshot => {
    const vouchers = [];
    querySnapshot.forEach(doc => {
      vouchers.push({
        datas: doc.data(),
        key: doc.id,
      });
    });
    this.setState({
      dataSource: vouchers,
    });
  };

  async component() {
    let userId = await AsyncStorage.getItem('uid');
    /* Listen to realtime cart changes */
    this.unsubscribeCartItems = firestore()
      .collection('user_vouchers')
      .doc(userId)
      .onSnapshot(snapshotCart => {
        if (snapshotCart.data()) {
          this.setState({vouchers: snapshotCart.data(), loading: false});
        } else {
          this.setState({vouchers: [], loading: false});
        }
      });
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
    this.setState({loading: true});
    //Time out to fire the cannon
    this.unsubscribe = this.ref
      .collection('vouchers')
      .onSnapshot(this.onCollectionUpdate);

    this.component();
  }
  componentWillUnmount() {
    this.appStateSubscription.remove();
  }

  async onClaimVoucher(data) {

    const {vouchers} = this.state;
    let userId = await AsyncStorage.getItem('uid');
    if (userId) {
      let is_existing =
        Object.keys(vouchers).length &&
        Object.values(vouchers).find(
          item => data.id === item.id,
        ); /* Check if item already exists in cart from state */
      if (!is_existing) {
        let newItem = {
          id: data.id,
          store_name: data.store_name,
          store_id: data.store_id,
          minimum: data.minimum,
          validity: data.validity,
          store_image: data.store_image,
          amount: data.amount,
          status: 'available',
        };
        let userId = await AsyncStorage.getItem('uid');
        let updatedData = Object.values(vouchers); /* Clone it first */
        let voucherRef = firestore().collection('user_vouchers');

        /* Push new cart item */
        updatedData.push(newItem);

        /* Set updated cart in firebase, no need to use setState because we already have a realtime cart listener in the componentDidMount() */
        voucherRef
          .doc(userId)
          .set(Object.assign({}, updatedData))
          .then(() => {
          
          
            this.setState({shoot: true});
          });
      } else {
        Alert.alert('Voucher already claimed.')
      }
    } else {
      this.props.navigation.navigate('Auth');
    }
  }

  render() {
    return (
      <Box>
        <View>
        <View>
      <StatusBar bg="#ee4e4e" barStyle="light-content" />
      <Box safeAreaTop bg="#ee4e4e" />
      <HStack bg="#ee4e4e" px="1" py="3" justifyContent="space-between" alignItems="center" w="100%">
        <HStack alignItems="center">
        <Button bg="#ee4e4e"  onPress={() => this.props.navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={25} color="white" />
          </Button>
          <Text style={{color:'white', fontSize:20, fontWeight:'bold'}}>
          Claim Voucher
          </Text>
        </HStack>
        <HStack>
        </HStack>
      </HStack>
      </View>
          {this.state.dataSource.length > 0 ? (
            <FlatList
              data={this.state.dataSource}
              renderItem={({item}) => (
                <Card transparent>
                  {item.datas.isAvailable ? (
                    <HStack style={{borderWidth: 0.1, marginHorizontal: 10}} px="1" py="3" justifyContent="space-between" alignItems="center">
                      <View style={{flexDirection: 'column', paddingRight: 10, width:SCREEN_WIDTH/4}}>
                        <Image
                        style={{alignSelf:'center'}}
                         size={60} 
                         borderRadius={100} 
                          source={{uri: item.datas.store_image}}
                          
                        />
                        <Text style={{fontSize: 10, textAlign: 'center'}}>
                          {item.datas.store_name}
                        </Text>
                      </View>
                      <Stack style={{marginLeft:-SCREEN_WIDTH/3, paddingTop: 10}}>
                        <Text style={{fontSize: 14, fontWeight: 'bold'}}>
                          ₱{item.datas.amount} off
                        </Text>
                        <Text note style={{color: 'salmon', fontSize: 12}}>
                          Min. Spend {item.datas.minimum}
                        </Text>
                      </Stack>
                      <HStack
                        style={{
                          justifyContent: 'flex-end',
                          alignContent: 'flex-end',
                          right:10
                        }}>
                        <TouchableOpacity
                          onPress={() => this.onClaimVoucher(item.datas)}>
                          <Text
                            style={{
                              color: 'salmon',
                              fontWeight: 'bold',
                              fontStyle: 'italic',
                            }}>
                            Claim
                          </Text>
                        </TouchableOpacity>
                      </HStack>
                    </HStack>
                  ) : null}
                </Card>
              )}
              keyExtractor={item => item.key}
            />
          ) : (
            <Text style={{textAlign: 'center', paddingTop: 100}}>
              No available voucher.
            </Text>
          )}
        </View>
      </Box>
    );
  }
}

const styles = StyleSheet.create({
  Box: {
    flex: 1,
  },
  cardLayoutView: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff9c4',
  },
  paragraphHeading: {
    margin: 24,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'green',
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    textAlign: 'center',
  },
  logo: {
    height: 130,
    width: 130,
    marginBottom: 20,
  },
});
