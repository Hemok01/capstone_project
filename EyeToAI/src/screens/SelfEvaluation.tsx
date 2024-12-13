import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Slider from '@react-native-community/slider';
import {RootStackParamList} from '../types/navigation';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

type SelfEvaluationScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'SelfEvaluation'
>;

const SelfEvaluationScreen: React.FC<SelfEvaluationScreenProps> = ({
  navigation,
}) => {
  const [scores, setScores] = useState([5, 5, 5]);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  const questions = [
    '시간 계획 전에 스스로 중요도 평가하기',
    '시간 계획 전에 스스로 현실성 평가하기',
    '시간 계획 전에 스스로 성취도 평가하기',
  ];

  const moods = [
    {id: 0, label: '별로예요', icon: '😞'},
    {id: 1, label: '보통', icon: '🙂'},
    {id: 2, label: '좋아요', icon: '😊'},
  ];

  const handleSubmit = () => {
    if (selectedMood === null) return;
    // TODO: Save evaluation data
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>자기 평가</Text>
        <View style={{width: 24}} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>오늘의 체크리스트</Text>
          {questions.map((question, index) => (
            <View key={index} style={styles.sliderContainer}>
              <Text style={styles.questionText}>
                {index + 1}. {question}
              </Text>
              <View style={styles.sliderWrapper}>
                <Text style={styles.emoji}>😞</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={10}
                  value={scores[index]}
                  onValueChange={value => {
                    const newScores = [...scores];
                    newScores[index] = value;
                    setScores(newScores);
                  }}
                  minimumTrackTintColor="#8CD9F0"
                  maximumTrackTintColor="#E5E5E5"
                  thumbTintColor="#8CD9F0"
                />
                <Text style={styles.emoji}>😊</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>오늘의 평가를 진행해주세요!</Text>
          <View style={styles.moodContainer}>
            {moods.map(mood => (
              <TouchableOpacity
                key={mood.id}
                style={[
                  styles.moodButton,
                  selectedMood === mood.id && styles.selectedMood,
                ]}
                onPress={() => setSelectedMood(mood.id)}>
                <Text style={styles.moodEmoji}>{mood.icon}</Text>
                <Text style={styles.moodLabel}>{mood.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            selectedMood === null && styles.disabledButton,
          ]}
          onPress={handleSubmit}
          disabled={selectedMood === null}>
          <Text style={styles.submitButtonText}>평가하기</Text>
        </TouchableOpacity>
      </View>
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
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  sliderContainer: {
    marginBottom: 20,
  },
  questionText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  sliderWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 8,
  },
  emoji: {
    fontSize: 20,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  moodButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    width: '28%',
  },
  selectedMood: {
    borderColor: '#8CD9F0',
    backgroundColor: '#F0F9FF',
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 12,
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#8CD9F0',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#E5E5E5',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SelfEvaluationScreen;
