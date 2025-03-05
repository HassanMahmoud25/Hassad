import React, {useEffect, useMemo, useState} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import colors from '../../configs/colors';
import {useRTL} from '../../contexts/RTLProvider';
import ImagePicker from 'react-native-image-crop-picker';
import {t} from 'i18next';
import {addBook, addFolder} from '../../services/booksService';
import {addBookToFolder} from '../../services/foldersService';

type ConfirmationModalProps = {
  visible: boolean;
  type: string;
  folderId?: string;
  onCancel: () => void;
  onRefresh?: () => void;
};

const AddItemModal: React.FC<ConfirmationModalProps> = ({
  visible,
  type,
  folderId,
  onCancel,
  onRefresh,
}) => {
  const isRTL = useRTL();
  const styles = useMemo(() => getStyles(isRTL), [isRTL]);

  const [bookName, setBookName] = useState<string>('');
  const [authorName, setAuthorName] = useState<string>('');
  const [coverUri, setCoverUri] = useState<string>('');
  const [coverType, setCoverType] = useState<string>('');
  const [imageSelected, setImageSelected] = useState<boolean>(false);
  const [activeSaveBtn, setActiveSaveBtn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [bookNameFieldActive, setBookNameFieldActive] =
    useState<boolean>(false);
  const [authorNameFieldActive, setAuthorNameFieldActive] =
    useState<boolean>(false);

  useEffect(() => {
    if (bookName.trim().length > 0 && authorName.trim().length > 0)
      setActiveSaveBtn(true);
    else setActiveSaveBtn(false);
  }, [bookName, authorName]);

  const cancelHandler = () => {
    onCancel();
    setBookName('');
    setAuthorName('');
    setCoverUri('');
    setCoverType('');
    setImageSelected(false);
  };

  const onSavingItem = async () => {
    try {
      setLoading(true);
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjZjNGIwOTI4NDZlYTRjMmM2ZWYxNjI4IiwiZW1haWwiOiJ0ZXN0QGVtYWlsLmNvIiwiaWF0IjoxNzI0MjI3MTk0fQ.iAjowbF9o8g2jnm-Dc0gJ7PMMPtLTyVzhhYKErwcewg';
      const formData = new FormData();
      formData.append('name', bookName);
      formData.append('author', authorName);
      const image = {
        uri: coverUri,
        type: coverType,
        name: 'cover',
      };
      imageSelected && formData.append('image', image);
      if (type === 'books') {
        !!folderId
          ? await addBookToFolder(formData, folderId, token)
          : await addBook(formData, token);
      } else {
        await addFolder(formData, token);
      }
      cancelHandler();
    } catch (err) {
      console.log('onSavingItem ERROR ==> ', err);
    } finally {
      setLoading(false);
      !!onRefresh && onRefresh();
    }
  };

  const handleUploadCover = async () => {
    const response = await ImagePicker.openPicker({
      width: 100,
      height: 115,
      cropping: true,
      mediaType: 'photo',
    });

    if (response && response.size) {
      setCoverUri(response.path);
      setCoverType(response.mime);
      setImageSelected(true);
    }
  };

  const handleRemoveSelectedCover = () => {
    setImageSelected(false);
    setCoverType('');
    setCoverUri('');
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={cancelHandler}>
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.modalContainer}>
          <View style={styles.modalHeaderContainer}>
            <TouchableOpacity disabled={loading} onPress={cancelHandler}>
              <Image
                source={require('../../assets/icons/closeIcon.png')}
                resizeMode="contain"
                style={styles.closeIconStyle}
              />
            </TouchableOpacity>
            <Text style={styles.title}>
              {type === 'books' ? t('addBook') : t('addFolder')}
            </Text>
            {loading ? (
              <ActivityIndicator color={colors.primaryMove} size={25} />
            ) : (
              <TouchableOpacity
                disabled={!activeSaveBtn}
                onPress={onSavingItem}>
                <Text
                  style={[
                    styles.saveBtnText,
                    {
                      color: activeSaveBtn ? colors.primaryMove : colors.dimmed,
                    },
                  ]}>
                  {t('save')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.contentContainer}>
            <View style={styles.formContainer}>
              <View style={styles.formItemContainer}>
                <Text style={styles.inputTitle}>{t('name')}</Text>
                <TextInput
                  placeholder={t('strongPersonality')}
                  placeholderTextColor={colors.lighterGrey}
                  style={[
                    styles.inputStyle,
                    {
                      borderColor: bookNameFieldActive
                        ? colors.primaryMove
                        : colors.dimmed,
                    },
                  ]}
                  value={bookName}
                  maxLength={30}
                  onChangeText={setBookName}
                  onFocus={() => setBookNameFieldActive(true)}
                  onBlur={() => setBookNameFieldActive(false)}
                />
              </View>
              <View style={styles.formItemContainer}>
                <Text style={styles.inputTitle}>{t('authorName')}</Text>
                <TextInput
                  placeholder={t('yasserElhezimy')}
                  placeholderTextColor={colors.lighterGrey}
                  style={[
                    styles.inputStyle,
                    {
                      borderColor: authorNameFieldActive
                        ? colors.primaryMove
                        : colors.dimmed,
                    },
                  ]}
                  value={authorName}
                  maxLength={30}
                  onChangeText={setAuthorName}
                  onFocus={() => setAuthorNameFieldActive(true)}
                  onBlur={() => setAuthorNameFieldActive(false)}
                />
              </View>
              <View style={styles.formItemContainer}>
                <Text style={styles.inputTitle}>
                  {type === 'books' ? t('bookCover') : t('folderCover')}
                </Text>
                {imageSelected ? (
                  <View style={styles.selectedCoverContainer}>
                    <TouchableOpacity
                      disabled={loading}
                      onPress={handleRemoveSelectedCover}
                      style={styles.closeIconContainer}>
                      <Image
                        source={require('../../assets/icons/closeIcon_white.png')}
                        resizeMode={'contain'}
                        style={styles.removeIconStyle}
                      />
                    </TouchableOpacity>
                    <View style={styles.coverImgContainer}>
                      <Image
                        source={{uri: coverUri}}
                        resizeMode="cover"
                        style={styles.coverStyle}
                      />
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={handleUploadCover}
                    style={styles.addCoverBtn}>
                    <Image
                      source={require('../../assets/icons/uploadIcon.png')}
                      resizeMode={'contain'}
                      style={styles.uploadCoverIconStyle}
                    />
                    <Text style={styles.clickToUploadText}>
                      {t('clickToSelectCoverImage')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const getStyles = (isRTL: boolean) => {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
    modalContainer: {
      width: '100%',
      backgroundColor: colors.secondaryScreenBgColor,
      borderTopLeftRadius: 23,
      borderTopRightRadius: 23,
      padding: 30,
      gap: 10,
    },
    modalHeaderContainer: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    title: {
      fontFamily: 'ElMessiri-Bold',
      fontSize: 20,
      lineHeight: 32,
      textAlign: 'center',
      color: colors.primaryBlack,
    },
    saveBtnText: {
      fontFamily: 'ElMessiri-Bold',
      fontSize: 16,
    },
    contentContainer: {
      width: '100%',
      alignItems: 'center',
      gap: 20,
    },
    formContainer: {
      width: '100%',
      gap: 15,
    },
    formItemContainer: {
      width: '100%',
      gap: 7.5,
    },
    inputTitle: {
      fontFamily: 'ElMessiri-SemiBold',
      fontSize: 16,
    },
    inputStyle: {
      backgroundColor: colors.white,
      borderRadius: 16,
      borderWidth: 1,
      paddingHorizontal: 15,
      paddingVertical: 12,
      fontFamily: 'Tajawal-Medium',
      fontSize: 16,
      textAlign: 'right',
    },
    addCoverBtn: {
      padding: 20,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderRadius: 10,
      borderColor: colors.primaryMove,
      alignItems: 'center',
      backgroundColor: colors.white,
    },
    uploadCoverIconStyle: {
      width: 30,
      height: 30,
      marginBottom: 14,
    },
    clickToUploadText: {
      fontFamily: 'ElMessiri-Medium',
      fontSize: 16,
      color: colors.primaryBlack,
    },
    closeIconStyle: {
      width: 17.5,
      height: 17.5,
    },
    selectedCoverContainer: {
      alignSelf: 'center',
      position: 'relative',
    },
    closeIconContainer: {
      zIndex: 999,
      backgroundColor: colors.primaryMove,
      width: 25,
      height: 25,
      borderRadius: 50,
      position: 'absolute',
      left: -10,
      top: -10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    removeIconStyle: {
      width: 15,
      height: 10,
    },
    coverImgContainer: {
      width: 100,
      height: 115,
      borderWidth: 5,
      borderColor: colors.primaryMove,
      borderRadius: 12,
      alignSelf: 'center',
      overflow: 'hidden',
    },
    coverStyle: {
      width: '100%',
      height: '100%',
    },
  });
};

export default AddItemModal;
