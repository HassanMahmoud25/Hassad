import React, {useMemo, useState} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {MainHeader} from '../components/Headers/MainHeader';
import colors from '../configs/colors';
import ConfirmationModal from '../components/Modals/Confirmation';

export const BenefitDetails = () => {
  const [favorite, setFavorite] = useState<boolean>(false);
  const [showDeleteBenefitModal, setShowDeleteBenefitModal] =
    useState<boolean>(false);

  const addToFavoriteHandler = () => {
    setFavorite(!favorite);
  };

  const deleteBenefitHandler = () => {
    setShowDeleteBenefitModal(true);
  };

  const closeDeleteBenefitModal = () => {
    setShowDeleteBenefitModal(false);
  };

  const styles = useMemo(() => getStyles(), []);

  return (
    <View style={styles.mainContainer}>
      <ConfirmationModal
        visible={showDeleteBenefitModal}
        title={'حذف الفائدة؟'}
        message={
          'إذا قمت بحذف الفائدة لن تتمكن من العودة إليها، هل أنت واثقاً من حذف هذه الفائدة؟ '
        }
        onConfirm={closeDeleteBenefitModal}
        onCancel={closeDeleteBenefitModal}
      />

      <MainHeader title="ثلاثية غرناطة" showBackIcon={true} />

      <ScrollView>
        <View style={styles.benefitDetailsContainer}>
          <View style={styles.benefitTitleAndDate}>
            <Text style={styles.benefitTitle}>{'سقوط غرناطة'}</Text>
            <Text style={styles.benefitDate}>{'11/3/2023'}</Text>
          </View>

          <View style={styles.textContentAndImg}>
            <Text style={styles.benefitContentText}>
              {
                'ثلاثية غرناطة هي ثلاثية روائية تتكون من ثلاث روايات للكاتبة المصرية رضوى عاشور و هم على التوالي: غرناطة - مريمة - الرحيل.وتدور الأحداث في مملكة غرناطة بعد سقوط جميع الممالك الإسلامية في الأندلس، و تبدأ أحداث الثلاثية في عام 1491م، وهو العام الذي سقطت فيه غرناطة بإعلان المعاهدة التي تنازل بمقتضاها (أبو عبد الله محمد الصغير) آخر ملوك غرناطة عن ملكه لملكي قشتالة وأراجون، وتنتهى بمخالفة آخر أبطالها الأحياء (عليّ) لقرار ترحيل المسلمين حينما يكتشف أن الموت في الرحيل عن الأندلس و ليس في البقاء.'
              }
            </Text>

            <Image
              source={require('../assets/images/benefitScreen.png')}
              resizeMode={'contain'}
              style={styles.benefitImgStyle}
            />
          </View>

          <View style={styles.pageNumberContainer}>
            <Text style={styles.pageNumberText}>{'رقم الصفحة :  225'}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.actionsContainer}>
        <TouchableOpacity onPress={deleteBenefitHandler}>
          <Image
            source={require('../assets/icons/trashIcon.png')}
            resizeMode={'contain'}
            style={styles.actionIconStyle}
          />
        </TouchableOpacity>

        <TouchableOpacity>
          <Image
            source={require('../assets/icons/editIcon.png')}
            resizeMode={'contain'}
            style={styles.actionIconStyle}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={addToFavoriteHandler}>
          <Image
            source={
              favorite
                ? require('../assets/icons/Heart_active.png')
                : require('../assets/icons/Heart_inactive.png')
            }
            resizeMode={'contain'}
            style={styles.actionIconStyle}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = () => {
  return StyleSheet.create({
    mainContainer: {
      flex: 1,
    },
    benefitDetailsContainer: {
      padding: 25,
      backgroundColor: '#EFE9F5',
      width: '92.5%',
      alignSelf: 'center',
      borderRadius: 25,
      marginTop: 15,
      marginBottom: 140,
    },
    benefitTitleAndDate: {
      width: '100%',
      flexDirection: 'row-reverse',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#CBCBCB',
    },
    benefitTitle: {
      fontFamily: 'ElMessiri-Bold',
      fontSize: 18,
      color: colors.primaryBlack,
    },
    benefitDate: {
      fontFamily: 'ElMessiri-Medium',
      fontSize: 14,
      color: colors.primaryBlack,
    },
    textContentAndImg: {
      marginTop: 15,
      gap: 15,
    },
    benefitContentText: {
      fontFamily: 'Tajawal-Medium',
      fontSize: 17,
      color: '#354152',
      textAlign: 'right',
      lineHeight: 30,
    },
    benefitImgStyle: {
      width: '100%',
      height: 150,
    },
    pageNumberContainer: {
      marginTop: 10,
      flexDirection: 'row-reverse',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    pageNumberText: {
      borderRadius: 35,
      paddingVertical: 3,
      paddingHorizontal: 15,
      fontFamily: 'ElMessiri-Bold',
      fontSize: 16,
      color: colors.primaryBlack,
    },
    actionsContainer: {
      position: 'absolute',
      alignSelf: 'center',
      bottom: 40,
      flexDirection: 'row-reverse',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingHorizontal: 50,
      paddingVertical: 22.5,
      backgroundColor: colors.white,
      width: '92.5%',
      borderRadius: 28,
    },
    actionIconStyle: {
      width: 25,
      height: 25,
    },
  });
};
