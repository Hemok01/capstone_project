// src/components/ConnectCard.tsx
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

interface ConnectCardProps {
  onPress: () => void;
  connectionStatus: string;
}

export const ConnectCard = ({onPress}: ConnectCardProps) => {
  return (
    <TouchableOpacity
      style={styles.connectCard}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>아이 연결을 해주세요!</Text>
        <View style={styles.childIcon} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  connectCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  childIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D3D3D3',
  },
});
