
import React from 'react';
import { View, Text } from 'react-native';

const PlaceholderScreen = ({ title }: { title: string }) => (
    <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-xl font-bold">{title}</Text>
    </View>
);



