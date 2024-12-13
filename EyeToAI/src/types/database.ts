import type {Timestamp} from '@react-native-firebase/firestore';

// 기본 사용자 정보
export interface User {
  email: string;
  name: string;
  userType: 'parent' | 'child';
  deviceId?: string; // child인 경우만
  gender?: string;
  age?: number;
}

// 디바이스 정보
export interface Device {
  name: string;
  status: 'active' | 'inactive';
  lastActive: Timestamp;
}

// 연결 정보
export interface Connection {
  deviceId: string;
  parentId: string;
  status: 'connected' | 'disconnected';
  lastSync: Timestamp;
}

// 사용 데이터
export interface Usage {
  deviceId: string;
  date: string;
  timeLimit: number;
  usageTime: number;
  status: 'normal' | 'exceeded';
  restrictions: {
    isBlocked: boolean;
    blockedApps: string[];
  };
  weeklyLimits?: {
    [key: string]: number; // 요일별 시간제한
  };
  appLimits: {
    packageName: string;
    timeLimit: number;
  }[];
  activeHours?: {
    start: string;
    end: string;
  };
  appUsages?: {
    appName: string;
    packageName: string;
    usageTime: number;
    category: string;
  }[];
}

// 알림 데이터
export interface Notification {
  deviceId: string;
  parentId: string;
  type: 'warning' | 'alert' | 'info';
  message: string;
  timestamp: Timestamp;
  isRead: boolean;
}

// 앱 사용 시간대별 데이터 (필요한 경우)
export interface TimeSlot {
  hour: number;
  usage: number; // 분 단위
}

// 부모 앱에서 표시하는 통합된 디바이스 사용 데이터
export interface DeviceUsageData {
  deviceId: string;
  deviceName: string;
  childName: string;
  date: string;
  timeLimit: number;
  usageTime: number;
  status: 'normal' | 'exceeded';
  restrictions: {
    isBlocked: boolean;
    blockedApps: string[];
  };
  appUsages?: {
    appName: string;
    packageName: string;
    usageTime: number;
    category: string;
    timeLimit?: number;
  }[];
}
