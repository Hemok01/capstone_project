import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Header} from '../components/common/Header';

type FamilyAuthScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'FamilyAuth'
>;

const FamilyAuthScreen: React.FC<FamilyAuthScreenProps> = ({
  navigation,
  route,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <Header title="가족인증" onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="family-restroom" size={100} color="#AFE3F0" />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>보호자 QR코드를 스캔해주세요</Text>
          <Text style={styles.description}>
            부모님의 QR코드를 스캔하면{'\n'}
            자녀 계정이 자동으로 연동됩니다
          </Text>
        </View>

        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => navigation.navigate('QRScan')}>
          <MaterialIcons name="qr-code-scanner" size={24} color="white" />
          <Text style={styles.scanButtonText}>코드 스캔</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.helpContainer}>
        <TouchableOpacity style={styles.helpButton}>
          <MaterialIcons name="help-outline" size={20} color="#666" />
          <Text style={styles.helpText}>QR코드는 어디에서 찾나요?</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginBottom: 40,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  scanButton: {
    flexDirection: 'row',
    backgroundColor: '#AFE3F0',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  helpContainer: {
    padding: 20,
    alignItems: 'center',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  helpText: {
    marginLeft: 4,
    color: '#666',
    fontSize: 14,
  },
});

export default FamilyAuthScreen;
