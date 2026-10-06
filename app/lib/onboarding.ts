import AsyncStorage from '@react-native-async-storage/async-storage';
import {ONBOARDING_COMPLETE_KEY} from '../utils/storageKeys';

// Onboarding is a device fact (seen once per install), not a user one: it
// survives sign-out.
type Listener = () => void;
const listeners = new Set<Listener>();

export const isOnboarded = async () => (await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY).catch(() => null)) === 'true';

export const completeOnboarding = async () => {
  await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true').catch(() => {});
  listeners.forEach(l => l());
};

export const onOnboarded = (l: Listener) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
