import * as Font from 'expo-font';

// Font loading utility
export const loadFonts = async () => {
    try {
        await Font.loadAsync({
            'Figtree-Regular': require('../../../assets/fonts/Figtree-Regular.ttf'),
            'Figtree-Medium': require('../../../assets/fonts/Figtree-Medium.ttf'),
            'Figtree-SemiBold': require('../../../assets/fonts/Figtree-SemiBold.ttf'),
            'Figtree-Bold': require('../../../assets/fonts/Figtree-Bold.ttf'),
            'Figtree-Black': require('../../../assets/fonts/Figtree-Black.ttf'),
            'Figtree-BlackItalic': require('../../../assets/fonts/Figtree-BlackItalic.ttf'),
            'Figtree-BoldItalic': require('../../../assets/fonts/Figtree-BoldItalic.ttf'),
            'Figtree-ExtraBold': require('../../../assets/fonts/Figtree-ExtraBold.ttf'),
            'Figtree-ExtraBoldItalic': require('../../../assets/fonts/Figtree-ExtraBoldItalic.ttf'),
            'Figtree-Italic': require('../../../assets/fonts/Figtree-Italic.ttf'),
            'Figtree-Light': require('../../../assets/fonts/Figtree-Light.ttf'),
            'Figtree-LightItalic': require('../../../assets/fonts/Figtree-LightItalic.ttf'),
            'Figtree-MediumItalic': require('../../../assets/fonts/Figtree-MediumItalic.ttf'),
            'Figtree-SemiBoldItalic': require('../../../assets/fonts/Figtree-SemiBoldItalic.ttf')
        });
        console.log("Fonts loaded successfully");
        return { success: true, error: null };
    } catch (error) {
        console.error("Error loading fonts:", error);
        return { success: false, error };
    }
};

// Font families for easy reference
export const fonts = {
    regular: 'Figtree-Regular',
    medium: 'Figtree-Medium',
    semiBold: 'Figtree-SemiBold',
    bold: 'Figtree-Bold',
    black: 'Figtree-Black',
    light: 'Figtree-Light',
    extraBold: 'Figtree-ExtraBold',

    // Italic variants
    italic: 'Figtree-Italic',
    mediumItalic: 'Figtree-MediumItalic',
    semiBoldItalic: 'Figtree-SemiBoldItalic',
    boldItalic: 'Figtree-BoldItalic',
    blackItalic: 'Figtree-BlackItalic',
    lightItalic: 'Figtree-LightItalic',
    extraBoldItalic: 'Figtree-ExtraBoldItalic'
};