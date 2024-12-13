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
  ToastAndroid,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';
import {RouteProp} from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {AppUsage, UsageData} from '../types/usage';
import {AppState} from 'react-native';
import DonutChart from '../components/common/DonutChart';
import ProfileCard from '../components/common/ProfileCard';

const {UsageModule} = NativeModules;

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ChildDashboard'>;
  route: RouteProp<RootStackParamList, 'ChildDashboard'>;
};

interface DetailedAppUsage extends AppUsage {
  firstTimeStamp: number;
  lastTimeStamp: number;
  appName: string;
  category: string;
  packageName: string;
  usageTime: number;
}

const getAppCategory = (categoryIndex: number | string): string => {
  const categories: {[key: string]: string} = {
    '-1': '시스템',
    '0': 'Undefined',
    '1': '게임',
    '2': '소통',
    '3': '다중매체',
    '4': '뉴스',
    '5': '소셜',
    '6': '생산성',
    '7': '브라우저',
    '8': '사진',
  };

  const key = categoryIndex.toString();
  return categories[key] || 'Unknown';
};

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

const ChildDashboardScreen = ({navigation, route}: Props) => {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [appUsages, setAppUsages] = useState<DetailedAppUsage[]>([]);
  const [hasPermission, setHasPermission] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  const checkPermission = async () => {
    if (Platform.OS !== 'android') return;
    try {
      console.log('권한 확인 시작');
      const result = await UsageModule.checkPermission();
      console.log('권한 상태:', result);
      setHasPermission(result);

      if (result) {
        fetchUsageStats();
        fetchAppUsages();
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

  const fetchAppUsages = async () => {
    try {
      const stats = await UsageModule.getUsageStats(1);
      const processedStats = await UsageModule.processUsageStats(stats);
      setAppUsages(processedStats);
    } catch (error) {
      console.error('앱 사용시간 데이터 가져오기 실패:', error);
    }
  };

  const fetchUsageStats = async () => {
    if (!hasPermission || Platform.OS !== 'android') {
      console.log('권한 없음 또는 Android 아님');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const data = await UsageModule.getUsageByDate(today);
      if (data) {
        setUsageData({
          totalUsage: data.usageTime || 0,
          timeLimit: data.timeLimit || 0,
        });
      }
    } catch (error) {
      console.error('사용량 데이터 가져오기 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkPermission();
  }, []);

  useEffect(() => {
    if (!hasPermission) return;

    const fetchData = async () => {
      await Promise.all([fetchUsageStats(), fetchAppUsages()]);
      setTimeout(fetchData, 6000);
    };

    fetchData();

    return () => {
      // cleanup if needed
    };
  }, [hasPermission]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        checkPermission();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const formatTimeRange = (start: number, end: number): string => {
    const formatTime = (timestamp: number) =>
      new Date(timestamp).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  const requestPermission = () => {
    if (Platform.OS === 'android') {
      UsageModule.openUsageSettings();
      ToastAndroid.show(
        '설정에서 앱 사용 기록 액세스를 활성화해주세요.',
        ToastAndroid.LONG,
      );
    }
  };

  const handleLogout = async () => {
    navigation.replace('SelectType');
  };

  const routineData = [
    {value: 40, color: '#8CD9F0', key: '동영상'},
    {value: 30, color: '#A5D4A7', key: '게임'},
    {value: 20, color: '#FFD700', key: 'SNS'},
    {value: 10, color: '#FFB6C1', key: '기타'},
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>스마트폰 사용 관리</Text>
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
        <ProfileCard deviceId={route.params.deviceId} />

        {/* 오늘의 사용 시간 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>오늘의 사용 시간</Text>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </View>
          <View style={styles.timeInfo}>
            <Text style={styles.timeText}>
              {Math.floor((usageData?.totalUsage || 0) / 60)}시간{' '}
              {(usageData?.totalUsage || 0) % 60}분
            </Text>
            <Text style={styles.remainText}>
              {Math.max(
                0,
                (usageData?.timeLimit || 0) - (usageData?.totalUsage || 0),
              )}
              분 남음
            </Text>
          </View>
          <ProgressBar
            progress={
              ((usageData?.totalUsage || 0) / (usageData?.timeLimit || 1)) * 100
            }
          />
        </View>

        {/* 앱별 사용 시간 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>앱별 사용 시간</Text>
          {appUsages.map((app, index) => (
            <View key={index} style={styles.appUsageItem}>
              <View style={styles.appInfoRow}>
                <MaterialIcons name="android" size={24} color="#8CD9F0" />
                <View style={styles.appInfoContainer}>
                  <Text style={styles.appName}>{app.appName}</Text>
                  <View style={styles.appMetaInfo}>
                    <Text style={styles.categoryText}>
                      {getAppCategory(app.category)}
                    </Text>
                    <Text style={styles.timeRange}>
                      {formatTimeRange(app.firstTimeStamp, app.lastTimeStamp)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.timeText}>
                  {Math.floor(app.usageTime / 60)}:
                  {String(app.usageTime % 60).padStart(2, '0')}
                </Text>
              </View>
              <ProgressBar
                progress={(app.usageTime / (usageData?.timeLimit || 1)) * 100}
                color="#8CD9F0"
              />
            </View>
          ))}
        </View>

        {/* 나의 사용 루틴 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>나의 사용 루틴</Text>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </View>
          <View style={styles.routineContainer}>
            <DonutChart data={routineData} size={120} />
            <View style={styles.legendContainer}>
              {routineData.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, {backgroundColor: item.color}]}
                  />
                  <View style={styles.legendContent}>
                    <Text style={styles.legendLabel}>{item.key}</Text>
                    <Text style={styles.legendValue}>{item.value}%</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
          <MaterialIcons name="home" size={24} color="#8CD9F0" />
          <Text style={[styles.navText, styles.navTextActive]}>홈</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('LifePatternComic')}>
          <MaterialIcons name="bar-chart" size={24} color="#666" />
          <Text style={styles.navText}>만화</Text>
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  remainText: {
    fontSize: 14,
    color: '#666',
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
    marginLeft: 12,
  },
  appName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  appMetaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  timeRange: {
    fontSize: 12,
    color: '#666',
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
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 50,
  },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
  },
  profileText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  evaluationText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    padding: 16,
  },
  routineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  legendContainer: {
    flex: 1,
    marginLeft: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendLabel: {
    fontSize: 14,
    color: '#333',
  },
  legendValue: {
    fontSize: 14,
    color: '#666',
  },
});

export default ChildDashboardScreen;
