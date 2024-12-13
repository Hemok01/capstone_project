import {Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import {Device} from '../types/device';

const DEVICE_ID_KEY = '@device_id';
const DEVICE_INFO_KEY = '@device_info';

export const DeviceManager = {
  async generateDeviceId(): Promise<string> {
    try {
      let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);

      if (!deviceId) {
        // 고유 디바이스 ID 생성
        const uniqueId = await DeviceInfo.getUniqueId();
        const deviceModel = await DeviceInfo.getModel();
        const deviceOS = await DeviceInfo.getSystemVersion();

        // 고유 식별자를 조합
        deviceId = `${uniqueId}-${deviceModel}-${deviceOS}`;
        await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);

        console.log('New deviceId generated:', deviceId);
      } else {
        console.log('Existing deviceId found:', deviceId);
      }

      return deviceId;
    } catch (error) {
      console.error('generateDeviceId error:', error);
      throw new Error('디바이스 ID 생성 실패');
    }
  },

  async getDeviceInfo(): Promise<Device> {
    try {
      const deviceId = await this.generateDeviceId();
      const cachedInfo = await AsyncStorage.getItem(DEVICE_INFO_KEY);

      if (cachedInfo) {
        const parsedInfo = JSON.parse(cachedInfo);
        // 기존 캐시에 deviceId가 없으면 추가
        if (!parsedInfo.deviceId) {
          parsedInfo.deviceId = deviceId;
          await AsyncStorage.setItem(
            DEVICE_INFO_KEY,
            JSON.stringify(parsedInfo),
          );
        }
        return parsedInfo;
      }

      console.log('Gathering device information...');

      const deviceInfo: Device = {
        deviceId,
        childId: '',
        parentId: '',
        name: await DeviceInfo.getDeviceName(),
        model: await DeviceInfo.getModel(),
        platform: Platform.OS,
        osVersion: await DeviceInfo.getSystemVersion(),
        status: 'pending',
        deviceStatus: 'normal',
        lastConnected: firestore.Timestamp.now(),
        settings: {
          dailyLimit: 480,
          notifications: true,
        },
      };

      console.log('Created device info:', deviceInfo);
      await AsyncStorage.setItem(DEVICE_INFO_KEY, JSON.stringify(deviceInfo));

      return deviceInfo;
    } catch (error) {
      console.error('getDeviceInfo error:', error);
      throw new Error('디바이스 정보 가져오기 실패');
    }
  },

  async updateDeviceInfo(updates: Partial<Device>): Promise<void> {
    try {
      console.log('Updating device info with:', updates);
      const currentInfo = await this.getDeviceInfo();
      const updatedInfo = {...currentInfo, ...updates};

      await AsyncStorage.setItem(DEVICE_INFO_KEY, JSON.stringify(updatedInfo));

      if (updatedInfo.status === 'active') {
        await firestore()
          .collection('devices')
          .doc(updatedInfo.deviceId)
          .set(updatedInfo, {merge: true});
      }

      console.log('Device info updated successfully');
    } catch (error) {
      console.error('updateDeviceInfo error:', error);
      throw new Error('디바이스 정보 업데이트 실패');
    }
  },
};
