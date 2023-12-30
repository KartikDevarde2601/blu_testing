import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import AnimatedLoader from 'react-native-animated-loader';

const LoadingAnimation = props => {
  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.text}>Pls Turn on Bluetooth</Text>
      <AnimatedLoader
        visible={props.visible}
        source={require('../assets/AnimationBlu.json')}
        animationStyle={styles.lottie}
        speed={1}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  lottie: {
    width: 150,
    height: 150,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    position: 'absolute', // Position the text absolutely
    top: 400, // Position where you want
  },
});

export default LoadingAnimation;
