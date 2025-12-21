import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { AppBar } from '../../../components/home/AppBar';
import { Footer } from '../../../components/home/Footer';

const blogPosts: Record<string, any> = {
    'welcome-to-lokals': {
        title: 'Welcome to lokals - Your Trusted Local Service Platform',
        date: '2025-01-15',
        author: 'lokals Team',
        category: 'Company News',
        image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1200',
        content: `
# Welcome to lokals

We're excited to introduce **lokals** - your one-stop platform for finding and booking trusted local service providers.

## Our Mission

At lokals, we believe everyone deserves access to reliable, verified professionals for their home service needs. Whether it's AC repair, plumbing, electrical work, or home cleaning, we're here to connect you with the best local providers.

## What Makes Us Different

### 1. Verified Professionals
All our service providers undergo thorough background checks and verification processes. Your safety and satisfaction are our top priorities.

### 2. Transparent Pricing
No hidden charges, no surprises. See upfront pricing before you book, and pay only after the service is completed to your satisfaction.

### 3. AI-Powered Matching
Our smart matching algorithm connects you with the most suitable providers based on your specific needs, location, and preferences.

### 4. 24/7 Support
Our customer support team is always available to help you with any questions or concerns.

## Getting Started

1. **Search** for the service you need
2. **Select** from verified providers
3. **Book** at your convenience
4. **Enjoy** professional service at your doorstep

Join thousands of satisfied customers who trust lokals for their home service needs.

---

*Have questions? [Contact us](/contact) anytime!*
        `
    },
    'how-to-choose-right-service-provider': {
        title: 'How to Choose the Right Service Provider for Your Home',
        date: '2025-01-10',
        author: 'Priya Sharma',
        category: 'Tips & Guides',
        image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200',
        content: `
# How to Choose the Right Service Provider

Finding the right service provider can be challenging. Here's our comprehensive guide to help you make the best choice.

## Key Factors to Consider

### 1. Verification & Reviews
Always check if the provider is verified and read customer reviews. Look for:
- Background verification status
- Customer ratings (4+ stars recommended)
- Recent reviews and feedback
- Response time to queries

### 2. Experience & Expertise
- Years in business
- Specialization in your specific need
- Certifications and training
- Portfolio of past work

### 3. Pricing Transparency
- Clear breakdown of costs
- No hidden charges
- Comparison with market rates
- Payment terms and conditions

### 4. Availability & Response Time
- Same-day service availability
- Emergency service options
- Flexible scheduling
- Quick response to inquiries

### 5. Insurance & Guarantees
- Service warranty
- Insurance coverage
- Damage protection
- Satisfaction guarantee

## Red Flags to Watch Out For

⚠️ **Avoid providers who:**
- Demand full payment upfront
- Have no verifiable reviews
- Provide vague estimates
- Lack proper identification
- Pressure you to decide immediately

## The lokals Advantage

When you book through lokals, we handle the verification for you. Every provider on our platform is:
- Background checked ✓
- Skill verified ✓
- Customer rated ✓
- Insured ✓

---

*Ready to book? [Browse services](/)*
        `
    },
    'ac-maintenance-tips-summer': {
        title: '10 Essential AC Maintenance Tips for Summer',
        date: '2025-01-05',
        author: 'Rajesh Kumar',
        category: 'Home Maintenance',
        image: 'https://images.unsplash.com/photo-1631545806609-c2f1b1e2e8e8?q=80&w=1200',
        content: `
# 10 Essential AC Maintenance Tips for Summer

Keep your AC running efficiently and save on electricity bills with these expert tips.

## 1. Clean or Replace Filters Monthly
Dirty filters reduce airflow and efficiency. Clean washable filters or replace disposable ones every 30 days during peak usage.

## 2. Check Thermostat Settings
Set your thermostat to 24-26°C for optimal comfort and energy efficiency. Every degree lower increases electricity consumption by 6%.

## 3. Clear Outdoor Unit
Remove debris, leaves, and vegetation around the outdoor unit. Maintain at least 2 feet of clearance for proper airflow.

## 4. Clean Condenser Coils
Dirty coils reduce cooling capacity. Have them professionally cleaned at the start of summer.

## 5. Inspect Drain Lines
Clogged drain lines can cause water leakage. Pour a cup of vinegar through the drain line monthly to prevent algae buildup.

## 6. Check Refrigerant Levels
Low refrigerant indicates a leak. If your AC isn't cooling properly, call a professional to check refrigerant levels.

## 7. Seal Air Leaks
Check windows and doors for air leaks. Proper sealing can reduce cooling costs by up to 20%.

## 8. Use Ceiling Fans
Ceiling fans help circulate cool air, allowing you to set the thermostat higher while maintaining comfort.

## 9. Schedule Professional Service
Get your AC professionally serviced before summer. Annual maintenance prevents breakdowns and extends unit life.

## 10. Monitor Energy Bills
Sudden spikes in electricity bills indicate AC problems. Address issues early to avoid costly repairs.

## When to Call a Professional

Contact a technician if you notice:
- Unusual noises or odors
- Poor cooling performance
- Water leakage
- Frequent cycling on/off
- High electricity bills

---

*Need AC service? [Book now](/service/ac-repair)*
        `
    }
};

