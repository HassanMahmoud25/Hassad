import React from 'react';
import {View} from 'react-native';
import {useTheme} from '../../theme/ThemeProvider';
import {Text} from '../../ui';

export interface Fact {
  value: string;
  label: string;
  gold?: boolean;
}

/** Three facts under the book: notes · selected · last page. */
export const FactsStrip = ({facts}: {facts: Fact[]}) => {
  const {colors} = useTheme();
  return (
    <View style={{flexDirection: 'row', borderRadius: 18, borderWidth: 1, borderColor: colors.rule}}>
      {facts.map((f, i) => (
        <View
          key={f.label}
          accessible
          accessibilityLabel={`${f.value} ${f.label}`}
          style={[{flex: 1, paddingVertical: 9, paddingHorizontal: 4, alignItems: 'center', gap: 1}, i > 0 && {borderStartWidth: 1, borderStartColor: colors.rule2}]}>
          <Text role="numeral" color={f.gold ? colors.goldInk : colors.ink} align="center" style={{fontSize: 21, lineHeight: 25}}>
            {f.value}
          </Text>
          <Text role="meta" tone="ink3" align="center" style={{fontSize: 11, lineHeight: 15}}>
            {f.label}
          </Text>
        </View>
      ))}
    </View>
  );
};
