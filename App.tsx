import React from 'react';
import {
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
} from 'react-native';

function App(): React.JSX.Element {
  return (
    <SafeAreaView>
      <StatusBar barStyle={'light-content'} />
      <View style={styles.container}>
        <Image
          source={require('./app/assets/images/authentication.png')}
          resizeMode="contain"
          style={{width: 280, height: 210}}
        />
        <Text style={{textAlign: 'center', fontSize: 20}}>
          {'مرحباً بعودتك إلى حصاد!'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
});

export default App;
