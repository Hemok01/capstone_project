import React from 'react';
import {TouchableOpacity, View, Text, StyleSheet} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

type ReportCardProps = {
  onPress: () => void;
  totalTime: number;
  targetTime: number;
};

export const ReportCard = ({
  onPress,
  totalTime,
  targetTime,
}: ReportCardProps) => (
  <TouchableOpacity onPress={onPress}>
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text>분석 리포트</Text>
        <MaterialIcons name="chevron-right" size={24} color="#666" />
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
});
