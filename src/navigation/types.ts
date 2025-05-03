import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Permission: undefined;
  Home: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
} 