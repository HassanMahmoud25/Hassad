import React from 'react';
import {Pressable, StyleProp, View, ViewStyle} from 'react-native';
import {useTheme} from '../theme/ThemeProvider';
import {Text} from './Text';
import {Icon} from './Icon';

interface SectionHeadProps {
  title: string;
  more?: string;
  onMore?: () => void;
  style?: StyleProp<ViewStyle>;
}

/** A section title in the reading face, with an optional quiet link. */
export const SectionHead = ({title, more, onMore, style}: SectionHeadProps) => {
  const {colors} = useTheme();
  return (
    <View style={[{flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 6}, style]}>
      <Text role="display3" accessibilityRole="header" style={{flexShrink: 1}}>
        {title}
      </Text>
      {more && onMore ? (
        <Pressable onPress={onMore} accessibilityRole="link" hitSlop={10} style={({pressed}) => ({flexDirection: 'row', alignItems: 'center', gap: 2, opacity: pressed ? 0.6 : 1})}>
          <Text role="label" tone="ink3" style={{fontSize: 12.5}}>
            {more}
          </Text>
          <Icon name="forward" size={14} color={colors.ink3} />
        </Pressable>
      ) : null}
    </View>
  );
};
