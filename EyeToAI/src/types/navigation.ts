export type RootStackParamList = {
  // 공통 화면
  SelectType: undefined;
  Login: {
    userType: 'parent' | 'child';
  };
  SignUp: {
    userType: 'parent' | 'child';
    parentId?: string;
    connectionCode?: string;
    deviceId?: string;
  };

  // 부모용 화면
  ParentDashboard: {
    userType: 'parent';
  };
  FamilyProfile: {
    userType: 'parent';
  };
  QRCode: undefined;
  UsageReport: {
    deviceId: string;
    reportType: 'total' | 'apps' | 'routine' | 'ai';
  };

  // 자녀용 화면
  ChildDashboard: {
    userType: 'child';
  };
  QRScan: undefined; // 단순화: deviceInfo를 내부 상태로 관리
  UsageTrackerTest: undefined;
  FamilyAuth: {
    userType: 'child';
  };
};
