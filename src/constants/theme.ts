export const theme = {
  colors: {
    primary: '#1565C0',
    primarySoft: '#E3F2FD',
    sos: '#D32F2F',
    sosSoft: '#FDECEC',
    success: '#2E7D32',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceMuted: '#EAF3FF',
    card: '#F7FAFC',
    text: '#212121',
    textMuted: '#5F6368',
    border: '#CFD8DC',
  },
  fonts: {
    body: 'NotoSans_400Regular',
    heading: 'NotoSans_700Bold',
  },
  fontSizes: {
    caption: 18,
    body: 20,
    subheading: 28,
    heading: 32,
    display: 40,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 20,
    xl: 28,
    xxl: 36,
    xxxl: 48,
  },
  radius: {
    lg: 24,
    xl: 32,
    pill: 999,
  },
  touch: {
    minimum: 64,
  },
} as const;

