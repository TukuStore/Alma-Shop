/**
 * Product Comparison Modal
 * Displays side-by-side comparison of multiple products
 */

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Colors } from '@/constants/theme';
import { formatPrice } from '@/lib/currency';
import {
  getComparisonList,
  removeFromComparison,
  clearComparison,
  getProductDifferences,
  getComparisonSummary,
  shareComparison,
} from '@/services/productComparisonService';
import type { ComparisonItem } from '@/services/productComparisonService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function ProductComparisonModal({ visible, onClose }: Props) {
  const [items, setItems] = useState<ComparisonItem[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [differences, setDifferences] = useState<any[]>([]);

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible]);

  const loadData = async () => {
    const comparisonItems = await getComparisonList();
    setItems(comparisonItems);

    const summaryData = getComparisonSummary(comparisonItems);
    setSummary(summaryData);

    const diffs = getProductDifferences(comparisonItems);
    setDifferences(diffs);
  };

  const handleRemove = async (productId: string) => {
    const updated = await removeFromComparison(productId);
    setItems(updated);

    if (updated.length === 0) {
      onClose();
    }
  };

  const handleClearAll = async () => {
    await clearComparison();
    onClose();
  };

  const handleShare = async () => {
    const text = await shareComparison(items);
    // TODO: Implement sharing
    console.log('Share:', text);
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.neutral[900]} />
            </TouchableOpacity>

            <View style={styles.titleContainer}>
              <Text style={styles.title}>Compare Products</Text>
              <Text style={styles.subtitle}>{items.length} items selected</Text>
            </View>

            <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
              <Text style={styles.clearText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Summary Card */}
          {summary && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Summary</Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Price Range</Text>
                  <Text style={styles.summaryValue}>
                    {formatPrice(summary.priceRange.min)} - {formatPrice(summary.priceRange.max)}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Average</Text>
                  <Text style={styles.summaryValue}>{formatPrice(summary.priceRange.avg)}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Products Grid */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.productsRow}>
              {items.map((item) => (
                <View key={item.product.id} style={styles.productCard}>
                  {/* Remove Button */}
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemove(item.product.id)}
                  >
                    <Ionicons name="close-circle" size={24} color={Colors.error} />
                  </TouchableOpacity>

                  {/* Product Image */}
                  <View style={styles.productImageContainer}>
                    <Image
                      source={{ uri: item.product.images?.[0] }}
                      style={styles.productImage}
                      contentFit="cover"
                    />
                  </View>

                  {/* Product Name */}
                  <Text style={styles.productName} numberOfLines={2}>
                    {item.product.name}
                  </Text>

                  {/* Price */}
                  <Text style={styles.productPrice}>
                    {formatPrice(item.product.price)}
                  </Text>

                  {/* Rating */}
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={16} color={Colors.warning} />
                    <Text style={styles.ratingText}>
                      {item.product.rating?.toFixed(1) || 'N/A'}
                    </Text>
                  </View>

                  {/* Action Button */}
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => {
                      // Navigate to product detail
                      onClose();
                    }}
                  >
                    <Text style={styles.viewButtonText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Differences Table */}
          {differences.length > 0 && (
            <View style={styles.differencesCard}>
              <Text style={styles.differencesTitle}>Key Differences</Text>

              {differences.map(
                (diff, index) =>
                  diff.hasDifference && (
                    <View key={index} style={styles.differenceRow}>
                      <Text style={styles.differenceAttribute}>{diff.attribute}</Text>
                      <View style={styles.differenceValues}>
                        {diff.values.map((value: any) => (
                          <View key={value.productId} style={styles.differenceValue}>
                            <Text style={styles.differenceValueText}>{value.value}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )
              )}
            </View>
          )}
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color="#fff" />
            <Text style={styles.shareButtonText}>Share Comparison</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    width: 40,
    height: 40,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral[900],
    fontFamily: 'Inter_600SemiBold',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.neutral[500],
    fontFamily: 'Inter_400Regular',
  },
  clearButton: {
    width: 60,
    alignItems: 'flex-end',
  },
  clearText: {
    fontSize: 14,
    color: Colors.error,
    fontFamily: 'Inter_500Medium',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  summaryCard: {
    backgroundColor: Colors.neutral[50],
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral[900],
    marginBottom: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 20,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.neutral[500],
    marginBottom: 4,
    fontFamily: 'Inter_400Regular',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.DEFAULT,
    fontFamily: 'Inter_600SemiBold',
  },
  productsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  productCard: {
    width: 180,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    padding: 12,
    position: 'relative',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
  productImageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: Colors.neutral[50],
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral[900],
    marginBottom: 8,
    fontFamily: 'Inter_500Medium',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary.DEFAULT,
    marginBottom: 8,
    fontFamily: 'Inter_700Bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 14,
    color: Colors.neutral[900],
    fontFamily: 'Inter_500Medium',
  },
  viewButton: {
    backgroundColor: Colors.primary.DEFAULT,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
  },
  differencesCard: {
    backgroundColor: Colors.neutral[50],
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
  },
  differencesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral[900],
    marginBottom: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  differenceRow: {
    marginBottom: 16,
  },
  differenceAttribute: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral[700],
    marginBottom: 8,
    fontFamily: 'Inter_600SemiBold',
  },
  differenceValues: {
    flexDirection: 'row',
    gap: 12,
  },
  differenceValue: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  differenceValueText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral[900],
    fontFamily: 'Inter_600SemiBold',
  },
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  shareButton: {
    backgroundColor: Colors.primary.DEFAULT,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
  },
});
