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

export const ProfileScreen = () => {
  const styles = useMemo(() => getStyles(), []);

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
                {'مُجلداً'}
              </Text>
            </View>
            <View style={[styles.statItem, styles.middleItemBorders]}>
              <Text style={[styles.statText, styles.numberStyle]}>{'80'}</Text>
              <Text style={[styles.statText, styles.classNameStyle]}>
                {'كتاباً'}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statText, styles.numberStyle]}>{'118'}</Text>
              <Text style={[styles.statText, styles.classNameStyle]}>
                {'فائدة'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.formContainer}>
          <View>
            <Text style={styles.label}>{'الاسم'}</Text>
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
            <Text style={styles.label}>{'البريد الإلكتروني'}</Text>
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

          <TouchableOpacity style={styles.logoutButton}>
            <Image
              source={require('../assets/icons/logoutIcon.png')}
              resizeMode="contain"
              style={styles.logoutIcon}
            />
            <Text style={styles.logoutText}>{'تسجيل خروج'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>{'حفظ التغييرات'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const getStyles = () => {
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
      flexDirection: 'row',
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
      textAlign: 'right',
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
      left: 20,
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
      textAlign: 'right',
    },
    logoutButton: {
      marginTop: 30,
      backgroundColor: colors.white,
      width: '100%',
      borderRadius: 16,
      paddingHorizontal: 20,
      paddingVertical: 10,
      flexDirection: 'row',
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
      textAlign: 'right',
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
