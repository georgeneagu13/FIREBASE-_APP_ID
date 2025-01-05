export const COLORS = {
  primary: '#2E5BFF',
  secondary: '#FF2E63',
  tertiary: '#2EFF96',

  white: '#FFFFFF',
  black: '#000000',
  gray: '#83829A',
  lightGray: '#C1C0C8',

  success: '#00C48C',
  warning: '#FFB800',
  error: '#FF4444',

  card: '#F8F8F8',
  background: '#F5F5F5',
};

export const SIZES = {
  // Global sizes
  base: 8,
  font: 14,
  radius: 12,
  padding: 24,

  // Font sizes
  extraLarge: 28,
  large: 20,
  medium: 16,
  small: 12,
  tiny: 10,

  // Margins and Paddings
  marginHorizontal: 10,
  marginVertical: 10,
  section: 25,
  padding: 15,
};

export const FONTS = {
  bold: 'Inter-Bold',
  semiBold: 'Inter-SemiBold',
  medium: 'Inter-Medium',
  regular: 'Inter-Regular',
  light: 'Inter-Light',
};

export const SHADOWS = {
  light: {
    shadowColor: COLORS.gray,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  medium: {
    shadowColor: COLORS.gray,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    elevation: 7,
  },
  dark: {
    shadowColor: COLORS.gray,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.41,
    shadowRadius: 9.11,
    elevation: 14,
  },
}; 