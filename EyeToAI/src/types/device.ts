import {Timestamp} from '@react-native-firebase/firestore';
// src/types/device.ts

export interface Device {
  deviceId: string; // id 대신 deviceId 사용
  childId: string;
  parentId: string;
  name: string;
  model: string;
  platform: string;
  osVersion: string; // osVersion 추가
  status: 'active' | 'inactive' | 'pending';
  deviceStatus: 'normal' | 'restricted' | 'blocked';
  lastConnected: Timestamp;
  settings: {
    dailyLimit: number;
    notifications: boolean;
  };
}

export interface DeviceConnection {
  deviceId: string;
  childId: string;
  parentId: string;
  connectedAt: Date;
  status: 'active' | 'revoked';
}

export interface UsageData {
  deviceId: string;
  childId: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  appUsage: {
    [appId: string]: number; // duration in minutes
  };
}

// Navigation params with device ID
export type RootStackParamList = {
  ParentDashboard: undefined;
  ChildDashboard: {deviceId: string};
  QRScan: undefined;
  QRCode: {deviceId: string; childId: string};
  DeviceSettings: {deviceId: string};
};
