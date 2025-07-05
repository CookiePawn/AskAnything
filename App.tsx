import StackNavigation from '@/navigation/StackNavigation';
import { NavigationContainer } from '@react-navigation/native';
import { useCheckVersion } from '@/hooks';
import { CustomAlert } from '@/components';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const App = () => {
  const { alertVisible, handleUpdate, handleClose } = useCheckVersion();

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <NavigationContainer>
          <StackNavigation />
          {alertVisible && (
            <CustomAlert
              visible={alertVisible}
              title="New Version Available"
              message="Update now?"
              buttons={[
                { text: '예', onPress: handleUpdate, style: 'default' },
                { text: '아니요', onPress: handleClose, style: 'cancel' },
              ]}
            />
          )}
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default App;
