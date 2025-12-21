'use client';

import React from 'react';

interface ServiceCategory {
    id: string;
    name: string;
    examples: string;
    image: string;
    gradient: string;
}

const services: ServiceCategory[] = [
    {
        id: 'ac',
        name: 'AC & Appliances',
        examples: 'AC repair • RO service • Fridge repair',
        image: 'https://images.unsplash.com/photo-1621905476059-5f3460b56b3b?q=80&w=600',
        gradient: 'from-blue-500/80 to-cyan-500/80'
    },
    {
        id: 'rides',
        name: 'Rides (Bike & Cab)',
        examples: 'Bike taxi • Car rental • Airport transfer',
        image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=600',
        gradient: 'from-orange-500/80 to-red-500/80'
    },
    {
        id: 'cleaning',
        name: 'Home Cleaning',
        examples: 'Deep cleaning • Regular cleaning • Sofa cleaning',
        image: 'https://images.unsplash.com/photo-1581578731117-10452b7a7028?q=80&w=600',
        gradient: 'from-green-500/80 to-emerald-500/80'
    },
    {
        id: 'electrician',
        name: 'Electrician',
        examples: 'Wiring • Switch repair • Fan installation',
        image: 'https://images.unsplash.com/photo-1621905476059-5f3460b56b3b?q=80&w=600',
        gradient: 'from-yellow-500/80 to-amber-500/80'
    },
    {
        id: 'rentals',
        name: 'Rentals',
        examples: 'Bikes • Cars • Equipment',
        image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=600',
        gradient: 'from-purple-500/80 to-pink-500/80'
    },
    {
        id: 'plumbing',
        name: 'Plumbing',
        examples: 'Leak repair • Pipe fitting • Bathroom fixtures',
        image: 'https://images.unsplash.com/photo-1505798577917-a651a5d40318?q=80&w=600',
        gradient: 'from-blue-600/80 to-indigo-600/80'
    },
    {
        id: 'salon',
        name: 'Salon & Grooming',
        examples: 'Haircut • Facial • Massage',
        image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600',
        gradient: 'from-pink-500/80 to-rose-500/80'
    },
    {
        id: 'painting',
        name: 'Painting & Renovation',
        examples: 'Wall painting • Waterproofing • Renovation',
        image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=600',
        gradient: 'from-teal-500/80 to-cyan-500/80'
    },
    {
        id: 'other',
        name: 'Misc / Other Help',
        examples: 'Yoga • Tutoring • Pet care',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600',
        gradient: 'from-slate-500/80 to-gray-500/80'
    }
];

interface BrowseServicesProps {
    onSelectService?: (serviceId: string) => void;
}

export const BrowseServices: React.FC<BrowseServicesProps> = ({ onSelectService }) => {
    return (
        <section className="py-12 md:py-16 bg-background">
            <div className="max-w-7xl mx-auto px-4">
                {/* Heading */}
                <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                        Browse Services
                    </h2>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {services.map((service) => (
                        <button
                            key={service.id}
                            onClick={() => onSelectService?.(service.id)}
                            className="group relative h-40 md:h-48 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                            {/* Background Image */}
                            <img
                                src={service.image}
                                alt={service.name}
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />

                            {/* Gradient Overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} group-hover:opacity-90 transition-opacity`}></div>

                            {/* Content */}
                            <div className="relative h-full flex flex-col justify-end p-4 text-white">
                                <h3 className="font-bold text-base md:text-lg mb-1 leading-tight">
                                    {service.name}
                                </h3>
                                <p className="text-xs text-white/90 leading-snug">
                                    {service.examples}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
};
