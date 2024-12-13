import {Timestamp} from '@react-native-firebase/firestore';

interface BaseEntity {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
