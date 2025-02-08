// LanguageSelector.tsx
import React, {useMemo, useState} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  Animated,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useRTL} from '../contexts/RTLProvider'; // Import useRTL from RTLProvider
import i18n from '../configs/i18n';
import colors from '../configs/colors';

const LanguageSelector = () => {
  const {t} = useTranslation();
  const [ballPosition] = useState(
    new Animated.Value(i18n.language === 'ar' ? 65 : 1),
  );
  const isRTL = useRTL(); // Use RTL state from context
  const styles = useMemo(() => getStyles(isRTL), [isRTL]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    Animated.timing(ballPosition, {
      toValue: lng === 'ar' ? 65 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>{t('language')}</Text>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.switchContainer}
          onPress={() => changeLanguage(i18n.language === 'en' ? 'ar' : 'en')}>
          <View style={[styles.iconContainer]}>
            {i18n.language === 'en' && (
              <Image
                source={require('../assets/icons/arabicIcon.png')}
                style={styles.languageIcon}
              />
            )}
            {i18n.language === 'ar' && (
              <Image
                source={require('../assets/icons/englishIcon.png')}
                style={styles.languageIcon}
              />
            )}
          </View>
          <Animated.View
            style={[
              styles.switchBall,
              {transform: [{translateX: ballPosition}]},
            ]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = (isRTL: boolean) => {
  return StyleSheet.create({
    container: {
      width: '100%',
      alignSelf: 'center',
      marginTop: 15,
      borderRadius: 12,
      display: 'flex',
      flexDirection: 'column',
    },
    row: {
      flexDirection: isRTL ? 'row' : 'row-reverse',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    label: {
      textAlign: isRTL ? 'left' : 'right',
      fontFamily: 'ElMessiri-Medium',
      fontSize: 16,
      color: colors.labelText,
    },
    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: isRTL ? 'flex-end' : 'flex-start',
      borderRadius: 30,
      paddingVertical: 5,
      width: 96,
      height: 30,
      backgroundColor: colors.white,
      borderWidth: 2
    },
    iconContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 10,
    },
    languageIcon: {
      width: 18,
      height: 18,
    },
    switchBall: {
      width: 24,
      height: 24,
      borderRadius: 14,
      backgroundColor: colors.lightBlackText,
      position: 'absolute',
      left: 67,
    },
  });
};

export default LanguageSelector;
