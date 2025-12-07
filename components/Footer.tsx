
import React from 'react';
import { Facebook, Youtube, Crown, Instagram } from 'lucide-react';
import { ViewState, ImageSettings, SocialLinks } from '../types';

interface FooterProps {
    onNavigate: (view: ViewState) => void;
    bgConfig?: ImageSettings;
    rightCharConfig?: ImageSettings;
    socialLinks?: SocialLinks;
}

const Footer: React.FC<FooterProps> = ({ onNavigate, bgConfig, rightCharConfig, socialLinks }) => {
    return (
        <footer className="bg-black border-t border-gold-600/20 pt-12 pb-8 relative z-40 font-sans overflow-hidden">
            
            {/* Casino Token Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <img 
                    src={bgConfig?.url || "https://www.transparenttextures.com/patterns/poker-chip.png"} 
                    alt="Casino Background" 
                    className="w-full h-full object-cover"
                    style={{
                        transform: `translate(${bgConfig?.positionX || 0}px, ${bgConfig?.positionY || 0}px) scale(${bgConfig?.scale || 1})`
                    }}
                />
            </div>

            {/* Right Character Image (Hidden on small screens) */}
            <div className="hidden xl:block absolute right-0 bottom-0 z-0 pointer-events-none">
                {rightCharConfig && rightCharConfig.url && (
                    <img 
                        src={rightCharConfig.url} 
                        className="h-[300px] w-auto object-contain opacity-90 drop-shadow-lg"
                        style={{
                            transform: `translate(${rightCharConfig.positionX}px, ${rightCharConfig.positionY}px) scale(${rightCharConfig.scale})`
                        }}
                    />
                )}
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col items-center text-center">
                    
                    {/* Brand */}
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <Crown className="text-gold-500 w-8 h-8" />
                        <h2 className="text-2xl font-cinzel font-bold text-gold-200">EMPERIAL SLOTS</h2>
                    </div>
                    
                    {/* Socials & Payment Grid for Mobile responsiveness */}
                    <div className="flex flex-col md:flex-row items-center gap-8 mb-10 w-full justify-center">
                        
                        {/* Social Links */}
                        <div className="flex gap-6">
                            <a href={socialLinks?.facebook || "#"} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-[#121212] border border-gold-600/30 flex items-center justify-center text-gold-500 hover:text-white hover:border-gold-400 hover:scale-110 transition-all duration-300 shadow-gold-glow">
                                <Facebook size={24} strokeWidth={1.5} />
                            </a>
                            <a href={socialLinks?.instagram || "#"} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-[#121212] border border-gold-600/30 flex items-center justify-center text-gold-500 hover:text-white hover:border-gold-400 hover:scale-110 transition-all duration-300 shadow-gold-glow">
                                <Instagram size={24} strokeWidth={1.5} />
                            </a>
                            <a href={socialLinks?.youtube || "#"} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-[#121212] border border-gold-600/30 flex items-center justify-center text-gold-500 hover:text-white hover:border-gold-400 hover:scale-110 transition-all duration-300 shadow-gold-glow">
                                <Youtube size={24} strokeWidth={1.5} />
                            </a>
                        </div>

                        {/* Divider for Desktop */}
                        <div className="hidden md:block w-px h-12 bg-gold-600/20 mx-4"></div>

                        {/* Payment Methods */}
                        <div className="flex gap-3 items-center bg-black/40 px-4 py-3 rounded-xl border border-gold-600/10 backdrop-blur-sm grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500 flex-wrap justify-center">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="GPay" className="h-5 w-auto" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/3/31/Apple_logo_white.svg" alt="Apple" className="h-5 w-auto" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 w-auto" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4 w-auto brightness-0 invert" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4 w-auto brightness-0 invert" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/4/46/Bitcoin.svg" alt="Bitcoin" className="h-5 w-auto" />
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex flex-wrap justify-center gap-y-3 gap-x-6 text-xs md:text-sm font-cinzel text-gray-400 mb-8 max-w-4xl">
                        <button onClick={() => onNavigate(ViewState.BLOG)} className="hover:text-gold-400 transition-colors uppercase tracking-wider">Blog</button>
                        <span className="text-gold-600/30 hidden md:inline">|</span>
                        <button onClick={() => onNavigate(ViewState.FAQ_PAGE)} className="hover:text-gold-400 transition-colors uppercase tracking-wider">FAQ</button>
                        <span className="text-gold-600/30 hidden md:inline">|</span>
                        <button onClick={() => onNavigate(ViewState.PRIVACY)} className="hover:text-gold-400 transition-colors uppercase tracking-wider">Privacy Policy</button>
                        <span className="text-gold-600/30 hidden md:inline">|</span>
                        <button onClick={() => onNavigate(ViewState.TERMS)} className="hover:text-gold-400 transition-colors uppercase tracking-wider">Terms and Conditions</button>
                        <span className="text-gold-600/30 hidden md:inline">|</span>
                        <button onClick={() => onNavigate(ViewState.AML)} className="hover:text-gold-400 transition-colors uppercase tracking-wider">AML and KYC Policy</button>
                        <span className="text-gold-600/30 hidden md:inline">|</span>
                        <button onClick={() => onNavigate(ViewState.RESPONSIBLE)} className="hover:text-gold-400 transition-colors uppercase tracking-wider">Responsible Gaming</button>
                    </div>

                    {/* Copyright */}
                    <div className="text-gray-600 text-[10px] md:text-xs tracking-widest border-t border-gray-800/50 pt-6 w-full">
                        &copy; 2025 All rights reserved by Emperial Slots
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
