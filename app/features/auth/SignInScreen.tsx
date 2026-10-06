import React, {useRef, useState} from 'react';
import {Pressable, TextInput, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useTheme} from '../../theme/ThemeProvider';
import {useAuth} from '../../contexts/AuthContext';
import {useT} from '../../lib/i18n';
import {currentLang} from '../../lib/locale';
import {RootStackParamList} from '../../navigation/types';
import {Button, Cover, Field, Icon, Text} from '../../ui';
import {AuthLayout} from './AuthLayout';
import {authErrorKey, EMAIL_RE} from './authErrors';
import {ForgotPasswordSheet} from './ForgotPasswordSheet';
import {PasswordToggle} from './PasswordToggle';
import {night} from './night';

type Props = NativeStackScreenProps<RootStackParamList, 'signIn'>;

/** «عُد إلى حصادك» — sign in with the real /auth/login. */
export const SignInScreen = ({navigation}: Props) => {
  const {colors} = useTheme();
  const {t} = useT();
  const {login, sessionEnd} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgot, setForgot] = useState(false);
  const passwordRef = useRef<TextInput>(null);

  const emailErr = !email.trim() ? t('auth.errEmailRequired') : !EMAIL_RE.test(email.trim()) ? t('auth.errEmail') : undefined;
  const passErr = !password ? t('auth.errPassword') : undefined;

  const submit = async () => {
    setTouched(true);
    setError(null);
    if (emailErr || passErr || busy) {
      return;
    }
    setBusy(true);
    try {
      await login(email.trim(), password);
      // The navigator moves to the app once the session exists.
    } catch (e) {
      setError(t(authErrorKey(e)));
      setBusy(false);
    }
  };

  const ar = currentLang() === 'ar';
  return (
    <AuthLayout
      title={t('auth.signInTitle')}
      subtitle={t('auth.signInSub')}
      top={
        sessionEnd === 'expired' ? (
          // A floating status banner: one of the few places glass belongs.
          <View accessibilityRole="alert" style={{flexDirection: 'row', gap: 10, padding: 12, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)'}}>
            <Icon name="info" size={18} color={night.ink2} style={{marginTop: 2}} />
            <Text role="small" color={night.ink2} style={{flex: 1}}>
              {t('auth.expired')}
            </Text>
          </View>
        ) : null
      }
      art={
        // A book on the night table, at the far end from the title; it gives way to the banner.
        sessionEnd === 'expired' ? null : (
          <View pointerEvents="none" style={{position: 'absolute', bottom: 104, end: -18, transform: [{rotate: ar ? '-9deg' : '9deg'}]}} importantForAccessibility="no-hide-descendants">
            <Cover title={ar ? 'مقدمة ابن خلدون' : 'Thinking, Fast and Slow'} author={ar ? 'ابن خلدون' : 'Daniel Kahneman'} width={84} shadow="hero" decorative />
          </View>
        )
      }
      footer={
        <Pressable onPress={() => navigation.navigate('signUp')} accessibilityRole="link" hitSlop={10} style={({pressed}) => ({flexDirection: 'row', gap: 6, opacity: pressed ? 0.6 : 1, minHeight: 44, alignItems: 'center'})}>
          <Text role="label" tone="ink3">
            {t('auth.newHere')}
          </Text>
          <Text role="label" style={{fontFamily: 'IBMPlexSansArabic-SemiBold', textDecorationLine: 'underline'}}>
            {t('auth.createAccount')}
          </Text>
        </Pressable>
      }>
      <View style={{gap: 16, paddingStart: 0}}>
        <Field
          label={t('auth.email')}
          icon="mail"
          ltr
          value={email}
          onChangeText={v => {
            setEmail(v);
            setError(null);
          }}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          error={touched ? emailErr : undefined}
        />
        <View>
          <Field
            ref={passwordRef}
            label={t('auth.password')}
            icon="lock"
            ltr
            value={password}
            onChangeText={v => {
              setPassword(v);
              setError(null);
            }}
            secureTextEntry={!show}
            textContentType="password"
            autoComplete="password"
            autoCapitalize="none"
            returnKeyType="go"
            onSubmitEditing={submit}
            error={touched ? passErr : undefined}
            trailing={<PasswordToggle visible={show} onToggle={() => setShow(s => !s)} />}
          />
          <Pressable onPress={() => setForgot(true)} accessibilityRole="button" hitSlop={14} style={{position: 'absolute', top: 0, end: 0}}>
            <Text role="label" tone="gold">
              {t('auth.forgot')}
            </Text>
          </Pressable>
        </View>
        {error ? (
          <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={{flexDirection: 'row', gap: 8, alignItems: 'flex-start'}}>
            <Icon name="info" size={16} color={colors.danger} style={{marginTop: 2}} />
            <Text role="small" tone="danger" style={{flex: 1}}>
              {error}
            </Text>
          </View>
        ) : null}
        <Button label={t('auth.signIn')} block loading={busy} onPress={submit} style={{marginTop: 6, height: 54, borderRadius: 27}} />
      </View>
      <ForgotPasswordSheet visible={forgot} onClose={() => setForgot(false)} />
    </AuthLayout>
  );
};
