import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';
import {RouteProp} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

type DayTimeLimitScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'DayTimeLimit'
>;

const DayTimeLimitScreen: React.FC<DayTimeLimitScreenProps> = ({
  navigation,
  route,
}) => {
  const [selectedTime, setSelectedTime] = useState<number>(2);
  const times = Array.from({length: 12}, (_, i) => i);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>시간 제한 설정</Text>
      </View>

      {times.map(time => (
        <TouchableOpacity
          key={time}
          style={[
            styles.timeCard,
            selectedTime === time && styles.selectedTimeCard,
          ]}
          onPress={() => setSelectedTime(time)}>
          <Text style={styles.timeText}>{time} 시간</Text>
          {selectedTime === time && (
            <MaterialIcons name="check" size={24} color="#8CD9F0" />
          )}
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => navigation.goBack()}>
        <Text style={styles.saveButtonText}>저장</Text>
      </TouchableOpacity>
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
  timeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  selectedTimeCard: {
    backgroundColor: '#F5FBFF',
  },
  timeText: {
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#8CD9F0',
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DayTimeLimitScreen;
