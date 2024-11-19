import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

interface DeviceConnection {
  deviceId: string; // 자녀 기기의 고유 ID
  parentId: string; // 부모의 Firebase Auth ID
  status: 'active' | 'inactive';
  createdAt: FirebaseFirestoreTypes.Timestamp;
}
