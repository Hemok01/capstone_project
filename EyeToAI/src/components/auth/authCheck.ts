// src/utils/authCheck.ts
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export const checkConnection = async (userId: string | null) => {
  if (!userId) return false;

  try {
    const connectionDoc = await firestore()
      .collection('connections')
      .where('childId', '==', userId)
      .limit(1)
      .get();

    return !connectionDoc.empty;
  } catch (error) {
    console.error('연동 확인 중 오류:', error);
    return false;
  }
};
