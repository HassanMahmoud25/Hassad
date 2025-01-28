import React from 'react';
import {Modal, View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import colors from '../../config';

type ConfirmationModalProps = {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
};

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.contentContainer}>
            <Text style={styles.message}>{message}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onCancel}>
                <Text style={styles.cancelText}>{cancelText}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={onConfirm}>
                <Text style={styles.confirmText}>{confirmText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 349,
    height: 257,
    backgroundColor: colors.white,
    borderRadius: 22,
    paddingHorizontal: 39,
    paddingVertical: 23,
    alignItems: 'center',
    gap: 8,
  },
  title: {
    width: 260,
    height: 40,
    fontFamily: 'ElMessiri-Bold',
    fontSize: 18,
    fontWeight: 700,
    lineHeight: 22,
    textAlign: 'center',
    letterSpacing: -0.41,
    color: colors.primaryBlack,
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 21,
  },
  message: {
    fontFamily: 'ElMessiri-Regular',
    fontSize: 16,
    fontWeight: 400,
    lineHeight: 30,
    textAlign: 'center',
    color: colors.primaryBlack,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 28,
  },
  button: {
    width: 125,
    height: 45,
    flex: 1,
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  cancelButton: {
    backgroundColor: colors.primaryBlue,
  },
  confirmButton: {
    backgroundColor: colors.lightRed,
  },
  cancelText: {
    fontFamily: 'ElMessiri-Regular',
    color: colors.white,
    fontWeight: 500,
    fontSize: 20,
    lineHeight: 32,
    alignSelf: 'center',
    letterSpacing: -0.41,
  },
  confirmText: {
    fontFamily: 'ElMessiri-Regular',
    color: colors.white,
    fontWeight: 500,
    fontSize: 20,
    lineHeight: 32,
    alignSelf: 'center',
    letterSpacing: -0.41,
  },
});

export default ConfirmationModal;
