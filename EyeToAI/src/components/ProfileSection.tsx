import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

interface ProfileSectionProps {
  title: string;
  isExpanded: boolean;
  onPress: () => void;
  children?: React.ReactNode;
}

export const ProfileSection = ({
  title,
  isExpanded,
  onPress,
  children,
}: ProfileSectionProps) => {
  return (
    <TouchableOpacity style={styles.profileSection} onPress={onPress}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.expandIcon}>{isExpanded ? '∨' : '>'}</Text>
      </View>
      {isExpanded && (
        <View style={styles.profileContent}>
          {children || (
            <>
              <View style={styles.profilePlaceholder} />
              <Text style={styles.defaultText}>등록된 프로필이 없습니다</Text>
            </>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  profileSection: {
    marginBottom: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 30,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  expandIcon: {
    fontSize: 16,
    color: '#666',
  },
  profileContent: {
    padding: 16,
    alignItems: 'center',
  },
  profilePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E5E5E5',
    marginBottom: 12,
  },
  defaultText: {
    fontSize: 14,
    color: '#666',
  },
});
