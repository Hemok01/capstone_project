import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../types/navigation';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

type LifePatternComicScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'LifePatternComic'
>;

const LifePatternComicScreen: React.FC<LifePatternComicScreenProps> = ({
  navigation,
}) => {
  const [loading, setLoading] = useState(true);
  const [showComic, setShowComic] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      setShowComic(true);
    }, 5000);
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>
            AI가 사용정보를 기반으로 생성중이예요!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>오늘의 만화</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView style={styles.content}>
        {showComic && (
          <Image
            source={require('../assets/images/bad.webp')}
            style={styles.comicImage}
            resizeMode="contain"
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8CD9F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  content: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 0, // 패딩 제거
  },
  comicStrip: {
    gap: 16,
  },
  comicPanel: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    height: 200,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 16,
    fontSize: 16,
  },
  comicImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 0.9, // 더 세로로 길게
    borderRadius: 12,
    marginVertical: 0,
    marginHorizontal: 0, // 패딩 제거
  },
});

export default LifePatternComicScreen;
