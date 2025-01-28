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

export const FavoriteScreen = () => {
  const styles = useMemo(() => getStyles(), []);

  return (
    <SafeAreaView style={styles.container}>
      <MainHeader title="المُفضلة" />
      <ScrollView style={styles.scrollView}>
        <ThereAreNoItemsComp
          imageSrc={require('../assets/images/thereAreNoFavoriteBenefits.png')}
          text="ليس لديك فوائد مُفضلة !"
          subText="يمكنك إضافة فائدة مُفضلة الآن! اذهب إلى الفوائد وأضف ما تُحب إلى هنا"
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

const getStyles = () => {
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
