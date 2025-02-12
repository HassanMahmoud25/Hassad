import React, {useEffect, useMemo, useState} from 'react';
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
import {getBookBenefits} from '../services/benefitsService';

export const FavoriteScreen = () => {
  const {t} = useTranslation();

  const isRTL = useRTL();

  const styles = useMemo(() => getStyles(isRTL), [isRTL]);

  const [favorites, setFavorites] = useState<
    {
      _id: number;
      name: string;
      content?: string;
      benefitImg?: any;
      page_number: number;
      color: string;
      border_color: string;
      isFavorite: boolean;
      createdAt: string;
    }[]
  >([]);
  const [loadingFavorites, setLoadingFavorites] = useState<boolean>(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoadingFavorites(true);
        const token =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjZjNGIwOTI4NDZlYTRjMmM2ZWYxNjI4IiwiZW1haWwiOiJ0ZXN0QGVtYWlsLmNvIiwiaWF0IjoxNzI0MjI3MTk0fQ.iAjowbF9o8g2jnm-Dc0gJ7PMMPtLTyVzhhYKErwcewg';
        const favorites = await getBookBenefits(token);
        setFavorites(favorites);
      } catch (err) {
        console.log('getFavorites ERROR ==> ', err);
      } finally {
        setLoadingFavorites(false);
      }
    };

    fetchFavorites();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getUTCDate();
    const month = date.getUTCMonth() + 1;
    const year = date.getUTCFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    return formattedDate;
  };

  return (
    <SafeAreaView style={styles.container}>
      <MainHeader title={t('favorite')} />
      {favorites.length > 0 && (
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
      )}

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
                    benefitTitle={favorite.name}
                    benefitDate={formatDate(favorite.createdAt)}
                    benefitContent={favorite.content}
                    benefitImg={favorite.benefitImg}
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
      width: '92.5%',
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
      rowGap: 20,
      marginBottom: 25,
      width: '100%',
    },
    indicatorStyle: {
      top: 150,
    },
  });
};
