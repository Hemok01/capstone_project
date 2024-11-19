// src/types/user.ts
export interface User {
    id: string;
    email: string;
    name: string;
    userType: 'parent' | 'child';
  }

  export interface ChildUsageData {
    appName: string;
    usageTime: number;
    limit: number;
  }