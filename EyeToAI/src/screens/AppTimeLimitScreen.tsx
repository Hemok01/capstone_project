import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Button,
  TouchableOpacity,
  Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {NativeModules} from 'react-native';

const {UsageModule} = NativeModules;

interface App {
  packageName: string;
  appName: string;
  timeLimit: number;
  usageTime: number;
}

const AppTimeLimitScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const [apps, setApps] = useState<App[]>([]);
  const [blockedApps, setBlockedApps] = useState<string[]>([]);

  const fetchAppSettings = async () => {
    try {
      // 원격에서 설치된 앱 목록 가져오기
      const installedApps = await UsageModule.fetchInstalledApps();

      // 원격에서 차단 앱 목록 가져오기
      const blockedApps = await UsageModule.fetchBlockedApps();

      // 원격에서 앱 사용 데이터 가져오기
      const appUsages = await UsageModule.fetchAppUsages();

      // 데이터 통합
      setApps(
        installedApps.map((app: any) => {
          const usage = appUsages.find(
            (u: any) => u.packageName === app.packageName,
          );
          return {
            packageName: app.packageName,
            appName: app.appName,
            timeLimit: usage?.timeLimit || 0,
            usageTime: usage?.usageTime || 0,
          };
        }),
      );

      setBlockedApps(blockedApps);
    } catch (error) {
      console.error('설정 데이터 불러오기 실패:', error);
      Alert.alert('오류', '설정 데이터를 가져오는 중 문제가 발생했습니다.');
    }
  };

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = navigation.addListener('focus', () => {
      if (isMounted) {
        fetchAppSettings();
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [navigation]);

  const handleTimeLimitChange = (packageName: string, timeLimit: number) => {
    setApps(prevApps =>
      prevApps.map(app =>
        app.packageName === packageName ? {...app, timeLimit} : app,
      ),
    );
  };

  const handleBlockApp = (packageName: string) => {
    setBlockedApps(prev =>
      prev.includes(packageName)
        ? prev.filter(app => app !== packageName)
        : [...prev, packageName],
    );
  };

  const handleSaveSettings = async () => {
    try {
      // 앱 사용 제한 설정 업데이트
      const appUsages = apps
        .filter(app => app.timeLimit > 0)
        .map(app => ({
          packageName: app.packageName,
          appName: app.appName,
          timeLimit: app.timeLimit,
          usageTime: app.usageTime,
        }));

      // 차단 앱 목록과 앱 사용 데이터 업데이트
      await Promise.all([
        UsageModule.updateBlockedApps(blockedApps),
        UsageModule.updateAppUsages(appUsages),
      ]);

      Alert.alert('저장 완료', '설정이 저장되었습니다.');
    } catch (error) {
      console.error('설정 저장 실패:', error);
      Alert.alert('오류', '설정 저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>앱 시간 제한 및 차단</Text>
      </View>

      <ScrollView>
        {apps.map(app => (
          <View key={app.packageName} style={styles.appCard}>
            <View style={styles.appInfo}>
              <View style={styles.appNameContainer}>
                <Text
                  style={[
                    styles.appName,
                    blockedApps.includes(app.packageName) &&
                      styles.blockedAppName,
                  ]}>
                  {app.appName}
                </Text>
                {app.usageTime > 0 && (
                  <Text style={styles.usageTime}>
                    사용시간: {Math.round(app.usageTime / 60)}분
                  </Text>
                )}
              </View>
              <View style={styles.timeLimitContainer}>
                <TextInput
                  style={styles.timeInput}
                  value={String(app.timeLimit)}
                  onChangeText={value =>
                    handleTimeLimitChange(app.packageName, Number(value) || 0)
                  }
                  keyboardType="number-pad"
                  placeholder="0"
                />
                <Text style={styles.timeUnit}>분</Text>
              </View>
            </View>
            <Button
              title={
                blockedApps.includes(app.packageName) ? '차단 해제' : '차단'
              }
              onPress={() => handleBlockApp(app.packageName)}
              color={blockedApps.includes(app.packageName) ? 'red' : 'blue'}
            />
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
        <Text style={styles.saveButtonText}>저장</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
  },
  appCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appInfo: {
    marginBottom: 12,
  },
  appNameContainer: {
    marginBottom: 8,
  },
  appName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  blockedAppName: {
    textDecorationLine: 'line-through',
    color: 'red',
  },
  usageTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  timeLimitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInput: {
    width: 60,
    height: 40,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 8,
    marginRight: 8,
    textAlign: 'center',
  },
  timeUnit: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#8CD9F0',
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AppTimeLimitScreen;
