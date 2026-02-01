import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Animated, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const TabIcon = ({ name, focused, theme }) => {
  const anim = React.useRef(new Animated.Value(focused ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.spring(anim, {
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 50,
    }).start();
  }, [focused]);

  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -5],
  });

  return (
    <Animated.View style={{ transform: [{ scale }, { translateY }], alignItems: 'center' }}>
      <Ionicons 
        name={name} 
        size={24} 
        color={focused ? theme.text : theme.textSec} 
      />
      {focused && (
        <Animated.View style={{
          marginTop: 4,
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: theme.accent,
          opacity: anim,
          shadowColor: theme.accent,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 1,
          shadowRadius: 5,
          elevation: 5,
        }} />
      )}
    </Animated.View>
  );
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme, themeMode } = useTheme();
  
  return (
    <View style={[styles.container, { 
      bottom: Platform.OS === 'ios' ? 0 : insets.bottom,
      backgroundColor: Platform.OS === 'android' ? theme.tabBg : 'transparent'
    }]}>
      <BlurView intensity={80} tint={themeMode === 'dark' ? "dark" : "light"} style={StyleSheet.absoluteFill} />
      {/* Border Gradient */}
      <LinearGradient
        colors={themeMode === 'dark' ? ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'] : ['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.02)']}
        style={[StyleSheet.absoluteFill, { borderRadius: 30, borderWidth: 1, borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
        pointerEvents="none"
      />

      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              Haptics.selectionAsync();
              navigation.navigate(route.name);
            }
          };

          let iconName = 'home-outline';
          if (route.name === 'Home') iconName = isFocused ? 'home' : 'home-outline';
          else if (route.name === 'NetMap') iconName = isFocused ? 'planet' : 'planet-outline';
          else if (route.name === 'Favorites') iconName = isFocused ? 'heart' : 'heart-outline';
          else if (route.name === 'Settings') iconName = isFocused ? 'settings' : 'settings-outline';

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.tabBtn}
              activeOpacity={0.8}
            >
              <TabIcon name={iconName} focused={isFocused} theme={theme} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  tabRow: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  }
});

export default CustomTabBar;