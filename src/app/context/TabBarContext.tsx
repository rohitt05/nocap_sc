import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TabBarContextType {
    isTabBarVisible: boolean;
    hideTabBar: () => void;
    showTabBar: () => void;
}

const TabBarContext = createContext<TabBarContextType>({
    isTabBarVisible: true,
    hideTabBar: () => { },
    showTabBar: () => { },
});

export const useTabBar = () => {
    const context = useContext(TabBarContext);
    if (!context) {
        throw new Error('useTabBar must be used within TabBarProvider');
    }
    return context;
};

interface TabBarProviderProps {
    children: ReactNode;
}

export const TabBarProvider: React.FC<TabBarProviderProps> = ({ children }) => {
    const [isTabBarVisible, setIsTabBarVisible] = useState(true);

    const hideTabBar = () => {
        console.log('🚫 Hiding tab bar'); // Debug log
        setIsTabBarVisible(false);
    };

    const showTabBar = () => {
        console.log('✅ Showing tab bar'); // Debug log
        setIsTabBarVisible(true);
    };

    return (
        <TabBarContext.Provider value={{
            isTabBarVisible,
            hideTabBar,
            showTabBar,
        }}>
            {children}
        </TabBarContext.Provider>
    );
};
