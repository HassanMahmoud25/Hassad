import React, {useMemo} from 'react';
import {Text, View, StyleSheet, Image, TouchableOpacity} from 'react-native';
import colors from '../../configs/colors';
import {useRTL} from '../../contexts/RTLProvider';

interface MainHeaderProps {
  title: string;
  showBackIcon?: boolean;
  showSearchIcon?: boolean;
  onPressHandler: () => {};
}

export const MainHeader: React.FC<MainHeaderProps> = ({
  title,
  showBackIcon,
  showSearchIcon,
  onPressHandler,
}) => {
  const isRTL = useRTL();
  const styles = useMemo(() => getStyles(isRTL), [isRTL]);

  return (
    <View style={styles.mainContainer}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity
          onPress={onPressHandler}
          activeOpacity={0.5}
          style={styles.iconContainer}>
          {!!showBackIcon && (
            <Image
              source={require('../../assets/icons/Arrow_black.png')}
              resizeMode="contain"
              style={styles.headerBackIcon}
            />
          )}

          {!!showSearchIcon && (
            <Image
              source={require('../../assets/icons/searchIcon.png')}
              resizeMode="contain"
              style={styles.headerSearchIcon}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = (isRTL: boolean) => {
  return StyleSheet.create({
    mainContainer: {
      paddingTop: 30,
      paddingBottom: 10,
      width: '90%',
      alignSelf: 'center',
    },
    innerContainer: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 22,
      textAlign: 'center',
      fontFamily: 'ElMessiri-Bold',
      color: colors.primaryBlack,
      width: "85%"
    },
    iconContainer: {
      position: 'absolute',
      [isRTL ? 'left' : 'right']: 0,
      paddingHorizontal: 5,
      paddingVertical: 5,
    },
    headerBackIcon: {
      width: 9,
      height: 16,
      transform: [{scaleX: isRTL ? 1 : -1}],
    },
    headerSearchIcon: {
      width: 24,
      height: 24,
    },
  });
};
