import React, {useEffect, useRef, useState} from 'react';
import {Pressable, ScrollView, TextInput, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../theme/ThemeProvider';
import {gutter} from '../../theme/tokens';
import {useAuth} from '../../contexts/AuthContext';
import {useT} from '../../lib/i18n';
import {useKeyboardHeight} from '../../lib/keyboard';
import {requestPasswordReset, resetPassword} from '../../apis/auth.api';
import {toApiError} from '../../apis/errors';
import {RootStackParamList} from '../../navigation/types';
import {Button, CodeInput, Field, Icon, IconButton, Text} from '../../ui';
import {authErrorKey} from './authErrors';
import {PasswordToggle} from './PasswordToggle';

type Props = NativeStackScreenProps<RootStackParamList, 'changePassword'>;

type Phase = 'intro' | 'sending' | 'form' | 'saving' | 'done';
const RESEND_AFTER = 30;

/**
 * Change password, signed in — the backend's reset flow: it emails a
 * four-digit code to the account, then takes the code with the new password
 * and its confirmation.
 */
export const ChangePasswordScreen = ({navigation}: Props) => {
  const {colors} = useTheme();
  const {t} = useT();
  const insets = useSafeAreaInsets();
  const keyboard = useKeyboardHeight();
  const {user} = useAuth();
  const [phase, setPhase] = useState<Phase>('intro');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState(false);
  const [wait, setWait] = useState(0);
  const refs = {code: useRef<TextInput>(null), password: useRef<TextInput>(null), confirm: useRef<TextInput>(null)};

  useEffect(() => {
    if (wait <= 0) {
      return;
    }
    const id = setTimeout(() => setWait(w => w - 1), 1000);
    return () => clearTimeout(id);
  }, [wait]);

  const send = async () => {
    setError(null);
    setCodeError(false);
    setPhase(p => (p === 'intro' ? 'sending' : p));
    try {
      await requestPasswordReset();
      setPhase('form');
      setWait(RESEND_AFTER);
      setTimeout(() => refs.code.current?.focus(), 300);
    } catch (e) {
      setError(authErrorKey(e) === 'auth.errServer' ? 'auth.errServer' : 'auth.sendFailed');
      setPhase(p => (p === 'sending' ? 'intro' : p));
    }
  };

  const errs = {
    code: code.length !== 4 ? t('auth.codeRequired') : undefined,
    password: password.length < 8 ? t('auth.errPasswordShort') : undefined,
    confirm: !confirm ? t('auth.errConfirm') : confirm !== password ? t('auth.errMismatch') : undefined,
  };

  const save = async () => {
    setTouched(true);
    setError(null);
    if (errs.code || errs.password || errs.confirm || phase === 'saving') {
      return;
    }
    setPhase('saving');
    try {
      await resetPassword({otp: code, password, verify_password: confirm});
      setPhase('done');
    } catch (e) {
      if (/invalid otp/i.test(toApiError(e).message)) {
        setCodeError(true);
      } else {
        setError(authErrorKey(e));
      }
      setPhase('form');
    }
  };

  // t() puts the digits in the reader's numeral style.
  const mm = `${Math.floor(wait / 60)}:${String(wait % 60).padStart(2, '0')}`;
  const pad = {paddingBottom: Math.max(keyboard, insets.bottom) + 16};

  const header = (
    <View style={{flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, minHeight: 48}}>
      {phase !== 'done' ? <IconButton icon="back" label={t('auth.back')} onPress={() => navigation.goBack()} /> : null}
    </View>
  );

  if (phase === 'done') {
    return (
      <View style={[{flex: 1, backgroundColor: colors.paper, paddingTop: insets.top + 8}, pad]}>
        {header}
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: gutter}} accessibilityLiveRegion="polite">
          <View style={{width: 56, height: 56, borderRadius: 28, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center'}}>
            <Icon name="check" size={28} color={colors.onInk} strokeWidth={2} />
          </View>
          <Text role="display2" align="center" accessibilityRole="header" style={{marginTop: 18}}>
            {t('auth.changedTitle')}
          </Text>
          <Text role="body" tone="ink2" align="center" style={{marginTop: 6}}>
            {t('auth.changedBody')}
          </Text>
        </View>
        <View style={{paddingHorizontal: gutter}}>
          <Button label={t('auth.done')} block onPress={() => navigation.goBack()} style={{height: 54, borderRadius: 27}} />
        </View>
      </View>
    );
  }

  const asking = phase === 'intro' || phase === 'sending';

  return (
    <View style={[{flex: 1, backgroundColor: colors.paper, paddingTop: insets.top + 8}, pad]}>
      {header}
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{paddingHorizontal: gutter, paddingTop: 8, paddingBottom: 24}}>
        <Text role="display2" accessibilityRole="header">
          {t('auth.changeTitle')}
        </Text>
        <Text role="body" tone="ink2" style={{marginTop: 6}}>
          {asking ? t('auth.changeIntro') : t('auth.verifySent')}
        </Text>
        <Text role="label" script="latin" style={{marginTop: 2}}>
          {user?.email}
        </Text>

        {!asking ? (
          <View style={{marginTop: 26, gap: 16}}>
            <View style={{alignItems: 'center'}}>
              <CodeInput
                ref={refs.code}
                value={code}
                onChange={v => {
                  setCode(v);
                  setCodeError(false);
                }}
                onComplete={() => refs.password.current?.focus()}
                error={codeError || (touched && !!errs.code)}
                accessibilityLabel={t('auth.codeLabel')}
              />
              {codeError ? (
                <Text role="small" tone="danger" align="center" accessibilityRole="alert" style={{marginTop: 10}}>
                  {t('auth.invalidCode')}
                </Text>
              ) : null}
              <View style={{minHeight: 44, justifyContent: 'center', marginTop: 4}}>
                {wait > 0 ? (
                  <Text role="meta" tone="ink3" align="center">
                    {t('auth.resendIn', {time: mm})}
                  </Text>
                ) : (
                  <Pressable onPress={send} accessibilityRole="button" hitSlop={14}>
                    <Text role="label" style={{textDecorationLine: 'underline'}}>
                      {t('auth.resend')}
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
            <View>
              <Field
                ref={refs.password}
                label={t('auth.newPassword')}
                icon="lock"
                ltr
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!show}
                textContentType="newPassword"
                autoComplete="password-new"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => refs.confirm.current?.focus()}
                error={touched ? errs.password : undefined}
                trailing={<PasswordToggle visible={show} onToggle={() => setShow(s => !s)} />}
              />
              {!(touched && errs.password) ? (
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6}}>
                  <Icon name="check" size={14} color={password.length >= 8 ? colors.ok : colors.ink4} strokeWidth={2} />
                  <Text role="meta" color={password.length >= 8 ? colors.ok : colors.ink3}>
                    {t('auth.passwordRule')}
                  </Text>
                </View>
              ) : null}
            </View>
            <Field
              ref={refs.confirm}
              label={t('auth.confirm')}
              icon="lock"
              ltr
              value={confirm}
              onChangeText={setConfirm}
              ok={!!confirm && confirm === password}
              secureTextEntry={!show}
              textContentType="newPassword"
              autoCapitalize="none"
              returnKeyType="go"
              onSubmitEditing={save}
              error={touched || (confirm.length >= password.length && confirm.length > 0) ? errs.confirm : undefined}
            />
          </View>
        ) : null}

        {error ? (
          <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={{flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginTop: 18}}>
            <Icon name="info" size={16} color={colors.danger} style={{marginTop: 2}} />
            <Text role="small" tone="danger" style={{flex: 1}}>
              {t(error)}
            </Text>
          </View>
        ) : null}
      </ScrollView>
      <View style={{paddingHorizontal: gutter}}>
        {asking ? (
          <Button label={t('auth.sendCode')} icon="mail" block loading={phase === 'sending'} onPress={send} style={{height: 54, borderRadius: 27}} />
        ) : (
          <Button label={t('auth.changeSave')} block loading={phase === 'saving'} onPress={save} style={{height: 54, borderRadius: 27}} />
        )}
      </View>
    </View>
  );
};
