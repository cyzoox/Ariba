import React, { Component } from 'react';
import {StyleSheet, TextInput, TouchableOpacity, Dimensions, Alert, Image, FlatList, SafeAreaView, ScrollView} from 'react-native'
import { Container, View, Left, Right, Button, Icon, Grid, Col, Badge, Card, CardItem, Body,Item, Input,List, ListItem, Thumbnail,Text,Form, Textarea,Toast, Root } from 'native-base';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
// Our custom files and classes import
const SCREEN_WIDTH = Dimensions.get('window').width;
import AccountInfo from './checkout/AccountInfo';
import DeliveryDetails from './checkout/DeliveryDetails';
import { RadioButton, Chip, Divider } from 'react-native-paper';
//import { StackActions, NavigationActions } from 'react-navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from "moment";
import Modal from 'react-native-modal';
import TearLines from "react-native-tear-lines";  
import NumberFormat from 'react-number-format';
import Loader from '../components/Loader';
import CustomHeader from './Header';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import axios  from 'axios';
import Rider_img from '../assets/rider.png';
import customer_img from '../assets/customer.png';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as ImagePicker from "react-native-image-picker"
import {imgDefault} from './images';
import marker from '../assets/icons-marker.png';
import Province  from './Province.json';

export default class CheckoutTransport extends Component {
  constructor(props) {
      super(props);
      this.updateref =  firestore();
      this.updatecounts =  firestore();
      this.updateUserOrders =  firestore();
      this.checkoutref =  firestore();
      this.storeRef  =   firestore(); 
      this.paymentsRef  =   firestore(); 
      this.billingRef  =   firestore();
      this.paymentMethodRef =  firestore();
      this.ordercounters =  firestore();
      this.chargeref =  firestore().collection('charges').where('status', '==', 'on process' );
      const cart = this.props.route.params.cartItems; 
      const datas = this.props.route.params.datas; 
      this.state = {  
     // slatitude:cart[0].slatitude,
      //slongitude:cart[0].slongitude,
     // cartItems: cart,
     VisibleAddInfo: false,
     datas: datas,
     cLong:this.props.route.params.cLong,
     cLat:this.props.route.params.cLat,
      driver_charge: 0,
      xtra: 0,
      labor: 0,
      deliveryCharge: 0,
      pickup: 0,
      stores:[],
      paymentMethod: 'Cash on Delivery (COD)',
      billing_name: '',
      billing_postal: '',
      billing_phone: '',
      billing_street: '',
      billing_country: '',
      billing_province: '',
      billing_city: '',
      billing_barangay: '',
      billing_cluster: '',
      billing_nameTo: '',
      billing_postalTo: '',
      billing_phoneTo: '',
      billing_streetTo: '',
      billing_countryTo: '',
      billing_provinceTo: '',
      billing_cityTo: '',
      billing_barangayTo: '',
      billing_clusterTo: '',
      preffered_delivery_time: '',
      currentDate: new Date(),
      visibleModal: false,
      isVisible: false,
      payments: [],
      methods: [],
      palawan_name: '',
      palawan_number: '',
      bank_number: '',
      bank_name: '',
      gcash_number: '',
      counter: 0,
      account_name: '',
      account_address: '',
      account_city: '',
      account_barangay: '',
      account_province: '',
      account_email: '',
      account_number: '',
      account_cluster: '',
      account_status:'',
      paypal_email:'',
      paypal_uname:'',
      note:'',
      vouchers: [],
      discount: 0,
      voucherArray: [],
      charge: 0,
      xtraCharge: 0,
      voucherCode: '',
      loading: false,
      address_list:[],
      visibleAddressModal: false,
      //subtotal: subtotal,
      minimum: 0,
      selectedIndex: 0,
      selectedIndices: [0],  
      customStyleIndex: 0,
      isready:0,
      visibleAddressModalTo: false,
      passenger: '1',
      note: '',
      AlwaysOpen: true,
      Customerimage:null,
       Metro:0,
      City: 0,
      SCity: 0,
      SMetro: 0,
      warningModal: false,
      fromPlace: this.props.route.params.fromPlace,
      flat:this.props.route.params.cLat,
      flong:this.props.route.params.cLong,
       region:{ latitude:this.props.route.params.cLat,
      longitude:this.props.route.params.cLong,
      // latitudeDelta: 0.0005,
  //longitudeDelta: 0.05
            latitudeDelta: 0.01,
              longitudeDelta: 0.005},
      searchResult: [],
      searchResultto:[],
      toPlace: '',
      isLoading: false,
      photo: '',
      
  };
  this.getLocation();

  }

