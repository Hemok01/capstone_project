import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';

import SelectTypeScreen from '../screens/SelectTypeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ParentDashboardScreen from '../screens/ParentDashboardScreen';
import ChildDashboardScreen from '../screens/ChildDashboardScreen';
import FamilyProfileScreen from '../screens/FamilyProfile';
import QRCodeScreen from '../screens/QRCodeScreen';
import QRScanScreen from '../screens/QRScanScreen';
import UsageReportScreen from '../screens/UsageReportScreen';
import {RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import FamilyAuthScreen from '../screens/FamilyAuthScreen';
import UsageTrackerTest from '../components/common/UsageTrackerTest';

const Stack = createNativeStackNavigator<RootStackParamList>();

type SignUpScreenProps = {
  route: RouteProp<RootStackParamList, 'SignUp'>;
  navigation: NativeStackNavigationProp<RootStackParamList, 'SignUp'>;
};

const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="SelectType"
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="SelectType" component={SelectTypeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen
          name="ParentDashboard"
          component={ParentDashboardScreen}
        />
        <Stack.Screen name="FamilyAuth" component={FamilyAuthScreen} />

        <Stack.Screen name="ChildDashboard" component={ChildDashboardScreen} />
        <Stack.Screen name="FamilyProfile" component={FamilyProfileScreen} />
        <Stack.Screen name="QRCode" component={QRCodeScreen} />
        <Stack.Screen name="QRScan" component={QRScanScreen} />
        <Stack.Screen
          name="UsageReport"
          component={UsageReportScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen name="UsageTrackerTest" component={UsageTrackerTest} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
