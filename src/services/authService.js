import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export const authService = {
  // Initialize Google Sign-In
  init: () => {
    GoogleSignin.configure({
      webClientId: 'YOUR_WEB_CLIENT_ID', // Get this from Firebase Console
    });
  },

  // Sign in with email/password
  signInWithEmail: async (email, password) => {
    try {
      const result = await auth().signInWithEmailAndPassword(email, password);
      return result.user;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  // Sign in with Google
  signInWithGoogle: async () => {
    try {
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const result = await auth().signInWithCredential(googleCredential);
      return result.user;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await auth().signOut();
      await GoogleSignin.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  // Get current user
  getCurrentUser: () => {
    return auth().currentUser;
  },

  // Listen to auth state changes
  onAuthStateChanged: (callback) => {
    return auth().onAuthStateChanged(callback);
  }
}; 