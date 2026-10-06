import React from 'react';
import {View} from 'react-native';
import {useTheme} from '../../theme/ThemeProvider';
import {useT} from '../../lib/i18n';
import {Button, Icon, IconButton, Sheet, Text} from '../../ui';

/**
 * The backend only resets passwords for a signed-in account (its reset
 * routes require a session). Rather than a form that can't work, this says
 * so plainly and points to the path that does.
 */
export const ForgotPasswordSheet = ({visible, onClose}: {visible: boolean; onClose: () => void}) => {
  const {colors} = useTheme();
  const {t} = useT();
  return (
    <Sheet visible={visible} onClose={onClose} accessibilityLabel={t('auth.forgotTitle')}>
      <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
        <Text role="display3" accessibilityRole="header" style={{flex: 1}}>
          {t('auth.forgotTitle')}
        </Text>
        <IconButton icon="close" label={t('common.close')} small onPress={onClose} />
      </View>
      <Text role="body" tone="ink2" style={{marginTop: 6}}>
        {t('auth.forgotBody')}
      </Text>
      <View style={{flexDirection: 'row', gap: 10, marginTop: 14, padding: 14, borderRadius: 16, backgroundColor: colors.paper2, alignItems: 'flex-start'}}>
        <Icon name="key" size={18} color={colors.ink2} style={{marginTop: 2}} />
        <Text role="small" tone="ink2" style={{flex: 1}}>
          {t('auth.forgotHint')}
        </Text>
      </View>
      <Button label={t('auth.ok')} block onPress={onClose} style={{marginTop: 18}} />
    </Sheet>
  );
};
