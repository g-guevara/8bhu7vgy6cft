// app/components/ProductInfo/ProductHeader.tsx
import React from 'react';
import { View, Text, Image } from 'react-native';
import { Product } from '../../data/productData';
import { styles } from '../../styles/ProductInfoStyles';

interface ProductHeaderProps {
  product: Product;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({ product }) => {
  // Check if it's an organic product
  const isOrganic = product.code.startsWith('SSS');

  const getDefaultEmoji = (): string => {
    const name = product.product_name.toLowerCase();
    const ingredients = product.ingredients_text.toLowerCase();

    if (name.includes('peanut') || ingredients.includes('peanut')) return '🥜';
    if (name.includes('hafer') || ingredients.includes('hafer')) return '🌾';

    return '🍽️';
  };

  return (
    <>
      {/* Product Image */}
      <View style={styles.imageContainer}>
        {product.image_url ? (
          <Image
            source={{ uri: product.image_url }}
            style={styles.productImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderEmoji}>{getDefaultEmoji()}</Text>
          </View>
        )}
      </View>
      
      {/* Product Name */}
      <View style={styles.productNameContainer}>
        <Text style={styles.productName}>
          {product.product_name}
        </Text>
        {isOrganic ? (
          <Text style={styles.organicLabel}>organic</Text>
        ) : (
          <Text style={styles.organicLabel}>product</Text>
        )}
      </View>
    </>
  );
};

export default ProductHeader;