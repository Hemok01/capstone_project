// src/utils/device.ts
import {Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import {Device, DeviceStatus} from '../types/device';

const DEVICE_ID_KEY = '@device_id';
const DEVICE_INFO_KEY = '@device_info';

export const DeviceManager = {
  async generateDeviceId(): Promise<string> {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);

    if (!deviceId) {
      deviceId = `${Platform.OS}-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }

    return deviceId;
  },

  async getDeviceInfo(): Promise<Device> {
    const deviceId = await this.generateDeviceId();
    const cachedInfo = await AsyncStorage.getItem(DEVICE_INFO_KEY);

    if (cachedInfo) {
      return JSON.parse(cachedInfo);
    }

    const deviceInfo: Device = {
      id: deviceId,
      name: await DeviceInfo.getDeviceName(),
      model: DeviceInfo.getModel(),
      platform: Platform.OS as 'ios' | 'android',
      osVersion: Platform.Version.toString(),
      lastConnected: new Date(),
      status: 'pending',
      usage: {
        lastUpdated: new Date(),
        dailyLimit: null,
        weeklyLimit: null,
        restrictions: [],
      },
    };

    await AsyncStorage.setItem(DEVICE_INFO_KEY, JSON.stringify(deviceInfo));
    return deviceInfo;
  },

  async updateDeviceInfo(updates: Partial<Device>): Promise<void> {
    try {
      const currentInfo = await this.getDeviceInfo();
      const updatedInfo = {...currentInfo, ...updates};

      // 로컬 저장소 업데이트
      await AsyncStorage.setItem(DEVICE_INFO_KEY, JSON.stringify(updatedInfo));

      // Firestore 업데이트
      if (updatedInfo.status === 'connected') {
        await firestore()
          .collection('devices')
          .doc(updatedInfo.id)
          .set(updatedInfo, {merge: true});
      }
    } catch (error) {
      console.error('기기 정보 업데이트 중 오류:', error);
      throw error;
    }
  },

  // 기기 사용 정보 동기화
  async syncUsageData(): Promise<void> {
    try {
      const deviceInfo = await this.getDeviceInfo();
      if (deviceInfo.status !== 'connected') return;

      // 현재 사용 정보 수집
      const usageStats = await DeviceInfo.getUsageStats();

      await firestore()
        .collection('devices')
        .doc(deviceInfo.id)
        .collection('usage')
        .add({
          timestamp: firestore.FieldValue.serverTimestamp(),
          stats: usageStats,
          batteryLevel: await DeviceInfo.getBatteryLevel(),
          isCharging: await DeviceInfo.isBatteryCharging(),
        });
    } catch (error) {
      console.error('사용 정보 동기화 중 오류:', error);
      throw error;
    }
  },
};
