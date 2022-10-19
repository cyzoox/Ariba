/**
 * This is the Checkout Page
 **/

// React native and others libraries imports
import React, {Component} from 'react';
import {
  Alert,
  TouchableHighlight,
  BackHandler,
  ScrollView,
  FlatList,
  Animated,
} from 'react-native';
import {
  Container,
  View,
  Grid,
  Col,
  Left,
  Right,
  Button,
  Icon,
  List,
  Thumbnail,
  ListItem,
  Body,
  Radio,
  Input,
  Item,
  Text,
  Toast,
  Root,
  Title,
  Card,
  CardItem,
  Header,
} from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Loader from '../components/Loader';
import CustomHeader from './Header';
import moment from 'moment';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// Our custom files and classes import

export default class wallet extends Component {
  constructor(props) {
    super(props);
    this.Rotatevalue = new Animated.Value(0);
    this.ref = firestore();
    this.state = {
      name: '',
      email: '',
      phone: '',
      gender: ' ',
      date: '',
      DataSource: [],
      wallet: 0,
      isLoading: false,
    };
    this.FetchProfile();
  }

  FetchProfile = async () => {
    const userId = await AsyncStorage.getItem('uid');
    firestore()
      .collection('users')
      .where('userId', '==', userId)
      .onSnapshot(
        querySnapshot => {
          querySnapshot.forEach(doc => {
            const data = doc.data();
            this.setState({
              key: doc.id,
              name: data.Name,
              email: data.Email,
              mobile: data.Mobile,
              address: data.Address,
              username: data.Username,
              wallet: data.wallet,
            });
          });
        },
        error => {
          console.log(error);
        },
      );

    const ref = firestore()
      .collection('UserCommisionHistory')
      .where('userId', '==', userId)
      .onSnapshot(
        querySnapshot => {
          const orders = [];
          querySnapshot.forEach(doc => {
            console.log('doc.data(): ', doc.data());
            orders.push({
              datas: doc.data(),
              key: doc.id,
            });
          });
          this.setState({
            DataSource: orders.sort(
              (a, b) =>
                Number(b.datas.DateCreated) - Number(a.datas.DateCreated),
            ),
            isLoading: false,
          });
        },
        error => {
          this.setState({
            isLoading: false,
          });
          console.log(error);
        },
      );
  };

  updateTextInput = (text, field) => {
    const state = this.state;
    state[field] = text;
    this.setState(state);
  };

  componentDidMount() {
    this.StartImageRotationFunction();
  }

  StartImageRotationFunction() {
    this.Rotatevalue.setValue(0);
    Animated.timing(this.Rotatevalue, {
      toValue: 1,
      duration: 3000,
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
    console.log('DataSource: ', this.state.DataSource);
    return (
      <Root>
        <Container style={{backgroundColor: '#fdfdfd'}}>
          <Header
            androidStatusBarColor="#2c3e50"
            style={{display: 'none'}}
            style={{backgroundColor: 'salmon'}}>
            <Left style={{flex: 1}}>
              <Button
                transparent
                onPress={() => this.props.navigation.goBack()}>
                <MaterialIcons name="arrow-back" size={25} color="white" />
              </Button>
            </Left>
            <Body style={{flex: 3}}>
              <Title style={{color: 'white'}}>
                Wallet Balance:{' '}
                {'₱' +
                  this.state.wallet
                    .toFixed(2)
                    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
              </Title>
            </Body>
          </Header>
          <Loader loading={this.state.isLoading} trans={trans} />

          <Card>
            <FlatList
              keyExtractor={item => item.key}
              data={this.state.DataSource}
              renderItem={({item}) => (
                <CardItem bordered>
                  <Body>
                    <Text style={{fontWeight: 'bold', fontSize: 12}}>
                      {item.key}
                    </Text>
                    <Text style={{fontSize: 12}}>
                      From: {item.datas.account}
                    </Text>
                    <Text style={{fontSize: 12}}>
                      Date:{' '}
                      {moment(item.datas.DateCreated * 1000).format(
                        'MMM D, YYYY hh:mm a',
                      )}
                    </Text>
                  </Body>

                  <Right>
                    <Text style={{fontWeight: 'bold', fontSize: 12}}>
                      {'+₱' +
                        item.datas.customerCommision
                          .toFixed(2)
                          .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                    </Text>
                  </Right>
                </CardItem>
              )}
              enableEmptySections={true}
              style={{marginTop: 10, marginBottom: 50}}
            />
          </Card>
        </Container>
      </Root>
    );
  }

  async updatUserInfo() {
    this.setState({
      isLoading: true,
    });
    const userId = await AsyncStorage.getItem('uid');
    const updateRef = firestore().collection('users').doc(userId);
    updateRef
      .update({
        Name: this.state.name,
        Mobile: this.state.phone,
        Email: this.state.email,
        Gender: this.state.gender,
        Birthdate: this.state.date,
      })
      .then(docRef => {
        this.FetchProfile();
        Alert.alert('Profile successfully updated')
        
      });
  }
}
const styles = {
  invoice: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  line: {
    width: '100%',
    height: 1,
    backgroundColor: '#bdc3c7',
  },
};
