import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ============ OPTION TYPE ============
 export interface PickerOption {
  label: string;
  value: string;
}

// ============ DATA LISTS ============
// NOTE: Country IDs should match your backend's spree_countries table
// You may need to fetch these from your API or update IDs to match your database
const COUNTRIES: PickerOption[] = [
  { label: 'United States', value: '233' },
  { label: 'United Kingdom', value: '232' },
  { label: 'Canada', value: '39' },
  { label: 'Australia', value: '14' },
  { label: 'Germany', value: '82' },
  { label: 'France', value: '75' },
  { label: 'Spain', value: '67' },
  { label: 'Italy', value: '110' },
  { label: 'Netherlands', value: '166' },
  { label: 'Belgium', value: '22' },
  { label: 'Switzerland', value: '214' },
  { label: 'Sweden', value: '213' },
  { label: 'Norway', value: '166' },
  { label: 'Denmark', value: '59' },
  { label: 'Finland', value: '74' },
  { label: 'Ireland', value: '105' },
  { label: 'Austria', value: '15' },
  { label: 'Portugal', value: '177' },
  { label: 'Greece', value: '85' },
  { label: 'Poland', value: '176' },
  { label: 'Czech Republic', value: '58' },
  { label: 'Hungary', value: '99' },
  { label: 'Japan', value: '112' },
  { label: 'South Korea', value: '117' },
  { label: 'Singapore', value: '199' },
  { label: 'Hong Kong', value: '97' },
  { label: 'India', value: '101' },
  { label: 'China', value: '45' },
  { label: 'Brazil', value: '31' },
  { label: 'Mexico', value: '143' },
  { label: 'Argentina', value: '11' },
  { label: 'Chile', value: '44' },
  { label: 'Colombia', value: '48' },
  { label: 'United Arab Emirates', value: '231' },
  { label: 'Saudi Arabia', value: '194' },
  { label: 'Israel', value: '107' },
  { label: 'Turkey', value: '225' },
  { label: 'South Africa', value: '206' },
  { label: 'Egypt', value: '65' },
  { label: 'Nigeria', value: '160' },
  { label: 'Kenya', value: '114' },
  { label: 'Pakistan', value: '167' },
  { label: 'Bangladesh', value: '19' },
  { label: 'Indonesia', value: '102' },
  { label: 'Malaysia', value: '134' },
  { label: 'Thailand', value: '219' },
  { label: 'Vietnam', value: '238' },
  { label: 'Philippines', value: '174' },
  { label: 'New Zealand', value: '158' },
  { label: 'Russia', value: '182' },
  { label: 'Ukraine', value: '230' },
].sort((a, b) => a.label.localeCompare(b.label));

// Currency options - these are string values, not IDs
const CURRENCIES: PickerOption[] = [
  { label: 'USD - US Dollar', value: 'USD' },
  { label: 'EUR - Euro', value: 'EUR' },
  { label: 'GBP - British Pound', value: 'GBP' },
  { label: 'CAD - Canadian Dollar', value: 'CAD' },
  { label: 'AUD - Australian Dollar', value: 'AUD' },
  { label: 'JPY - Japanese Yen', value: 'JPY' },
  { label: 'CHF - Swiss Franc', value: 'CHF' },
  { label: 'CNY - Chinese Yuan', value: 'CNY' },
  { label: 'INR - Indian Rupee', value: 'INR' },
  { label: 'SGD - Singapore Dollar', value: 'SGD' },
  { label: 'AED - UAE Dirham', value: 'AED' },
  { label: 'SAR - Saudi Riyal', value: 'SAR' },
];

// Languages - these are string values stored in spoken_languages array
const LANGUAGES: PickerOption[] = [
  { label: 'English', value: 'English' },
  { label: 'Arabic', value: 'Arabic' },
  { label: 'Spanish', value: 'Spanish' },
  { label: 'French', value: 'French' },
  { label: 'German', value: 'German' },
  { label: 'Chinese', value: 'Chinese' },
  { label: 'Japanese', value: 'Japanese' },
  { label: 'Korean', value: 'Korean' },
  { label: 'Hindi', value: 'Hindi' },
  { label: 'Portuguese', value: 'Portuguese' },
  { label: 'Russian', value: 'Russian' },
  { label: 'Italian', value: 'Italian' },
  { label: 'Dutch', value: 'Dutch' },
  { label: 'Turkish', value: 'Turkish' },
  { label: 'Polish', value: 'Polish' },
  { label: 'Swedish', value: 'Swedish' },
  { label: 'Danish', value: 'Danish' },
  { label: 'Norwegian', value: 'Norwegian' },
  { label: 'Finnish', value: 'Finnish' },
  { label: 'Urdu', value: 'Urdu' },
].sort((a, b) => a.label.localeCompare(b.label));

