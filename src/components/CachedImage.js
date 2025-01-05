import React from 'react';
import FastImage from 'react-native-fast-image';
import { StyleSheet } from 'react-native';

const CachedImage = ({ style, uri, ...props }) => {
  return (
    <FastImage
      style={[styles.image, style]}
      source={{
        uri: uri,
        priority: FastImage.priority.normal,
        cache: FastImage.cacheControl.immutable,
      }}
      resizeMode={FastImage.resizeMode.cover}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
});

export default CachedImage; 