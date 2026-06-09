import React, {useCallback, useEffect, useMemo, useState} from 'react';
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
  ActivityIndicator,
} from 'react-native';
import {MainHeader} from '../components/Headers/MainHeader';
import colors from '../configs/colors';
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {Benefit} from '../components/Benefit';
import {AddComponent} from '../components/AddComponent';
import {useRTL} from '../contexts/RTLProvider';
import {getBookBenefits} from '../services/benefitsService';
import {formatDate} from '../utils/formatDate';
import {ThereAreNoItemsComp} from '../components/ThereAreNoItemsComp';
import {t} from 'i18next';

type ParamList = {
  BookBenefitsScreen: {title: string; id: string};
};

export const BookBenefitsScreen = () => {
  const isRTL = useRTL();

  const [loadingBenefits, setLoadingBenefits] = useState<boolean>(true);
  const [benefits, setBenefits] = useState<
    {
      _id: string;
      book: string;
      name: string;
      content: string;
      page_number: number;
      img_url: string;
      favourated: boolean;
      color: string;
      border_color: string;
      createdAt: string;
    }[]
  >([]);

  const route = useRoute<RouteProp<ParamList, 'BookBenefitsScreen'>>();

  const {title, id} = route.params;

  const navigation = useNavigation();

  const styles = useMemo(() => getStyles(isRTL), [isRTL]);

  const BackHandlerMethod = useCallback(() => {
    navigation.goBack();
    return true;
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      const fetchBookBenefits = async () => {
        try {
          setLoadingBenefits(true);
          console.log('*********** refresh Book Benefits Screen ***********');
          const benefitsArr = await getBookBenefits(id);
          setBenefits(benefitsArr);
        } catch (err) {
          console.log('fetchBookBenefits ERROR ====> ', err);
        } finally {
          setLoadingBenefits(false);
        }
      };

      fetchBookBenefits();
    }, [id]),
  );

  useEffect(() => {
    const backHandlerObj = BackHandler.addEventListener(
      'hardwareBackPress',
      BackHandlerMethod,
    );

    return () => {
      backHandlerObj.remove();
    };
  }, [BackHandlerMethod]);

  return (
    <SafeAreaView style={styles.container}>
      <MainHeader
        title={title}
        showBackIcon={true}
        onPressHandler={BackHandlerMethod}
      />
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
            placeholder={t('searchForBenefit')}
            style={styles.searchInputField}
          />
        </View>

        <View style={styles.filterAndBenefitsCount}>
          <Text style={styles.benefitsCount}>{`${t('benefitsCount')} : ${
            benefits.length
          }`}</Text>
          <Image
            source={require('../assets/icons/filterIcon.png')}
            resizeMode="contain"
            style={styles.filterIcon}
          />
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {loadingBenefits ? (
            <View style={styles.indicatorStyle}>
              <ActivityIndicator size={50} color={colors.primaryMove} />
            </View>
          ) : benefits.length > 0 ? (
            <View style={styles.benefitsContainer}>
              {benefits.map(benefit => (
                <Benefit
                  key={benefit._id}
                  id={benefit._id}
                  bookId={benefit.book}
                  benefitTitle={benefit.name}
                  benefitDate={formatDate(benefit.createdAt)}
                  benefitContent={benefit.content}
                  benefitImg={benefit.img_url}
                  pageNumber={benefit.page_number}
                  isFavorite={benefit.favourated}
                  bgColor={benefit.color}
                  borderColor={benefit.border_color}
                />
              ))}
            </View>
          ) : (
            <ThereAreNoItemsComp
              imageSrc={require('../assets/images/thereAreNoBenefits.png')}
              text={t('YouHaveNoBenefitsAddWhatYouVeGainedFromYourBook')}
              subText={t('clickIconToAddBenefit')}
            />
          )}
        </ScrollView>

        <AddComponent onPress={() => {}} positionStyle={styles.addBtnStyle} />
      </View>
    </SafeAreaView>
  );
};

const getStyles = (isRTL: boolean) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.mainScreen,
    },
    contentContainer: {
      flex: 1,
      width: '90%',
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
      flexDirection: isRTL ? 'row' : 'row-reverse',
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
      flexDirection: isRTL ? 'row' : 'row-reverse',
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
      gap: 15,
      flex: 1,
      marginBottom: 40,
      marginTop: 15,
    },
    addBtnStyle: {
      [isRTL ? 'left' : 'right']: 0,
      bottom: 80,
    },
    indicatorStyle: {
      top: 200,
    },
  });
};
