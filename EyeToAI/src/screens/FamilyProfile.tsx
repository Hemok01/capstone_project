import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';
import {Header} from '../components/common/Header';
import {ProfileSection} from '../components/ProfileSection';
import {RouteProp} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Android에서 LayoutAnimation 사용하기 위한 설정
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'FamilyProfile'>;
  route: RouteProp<RootStackParamList, 'FamilyProfile'>;
};

interface ChildProfile {
  childId: string;
  deviceId: string;
  name: string;
  status: 'active' | 'inactive';
  isSelected?: boolean;
}

const FamilyProfileScreen = ({navigation, route}: Props) => {
  const [childExpanded, setChildExpanded] = useState(true);
  const [parentExpanded, setParentExpanded] = useState(true);
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    const fetchChildProfiles = async () => {
      const parentId = auth().currentUser?.uid;
      if (!parentId) return;

      try {
        const connectionsSnapshot = await firestore()
          .collection('connections')
          .where('parentId', '==', parentId)
          .where('status', '==', 'connected')
          .get();

        const childPromises = connectionsSnapshot.docs.map(async doc => {
          const connection = doc.data();
          const childDoc = await firestore()
            .collection('users')
            .doc(connection.deviceId)
            .get();

          return {
            childId: connection.childId,
            deviceId: connection.deviceId,
            name: childDoc.data()?.name || '',
            status: connection.status,
            isSelected: false,
          } as ChildProfile;
        });

        setChildProfiles(await Promise.all(childPromises));
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const parentId = auth().currentUser?.uid;
    if (!parentId) return;

    fetchChildProfiles();

    return firestore()
      .collection('connections')
      .where('parentId', '==', parentId)
      .where('status', '==', 'connected')
      .onSnapshot(fetchChildProfiles);
  }, []);

  const handleDeviceSelect = async (deviceId: string, childName: string) => {
    const parentId = auth().currentUser?.uid;
    if (!parentId) return;

    try {
      // 현재 선택된 상태 확인
      const isCurrentlySelected = childProfiles.find(
        profile => profile.deviceId === deviceId,
      )?.isSelected;

      // 선택 해제인 경우 null로, 선택인 경우 해당 값으로 업데이트
      const updateData = isCurrentlySelected
        ? {
            selectedDeviceId: null,
            selectedChildName: null,
          }
        : {
            selectedDeviceId: deviceId,
            selectedChildName: childName,
          };

      // Firestore 업데이트
      await firestore().collection('users').doc(parentId).update(updateData);

      // 로컬 상태 업데이트
      setSelectedDeviceId(isCurrentlySelected ? '' : deviceId);
      setChildProfiles(profiles =>
        profiles.map(profile => ({
          ...profile,
          isSelected:
            profile.deviceId === deviceId ? !isCurrentlySelected : false,
        })),
      );

      // ParentDashboard로 이동
      navigation.navigate('ParentDashboard', {userType: 'parent'});
    } catch (error) {
      console.error('Error updating selected device:', error);
    }
  };

  const toggleSection = (section: 'child' | 'parent') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (section === 'child') {
      setChildExpanded(!childExpanded);
    } else {
      setParentExpanded(!parentExpanded);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="가족 구성" onBack={() => navigation.goBack()} />
      <Text style={styles.description}>우리 가족 프로필을 등록해주세요.</Text>

      <View style={styles.profilesContainer}>
        <ProfileSection
          title="자녀 프로필"
          isExpanded={childExpanded}
          onPress={() => toggleSection('child')}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#8CD9F0" />
            </View>
          ) : (
            childProfiles.map(child => (
              <TouchableOpacity
                key={child.deviceId}
                style={[
                  styles.childProfile,
                  child.isSelected && styles.selectedChildProfile,
                ]}
                onPress={() => handleDeviceSelect(child.deviceId, child.name)}>
                <View style={styles.childInfo}>
                  <Text style={styles.childName}>{child.name}</Text>
                  <Text style={styles.deviceId}>
                    Device ID: {child.deviceId}
                  </Text>
                </View>
                <View style={styles.selectButton}>
                  <Text style={styles.selectText}>
                    {child.isSelected ? '연결 해제' : '연결하기'}
                  </Text>
                  <MaterialIcons
                    name={
                      child.isSelected
                        ? 'check-circle'
                        : 'radio-button-unchecked'
                    }
                    size={24}
                    color="#8CD9F0"
                  />
                </View>
              </TouchableOpacity>
            ))
          )}
        </ProfileSection>

        <ProfileSection
          title="보호자 프로필"
          isExpanded={parentExpanded}
          onPress={() => toggleSection('parent')}
        />
      </View>

      <TouchableOpacity
        style={styles.qrButton}
        onPress={() => navigation.navigate('QRCode')}>
        <Text style={styles.qrButtonText}>+ 가족 인증 QR코드</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginTop: 20,
    marginBottom: 24,
    marginHorizontal: 16,
  },
  profilesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  qrButton: {
    margin: 16,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
  },
  qrButtonText: {
    fontSize: 16,
    color: '#666',
  },
  childProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  childName: {
    fontSize: 16,
    color: '#333',
  },
  childStatus: {
    fontSize: 14,
    color: '#666',
  },

  selectedChildProfile: {
    borderColor: '#8CD9F0',
    backgroundColor: '#F5FBFF',
  },
  childInfo: {
    flex: 1,
  },

  deviceId: {
    fontSize: 12,
    color: '#666',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  selectText: {
    fontSize: 14,
    color: '#8CD9F0',
  },
});

export default FamilyProfileScreen;
