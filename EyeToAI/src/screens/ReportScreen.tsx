import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {RenderUsageReport} from '../components/common/RenderUsageReport';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';

type ChecklistItem = {
  id: number;
  text: string;
  checked: boolean;
};

type DayData = {
  date: number;
  checklist: ChecklistItem[];
};

type ReportScreenProps = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

const ReportScreen: React.FC<ReportScreenProps> = ({navigation, route}) => {
  const [selectedTab, setSelectedTab] = useState('usage');
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  const defaultChecklist = [
    {id: 1, text: '시간 전에 스스로 종료하기', checked: false},
    {id: 2, text: '수면시간동안 핸드폰 사용하지 않기', checked: false},
    {
      id: 3,
      text: '걷거나 대중교통 이용시 핸드폰 10분 이상 보지 않기',
      checked: false,
    },
  ];

  const securityEvents = [
    {
      date: '12월 30일',
      time: '14:23',
      type: 'harmful',
      description: '유해사이트 접속 시도',
      risk: 'high',
    },
    {
      date: '12월 29일',
      time: '11:15',
      type: 'bypass',
      description: 'VPN 우회 접속 시도',
      risk: 'medium',
    },
  ];

  const calendarData: DayData[] = Array.from({length: 31}, (_, i) => ({
    date: i + 1,
    checklist: defaultChecklist.map(item => ({
      ...item,
      checked: Math.random() > 0.5,
    })),
  }));

  const renderStars = (checklist: ChecklistItem[]) => {
    const completedCount = checklist.filter(item => item.checked).length;
    return '★'.repeat(completedCount) + '☆'.repeat(3 - completedCount);
  };

  const renderCalendar = () => (
    <View style={styles.calendarContainer}>
      <View style={styles.weekDays}>
        {['일', '월', '화', '수', '목', '금', '토'].map(day => (
          <Text key={day} style={styles.weekDay}>
            {day}
          </Text>
        ))}
      </View>
      <View style={styles.daysGrid}>
        {calendarData.map(day => (
          <TouchableOpacity
            key={day.date}
            style={[
              styles.dayCell,
              selectedDate === day.date && styles.selectedDay,
            ]}
            onPress={() => setSelectedDate(day.date)}>
            <Text style={styles.dateText}>{day.date}</Text>
            <Text style={styles.starsText}>{renderStars(day.checklist)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderChecklist = () => {
    if (!selectedDate) return null;
    const dayData = calendarData.find(day => day.date === selectedDate);
    if (!dayData) return null;

    return (
      <View style={styles.checklistContainer}>
        <Text style={styles.checklistTitle}>{selectedDate}일 체크리스트</Text>
        {dayData.checklist.map(item => (
          <View key={item.id} style={styles.checklistItem}>
            <MaterialIcons
              name={item.checked ? 'check-circle' : 'radio-button-unchecked'}
              size={24}
              color={item.checked ? '#4A90E2' : '#666'}
            />
            <Text style={styles.checklistText}>{item.text}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderSafetyReport = () => (
    <>
      <View style={styles.safetyScoreCard}>
        <Text style={styles.safetyScore}>안전 점수</Text>
        <Text style={styles.scoreValue}>85</Text>
        <View style={styles.riskIndicator}>
          <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
          <Text style={styles.riskText}>안전</Text>
        </View>
      </View>
      <View style={styles.timelineContainer}>
        {securityEvents.map((event, index) => (
          <View key={index} style={styles.timelineEvent}>
            <View
              style={[
                styles.riskDot,
                {
                  backgroundColor:
                    event.risk === 'high' ? '#FF5252' : '#FFC107',
                },
              ]}
            />
            <View style={styles.eventContent}>
              <Text style={styles.eventTime}>
                {event.date} {event.time}
              </Text>
              <Text style={styles.eventDescription}>{event.description}</Text>
            </View>
          </View>
        ))}
      </View>
    </>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>분석 리포트</Text>
      </View>

      <View style={styles.tabContainer}>
        {[
          {id: 'usage', label: '사용 리포트'},
          {id: 'autonomy', label: '자율성 리포트'},
          {id: 'safety', label: '안심 리포트'},
        ].map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, selectedTab === tab.id && styles.activeTab]}
            onPress={() => setSelectedTab(tab.id)}>
            <Text
              style={[
                styles.tabText,
                selectedTab === tab.id && styles.activeTabText,
              ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {selectedTab === 'usage' && RenderUsageReport()}

      {selectedTab === 'autonomy' && (
        <>
          {renderCalendar()}
          {renderChecklist()}
        </>
      )}

      {selectedTab === 'safety' && renderSafetyReport()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4A90E2',
  },
  safetyScoreCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 24,
    borderRadius: 12,
    elevation: 2,
    alignItems: 'center',
  },
  safetyScore: {
    fontSize: 16,
    color: '#666',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#4CAF50',
    marginVertical: 8,
  },
  riskIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riskText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#4CAF50',
  },
  timelineContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  timelineEvent: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  riskDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
    marginTop: 4,
  },
  eventContent: {
    flex: 1,
  },
  eventTime: {
    fontSize: 12,
    color: '#666',
  },
  eventDescription: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  tabText: {
    color: '#666',
    fontSize: 14,
  },
  activeTabText: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  calendarContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekDay: {
    width: 40,
    textAlign: 'center',
    color: '#666',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  selectedDay: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  dateText: {
    fontSize: 14,
    marginBottom: 2,
  },
  starsText: {
    fontSize: 10,
    color: '#FFD700',
  },
  checklistContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  checklistTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checklistText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
});

export default ReportScreen;
