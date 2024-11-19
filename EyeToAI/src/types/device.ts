// src/types/device.ts

export interface Device {
  childId: string;
  parentId: string;
  name: string;
  model: string;
  platform: string;
  status: 'active' | 'inactive';
  lastConnected: timestamp;
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
