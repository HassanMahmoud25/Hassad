import React, {useMemo} from 'react';
import {StyleSheet, TouchableOpacity, Image} from 'react-native';
import colors from '../configs/colors';
export const AddComponent: React.FC<{positionStyle: any}> = ({
  positionStyle,
}) => {
  const styles = useMemo(() => getStyles(), []);

  return (
    <TouchableOpacity activeOpacity={0.5} style={[styles.floatingButton, positionStyle]}>
      <Image
        source={require('../assets/icons/plusIcon.png')}
        resizeMode="contain"
        style={styles.plusIcon}
      />
    </TouchableOpacity>
  );
};

const getStyles = () => {
  return StyleSheet.create({
    floatingButton: {
      width: 53,
      height: 53,
      borderRadius: 50,
      position: 'absolute',
      bottom: 40,
      backgroundColor: colors.primaryMove,
      justifyContent: 'center',
      alignItems: 'center',
    },
    plusIcon: {
      width: 18,
      height: 18,
    },
  });
};
