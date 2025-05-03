import { createStackNavigator } from '@react-navigation/stack';
import { Home, Permission } from '@/screens';
import LinearGradient from 'react-native-linear-gradient';
import { useLayoutEffect, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { RESULTS, PERMISSIONS, check } from 'react-native-permissions';

const Stack = createStackNavigator();

export default function StackNavigation() {
    const [permissionStatus, setPermissionStatus] = useState<'checking' | 'granted' | 'denied' | 'blocked'>('checking');
    const [isLoading, setIsLoading] = useState(true);

    useLayoutEffect(() => {
        checkPermissions();
    }, []);

    const checkPermissions = async () => {
        setIsLoading(true);
        const cameraPermission = Platform.select({
            ios: PERMISSIONS.IOS.CAMERA,
            android: PERMISSIONS.ANDROID.CAMERA,
        });

        if (!cameraPermission) return;

        const cameraResult = await check(cameraPermission);

        if (cameraResult === RESULTS.GRANTED) {
            setPermissionStatus('granted');
        } else if (cameraResult === RESULTS.BLOCKED) {
            setIsLoading(false);
            setPermissionStatus('blocked');
        } else {
            setIsLoading(false);
            setPermissionStatus('denied');
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
        <Stack.Navigator
            initialRouteName={permissionStatus === 'granted' ? 'Home' : 'Permission'}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="Permission" component={Permission} />
            <Stack.Screen name="Home" component={Home} />
        </Stack.Navigator>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
