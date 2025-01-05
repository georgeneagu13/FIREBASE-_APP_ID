const ENV = {
  dev: {
    apiUrl: 'https://dev-api.foodai.com',
    imageApiUrl: 'https://dev-images.foodai.com',
    analyticsEnabled: false,
    logLevel: 'debug',
    features: {
      socialSharing: true,
      offlineMode: true,
      premium: false,
    },
  },
  staging: {
    apiUrl: 'https://staging-api.foodai.com',
    imageApiUrl: 'https://staging-images.foodai.com',
    analyticsEnabled: true,
    logLevel: 'warning',
    features: {
      socialSharing: true,
      offlineMode: true,
      premium: true,
    },
  },
  prod: {
    apiUrl: 'https://api.foodai.com',
    imageApiUrl: 'https://images.foodai.com',
    analyticsEnabled: true,
    logLevel: 'error',
    features: {
      socialSharing: true,
      offlineMode: true,
      premium: true,
    },
  },
};

const getEnvironment = () => {
  // You can use different methods to determine the environment
  // For example, using a build-time variable or runtime check
  if (__DEV__) {
    return ENV.dev;
  }
  
  // You could also use a build-time variable
  // return ENV[process.env.ENVIRONMENT || 'dev'];
  
  return ENV.prod;
};

export default getEnvironment(); 