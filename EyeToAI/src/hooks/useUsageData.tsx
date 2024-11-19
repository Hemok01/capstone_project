// src/hooks/useUsageData.ts

import {useState, useEffect} from 'react';
import firestore from '@react-native-firebase/firestore';
import {UsageData} from '../types/device';

export const useUsageData = (deviceId: string) => {
  const [usageData, setUsageData] = useState<UsageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (deviceId) {
      subscribeToUsageData();
    }
  }, [deviceId]);

  const validateUsageData = (usage: Partial<UsageData>) => {
    if (!usage.startTime || !usage.endTime) {
      throw new Error('Invalid usage time data');
    }

    if (usage.endTime < usage.startTime) {
      throw new Error('End time cannot be before start time');
    }

    if (usage.duration <= 0) {
      throw new Error('Duration must be positive');
    }

    return true;
  };

  const subscribeToUsageData = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return firestore()
      .collection('usage')
      .where('deviceId', '==', deviceId)
      .where('startTime', '>=', today)
      .orderBy('startTime', 'desc')
      .onSnapshot(
        snapshot => {
          const usage = snapshot.docs.map(doc => doc.data() as UsageData);
          setUsageData(usage);
          setLoading(false);
        },
        err => {
          setError(err);
          setLoading(false);
        },
      );
  };

  const recordUsage = async (appId: string, duration: number) => {
    if (!deviceId) return;

    const newUsage: Partial<UsageData> = {
      deviceId,
      startTime: new Date(),
      endTime: new Date(),
      duration,
      appUsage: {
        [appId]: duration,
      },
    };

    await firestore().collection('usage').add(newUsage);
  };

  return {
    usageData,
    loading,
    error,
    recordUsage,
  };
};
