import {useEffect, useState} from 'react';
import {NativeModules, NativeEventEmitter, Platform} from 'react-native';

const {AppControlModule} = NativeModules;

interface AppUsageData {
  packageName: string;
  totalTimeInForeground: number;
  lastTimeUsed: number;
}

export const useAppControl = () => {
  const [hasPermissions, setHasPermissions] = useState(false);
  const [restrictedApps, setRestrictedApps] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(AppControlModule);
    const subscription = eventEmitter.addListener('AppStateChanged', event => {
      loadRestrictedApps();
    });

    return () => subscription.remove();
  }, []);

  const checkPermissions = async () => {
    try {
      const result = await AppControlModule.checkPermissions();
      setHasPermissions(result);
    } catch (error) {
      console.error('Permission check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermissions = () => {
    AppControlModule.requestPermissions();
  };

  const getAppUsageStats = async (
    startTime: number,
    endTime: number,
  ): Promise<AppUsageData[]> => {
    try {
      return await AppControlModule.getAppUsageStats(startTime, endTime);
    } catch (error) {
      console.error('Failed to get app usage stats:', error);
      return [];
    }
  };

  const loadRestrictedApps = async () => {
    try {
      const apps = await AppControlModule.getRestrictedApps();
      setRestrictedApps(apps);
    } catch (error) {
      console.error('Failed to load restricted apps:', error);
    }
  };

  const restrictApp = async (packageName: string) => {
    try {
      await AppControlModule.restrictApp(packageName);
      await loadRestrictedApps();
      return true;
    } catch (error) {
      console.error('Failed to restrict app:', error);
      return false;
    }
  };

  const unrestrictApp = async (packageName: string) => {
    try {
      await AppControlModule.unrestrictApp(packageName);
      await loadRestrictedApps();
      return true;
    } catch (error) {
      console.error('Failed to unrestrict app:', error);
      return false;
    }
  };

  const setAppTimeLimit = async (
    packageName: string,
    limitInMinutes: number,
  ) => {
    try {
      await AppControlModule.setAppTimeLimit(packageName, limitInMinutes);
      return true;
    } catch (error) {
      console.error('Failed to set app time limit:', error);
      return false;
    }
  };

  const getAppTimeLimit = async (packageName: string): Promise<number> => {
    try {
      return await AppControlModule.getAppTimeLimit(packageName);
    } catch (error) {
      console.error('Failed to get app time limit:', error);
      return -1;
    }
  };

  return {
    hasPermissions,
    restrictedApps,
    isLoading,
    requestPermissions,
    getAppUsageStats,
    restrictApp,
    unrestrictApp,
    setAppTimeLimit,
    getAppTimeLimit,
  };
};
