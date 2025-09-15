import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface AppLogoProps {
  size?: 'large' | 'medium' | 'small';
  style?: ViewStyle;
}

interface SizeConfig {
  width: number;
  height: number;
  borderRadius: number;
  fontSize: number;
  appName: number;
  tagline: number;
}

const AppLogo: React.FC<AppLogoProps> = ({ size = 'large', style }) => {
  const getSize = (): SizeConfig => {
    if (size === 'large') {
      return {
        width: 80,
        height: 80,
        borderRadius: 16,
        fontSize: 36,
        appName: 32,
        tagline: 14
      };
    } else if (size === 'medium') {
      return {
        width: 60,
        height: 60,
        borderRadius: 12,
        fontSize: 28,
        appName: 26,
        tagline: 12
      };
    } else {
      return {
        width: 50,
        height: 50,
        borderRadius: 10,
        fontSize: 24,
        appName: 22,
        tagline: 12
      };
    }
  };

  const sizeStyle = getSize();

  return (
    <View style={[styles.header, style]}>
      <View style={styles.logoContainer}>
        <View
          style={[
            styles.logo,
            {
              width: sizeStyle.width,
              height: sizeStyle.height,
              borderRadius: sizeStyle.borderRadius,
            }
          ]}
        >
          <Text
            style={[
              styles.logoText,
              { fontSize: sizeStyle.fontSize }
            ]}
          >
            S
          </Text>
        </View>
      </View>
      <Text style={[styles.appName, { fontSize: sizeStyle.appName }]}>
        Shezlong
      </Text>
      <Text style={[styles.tagline, { fontSize: sizeStyle.tagline }]}>
        You Talk... We Help
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 10,
  },
  logo: {
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontWeight: 'bold',
    color: 'white',
  },
  appName: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  tagline: {
    color: '#999',
  },
});

export default AppLogo;