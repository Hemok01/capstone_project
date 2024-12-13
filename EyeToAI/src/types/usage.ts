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
  totalUsage?: number;
  timeLimit?: number; // timeLimit 추가
  status?: string;
  appUsages?: AppUsage[];
}
