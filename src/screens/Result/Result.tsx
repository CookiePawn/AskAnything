import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '@/navigation/types';

type ResultScreenRouteProp = RouteProp<RootStackParamList, 'Result'>;

const Result = () => {
  const route = useRoute<ResultScreenRouteProp>();
  const { imageUrl } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Result</Text>
      {/* You can use imageUrl here as needed */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Result;