  onRegionChange = region => {
    console.log('region: ', region)
  console.log('visibleAddressModal: ', this.state.visibleAddressModal)
    console.log('visibleAddressModalTo: ', this.state.visibleAddressModalTo)
    if(this.state.visibleAddressModal == true){
      this.setState({isLoading: true})
 axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${region.longitude},${region.latitude}.json?access_token=pk.eyJ1IjoiY3l6b294IiwiYSI6ImNrNjBwanFvMDBha3gzbHB4ZDhkcTE4dGIifQ.dmpHHwjnvWjEkB6ZaZXFUQ`)
     .then(res => {
    const item = res.data.features[0];

        let str = item.place_name;

let arr = str.split(',');

console.log("str", str)
console.log("arr", arr)
const province = Province.ZipsCollection.find( (items) => items.zip === item.context[0].text)
            


             this.setState({
    billing_province:item.context[0].text,
    billing_city: arr[2],
    billing_street:arr[0]+', '+ arr[1],
    billing_postal: arr[3],
    billing_barangay: item.context[1].text,
    flat:region.latitude,
    flong: region.longitude,
    cLong:region.longitude,
     cLat:region.latitude,
               region:{ latitude:region.latitude,
      longitude: 	region.longitude,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,},
               fromPlace:arr[0]+', '+arr[1]+' '+item.context[1].text+' '+arr[2]+' '+item.context[0].text+' '+arr[3], x: { latitude: region.latitude, longitude: region.longitude },
               isLoading: false,
               })

       }).catch(err => {
          console.log('Region axios: ',err)
       })
    
       return;
    }
        
        if(this.state.visibleAddressModalTo == true){
this.setState({isLoading: true})
 axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${region.longitude},${region.latitude}.json?access_token=pk.eyJ1IjoiY3l6b294IiwiYSI6ImNrNjBwanFvMDBha3gzbHB4ZDhkcTE4dGIifQ.dmpHHwjnvWjEkB6ZaZXFUQ`)
     .then(res => {
    const item = res.data.features[0];

    
    const {flat, flong, } = this.state;
    let from_lat = flat
    let from_long = flong
    let to_lat = region.latitude
    let to_long = region.longitude
  console.log('to_lat: ', to_lat)
    console.log('to_long: ', to_long)
    let routeCoordinates = [];
    let str = item.place_name;

let arr = str.split(',');

console.log("str", str)
console.log("arr", arr)
    axios.get(`https://route.ls.hereapi.com/routing/7.2/calculateroute.json?apiKey=5fcoJoPAIOye99-ssHc6TIx73yOAhtWiU1_1p1461X4&waypoint0=geo!${from_lat},${from_long}&waypoint1=geo!${to_lat},${to_long}&mode=fastest;car;traffic:disabled&legAttributes=shape`)
    .then(res => {
   
        res.data.response.route[0].leg[0].shape.map(m => {
          // here we are getting latitude and longitude in seperate variables because HERE sends it together, but we
          // need it seperate for <Polyline/>
          let latlong = m.split(',');
          let latitude = parseFloat(latlong[0]);
          let longitude = parseFloat(latlong[1]);
          routeCoordinates.push({latitude: latitude, longitude: longitude});
      })
      this.setState({
        routeForMap: routeCoordinates,
        Tolat:region.latitude,
        Tolong:region.longitude,
       
          summary: res.data.response.route[0].summary,
         
    billing_provinceTo:item.context[0].text,
    billing_cityTo: arr[2],
    billing_streetTo:arr[0]+', '+ arr[1],
    billing_postalTo: arr[3],
    billing_barangayTo: item.context[1].text,
    flatTo:region.latitude,
     flongTo:region.longitude,
  region:{ latitude:region.latitude,
      longitude: 	region.longitude,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,},
               toPlace:arr[0]+', '+arr[1]+' '+item.context[1].text+' '+arr[2]+' '+item.context[0].text+' '+arr[3], LocationDoneto: true,    visibleAddressModalTo: false, 
          isLoading: false,
      })

      })
       }).catch(err => {
          console.log('Region axios: ',err)
       })
    }
 
  }

 getLocationType = (text, field) => {
    const state = this.state
    state[field] = text;
    this.setState(state);
    this.setState({LocationDone: false})
    console.log('text: ', text);
    axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${text}.json?access_token=pk.eyJ1IjoiY3l6b294IiwiYSI6ImNrNjBwanFvMDBha3gzbHB4ZDhkcTE4dGIifQ.dmpHHwjnvWjEkB6ZaZXFUQ`)
     .then(res => {
    
    console.log('res: ', res.data.features[0]);
    let str = res.data.features[0].place_name;

let arr = str.split(',');

console.log("str", str)
console.log("arr", arr)

    this.setState({searchResult:res.data.features })
       }).catch(err => {
          console.log('axios: ',err)
       })




 }
  getLocationTypeto = (text, field) => {
    const state = this.state
    state[field] = text;
    this.setState(state);
    this.setState({LocationDoneto: false})
    console.log('text: ', text);
    axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${text}.json?access_token=pk.eyJ1IjoiY3l6b294IiwiYSI6ImNrNjBwanFvMDBha3gzbHB4ZDhkcTE4dGIifQ.dmpHHwjnvWjEkB6ZaZXFUQ`)
     .then(res => {
    
    console.log('res: ', res.data.features[0]);
    let str = res.data.features[0].place_name;

let arr = str.split(',');

console.log("str", str)
console.log("arr", arr)

    this.setState({searchResultto:res.data.features })
       }).catch(err => {
          console.log('axios: ',err)
       })




 }
  getLocation (){


 firestore().collection('vehicles').where('vehicle', '==', this.state.datas.vehicle).onSnapshot((querySnapshot) => {
    querySnapshot.forEach((doc) => {
console.log('doc.data(): ', doc.data())
      this.setState({
        succeding: doc.data().succeed,
        amount_base: this.props.route.params.typeOfRate =='Municipal Rate'?doc.data().base_fare:this.props.route.params.typeOfRate =='City Rate'?doc.data().City:doc.data().Metro,
        base_dist: doc.data().base,
          Metro: doc.data().Metro,
            City: doc.data().City,
              SCity: doc.data().SCity,
                SMetro: doc.data().SMetro,
      
     });
    })
  })
  }

  showDatePicker = () => {
    this.setState({isDatePickerVisible: true})
      };
    
       hideDatePicker = () => {
        this.setState({isDatePickerVisible: false})
      };
    
       handleConfirm = (date) => {
        console.warn("A date has been picked: ", date);
          this.setState({startDate: date})
        this.hideDatePicker();
      };

  checkbarangay(data) {
    const ref =  firestore().collection('barangay').doc(data);

    ref.get().then((doc) => {
      if (doc.exists) {
        const data = doc.data();
        this.setState({
          barangay_km: data.kilometer,
          barangay_status: data.status ,
          charge : data.charge ,
          selectedBarangayCluster: data.cluster    
        });
        this.calculateXtraKm(data.charge, data.cluster);
      } 
    });
    
  }




  async component (){
    let userId= await AsyncStorage.getItem('uid');
    const self = this;

			/* This will also be triggered when new items are added to or removed from cart  */
			self.unsubscribeCartItems =  firestore().collection('user_vouchers').doc(userId).onSnapshot(snapshot => {
				let updatedCart = []; /* Set empty array cart by default */
				
				if(snapshot.data() && Object.keys(snapshot.data()).length){
					/* Loop through list of cart item IDs  */
					Object.values(snapshot.data()).forEach(function (snapshotCart, index) {
							updatedCart.push({...snapshotCart});
							self.setState({vouchers: updatedCart, loading: false}); /* !!!! setState is running multiple times here, figure out how to detect when child_added completed*/
					
					});
				} else {
					self.setState({vouchers: [], loading: false})
				}
      });
    
  }

  checkVoucherDetails(data){
    const { voucherArray } = this.state;
    let total = 0;
    let discount = this.state.discount;
    if(this.state.voucherCode != data.id || !this.state.voucherCode){
    this.state.cartItems.forEach((item) => {

      if(item.storeId == data.store_id){
        if(item.sale_price){
          total += item.sale_price * item.qty
        }else{
          total += item.price * item.qty

        }
      }
    })
    console.log('vtotal: ', total)
    console.log('discount: ', this.state.discount)
    if(total >= parseFloat(data.minimum)){
      this.setState({discount: data.amount, voucherCode: data.id , isVisible: false})
    }else{
      Toast.show({
                      text: "Inapplicable Voucher",
                      position: "center",
                      type: "warning",
                      textStyle: { textAlign: "center" },
                })
      this.setState({isVisible: false})
    }

  }else{
    Alert.alert(
      'Voucher already in-use.',
      '',
      [
        {text: 'OK'},
      ]
    )
    this.setState({isVisible: false})
  }
 
  }

  componentDidMount() {

    this._bootstrapAsync();


  }

  
 componentWillUnmount() {
    this.unsubscribe && this.unsubscribe();
    this.subscribe && this.subscribe();
    this.billinglistener && this.billinglistener();
    this.paymentslistener && this.paymentslistener();
    this.paymentsmethodlistener && this.paymentsmethodlistener();
    this.ordercounters && this.ordercounters();
  }
  getAdminCharge =async()=> {
   console.log('Get AdminId: ', this.state.cartItems[0])
   const getAdminId = this.state.cartItems[0];
    this.ordercounters.collection('charges').where('id', '==', getAdminId.adminID ).onSnapshot((querySnapshot) => {
      querySnapshot.forEach((doc) => {
  
        this.setState({
          del_charge : doc.data().del_charge,
          driverCharge: doc.data().driverCharge,
          extra_charge: doc.data().extra_charge,
          labor_charge: doc.data().labor_charge,
          pickup_charge: doc.data().pickup_charge,
          succeding: doc.data().succeding,
          amount_base: doc.data().del_charge,
          base_dist: doc.data().base_dist,
        
       });
      })
    })
    
  }
  
  cartCount () {
    let total = 0
    this.state.cartItems.forEach((item) => {
      total += item.qty;
    })

    return total;
  }
  
