import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  NativeModules,
  Platform,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';
import auth from '@react-native-firebase/auth';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {RouteProp} from '@react-navigation/native';
import {AppUsage, UsageData, TimeSlotUsage} from '../types/usage';
import firestore from '@react-native-firebase/firestore';
import DeviceInfo from 'react-native-device-info';
import {Device} from '../types/device';
import {DeviceManager} from '../utils/device';
import {Usage} from '../types/database';

const {UsageStatsModule} = NativeModules;

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ChildDashboard'>;
  route: RouteProp<RootStackParamList, 'ChildDashboard'>;
};

interface DetailedAppUsage extends AppUsage {
  firstTimeStamp: number;
  lastTimeStamp: number;
}

const ProgressBar = ({
  progress,
  color = '#4A90E2',
}: {
  progress: number;
  color?: string;
}) => (
  <View style={styles.progressBarContainer}>
    <View
      style={[
        styles.progressBar,
        {width: `${Math.min(progress, 100)}%`, backgroundColor: color},
      ]}
    />
  </View>
);

const ChildDashboardScreen = ({navigation}: Props) => {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [detailedUsage, setDetailedUsage] = useState<DetailedAppUsage[]>([]);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');
  const [updateCount, setUpdateCount] = useState<number>(0);

  const checkPermission = async () => {
    if (Platform.OS !== 'android') return;
    try {
      console.log('권한 확인 시작');
      const result = await UsageStatsModule.checkPermission();
      console.log('권한 상태:', result);
      setHasPermission(result);

      if (result) {
        fetchUsageStats();
      } else {
        ToastAndroid.show(
          '앱 사용량 통계를 보려면 권한이 필요합니다',
          ToastAndroid.SHORT,
        );
        requestPermission();
      }
    } catch (error) {
      console.error('권한 확인 오류:', error);
    }
  };

  const updateFirebaseUsageData = async (data: UsageData) => {
    try {
      const userId = auth().currentUser?.uid;
      const deviceInfo = await DeviceManager.getDeviceInfo();
      const deviceId = deviceInfo.id;
      const today = new Date().toISOString().split('T')[0];

      // Validate required data
      if (!deviceId || !today) {
        throw new Error('Required data missing');
      }

      // Clean and validate app usage data
      const validAppUsage = data.appUsage
        .filter(app => app.packageName && app.appName && app.usageTime >= 0)
        .map(app => ({
          appId: app.appId || app.packageName,
          packageName: app.packageName,
          appName: app.appName,
          usageTime: app.usageTime || 0,
          timeLimit: app.timeLimit || 120,
          category: app.category || 'unknown',
          startTime: firestore.Timestamp.fromMillis(
            app.firstTimeStamp || Date.now(),
          ),
          endTime: firestore.Timestamp.fromMillis(
            app.lastTimeStamp || Date.now(),
          ),
        }));

      const usageDoc: Usage = {
        childId: userId || deviceId, // Fallback to deviceId if no userId
        deviceId,
        date: today,
        totalUsage: data.totalUsage || 0,
        totalLimit: data.totalLimit || 480,
        appUsage: validAppUsage,
        timeSlotUsage:
          data.timeSlotUsage ||
          Array.from({length: 24}, (_, i) => ({
            hour: i,
            usage: 0,
          })),
        lastUpdated: firestore.Timestamp.now(),
      };

      await firestore()
        .collection('usage')
        .doc(`${deviceId}_${today}`)
        .set(usageDoc);
    } catch (error) {
      console.error('Firebase 데이터 업데이트 실패:', error);
      throw error; // Re-throw to handle in calling function
    }
  };

  interface UsageStats {
    packageName: string;
    totalTimeInForeground: number;
    firstTimeStamp: number;
    lastTimeStamp: number;
  }

  const fetchUsageStats = async () => {
    if (!hasPermission || Platform.OS !== 'android') return;

    try {
      console.log('데이터 업데이트 시작:', new Date().toLocaleTimeString());
      setLoading(true);

      const stats = (await UsageStatsModule.getUsageStats(1)) as UsageStats[];
      console.log('원본 통계 데이터:', stats?.length, '개 앱');

      const deviceInfo = await DeviceManager.getDeviceInfo();
      const deviceId = deviceInfo.id;

      const statsWithDetails = await Promise.all(
        (stats || [])
          .filter((stat): stat is UsageStats => Boolean(stat?.packageName))
          .map(async stat => {
            try {
              const appName =
                (await UsageStatsModule.getAppName(stat.packageName)) ||
                stat.packageName;
              const usageMinutes = Math.floor(
                (stat.totalTimeInForeground || 0) / (1000 * 60),
              );

              return {
                appId: stat.packageName,
                appName,
                packageName: stat.packageName,
                usageTime: usageMinutes || 0,
                timeLimit: 120,
                category: 'unknown',
                firstTimeStamp: stat.firstTimeStamp || Date.now(),
                lastTimeStamp: stat.lastTimeStamp || Date.now(),
              } as AppUsage;
            } catch (err) {
              console.error('앱 정보 처리 오류:', stat.packageName, err);
              return null;
            }
          }),
      );

      const validStats = statsWithDetails.filter(
        (stat): stat is AppUsage => stat !== null,
      );
      const sortedStats = validStats.sort((a, b) => b.usageTime - a.usageTime);

      const totalUsage = validStats.reduce(
        (sum, app) => sum + app.usageTime,
        0,
      );

      const newUsageData: UsageData = {
        id: deviceId,
        childId: deviceId,
        date: new Date().toISOString().split('T')[0],
        totalUsage,
        totalLimit: 480,
        appUsage: sortedStats,
        timeSlotUsage: Array.from({length: 24}, (_, i) => ({
          hour: i,
          usage: 0,
        })),
      };

      const firebaseDoc = {
        ...newUsageData,
        lastUpdated: firestore.Timestamp.now(),
        deviceId,
        appUsage: sortedStats.map(app => ({
          ...app,
          startTime: firestore.Timestamp.fromMillis(app.firstTimeStamp),
          endTime: firestore.Timestamp.fromMillis(app.lastTimeStamp),
        })),
      };

      await firestore()
        .collection('usage')
        .doc(`${deviceId}_${newUsageData.date}`)
        .set(firebaseDoc);

      setUsageData(newUsageData);
      setDetailedUsage(sortedStats);
      setTimeLeft(Math.max(0, 480 - totalUsage));
      setLastUpdateTime(new Date().toLocaleTimeString());
      setUpdateCount(prev => prev + 1);
    } catch (error) {
      console.error('사용 통계 가져오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('컴포넌트 마운트, 초기 설정 시작');

    const initialize = async () => {
      await checkPermission();
    };

    initialize();

    const interval = setInterval(() => {
      console.log('정기 업데이트 시작:', new Date().toLocaleTimeString());
      if (hasPermission) {
        fetchUsageStats();
      }
    }, 60000);

    return () => {
      console.log('컴포넌트 언마운트, 인터벌 정리');
      clearInterval(interval);
    };
  }, [hasPermission]);

  const formatTimeRange = (start: number, end: number): string => {
    const formatTime = (timestamp: number) =>
      new Date(timestamp).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  const getTimeStatus = () => {
    if (!usageData) return '데이터 로딩 중...';
    const percentage = (usageData.totalUsage / usageData.totalLimit) * 100;
    if (percentage >= 100) return '오늘 사용 시간이 모두 소진되었어요!';
    if (percentage >= 80) return '사용 시간이 얼마 남지 않았어요!';
    return '오늘도 스마트한 하루 보내세요!';
  };
  const requestPermission = (): void => {
    if (Platform.OS === 'android') {
      UsageStatsModule.openUsageSettings();
    }
  };

  const handleLogout = async () => {
    navigation.replace('SelectType');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>스마트폰 사용 관리</Text>
        {!hasPermission && (
          <View style={styles.permissionCard}>
            <Text style={styles.permissionText}>
              앱 사용량 통계를 보려면 권한이 필요합니다
            </Text>
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={requestPermission}>
              <Text style={styles.permissionButtonText}>권한 설정하기</Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            Alert.alert('로그아웃', '로그아웃 하시겠습니까?', [
              {text: '취소', style: 'cancel'},
              {text: '확인', onPress: handleLogout},
            ]);
          }}>
          <MaterialIcons name="logout" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeText}>{getTimeStatus()}</Text>
          {lastUpdateTime && (
            <Text style={styles.updateTimeText}>
              마지막 업데이트: {lastUpdateTime} (총 {updateCount}회)
            </Text>
          )}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#2196F3" />
              <Text style={styles.loadingText}>데이터 업데이트 중...</Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>오늘의 사용 시간</Text>
          <Text style={styles.usageTime}>
            {Math.floor((usageData?.totalUsage || 0) / 60)}시간{' '}
            {(usageData?.totalUsage || 0) % 60}분
            <Text style={styles.usageTimeLimit}>
              {' '}
              / {Math.floor((usageData?.totalLimit || 0) / 60)}시간
            </Text>
          </Text>
          <ProgressBar
            progress={
              ((usageData?.totalUsage || 0) / (usageData?.totalLimit || 1)) *
              100
            }
          />
          <Text style={styles.timeLeftText}>
            남은 시간: {Math.floor(timeLeft / 60)}시간 {timeLeft % 60}분
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>앱별 사용 시간</Text>
          {detailedUsage.map((app, index) => (
            <View key={index} style={styles.appUsageItem}>
              <View style={styles.appInfoRow}>
                <MaterialIcons
                  name="android"
                  size={24}
                  color="#8CD9F0"
                  style={styles.appIcon}
                />
                <View style={styles.appInfoContainer}>
                  <Text style={styles.appName}>{app.appName}</Text>
                  <Text style={styles.timeRange}>
                    {formatTimeRange(app.firstTimeStamp, app.lastTimeStamp)}
                  </Text>
                </View>
                <Text style={styles.timeText}>
                  {Math.floor(app.usageTime / 60)}:
                  {String(app.usageTime % 60).padStart(2, '0')}
                </Text>
              </View>
              <ProgressBar
                progress={(app.usageTime / app.timeLimit) * 100}
                color="#8CD9F0"
              />
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
          <MaterialIcons name="home" size={24} color="#8CD9F0" />
          <Text style={[styles.navText, styles.navTextActive]}>홈</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="bar-chart" size={24} color="#666" />
          <Text style={styles.navText}>통계</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="settings" size={24} color="#666" />
          <Text style={styles.navText}>설정</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8CD9F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  iconButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 20,
    padding: 16,
  },
  welcomeCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 16,
    color: '#2196F3',
    textAlign: 'center',
    fontWeight: '500',
  },
  updateTimeText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#2196F3',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  usageTime: {
    fontSize: 24,
    fontWeight: '500',
    marginBottom: 12,
    color: '#333',
  },
  usageTimeLimit: {
    color: '#666',
    fontSize: 18,
    fontWeight: 'normal',
  },
  timeLeftText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
    marginTop: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  appUsageItem: {
    marginBottom: 16,
  },
  appInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  appIcon: {
    marginRight: 8,
  },
  appInfoContainer: {
    flex: 1,
  },
  appName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  timeRange: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  timeText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingVertical: 10,
  },
  navItem: {
    alignItems: 'center',
    padding: 8,
  },
  navItemActive: {
    // 활성 탭 스타일
  },
  navText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  navTextActive: {
    color: '#8CD9F0',
  },
  permissionCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  permissionText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  permissionButton: {
    backgroundColor: '#8CD9F0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ChildDashboardScreen;
