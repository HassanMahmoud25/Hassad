import React, {useMemo} from 'react';
import {SafeAreaView, ScrollView, StyleSheet} from 'react-native';
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
      <ScrollView contentContainerStyle={styles.scrollView}>
        <ThereAreNoItemsComp
          imageSrc={require('../assets/images/thereAreNoFavoriteBenefits.png')}
          text={t("You don't have favorite benefits!")}
          subText={t(
            'You can add a favorite benefit now. Go to the benefits and add what you like now!',
          )}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (isRTL: boolean) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.mainScreen,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollView: {
      flex: 1,
      justifyContent: 'center',
    },
  });
};
