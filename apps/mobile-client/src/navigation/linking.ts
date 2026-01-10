// @ts-ignore
import * as Linking from 'expo-linking';

export const linking = {
    prefixes: [Linking.createURL('/')],
    config: {
        screens: {
            Login: 'login',
            OTP: 'otp',
            Main: {
                screens: {
                    Home: {
                        screens: {
                            HomeIndex: 'home',
                            ServiceDetail: 'service/:category',
                            ServiceSelection: 'book/selection',
                            LiveBookingHub: 'book/live',
                            PostBooking: 'book/complete',
                        }
                    },
                    Search: 'search',
                    Bookings: 'bookings',
                    Profile: 'profile',
                },
            },
        },
    },
};
