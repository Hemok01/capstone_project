import React, {useEffect, useRef} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';
import {SvgProps} from 'react-native-svg';

import ItoaiLogo from '../assets/icons/itoai-icon.svg';
import ParentsIcon from '../assets/icons/parents-icon.svg';
import ChildIcon from '../assets/icons/child-icon.svg';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SelectType'>;
};

const SelectTypeScreen = ({navigation}: Props) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;
  const scaleAnim1 = useRef(new Animated.Value(0)).current;
  const scaleAnim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 800,
      delay: 500,
      easing: Easing.out(Easing.back(1.7)),
      useNativeDriver: true,
    }).start();

    Animated.sequence([
      Animated.timing(scaleAnim1, {
        toValue: 1,
        duration: 500,
        delay: 1000,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim2, {
        toValue: 1,
        duration: 500,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const animatePress = (scale: Animated.Value) => {
    return {
      transform: [
        {
          scale: scale.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          }),
        },
      ],
    };
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, {opacity: fadeAnim}]}>
        <ItoaiLogo width={1000} height={200} {...({} as SvgProps)} />
      </Animated.View>

      <Animated.View
        style={[
          styles.contentContainer,
          {
            transform: [{translateY: slideAnim}],
          },
        ]}>
        <Text style={styles.title}>본인의 계정을 선택해주세요!</Text>
        <View style={styles.buttonContainer}>
          <Animated.View
            style={[styles.buttonWrapper, animatePress(scaleAnim1)]}>
            <TouchableOpacity
              style={styles.circleButton}
              onPress={() => navigation.navigate('Login', {userType: 'parent'})}
              activeOpacity={0.8}>
              <ParentsIcon width={120} height={120} {...({} as SvgProps)} />
            </TouchableOpacity>
            <Text style={styles.buttonText}>부모용</Text>
          </Animated.View>

          <Animated.View
            style={[styles.buttonWrapper, animatePress(scaleAnim2)]}>
            <TouchableOpacity
              style={styles.circleButton}
              onPress={() =>
                navigation.navigate('FamilyAuth', {userType: 'child'})
              }
              activeOpacity={0.8}>
              <ChildIcon width={120} height={120} {...({} as SvgProps)} />
            </TouchableOpacity>
            <Text style={styles.buttonText}>자녀용</Text>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#AFE3F0',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: '10%',
    paddingHorizontal: 20,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: '15%',
    borderTopLeftRadius: 200,
    borderTopRightRadius: 200,
    alignItems: 'center',
    paddingTop: '10%',
  },
  title: {
    fontSize: 24, // 타이틀 크기 증가
    marginBottom: '12%', // 여백 살짝 증가
    fontWeight: '900', // 더 굵게
    color: '#222', // 더 진한 색상
    letterSpacing: -0.5, // 자간 살짝 조정
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 30,
  },
  buttonWrapper: {
    alignItems: 'center',
  },
  circleButton: {
    width: 120, // 버튼 크기 증가
    height: 120, // 버튼 크기 증가
    borderRadius: 65, // 버튼 크기에 맞춰 조정
    backgroundColor: 'white',
    marginBottom: 15, // 여백 증가
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3, // 그림자 더 강조
    },
    shadowOpacity: 0.2, // 그림자 더 강조
    shadowRadius: 4,
    elevation: 6, // 안드로이드 그림자 더 강조
  },
  buttonText: {
    fontSize: 19, // 텍스트 크기 증가
    fontWeight: '500', // 더 굵게
    color: '#222', // 더 진한 색상
    marginTop: 12, // 여백 증가
    letterSpacing: -0.5, // 자간 살짝 조정
  },
});

export default SelectTypeScreen;
