import React, {useRef, useState} from 'react';
import {Pressable, TextInput, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useTheme} from '../../theme/ThemeProvider';
import {CreatedButNotSignedIn, useAuth} from '../../contexts/AuthContext';
import {useT} from '../../lib/i18n';
import {RootStackParamList} from '../../navigation/types';
import {Button, Field, Icon, IconButton, Text} from '../../ui';
import {AuthLayout} from './AuthLayout';
import {authErrorKey, EMAIL_RE} from './authErrors';
import {PasswordToggle} from './PasswordToggle';
import {night} from './night';

type Props = NativeStackScreenProps<RootStackParamList, 'signUp'>;

/**
 * «ابدأ حصادك» — exactly the fields /auth/register accepts: first and last
 * name, email, password and its confirmation (8+ characters, matching).
 */
export const SignUpScreen = ({navigation}: Props) => {
  const {colors} = useTheme();
  const {t} = useT();
  const {register, activateSession} = useAuth();
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{key: string; signInLink?: boolean} | null>(null);
  const [created, setCreated] = useState(false);
  const refs = {last: useRef<TextInput>(null), email: useRef<TextInput>(null), password: useRef<TextInput>(null), confirm: useRef<TextInput>(null)};

  const errs = {
    first: !first.trim() ? t('auth.errFirst') : undefined,
    last: !last.trim() ? t('auth.errLast') : undefined,
    email: !email.trim() ? t('auth.errEmailRequired') : !EMAIL_RE.test(email.trim()) ? t('auth.errEmail') : undefined,
    password: password.length < 8 ? t('auth.errPasswordShort') : undefined,
    confirm: !confirm ? t('auth.errConfirm') : confirm !== password ? t('auth.errMismatch') : undefined,
  };
  const valid = !Object.values(errs).some(Boolean);

  const submit = async () => {
    setTouched(true);
    setError(null);
    if (!valid || busy) {
      return;
    }
    setBusy(true);
    try {
      const session = await register({first_name: first.trim(), last_name: last.trim(), email: email.trim(), password, verify_password: confirm});
      setCreated(true);
      // A beat on the success state, then into the app — starting with email confirmation.
      setTimeout(() => activateSession(session.token, session.user, {verifyNext: true}), 1400);
    } catch (e) {
      if (e instanceof CreatedButNotSignedIn) {
        setError({key: 'auth.errCreatedNotSignedIn', signInLink: true});
      } else {
        const key = authErrorKey(e);
        setError({key, signInLink: key === 'auth.errExists'});
      }
      setBusy(false);
    }
  };

  if (created) {
    return (
      <AuthLayout title={t('auth.successTitle')} subtitle={t('auth.successBody')}>
        <View style={{alignItems: 'center', paddingTop: 24}} accessibilityRole="alert" accessibilityLiveRegion="polite">
          <View style={{width: 64, height: 64, borderRadius: 32, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center'}} accessibilityLabel={t('auth.successTitle')}>
            <Icon name="check" size={30} color={colors.onInk} strokeWidth={2} />
          </View>
        </View>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={t('auth.signUpTitle')}
      subtitle={t('auth.signUpSub')}
      top={
        navigation.canGoBack() ? (
          <View style={{flexDirection: 'row'}}>
            <IconButton icon="back" label={t('auth.back')} color={night.ink} onPress={() => navigation.goBack()} style={{borderRadius: 21, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)'}} variant="bare" />
          </View>
        ) : null
      }
      footer={
        <Pressable onPress={() => navigation.replace('signIn')} accessibilityRole="link" hitSlop={10} style={({pressed}) => ({flexDirection: 'row', gap: 6, opacity: pressed ? 0.6 : 1, minHeight: 44, alignItems: 'center'})}>
          <Text role="label" tone="ink3">
            {t('auth.haveAccount')}
          </Text>
          <Text role="label" style={{fontFamily: 'IBMPlexSansArabic-SemiBold', textDecorationLine: 'underline'}}>
            {t('auth.signInInstead')}
          </Text>
        </Pressable>
      }>
      <View style={{gap: 16}}>
        <View style={{flexDirection: 'row', gap: 12}}>
          <View style={{flex: 1}}>
            <Field label={t('auth.firstName')} value={first} onChangeText={setFirst} textContentType="givenName" autoComplete="name-given" returnKeyType="next" onSubmitEditing={() => refs.last.current?.focus()} error={touched ? errs.first : undefined} maxLength={60} />
          </View>
          <View style={{flex: 1}}>
            <Field ref={refs.last} label={t('auth.lastName')} value={last} onChangeText={setLast} textContentType="familyName" autoComplete="name-family" returnKeyType="next" onSubmitEditing={() => refs.email.current?.focus()} error={touched ? errs.last : undefined} maxLength={60} />
          </View>
        </View>
        <Field
          ref={refs.email}
          label={t('auth.email')}
          icon="mail"
          ltr
          value={email}
          onChangeText={v => {
            setEmail(v);
            setError(null);
          }}
          ok={!errs.email}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
          returnKeyType="next"
          onSubmitEditing={() => refs.password.current?.focus()}
          error={touched ? errs.email : undefined}
        />
        <View>
          <Field
            ref={refs.password}
            label={t('auth.password')}
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
            // The backend's actual rule, shown as it's met — not an invented strength score.
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
          onSubmitEditing={submit}
          error={(touched || confirm.length >= password.length) && confirm.length > 0 ? errs.confirm : touched ? errs.confirm : undefined}
        />
        {error ? (
          <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={{flexDirection: 'row', gap: 8, alignItems: 'flex-start'}}>
            <Icon name="info" size={16} color={colors.danger} style={{marginTop: 2}} />
            <Text role="small" tone="danger" style={{flex: 1}}>
              {t(error.key)}{' '}
              {error.signInLink ? (
                <Text role="small" tone="danger" style={{textDecorationLine: 'underline', fontFamily: 'IBMPlexSansArabic-SemiBold'}} onPress={() => navigation.replace('signIn')}>
                  {t('auth.signInInstead')}
                </Text>
              ) : null}
            </Text>
          </View>
        ) : null}
        <Button label={t('auth.create')} block loading={busy} onPress={submit} style={{marginTop: 6, height: 54, borderRadius: 27}} />
      </View>
    </AuthLayout>
  );
};
