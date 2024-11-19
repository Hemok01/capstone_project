// src/types/usage.ts
import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

export interface AppUsage {
  appId: string;
  appName: string;
  category: string;
  firstTimeStamp: number;
  lastTimeStamp: number;
  packageName: string;
  timeLimit: number;
  usageTime: number;
}

export interface DetailedAppUsage extends AppUsage {
  firstTimeStamp: number;
  lastTimeStamp: number;
}

export interface TimeSlotUsage {
  hour: number;
  usage: number; // 분 단위
}

export interface UsageData {
  id: string;
  childId: string;
  date: string;
  totalUsage: number;
  totalLimit: number;
  appUsage: AppUsage[];
  timeSlotUsage: TimeSlotUsage[];
}
