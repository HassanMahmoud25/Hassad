import React, {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {MainHeader} from '../components/Headers/MainHeader';
import {ThereAreNoItemsComp} from '../components/ThereAreNoItemsComp';
import colors from '../configs/colors';
import {useTranslation} from 'react-i18next';
import {useRTL} from '../contexts/RTLProvider';
import {Benefit} from '../components/Benefit';
import {getFavoriteBenefits} from '../services/favoritesService';
import {formatDate} from '../utils/formatDate';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

export const FavoriteScreen = () => {
  const {t} = useTranslation();

  const isRTL = useRTL();

  const navigation = useNavigation();

  const styles = useMemo(() => getStyles(isRTL), [isRTL]);

  const [loadingFavorites, setLoadingFavorites] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<
    {
      _id: string;
      book: string;
      name: string;
      content?: string;
      img_url?: string;
      page_number: number;
      color: string;
      border_color: string;
      isFavorite: boolean;
      createdAt: string;
    }[]
  >([]);

  useFocusEffect(
    useCallback(() => {
      const fetchFavorites = async () => {
        try {
          console.log('*********** refresh Fovorites Screen ***********');
          setLoadingFavorites(true);
          const favoritesArr = await getFavoriteBenefits();
          setFavorites(favoritesArr);
        } catch (err) {
          console.log('getFavorites ERROR ==> ', err);
        } finally {
          setLoadingFavorites(false);
        }
      };

      fetchFavorites();
    }, []),
  );

  const handleGoBack = () => {
    navigation.goBack();
    return true;
  };

  return (
    <SafeAreaView style={styles.container}>
      <MainHeader title={t('favorite')} onPressHandler={handleGoBack} />
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

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {loadingFavorites ? (
          <View style={styles.indicatorStyle}>
            <ActivityIndicator size={50} color={colors.primaryMove} />
          </View>
        ) : (
          <>
            {favorites.length > 0 ? (
              <View style={styles.favoritesList}>
                {favorites.map(favorite => (
                  <Benefit
                    key={favorite._id}
                    id={favorite._id}
                    bookId={favorite.book}
                    benefitTitle={favorite.name}
                    benefitDate={formatDate(favorite.createdAt)}
                    benefitContent={favorite.content}
                    benefitImg={favorite.img_url}
                    pageNumber={favorite.page_number}
                    bgColor={favorite.color}
                    borderColor={favorite.border_color}
                    isFavorite={true}
                  />
                ))}
              </View>
            ) : (
              <ThereAreNoItemsComp
                imageSrc={require('../assets/images/thereAreNoFavoriteBenefits.png')}
                text={t("You don't have favorite benefits!")}
                subText={t(
                  'You can add a favorite benefit now. Go to the benefits and add what you like now!',
                )}
              />
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (isRTL: boolean) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      width: '90%',
      alignSelf: 'center',
      backgroundColor: colors.mainScreen,
      justifyContent: 'center',
      alignItems: 'center',
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
      marginBottom: 20,
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
      textAlign: isRTL ? 'right' : 'left',
      lineHeight: 30,
    },
    contentContainer: {
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    favoritesList: {
      rowGap: 15,
      marginBottom: 25,
      width: '100%',
    },
    indicatorStyle: {
      top: 200,
    },
  });
};
