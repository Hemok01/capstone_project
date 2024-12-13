import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'TimeManagement'>;
};

const TimeManagementScreen = ({navigation}: Props) => {
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>사용시간 제한</Text>
      </View>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('AppTimeLimit')}>
        <View style={styles.cardContent}>
          <View style={styles.cardIcon}>
            <MaterialIcons name="apps" size={24} color="#666" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>앱 시간 제한</Text>
            <Text style={styles.cardSubtitle}>앱별 사용시간을 설정합니다</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('TotalTimeLimit')}>
        <View style={styles.cardContent}>
          <View style={styles.cardIcon}>
            <MaterialIcons name="schedule" size={24} color="#666" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>전체 시간 제한</Text>
            <Text style={styles.cardSubtitle}>
              하루 총 사용시간을 설정합니다
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('WeeklyTimeLimit')}>
        <View style={styles.cardContent}>
          <View style={styles.cardIcon}>
            <MaterialIcons name="date-range" size={24} color="#666" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>요일별 시간 제한</Text>
            <Text style={styles.cardSubtitle}>
              요일별 사용시간을 설정합니다
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('SleepTimeLimit')}>
        <View style={styles.cardContent}>
          <View style={styles.cardIcon}>
            <MaterialIcons name="bedtime" size={24} color="#666" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>수면 시간 제한</Text>
            <Text style={styles.cardSubtitle}>
              취침/기상 시간을 설정하여 사용을 제한합니다
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
  },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

export default TimeManagementScreen;
