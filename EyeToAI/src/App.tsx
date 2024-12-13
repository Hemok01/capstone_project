import 'react-native-gesture-handler';
import React, {useEffect, useState, createContext, useContext} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import Toast from 'react-native-toast-message';
import RootNavigator from '@navigation/RootNavigator';
import {FCMService} from './services/FCMService';

export const AuthContext = createContext<{
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
  logout: () => void;
}>({
  user: null,
  loading: true,
  logout: () => {},
});

const App = () => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = () => {
      const unsubscribeAuth = auth().onAuthStateChanged(currentUser => {
        setUser(currentUser);
        setLoading(false);

        // FCM 초기화
        if (currentUser) {
          if (__DEV__) {
            const fcmService = new FCMService({userId: currentUser.uid});
            fcmService.init();
          }
        }
      });

      return () => unsubscribeAuth();
    };

    initializeAuth();
  }, []);

  const logout = async () => {
    await auth().signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{user, loading, logout}}>
      <SafeAreaProvider>
        <RootNavigator />
        <Toast />
      </SafeAreaProvider>
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default App;
