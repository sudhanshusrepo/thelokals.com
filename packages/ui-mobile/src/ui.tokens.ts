export const colors = {
    backgroundBase: '#F7F3EC',        // warm off‑white
    backgroundSurface: '#FFFFFF',
    backgroundHeroStart: '#FFE7B8',
    backgroundHeroEnd: '#F8F0FF',
    primary: '#FF8A3C',
    primarySoft: '#FFE0C7',
    accentGreen: '#33C27F',
    textPrimary: '#171717',
    textSecondary: '#555555',
    textMuted: '#8B8B8B',
    borderSubtle: 'rgba(15, 23, 42, 0.06)',
    shadowSoft: 'rgba(15, 23, 42, 0.08)',
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
};

export const radii = {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    pill: 999,
};

export const shadows = {
    card: {
        shadowColor: colors.shadowSoft,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.16,
        shadowRadius: 18,
        elevation: 6,
    },
    chip: {
        shadowColor: colors.shadowSoft,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.14,
        shadowRadius: 10,
        elevation: 3,
    },
};

export const typography = {
    title1: { fontSize: 22, fontWeight: '700', lineHeight: 28 },
    title2: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
    subtitle: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
    body: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
    caption: { fontSize: 12, fontWeight: '500', lineHeight: 16 },
};
