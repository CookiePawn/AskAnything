import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { launchCamera, launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import Animated, { 
  useSharedValue, 
  withTiming, 
  useAnimatedStyle,
  withSpring,
  Easing
} from 'react-native-reanimated';

const Home = () => {
  const translateY = useSharedValue(100);

  useEffect(() => {
    translateY.value = withSpring(0, {
      damping: 15,
      stiffness: 100,
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const handleGalleryPress = async () => {
    try {
      const result: ImagePickerResponse = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Failed to pick image');
        return;
      }

      if (result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        // TODO: Handle the selected image
        console.log('Selected image:', imageUri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

  const handleCameraPress = async () => {
    try {
      const result: ImagePickerResponse = await launchCamera({
        mediaType: 'photo',
        quality: 1,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Failed to take photo');
        return;
      }

      if (result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        // TODO: Handle the captured image
        console.log('Captured image:', imageUri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  return (
    <LinearGradient
      colors={['#9A4DD0', '#280061', '#020105']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <Animated.View style={[styles.content, animatedStyle]}>
        <Text style={styles.title}>Ask Anything{'\n'}About Everything</Text>
        <Text style={styles.description}>
          Discover insights from any image with our advanced AI analysis
        </Text>
        <TouchableOpacity 
          style={styles.galleryButton}
          onPress={handleGalleryPress}
        >  
          <Text style={styles.galleryButtonText}>Choose from Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.cameraButton}
          onPress={handleCameraPress}
        >
          <Text style={styles.cameraButtonText}>Take a Photo</Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    bottom: 120,
  },
  title: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 30,
  },
  description: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 50,
  },
  galleryButton: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 100,
    alignItems: 'center',
    marginBottom: 10,
  },
  galleryButtonText: {
    color: '#3B3B3B',
    fontSize: 16,
    fontWeight: '600',
  },
  cameraButton: {
    backgroundColor: '#3B3B3B',
    padding: 10,
    borderRadius: 100,
    alignItems: 'center',
  },
  cameraButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Home;
