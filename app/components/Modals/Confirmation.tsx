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
                <Text style={styles.btnText}>{cancelText}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={onConfirm}>
                <Text style={styles.btnText}>{confirmText}</Text>
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
    width: "92.5%",
    backgroundColor: colors.white,
    borderRadius: 23,
    paddingHorizontal: 35,
    paddingVertical: 30,
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontFamily: 'ElMessiri-Bold',
    fontSize: 18,
    lineHeight: 32,
    textAlign: 'center',
    color: colors.primaryBlack,
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 20
  },
  message: {
    fontFamily: 'ElMessiri-Regular',
    fontSize: 16,
    lineHeight: 30,
    textAlign: 'center',
    color: colors.primaryBlack,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 25,
  },
  button: {
    paddingHorizontal: 40,
    height: 45,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.primaryMove,
  },
  confirmButton: {
    backgroundColor: colors.lightRed,
  },
  btnText: {
    fontFamily: 'ElMessiri-Regular',
    color: colors.white,
    fontSize: 20,
    lineHeight: 32,
    textAlign: 'center'
  },
});

export default ConfirmationModal;
