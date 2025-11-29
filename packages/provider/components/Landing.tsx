import React from 'react';

interface LandingProps {
  onStart: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-50 pt-16 pb-32">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
            Grow your business with <span className="text-teal-600">TheLokals Pro</span>
          </h1>
          <p className="max-w-2xl text-xl text-slate-500 mb-10">
            Join thousands of skilled professionals finding new customers and managing their business effortlessly.
          </p>
          <button
            onClick={onStart}
            className="px-8 py-4 bg-teal-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-teal-700 hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            Become a Partner
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Why Partner with Us?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureCard
              icon="💰"
              title="Zero Commission"
              description="Keep 100% of what you earn. We charge a small subscription fee, not a cut of your hard work."
            />
            <FeatureCard
              icon="⚡"
              title="Instant Jobs"
              description="Get live booking requests from customers nearby. Accept the ones that fit your schedule."
            />
            <FeatureCard
              icon="📈"
              title="Business Tools"
              description="Manage bookings, track earnings, and build your online reputation all in one app."
            />
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard number="1" title="Register" description="Sign up and verify your details in minutes." />
            <StepCard number="2" title="Go Online" description="Toggle your status to 'Online' to start receiving requests." />
            <StepCard number="3" title="Earn" description="Complete jobs and get paid directly by the customer." />
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: string, title: string, description: string }> = ({ icon, title, description }) => (
  <div className="text-center p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="w-16 h-16 mx-auto bg-teal-50 rounded-full flex items-center justify-center text-3xl mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-500">{description}</p>
  </div>
);

const StepCard: React.FC<{ number: string, title: string, description: string }> = ({ number, title, description }) => (
  <div className="relative p-8 bg-white rounded-2xl shadow-sm border border-slate-100">
    <div className="absolute -top-6 left-8 w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center text-xl font-bold shadow-lg">
      {number}
    </div>
    <h3 className="mt-4 text-xl font-bold text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-500">{description}</p>
  </div>
);