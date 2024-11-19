// services/usageService.ts
import firestore from '@react-native-firebase/firestore';
import {
  Usage,
  UsageData,
  AppUsage,
  AppUsageData,
  DeviceUsageData,
  TimeSlot,
} from '../types/database';

export class UsageService {
  // 사용 데이터 저장
  static async updateUsageData(
    deviceId: string,
    usageData: UsageData,
  ): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const docRef = firestore().collection('usage').doc(`${deviceId}_${today}`);

    try {
      const firestoreData = this.convertToFirestoreFormat(usageData);
      await docRef.set(firestoreData, {merge: true});
      console.log('Usage data updated successfully');
    } catch (error) {
      console.error('Error updating usage data:', error);
      throw error;
    }
  }

  // 자녀 앱 데이터를 Firestore 형식으로 변환
  static convertToFirestoreFormat(usageData: UsageData): Usage {
    const appUsage: AppUsageData[] = usageData.appUsage.map(app => ({
      appId: app.appId,
      packageName: app.packageName,
      appName: app.appName,
      usageTime: app.usageTime,
      timeLimit: app.timeLimit,
      category: app.category,
      startTime: firestore.Timestamp.fromMillis(app.firstTimeStamp),
      endTime: firestore.Timestamp.fromMillis(app.lastTimeStamp),
    }));

    return {
      childId: usageData.childId,
      deviceId: usageData.deviceId,
      date: usageData.date,
      totalUsage: usageData.totalUsage,
      totalLimit: usageData.totalLimit,
      appUsage,
      timeSlotUsage: usageData.timeSlotUsage,
      lastUpdated: firestore.Timestamp.now(),
    };
  }

  // Firestore 데이터를 부모 앱 표시 형식으로 변환
  static convertToParentFormat(
    usage: Usage,
    deviceName: string,
    childName: string,
  ): DeviceUsageData {
    return {
      deviceId: usage.deviceId,
      deviceName,
      childName,
      usage: {
        totalUsage: usage.totalUsage,
        totalLimit: usage.totalLimit,
        appUsage: usage.appUsage.map(app => ({
          appName: app.appName,
          usageTime: app.usageTime,
          timeLimit: app.timeLimit,
        })),
      },
    };
  }

  // TimeSlot 생성 헬퍼 함수
  static createEmptyTimeSlots(): TimeSlot[] {
    return Array.from({length: 24}, (_, i) => ({
      hour: i,
      usage: 0,
    }));
  }

  // 앱 사용 시간 업데이트
  static async updateAppUsage(
    deviceId: string,
    appUsage: AppUsage[],
  ): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const docRef = firestore().collection('usage').doc(`${deviceId}_${today}`);

    try {
      const convertedAppUsage = appUsage.map(app => ({
        appId: app.appId,
        packageName: app.packageName,
        appName: app.appName,
        usageTime: app.usageTime,
        timeLimit: app.timeLimit,
        category: app.category,
        startTime: firestore.Timestamp.fromMillis(app.firstTimeStamp),
        endTime: firestore.Timestamp.fromMillis(app.lastTimeStamp),
      }));

      await docRef.update({
        appUsage: convertedAppUsage,
        lastUpdated: firestore.Timestamp.now(),
      });
      console.log('App usage updated successfully');
    } catch (error) {
      console.error('Error updating app usage:', error);
      throw error;
    }
  }
}
