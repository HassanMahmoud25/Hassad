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
import {useRTL} from '../contexts/RTLProvider';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {deleteBenefit} from '../services/benefitsService';

type ParamList = {
  BookDetails: {
    benefit: {
      id: string;
      bookId: string;
      benefitTitle: string;
      benefitDate: string;
      benefitContent?: string;
      benefitImg?: string;
      pageNumber: number;
      bgColor: string;
      isFavorite?: boolean;
    };
  };
};

export const BenefitDetails = () => {
  const isRTL = useRTL();

  const navigation = useNavigation();

  const route = useRoute<RouteProp<ParamList, 'BookDetails'>>();

  const {
    id,
    bookId,
    benefitTitle,
    benefitDate,
    benefitContent,
    benefitImg,
    pageNumber,
    bgColor,
    isFavorite,
  } = route.params.benefit;

  const [favorite, setFavorite] = useState<boolean>(!!isFavorite);
  const [showDeleteBenefitModal, setShowDeleteBenefitModal] =
    useState<boolean>(false);

  const addToFavoriteHandler = () => {
    setFavorite(!favorite);
  };

  const handleGoBack = () => {
    navigation.goBack();
    return true;
  }

  const deleteBenefitHandler = async () => {
    try {
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjZjNGIwOTI4NDZlYTRjMmM2ZWYxNjI4IiwiZW1haWwiOiJ0ZXN0QGVtYWlsLmNvIiwiaWF0IjoxNzI0MjI3MTk0fQ.iAjowbF9o8g2jnm-Dc0gJ7PMMPtLTyVzhhYKErwcewg';
      await deleteBenefit(bookId, id, token);
      navigation.goBack();
      return true;
    } catch (err) {
      console.log('deleteBenefitHandler ERROR ==> ', err);
    }
  };

  const openDeleteBenefitModal = () => {
    setShowDeleteBenefitModal(true);
  };

  const closeDeleteBenefitModal = () => {
    setShowDeleteBenefitModal(false);
  };

  const styles = useMemo(() => getStyles(isRTL), [isRTL]);

  return (
    <View style={styles.mainContainer}>
      <ConfirmationModal
        visible={showDeleteBenefitModal}
        title={'حذف الفائدة؟'}
        message={
          'إذا قمت بحذف الفائدة لن تتمكن من العودة إليها، هل أنت واثقاً من حذف هذه الفائدة؟ '
        }
        onConfirm={deleteBenefitHandler}
        onCancel={closeDeleteBenefitModal}
      />

      <MainHeader title={benefitTitle} showBackIcon={true} onPressHandler={handleGoBack} />

      <ScrollView>
        <View
          style={[styles.benefitDetailsContainer, {backgroundColor: bgColor}]}>
          <View style={styles.benefitTitleAndDate}>
            <Text style={styles.benefitTitle}>{benefitTitle}</Text>
            <Text style={styles.benefitDate}>{benefitDate}</Text>
          </View>

          <View style={styles.textContentAndImg}>
            <Text style={styles.benefitContentText}>{benefitContent}</Text>

            {!!benefitImg && (
              <Image
                source={{uri: benefitImg}}
                resizeMode={'contain'}
                style={styles.benefitImgStyle}
              />
            )}
          </View>

          <View style={styles.pageNumberContainer}>
            <Text
              style={
                styles.pageNumberText
              }>{`رقم الصفحة :  ${pageNumber}`}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.actionsContainer}>
        <TouchableOpacity onPress={openDeleteBenefitModal}>
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

const getStyles = (isRTL: boolean) => {
  return StyleSheet.create({
    mainContainer: {
      flex: 1,
    },
    benefitDetailsContainer: {
      padding: 25,
      width: '90%',
      alignSelf: 'center',
      borderRadius: 25,
      marginTop: 15,
      marginBottom: 140,
    },
    benefitTitleAndDate: {
      width: '100%',
      flexDirection: isRTL ? 'row' : 'row-reverse',
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
      textAlign: isRTL ? 'left' : 'right',
      lineHeight: 30,
    },
    benefitImgStyle: {
      width: '100%',
      height: 180,
    },
    pageNumberContainer: {
      marginTop: 10,
      flexDirection: isRTL ? 'row' : 'row-reverse',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    pageNumberText: {
      borderRadius: 35,
      paddingVertical: 3,
      fontFamily: 'ElMessiri-Bold',
      fontSize: 16,
      color: colors.primaryBlack,
    },
    actionsContainer: {
      position: 'absolute',
      alignSelf: 'center',
      bottom: 40,
      flexDirection: isRTL ? 'row' : 'row-reverse',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingHorizontal: 50,
      paddingVertical: 22.5,
      backgroundColor: colors.white,
      width: '90%',
      borderRadius: 28,
      shadowColor: colors.black,
      shadowOffset: {width: 5, height: 5},
      shadowOpacity: 0.2,
      shadowRadius: 28,
      elevation: 1.5,
    },
    actionIconStyle: {
      width: 25,
      height: 25,
    },
  });
};
