import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
const MyTimelineDescription = props => {
  const {labelOne, valueOne, labelTwo, valueTwo, labelThree, valueThree} =
    props;
  return (
    <View style={styles.container}>
      {Boolean(valueOne) && (
        <View style={{flex: 1, flexDirection: 'row'}}>
          <View style={{flex: 0.5}}>
            <Text style={styles.labelStyle}>{labelOne}</Text>
          </View>
          <View style={{flex: 0.5}}>
            <Text style={{fontSize: 18}}>{valueOne} </Text>
          </View>
        </View>
      )}

      {Boolean(valueTwo) && (
        <View style={{flex: 1, flexDirection: 'row', marginVertical: 10}}>
          <View style={{flex: 0.5}}>
            <Text style={styles.labelStyle}>{labelTwo}</Text>
          </View>
          <View style={{flex: 0.5}}>
            <Text style={{fontSize: 18}}>{valueTwo} </Text>
          </View>
        </View>
      )}
      {Boolean(valueThree) && (
        <View style={{flex: 1, flexDirection: 'row'}}>
          <View style={{flex: 0.5}}>
            <Text style={styles.labelStyle}>{labelThree}</Text>
          </View>
          <View style={{flex: 0.5}}>
            <Text style={{fontSize: 18}}>{valueThree} </Text>
          </View>
        </View>
      )}
    </View>
  );
};
export default MyTimelineDescription;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    // marginHorizontal: 5,
    padding: 15,
    elevation: 5,
    borderRadius: 7,
  },
  labelStyle: {
    fontSize: 16,
  },
});
