import React from 'react';
import {View} from 'react-native';
import {useTheme} from '../theme/ThemeProvider';
import {Icon, IconName} from './Icon';
import {Text} from './Text';
import {Button} from './Button';

interface StateBlockProps {
  icon?: IconName;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Quiet, centred error/offline message with one way forward. */
export const StateBlock = ({icon = 'offline', title, body, actionLabel, onAction}: StateBlockProps) => {
  const {colors} = useTheme();
  return (
    <View style={{alignItems: 'center', paddingHorizontal: 36, paddingVertical: 40}} accessibilityRole="alert">
      <View style={{width: 56, height: 56, borderRadius: 28, backgroundColor: colors.paper2, alignItems: 'center', justifyContent: 'center'}}>
        <Icon name={icon} size={24} color={colors.ink2} />
      </View>
      <Text role="display3" align="center" style={{marginTop: 16}}>
        {title}
      </Text>
      {body ? (
        <Text role="body" tone="ink2" align="center" style={{marginTop: 6}}>
          {body}
        </Text>
      ) : null}
      {actionLabel && onAction ? <Button label={actionLabel} icon="retry" variant="line" size="sm" onPress={onAction} style={{marginTop: 18, alignSelf: 'center'}} /> : null}
    </View>
  );
};
