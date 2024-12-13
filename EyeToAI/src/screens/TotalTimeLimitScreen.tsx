import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {NativeModules} from 'react-native';

const {UsageModule} = NativeModules;

const TotalTimeLimitScreen = ({navigation}: {navigation: any}) => {
  const [totalTimeLimit, setTotalTimeLimit] = useState<number>(0);
  const [currentUsage, setCurrentUsage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTimeLimitData = async () => {
      setIsLoading(true);
      try {
        // 캐시에서 데이터 가져오기
        const cachedTotalTimeLimit =
          await UsageModule.getCachedTotalTimeLimit();
        const cachedTotalUsageTime =
          await UsageModule.getCachedTotalUsageTime();

        setTotalTimeLimit(cachedTotalTimeLimit || 0);
        setCurrentUsage(cachedTotalUsageTime || 0);

        // 원격 데이터 확인 (최신화)
        const remoteTimeLimit = await UsageModule.getTotalTimeLimit();
        const remoteUsage = await UsageModule.getUsageByDate(
          new Date().toISOString().split('T')[0],
        );

        if (remoteTimeLimit !== cachedTotalTimeLimit) {
          setTotalTimeLimit(remoteTimeLimit);
          UsageModule.updateTotalTimeLimitCache(remoteTimeLimit);
        }

        if (remoteUsage?.usageTime !== cachedTotalUsageTime) {
          setCurrentUsage(remoteUsage?.usageTime || 0);
          UsageModule.updateTotalUsageTimeCache(remoteUsage?.usageTime || 0);
        }
      } catch (error) {
        console.error('시간 제한 데이터 가져오기 실패:', error);
        Alert.alert(
          '오류',
          '시간 제한 데이터를 가져오는 중 문제가 발생했습니다.',
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeLimitData();
  }, []);

  const handleSave = async () => {
    try {
      await UsageModule.setTotalTimeLimit(totalTimeLimit);
      Alert.alert('저장 완료', '시간 제한이 저장되었습니다.');
    } catch (error) {
      console.error('시간 제한 저장 실패:', error);
      Alert.alert('오류', '시간 제한 저장 중 문제가 발생했습니다.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#8CD9F0" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>총 시간 제한 설정</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>현재 사용 시간</Text>
          <Text style={styles.usageText}>
            {Math.floor(currentUsage / 60)}시간 {currentUsage % 60}분
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>총 시간 제한 (분)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={String(totalTimeLimit)}
            onChangeText={text => setTotalTimeLimit(Number(text) || 0)}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>저장</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  usageText: {
    fontSize: 16,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 8,
    textAlign: 'center',
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  saveButton: {
    backgroundColor: '#8CD9F0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});

export default TotalTimeLimitScreen;
