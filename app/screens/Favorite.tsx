import React, {useMemo} from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {MainHeader} from '../components/Headers/MainHeader';
import {ThereAreNoItemsComp} from '../components/ThereAreNoItemsComp';
import colors from '../configs/colors';
import {useTranslation} from 'react-i18next';
import {useRTL} from '../contexts/RTLProvider';

export const FavoriteScreen = () => {
  const {t} = useTranslation();
  const isRTL = useRTL();
  const styles = useMemo(() => getStyles(isRTL), [isRTL]);

  return (
    <SafeAreaView style={styles.container}>
      <MainHeader title={t('favorite')} />
      <ScrollView style={styles.scrollView}>
        <ThereAreNoItemsComp
          imageSrc={require('../assets/images/thereAreNoFavoriteBenefits.png')}
          text={t("You don't have favorite benefits!")}
          subText={t(
            'You can add a favorite benefit now. Go to the benefits and add what you like now!',
          )}
        />
      </ScrollView>
      <TouchableOpacity style={styles.addButton}>
        <Image
          source={require('../assets/icons/plusIcon.png')}
          resizeMode="contain"
          style={styles.addIcon}
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const getStyles = (isRTL: boolean) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.mainScreen,
    },
    scrollView: {
      flex: 1,
    },
    addButton: {
      width: 53,
      height: 53,
      borderRadius: 50,
      position: 'absolute',
      right: 15,
      bottom: 40,
      backgroundColor: colors.primaryBlue,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addIcon: {
      width: 18,
      height: 18,
    },
  });
};
