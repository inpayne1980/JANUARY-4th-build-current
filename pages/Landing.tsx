
import React, { useState } from 'react';
import { RocketLaunchIcon, BoltIcon, ChartBarIcon, LinkIcon } from '@heroicons/react/24/solid';

interface LandingProps {
  onLogin: (email: string) => void;
}

const Landing: React.FC<LandingProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) onLogin(email);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-32 flex flex-col items-center text-center">
          <div className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide mb-8">
            V1.0 NOW LIVE
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            Your UGC Traffic <br />
            <span className="gradient-text">Engine</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed">
            The all-in-one platform for creators to generate AI ads, 
            track every click, and scale their ROI with zero maintenance.
          </p>

          <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-2 rounded-2xl shadow-2xl shadow-indigo-200/50 border border-slate-100 flex flex-col md:flex-row gap-2">
            <input 
              type="email" 
              required
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-6 py-4 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
            <button 
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-indigo-600/20 whitespace-nowrap"
            >
              Start Free Trial
            </button>
          </form>
          <p className="mt-6 text-slate-400 text-sm font-medium">
            No credit card required • 7-day free trial • $25/mo thereafter
          </p>
        </div>
      </div>

      {/* Value Prop Cards */}
      <div className="max-w-6xl mx-auto px-4 py-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard 
          icon={<RocketLaunchIcon className="w-8 h-8 text-indigo-500" />}
          title="4 AI Ads Included"
          description="High-converting UGC ads generated automatically for your products every month."
        />
        <FeatureCard 
          icon={<LinkIcon className="w-8 h-8 text-purple-500" />}
          title="Dynamic Link Hub"
          description="A central page for all your social bios, automatically optimized for clicks."
        />
        <FeatureCard 
          icon={<ChartBarIcon className="w-8 h-8 text-pink-500" />}
          title="ROI Tracking"
          description="See exactly where your traffic comes from and which ad converted best."
        />
      </div>

      {/* CTA Section */}
      <div className="bg-slate-900 text-white py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to turn views into sales?</h2>
          <p className="text-slate-400 text-lg mb-10">Join 2,500+ creators scaling their traffic with Vendo.</p>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-white text-slate-900 font-bold px-10 py-4 rounded-xl hover:bg-slate-100 transition-all"
          >
            Get Started Now
          </button>
        </div>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
    <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-50 transition-colors">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-4">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{description}</p>
  </div>
);

export default Landing;
