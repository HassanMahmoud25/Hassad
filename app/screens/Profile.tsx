import React, {useMemo} from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  Image,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import colors from '../configs/colors';
import LanguageSelector from '../components/LnaguageSelector';
import {useRTL} from '../contexts/RTLProvider'; // Import useRTL from RTLProvider
import {useTranslation} from 'react-i18next';

export const ProfileScreen = () => {
  const {t} = useTranslation();
  const isRTL = useRTL();
  const styles = useMemo(() => getStyles(isRTL), [isRTL]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileContainer}>
        <Image
          source={require('../assets/images/profileBgImage.png')}
          resizeMode={'cover'}
          style={styles.profileBackgroundImage}
        />

        <View style={styles.profileInfoContainer}>
          <Image
            source={require('../assets/images/profileAvatar.png')}
            resizeMode="contain"
            style={styles.profileAvatar}
          />
          <Text style={styles.profileName}>{'حسن محمود'}</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statText, styles.numberStyle]}>{'25'}</Text>
              <Text style={[styles.statText, styles.classNameStyle]}>
                {t('benefit')}
              </Text>
            </View>
            <View style={[styles.statItem, styles.middleItemBorders]}>
              <Text style={[styles.statText, styles.numberStyle]}>{'80'}</Text>
              <Text style={[styles.statText, styles.classNameStyle]}>
                {t('book')}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statText, styles.numberStyle]}>{'118'}</Text>
              <Text style={[styles.statText, styles.classNameStyle]}>
                {t('folder')}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.formContainer}>
          <View>
            <Text style={styles.label}>{t('name')}</Text>
            <View style={styles.inputWrapper}>
              <Image
                source={require('../assets/icons/editIcon.png')}
                resizeMode="contain"
                style={styles.editIcon}
              />
              <TextInput value="حسن محمود" style={styles.textInput} />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('email')}</Text>
            <View style={styles.inputWrapper}>
              <Image
                source={require('../assets/icons/editIcon.png')}
                resizeMode="contain"
                style={styles.editIcon}
              />
              <TextInput
                value="hassanmahmoud251@gmail.com"
                style={styles.textInput}
              />
            </View>
          </View>

          <LanguageSelector />

          <TouchableOpacity style={styles.logoutButton}>
            <Image
              source={require('../assets/icons/logoutIcon.png')}
              resizeMode="contain"
              style={styles.logoutIcon}
            />
            <Text style={styles.logoutText}>{t('logout')}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>{t('save changes')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const getStyles = (isRTL: boolean) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.mainScreen,
    },
    profileContainer: {
      flex: 1,
    },
    profileBackgroundImage: {
      width: '100%',
      height: 215,
    },
    profileInfoContainer: {
      backgroundColor: colors.white,
      top: -80,
      marginBottom: -70,
      width: '92.5%',
      alignSelf: 'center',
      borderRadius: 12,
      padding: 20,
    },
    profileAvatar: {
      width: 100,
      height: 100,
      position: 'absolute',
      top: -50,
      alignSelf: 'center',
    },
    profileName: {
      textAlign: 'center',
      fontFamily: 'ElMessiri-Bold',
      fontSize: 20,
      color: colors.primaryBlack,
      marginTop: 30,
    },
    statsContainer: {
      flexDirection: isRTL ? 'row' : 'row-reverse',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 10,
    },
    statItem: {
      width: '27.5%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    statText: {
      textAlign: 'center',
    },
    numberStyle: {
      fontFamily: 'ElMessiri-Bold',
      fontSize: 20,
      color: colors.primaryBlack,
    },
    classNameStyle: {
      fontFamily: 'ElMessiri-Regular',
      fontSize: 14,
      color: colors.lightBlackText,
    },
    middleItemBorders: {
      borderLeftWidth: 1,
      borderLeftColor: colors.lighterGrey,
      borderRightWidth: 1,
      borderRightColor: colors.lighterGrey,
    },
    formContainer: {
      width: '92.5%',
      alignSelf: 'center',
      marginTop: 10,
    },
    inputGroup: {
      marginTop: 15,
    },
    label: {
      textAlign: isRTL ? 'left' : 'right',
      fontFamily: 'ElMessiri-Medium',
      fontSize: 14,
      color: colors.labelText,
      marginBottom: 10,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    editIcon: {
      width: 22,
      height: 22,
      position: 'absolute',
      zIndex: 999,
      [isRTL ? 'left' : 'right']: 20,
    },
    textInput: {
      backgroundColor: colors.white,
      width: '100%',
      borderRadius: 16,
      paddingHorizontal: 20,
      fontFamily: 'ElMessiri-Medium',
      fontSize: 16,
      color: colors.primaryBlack,
      lineHeight: 30,
      textAlign: isRTL ? 'left' : 'right',
    },
    logoutButton: {
      marginTop: 30,
      backgroundColor: colors.white,
      width: '100%',
      borderRadius: 16,
      paddingHorizontal: 20,
      paddingVertical: 10,
      flexDirection: isRTL ? 'row' : 'row-reverse',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    logoutIcon: {
      width: 22,
      height: 22,
    },
    logoutText: {
      fontFamily: 'ElMessiri-Medium',
      fontSize: 16,
      color: colors.red,
      lineHeight: 30,
      textAlign: isRTL ? 'left' : 'right',
    },
    saveButton: {
      backgroundColor: colors.dimmed,
      width: '92.5%',
      alignSelf: 'center',
      marginTop: 30,
      borderRadius: 18,
      height: 55,
      justifyContent: 'center',
    },
    saveButtonText: {
      color: colors.white,
      fontFamily: 'ElMessiri-Medium',
      fontSize: 20,
      textAlign: 'center',
    },
  });
};
