import React from 'react';
import {Platform, Pressable, View} from 'react-native';
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../theme/ThemeProvider';
import {Glass} from '../ui/Glass';
import {Icon, IconName} from '../ui/Icon';
import {Text} from '../ui/Text';
import {useT} from '../lib/i18n';

const TAB_ICONS: Record<string, IconName> = {harvest: 'harvest', library: 'library', selections: 'star'};
const BAR_HEIGHT = 68;

/** iOS: 22pt above the screen edge, over the home indicator's inset.
 * Android: always clear of the gesture handle or the button bar. */
export const barBottom = (insetBottom: number) =>
  Platform.OS === 'ios' ? Math.max(insetBottom - 12, 14) : insetBottom + 8;

/** Space a scrolling tab screen leaves under its content for the capsule. */
export const useTabBarSpace = () => {
  const insets = useSafeAreaInsets();
  return barBottom(insets.bottom) + BAR_HEIGHT + 24;
};

/**
 * One glass capsule: three destinations and the capture button inside it
 * (Design Lock v2 §09). Discover is built but not exposed here.
 */
export const TabBar = ({state, navigation, onCapture}: BottomTabBarProps & {onCapture: () => void}) => {
  const {colors} = useTheme();
  const {t} = useT();
  const insets = useSafeAreaInsets();
  return (
    <View pointerEvents="box-none" style={{position: 'absolute', start: 0, end: 0, bottom: barBottom(insets.bottom), paddingHorizontal: 22}}>
      <Glass radius={BAR_HEIGHT / 2} style={{height: BAR_HEIGHT, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8}}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const label = t(`tabs.${route.name}`);
          const onPress = () => {
            const event = navigation.emit({type: 'tabPress', target: route.key, canPreventDefault: true});
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };
          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              onLongPress={() => navigation.emit({type: 'tabLongPress', target: route.key})}
              accessibilityRole="tab"
              accessibilityState={{selected: focused}}
              accessibilityLabel={label}
              style={({pressed}) => ({flex: 1, height: BAR_HEIGHT, alignItems: 'center', justifyContent: 'center', gap: 2, opacity: pressed ? 0.6 : 1})}>
              <Icon name={TAB_ICONS[route.name] ?? 'library'} size={22} color={focused ? colors.ink : colors.ink3} strokeWidth={focused ? 1.7 : 1.5} />
              <Text role="tab" color={focused ? colors.ink : colors.ink3} style={focused ? {fontFamily: 'IBMPlexSansArabic-SemiBold'} : undefined}>
                {label}
              </Text>
              <View style={{position: 'absolute', bottom: 7, width: 4, height: 4, borderRadius: 2, backgroundColor: focused ? colors.gold : 'transparent'}} />
            </Pressable>
          );
        })}
        <Pressable
          onPress={onCapture}
          accessibilityRole="button"
          accessibilityLabel={t('tabs.capture')}
          accessibilityHint={t('tabs.captureHint')}
          style={({pressed}) => ({
            width: 54,
            height: 54,
            borderRadius: 27,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.ink,
            boxShadow: '0px 8px 18px -8px rgba(28,20,8,0.5)',
            transform: [{scale: pressed ? 0.95 : 1}],
          })}>
          <Icon name="plus" size={26} color={colors.onInk} strokeWidth={1.7} />
        </Pressable>
      </Glass>
    </View>
  );
};
