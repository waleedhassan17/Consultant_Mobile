import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

export interface FilterState {
  availability: {
    today: boolean;
    thisWeek: boolean;
    specificDate: string | null;
  };
  areasOfInterest: string[];
  duration: 'all' | '30min' | '60min';
  therapistGender: 'all' | 'male' | 'female';
  ratings: number;
  language: string;
  country: string;
  sessionFees: {
    min: number;
    max: number;
  };
  canPrescribeMedication: {
    psychiatrist: boolean;
    psychologist: boolean;
  };
  takesInsuranceProceeds: boolean;
  acceptBundles: boolean;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters: FilterState;
}

export const defaultFilters: FilterState = {
  availability: {
    today: false,
    thisWeek: false,
    specificDate: null,
  },
  areasOfInterest: [],
  duration: 'all',
  therapistGender: 'all',
  ratings: 0,
  language: '',
  country: '',
  sessionFees: {
    min: 0,
    max: 10000,
  },
  canPrescribeMedication: {
    psychiatrist: false,
    psychologist: false,
  },
  takesInsuranceProceeds: false,
  acceptBundles: false,
};

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  initialFilters,
}) => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Update local state when initialFilters change
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters, visible]);

  // Check if filters have been modified
  useEffect(() => {
    const changed = JSON.stringify(filters) !== JSON.stringify(initialFilters);
    setHasChanges(changed);
  }, [filters, initialFilters]);

  const handleReset = () => {
    setFilters(defaultFilters);
    Alert.alert('Filters Reset', 'All filters have been cleared');
  };

  const handleApply = () => {
    console.log('Applying filters:', filters);
    onApply(filters);
    onClose();
  };

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      updateFilter('availability', {
        ...filters.availability,
        specificDate: selectedDate.toISOString(),
      });
    }
  };

  const clearSpecificDate = () => {
    updateFilter('availability', {
      ...filters.availability,
      specificDate: null,
    });
  };

  const getDateValue = (): Date => {
    if (filters.availability.specificDate) {
      return new Date(filters.availability.specificDate);
    }
    return new Date();
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Choose a date';
    return new Date(dateString).toLocaleDateString();
  };

  // Count active filters for badge
  const countActiveFilters = (): number => {
    let count = 0;
    if (filters.availability.today) count++;
    if (filters.availability.thisWeek) count++;
    if (filters.availability.specificDate) count++;
    if (filters.areasOfInterest.length > 0) count++;
    if (filters.duration !== 'all') count++;
    if (filters.therapistGender !== 'all') count++;
    if (filters.ratings > 0) count++;
    if (filters.language.trim() !== '') count++;
    if (filters.country.trim() !== '') count++;
    if (filters.sessionFees.min > 0 || filters.sessionFees.max < 10000) count++;
    if (filters.canPrescribeMedication.psychiatrist) count++;
    if (filters.canPrescribeMedication.psychologist) count++;
    if (filters.takesInsuranceProceeds) count++;
    if (filters.acceptBundles) count++;
    return count;
  };

  const activeFilterCount = countActiveFilters();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Filters</Text>
              {activeFilterCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
            {/* Availability */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="calendar-outline" size={18} color="#2196F3" />
                <Text style={styles.sectionTitle}>Availability</Text>
              </View>

              <View style={styles.checkboxRow}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() =>
                    updateFilter('availability', {
                      ...filters.availability,
                      today: !filters.availability.today,
                    })
                  }
                >
                  <Ionicons
                    name={filters.availability.today ? 'checkbox' : 'square-outline'}
                    size={20}
                    color="#2196F3"
                  />
                  <Text style={styles.checkboxLabel}>Today</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() =>
                    updateFilter('availability', {
                      ...filters.availability,
                      thisWeek: !filters.availability.thisWeek,
                    })
                  }
                >
                  <Ionicons
                    name={filters.availability.thisWeek ? 'checkbox' : 'square-outline'}
                    size={20}
                    color="#2196F3"
                  />
                  <Text style={styles.checkboxLabel}>This Week</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.datePickerRow}>
                <TouchableOpacity
                  style={[styles.datePickerButton, filters.availability.specificDate && styles.datePickerActive]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar" size={18} color="#2196F3" />
                  <Text style={[styles.datePickerText, filters.availability.specificDate && styles.datePickerTextActive]}>
                    {formatDate(filters.availability.specificDate)}
                  </Text>
                </TouchableOpacity>
                {filters.availability.specificDate && (
                  <TouchableOpacity
                    style={styles.clearDateButton}
                    onPress={clearSpecificDate}
                  >
                    <Ionicons name="close-circle" size={20} color="#ff6b6b" />
                  </TouchableOpacity>
                )}
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={getDateValue()}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>

            {/* Duration */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="time-outline" size={18} color="#2196F3" />
                <Text style={styles.sectionTitle}>Duration</Text>
              </View>

              <View style={styles.radioGroup}>
                {(['all', '30min', '60min'] as const).map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.radioOption}
                    onPress={() => updateFilter('duration', option)}
                  >
                    <Ionicons
                      name={
                        filters.duration === option
                          ? 'radio-button-on'
                          : 'radio-button-off'
                      }
                      size={20}
                      color="#2196F3"
                    />
                    <Text style={styles.radioLabel}>
                      {option === 'all' ? 'All' : option === '30min' ? '30 Min' : '60 Mins'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Therapist Gender */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="people-outline" size={18} color="#2196F3" />
                <Text style={styles.sectionTitle}>Therapist Gender</Text>
              </View>

              <View style={styles.radioGroup}>
                {(['all', 'male', 'female'] as const).map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.radioOption}
                    onPress={() => updateFilter('therapistGender', option)}
                  >
                    <Ionicons
                      name={
                        filters.therapistGender === option
                          ? 'radio-button-on'
                          : 'radio-button-off'
                      }
                      size={20}
                      color="#2196F3"
                    />
                    <Text style={styles.radioLabel}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Ratings */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="star-outline" size={18} color="#2196F3" />
                <Text style={styles.sectionTitle}>Minimum Rating</Text>
              </View>

              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => updateFilter('ratings', star === filters.ratings ? 0 : star)}
                  >
                    <Ionicons
                      name={star <= filters.ratings ? 'star' : 'star-outline'}
                      size={32}
                      color="#FFB800"
                    />
                  </TouchableOpacity>
                ))}
              </View>
              {filters.ratings > 0 && (
                <Text style={styles.helperText}>
                  Showing therapists with {filters.ratings}+ stars
                </Text>
              )}
            </View>

            {/* Language & Country */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="globe-outline" size={18} color="#2196F3" />
                <Text style={styles.sectionTitle}>Language & Country</Text>
              </View>

              <TextInput
                style={styles.textInput}
                placeholder="Select Language"
                placeholderTextColor="#999"
                value={filters.language}
                onChangeText={(text) => updateFilter('language', text)}
              />

              <TextInput
                style={[styles.textInput, styles.inputMarginTop]}
                placeholder="Select Country"
                placeholderTextColor="#999"
                value={filters.country}
                onChangeText={(text) => updateFilter('country', text)}
              />
            </View>

            {/* Session Fees */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="cash-outline" size={18} color="#2196F3" />
                <Text style={styles.sectionTitle}>Session Fees</Text>
              </View>

              <View style={styles.feeRangeContainer}>
                <View style={styles.feeInputContainer}>
                  <Text style={styles.feeLabel}>Min</Text>
                  <TextInput
                    style={styles.feeInput}
                    value={String(filters.sessionFees.min)}
                    onChangeText={(text) => {
                      const value = parseInt(text) || 0;
                      updateFilter('sessionFees', {
                        ...filters.sessionFees,
                        min: value,
                      });
                    }}
                    keyboardType="numeric"
                  />
                </View>

                <Text style={styles.feeSeparator}>-</Text>

                <View style={styles.feeInputContainer}>
                  <Text style={styles.feeLabel}>Max</Text>
                  <TextInput
                    style={styles.feeInput}
                    value={String(filters.sessionFees.max)}
                    onChangeText={(text) => {
                      const value = parseInt(text) || 10000;
                      updateFilter('sessionFees', {
                        ...filters.sessionFees,
                        max: value,
                      });
                    }}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <Text style={styles.helperText}>
                Price range: ${filters.sessionFees.min} - ${filters.sessionFees.max}
              </Text>
            </View>

            {/* Can prescribe medication */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="medical-outline" size={18} color="#2196F3" />
                <Text style={styles.sectionTitle}>Can prescribe medication</Text>
              </View>

              <TouchableOpacity
                style={styles.checkbox}
                onPress={() =>
                  updateFilter('canPrescribeMedication', {
                    ...filters.canPrescribeMedication,
                    psychiatrist: !filters.canPrescribeMedication.psychiatrist,
                  })
                }
              >
                <Ionicons
                  name={
                    filters.canPrescribeMedication.psychiatrist
                      ? 'checkbox'
                      : 'square-outline'
                  }
                  size={20}
                  color="#2196F3"
                />
                <Text style={styles.checkboxLabel}>Psychiatrist (allowed)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkbox}
                onPress={() =>
                  updateFilter('canPrescribeMedication', {
                    ...filters.canPrescribeMedication,
                    psychologist: !filters.canPrescribeMedication.psychologist,
                  })
                }
              >
                <Ionicons
                  name={
                    filters.canPrescribeMedication.psychologist
                      ? 'checkbox'
                      : 'square-outline'
                  }
                  size={20}
                  color="#2196F3"
                />
                <Text style={styles.checkboxLabel}>Psychologist (Not allowed)</Text>
              </TouchableOpacity>
            </View>

            {/* Takes insurance proceeds */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#2196F3" />
                <Text style={styles.sectionTitle}>Takes insurance proceeds</Text>
              </View>

              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => updateFilter('takesInsuranceProceeds', true)}
                >
                  <Ionicons
                    name={
                      filters.takesInsuranceProceeds
                        ? 'radio-button-on'
                        : 'radio-button-off'
                    }
                    size={20}
                    color="#2196F3"
                  />
                  <Text style={styles.radioLabel}>Yes</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => updateFilter('takesInsuranceProceeds', false)}
                >
                  <Ionicons
                    name={
                      !filters.takesInsuranceProceeds
                        ? 'radio-button-on'
                        : 'radio-button-off'
                    }
                    size={20}
                    color="#2196F3"
                  />
                  <Text style={styles.radioLabel}>No</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Accept bundles */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="gift-outline" size={18} color="#2196F3" />
                <Text style={styles.sectionTitle}>Accept bundles</Text>
              </View>

              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => updateFilter('acceptBundles', true)}
                >
                  <Ionicons
                    name={
                      filters.acceptBundles ? 'radio-button-on' : 'radio-button-off'
                    }
                    size={20}
                    color="#2196F3"
                  />
                  <Text style={styles.radioLabel}>Yes</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => updateFilter('acceptBundles', false)}
                >
                  <Ionicons
                    name={
                      !filters.acceptBundles ? 'radio-button-on' : 'radio-button-off'
                    }
                    size={20}
                    color="#2196F3"
                  />
                  <Text style={styles.radioLabel}>No</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Reset Filter</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.applyButton, hasChanges && styles.applyButtonActive]} 
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>
                Apply {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  filterBadge: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  datePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  datePickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  datePickerActive: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
  },
  datePickerText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  datePickerTextActive: {
    color: '#2196F3',
    fontWeight: '500',
  },
  clearDateButton: {
    padding: 8,
  },
  textInput: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
  },
  inputMarginTop: {
    marginTop: 12,
  },
  radioGroup: {
    gap: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  feeRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  feeInputContainer: {
    flex: 1,
  },
  feeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  feeInput: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
  },
  feeSeparator: {
    fontSize: 18,
    color: '#666',
    marginHorizontal: 16,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    marginTop: 16,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2196F3',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  applyButtonActive: {
    backgroundColor: '#1976D2',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default FilterModal;