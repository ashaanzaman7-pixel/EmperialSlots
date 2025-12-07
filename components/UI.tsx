import React from 'react';
import { LucideIcon } from 'lucide-react';

export const GoldButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'solid' | 'outline' }> = ({ 
  children, 
  className = '', 
  variant = 'solid',
  ...props 
}) => {
  const baseStyles = "font-cinzel font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2";
  
  const variants = {
    solid: "bg-gradient-to-r from-gold-500 to-gold-400 text-black shadow-gold-glow hover:shadow-gold-glow-lg animate-shine",
    outline: "border border-gold-500 text-gold-400 hover:bg-gold-500/10 hover:text-gold-300"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string, icon?: LucideIcon }> = ({ label, icon: Icon, className = '', ...props }) => (
  <div className="flex flex-col gap-2 w-full">
    {label && <label className="text-gold-400 text-sm font-cinzel">{label}</label>}
    <div className="relative group">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-600 w-5 h-5 group-focus-within:text-gold-400 transition-colors" />}
      <input 
        className={`w-full bg-black/60 border border-gold-600/50 rounded-lg py-3 ${Icon ? 'pl-10' : 'pl-4'} pr-4 text-white placeholder-gray-500 focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400 transition-all ${className}`}
        {...props}
      />
    </div>
  </div>
);

export const FeatureTile: React.FC<{ title: string; description: string; icon: React.ReactNode }> = ({ title, description, icon }) => (
  <div className="group relative p-6 border border-gold-600/30 rounded-2xl bg-black/40 hover:bg-black/60 transition-all duration-300 hover:border-gold-500 hover:-translate-y-2 hover:shadow-gold-glow">
    <div className="text-gold-400 mb-4 transform group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-cinzel font-bold text-white mb-2 group-hover:text-gold-400 transition-colors">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
  </div>
);

export const GameThumbnail: React.FC<{ title: string; image: string; isHot?: boolean }> = ({ title, image, isHot }) => (
  <div className="relative group cursor-pointer overflow-hidden rounded-xl border border-gold-600/20 hover:border-gold-500 transition-all duration-300">
    <div className="aspect-[3/4] w-full bg-gray-900 relative">
      <img src={image} alt={title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
    </div>
    
    {isHot && (
      <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded animate-pulse shadow-lg">
        HOT
      </div>
    )}

    <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform">
      <h4 className="text-gold-100 font-cinzel font-bold text-lg drop-shadow-md">{title}</h4>
      <div className="h-0.5 w-0 group-hover:w-full bg-gold-500 transition-all duration-500 mt-1" />
    </div>
  </div>
);