_bootstrapAsync =async () =>{
  const userId= await AsyncStorage.getItem('uid');
  this.billinglistener = firestore().collection('users').where('userId','==', userId).onSnapshot(this.onCollectionUpdateBilling);      

  this.ordercounters = this.ordercounters.collection('orderCounter').onSnapshot(this.OrderCounter); 

  
  this.setState({ uid: userId })
  };


  
   onCPaymentMethodUpdate = (querySnapshot) => {
    const methods = [];
    querySnapshot.forEach((doc) => {
      this.setState({
        palawan_name: doc.data().palawan_receiver,
        palawan_number: doc.data().palawan_number,
        bank_number: doc.data().bank_number,
        bank_name: doc.data().bank_name,
        gcash_number: doc.data().gcash_number,
        bank_name2 : doc.data().bank_name2,
        bank_number2: doc.data().bank_number2,
        paypal_uname: doc.data().paypal_uname,
        paypal_email: doc.data().paypal_email
     });
    });

  }

  onCPaymentOptionUpdate = (querySnapshot) => {
    const payments = [];
    querySnapshot.forEach((doc) => {
      payments.push ({
            datas : doc.data(),
            key : doc.id
            });
    });
    this.setState({
      payments : payments,    
   });

  }


  OrderCounter = (querySnapshot) => {
    querySnapshot.forEach((doc) => {
      this.setState({
        counter : doc.data().counter,    
     });
    });
  

  }


     
  onCollectionUpdateBilling = (querySnapshot) => {
  querySnapshot.forEach((doc) => {
console.log('User Info: ', doc.data().photo)
    this.setState({
  
      account_name: doc.data().Name,
      account_address: doc.data().Address.Address,
      account_city: doc.data().Address.City,
      account_barangay: doc.data().Address.Barangay,
      account_province: doc.data().Address.Province,
      account_email: doc.data().Email,
      account_number: doc.data().Mobile,
      account_cluster: doc.data().Address.Cluster,
      account_status: doc.data().status,
      photo: doc.data().photo,
      address_list : Object.values(doc.data().Shipping_Address)
    });
 
    
  });
  this.defaultShippingAddress();
  }

   onCollectionUpdateCharge = (querySnapshot) => {
    querySnapshot.forEach((doc) => {
     this.setState({
       driver_charge: doc.data().driverCharge,
       xtra: doc.data().extra_charge,
       labor: doc.data().labor_charge,
       deliveryCharge: doc.data().del_charge,
       pickup: doc.data().pickup_charge
    });
    
            
    });
    
    }

 

  async calculateXtraKm(charge, clustering){
    let total =0
    const cluster = await AsyncStorage.getItem('cluster');

   if(clustering == cluster){
      total=0;
   }else{
     total = charge;
   }
   this.setState({xtraCharge : total})
  }

  calculateOverAllTotal () {
    const { paymentMethod, minimum, selectedIndex, selectedIndices, customStyleIndex } = this.state;
    let total = 0
    if(customStyleIndex === 0){
      total = this.state.subtotal + this.calculateTotalDeliveryCharge() + this.extraKMCharges();
    }else if(customStyleIndex === 1){
      total = this.state.subtotal + this.extraKMCharges();
    } 
    return total;
  }
   
  calculateLaborCharge () {
    let total = 0
     this.state.cartItems.forEach((item) => {
       if(item.sale_price){
           total +=  (item.qty * item.sale_price) * item.labor_charge
       }else{
           total +=  (item.qty * item.price) * item.labor_charge
       }       
      })
    return total;
  }

  calculatePickupCharge () {
    let total = 0

      total = this.state.pickup * this.storeID().length
     return total;
  }

  calculateTotalDeliveryCharge(){
    let total = 0;

total = this.state.amount_base;


    return total;
  }

  extraKMCharges(){
    
      let total = 0;
  let distance= this.state.summary === undefined? 0: parseFloat(this.state.summary.distance/1000);
  let NewDistance = distance - this.state.base_dist;
  let extrakm = NewDistance > 0? NewDistance * this.state.succeding: 0
  console.log('extrakm: ', extrakm)
  total = extrakm;
  
  
  
      return total;
    
  }
  storeIDS (){
      let store={};
      this.state.cartItems.forEach((item) => {    
        store[item.storeId] = "Pending";
      })
  
        return store;
   }

  storeID (){
    let store=[];
    let uniqueArray=[];
     this.state.cartItems.forEach((item) => {    
       store.push(item.storeId)
     })
     for(var value of store){
      if(uniqueArray.indexOf(value) === -1){
          uniqueArray.push(value);
      }
  }

      return uniqueArray;
   }

   token (){
    let store=[];
    let uniqueArray=[];
     this.state.cartItems.forEach((item) => {    
       store.push(...item.notification_token)
     })
     for(var value of store){
      if(uniqueArray.indexOf(value) === -1){
          uniqueArray.push(value);
      }
  }
     return uniqueArray;
   }

