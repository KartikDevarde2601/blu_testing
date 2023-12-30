import React from 'react';
import {View, Text, SafeAreaView, StyleSheet} from 'react-native';

const DataSending = ({route}) => {
  console.log('data sending screen rendered');
  console.log(route.params);
  const {device} = route.params || {}; // Use {} as a fallback
  if (device) {
    console.log(device.name);
  }
  return (
    <SafeAreaView>
      <View style={styles.container}>
        <Text style={{color: 'red'}}>conneted Devices</Text>
        <Text>
          {device && device.name ? device.name : 'Device not connected'}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
});
export default DataSending;
