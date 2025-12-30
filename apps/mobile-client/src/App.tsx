import React from 'react';
import { RootNavigator } from './navigation/RootNavigator';
import { registerRootComponent } from 'expo';
import "./global.css"; // Ensure Tailwind directives are imported if using nativewind

const App = () => {
    return <RootNavigator />;
};

export default registerRootComponent(App);
