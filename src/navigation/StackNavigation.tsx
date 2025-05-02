import { createStackNavigator } from '@react-navigation/stack';
import { Home, Permission } from '@/screens';

const Stack = createStackNavigator();

export default function StackNavigation() {
    return (
        <Stack.Navigator
            initialRouteName="Permission"
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="Permission" component={Permission} />
            <Stack.Screen name="Home" component={Home} />
        </Stack.Navigator>
    );
}
