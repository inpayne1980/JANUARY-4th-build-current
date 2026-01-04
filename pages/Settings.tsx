
import React from 'react';
import { 
  ShieldCheckIcon, 
  TrashIcon, 
  ArrowPathIcon, 
  ShieldExclamationIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { User } from '../types';

interface SettingsProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser }) => {
  const togglePrivacy = () => {
    const updatedUser: User = {
      ...user,
      privacySettings: {
        autoDeleteAfter24Months: !user.privacySettings?.autoDeleteAfter24Months
      }
    };
    onUpdateUser(updatedUser);
  };

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <header className="mb-12">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-slate-500 font-medium">Manage your subscription and privacy preferences.</p>
      </header>

      <div className="space-y-10">
        {/* Privacy Section */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-slate-50 p-8 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                <ShieldCheckIcon className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Your Data, Your Rules</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Privacy Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
               <CheckCircleIcon className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-widest">GDPR Ready</span>
            </div>
          </div>

          <div className="p-10 space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="max-w-md">
                <h3 className="text-lg font-black text-slate-900 mb-2">24-Month Auto-Delete</h3>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                  When enabled, Vendo will permanently purge all smart_assets, scripts, and granular click metadata from our servers exactly 24 months after creation.
                </p>
              </div>
              <button 
                onClick={togglePrivacy}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${user.privacySettings?.autoDeleteAfter24Months ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${user.privacySettings?.autoDeleteAfter24Months ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-50">
              <DataBox 
                icon={<DocumentTextIcon className="w-5 h-5" />}
                title="AI Scripts"
                status={user.privacySettings?.autoDeleteAfter24Months ? 'Expiring in 2y' : 'Stored indefinitely'}
              />
              <DataBox 
                icon={<ClockIcon className="w-5 h-5" />}
                title="Click Metadata"
                status={user.privacySettings?.autoDeleteAfter24Months ? 'Auto-purged' : 'Permanent log'}
              />
              <DataBox 
                icon={<TrashIcon className="w-5 h-5" />}
                title="Video Assets"
                status="Direct to Cloud"
              />
            </div>

            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 flex gap-4">
              <ShieldExclamationIcon className="w-6 h-6 text-amber-600 shrink-0" />
              <p className="text-xs font-bold text-amber-800 leading-relaxed">
                Note: This only affects data stored on Vendo servers. Assets already delivered to your Google Drive or Dropbox are under your direct control and will not be touched.
              </p>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200 p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-lg font-black text-slate-900 mb-1">Delete Account</h3>
            <p className="text-sm font-medium text-slate-500">Permanently remove all data and active subscription.</p>
          </div>
          <button className="px-8 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all border border-rose-100">
            Terminate Forever
          </button>
        </section>
      </div>
    </div>
  );
};

const DataBox: React.FC<{ icon: React.ReactNode, title: string, status: string }> = ({ icon, title, status }) => (
  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
    <div className="text-slate-400 mb-3">{icon}</div>
    <h4 className="font-black text-slate-900 text-sm mb-1">{title}</h4>
    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{status}</p>
  </div>
);

export default Settings;
