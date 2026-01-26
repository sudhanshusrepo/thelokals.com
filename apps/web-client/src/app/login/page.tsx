import React, { Suspense } from 'react';
import { PhoneAuthForm } from "../../components/auth/PhoneAuthForm";

export default function LoginPage() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                    <p className="text-gray-500">Login to your account</p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-card border border-gray-100">
                    <Suspense fallback={<div>Loading...</div>}>
                        <PhoneAuthForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
