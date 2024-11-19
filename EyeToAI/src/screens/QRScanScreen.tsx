import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Text,
  ActivityIndicator,
  ImageStyle,
  TouchableOpacity,
} from 'react-native';
import {CameraScreen, CameraType} from 'react-native-camera-kit';
import {Header} from '../components/common/Header';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {Platform} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {DeviceManager} from '../utils/device';
import auth from '@react-native-firebase/auth';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'QRScan'>;
};

const QRScanScreen = ({navigation}: Props) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingCode, setIsProcessingCode] = useState(false);

  const defaultImageStyle: ImageStyle = {
    width: 35,
    height: 35,
  };

  useEffect(() => {
    requestCameraPermission();
    // 테스트 코드 생성 함수 호출
    createTestConnectionCode;
  }, []);

  // 테스트용 코드 생성 함수
  const createTestConnectionCode = async () => {
    try {
      const testCode = 'TEST123';
      const parentId = 'w6j49nvFOYYp4dHVWlWij3QtK7u1';
      const deviceInfo = await DeviceManager.getDeviceInfo();

      if (!deviceInfo) {
        throw new Error('기기 정보를 가져올 수 없습니다');
      }

      await firestore()
        .collection('connectionCodes')
        .doc(testCode)
        .set({
          parentId,
          createdAt: firestore.FieldValue.serverTimestamp(),
          expiresAt: new Date(Date.now() + 300000),
          isUsed: false,
          isExpired: false,
          deviceIds: [],
          maxDevices: 5,
        });

      console.log('Test connection code created successfully');
    } catch (error) {
      console.error('Error:', error);
      Alert.alert(
        '연결 실패',
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다',
      );
    }
  };
  const requestCameraPermission = async () => {
    try {
      const permission = Platform.select({
        ios: PERMISSIONS.IOS.CAMERA,
        android: PERMISSIONS.ANDROID.CAMERA,
      });

      if (!permission) {
        throw new Error('Platform not supported');
      }

      const result = await request(permission);
      setHasPermission(result === RESULTS.GRANTED);
      setIsLoading(false);

      if (result !== RESULTS.GRANTED) {
        Alert.alert('권한 거부', '카메라 권한이 필요합니다.', [
          {text: '확인', onPress: () => navigation.goBack()},
        ]);
      }
    } catch (err) {
      console.warn(err);
      Alert.alert('에러', '카메라 권한 확인 중 오류가 발생했습니다');
      setIsLoading(false);
    }
  };
  // QRScanScreen.tsx 수정사항
  // QRScanScreen.tsx
  const processConnectionCode = async (code: string) => {
    if (isProcessingCode) return;

    try {
      setIsProcessingCode(true);
      const deviceInfo = await DeviceManager.getDeviceInfo();

      if (!deviceInfo || !code) {
        throw new Error('필수 데이터가 누락되었습니다');
      }

      const codeDoc = await firestore()
        .collection('connectionCodes')
        .doc(code)
        .get();

      if (!codeDoc.exists || !codeDoc.data()?.parentId) {
        throw new Error('유효하지 않은 QR 코드입니다');
      }

      navigation.replace('SignUp', {
        userType: 'child',
        deviceId: deviceInfo.id,
        connectionCode: code,
        parentId: codeDoc.data()?.parentId,
      });
    } catch (error) {
      console.error('QR Error:', error);
      Alert.alert(
        'QR 코드 처리 실패',
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다',
      );
    } finally {
      setIsProcessingCode(false);
    }
  };

  const onCodeScanned = (event: any) => {
    /*
    // 실제 운영 코드
    const scannedCode = event.nativeEvent.codeStringValue;
    if (scannedCode) {
      processConnectionCode(scannedCode);
    }
    */
    // 테스트용 코드 - 실제 운영에서는 주석 처리
    processConnectionCode('TEST1243');
  };

  if (isLoading || !hasPermission) {
    return (
      <View style={styles.container}>
        <Header title="QR 코드 스캔" onBack={() => navigation.goBack()} />
        <View style={styles.permissionContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.permissionText}>
            {isLoading ? '카메라 초기화 중...' : '카메라 권한 요청 중...'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="QR 코드 스캔" onBack={() => navigation.goBack()} />

      {/* 테스트 버튼 추가 */}
      <TouchableOpacity
        style={styles.testButton}
        onPress={() => {
          console.log('Test button pressed');
          processConnectionCode('TEST123');
        }}>
        <Text style={styles.buttonText}>테스트 코드 실행</Text>
      </TouchableOpacity>

      <View style={styles.cameraContainer}>
        <CameraScreen
          allowCaptureRetake={false}
          cameraRatioOverlay={undefined}
          captureButtonImage={null}
          captureButtonImageStyle={defaultImageStyle}
          cameraFlipImage={null}
          cameraFlipImageStyle={defaultImageStyle}
          hideControls={true}
          showFrame={true}
          scanBarcode={true}
          laserColor="red"
          frameColor="white"
          torchOnImage={null}
          torchOffImage={null}
          torchImageStyle={defaultImageStyle}
          onReadCode={onCodeScanned}
          onBottomButtonPressed={() => {}}
          focusMode="on"
          zoomMode="on"
          ratioOverlay="none"
          ratioOverlayColor="transparent"
          showCapturedImageCount={false}
        />
      </View>
      <View style={styles.overlay}>
        {isProcessingCode ? (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.guideText}>QR 코드 처리 중...</Text>
          </View>
        ) : (
          <Text style={styles.guideText}>
            QR 코드를 스캔 영역 안에 위치시켜 주세요
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cameraContainer: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 5,
    gap: 10,
  },
  guideText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 5,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  testButton: {
    position: 'absolute',
    top: 100, // Header 아래에 위치
    right: 20,
    backgroundColor: '#AFE3F0',
    padding: 15,
    borderRadius: 8,
    zIndex: 999, // 카메라 위에 표시되도록
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default QRScanScreen;
