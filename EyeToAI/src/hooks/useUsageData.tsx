import {useState, useEffect} from 'react';
import firestore from '@react-native-firebase/firestore';
import {UsageData} from '../types/device';

export const useUsageData = (deviceId: string) => {
  const [usageData, setUsageData] = useState<UsageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (deviceId) {
      const unsubscribe = subscribeToUsageData();
      return () => unsubscribe?.();
    }
  }, [deviceId]);

  const validateUsageData = (usage: UsageData) => {
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

    const newUsage: UsageData = {
      deviceId,
      childId: '', // Required field from UsageData interface
      startTime: new Date(),
      endTime: new Date(),
      duration,
      appUsage: {
        [appId]: duration,
      },
    };

    validateUsageData(newUsage);
    await firestore().collection('usage').add(newUsage);
  };

  return {
    usageData,
    loading,
    error,
    recordUsage,
  };
};
