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

      await firestore().collection('connections').doc().set({
        parentId,
        status: 'pending',
        lastSync: firestore.FieldValue.serverTimestamp(),
        deviceId: null, // 아직 연결되지 않은 상태
      });

      console.log('Test connection created');
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

  const processConnectionCode = async (code: string) => {
    if (isProcessingCode) return;

    setIsProcessingCode(true); // 로딩 상태 설정
    try {
      const deviceInfo = await DeviceManager.getDeviceInfo();
      console.log('Device Info:', deviceInfo);

      const parentId = 'whHjZw7lAFcwnoBX9ei9JospP8J2'; // 부모 ID (테스트용)

      // Firestore 업데이트: devices 컬렉션
      await firestore().collection('devices').doc(deviceInfo.deviceId).set({
        name: deviceInfo.name,
        status: 'active',
        lastActive: firestore.FieldValue.serverTimestamp(),
      });

      console.log('Device registered in Firestore');

      // Firestore 생성 및 업데이트: connections 컬렉션
      const connectionRef = firestore().collection('connections').doc(code);
      const connectionDoc = await connectionRef.get();

      if (!connectionDoc.exists) {
        // QR 코드 데이터 기반 connections 문서 생성
        await connectionRef.set({
          parentId, // 부모 ID
          deviceId: deviceInfo.deviceId,
          status: 'connected',
          createdAt: firestore.FieldValue.serverTimestamp(),
          lastSync: firestore.FieldValue.serverTimestamp(),
        });
        console.log('New connection created in Firestore');
      } else {
        // 기존 문서가 존재할 경우 업데이트
        await connectionRef.update({
          deviceId: deviceInfo.deviceId,
          status: 'connected',
          lastSync: firestore.FieldValue.serverTimestamp(),
        });
        console.log('Existing connection updated in Firestore');
      }

      // 네비게이션 이동
      navigation.replace('SignUp', {
        userType: 'child',
        deviceId: deviceInfo.deviceId,
        parentId,
      });
    } catch (error) {
      console.error('Error in processConnectionCode:', error);
      Alert.alert(
        'QR 코드 처리 실패',
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다',
      );
    } finally {
      setIsProcessingCode(false); // 로딩 상태 해제
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
