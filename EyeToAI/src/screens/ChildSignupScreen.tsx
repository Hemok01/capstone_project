import React, {useState} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {ConnectionStatus} from '../components/common/ConnectionStatus';
import ItoaiLogo2 from '../assets/icons/itoai-icon2.svg';
import {SvgProps} from 'react-native-svg';
import {RouteProp} from '@react-navigation/native'; // 추가

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SignUp'>;
  route: RouteProp<RootStackParamList, 'SignUp'>;
};

const ChildSignUpScreen = ({navigation, route}: Props) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [parentCode, setParentCode] = useState(''); // QR 스캔에서 받은 코드

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('오류', '모든 필드를 입력해주세요.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      // 1. 계정 생성
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );

      // 2. 사용자 정보 저장
      await firestore().collection('users').doc(userCredential.user.uid).set({
        name,
        email,
        userType: 'child',
        parentId: parentCode, // QR 코드에서 받은 부모 ID
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      // 3. 연동 정보 저장
      await firestore().collection('connections').add({
        childId: userCredential.user.uid,
        parentId: parentCode,
        status: 'active',
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert('성공', '회원가입이 완료되었습니다.', [
        {
          text: '확인',
          onPress: () => {
            navigation.replace('ChildDashboard', {
              userType: 'child',
            });
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('오류', error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.logoContainer}>
        <ItoaiLogo2 width={600} height={200} {...({} as SvgProps)} />
      </View>

      <ConnectionStatus isConnected={!!parentCode} deviceName="부모님 계정" />

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="이름"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="이메일"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="비밀번호 확인"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => navigation.navigate('QRScan')}>
          <Text style={styles.scanButtonText}>QR 코드 스캔</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.signupButton, !parentCode && styles.disabledButton]}
          onPress={handleSignUp}
          disabled={!parentCode}>
          <Text style={styles.signupButtonText}>회원가입</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  logoContainer: {
    marginTop: '15%',
    marginBottom: '10%',
    alignItems: 'center',
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  scanButton: {
    backgroundColor: '#AFE3F0',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: '#AFE3F0',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  signupButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#E5E5E5',
  },
});

export default ChildSignUpScreen;
