// src/components/Header.tsx
import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  rightComponent?: React.ReactNode;
  showBorder?: boolean;
  backgroundColor?: string;
}

export const Header = ({
  title,
  onBack,
  rightComponent,
  showBorder = true,
  backgroundColor = 'white',
}: HeaderProps) => {
  return (
    <View
      style={[
        styles.header,
        showBorder && styles.headerBorder,
        {backgroundColor},
      ]}>
      {onBack && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
      )}
      <Text
        style={[styles.headerTitle, !onBack && styles.headerTitleWithoutBack]}
        numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.rightContainer}>{rightComponent}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
  },
  headerBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    elevation: 0,
  },
  backButton: {
    height: '100%',
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '500',
    color: '#333',
    marginLeft: 4,
    marginRight: 16,
  },
  headerTitleWithoutBack: {
    marginLeft: 16,
  },
  rightContainer: {
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
