import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../types/navigation';
import {BarChart} from 'react-native-chart-kit';
import {ChevronLeft, ChevronRight} from 'lucide-react-native';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'UsageReport'>;
  route: RouteProp<RootStackParamList, 'UsageReport'>;
};

// Mock Data
const mockData = {
  usageInfo: {
    percentage: 25,
    totalTime: '12시간 6분',
    compareYesterday: '+12.6%',
    comparePeers: '65.4분',
    message: '건강한 모바일 사용을 하고 있어요',
  },
  timeUsage: {
    labels: ['6', '9', '12', '15', '18', '21'],
    data: [30, 45, 28, 80, 99, 43],
  },
  categories: [
    {name: 'SNS', time: 85},
    {name: '엔터테인먼트', time: 45},
    {name: '생산성', time: 30},
  ],
  apps: [
    {name: 'YouTube', time: '1.5h', icon: '📺'},
    {name: 'Instagram', time: '1.2h', icon: '📱'},
    {name: '카카오톡', time: '1.0h', icon: '💬'},
    {name: '숨고', time: '0.8h', icon: '🔍'},
    {name: '토스', time: '0.5h', icon: '💰'},
  ],
};

const UsageReportScreen = ({navigation}: Props) => {
  const [reportType, setReportType] = useState<'usage' | 'autonomy' | 'safety'>(
    'usage',
  );
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly'>('daily');
  const [viewMode, setViewMode] = useState<'app' | 'category'>('app');

  const renderReportTabs = () => (
    <View style={styles.reportTabs}>
      <TouchableOpacity
        style={[
          styles.reportTab,
          reportType === 'usage' && styles.activeReportTab,
        ]}
        onPress={() => setReportType('usage')}>
        <Text style={styles.reportTabText}>사용리포트</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.reportTab,
          reportType === 'autonomy' && styles.activeReportTab,
        ]}
        onPress={() => setReportType('autonomy')}>
        <Text style={styles.reportTabText}>자율성리포트</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.reportTab,
          reportType === 'safety' && styles.activeReportTab,
        ]}
        onPress={() => setReportType('safety')}>
        <Text style={styles.reportTabText}>안심리포트</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTimeSelector = () => (
    <View style={styles.timeSelector}>
      <TouchableOpacity
        style={[
          styles.timeButton,
          timeRange === 'daily' && styles.activeTimeButton,
        ]}
        onPress={() => setTimeRange('daily')}>
        <Text
          style={
            timeRange === 'daily' ? styles.activeTimeText : styles.timeText
          }>
          일간
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.timeButton,
          timeRange === 'weekly' && styles.activeTimeButton,
        ]}
        onPress={() => setTimeRange('weekly')}>
        <Text
          style={
            timeRange === 'weekly' ? styles.activeTimeText : styles.timeText
          }>
          주간
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderDateNavigation = () => (
    <View style={styles.dateNav}>
      <TouchableOpacity>
        <ChevronLeft color="#000" size={24} />
      </TouchableOpacity>
      <Text style={styles.dateText}>12월 24일</Text>
      <TouchableOpacity>
        <ChevronRight color="#000" size={24} />
      </TouchableOpacity>
    </View>
  );

  const renderUsageCircle = () => (
    <View style={styles.usageSection}>
      <View style={styles.circleContainer}>
        <View style={styles.circle}>
          <Text style={styles.circlePercentage}>
            {mockData.usageInfo.percentage}%
          </Text>
        </View>
        <View style={styles.circleInfo}>
          <Text style={styles.usageTime}>{mockData.usageInfo.totalTime}</Text>
          <Text style={styles.usageCompare}>
            어제대비 {mockData.usageInfo.compareYesterday} 증가
          </Text>
          <Text style={styles.usageCompare}>
            또래보다 {mockData.usageInfo.comparePeers} 적게 사용
          </Text>
        </View>
      </View>
      <Text style={styles.healthMessage}>{mockData.usageInfo.message}</Text>
    </View>
  );

  const renderTimeChart = () => (
    <View style={styles.chartSection}>
      <Text style={styles.sectionTitle}>시간대별 이용량</Text>
      <BarChart
        data={{
          labels: ['label1', 'label2'], // 귀하의 실제 라벨 데이터
          datasets: [
            {
              data: [20, 45], // 귀하의 실제 데이터
            },
          ],
        }}
        width={300}
        height={200}
        yAxisLabel="$" // 필수 prop 추가
        yAxisSuffix="k" // 필수 prop 추가
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          barPercentage: 0.7,
        }}
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
        showValuesOnTopOfBars={true}
      />
    </View>
  );

  const renderCategories = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>앱 카테고리</Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'app' && styles.activeToggle,
            ]}
            onPress={() => setViewMode('app')}>
            <Text style={styles.toggleText}>앱별</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'category' && styles.activeToggle,
            ]}
            onPress={() => setViewMode('category')}>
            <Text style={styles.toggleText}>카테고리별</Text>
          </TouchableOpacity>
        </View>
      </View>
      {viewMode === 'category'
        ? mockData.categories.map((category, index) => (
            <View key={index} style={styles.categoryItem}>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryTime}>{category.time}분</Text>
            </View>
          ))
        : mockData.apps.map((app, index) => (
            <View key={index} style={styles.appItem}>
              <Text style={styles.appIcon}>{app.icon}</Text>
              <Text style={styles.appName}>{app.name}</Text>
              <Text style={styles.appTime}>{app.time}</Text>
            </View>
          ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderReportTabs()}
      <ScrollView style={styles.scrollView}>
        {renderTimeSelector()}
        {renderDateNavigation()}
        {renderUsageCircle()}
        {renderTimeChart()}
        {renderCategories()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  reportTabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  reportTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeReportTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4A90E2',
  },
  reportTabText: {
    fontSize: 15,
    color: '#333',
  },
  timeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  timeButton: {
    paddingHorizontal: 24,
    paddingVertical: 6,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  activeTimeButton: {
    backgroundColor: '#4A90E2',
  },
  timeText: {
    color: '#666',
  },
  activeTimeText: {
    color: '#fff',
  },
  dateNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  usageSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 8,
  },
  circleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  circlePercentage: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  circleInfo: {
    flex: 1,
  },
  usageTime: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  usageCompare: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  healthMessage: {
    fontSize: 15,
    color: '#4A90E2',
    textAlign: 'center',
    marginTop: 16,
  },
  chartSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    padding: 4,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  activeToggle: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    color: '#666',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryName: {
    fontSize: 16,
  },
  categoryTime: {
    fontSize: 16,
    color: '#666',
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  appIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  appName: {
    flex: 1,
    fontSize: 16,
  },
  appTime: {
    fontSize: 16,
    color: '#666',
  },
});

export default UsageReportScreen;