defaultShippingAddress(){

   this.state.address_list.forEach((item) => {    
      if(item.default){
       // console.log('item.lat: ', item.lat);
      //  console.log('item.long: ', item.long);
  
           this.setState({
            billing_name: item.name,
            billing_phone: item.phone,
            billing_province: item.province,
            billing_barangay: item.barangay,
            billing_city: item.city,
            billing_street: item.address,
            billing_postal: item.postal,
            USERlat: item.lat,
            USERlong: item.long,
            flat: item.lat,
            flong: item.long,
          })

          const {slatitude, slongitude, } = this.state;
       
          let from_lat = slatitude
          let from_long = slongitude
          let to_lat = item.lat
          let to_long = item.long

          let routeCoordinates = [];

          axios.get(`https://route.ls.hereapi.com/routing/7.2/calculateroute.json?apiKey=5fcoJoPAIOye99-ssHc6TIx73yOAhtWiU1_1p1461X4&waypoint0=geo!${from_lat},${from_long}&waypoint1=geo!${to_lat},${to_long}&mode=fastest;bicycle;traffic:disabled&legAttributes=shape`)
          .then(res => {
         
              res.data.response.route[0].leg[0].shape.map(m => {
                // here we are getting latitude and longitude in seperate variables because HERE sends it together, but we
                // need it seperate for <Polyline/>
                let latlong = m.split(',');
                let latitude = parseFloat(latlong[0]);
                let longitude = parseFloat(latlong[1]);
                routeCoordinates.push({latitude: latitude, longitude: longitude});
            })
            this.setState({
              ULat: item.lat,
              ULong:item.long,
                // here we can access route summary which will show us how long does it take to pass the route, distance etc.
                summary: res.data.response.route[0].summary,
                
                isready: 1,
                loading: false,
            })
         
            }).catch(err => {
           // console.log(err)
            })
      }
      
     })
  
}

   OrderSuccess (){
    this.props.navigation.reset({
    index: 0,
    routes: [{ name: 'Home' }],})
    this.setState({visibleModal: false});
   }


   changeAddress(item){
     /*if(this.props.route.params.selectedCityUser == item.city){

  this.setState({
    billing_name: item.name,
    billing_phone: item.phone,
    billing_province: item.province,
    billing_city: item.city,
    billing_street: item.address,
    billing_postal: item.postal,
    billing_barangay: item.barangay,
    flat: item.lat,
    flong: item.long,
    visibleAddressModal: false,
    cLong:item.long,
     cLat:item.lat,
  })
  //this.checkbarangay(item.barangay);
  
  const {slatitude, slongitude, } = this.state;
  let from_lat = slatitude
  let from_long = slongitude
  let to_lat = item.lat
  let to_long = item.long

  let routeCoordinates = [];

  axios.get(`https://route.ls.hereapi.com/routing/7.2/calculateroute.json?apiKey=5fcoJoPAIOye99-ssHc6TIx73yOAhtWiU1_1p1461X4&waypoint0=geo!${from_lat},${from_long}&waypoint1=geo!${to_lat},${to_long}&mode=fastest;bicycle;traffic:disabled&legAttributes=shape`)
  .then(res => {
 
      res.data.response.route[0].leg[0].shape.map(m => {
        // here we are getting latitude and longitude in seperate variables because HERE sends it together, but we
        // need it seperate for <Polyline/>
        let latlong = m.split(',');
        let latitude = parseFloat(latlong[0]);
        let longitude = parseFloat(latlong[1]);
        routeCoordinates.push({latitude: latitude, longitude: longitude});
    })
    this.setState({
      ULat: item.lat,
      ULong:item.long,
        // here we can access route summary which will show us how long does it take to pass the route, distance etc.
        summary: res.data.response.route[0].summary,
        // NOTE just add this 'isLoading' field now, I'll explain it later
        isLoading: false,
    })
    //console.log('sum: ', res.data.response.route[0].summary);
    }).catch(err => {
   // console.log(err)
    })
    return;
     }
     else{
       this.setState({warningText: 'Not in the same city it should be within '+ this.props.route.params.selectedCityUser, warningModal: true})
       return;
     }*/
}
changeAddressto(itemLat, itemLong){
/*
    
    const {flat, flong, } = this.state;
    let from_lat = flat
    let from_long = flong
    let to_lat = itemLat
    let to_long = itemLong
  console.log('to_lat: ', to_lat)
    console.log('to_long: ', to_long)
    let routeCoordinates = [];

    axios.get(`https://route.ls.hereapi.com/routing/7.2/calculateroute.json?apiKey=5fcoJoPAIOye99-ssHc6TIx73yOAhtWiU1_1p1461X4&waypoint0=geo!${from_lat},${from_long}&waypoint1=geo!${to_lat},${to_long}&mode=fastest;car;traffic:disabled&legAttributes=shape`)
    .then(res => {
   
        res.data.response.route[0].leg[0].shape.map(m => {
          // here we are getting latitude and longitude in seperate variables because HERE sends it together, but we
          // need it seperate for <Polyline/>
          let latlong = m.split(',');
          let latitude = parseFloat(latlong[0]);
          let longitude = parseFloat(latlong[1]);
          routeCoordinates.push({latitude: latitude, longitude: longitude});
      })
      this.setState({
        routeForMap: routeCoordinates,
        Tolat: item.lat,
        Tolong:item.long,
       
          summary: res.data.response.route[0].summary,
         
          isLoading: false,
      })
      //console.log('sum: ', res.data.response.route[0].summary);
      }).catch(err => {
     // console.log(err)
      })*/
  }
