// src/components/ConnectionStatus.tsx
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

type Props = {
  isConnected: boolean;
  deviceName?: string;
};

export const ConnectionStatus = ({isConnected, deviceName}: Props) => {
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.indicator,
          isConnected ? styles.connected : styles.disconnected,
        ]}
      />
      <Text style={styles.text}>
        {isConnected ? `${deviceName}과(와) 연결됨` : '연결된 기기 없음'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  connected: {
    backgroundColor: '#4CAF50',
  },
  disconnected: {
    backgroundColor: '#FF5252',
  },
  text: {
    fontSize: 14,
    color: '#333',
  },
});
