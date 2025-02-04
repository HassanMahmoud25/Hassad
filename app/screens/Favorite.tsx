import React, {useMemo} from 'react';
import {SafeAreaView, ScrollView, StyleSheet} from 'react-native';
import {MainHeader} from '../components/Headers/MainHeader';
import {ThereAreNoItemsComp} from '../components/ThereAreNoItemsComp';
import colors from '../config';

export const FavoriteScreen = () => {
  const styles = useMemo(() => getStyles(), []);

  return (
    <SafeAreaView style={styles.container}>
      <MainHeader title="المُفضلة" />
      <ScrollView contentContainerStyle={styles.scrollView}>
        <ThereAreNoItemsComp
          imageSrc={require('../assets/images/thereAreNoFavoriteBenefits.png')}
          text="ليس لديك فوائد مُفضلة !"
          subText="يمكنك إضافة فائدة مُفضلة الآن! اذهب إلى الفوائد وأضف ما تُحب إلى هنا"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = () => {
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
