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
                            BookingForm: 'book',
                            Payment: 'pay/:bookingId',
                            BookingConfirmation: 'booking/success',
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
