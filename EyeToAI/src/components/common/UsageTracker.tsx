// UsageTracker.tsx
import React, {useEffect} from 'react';
import {NativeModules, Platform, Alert, PermissionsAndroid} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {format} from 'date-fns';

interface UsageTrackerProps {
  childId: string;
}

const UsageTracker: React.FC<UsageTrackerProps> = ({childId}) => {
  const requestUsageStatsPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.PACKAGE_USAGE_STATS,
        {
          title: '사용 시간 접근 권한',
          message: '앱 사용 시간을 측정하기 위해 권한이 필요합니다.',
          buttonNeutral: '나중에 묻기',
          buttonNegative: '거부',
          buttonPositive: '허용',
        },
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Usage stats permission granted');
        return true;
      } else {
        console.log('Usage stats permission denied');
        // 설정으로 이동하는 옵션 제공
        Alert.alert(
          '권한 필요',
          '앱 사용 시간 측정을 위해서는 설정에서 권한을 허용해주세요.',
          [
            {
              text: '설정으로 이동',
              onPress: () => NativeModules.UsageStats.openUsageAccessSettings(),
            },
            {
              text: '취소',
              style: 'cancel',
            },
          ],
        );
        return false;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const checkPermissionAndCollectData = async () => {
    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.PACKAGE_USAGE_STATS,
    );

    if (!hasPermission) {
      const granted = await requestUsageStatsPermission();
      if (!granted) return;
    }

    // 권한이 있는 경우 데이터 수집 시작
    startDataCollection();
  };

  const startDataCollection = async () => {
    try {
      const usageStats = await NativeModules.UsageStats.getStats();
      if (usageStats) {
        await uploadToFirebase(usageStats);
      }
    } catch (error) {
      console.error('Error collecting data:', error);
    }
  };

  const uploadToFirebase = async (usageStats: any) => {
    const today = format(new Date(), 'yyyyMMdd');
    try {
      await firestore()
        .collection('usages')
        .doc(childId)
        .collection('daily')
        .doc(today)
        .set(
          {
            data: firestore.FieldValue.arrayUnion({
              ...usageStats,
              timestamp: new Date().toISOString(),
            }),
          },
          {merge: true},
        );
    } catch (error) {
      console.error('Error uploading to Firebase:', error);
    }
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      checkPermissionAndCollectData();
    }
  }, [childId]);

  return null;
};

export default UsageTracker;
