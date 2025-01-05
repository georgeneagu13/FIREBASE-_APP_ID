import { Linking } from 'react-native';
import { navigationRef } from '../navigation/RootNavigator';

export const deepLinkingService = {
  config: {
    screens: {
      Main: {
        screens: {
          Results: 'food/:id',
          Search: 'search/:query',
          Profile: 'profile',
        },
      },
    },
  },

  linking: {
    prefixes: ['foodai://', 'https://foodai.app'],
    
    async getInitialURL() {
      const url = await Linking.getInitialURL();
      return url;
    },

    subscribe(listener) {
      const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
        listener(url);
      });

      return () => {
        linkingSubscription.remove();
      };
    },

    // Handle deep link navigation
    navigate: (url) => {
      const route = url.replace(/.*?:\/\//g, '');
      const [path, params] = route.split('?');
      
      if (path.startsWith('food/')) {
        const id = path.split('/')[1];
        navigationRef.navigate('Results', { id });
      } else if (path.startsWith('search/')) {
        const query = path.split('/')[1];
        navigationRef.navigate('Search', { query });
      }
    },
  },
}; 