// NOTE: Discipline IDs should match your backend's disciplines table
// You may need to fetch these from your API or update IDs to match your database
const DISCIPLINES: PickerOption[] = [
  { label: 'Software Engineering', value: '1' },
  { label: 'Data Science', value: '2' },
  { label: 'Product Management', value: '3' },
  { label: 'UX/UI Design', value: '4' },
  { label: 'Marketing', value: '5' },
  { label: 'Sales', value: '6' },
  { label: 'Finance', value: '7' },
  { label: 'Human Resources', value: '8' },
  { label: 'Operations', value: '9' },
  { label: 'Legal', value: '10' },
  { label: 'Consulting', value: '11' },
  { label: 'Business Strategy', value: '12' },
  { label: 'Project Management', value: '13' },
  { label: 'Quality Assurance', value: '14' },
  { label: 'DevOps', value: '15' },
  { label: 'Cybersecurity', value: '16' },
  { label: 'Customer Success', value: '17' },
  { label: 'Business Analysis', value: '18' },
  { label: 'Engineering Management', value: '19' },
  { label: 'Other', value: '20' },
].sort((a, b) => a.label.localeCompare(b.label));

// Industry types - these are string values
const INDUSTRIES: PickerOption[] = [
  { label: 'Technology', value: 'Technology' },
  { label: 'Healthcare', value: 'Healthcare' },
  { label: 'Finance', value: 'Finance' },
  { label: 'Education', value: 'Education' },
  { label: 'Retail', value: 'Retail' },
  { label: 'Manufacturing', value: 'Manufacturing' },
  { label: 'Real Estate', value: 'Real Estate' },
  { label: 'Telecommunications', value: 'Telecommunications' },
  { label: 'Energy', value: 'Energy' },
  { label: 'Transportation', value: 'Transportation' },
  { label: 'Media & Entertainment', value: 'Media & Entertainment' },
  { label: 'Hospitality', value: 'Hospitality' },
  { label: 'Agriculture', value: 'Agriculture' },
  { label: 'Construction', value: 'Construction' },
  { label: 'Professional Services', value: 'Professional Services' },
  { label: 'Government', value: 'Government' },
  { label: 'Non-Profit', value: 'Non-Profit' },
  { label: 'Pharmaceutical', value: 'Pharmaceutical' },
  { label: 'Automotive', value: 'Automotive' },
  { label: 'Other', value: 'Other' },
].sort((a, b) => a.label.localeCompare(b.label));

// Company sizes - these are string values
const COMPANY_SIZES: PickerOption[] = [
  { label: '1-10 employees', value: '1-10' },
  { label: '11-50 employees', value: '11-50' },
  { label: '51-200 employees', value: '51-200' },
  { label: '201-500 employees', value: '201-500' },
  { label: '501-1000 employees', value: '501-1000' },
  { label: '1001-5000 employees', value: '1001-5000' },
  { label: '5000+ employees', value: '5000+' },
];

// ============ SINGLE SELECT PICKER ============
interface SingleSelectPickerProps {
  title: string;
  value: string;
  options: PickerOption[];
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

  // Find the selected option to display its label
  const selectedOption = options.find(opt => opt.value === value);
  const displayText = selectedOption?.label || '';

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (option: PickerOption) => {
    onSelect(option.value);
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
          {displayText || placeholder}
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
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.listItem,
                    value === item.value && styles.listItemSelected
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={[
                    styles.listItemText,
                    value === item.value && styles.listItemTextSelected
                  ]}>
                    {item.label}
                  </Text>
                  {value === item.value && (
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
  options: PickerOption[];
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

  // Get labels for selected values
  const getSelectedLabels = () => {
    return selectedValues
      .map(val => options.find(opt => opt.value === val)?.label)
      .filter(Boolean)
      .join(', ');
  };

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggle = (option: PickerOption) => {
    if (tempSelected.includes(option.value)) {
      setTempSelected(tempSelected.filter(item => item !== option.value));
    } else {
      setTempSelected([...tempSelected, option.value]);
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
          {selectedValues.length > 0 ? getSelectedLabels() : placeholder}
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
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.listItem,
                    tempSelected.includes(item.value) && styles.listItemSelected
                  ]}
                  onPress={() => handleToggle(item)}
                >
                  <Text style={[
                    styles.listItemText,
                    tempSelected.includes(item.value) && styles.listItemTextSelected
                  ]}>
                    {item.label}
                  </Text>
                  {tempSelected.includes(item.value) && (
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
  COMPANY_SIZES,
 
};