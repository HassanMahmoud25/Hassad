/**
 * @format
 */

import {AppRegistry} from 'react-native';
import './app/configs/i18n.js';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
