/**
 * Enhanced Search Input Component
 * Features: autocomplete, recent searches, quick actions
 */

import { Colors } from '@/constants/theme';
import { SearchSuggestion, clearRecentSearches, getRecentSearches, getSearchSuggestions, removeRecentSearch } from '@/services/searchService';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  value: string;
  onChange: (text: string) => void;
  onSubmit: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
  allProducts?: any[];
  autoFocus?: boolean;
}

export function EnhancedSearchInput({
  value,
  onChange,
  onSubmit,
  onClear,
  placeholder = 'Search products...',
  allProducts,
  autoFocus = true,
}: Props) {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<TextInput>(null);

  // Load recent searches on mount
  useEffect(() => {
    loadRecentSearches();
  }, []);

  // Update suggestions when query changes
  useEffect(() => {
    if (value.trim().length > 0) {
      updateSuggestions(value);
    } else {
      // Show recent searches when query is empty
      loadRecentSearches();
      setShowSuggestions(false);
    }
  }, [value, allProducts]);

  const loadRecentSearches = async () => {
    try {
      const recent = await getRecentSearches();
      setRecentSearches(recent.map((r) => r.query));
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  };

  const updateSuggestions = async (query: string) => {
    try {
      const results = await getSearchSuggestions(query, allProducts);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch (error) {
      console.error('Failed to get suggestions:', error);
    }
  };

  const handleSuggestionPress = useCallback(
    (suggestion: SearchSuggestion) => {
      onChange(suggestion.text);
      setShowSuggestions(false);
      onSubmit(suggestion.text);
      inputRef.current?.blur();
    },
    [onChange, onSubmit]
  );

  const handleRemoveRecent = useCallback(
    async (query: string) => {
      await removeRecentSearch(query);
      loadRecentSearches();
    },
    []
  );

  const handleClearRecent = useCallback(async () => {
    await clearRecentSearches();
    setRecentSearches([]);
  }, []);

  const renderSuggestion = useCallback(
    ({ item }: { item: SearchSuggestion }) => (
      <TouchableOpacity
        style={styles.suggestionItem}
        onPress={() => handleSuggestionPress(item)}
      >
        <View style={styles.suggestionContent}>
          <Ionicons
            name={item.type === 'recent' ? 'time-outline' : 'search-outline'}
            size={18}
            color={Colors.neutral[400]}
          />
          <Text style={styles.suggestionText} numberOfLines={1}>
            {item.text}
          </Text>
        </View>
        <Ionicons name="arrow-forward-outline" size={16} color={Colors.neutral[300]} />
      </TouchableOpacity>
    ),
    [handleSuggestionPress]
  );

  const renderRecentSearch = useCallback(
    (query: string, index: number) => (
      <View key={index} style={styles.recentSearchItem}>
        <TouchableOpacity
          style={styles.recentSearchContent}
          onPress={() => handleSuggestionPress({ id: `recent-${query}`, text: query, type: 'recent' })}
        >
          <Ionicons name="time-outline" size={16} color={Colors.neutral[400]} />
          <Text style={styles.recentSearchText} numberOfLines={1}>
            {query}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveRecent(query)}
        >
          <Ionicons name="close-circle" size={18} color={Colors.neutral[300]} />
        </TouchableOpacity>
      </View>
    ),
    [handleSuggestionPress, handleRemoveRecent]
  );

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="search-outline" size={20} color={Colors.neutral[400]} />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.neutral[400]}
          value={value}
          onChangeText={onChange}
          onSubmitEditing={() => onSubmit(value)}
          autoFocus={autoFocus}
          returnKeyType="search"
          onFocus={() => {
            if (value.trim().length === 0 && recentSearches.length > 0) {
              setShowSuggestions(true);
            }
          }}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={onClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={Colors.neutral[400]} />
          </TouchableOpacity>
        )}
      </View>

      {showSuggestions && suggestions.length > 0 ? (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.id}
            renderItem={renderSuggestion}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={styles.suggestionsList}
          />
        </View>
      ) : showSuggestions && value.trim().length === 0 && recentSearches.length > 0 ? (
        <View style={styles.suggestionsContainer}>
          <View style={styles.recentSearchesHeader}>
            <Text style={styles.recentSearchesTitle}>Recent Searches</Text>
            <TouchableOpacity onPress={handleClearRecent}>
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={recentSearches}
            keyExtractor={(item, index) => `recent-${index}`}
            renderItem={({ item }) => renderRecentSearch(item, 0)}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={styles.suggestionsList}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 48,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.neutral[900],
    fontFamily: 'Inter_400Regular',
  },
  clearButton: {
    padding: 4,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 20,
    maxHeight: 300,
  },
  suggestionsList: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  suggestionText: {
    flex: 1,
    fontSize: 15,
    color: Colors.neutral[900],
    fontFamily: 'Inter_400Regular',
  },
  recentSearchesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  recentSearchesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral[900],
    fontFamily: 'Inter_600SemiBold',
  },
  clearAllText: {
    fontSize: 13,
    color: Colors.primary.DEFAULT,
    fontFamily: 'Inter_500Medium',
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  recentSearchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  recentSearchText: {
    flex: 1,
    fontSize: 14,
    color: Colors.neutral[700],
    fontFamily: 'Inter_400Regular',
  },
  removeButton: {
    padding: 4,
  },
});
