// src/screens/SignUpScreen.tsx
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {ConnectionStatus} from '../components/common/ConnectionStatus';
import ItoaiLogo2 from '../assets/icons/itoai-icon2.svg';
import {SvgProps} from 'react-native-svg';
import {RouteProp} from '@react-navigation/native';
import {DeviceManager} from '../utils/device';
type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SignUp'>;
  route: RouteProp<RootStackParamList, 'SignUp'>;
};

const SignUpScreen = ({navigation, route}: Props) => {
  const {userType} = route.params;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [parentType, setParentType] = useState('');
  const [showParentTypeOptions, setShowParentTypeOptions] = useState(false);
  const [parentCode, setParentCode] = useState(route.params.parentId || '');

  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [showGenderOptions, setShowGenderOptions] = useState(false);

  const parentTypes = ['엄마', '아빠', '기타'];

  const genderTypes = ['남자', '여자'];

  const handleSignUp = async () => {
    if (userType === 'child') {
      if (!name || !age || !gender) {
        Alert.alert('오류', '모든 필드를 입력해주세요.');
        return;
      }

      try {
        // 현재 기기 정보 가져오기
        const deviceInfo = await DeviceManager.getDeviceInfo();

        // 부모 ID와 기기 ID가 없으면 오류
        if (!route.params.parentId || !route.params.deviceId) {
          throw new Error('연결 정보가 없습니다.');
        }

        // Firestore 트랜잭션으로 처리
        await firestore().runTransaction(async transaction => {
          const deviceInfo = await DeviceManager.getDeviceInfo();
          const childId = deviceInfo.id;

          // 1. users 컬렉션에 자녀 정보 저장
          const userRef = firestore().collection('users').doc(childId);
          transaction.set(userRef, {
            name,
            age: parseInt(age, 10),
            gender,
            userType: 'child',
            parentId: route.params.parentId,
            deviceId: deviceInfo.id,
            createdAt: firestore.FieldValue.serverTimestamp(),
          });

          // 2. devices 컬렉션 업데이트
          const deviceRef = firestore()
            .collection('devices')
            .doc(deviceInfo.id);
          transaction.set(deviceRef, {
            // update 대신 set 사용
            childId,
            name: `${name}의 기기`,
            status: 'active',
            updatedAt: firestore.FieldValue.serverTimestamp(),
          });

          // 3. connections 컬렉션
          const connectionRef = firestore()
            .collection('connections')
            .doc(`${route.params.parentId}_${deviceInfo.id}`);

          transaction.set(connectionRef, {
            deviceId: deviceInfo.id,
            childId,
            parentId: route.params.parentId,
            status: 'active',
            createdAt: firestore.FieldValue.serverTimestamp(),
            deviceInfo: {
              name: `${name}의 기기`,
              model: deviceInfo.model,
              platform: deviceInfo.platform,
              osVersion: deviceInfo.osVersion,
            },
          });
        });

        // 로컬 기기 정보 업데이트
        await DeviceManager.updateDeviceInfo({
          childId: route.params.deviceId,
          parentId: route.params.parentId,
          status: 'active',
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
        console.error('회원가입 오류:', error);
        Alert.alert(
          '오류',
          error.message || '회원가입 중 오류가 발생했습니다.',
        );
      }
    } else {
      // 부모 회원가입 로직은 그대로 유지
      if (!name || !email || !password || !confirmPassword) {
        Alert.alert('오류', '모든 필드를 입력해주세요.');
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
        return;
      }

      if (!parentType) {
        Alert.alert('오류', '보호자 구분을 선택해주세요.');
        return;
      }

      try {
        const userCredential = await auth().createUserWithEmailAndPassword(
          email,
          password,
        );

        await firestore().collection('users').doc(userCredential.user.uid).set({
          name,
          email,
          userType: 'parent',
          parentType,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

        navigation.replace('ParentDashboard', {
          userType: 'parent',
          userId: userCredential.user.uid,
        });
      } catch (error: any) {
        Alert.alert('오류', error.message);
      }
    }
  };

  const AgeDropdown = ({
    age,
    setAge,
  }: {
    age: string;
    setAge: (age: string) => void;
  }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const ages = Array.from({length: 8}, (_, i) => i + 8); // 8-15까지

    return (
      <>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setModalVisible(true)}>
          <Text style={[styles.dropdownButtonText, !age && styles.placeholder]}>
            {age ? `${age}세` : '나이'}
          </Text>
          <Text style={styles.dropdownIcon}>∨</Text>
        </TouchableOpacity>

        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>나이 선택</Text>
              </View>
              {ages.map(ageOption => (
                <TouchableOpacity
                  key={ageOption}
                  style={styles.optionButton}
                  onPress={() => {
                    setAge(ageOption.toString());
                    setModalVisible(false);
                  }}>
                  <Text style={styles.optionText}>{ageOption}세</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </>
    );
  };

  // 자녀용 회원가입 폼 수정
  if (userType === 'child') {
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
            placeholder="나이"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            maxLength={2}
          />

          {/* 성별 선택 드롭다운 */}
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowGenderOptions(!showGenderOptions)}>
            <Text
              style={[
                styles.dropdownButtonText,
                !gender && styles.placeholder,
              ]}>
              {gender || '성별'}
            </Text>
            <Text style={styles.dropdownIcon}>∨</Text>
          </TouchableOpacity>

          {showGenderOptions && (
            <View style={styles.optionsContainer}>
              {genderTypes.map(type => (
                <TouchableOpacity
                  key={type}
                  style={styles.optionItem}
                  onPress={() => {
                    setGender(type);
                    setShowGenderOptions(false);
                  }}>
                  <Text style={styles.optionText}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={[styles.signupButton, !parentCode && styles.disabledButton]}
            onPress={handleSignUp}
            disabled={!parentCode}>
            <Text style={styles.signupButtonText}>회원가입</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>회원가입</Text>
        </View>

        {/* 입력 폼 */}
        <View style={styles.formContainer}>
          {/* 이름 입력 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>이름</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="이름"
              returnKeyType="next"
            />
          </View>

          {/* 이메일 입력 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>이메일</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="이메일"
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
            />
          </View>

          {/* 비밀번호 입력 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>비밀번호</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="비밀번호"
              secureTextEntry
              returnKeyType="next"
            />
          </View>

          {/* 비밀번호 확인 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>비밀번호(확인)</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="비밀번호 확인"
              secureTextEntry
              returnKeyType="next"
            />
          </View>

          {/* 보호자 구분 선택 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>보호자 구분</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowParentTypeOptions(!showParentTypeOptions)}>
              <Text
                style={[
                  styles.dropdownButtonText,
                  !parentType && styles.placeholder,
                ]}>
                {parentType || '보호자 구분'}
              </Text>
              <Text style={styles.dropdownIcon}>∨</Text>
            </TouchableOpacity>

            {showParentTypeOptions && (
              <View style={styles.optionsContainer}>
                {parentTypes.map(type => (
                  <TouchableOpacity
                    key={type}
                    style={styles.optionItem}
                    onPress={() => {
                      setParentType(type);
                      setShowParentTypeOptions(false);
                    }}>
                    <Text style={styles.optionText}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* 회원가입 버튼 */}
        <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
          <Text style={styles.signUpButtonText}>회원가입</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
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
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#AFE3F0',
    paddingHorizontal: 16,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    height: '100%',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: 'white',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#white',
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: 'white',
  },
  dropdownButton: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  placeholder: {
    color: '#999',
  },
  dropdownIcon: {
    fontSize: 14,
    color: '#666',
  },
  optionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    marginTop: 4,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  optionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  signUpButton: {
    backgroundColor: '#AFE3F0',
    height: 50,
    borderRadius: 8,
    marginHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 34,
    left: 0,
    right: 0,
  },
  signUpButtonText: {
    color: 'gray',
    fontSize: 16,
    fontWeight: '600',
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

export default SignUpScreen;
