// import { AppState } from "react-native";
import React from 'react';
import { Provider } from 'react-redux';
// import { Navigation } from "react-native-navigation";
import { createStackNavigator, createAppContainer } from 'react-navigation';
import { GlobalStore } from './src/GlobalStore';
import Source from './src/containers/Source';
import Filters from './src/containers/Filters';
import Outline from './src/containers/Outline';
import Silhouette from './src/containers/Silhouette';
import Background from './src/containers/Background';
import Overlay from './src/containers/Overlay';
import Refine from './src/containers/Refine';

const store = new GlobalStore().configureStore();

const AppNavigator = createStackNavigator(
  {
    Source: {
      screen: Source
    },
    Refine: {
      screen: Refine
    },
    Filters: {
      screen: Filters
    },
    Background: {
      screen: Background
    },
    Outline: {
      screen: Outline
    },
    Silhouette: {
      screen: Silhouette
    },
    Overlay: {
      screen: Overlay
    }
  },
  {
    headerMode: 'none',
    navigationOptions: {
      headerVisible: false
    }
  }
);

const AppContainer = createAppContainer(AppNavigator);

// Navigation.registerComponentWithRedux(
//   "starify.Source",
//   () => Source,
//   Provider,
//   store
// );
// Navigation.registerComponentWithRedux(
//   "starify.Filters",
//   () => Filters,
//   Provider,
//   store
// );
// Navigation.registerComponentWithRedux(
//   "starify.Refine",
//   () => Refine,
//   Provider,
//   store
// );
// Navigation.registerComponentWithRedux(
//   "starify.Outline",
//   () => Outline,
//   Provider,
//   store
// );
// Navigation.registerComponentWithRedux(
//   "starify.Overlay",
//   () => Overlay,
//   Provider,
//   store
// );
// Navigation.registerComponentWithRedux(
//   "starify.Silhouette",
//   () => Silhouette,
//   Provider,
//   store
// );
// Navigation.registerComponentWithRedux(
//   "starify.Background",
//   () => Background,
//   Provider,
//   store
// );

// // animation is not working actually https://github.com/wix/react-native-navigation/issues/4193
// Navigation.events().registerAppLaunchedListener(() => {
//   Navigation.setDefaultOptions({
//     animations: {
//       setRoot: {
//         alpha: {
//           from: 0,
//           to: 1,
//           duration: 500
//         }
//       },
//       _push: {
//         enabled: false,
//         content: {
//           alpha: {
//             from: 0,
//             to: 1,
//             duration: 500,
//             interpolation: "accelerate"
//           }
//         }
//       },
//       _pop: {
//         content: {
//           alpha: {
//             from: 1,
//             to: 0,
//             duration: 500,
//             interpolation: "decelerate"
//           }
//         }
//       }
//     },
//     popGesture: false,
//     topBar: {
//       visible: false
//     }
//   });
//   Navigation.setRoot({
//     root: {
//       stack: {
//         children: [
//           {
//             component: {
//               name: "starify.Source"
//             }
//           }
//         ]
//       }
//     }
//   });
// });

import { AppRegistry } from 'react-native';
import App from './App';

const Wrapper = () => (
  <Provider store={store}>
    <AppContainer />
  </Provider>
);

AppRegistry.registerComponent('starified', () => Wrapper);
