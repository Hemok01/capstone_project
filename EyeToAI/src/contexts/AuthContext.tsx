// src/contexts/AuthContext.tsx
import React, {createContext, useState, useContext, useEffect} from 'react';
import auth from '@react-native-firebase/auth';
import {checkConnection} from '../utils/authCheck';
import firestore from '@react-native-firebase/firestore';

type AuthContextType = {
  user: any | null;
  userType: 'parent' | 'child' | null;
  isConnected: boolean;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  userType: null,
  isConnected: false,
  loading: true,
});

export const AuthProvider = ({children}: {children: React.ReactNode}) => {
  const [user, setUser] = useState<any | null>(null);
  const [userType, setUserType] = useState<'parent' | 'child' | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(async user => {
      setUser(user);
      if (user) {
        // userType 확인
        const userDoc = await firestore()
          .collection('users')
          .doc(user.uid)
          .get();
        setUserType(userDoc.data()?.type || null);

        // 자녀인 경우 연동 상태 확인
        if (userDoc.data()?.type === 'child') {
          const connected = await checkConnection(user.uid);
          setIsConnected(connected);
        }
      }
      setLoading(false);
    });

    return subscriber;
  }, []);

  return (
    <AuthContext.Provider value={{user, userType, isConnected, loading}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