changePaymentMethod(item){
  this.setState({
    paymentMethod: item.datas.label,
    visiblePaymentModal: false
  })
}

handleCustomIndexSelect = (index: number) => {
  //handle tab selection for custom Tab Selection SegmentedControlTab
  this.setState(prevState => ({ ...prevState, customStyleIndex: index }));
};

navigateAddress(){
  this.setState({visibleAddressModal: false})
  this.props.navigation.navigate('Address')
}

 footer= () => {
    return(
    <View>
      <Button block  style={{alignSelf:'center', backgroundColor:'#019fe8'}}  onPress={()=>this.navigateAddress() }>
            <Text style={{color: 'white'}}>Add Address</Text>
      </Button>
    </View>
    )
  }


  render() {
    const { paymentMethod, minimum, selectedIndex, selectedIndices, customStyleIndex, slatitude, slongitude, lat, ULat,summary } = this.state;
   
    let distance = this.state.summary === undefined? null: this.state.summary.distance/1000;
    let newDistance = distance - this.state.base_dist;
    let distanceAmount = newDistance*this.state.succeding;
    let amountpay= this.state.amount_base +distanceAmount;
      let distanceAmountCity = newDistance*this.state.SCity;
    let amountpayCity= this.state.City +distanceAmountCity;
     let distanceAmountMetro= newDistance*this.state.SMetro;
    let amountpayMetro= this.state.Metro +distanceAmountMetro;
    
    const actualAmountPay = this.props.route.params.typeOfRate =='Municipal Rate'?amountpay:this.props.route.params.typeOfRate =='City Rate'?amountpayCity:amountpayMetro
  const typeOfRate = this.props.route.params.typeOfRate; 
 console.log('newDistance: ', newDistance);
 console.log('this.state.SCity: ', this.state.SCity);
 console.log('this.state.City: ', this.state.City);
  console.log('distanceAmountCity: ', distanceAmountCity);
  console.log('amountpayCity: ', amountpayCity);
console.log('typeOfRate: ', typeOfRate);
//console.log('summary: ', summary);
console.log('region: ', this.state.region);
    return(
        <Root>
          <Container style={{backgroundColor: '#CCCCCC'}}>   
          <CustomHeader title="Checkout"  Cartoff={true} navigation={this.props.navigation}/>
          <Loader loading={this.state.loading}/>     
     <Loader loading={this.state.isLoading}/>  
                      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <View style={{position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,}}>
      
    <MapView
            testID="map"
        provider={PROVIDER_GOOGLE}
        onRegionChangeComplete={this.onRegionChange}
        showsUserLocation={true}
          style={{ position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0}}
    initialRegion={this.state.region}
    showsMyLocationButton={true}
          showsBuildings={true}
          maxZoomLevel={17.5}
          loadingEnabled={true}
zoomTapEnabled={false}
      zoomEnabled={true}
        scrollEnabled={true}
        onPress={e => console.log('mapView: ', e.nativeEvent.coordinate)}
          >
              
             {this.state.routeForMap && (
                <Polyline
                  key="editingPolyline"
                  coordinates={this.state.routeForMap}
                  strokeColor="#019fe8"
                  fillColor="#019fe8"
                  strokeWidth={5}
                />
              )}
              
          { this.state.flong == undefined? null:  
          <MapView.Marker
             coordinate={{latitude: this.state.flat, longitude: this.state.flong}}
             title={"From"}
             description={this.state.billing_name+' | '+this.state.billing_phone+"\n"+this.state.billing_street+', '+this.state.billing_barangay+', '+this.state.billing_city+', ' +this.state.billing_province+', ' +this.state.billing_postal}
             image={Rider_img}
          />}
           {  this.state.Tolong == undefined? null:
           
           <MapView.Marker
             coordinate={{latitude: this.state.Tolat, longitude: this.state.Tolong}}
             title={"User"}
             description={"user Description"}
             image={customer_img}
       />}
          
          </MapView>
          {this.state.visibleAddressModal ==true || this.state.visibleAddressModalTo == true?   <View style={{ left: '50%',
  marginLeft: -16,
  marginTop: -125,
  position: 'absolute',
  top: '62%'}}>
        <Image style={{height: 36,
  width: 36,}} source={marker} />
      </View>:null}
        </View>
         </View>
         <View>
               
               <ScrollView >
         <Card>
                <CardItem>
                    <Text style={{fontWeight: 'bold'}}>From: </Text>
                    {!this.state.loading &&
                   
                    <Item regular style={{width: '90%'}}>
                    <Input value={this.state.fromPlace}  onChangeText={(text) => this.getLocationType(text, 'fromPlace')}  onFocus={() =>this.setState({visibleAddressModal: true}) }  onBlur={() => this.setState({visibleAddressModal: false})  } />
                         </Item>      }
                                
                </CardItem>
                 {this.state.LocationDone == false?<View style={{height: 100}}><FlatList
                                 
        data={this.state.searchResult}
        renderItem={ ({ item }) => (
         <View style={{padding: 10}}>
           <TouchableOpacity onPress={()=>{ 
                 let str = item.place_name;

let arr = str.split(',');

console.log("str", str)
console.log("arr", arr)
//const province = Province.ZipsCollection.find( (items) => items.zip === item.context[0].text)
            
const region=  {latitude: item.center[1], latitudeDelta: 0.0999998484542477, longitude: item.center[0], longitudeDelta: 0.11949475854635239}
console.log('region: ', region)

             this.setState({
 
    billing_province:item.context[0].text,
    billing_city: arr[2],
    billing_street:arr[0]+', '+ arr[1],
    billing_postal: arr[3],
    billing_barangay: item.context[1].text,
    flat: item.geometry.coordinates[1],
    flong: item.geometry.coordinates[0] ,

    cLong:item.geometry.coordinates[0] ,
     cLat:item.geometry.coordinates[1],

            

               region:{ latitude:item.center[1],
      longitude: 	item.center[0],
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,},
               fromPlace:arr[0]+', '+arr[1]+' '+item.context[1].text+' '+arr[2]+' '+item.context[0].text+' '+arr[3], x: { latitude: item.geometry.coordinates[1], longitude: item.geometry.coordinates[0] }, LocationDone: true,    visibleAddressModalTo: false, })}}>
 
           <Text>{item.place_name}</Text>
           {console.log('coordinates:', item.geometry.coordinates)}</TouchableOpacity>
         </View>
        )}
        keyExtractor={item => item.id}
      /></View>:null}
                <CardItem>
                    <Text style={{fontWeight: 'bold'}}>To: </Text>
                    {!this.state.loading &&
                       
                    <Item regular style={{width: '90%'}}>
                    <Input value={this.state.toPlace}  onChangeText={(text) => this.getLocationTypeto(text, 'toPlace')}  onFocus={() =>this.setState({visibleAddressModalTo: true}) }  onBlur={() => this.setState({visibleAddressModalto: false})  } />
                         </Item>  
                   }
                </CardItem>
                     {this.state.LocationDoneto == false?<View style={{height: 100}}><FlatList
                                 
        data={this.state.searchResultto}
        renderItem={ ({ item }) => (
         <View style={{padding: 10}}>
           <TouchableOpacity onPress={()=>{ 
             this.setState({isLoading: true})
                 let str = item.place_name;

let arr = str.split(',');


const province = Province.ZipsCollection.find( (items) => items.zip === item.context[0].text)
            
const region=  {latitude: item.center[1], latitudeDelta: 0.0999998484542477, longitude: item.center[0], longitudeDelta: 0.11949475854635239}
console.log('region: ', region)
console.log("province", province)
  
    const {flat, flong, } = this.state;
    let from_lat = flat
    let from_long = flong
    let to_lat = item.center[1]
    let to_long = item.center[0]
  console.log('to_lat: ', to_lat)
    console.log('to_long: ', to_long)
    let routeCoordinates = [];

    axios.get(`https://route.ls.hereapi.com/routing/7.2/calculateroute.json?apiKey=5fcoJoPAIOye99-ssHc6TIx73yOAhtWiU1_1p1461X4&waypoint0=geo!${from_lat},${from_long}&waypoint1=geo!${to_lat},${to_long}&mode=fastest;car;traffic:disabled&legAttributes=shape`)
    .then(res => {
   
        res.data.response.route[0].leg[0].shape.map(m => {
          // here we are getting latitude and longitude in seperate variables because HERE sends it together, but we
          // need it seperate for <Polyline/>
          let latlong = m.split(',');
          let latitude = parseFloat(latlong[0]);
          let longitude = parseFloat(latlong[1]);
          routeCoordinates.push({latitude: latitude, longitude: longitude});
      })
      this.setState({
        routeForMap: routeCoordinates,
        Tolat: item.center[1],
        Tolong:item.center[0],
       
          summary: res.data.response.route[0].summary,
         
    billing_provinceTo:province == undefined?item.context[0].text :province.province,
    billing_cityTo: arr[2],
    billing_streetTo:arr[0]+', '+ arr[1],
    billing_postalTo: arr[3],
    billing_barangayTo: item.context[1].text,
    flatTo:item.geometry.coordinates[0] ,
     flongTo:item.geometry.coordinates[1],
  region:{ latitude:item.center[1],
      longitude: 	item.center[0],
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,},
               toPlace:arr[0]+', '+arr[1]+' '+item.context[1].text+' '+arr[2]+' '+item.context[0].text+' '+arr[3], LocationDoneto: true,    visibleAddressModalTo: false, 
          isLoading: false,
      })
      //console.log('sum: ', res.data.response.route[0].summary);
      }).catch(err => {
     // console.log(err)
      })

   }}>
 
           <Text>{item.place_name}</Text>
           {console.log('coordinates:', item.geometry.coordinates)}</TouchableOpacity>
         </View>
        )}
        keyExtractor={item => item.id}
      /></View>:null}
            </Card> 
           
            <Card>
                <CardItem>
                    <Text style={{fontWeight: 'bold'}}>Vehicle:  </Text>
                    <Left>
                        <Text>{this.state.datas.vehicle}</Text>
                    </Left>
             
                   {this.state.summary === undefined? null: <Right>
                  
                    <Text>{this.state.summary === undefined? null: distanceAmount < 1?'₱ '+ this.state.amount_base: '₱ '+Math.round((actualAmountPay*10)/10)}</Text>
                    <Text>{this.state.summary === undefined? null: Math.round(((this.state.summary.baseTime/60)*10)/10)} mins</Text>
                    </Right>}
                </CardItem>
            </Card> 

            {this.state.summary === undefined? null:<View style={{ height: 40, alignItems: 'center', marginBottom: 10}}>
							<TouchableOpacity  style={[styles.centerElement, {backgroundColor: '#019fe8', width: SCREEN_WIDTH - 10, height: 40, borderRadius: 5, padding: 10}]} onPress={() => {this.state.uid == null?  this.props.navigation.navigate('Login') :this.setState({VisibleAddInfo: true})}}>
								<Text style={{color: '#ffffff'}}>{this.state.uid == null?'Log in to Continue':'Book Now'}</Text>
							</TouchableOpacity>
            </View>}
               
               </ScrollView >
               </View>

               
            <Modal
      isVisible={this.state.VisibleAddInfo}
      animationInTiming={700}
      animationIn='slideInUp'
      animationOut='slideOutDown'
      animationOutTiming={700}
      useNativeDriver={true}
      onBackdropPress={() => this.setState({VisibleAddInfo: false})} transparent={true}>
     <Card style={{ backgroundColor: 'white',
      padding: 22,
      borderRadius: 4,
      borderColor: 'rgba(0, 0, 0, 0.1)',}}>
       
        <List>
                        <Text style={{marginTop: 15, fontSize: 10}}>Number of Passengers</Text>
                        <Item regular style={{marginTop: 7}}>
             <Input placeholder={this.state.passenger}  value={this.state.passenger} keyboardType={'number-pad'}  onChangeText={(text) => {isNaN(text)? null: this.setState({passenger: text})}} placeholderTextColor="#687373" />
         </Item>
         <Text style={{marginTop: 15, fontSize: 10}}>Pickup Time</Text>
                    <Item regular style={{marginTop: 7, padding: 10}}>
                       <TouchableOpacity onPress={this.showDatePicker} style={{width: '60%'}}>
<Text>{this.state.startDate===""?'Start Date/Time':moment(this.state.startDate).format('h:mm a')}</Text>
</TouchableOpacity>
{this.state.AlwaysOpen==false?
  <MaterialCommunityIcons name="checkbox-blank-outline" size={25} color="green" onPress={()=> this.setState({AlwaysOpen: true})}><Text style={{fontSize: 15}}>Asap</Text></MaterialCommunityIcons>
  :
 <MaterialCommunityIcons name="checkbox-marked-outline" size={25} color="red" onPress={()=> this.setState({AlwaysOpen: false})}><Text style={{fontSize: 15}}>Asap</Text></MaterialCommunityIcons>
 
 
}
<DateTimePickerModal
        isVisible={this.state.isDatePickerVisible}
        mode="time"
        onConfirm={this.handleConfirm}
        onCancel={this.hideDatePicker}
      />
                    </Item>
                    <Text style={{marginTop: 15, fontSize: 10}}>Note to Rider</Text>
                        <Item regular style={{marginTop: 7}}>
             <Input placeholder={this.state.note}  value={this.state.note} onChangeText={(text) => {this.setState({note: text})}} placeholderTextColor="#687373" />
         </Item>
           </List>   
    
      <Button block style={{ height: 30, backgroundColor:  "#33c37d", marginTop: 10}}
        onPress={() => this.checkOut()}
      >
       <Text style={{color:'white'}}>Procceed</Text>
      </Button>
    </Card>
    </Modal>
              {/* <Modal
                  useNativeDriver={true}
                  isVisible={this.state.visibleAddressModal}
                  onSwipeComplete={this.close}
                  swipeDirection={['up', 'left', 'right', 'down']}
                  style={styles.view}
                  onBackdropPress={() => this.setState({visibleAddressModal: false})} transparent={true}>
                <View style={styles.content}> 
                    <View>
                      <Text style={{textAlign:'center', paddingVertical: 15}}> Select Address </Text>
                      <FlatList
                          data={this.state.address_list}
                          ListFooterComponent={this.footer}
                          renderItem={({ item }) => 
                          <Card transparent>
                          <CardItem style={{borderRadius: 10, borderWidth: 0.1, marginHorizontal: 10, borderColor: 'tomato'}} button onPress={()=> this.changeAddress(item)}>                     
                            <View style={{flex: 1, flexDirection: 'column'}}>
                              <Text style={{fontSize: 14}}>{item.name} | {item.phone} {"\n"}{item.address}, {item.barangay}, {item.city}, {item.province}, {item.postal}</Text>
                            </View>              
                          </CardItem>
                        </Card>  
                          }
                          keyExtractor={item => item.key}
                      />
                    </View>
                </View>
                </Modal>*/}



               { /*<Modal
                  useNativeDriver={true}
                  isVisible={this.state.visibleAddressModalTo}
                  onSwipeComplete={this.close}
                  swipeDirection={['up', 'left', 'right', 'down']}
                  style={styles.view}
                  onBackdropPress={() => this.setState({visibleAddressModalTo: false})} transparent={true}>
                <View style={styles.content}> 
                    <View>
                      <Text style={{textAlign:'center', paddingVertical: 15}}> Select Address </Text>
                      <FlatList
                          data={this.state.address_list}
                          ListFooterComponent={this.footer}
                          renderItem={({ item }) => 
                          <Card transparent>
                          <CardItem style={{borderRadius: 10, borderWidth: 0.1, marginHorizontal: 10, borderColor: 'tomato'}} button onPress={()=> this.changeAddressto(item)}>                     
                            <View style={{flex: 1, flexDirection: 'column'}}>
                              <Text style={{fontSize: 14}}>{item.name} | {item.phone} {"\n"}{item.address}, {item.barangay}, {item.city}, {item.province}, {item.postal}</Text>
                            </View>              
                          </CardItem>
                        </Card>  
                          }
                          keyExtractor={item => item.key}
                      />
                    </View>
                </View>
                </Modal>*/
}
                <Modal
              isVisible={this.state.visibleModal}
              animationInTiming={500}
              animationIn='slideInUp'
              animationOut='slideOutDown'
              animationOutTiming={500}
              useNativeDriver={true}
              onBackdropPress={() => this.OrderSuccess()} transparent={true}>
            <View style={styles.content}>
              <View style={{justifyContent: 'center',alignItems: 'center', paddingVertical: 10}}>
              <Text style={{color:'tomato', fontWeight:'bold'}}>Thank you for using Kusinahanglan!</Text>
              </View>
              <View style={{justifyContent: 'center',alignItems: 'center', paddingVertical: 20}}>
              <Image
                  style={{ height: 150, width: 150}}
                  source={require('../assets/check.png')}
                />
              </View>
              <View style={{justifyContent: 'center',alignItems: 'center', paddingVertical: 10}}>
              <Text style={{color:'black', fontWeight:'bold'}}>Your Order is Queued!</Text>
              <Text style={{color:'black', fontWeight:'600', textAlign: "center"}}>We will communicate with you to verify your order.Please wait patiently.</Text>
              </View>
            <Button block style={{ height: 30, backgroundColor: "#019fe8"}}
             onPress={()=> this.OrderSuccess()} >
              <Text style={{color: 'white'}}>Ok</Text>
              </Button>
            </View>
            </Modal>
              <Modal
              isVisible={this.state.warningModal}
              animationInTiming={500}
              animationIn='slideInUp'
              animationOut='slideOutDown'
              animationOutTiming={500}
              useNativeDriver={true}
              onBackdropPress={() =>  this.setState({warningModal: false})} transparent={true}>
            <View style={styles.content}>
              <View style={{justifyContent: 'center',alignItems: 'center', paddingVertical: 10}}>
              <Text style={{color:'tomato', fontWeight:'bold'}}>Error!</Text>
              </View>
            
              <View style={{justifyContent: 'center',alignItems: 'center', paddingVertical: 10}}>
              <Text style={{color:'black', fontWeight:'bold'}}>{this.state.warningText}</Text>
              </View>
            <Button block style={{ height: 30, backgroundColor: "#019fe8"}}
             onPress={()=> this.setState({warningModal: false})} >
              <Text style={{color: 'white'}}>Ok</Text>
              </Button>
            </View>
            </Modal>
          </Container>
          </Root>
    );
  }


  async checkOut(){
console.log('this.state.photo: ', this.state.photo)
console.log('this.state.startDate: ', this.state.startDate)
if(this.state.photo == ''|| this.state.photo == undefined){
       Alert.alert(
            'Please Update Your Photo',
            '',
            [
              {text: 'OK'},
            ]
          )
          return;
}
    if(this.state.passenger=='0' || this.state.passenger==''){
        Alert.alert(
            'Declare number of Passenger',
            '',
            [
              {text: 'OK'},
            ]
          )
          return;
    }
    if(this.state.AlwaysOpen == false && this.state.startDate==undefined){
        Alert.alert(
            'Set Time',
            '',
            [
              {text: 'OK'},
            ]
          )
          return;
    }
         this.setState({loading: true})
    const distance = this.state.summary === undefined? null: this.state.summary.distance/1000;
  
  
    let newDistance = distance - this.state.base_dist;
    let distanceAmount = newDistance*this.state.succeding;
    let amountpay= this.state.amount_base +distanceAmount;
      let distanceAmountCity = newDistance*this.state.SCity;
    let amountpayCity= this.state.City +distanceAmountCity;
     let distanceAmountMetro= newDistance*this.state.SMetro;
    let amountpayMetro= this.state.Metro +distanceAmountMetro;
    
    const actualAmountPay = this.props.route.params.typeOfRate =='Municipal Rate'?amountpay:this.props.route.params.typeOfRate =='City Rate'?amountpayCity:amountpayMetro
  const typeOfRate = this.props.route.params.typeOfRate; 


    const newDocumentID = this.checkoutref.collection('orders').doc().id;
    const today = this.state.currentDate;
    const timeStamp= new Date().getTime();
    const date_ordered = moment(today).format('MMMM Do YYYY, h:mm:ss a');
    const week_no = moment(today , "MMDDYYYY").isoWeek();
    const time =  moment(today).format('h:mm:ss a');
    const date = moment(today).format('MMMM D, YYYY');
    const day = moment(today).format('dddd');
    const month = moment(today).format('MMMM');
    const year = moment(today).format('YYYY');
    const userId= await AsyncStorage.getItem('uid');
    const token = await AsyncStorage.getItem('token');
    const updatecounts =  firestore().collection('orderCounter').doc('orders');
    const updateUserOrders =  firestore().collection('users').doc(userId);



    this.checkoutref.collection('orders').doc(newDocumentID).set({
        Customerimage:this.state.photo,
     OrderNo : this.state.counter,
     OrderId: newDocumentID,
     OrderStatus: 'Pending',
     passengers: this.state.passenger,
     needAsap:this.state.AlwaysOpen,
     pickupTime:this.state.startDate === undefined? null:this.state.startDate,
     adminID: '',
     AccountInfo: {
       name: this.state.account_name,
       address: this.state.account_address,
       phone: this.state.account_number,
       email: this.state.account_email,
       barangay: this.state.account_barangay,
       city: this.state.account_city,
       province: this.state.account_province,
       status: this.state.account_status,
     },
     Billing: {
       name: this.state.account_name,
       address: this.state.billing_street,
       phone: this.state.account_number,
       barangay: this.state.billing_barangay,
       province: this.state.billing_province,
       billing_city: this.state.billing_city,

     },
     OrderDetails: {
      Date_Ordered: date_ordered,
      Preffered_Delivery_Time_Date:this.state.preffered_delivery_time,
      Week_No: week_no,
      Year: year,
      Month: month,
      Time: time,
      Date: date,
      Day: day,
      Timestamp: timeStamp
     },
     billing_nameTo: this.state.account_name,
     billing_phoneTo:this.state.account_number,
     billing_provinceTo: this.state.billing_provinceTo,
     billing_cityTo: this.state.billing_cityTo,
     billing_streetTo: this.state.billing_streetTo,
     billing_postalTo: this.state.billing_postalTo,
     billing_barangayTo:this.state.billing_barangayTo,
     Timestamp: moment().unix(),
     user_token : token,
     Note: this.state.note,
     PaymentMethod: this.state.paymentMethod,
     DeliveredBy: '',
     rider_id:'',
     isCancelled: false,
     userId: userId,
     distance: this.state.summary.distance,
     flat: this.state.flat,
     flong:this.state.flong,
     Tolong: this.state.Tolong,
     Tolat: this.state.Tolat,
     discount: this.state.discount,
     voucherUsed: this.state.voucherCode,
     km:  this.state.summary.distance/1000,
     total:  distanceAmount < 1? this.state.amount_base: actualAmountPay,
     exkm: newDistance,
     estTime:  this.state.summary.baseTime,
     succeding: this.state.succeding,
     amount_base: this.state.amount_base,
     base_dist: this.state.base_dist,
    vehicle: this.state.datas.vehicle,
    ProductType: 'Transport',
    }).then(
      updatecounts.update({ counter:   firestore.FieldValue.increment(1) }),
      updateUserOrders.update({ ordered_times:   firestore.FieldValue.increment(1) }),
  
      this.setState({
        loading: false,
        visibleModal: true
      })
    )  .catch((error)=>     Alert.alert(
        'Try Again',
        '',
        [
          {text: 'OK'},
        ]
      ))

  }

}


const styles = {
  line: {
    width: '100%',
    height: 1,
    backgroundColor: '#bdc3c7',
    marginBottom: 10,
    marginTop: 10
  },
   view: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  invoice: {
      padding: 20,
      backgroundColor:"#FFFFFF",
      borderWidth: 0.2,
      borderBottomColor: '#ffffff',
      borderTopColor: '#ffffff',

    },
    centerElement: {justifyContent: 'center', alignItems: 'center'},
    content: {
      backgroundColor: 'white',
      padding: 22,
      borderRadius: 4,
      borderColor: 'rgba(0, 0, 0, 0.1)',
    },
};
