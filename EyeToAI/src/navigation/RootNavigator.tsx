//src/navigation/Rootnavigator.tsx

import React, {FC} from 'react';
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
import ReportScreen from '../screens/ReportScreen';
import {RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import FamilyAuthScreen from '../screens/FamilyAuthScreen';
import UsageTrackerTest from '../components/common/UsageTrackerTest';
import TimeManagementScreen from '../screens/TimeManagementScreen';
import AppTimeLimitScreen from '../screens/AppTimeLimitScreen';
import TotalTimeLimitScreen from '../screens/TotalTimeLimitScreen';
import WeeklyTimeLimitScreen from '../screens/WeeklyTimeLimitScreen';
import DayTimeLimitScreen from '../screens/DayTimeLimitScreen';
import SleepTimeLimitScreen from '../screens/SleepTimeLimitScreen';
import SelfEvaluationScreen from '../screens/SelfEvaluation';
import LifePatternComicScreen from '../screens/LifePatternComicScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

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
        <Stack.Screen name="Report" component={ReportScreen} />
        <Stack.Screen
          name="LifePatternComic"
          component={LifePatternComicScreen}
        />

        <Stack.Screen name="SleepTimeLimit" component={SleepTimeLimitScreen} />
        <Stack.Screen name="ChildDashboard" component={ChildDashboardScreen} />
        <Stack.Screen name="FamilyProfile" component={FamilyProfileScreen} />
        <Stack.Screen name="QRCode" component={QRCodeScreen} />
        <Stack.Screen name="QRScan" component={QRScanScreen} />
        <Stack.Screen name="SelfEvaluation" component={SelfEvaluationScreen} />

        <Stack.Screen name="TimeManagement" component={TimeManagementScreen} />
        <Stack.Screen name="AppTimeLimit" component={AppTimeLimitScreen} />
        <Stack.Screen name="TotalTimeLimit" component={TotalTimeLimitScreen} />
        <Stack.Screen
          name="WeeklyTimeLimit"
          component={WeeklyTimeLimitScreen}
        />
        <Stack.Screen name="DayTimeLimit" component={DayTimeLimitScreen} />

        <Stack.Screen name="UsageTrackerTest" component={UsageTrackerTest} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
