import 'react-native-gesture-handler';
import React, {useEffect} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import UsageReportScreen from './screens/UsageReportScreen'; // UsageReport 스크린 import
import RootNavigator from '@navigation/RootNavigator';
import {AuthProvider} from '../src/contexts/AuthContext';
import AuthNavigator from '../src/navigation/AuthNavigator';

const App = () => {
  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        if (firebase.apps.length === 0) {
          await firebase.initializeApp({
            apiKey: 'AIzaSyAEkJGdvEOCHceuGTiAKWbB_-KepA-RWZo',
            appId: '1:598185887142:android:d5e9a9b3ed2d14caf9fb67',
            projectId: 'eyetoai',
            storageBucket: 'eyetoai.appspot.com',
            messagingSenderId: '598185887142',
          });

          // Firestore 연결 테스트
          try {
            await firestore().collection('test').doc('test').get();
            console.log('Firestore connection successful');
          } catch (firestoreError) {
            console.error('Firestore connection test failed:', firestoreError);
          }
        }
      } catch (error) {
        console.error('Firebase initialization error:', error);
      }
    };

    initializeFirebase();
  }, []);

  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
};

export default App;
