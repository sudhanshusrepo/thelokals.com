import React from 'react';
import { View, Text, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';

interface ScreenHeaderProps {
    title: string;
    showBack?: boolean;
    rightAction?: React.ReactNode;
    onBack?: () => void;
    className?: string;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
    title,
    showBack = true,
    rightAction,
    onBack,
    className
}) => {
    const navigation = useNavigation();
    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigation.goBack();
        }
    };

    const paddingTop = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;

    return (
        <View className={`bg-white border-b border-gray-100 ${className}`} style={{ paddingTop }}>
            <View className="px-4 py-3 flex-row items-center justify-between h-14">
                <View className="flex-row items-center gap-3 flex-1">
                    {showBack && (
                        <TouchableOpacity
                            onPress={handleBack}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <ChevronLeft size={24} color="#1F2937" />
                        </TouchableOpacity>
                    )}
                    <Text className="text-xl font-bold text-gray-900 truncate" numberOfLines={1}>
                        {title}
                    </Text>
                </View>
                {rightAction && <View>{rightAction}</View>}
            </View>
        </View>
    );
};
