import { CameraIcon } from '@/assets';
import React, { useEffect, useState } from 'react';
import { View, Text, Platform, Linking, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';

type PermissionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Permission'>;

const Permission = () => {
  const navigation = useNavigation<PermissionScreenNavigationProp>();

  const [permissionStatus, setPermissionStatus] = useState<'checking' | 'granted' | 'denied' | 'blocked'>('checking');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    setIsLoading(true);
    const cameraPermission = Platform.select({
      ios: PERMISSIONS.IOS.CAMERA,
      android: PERMISSIONS.ANDROID.CAMERA,
    });

    const galleryPermission = Platform.select({
      ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
      android: Number(Platform.Version) >= 33
        ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
        : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
    });

    if (!cameraPermission || !galleryPermission) return;

    const cameraResult = await check(cameraPermission);
    const galleryResult = await check(galleryPermission);

    if (cameraResult === RESULTS.GRANTED) {
      setPermissionStatus('granted');
      navigation.navigate('Home');
    } else if (cameraResult === RESULTS.BLOCKED) {
      setIsLoading(false);
      setPermissionStatus('blocked');
    } else {
      setIsLoading(false);
      setPermissionStatus('denied');
    }
  };

  const handleRequestPermission = async () => {
    const cameraPermission = Platform.select({
      ios: PERMISSIONS.IOS.CAMERA,
      android: PERMISSIONS.ANDROID.CAMERA,
    });

    const galleryPermission = Platform.select({
      ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
      android: Number(Platform.Version) >= 33
        ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
        : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
    });

    if (!cameraPermission || !galleryPermission) return;

    const cameraResult = await request(cameraPermission);

    if (cameraResult === RESULTS.GRANTED) {
      setPermissionStatus('granted');
    } else if (cameraResult === RESULTS.BLOCKED) {
      setPermissionStatus('blocked');
      handleOpenSettings();
    } else {
      setPermissionStatus('denied');
      handleOpenSettings();
    }
  };

  const handleOpenSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  if (isLoading) {
    return (
      <LinearGradient
        colors={['#9A4DD0', '#280061', '#020105']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#9A4DD0', '#280061', '#020105']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <View style={styles.content}>
        <CameraIcon width={100} height={100} color="#FFFFFF" />
        <Text style={styles.title}>Permission Required</Text>
        <Text style={styles.description}>
          Camera and gallery access is required.{'\n'}
          Please allow permissions to take and select photos.
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleRequestPermission}
        >
          <Text style={styles.buttonText}>Allow Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={handleOpenSettings}
        >
          <Text style={styles.settingsButtonText}>Change in Settings</Text>
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#9A4DD0',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  settingsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Permission;
