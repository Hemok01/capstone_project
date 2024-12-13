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
import {
  Device,
  User,
  Connection,
  Usage,
  DeviceUsageData,
} from '../types/database';
import firestore from '@react-native-firebase/firestore';
import DonutChart from '../components/common/DonutChart';
import ItoaiHeader from '../assets/icons/itoai-header.svg';
import {ReportCard} from '../components/common/ReportCard';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ParentDashboard'>;
  route: RouteProp<RootStackParamList, 'ParentDashboard'>;
};

const ParentDashboardScreen = ({navigation}: Props) => {
  const [deviceData, setDeviceData] = useState<DeviceUsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [childName, setChildName] = useState<string>('');

  // 공통 데이터 처리 함수
  const processDeviceUsageData = async (deviceId: string) => {
    const today = new Date().toISOString().split('T')[0];

    try {
      const [deviceDoc, userSnapshot, usageDoc] = await Promise.all([
        firestore().collection('devices').doc(deviceId).get(),
        firestore()
          .collection('users')
          .where('deviceId', '==', deviceId)
          .where('userType', '==', 'child')
          .limit(1)
          .get(),
        firestore().collection('usage').doc(`${deviceId}_${today}`).get(),
      ]);

      if (!deviceDoc.exists || !usageDoc.exists) {
        console.warn('[processDeviceUsageData] Missing data:', {
          deviceExists: deviceDoc.exists,
          usageExists: usageDoc.exists,
        });
        return null;
      }

      const deviceData = deviceDoc.data() as Device;
      const childName = userSnapshot.empty
        ? ''
        : userSnapshot.docs[0].data()?.name || '';
      const usageData = usageDoc.data() as Usage;

      return {
        deviceId,
        deviceName: deviceData.name,
        childName,
        date: today,
        timeLimit: usageData.timeLimit,
        usageTime: usageData.usageTime,
        status: usageData.status,
        restrictions: usageData.restrictions,
        appUsages: usageData.appUsages,
      };
    } catch (error) {
      return null;
    }
  };

  // fetchData 함수
  const fetchData = async () => {
    try {
      const parentId = auth().currentUser?.uid;
      if (!parentId) return;

      const connectionsSnapshot = await firestore()
        .collection('connections')
        .where('parentId', '==', parentId)
        .where('status', '==', 'connected')
        .orderBy('lastSync', 'desc')
        .limit(1)
        .get();

      if (connectionsSnapshot.empty) {
        setChildName('');
        setDeviceData(null);
        return;
      }

      const deviceId = connectionsSnapshot.docs[0].data().deviceId;
      const deviceUsageData = await processDeviceUsageData(deviceId);
      if (deviceUsageData) {
        setChildName(deviceUsageData.childName);
        setDeviceData(deviceUsageData);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const parentId = auth().currentUser?.uid;
    if (!parentId) return;

    fetchData();

    // 실시간 구독으로 변경
    const unsubscribe = firestore()
      .collection('connections')
      .where('parentId', '==', parentId)
      .where('status', '==', 'connected')
      .orderBy('lastSync', 'desc')
      .limit(1)
      .onSnapshot(async snapshot => {
        if (!snapshot || snapshot.empty) {
          setDeviceData(null);
          return;
        }

        const deviceId = snapshot.docs[0].data().deviceId;
        const data = await processDeviceUsageData(deviceId);
        if (data) setDeviceData(data);
      });

    return () => unsubscribe();
  });
  // 프로그레스 바 컴포넌트
  const ProgressBar = ({progress}: {progress: number}) => (
    <View style={styles.progressBarContainer}>
      <View
        style={[styles.progressBar, {width: `${Math.min(progress, 100)}%`}]}
      />
    </View>
  );

  const routineData = [
    {value: 40, color: '#8CD9F0', key: '동영상'},
    {value: 30, color: '#A5D4A7', key: '게임'},
    {value: 20, color: '#FFD700', key: 'SNS'},
    {value: 10, color: '#FFB6C1', key: '기타'},
  ];

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
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('TimeManagement')}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>폰 사용 시간</Text>
                <MaterialIcons name="chevron-right" size={24} color="#666" />
              </View>
              <View style={styles.timeInfo}>
                <Text style={styles.timeText}>
                  {Math.floor(deviceData.usageTime / 60)}시간{' '}
                  {deviceData.usageTime % 60}분
                </Text>
                <Text style={styles.remainText}>
                  {deviceData.timeLimit - deviceData.usageTime}분 남음
                </Text>
              </View>
              <ProgressBar
                progress={(deviceData.usageTime / deviceData.timeLimit) * 100}
              />
            </TouchableOpacity>

            {/* 앱별 사용시간 카드 */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>앱별 사용 시간</Text>
                <MaterialIcons name="chevron-right" size={24} color="#666" />
              </View>
              {deviceData?.appUsages?.map((app, index) => (
                <View key={index} style={styles.appUsageItem}>
                  <View style={styles.appInfoRow}>
                    <MaterialIcons name="android" size={24} color="#8CD9F0" />
                    <View style={styles.appInfoContainer}>
                      <Text style={styles.appName}>{app.appName}</Text>
                      <Text style={styles.timeText}>
                        {Math.floor(app.usageTime / 60)}시간{' '}
                        {app.usageTime % 60}분
                      </Text>
                    </View>
                    <Text style={styles.usagePercent}>
                      {((app.usageTime / deviceData.usageTime) * 100).toFixed(
                        1,
                      )}
                      %
                    </Text>
                  </View>
                  <ProgressBar
                    progress={(app.usageTime / deviceData.timeLimit) * 100}
                  />
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

            {/* 프로필 카드 다음에 추가 */}
            {deviceData && (
              <ReportCard
                onPress={() =>
                  navigation.navigate('Report', {
                    totalTime: deviceData.usageTime,
                    targetTime: deviceData.timeLimit,
                  })
                }
                totalTime={deviceData.usageTime}
                targetTime={deviceData.timeLimit}
              />
            )}
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
  warningText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusText: {
    color: '#666',
    fontSize: 14,
  },
  blockedAppItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  appUsageItem: {
    marginBottom: 16,
  },
  appInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  appInfoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  appName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  usagePercent: {
    fontSize: 14,
    color: '#8CD9F0',
    fontWeight: '500',
  },
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
