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
        .doc(localDeviceInfo.id)
        .get();

      if (!deviceDoc.exists) {
        // Register new device
        await firestore()
          .collection('devices')
          .doc(localDeviceInfo.id)
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
        .doc(deviceInfo.id)
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

// src/hooks/useConnection.ts

import {useState, useEffect} from 'react';
import firestore from '@react-native-firebase/firestore';
import {Device, DeviceConnection} from '../types/device';
import {useDevice} from './useDevice';

export const useConnection = () => {
  const {deviceInfo} = useDevice();
  const [connectionStatus, setConnectionStatus] =
    useState<DeviceConnection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (deviceInfo?.id) {
      subscribeToConnectionStatus();
    }
  }, [deviceInfo?.id]);

  const subscribeToConnectionStatus = () => {
    if (!deviceInfo?.id) return;

    return firestore()
      .collection('connections')
      .where('deviceId', '==', deviceInfo.id)
      .onSnapshot(snapshot => {
        const connection = snapshot.docs[0]?.data() as DeviceConnection;
        setConnectionStatus(connection || null);
        setLoading(false);
      });
  };

  const connectDevice = async (childId: string, parentId: string) => {
    if (!deviceInfo?.id) throw new Error('Device not initialized');

    const connection: DeviceConnection = {
      deviceId: deviceInfo.id,
      childId,
      parentId,
      connectedAt: new Date(),
      status: 'active',
    };

    await firestore()
      .collection('connections')
      .doc(deviceInfo.id)
      .set(connection);

    return connection;
  };

  const disconnectDevice = async () => {
    if (!deviceInfo?.id) return;

    await firestore()
      .collection('connections')
      .doc(deviceInfo.id)
      .update({status: 'revoked'});
  };

  return {
    connectionStatus,
    loading,
    connectDevice,
    disconnectDevice,
  };
};
