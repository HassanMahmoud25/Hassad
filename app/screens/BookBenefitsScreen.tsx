import React, {useEffect, useMemo, useState} from 'react';
import {
  BackHandler,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  View,
  Text,
  ScrollView,
} from 'react-native';
import {MainHeader} from '../components/Headers/MainHeader';
import colors from '../config';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {Benefit} from '../components/Benefit';
import {AddComponent} from '../components/AddComponent';

type ParamList = {
  BookBenefitsScreen: {title: string};
};

export const BookBenefitsScreen = () => {
  const [benefits] = useState([
    {
      key: 1,
      benefitTitle: 'ثلاثية غرناطة غرناطة ثلاثية غرناطة',
      benefitDate: '11/3/2023',
      benefitContent:
        'ثلاثية غرناطة هي ثلاثية روائية تتكون ثلاثية غرناطة هي ثلاثية روائية تتكون ثلاثية غرناطة هي ثلاثية روائية تتكون ثلاثية غرناطة هي ثلاثية روائية تتكون',
      benefitImg: require('../assets/images/benefitScreen.png'),
      pageNumber: 210,
      bgColor: '#D7F6E5',
    },
    {
      key: 2,
      benefitTitle: 'ثلاثية غرناطة',
      benefitDate: '11/3/2023',
      benefitContent: 'ثلاثية غرناطة هي ثلاثية روائية تتكون',
      pageNumber: 210,
      bgColor: '#EFE9F5',
    },
    {
      key: 3,
      benefitTitle: 'ثلاثية غرناطة',
      benefitDate: '11/3/2023',
      benefitImg: require('../assets/images/benefitScreen.png'),
      pageNumber: 210,
      bgColor: '#DBE9FE',
    },
    {
      key: 4,
      benefitTitle: 'ثلاثية غرناطة غرناطة ثلاثية غرناطة',
      benefitDate: '11/3/2023',
      benefitContent:
        'ثلاثية غرناطة هي ثلاثية روائية تتكون ثلاثية غرناطة هي ثلاثية روائية تتكون ثلاثية غرناطة هي ثلاثية روائية تتكون ثلاثية غرناطة هي ثلاثية روائية تتكون',
      benefitImg: require('../assets/images/benefitScreen.png'),
      pageNumber: 210,
      bgColor: '#D7F6E5',
    },
  ]);

  const route = useRoute<RouteProp<ParamList, 'BookBenefitsScreen'>>();
  const {title} = route.params;

  const navigation = useNavigation();

  const styles = useMemo(() => getStyles(), []);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <MainHeader title={title} showBackIcon={true} />
      <View style={styles.contentContainer}>
        <View style={styles.searchContainer}>
          <TouchableOpacity style={styles.searchBtnStyle}>
            <Image
              source={require('../assets/icons/searchIcon_light.png')}
              resizeMode={'contain'}
              style={styles.searchIconStyle}
            />
          </TouchableOpacity>
          <TextInput
            placeholder="ابحث عن فائدة"
            style={styles.searchInputField}
          />
        </View>

        <View style={styles.filterAndBenefitsCount}>
          <Text style={styles.benefitsCount}>{'عدد الفوائد :  0'}</Text>
          <Image
            source={require('../assets/icons/filterIcon.png')}
            resizeMode="contain"
            style={styles.filterIcon}
          />
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.benefitsContainer}>
            {benefits.map(benefit => (
              <Benefit
                key={benefit.key}
                benefitTitle={benefit.benefitTitle}
                benefitDate={benefit.benefitDate}
                benefitContent={benefit.benefitContent}
                benefitImg={benefit.benefitImg}
                pageNumber={benefit.pageNumber}
                bgColor={benefit.bgColor}
              />
            ))}
          </View>
        </ScrollView>

        <AddComponent positionStyle={styles.addBtnStyle} />
      </View>
    </SafeAreaView>
  );
};

const getStyles = () => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.mainScreen,
    },
    contentContainer: {
      flex: 1,
      width: '92.5%',
      alignSelf: 'center',
      marginTop: 15,
    },
    searchBtnStyle: {
      width: '15%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    searchContainer: {
      width: '100%',
      height: 55,
      flexDirection: 'row-reverse',
      alignItems: 'center',
      backgroundColor: colors.white,
      borderRadius: 20,
    },
    searchIconStyle: {
      width: 20,
      height: 20,
      alignSelf: 'center',
    },
    searchInputField: {
      width: '80%',
      height: '100%',
      fontFamily: 'Tajawal-Medium',
      fontSize: 18,
      textAlign: 'right',
      lineHeight: 30,
    },
    filterAndBenefitsCount: {
      paddingTop: 15,
      paddingBottom: 10,
      flexDirection: 'row-reverse',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    benefitsCount: {
      fontFamily: 'ElMessiri-Medium',
      fontSize: 14,
      textAlign: 'right',
      color: colors.primaryBlack,
    },
    filterIcon: {
      width: 17,
      height: 17,
    },
    benefitsContainer: {
      gap: 20,
      flex: 1,
      marginBottom: 40,
      marginTop: 15,
    },
    addBtnStyle: {
      right: 0,
    },
  });
};
