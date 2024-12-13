import firestore from '@react-native-firebase/firestore';
import {
  Device,
  Connection,
  User,
  DeviceUsageData,
  Usage,
} from '../types/database';
import {UsageService} from './usageService';
import DeviceInfo from 'react-native-device-info';
import {Platform} from 'react-native';

interface ChildConnectionWithName extends Connection {
  childName: string;
}

export class ParentService {
  static async createDevice(
    deviceId: string,
    childId: string,
  ): Promise<Device> {
    const deviceRef = firestore().collection('devices').doc(deviceId);
    const deviceDoc = await deviceRef.get();

    if (!deviceDoc.exists) {
      const deviceData: Device = {
        childId,
        parentId: '',
        name: '자녀의 기기',
        model: await DeviceInfo.getModel(),
        platform: Platform.OS,
        status: 'active',
        lastConnected: firestore.Timestamp.now(),
        settings: {
          dailyLimit: 480,
          notifications: true,
        },
      };

      await deviceRef.set(deviceData);
      return deviceData;
    }

    return deviceDoc.data() as Device;
  }

  static async getChildConnections(
    parentId: string,
  ): Promise<ChildConnectionWithName[]> {
    const connectionsSnapshot = await firestore()
      .collection('connections')
      .where('parentId', '==', parentId)
      .where('status', '==', 'active')
      .get();

    const childConnections: ChildConnectionWithName[] = [];
    for (const doc of connectionsSnapshot.docs) {
      const connection = doc.data() as Connection;

      // Use Promise.all to fetch all child documents in parallel
      const childPromises = connection.deviceIds.map(deviceId =>
        firestore().collection('users').doc(deviceId).get(),
      );

      const childDocs = await Promise.all(childPromises);

      for (const childDoc of childDocs) {
        const childData = childDoc.data() as User;
        if (childData?.userType === 'child') {
          childConnections.push({
            ...connection,
            childName: childData.name,
          });
          break; // Only add the connection once per child
        }
      }
    }

    return childConnections;
  }

  static async fetchDeviceData(
    deviceId: string,
  ): Promise<DeviceUsageData | null> {
    const today = new Date().toISOString().split('T')[0];
    const [deviceDoc, usageDoc] = await Promise.all([
      firestore().collection('devices').doc(deviceId).get(),
      firestore().collection('usage').doc(`${deviceId}_${today}`).get(),
    ]);

    if (!deviceDoc.exists) return null;

    const device = deviceDoc.data() as Device;
    const usage = usageDoc.exists ? (usageDoc.data() as Usage) : null;

    if (!usage) return null;

    return UsageService.convertToParentFormat(usage, device.name, device.name);
  }
}
