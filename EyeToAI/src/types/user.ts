// src/types/user.ts
export interface User {
  id: string;
  email: string;
  name: string;
  userType: 'parent' | 'child';
  deviceId: string;
}

export interface ChildUsageData {
  appName: string;
  usageTime: number;
  limit: number;
}
