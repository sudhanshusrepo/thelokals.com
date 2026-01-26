import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, Briefcase, User, DollarSign } from 'lucide-react-native';
import { JobsNavigator } from './JobsNavigator';
import { DashboardScreen } from '../features/dashboard/DashboardScreen';
import { ProfileScreen } from '../features/profile/ProfileScreen';
import { EarningsScreen } from '../features/earnings/EarningsScreen';

const Tab = createBottomTabNavigator();

export const ProviderNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#2563EB',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: {
                    borderTopWidth: 1,
                    borderTopColor: '#E5E7EB',
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarShowLabel: true,
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                }
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />
                }}
            />
            <Tab.Screen
                name="Jobs"
                component={JobsNavigator}
                options={{
                    tabBarLabel: 'My Jobs',
                    tabBarIcon: ({ color, size }) => <Briefcase size={size} color={color} />
                }}
            />
            <Tab.Screen
                name="Earnings"
                component={EarningsScreen}
                options={{
                    tabBarLabel: 'Earnings',
                    tabBarIcon: ({ color, size }) => <DollarSign size={size} color={color} />
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color, size }) => <User size={size} color={color} />
                }}
            />
        </Tab.Navigator>
    );
};
