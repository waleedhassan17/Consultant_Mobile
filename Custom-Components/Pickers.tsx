import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ============ DATA LISTS ============
const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
  'France', 'Spain', 'Italy', 'Netherlands', 'Belgium', 'Switzerland',
  'Sweden', 'Norway', 'Denmark', 'Finland', 'Ireland', 'Austria',
  'Portugal', 'Greece', 'Poland', 'Czech Republic', 'Hungary',
  'Japan', 'South Korea', 'Singapore', 'Hong Kong', 'India',
  'China', 'Brazil', 'Mexico', 'Argentina', 'Chile', 'Colombia',
  'United Arab Emirates', 'Saudi Arabia', 'Israel', 'Turkey',
  'South Africa', 'Egypt', 'Nigeria', 'Kenya', 'Pakistan',
  'Bangladesh', 'Indonesia', 'Malaysia', 'Thailand', 'Vietnam',
  'Philippines', 'New Zealand', 'Russia', 'Ukraine'
].sort();

const CURRENCIES = ['USD'];

const LANGUAGES = [
  'English',
  'Arabic',
  'Spanish',
  'French',
  'German',
  'Chinese',
  'Japanese',
  'Korean',
  'Hindi',
  'Portuguese',
  'Russian',
  'Italian',
  'Dutch',
  'Turkish',
  'Polish',
  'Swedish',
  'Danish',
  'Norwegian',
  'Finnish'
].sort();

const DISCIPLINES = [
  'Software Engineering',
  'Data Science',
  'Product Management',
  'UX/UI Design',
  'Marketing',
  'Sales',
  'Finance',
  'Human Resources',
  'Operations',
  'Legal',
  'Consulting',
  'Business Strategy',
  'Project Management',
  'Quality Assurance',
  'DevOps',
  'Cybersecurity',
  'Customer Success',
  'Business Analysis',
  'Engineering Management',
  'Other'
].sort();

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Retail',
  'Manufacturing',
  'Real Estate',
  'Telecommunications',
  'Energy',
  'Transportation',
  'Media & Entertainment',
  'Hospitality',
  'Agriculture',
  'Construction',
  'Professional Services',
  'Government',
  'Non-Profit',
  'Pharmaceutical',
  'Automotive',
  'Other'
].sort();

const COMPANY_SIZES = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1001-5000 employees',
  '5000+ employees'
];

// ============ SINGLE SELECT PICKER ============
interface SingleSelectPickerProps {
  title: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
}

const SingleSelectPicker: React.FC<SingleSelectPickerProps> = ({
  title,
  value,
  options,
  onSelect,
  placeholder,
  disabled
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (option: string) => {
    onSelect(option);
    setModalVisible(false);
    setSearchQuery('');
  };

  return (
    <>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setModalVisible(true)}
        disabled={disabled}
      >
        <Text style={[styles.dropdownText, !value && styles.dropdownPlaceholder]}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#999" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            {options.length > 10 && (
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={20} color="#999" />
                  </TouchableOpacity>
                )}
              </View>
            )}

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.listItem,
                    value === item && styles.listItemSelected
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={[
                    styles.listItemText,
                    value === item && styles.listItemTextSelected
                  ]}>
                    {item}
                  </Text>
                  {value === item && (
                    <Ionicons name="checkmark" size={20} color="#17A2B8" />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              showsVerticalScrollIndicator={true}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

// ============ MULTI SELECT PICKER ============
interface MultiSelectPickerProps {
  title: string;
  selectedValues: string[];
  options: string[];
  onSelect: (values: string[]) => void;
  placeholder: string;
  disabled?: boolean;
}

const MultiSelectPicker: React.FC<MultiSelectPickerProps> = ({
  title,
  selectedValues,
  options,
  onSelect,
  placeholder,
  disabled
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSelected, setTempSelected] = useState<string[]>(selectedValues);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggle = (option: string) => {
    if (tempSelected.includes(option)) {
      setTempSelected(tempSelected.filter(item => item !== option));
    } else {
      setTempSelected([...tempSelected, option]);
    }
  };

  const handleDone = () => {
    onSelect(tempSelected);
    setModalVisible(false);
    setSearchQuery('');
  };

  const handleCancel = () => {
    setTempSelected(selectedValues);
    setModalVisible(false);
    setSearchQuery('');
  };

  return (
    <>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => {
          setTempSelected(selectedValues);
          setModalVisible(true);
        }}
        disabled={disabled}
      >
        <Text style={[styles.dropdownText, selectedValues.length === 0 && styles.dropdownPlaceholder]}>
          {selectedValues.length > 0 ? selectedValues.join(', ') : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#999" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <View style={styles.modalHeaderButtons}>
                <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDone} style={styles.doneButton}>
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>

            {tempSelected.length > 0 && (
              <View style={styles.selectedCount}>
                <Text style={styles.selectedCountText}>
                  {tempSelected.length} selected
                </Text>
              </View>
            )}

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.listItem,
                    tempSelected.includes(item) && styles.listItemSelected
                  ]}
                  onPress={() => handleToggle(item)}
                >
                  <Text style={[
                    styles.listItemText,
                    tempSelected.includes(item) && styles.listItemTextSelected
                  ]}>
                    {item}
                  </Text>
                  {tempSelected.includes(item) && (
                    <Ionicons name="checkmark" size={20} color="#17A2B8" />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              showsVerticalScrollIndicator={true}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

// ============ STYLES ============
const styles = StyleSheet.create({
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  dropdownText: {
    fontSize: 14,
    color: '#1A1A1A',
    flex: 1,
  },
  dropdownPlaceholder: {
    color: '#999999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  modalHeaderButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cancelButtonText: {
    fontSize: 15,
    color: '#666',
  },
  doneButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#17A2B8',
    borderRadius: 6,
  },
  doneButtonText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
  },
  selectedCount: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  selectedCountText: {
    fontSize: 13,
    color: '#17A2B8',
    fontWeight: '500',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  listItemSelected: {
    backgroundColor: '#F0F9FA',
  },
  listItemText: {
    fontSize: 15,
    color: '#1A1A1A',
    flex: 1,
  },
  listItemTextSelected: {
    color: '#17A2B8',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 20,
  },
});

// ============ EXPORTS ============
export {
  SingleSelectPicker,
  MultiSelectPicker,
  COUNTRIES,
  CURRENCIES,
  LANGUAGES,
  DISCIPLINES,
  INDUSTRIES,
  COMPANY_SIZES
};