export default function BlogPostPage({ params }: { params: { slug: string } }) {
    const post = blogPosts[params.slug];

    if (!post) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background">
            <AppBar />

            <article className="pt-20 pb-16">
                {/* Hero Image */}
                <div className="relative h-96 bg-gradient-to-b from-primary/10 to-transparent">
                    <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>

                {/* Article Content */}
                <div className="max-w-4xl mx-auto px-4 -mt-32 relative z-10">
                    <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
                        {/* Meta */}
                        <div className="mb-6">
                            <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-sm font-semibold rounded-full mb-4">
                                {post.category}
                            </span>
                            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                                {post.title}
                            </h1>
                            <div className="flex items-center gap-4 text-sm text-muted">
                                <span>{new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                <span>•</span>
                                <span>By {post.author}</span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="prose prose-lg max-w-none">
                            {post.content.split('\n').map((paragraph: string, index: number) => {
                                if (paragraph.startsWith('# ')) {
                                    return <h1 key={index} className="text-3xl font-bold text-primary mt-8 mb-4">{paragraph.slice(2)}</h1>;
                                } else if (paragraph.startsWith('## ')) {
                                    return <h2 key={index} className="text-2xl font-bold text-primary mt-6 mb-3">{paragraph.slice(3)}</h2>;
                                } else if (paragraph.startsWith('### ')) {
                                    return <h3 key={index} className="text-xl font-semibold text-primary mt-4 mb-2">{paragraph.slice(4)}</h3>;
                                } else if (paragraph.startsWith('⚠️ **')) {
                                    return <div key={index} className="bg-amber-50 border-l-4 border-amber-500 p-4 my-4"><p className="text-amber-900">{paragraph}</p></div>;
                                } else if (paragraph.startsWith('- ')) {
                                    return <li key={index} className="ml-6 text-muted">{paragraph.slice(2)}</li>;
                                } else if (paragraph.startsWith('*') && paragraph.endsWith('*')) {
                                    return <p key={index} className="text-sm text-muted italic text-center my-6">{paragraph.slice(1, -1)}</p>;
                                } else if (paragraph.startsWith('---')) {
                                    return <hr key={index} className="my-8 border-slate-200" />;
                                } else if (paragraph.trim()) {
                                    return <p key={index} className="text-muted leading-relaxed mb-4">{paragraph}</p>;
                                }
                                return null;
                            })}
                        </div>

                        {/* Back to Blog */}
                        <div className="mt-12 pt-8 border-t border-slate-200">
                            <Link
                                href="/blog"
                                className="inline-flex items-center gap-2 text-accent font-semibold hover:gap-3 transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back to Blog
                            </Link>
                        </div>
                    </div>
                </div>
            </article>

            <Footer />
        </div>
    );
}
