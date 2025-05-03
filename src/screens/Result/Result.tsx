import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '@/navigation/types';
import LinearGradient from 'react-native-linear-gradient';

type ResultScreenRouteProp = RouteProp<RootStackParamList, 'Result'>;

const Result = () => {
  const route = useRoute<ResultScreenRouteProp>();
  const { imageUrl } = route.params;
  const navigation = useNavigation();
  
  return (
    <LinearGradient
      colors={['#9A4DD0', '#280061', '#020105']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
        <ScrollView
            showsVerticalScrollIndicator={false}
        >
            <Image source={{ uri: imageUrl }} style={styles.image} />
            <Text style={styles.description}>Description</Text>
            <Text style={styles.descriptionText}>The iPhone 14 Pro represents the pinnacle of mobile technology, offering a stunning display, powerful performance, and advanced camera features. It's a must-have for tech enthusiasts and iPhone users alike.</Text>
            
            <Text style={styles.keyFeatures}>Key Features</Text>
            <Text style={styles.keyFeaturesText}>- 6.1-inch Super Retina XDR display</Text>
            <Text style={styles.keyFeaturesText}>- Ceramic shield front cover</Text>
            <Text style={styles.keyFeaturesText}>- A16 Bionic chip</Text>
            <Text style={styles.keyFeaturesText}>- 48MP main camera</Text>
            <Text style={styles.keyFeaturesText}>- 12MP ultrawide camera</Text>
            <Text style={styles.keyFeaturesText}>- 12MP telephoto camera</Text>
            <Text style={styles.keyFeaturesText}>- 12MP telephoto camera</Text>
            <Text style={styles.keyFeaturesText}>- 12MP telephoto camera</Text>
            <Text style={styles.keyFeaturesText}>- 12MP telephoto camera</Text>
            <Text style={styles.keyFeaturesText}>- 12MP telephoto camera</Text>
            <Text style={styles.keyFeaturesText}>- 12MP telephoto camera</Text>
            <Text style={styles.keyFeaturesText}>- 12MP telephoto camera</Text>
            
            <TouchableOpacity 
                style={styles.button}
                onPress={() => navigation.navigate('Home')}
            >
                <Text style={styles.buttonText}>Home</Text>
            </TouchableOpacity>
        </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 20,
  },
  description: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  descriptionText: {
    fontSize: 14,
    color: '#ffffff',
  },
  keyFeatures: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 30,
    marginBottom: 15,
  },
  keyFeaturesText: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B3B3B',
  },
});

export default Result;

