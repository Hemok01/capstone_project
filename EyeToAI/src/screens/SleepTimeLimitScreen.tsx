import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

type SleepTimeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'SleepTime'
>;

const SleepTimeLimitScreen: React.FC<SleepTimeScreenProps> = ({
  navigation,
  route,
}) => {
  const [bedTime, setBedTime] = useState(new Date());
  const [wakeTime, setWakeTime] = useState(new Date());
  const [showBedPicker, setShowBedPicker] = useState(false);
  const [showWakePicker, setShowWakePicker] = useState(false);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const handleSave = async () => {
    // Firebase 저장 로직 구현
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>수면 시간 설정</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveButton}>완료</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.timeSelector}
          onPress={() => setShowBedPicker(true)}>
          <View style={styles.timeSelectorHeader}>
            <MaterialIcons name="bedtime" size={24} color="#666" />
            <Text style={styles.timeSelectorLabel}>취침 시간</Text>
          </View>
          <Text style={styles.selectedTime}>{formatTime(bedTime)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.timeSelector}
          onPress={() => setShowWakePicker(true)}>
          <View style={styles.timeSelectorHeader}>
            <MaterialIcons name="wb-sunny" size={24} color="#666" />
            <Text style={styles.timeSelectorLabel}>기상 시간</Text>
          </View>
          <Text style={styles.selectedTime}>{formatTime(wakeTime)}</Text>
        </TouchableOpacity>

        {showBedPicker && (
          <DateTimePicker
            value={bedTime}
            mode="time"
            is24Hour={true}
            display="spinner"
            onChange={(event, selectedDate) => {
              setShowBedPicker(false);
              if (selectedDate) setBedTime(selectedDate);
            }}
          />
        )}

        {showWakePicker && (
          <DateTimePicker
            value={wakeTime}
            mode="time"
            is24Hour={true}
            display="spinner"
            onChange={(event, selectedDate) => {
              setShowWakePicker(false);
              if (selectedDate) setWakeTime(selectedDate);
            }}
          />
        )}
      </View>

      <Text style={styles.description}>
        설정된 시간 동안에는 앱 사용이 제한됩니다
      </Text>
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
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  timeSelector: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  timeSelectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeSelectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  selectedTime: {
    fontSize: 24,
    fontWeight: '600',
    color: '#4A90E2',
    marginLeft: 32,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
  },
});

export default SleepTimeLimitScreen;
