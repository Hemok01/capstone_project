import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

type WeeklyTimeLimitProps = NativeStackScreenProps<
  RootStackParamList,
  'WeeklyTimeLimit'
>;

interface DayId {
  id: 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';
  label: string;
}

const DAYS: DayId[] = [
  {id: 'sun', label: '일요일'},
  {id: 'mon', label: '월요일'},
  {id: 'tue', label: '화요일'},
  {id: 'wed', label: '수요일'},
  {id: 'thu', label: '목요일'},
  {id: 'fri', label: '금요일'},
  {id: 'sat', label: '토요일'},
];
const WeeklyTimeLimitScreen: React.FC<WeeklyTimeLimitProps> = ({
  navigation,
  route,
}) => {
  const [weeklyLimits, setWeeklyLimits] = useState({
    sun: 120,
    mon: 120,
    tue: 120,
    wed: 120,
    thu: 120,
    fri: 120,
    sat: 120,
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>요일별 시간 제한</Text>
      </View>

      {DAYS.map(day => (
        <TouchableOpacity
          key={day.id}
          style={styles.dayCard}
          onPress={() => navigation.navigate('DayTimeLimit', {day: day.id})}>
          <Text style={styles.dayText}>{day.label}</Text>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>
              {Math.floor(weeklyLimits[day.id] / 60)}시간{' '}
              {weeklyLimits[day.id] % 60}분
            </Text>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </View>
        </TouchableOpacity>
      ))}
    </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
  },
  dayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  dayText: {
    fontSize: 16,
    color: '#333',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
});

export default WeeklyTimeLimitScreen;
