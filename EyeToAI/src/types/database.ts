// types/database.ts
import type {Timestamp} from '@react-native-firebase/firestore';

// 기본 사용자 정보
export interface User {
  name: string;
  email: string;
  userType: 'parent' | 'child';
  createdAt: Timestamp;
  parentId?: string;
  deviceIds?: string[];
  settings?: {
    notifications: boolean;
    theme: string;
  };
}

// 시간대별 사용 정보
export interface TimeSlot {
  hour: number;
  usage: number; // 분 단위
}

// 기본 앱 사용 정보
export interface BaseAppUsage {
  appId: string;
  packageName: string;
  appName: string;
  usageTime: number; // 분 단위
  timeLimit: number; // 분 단위
  category: string;
}

// Firestore에 저장되는 앱 사용 정보
export interface AppUsageData extends BaseAppUsage {
  startTime: Timestamp;
  endTime: Timestamp;
}

// 자녀 앱에서 사용하는 앱 사용 정보
export interface AppUsage extends BaseAppUsage {
  firstTimeStamp: number; // Unix timestamp
  lastTimeStamp: number; // Unix timestamp
}

// Firestore에 저장되는 사용 데이터
export interface Usage {
  childId: string;
  deviceId: string;
  date: string; // YYYY-MM-DD 형식
  totalUsage: number; // 분 단위
  totalLimit: number; // 분 단위
  appUsage: AppUsageData[];
  timeSlotUsage: TimeSlot[];
  lastUpdated: Timestamp;
}

// 자녀 앱에서 사용하는 사용 데이터
export interface UsageData {
  id: string;
  childId: string;
  deviceId: string;
  date: string; // YYYY-MM-DD 형식
  totalUsage: number; // 분 단위
  totalLimit: number; // 분 단위
  appUsage: AppUsage[];
  timeSlotUsage: TimeSlot[];
  lastUpdated: Timestamp;
}

// 기기 정보
export interface Device {
  childId: string;
  parentId: string;
  name: string;
  model: string;
  platform: string;
  status: 'active' | 'inactive';
  lastConnected: Timestamp;
  settings: {
    dailyLimit: number; // 분 단위
    notifications: boolean;
  };
}

// 부모-자녀 연결 정보
export interface Connection {
  parentId: string;
  childId: string;
  deviceIds: string[];
  status: 'active' | 'inactive';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// QR 코드 연결 정보
export interface ConnectionCode {
  parentId: string;
  createdAt: Timestamp;
  expiresAt: Date;
  isUsed: boolean;
  isExpired: boolean;
  deviceIds: string[];
  maxDevices: number;
}

// 부모 앱에서 표시하는 디바이스 사용 데이터
export interface DeviceUsageData {
  deviceId: string;
  deviceName: string;
  childName: string;
  usage: {
    totalUsage: number; // 분 단위
    totalLimit: number; // 분 단위
    appUsage: Array<{
      appName: string;
      usageTime: number; // 분 단위
      timeLimit: number; // 분 단위
    }>;
  };
}
export interface DetailedAppUsage extends AppUsageBase {
  firstTimeStamp: number; // Unix timestamp
  lastTimeStamp: number; // Unix timestamp
}

export interface AppUsageBase {
  appId: string;
  packageName: string;
  appName: string;
  usageTime: number; // 분 단위
  timeLimit: number; // 분 단위
  category: string;
  startTime: Timestamp;
  endTime: Timestamp;
}
