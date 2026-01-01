import React from 'react';
import Link from 'next/link';
import { AppBar } from '../../components/home/AppBar';
import Footer from '../../components/home/Footer';

const blogPosts = [
    {
        slug: 'welcome-to-lokals',
        title: 'Welcome to lokals - Your Trusted Local Service Platform',
        excerpt: 'Discover how lokals is revolutionizing the way you find and book local services. From AC repair to home cleaning, we connect you with verified professionals.',
        date: '2025-01-15',
        author: 'lokals Team',
        category: 'Company News',
        image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=800'
    },
    {
        slug: 'how-to-choose-right-service-provider',
        title: 'How to Choose the Right Service Provider for Your Home',
        excerpt: 'Learn the key factors to consider when selecting a service provider. Our guide helps you make informed decisions for your home service needs.',
        date: '2025-01-10',
        author: 'Priya Sharma',
        category: 'Tips & Guides',
        image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800'
    },
    {
        slug: 'ac-maintenance-tips-summer',
        title: '10 Essential AC Maintenance Tips for Summer',
        excerpt: 'Keep your AC running efficiently this summer with these expert maintenance tips. Save money and stay cool all season long.',
        date: '2025-01-05',
        author: 'Rajesh Kumar',
        category: 'Home Maintenance',
        image: 'https://images.unsplash.com/photo-1631545806609-c2f1b1e2e8e8?q=80&w=800'
    }
];

export default function BlogPage() {
    return (
        <div className="min-h-screen bg-background">
            <AppBar />

            <div className="pt-20 pb-16">
                {/* Hero Section */}
                <div className="bg-gradient-to-b from-primary/5 to-transparent py-16">
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
                            lokals Blog
                        </h1>
                        <p className="text-lg text-muted max-w-2xl mx-auto">
                            Tips, guides, and insights to help you make the most of local services
                        </p>
                    </div>
                </div>

                {/* Blog Posts Grid */}
                <div className="max-w-6xl mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogPosts.map((post) => (
                            <Link
                                key={post.slug}
                                href={`/blog/${post.slug}`}
                                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                            >
                                {/* Post Image */}
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 bg-accent text-white text-xs font-semibold rounded-full">
                                            {post.category}
                                        </span>
                                    </div>
                                </div>

                                {/* Post Content */}
                                <div className="p-6">
                                    <div className="flex items-center gap-2 text-xs text-muted mb-3">
                                        <span>{new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        <span>•</span>
                                        <span>{post.author}</span>
                                    </div>
                                    <h2 className="text-xl font-bold text-primary mb-2 group-hover:text-accent transition-colors line-clamp-2">
                                        {post.title}
                                    </h2>
                                    <p className="text-sm text-muted line-clamp-3">
                                        {post.excerpt}
                                    </p>
                                    <div className="mt-4 flex items-center gap-2 text-accent font-semibold text-sm">
                                        Read More
                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
