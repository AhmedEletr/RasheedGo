import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { STRINGS } from '../constants/translations';

const WIPE_LAYOUT_CONFIG = {
  duration: 260,
  create: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
  update: {
    type: LayoutAnimation.Types.easeInEaseOut,
  },
  delete: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
};

export default function BottomNavBar({ activeTab, onSelectTab, lang }) {
  const t = STRINGS?.[lang] || {};
  const isAr = lang === 'ar';

  if (activeTab === 'chat' || activeTab === 'profile') {
    return null;
  }

  const tabs = [
    {
      id: 'home',
      label: t.tabHome || (isAr ? 'الرئيسية' : 'Home'),
      iconOutline: 'home-outline',
      iconFilled: 'home',
    },
    {
      id: 'favs',
      label: t.tabFavs || (isAr ? 'المفضلة' : 'Saved'),
      iconOutline: 'heart-outline',
      iconFilled: 'heart',
    },
    {
      id: 'chat',
      label: t.tabAI || (isAr ? 'ذكاء رشيد' : 'Rosetta AI'),
      iconOutline: 'sparkles-outline',
      iconFilled: 'sparkles',
    },
    {
      id: 'settings',
      label: t.tabSettings || (isAr ? 'الإعدادات' : 'Settings'),
      iconOutline: 'settings-outline',
      iconFilled: 'settings',
    },
  ];

  const handleTabPress = (tabId) => {
    if (tabId === activeTab) return;
    LayoutAnimation.configureNext(WIPE_LAYOUT_CONFIG);
    onSelectTab(tabId);
  };

  return (
    <View style={styles.outerContainer}>
      <View
        style={[
          styles.navBar,
          { flexDirection: isAr ? 'row-reverse' : 'row' },
        ]}
      >
        {tabs.map((tab) => (
          <TabItem
            key={tab.id}
            tab={tab}
            isAr={isAr}
            isActive={activeTab === tab.id}
            onPress={() => handleTabPress(tab.id)}
          />
        ))}
      </View>
    </View>
  );
}

function TabItem({ tab, isActive, isAr, onPress }) {
  const [measuredWidth, setMeasuredWidth] = useState(80);
  const wipeAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(wipeAnim, {
      toValue: isActive ? 1 : 0,
      duration: 260,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false,
    }).start();
  }, [isActive]);

  const targetWidth = measuredWidth + 6;

  const animatedWidth = wipeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, targetWidth],
  });

  const textTranslateX = wipeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [isAr ? 12 : -12, 0],
  });

  const textOpacity = wipeAnim.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [0, 0.7, 1],
  });

  return (
    <TouchableOpacity
      style={[
        styles.tabBtn,
        { flexDirection: isAr ? 'row-reverse' : 'row' },
        isActive && styles.activePill,
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* Hidden Unconstrained Measurer */}
      <Text
        style={styles.hiddenMeasurer}
        onLayout={(e) => {
          const w = Math.ceil(e.nativeEvent.layout.width);
          if (w > 0 && Math.abs(w - measuredWidth) > 1) {
            setMeasuredWidth(w);
          }
        }}
      >
        {tab.label}
      </Text>

      <Ionicons
        name={isActive ? tab.iconFilled : tab.iconOutline}
        size={22}
        color={isActive ? THEME.primary : THEME.textSubtle}
      />

      {/* Wipe Mask Container */}
      <Animated.View
        style={[
          styles.wipeMaskContainer,
          {
            width: animatedWidth,
            opacity: textOpacity,
            marginLeft: isAr ? 0 : (isActive ? 7 : 0),
            marginRight: isAr ? (isActive ? 7 : 0) : 0,
          },
        ]}
      >
        <Animated.View
          style={{
            transform: [{ translateX: textTranslateX }],
            width: measuredWidth + 14,
          }}
        >
          <Text
            style={styles.activePillText}
            numberOfLines={1}
            ellipsizeMode="clip"
          >
            {tab.label}
          </Text>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 24, // Lifted up comfortably from the bottom
    left: 10,
    right: 10,
    alignItems: 'center',
  },
  navBar: {
    width: '100%',
    backgroundColor: THEME.cardBg,
    borderRadius: 18,
    paddingVertical: 7,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: THEME.borderSubtle,
    shadowColor: THEME.textMain,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 8,
  },
  tabBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    overflow: 'hidden',
  },
  activePill: {
    backgroundColor: THEME.primaryLight,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  wipeMaskContainer: {
    overflow: 'hidden',
    justifyContent: 'center',
  },
  activePillText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: THEME.primary,
  },
  hiddenMeasurer: {
    position: 'absolute',
    left: -9999,
    top: -9999,
    opacity: 0,
    fontSize: 13.5,
    fontWeight: '700',
  },
});