// src/components/ProgressCircle.tsx
import React from 'react';
import {View, StyleSheet} from 'react-native';
import Svg, {Circle} from 'react-native-svg';

interface ProgressCircleProps {
  radius: number;
  percentage: number;
  progressColor: string;
  bgColor: string;
  borderWidth: number;
  children?: React.ReactNode;
}

export const ProgressCircle: React.FC<ProgressCircleProps> = ({
  radius,
  percentage,
  progressColor,
  bgColor,
  borderWidth,
  children,
}) => {
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={styles.container}>
      <Svg width={radius * 2} height={radius * 2}>
        {/* Background Circle */}
        <Circle
          cx={radius}
          cy={radius}
          r={radius - borderWidth / 2}
          stroke={bgColor}
          strokeWidth={borderWidth}
          fill="none"
        />
        {/* Progress Circle */}
        <Circle
          cx={radius}
          cy={radius}
          r={radius - borderWidth / 2}
          stroke={progressColor}
          strokeWidth={borderWidth}
          strokeDasharray={circumference}
          strokeDashoffset={progressOffset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${radius} ${radius})`}
        />
      </Svg>
      <View style={[styles.content, {width: radius * 2, height: radius * 2}]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
