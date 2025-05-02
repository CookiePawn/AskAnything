import { CameraIcon } from '@/assets';
import React, { useEffect, useState } from 'react';
import { View, Text, Platform, Linking, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const Permission = () => {
  const [permissionStatus, setPermissionStatus] = useState<'checking' | 'granted' | 'denied' | 'blocked'>('checking');

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
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
    } else if (cameraResult === RESULTS.BLOCKED) {
      setPermissionStatus('blocked');
    } else {
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

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* <CameraIcon width={100} height={100} /> */}
        <Text style={styles.title}>권한이 필요합니다</Text>
        <Text style={styles.description}>
          카메라와 갤러리 접근 권한이 필요합니다.{'\n'}
          사진 촬영과 선택을 위해 권한을 허용해주세요.
        </Text>
        {permissionStatus === 'denied' && (
          <TouchableOpacity 
            style={styles.button}
            onPress={handleRequestPermission}
          >
            <Text style={styles.buttonText}>권한 허용하기</Text>
          </TouchableOpacity>
        )}
        {(permissionStatus === 'blocked' || permissionStatus === 'denied') && (
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={handleOpenSettings}
          >
            <Text style={styles.settingsButtonText}>설정에서 변경하기</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  settingsButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Permission;
