import React from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SmartDiagnosis() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto flex flex-col gap-6">
      <button 
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-sm text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white w-fit transition-colors"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="glass-strong rounded-3xl p-8 border border-white/20 dark:border-white/[0.05] shadow-glass flex flex-col items-center justify-center text-center min-h-[50vh]">
        <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
          <Activity size={32} />
        </div>
        <h1 className="text-2xl font-bold mb-2 text-black/80 dark:text-white/90">Smart Diagnosis</h1>
        <p className="text-black/60 dark:text-white/60 max-w-md">
          This feature is currently under development. Soon, it will provide AI-powered insights based on your health patterns.
        </p>
      </div>
    </div>
  );
}
