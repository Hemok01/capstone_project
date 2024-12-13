// src/hooks/useDevice.ts

import {useState, useEffect} from 'react';
import firestore from '@react-native-firebase/firestore';
import {Device} from '../types/device';
import {DeviceManager} from '../utils/device';

export const useDevice = () => {
  const [deviceInfo, setDeviceInfo] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    initializeDevice();
  }, []);

  const initializeDevice = async () => {
    try {
      setLoading(true);
      const localDeviceInfo = await DeviceManager.getDeviceInfo();

      // Check if device exists in Firestore
      const deviceDoc = await firestore()
        .collection('devices')
        .doc(localDeviceInfo.deviceId)
        .get();

      if (!deviceDoc.exists) {
        // Register new device
        await firestore()
          .collection('devices')
          .doc(localDeviceInfo.deviceId)
          .set(localDeviceInfo);
      } else {
        // Update local storage with Firestore data
        const firestoreData = deviceDoc.data() as Device;
        await DeviceManager.updateDeviceInfo(firestoreData);
      }

      setDeviceInfo(localDeviceInfo);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const updateDevice = async (updates: Partial<Device>) => {
    if (!deviceInfo) return;

    try {
      const updatedInfo = {...deviceInfo, ...updates};

      // Update Firestore
      await firestore()
        .collection('devices')
        .doc(deviceInfo.deviceId)
        .update(updates);

      // Update local storage
      await DeviceManager.updateDeviceInfo(updates);

      setDeviceInfo(updatedInfo);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    deviceInfo,
    loading,
    error,
    updateDevice,
    refreshDevice: initializeDevice,
  };
};

