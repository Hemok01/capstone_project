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
  const MAX_RETRY_ATTEMPTS = 3;

  useEffect(() => {
    if (deviceInfo?.id) {
      subscribeToConnectionStatus();
    }
  }, [deviceInfo?.id]);

  const connectDeviceWithRetry = async (
    childId: string,
    parentId: string,
    attempt = 1,
  ) => {
    try {
      return await connectDevice(childId, parentId);
    } catch (error) {
      if (attempt < MAX_RETRY_ATTEMPTS) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        return connectDeviceWithRetry(childId, parentId, attempt + 1);
      }
      throw error;
    }
  };

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
