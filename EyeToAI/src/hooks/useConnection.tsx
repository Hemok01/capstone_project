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
    if (deviceInfo?.deviceId) {
      subscribeToConnectionStatus();
    }
  }, [deviceInfo?.deviceId]);

  const subscribeToConnectionStatus = () => {
    if (!deviceInfo?.deviceId) return;

    return firestore()
      .collection('connections')
      .where('deviceId', '==', deviceInfo.deviceId)
      .onSnapshot(snapshot => {
        const connection = snapshot.docs[0]?.data() as DeviceConnection;
        setConnectionStatus(connection || null);
        setLoading(false);
      });
  };

  const connectDevice = async (childId: string, parentId: string) => {
    if (!deviceInfo?.deviceId) throw new Error('Device not initialized');

    const connection: DeviceConnection = {
      deviceId: deviceInfo.deviceId,
      childId,
      parentId,
      connectedAt: new Date(),
      status: 'active',
    };

    await firestore()
      .collection('connections')
      .doc(deviceInfo.deviceId)
      .set(connection);

    return connection;
  };

  const disconnectDevice = async () => {
    if (!deviceInfo?.deviceId) return;

    await firestore()
      .collection('connections')
      .doc(deviceInfo.deviceId)
      .update({status: 'revoked'});
  };

  return {
    connectionStatus,
    loading,
    connectDevice,
    disconnectDevice,
  };
};
