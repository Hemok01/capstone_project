import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';
import {Header} from '../components/common/Header';
import {RouteProp} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'QRCode'>;
  route: RouteProp<RootStackParamList, 'QRCode'>;
};

const QRCodeScreen = ({navigation}: Props) => {
  const [connectionCode, setConnectionCode] = useState<string>('');
  const [qrError, setQrError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const generateAndStoreConnectionCode = async () => {
    try {
      setIsLoading(true);
      setQrError(false);

      const parentId = auth().currentUser?.uid;
      if (!parentId) throw new Error('사용자 인증 정보가 없습니다.');

      const timestamp = new Date().getTime().toString();
      const random = Math.random().toString(36).substring(2, 6);
      const newCode = `${random}${timestamp.slice(-4)}`.toUpperCase();

      const docRef = firestore().collection('connectionCodes').doc(newCode);
      await docRef.set({
        parentId,
        createdAt: firestore.FieldValue.serverTimestamp(),
        expiresAt: new Date(Date.now() + 30000),
        isUsed: false,
        isExpired: false,
        deviceIds: [],
        maxDevices: 5,
      });

      setConnectionCode(newCode);
      setErrorMessage('');
    } catch (error) {
      console.error('Error:', error);
      setQrError(true);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 컴포넌트 마운트 시 초기 코드 생성
    generateAndStoreConnectionCode();

    // 30초마다 새로운 코드 생성
    const timer = setInterval(generateAndStoreConnectionCode, 30000);

    // Cleanup
    return () => {
      clearInterval(timer);
      if (connectionCode) {
        firestore()
          .collection('connectionCodes')
          .doc(connectionCode)
          .update({
            isExpired: true,
            expiredAt: firestore.FieldValue.serverTimestamp(),
          })
          .catch(console.error);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <Header title="가족 인증" onBack={() => navigation.goBack()} />

      <View style={styles.qrContainer}>
        <View style={styles.qrCode}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : connectionCode ? (
            <QRCode value={connectionCode} size={200} />
          ) : (
            <Text style={styles.errorMessage}>
              QR 코드를 생성할 수 없습니다.
            </Text>
          )}
        </View>

        <Text style={styles.code}>
          {isLoading ? '코드 생성 중...' : connectionCode}
        </Text>

        <Text style={styles.qrDescription}>
          자녀 폰에서 QR코드를 스캔해주세요{'\n'}
          코드는 30초마다 갱신됩니다
        </Text>

        {qrError && (
          <Text style={styles.errorText}>
            {errorMessage || 'QR 코드 생성 중 오류가 발생했습니다.'}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  qrContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  qrCode: {
    width: 240,
    height: 240,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  code: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    letterSpacing: 2,
  },
  qrDescription: {
    marginTop: 24,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
    padding: 20,
  },
  errorMessage: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default QRCodeScreen;
