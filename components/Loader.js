import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Modal,
  ActivityIndicator,
  Animated,
} from 'react-native';

const Loader = props => {
  const {loading, trans, ...attributes} = props;

  return (
    <Modal
      transparent={true}
      animationType={'none'}
      visible={loading}
      onRequestClose={() => {
        console.log('close modal');
      }}>
      <View style={styles.modalBackground}>
        <View style={styles.activityIndicatorWrapper}>
          <ActivityIndicator animating={loading} color="#00ff00" size="large" />
          {/* <Animated.Image 
   style={[{ width: 80, height: 80,  }, trans]}  
   source={require('../assets/k.png')}/>*/}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
  activityIndicatorWrapper: {
    height: 100,
    width: 100,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'white',
  },
});

export default Loader;
