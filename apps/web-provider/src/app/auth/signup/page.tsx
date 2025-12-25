'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@thelocals/core/services/supabase';
import { toast } from 'react-hot-toast';

export default function ProviderSignUpPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        serviceCategory: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            // 1. Create Auth User
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        name: formData.fullName,
                        role: 'provider', // Mark as provider in metadata
                        category: formData.serviceCategory
                    },
                },
            });

            if (authError) throw authError;

            // 2. (Optional) Create entry in 'providers' table would typically happen here or via trigger
            // For now, we rely on the Auth signup

            toast.success('Application submitted! Please verify your email.');
            router.push('/auth/signin');
        } catch (error: any) {
            toast.error(error.message || 'Failed to sign up');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-xl w-full space-y-8 animate-fade-in-up">
                <div className="text-center">
                    <Link href="/" className="inline-block">
                        <img className="mx-auto h-16 w-auto rounded-xl shadow-lg" src="/logo.jpg" alt="lokals provider" />
                    </Link>
                    <h2 className="mt-6 text-3xl font-extrabold text-[#0A2540]">
                        Join as a Service Partner
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Start growing your business with lokals
                    </p>
                </div>

                <div className="mt-8 bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-gray-100">
                    <form className="space-y-6" onSubmit={handleSignUp}>
                        {/* Name */}
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                                Full Name / Business Name
                            </label>
                            <div className="mt-1">
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    required
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0A2540] focus:border-[#0A2540] sm:text-sm transition-all"
                                />
                            </div>
                        </div>

                        {/* Email & Phone Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email address
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0A2540] focus:border-[#0A2540] sm:text-sm transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                    Phone Number
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0A2540] focus:border-[#0A2540] sm:text-sm transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Service Category */}
                        <div>
                            <label htmlFor="serviceCategory" className="block text-sm font-medium text-gray-700">
                                Primary Service Category
                            </label>
                            <div className="mt-1">
                                <select
                                    id="serviceCategory"
                                    name="serviceCategory"
                                    required
                                    value={formData.serviceCategory}
                                    onChange={handleChange}
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-[#0A2540] focus:border-[#0A2540] sm:text-sm bg-white"
                                >
                                    <option value="">Select a category</option>
                                    <option value="ac_repair">AC Repair</option>
                                    <option value="cleaning">Home Cleaning</option>
                                    <option value="electrician">Electrician</option>
                                    <option value="plumbing">Plumbing</option>
                                    <option value="car_rental">Car Rental</option>
                                    <option value="bike_rental">Bike Rental</option>
                                    <option value="yoga">Yoga Instructor</option>
                                </select>
                            </div>
                        </div>

                        {/* Passwords */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0A2540] focus:border-[#0A2540] sm:text-sm transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                    Confirm Password
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0A2540] focus:border-[#0A2540] sm:text-sm transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-[#12B3A6] hover:bg-[#0e9085] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#12B3A6] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
                            >
                                {loading ? (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : null}
                                {loading ? 'Submitting Application...' : 'Create Partner Account'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already a partner?{' '}
                            <Link href="/auth/signin" className="font-medium text-[#0A2540] hover:text-blue-900 transition-colors">
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
