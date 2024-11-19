// screens/ParentDashboardScreen.tsx
import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Alert,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  AppState,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {PieChart} from 'recharts';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../types/navigation';
import {ConnectCard} from '../components/common/ConnectCard';
import auth from '@react-native-firebase/auth';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {DeviceUsageData} from '../types/database';
import {ParentService} from '../services/parentService';
import firestore from '@react-native-firebase/firestore';
import {User} from '../types/database';
import DonutChart from '../components/common/DonutChart';
import ItoaiHeader from '../assets/icons/itoai-header.svg';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ParentDashboard'>;
  route: RouteProp<RootStackParamList, 'ParentDashboard'>;
};

const ParentDashboardScreen = ({navigation}: Props) => {
  const [deviceData, setDeviceData] = useState<DeviceUsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [childName, setChildName] = useState<string>('');

  // fetchData를 useCallback으로 감싸기
  const fetchData = useCallback(async () => {
    try {
      const parentId = auth().currentUser?.uid;
      if (!parentId) {
        console.log('No parent ID found');
        return;
      }

      const parentDoc = await firestore()
        .collection('users')
        .doc(parentId)
        .get();
      const parentData = parentDoc.data();
      const selectedDeviceId = parentData?.selectedDeviceId;
      const selectedChildName = parentData?.selectedChildName;

      if (selectedDeviceId && selectedChildName) {
        setChildName(selectedChildName);
        const deviceUsageData = await ParentService.fetchDeviceData(
          selectedDeviceId,
        );
        if (deviceUsageData) {
          setDeviceData(deviceUsageData);
        }
      } else {
        setChildName('');
        setDeviceData(null);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const routineData = [
    {value: 40, color: '#8CD9F0', key: '동영상'},
    {value: 30, color: '#A5D4A7', key: '게임'},
    {value: 20, color: '#FFD700', key: 'SNS'},
    {value: 10, color: '#FFB6C1', key: '기타'},
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const parentId = auth().currentUser?.uid;
        if (!parentId) {
          console.log('No parent ID found');
          return;
        }

        // 선택된 디바이스 ID와 자녀 이름 가져오기
        const parentDoc = await firestore()
          .collection('users')
          .doc(parentId)
          .get();
        const parentData = parentDoc.data();
        const selectedDeviceId = parentData?.selectedDeviceId;
        const selectedChildName = parentData?.selectedChildName;

        if (selectedDeviceId && selectedChildName) {
          setChildName(selectedChildName);
          const deviceUsageData = await ParentService.fetchDeviceData(
            selectedDeviceId,
          );
          if (deviceUsageData) {
            setDeviceData(deviceUsageData);
          }
        } else {
          // 선택된 자녀가 없는 경우 상태 초기화
          setChildName('');
          setDeviceData(null);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    // 부모 문서의 변경사항을 감지하는 리스너
    const parentId = auth().currentUser?.uid;
    if (!parentId) return;

    const unsubscribeParent = firestore()
      .collection('users')
      .doc(parentId)
      .onSnapshot(
        doc => {
          console.log('Parent document updated');
          fetchData();
        },
        error => console.error('Parent document listener error:', error),
      );

    // 연결 상태 변경을 감지하는 리스너
    const unsubscribeConnections = firestore()
      .collection('connections')
      .where('parentId', '==', parentId)
      .onSnapshot(
        snapshot => {
          console.log('Connections updated:', snapshot.size);
          fetchData();
        },
        error => console.error('Connections listener error:', error),
      );

    // 컴포넌트 언마운트 시 리스너 해제
    return () => {
      unsubscribeParent();
      unsubscribeConnections();
    };
  }, []); // 빈 의존성 배열로 마운트 시에만 리스너 설정

  // Optional: 앱이 포그라운드로 돌아올 때마다 데이터 새로고침
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        fetchData();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // 프로그레스 바 컴포넌트
  const ProgressBar = ({progress}: {progress: number}) => (
    <View style={styles.progressBarContainer}>
      <View
        style={[styles.progressBar, {width: `${Math.min(progress, 100)}%`}]}
      />
    </View>
  );

  const handleLogout = () => {
    Alert.alert('로그아웃', '로그아웃 하시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {text: '확인', onPress: () => navigation.replace('SelectType')},
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <ItoaiHeader width={100} height={30} />
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="mail-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="notifications-none" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* 프로필 카드 */}
        <TouchableOpacity
          style={styles.profileCard}
          onPress={() =>
            navigation.navigate('FamilyProfile', {userType: 'parent'})
          }>
          <View style={styles.profileContent}>
            <Text style={styles.profileText}>
              {childName
                ? `${childName}님이 연결되었습니다`
                : '아이 연결을 확인해요!'}
            </Text>
            <View style={styles.profileCircle} />
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>

        {!deviceData && !loading && (
          <View style={styles.card}>
            <Text style={styles.noDataText}>연결된 자녀가 없습니다.</Text>
            <Text style={styles.noDataSubText}>자녀를 연결해주세요.</Text>
          </View>
        )}
        {deviceData && (
          <>
            {/* 총 사용 시간 카드 */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>총 사용 시간</Text>
                <MaterialIcons name="chevron-right" size={24} color="#666" />
              </View>
              <View style={styles.timeInfo}>
                <Text style={styles.timeText}>
                  {Math.floor(deviceData.usage.totalUsage / 60)}시간{' '}
                  {deviceData.usage.totalUsage % 60}분
                </Text>
                <Text style={styles.remainText}>
                  {deviceData.usage.totalLimit - deviceData.usage.totalUsage}분
                  남음
                </Text>
              </View>
              <ProgressBar
                progress={
                  (deviceData.usage.totalUsage / deviceData.usage.totalLimit) *
                  100
                }
              />
            </View>

            {/* 앱별 사용 시간 카드 */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>앱별 사용 시간</Text>
                <MaterialIcons name="chevron-right" size={24} color="#666" />
              </View>
              {deviceData.usage.appUsage.map((app, index) => (
                <View key={index} style={styles.appItem}>
                  <View style={styles.appHeader}>
                    <View style={styles.appInfo}>
                      <Image
                        source={
                          app.appName === 'YouTube'
                            ? require('../assets/youtube-logo.png')
                            : require('../assets/insta-logo.jpg')
                        }
                        style={styles.appIcon}
                      />
                      <Text style={styles.appName}>{app.appName}</Text>
                    </View>
                    <Text style={styles.appRemainTime}>
                      {app.timeLimit - app.usageTime}분 남음
                    </Text>
                  </View>
                  <ProgressBar
                    progress={(app.usageTime / app.timeLimit) * 100}
                  />
                  <Text style={styles.usedTime}>1시간</Text>
                </View>
              ))}
            </View>

            {/* 사용 루틴 카드 */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>내 아이 사용 루틴</Text>
                <MaterialIcons name="chevron-right" size={24} color="#666" />
              </View>
              <View style={styles.routineContainer}>
                <DonutChart data={routineData} size={120} />
                <View style={styles.legendContainer}>
                  {routineData.map((item, index) => (
                    <View key={index} style={styles.legendItem}>
                      <View
                        style={[
                          styles.legendDot,
                          {backgroundColor: item.color},
                        ]}
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
          </>
        )}
        {/* 로딩 표시 */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#8CD9F0" />
            <Text style={styles.loadingText}>데이터를 불러오는 중...</Text>
          </View>
        )}
      </ScrollView>
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
  logo: {
    width: 100,
    height: 30,
    resizeMode: 'contain',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
    paddingHorizontal: 16,
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
    justifyContent: 'space-between',
    padding: 16,
    gap: 50,
  },
  profileText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
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
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  remainText: {
    fontSize: 14,
    color: '#666',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#8CD9F0',
    borderRadius: 4,
  },
  appItem: {
    marginBottom: 16,
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },
  appName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  appRemainTime: {
    fontSize: 12,
    color: '#666',
  },
  usedTime: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  routineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
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
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  noDataContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  noDataText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  noDataSubText: {
    fontSize: 14,
    color: '#666',
  },
});

export default ParentDashboardScreen;
