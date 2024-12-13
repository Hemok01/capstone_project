import React, {useState, useEffect} from 'react';
import {Text, View, TouchableOpacity, StyleSheet} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import firestore from '@react-native-firebase/firestore';

type ProfileCardProps = {
  deviceId: string;
};

const ProfileCard = ({deviceId}: ProfileCardProps) => {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const userDoc = await firestore()
          .collection('users')
          .where('deviceId', '==', deviceId)
          .get();

        if (!userDoc.empty) {
          setUserName(userDoc.docs[0].data().name);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUserName();
  }, [deviceId]);

  return (
    <TouchableOpacity style={styles.profileCard}>
      <View style={styles.profileContent}>
        <Text style={styles.profileText}>{userName}님 오늘도 화이팅!</Text>
        <View style={styles.profileCircle} />
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#666" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  profileContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  profileCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8CD9F0',
    marginLeft: 8,
  },
});

export default ProfileCard;
