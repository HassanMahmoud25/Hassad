import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Pressable, TextInput, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Path, Rect} from 'react-native-svg';
import {useTheme} from '../../theme/ThemeProvider';
import {gutter} from '../../theme/tokens';
import {useAuth} from '../../contexts/AuthContext';
import {useT} from '../../lib/i18n';
import {useKeyboardHeight} from '../../lib/keyboard';
import {requestVerifyUser, verifyUser} from '../../apis/auth.api';
import {toApiError} from '../../apis/errors';
import {RootStackParamList} from '../../navigation/types';
import {Button, CodeInput, Icon, IconButton, Text, WheatSeal} from '../../ui';

type Props = NativeStackScreenProps<RootStackParamList, 'verifyEmail'>;

export const verifiedKey = (userId: string) => `hassad.verified.${userId}`;

type Phase = 'sending' | 'sendFailed' | 'code' | 'checking' | 'verified' | 'already';
const RESEND_AFTER = 30;

/**
 * Email confirmation (VerifyEmail board). Exactly the backend's flow: request
 * a four-digit code (the server answers "already verified" when it is), then
 * send it back. Verification is optional on this backend, so "later" is real.
 */
export const VerifyEmailScreen = ({route, navigation}: Props) => {
  const {colors} = useTheme();
  const {t} = useT();
  const insets = useSafeAreaInsets();
  const keyboard = useKeyboardHeight();
  const {user, clearPendingVerify} = useAuth();
  const from = route.params?.from ?? 'me';
  const [phase, setPhase] = useState<Phase>('sending');
  const [code, setCode] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [wait, setWait] = useState(0);
  const input = useRef<TextInput>(null);

  const leave = useCallback(() => {
    if (from === 'signUp') {
      clearPendingVerify();
      navigation.replace('tabs');
    } else {
      navigation.goBack();
    }
  }, [from, clearPendingVerify, navigation]);

  const remember = () => user?._id && AsyncStorage.setItem(verifiedKey(user._id), '1').catch(() => {});

  const send = useCallback(async () => {
    setPhase('sending');
    setInvalid(false);
    try {
      await requestVerifyUser();
      setPhase('code');
      setWait(RESEND_AFTER);
      setTimeout(() => input.current?.focus(), 300);
    } catch (e) {
      if (/already verified/i.test(toApiError(e).message)) {
        remember();
        setPhase('already');
      } else {
        setPhase('sendFailed');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    send();
  }, [send]);

  useEffect(() => {
    if (wait <= 0) {
      return;
    }
    const id = setTimeout(() => setWait(w => w - 1), 1000);
    return () => clearTimeout(id);
  }, [wait]);

  const confirm = async (digits = code) => {
    if (digits.length !== 4 || phase === 'checking') {
      return;
    }
    setPhase('checking');
    try {
      await verifyUser(digits);
      remember();
      setPhase('verified');
    } catch (e) {
      const msg = toApiError(e).message;
      if (/already verified/i.test(msg)) {
        remember();
        setPhase('already');
      } else {
        setInvalid(true);
        setPhase('code');
      }
    }
  };

  const done = phase === 'verified' || phase === 'already';
  // t() puts the digits in the reader's numeral style.
  const mm = `${Math.floor(wait / 60)}:${String(wait % 60).padStart(2, '0')}`;

  return (
    <View style={{flex: 1, backgroundColor: colors.paper, paddingTop: insets.top + 8, paddingBottom: Math.max(keyboard, insets.bottom) + 16}}>
      <View style={{flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, minHeight: 48}}>
        {from === 'me' ? <IconButton icon="back" label={t('auth.back')} onPress={() => navigation.goBack()} /> : <View />}
        <View style={{flex: 1}} />
        {from === 'signUp' && !done ? (
          <Pressable onPress={leave} accessibilityRole="button" hitSlop={10} style={{minHeight: 44, justifyContent: 'center', paddingHorizontal: 8}}>
            <Text role="label" tone="ink2">
              {t('auth.later')}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View style={{flex: 1, paddingHorizontal: gutter, alignItems: 'center', justifyContent: keyboard ? 'flex-start' : 'center'}}>
        {!keyboard && <Envelope sealed={!done} />}
        <Text role="display2" align="center" accessibilityRole="header" style={{marginTop: 22}}>
          {done ? t('auth.verifiedTitle') : t('auth.verifyTitle')}
        </Text>
        <Text role="body" tone="ink2" align="center" style={{marginTop: 6}}>
          {phase === 'already' ? t('auth.alreadyVerified') : phase === 'verified' ? t('auth.verifiedBody') : phase === 'sending' ? t('auth.verifySending') : t('auth.verifySent')}
        </Text>
        {!done ? (
          <Text role="label" align="center" script="latin" style={{marginTop: 2}}>
            {user?.email}
          </Text>
        ) : null}

        {phase === 'code' || phase === 'checking' ? (
          <View style={{marginTop: 26, alignItems: 'center'}}>
            <CodeInput
              ref={input}
              value={code}
              onChange={v => {
                setCode(v);
                setInvalid(false);
              }}
              onComplete={d => confirm(d)}
              error={invalid}
              accessibilityLabel={t('auth.codeLabel')}
            />
            {invalid ? (
              <Text role="small" tone="danger" align="center" accessibilityRole="alert" style={{marginTop: 10}}>
                {t('auth.invalidCode')}
              </Text>
            ) : null}
            <View style={{marginTop: 14, minHeight: 44, justifyContent: 'center'}}>
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
        ) : phase === 'sendFailed' ? (
          <View style={{marginTop: 20, alignItems: 'center', gap: 12}}>
            <Text role="small" tone="danger" align="center" accessibilityRole="alert">
              {t('auth.sendFailed')}
            </Text>
            <Button label={t('common.retry')} icon="retry" variant="line" size="sm" onPress={send} style={{alignSelf: 'center'}} />
          </View>
        ) : null}
      </View>

      <View style={{paddingHorizontal: gutter, gap: 10}}>
        {done ? (
          <Button label={t('auth.continue')} block onPress={leave} style={{height: 54, borderRadius: 27}} />
        ) : (
          <>
            <Button
              label={t('auth.confirmCode')}
              block
              loading={phase === 'checking' || phase === 'sending'}
              disabled={phase !== 'code' || code.length !== 4}
              onPress={() => confirm()}
              style={{height: 54, borderRadius: 27}}
            />
            <Text role="meta" tone="ink3" align="center">
              {t('auth.verifyNote')}
            </Text>
          </>
        )}
      </View>
    </View>
  );
};

/** A plain paper envelope; the wheat seal closes it until the address is confirmed. */
const Envelope = ({sealed}: {sealed: boolean}) => {
  const {colors} = useTheme();
  return (
    <View style={{width: 190, height: 128, alignItems: 'center', justifyContent: 'center'}} importantForAccessibility="no-hide-descendants">
      <Svg width={190} height={128} style={{position: 'absolute'}}>
        <Rect x={1} y={1} width={188} height={126} rx={6} fill={colors.card} stroke={colors.rule} strokeWidth={1} />
        <Path d="M2 3 L95 70 L188 3" fill="none" stroke={colors.rule} strokeWidth={1.2} />
        <Path d="M2 125 L72 54 M188 125 L118 54" fill="none" stroke={colors.rule2} strokeWidth={1} />
      </Svg>
      {/* Sealed until confirmed; then the seal gives way to a tick. */}
      <View style={{marginTop: 26, boxShadow: '0px 6px 12px -6px rgba(90,60,10,0.5)', borderRadius: 30}}>
        {sealed ? (
          <WheatSeal size={56} />
        ) : (
          <View style={{width: 56, height: 56, borderRadius: 28, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center'}}>
            <Icon name="check" size={28} color={colors.onInk} strokeWidth={2} />
          </View>
        )}
      </View>
    </View>
  );
};
