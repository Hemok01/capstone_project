//src.types.navigation.ts

export type RootStackParamList = {
  SelectType: undefined;
  Login: {
    userType: 'parent' | 'child';
  };
  SignUp: {
    userType: 'parent' | 'child';
    parentId?: string;
    deviceId?: string;
  };
  ParentDashboard: {
    userType: 'parent';
    userId?: string;
  };
  FamilyProfile: {
    userType: 'parent';
  };
  QRCode: undefined;
  UsageReport: {
    deviceId: string;
    reportType: 'total' | 'apps' | 'routine' | 'ai';
  };
  ChildDashboard: {
    userType: 'child';
    deviceId: string;
  };
  QRScan: undefined;
  UsageTrackerTest: undefined;
  FamilyAuth: {
    userType: 'child';
  };
  TimeManagement: undefined;
  AppTimeLimit: undefined;
  TotalTimeLimit: undefined;
  WeeklyTimeLimit: undefined;
  DayTimeLimit: {
    day: string;
  };
  SleepTimeLimit: undefined;
  Report: {
    totalTime: number;
    targetTime: number;
  };

  SelfEvaluation: undefined;
  LifePatternComic: undefined;
};
