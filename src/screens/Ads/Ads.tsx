import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const Ads = () => {
  return (
    <View style={styles.container}>
      <Svg height={height} width={width} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient
            id="grad"
            cx="50%"
            cy="50%"
            rx="85%"
            ry="45%"
            fx="50%"
            fy="50%"
          >
            <Stop offset="0%" stopColor="#4501A7" stopOpacity="1" />
            <Stop offset="100%" stopColor="#180139" stopOpacity="1" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
      </Svg>
      <View style={styles.content}>
        <Text style={styles.title}>Watch a Short Ad</Text>
        <Text style={styles.desc}>
          Complete watching the ad to see your{'\n'}analysis results
        </Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Watch Ad</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  desc: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    width: '60%',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#3B1E6D',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Ads;
