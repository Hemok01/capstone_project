import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Button,
  Platform,
  NativeModules,
  ScrollView,
  StyleSheet,
} from 'react-native';

const {UsageStatsModule} = NativeModules;

interface UsageStats {
  packageName: string;
  appName: string;
  lastTimeUsed: number;
  totalTimeInForeground: number;
  firstTimeStamp: number;
  lastTimeStamp: number;
}

const UsageStatsTest: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [usageStats, setUsageStats] = useState<UsageStats[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const checkPermission = async (): Promise<void> => {
    if (Platform.OS !== 'android') {
      console.log('이 기능은 안드로이드에서만 사용 가능합니다.');
      return;
    }

    try {
      const result = await UsageStatsModule.checkPermission();
      setHasPermission(result);
    } catch (error) {
      console.error('권한 확인 중 오류 발생:', error);
    }
  };

  const requestPermission = (): void => {
    if (Platform.OS === 'android') {
      UsageStatsModule.openUsageSettings();
    }
  };

  const getAppName = async (packageName: string): Promise<string> => {
    try {
      return await UsageStatsModule.getAppName(packageName);
    } catch (error) {
      return packageName;
    }
  };

  const fetchUsageStats = async (): Promise<void> => {
    if (!hasPermission) return;

    try {
      setLoading(true);
      const stats: Omit<UsageStats, 'appName'>[] =
        await UsageStatsModule.getUsageStats(7);

      // 앱 이름 가져오기
      const statsWithNames = await Promise.all(
        stats.map(async (stat: Omit<UsageStats, 'appName'>) => ({
          ...stat,
          appName: await getAppName(stat.packageName),
        })),
      );

      // 총 사용 시간으로 정렬
      const sortedStats = statsWithNames.sort(
        (a, b) => b.totalTimeInForeground - a.totalTimeInForeground,
      );

      setUsageStats(sortedStats);
    } catch (error) {
      console.error('사용 통계 가져오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkPermission();
  }, []);

  const formatDuration = (milliseconds: number): string => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}시간 ${minutes}분`;
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString('ko-KR');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerText}>
        권한 상태: {hasPermission ? '허용됨' : '거부됨'}
      </Text>

      <View style={styles.buttonContainer}>
        <Button
          title="권한 설정 열기"
          onPress={requestPermission}
          disabled={hasPermission}
        />

        <Button
          title="사용 통계 가져오기"
          onPress={fetchUsageStats}
          disabled={!hasPermission}
        />
      </View>

      {loading && <Text style={styles.loadingText}>데이터 로딩 중...</Text>}

      {usageStats.length > 0 && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsHeader}>앱 사용 통계 (최근 7일)</Text>
          {usageStats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <Text style={styles.appName}>{stat.appName}</Text>
              <Text style={styles.packageName}>{stat.packageName}</Text>
              <Text style={styles.usageInfo}>
                총 사용 시간: {formatDuration(stat.totalTimeInForeground)}
              </Text>
              <Text style={styles.usageInfo}>
                마지막 사용: {formatDate(stat.lastTimeUsed)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headerText: {
    fontSize: 18,
    marginBottom: 20,
  },
  buttonContainer: {
    gap: 10,
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 20,
  },
  statsContainer: {
    marginTop: 20,
  },
  statsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statItem: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    elevation: 2,
  },
  appName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  packageName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  usageInfo: {
    fontSize: 14,
    marginBottom: 4,
  },
});

export default UsageStatsTest;
