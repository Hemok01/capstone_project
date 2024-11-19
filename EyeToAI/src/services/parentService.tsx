// services/parentService.ts
import firestore from '@react-native-firebase/firestore';
import {Device, Connection, User, DeviceUsageData} from '../types/database';
import {UsageService} from './usageService';
import DeviceInfo from 'react-native-device-info';
import {Platform} from 'react-native';
import {Usage} from '../types/database';
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

  static async getChildConnections(parentId: string) {
    const connectionsSnapshot = await firestore()
      .collection('connections')
      .where('parentId', '==', parentId)
      .where('status', '==', 'active')
      .get();

    const childConnections = [];
    for (const doc of connectionsSnapshot.docs) {
      const connection = doc.data() as Connection;
      const childDoc = await firestore()
        .collection('users')
        .doc(connection.deviceId)
        .get();

      const childData = childDoc.data() as User;
      if (childData?.userType === 'child') {
        childConnections.push({
          ...connection,
          childName: childData.name,
        });
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
    // usage 데이터를 명시적으로 Usage 타입으로 캐스팅
    const usage = usageDoc.exists ? (usageDoc.data() as Usage) : null;

    if (!usage) return null;

    return UsageService.convertToParentFormat(usage, device.name, device.name);
  }
}
