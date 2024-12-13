import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {NativeModules} from 'react-native';

const {UsageModule} = NativeModules;

export const RenderUsageReport = () => {
  const [totalUsage, setTotalUsage] = useState(0);
  const [timeLimit, setTimeLimit] = useState(180); // 기본 시간 제한값
  const [appUsageData, setAppUsageData] = useState([]);

  const fetchUsageData = async () => {
    try {
      // 네이티브 모듈에서 앱 사용 데이터를 가져옵니다.
      const usageStats = await UsageModule.getUsageStats(1); // 최근 1일 데이터
      const processedStats = await UsageModule.processUsageStats(usageStats);

      // 총 사용 시간 및 앱별 사용 데이터 처리
      let totalUsageTime = 0;
      const appData = processedStats.map(app => {
        totalUsageTime += Math.round(app.usageTime);
        return {
          appName: app.appName || app.packageName,
          usage: Math.round(app.usageTime),
          category: app.category || 'Unknown',
        };
      });

      setTotalUsage(totalUsageTime);
      setAppUsageData(appData.slice(0, 3)); // 상위 3개의 앱 데이터만 표시
    } catch (error) {
      console.error('UsageModule 데이터를 가져오는 중 오류 발생:', error);
    }
  };

  useEffect(() => {
    fetchUsageData();
  }, []);

  return (
    <View style={styles.reportContainer}>
      {/* 시간 요약 카드 */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>오늘의 스마트폰 사용</Text>
        <View style={styles.timeDisplay}>
          <Text style={styles.timeText}>
            {Math.floor(totalUsage / 60)}시간 {totalUsage % 60}분
          </Text>
          <Text style={styles.limitText}>
            / {Math.floor(timeLimit / 60)}시간 {timeLimit % 60}분
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progress,
              {
                width: `${(totalUsage / timeLimit) * 100}%`,
                backgroundColor: totalUsage > timeLimit ? '#FF5252' : '#4CAF50',
              },
            ]}
          />
        </View>
        <Text style={styles.remainingText}>
          {timeLimit - totalUsage > 0
            ? `남은 시간: ${Math.floor((timeLimit - totalUsage) / 60)}시간 ${
                (timeLimit - totalUsage) % 60
              }분`
            : '오늘 사용 시간을 모두 소진했어요!'}
        </Text>
      </View>

      {/* 앱별 사용 시간 */}
      <View style={styles.appsCard}>
        <Text style={styles.appsTitle}>앱별 사용 시간</Text>
        {appUsageData.map((app, index) => (
          <View key={index} style={styles.appItem}>
            <View style={styles.appInfo}>
              <Text style={styles.appName}>{app.appName}</Text>
              <Text style={styles.categoryLabel}>{app.category}</Text>
            </View>
            <Text style={styles.appTime}>
              {Math.floor(app.usage / 60)}시간 {app.usage % 60}분
            </Text>
          </View>
        ))}
      </View>

      {/* 카테고리별 분석 */}
      <View style={styles.analysisCard}>
        <Text style={styles.analysisTitle}>사용 패턴 분석</Text>
        <Text style={styles.analysisText}>
          {totalUsage > timeLimit
            ? '❌ 목표 시간을 초과했어요'
            : '✅ 목표 시간을 잘 지키고 있어요'}
        </Text>
        <Text style={styles.analysisText}>
          {appUsageData[0]?.category === '소셜'
            ? '📱 소셜 미디어 사용이 가장 많아요'
            : '🎯 생산적인 앱 사용이 많아요'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  reportContainer: {
    padding: 16,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 12,
  },
  timeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  limitText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progress: {
    height: '100%',
    borderRadius: 4,
  },
  remainingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  appsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  appsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  appItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  categoryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  appTime: {
    fontSize: 14,
    color: '#333',
  },
  analysisCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  analysisText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
});
