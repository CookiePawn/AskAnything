import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, BackHandler, ToastAndroid } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { launchCamera, launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import RNExitApp from 'react-native-exit-app';
import Animated, { 
  useSharedValue, 
  withTiming, 
  useAnimatedStyle,
  withSpring,
  Easing
} from 'react-native-reanimated';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const Home = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const translateY = useSharedValue(100);
  const backPressedTime = useRef(0);

  useEffect(() => {
    translateY.value = withSpring(0, {
      damping: 15,
      stiffness: 100,
    });

    const backAction = () => {
      const currentTime = new Date().getTime();
      const timeDiff = currentTime - backPressedTime.current;
      
      if (timeDiff < 2000) { // 2초 이내에 두 번 누른 경우
        RNExitApp.exitApp();
        return true;
      }
      
      backPressedTime.current = currentTime;
      ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
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
        navigation.navigate('Ads', { imageUrl : imageUri || '' });
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
        navigation.navigate('Ads', { imageUrl: imageUri || '' });
        console.log('Captured image:', imageUri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const handleTermsPress = () => {
    navigation.navigate('Terms');
  };

  const handlePolicyPress = () => {
    navigation.navigate('Privacy');
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
      <View style={styles.footer}>
        <TouchableOpacity onPress={handleTermsPress}>
          <Text style={styles.footerText}>Terms and Conditions</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePolicyPress}>
          <Text style={styles.footerText}>Privacy Policy</Text>
        </TouchableOpacity>
      </View>
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
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});

export default Home;
