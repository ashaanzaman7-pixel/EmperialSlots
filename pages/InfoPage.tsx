
import React from 'react';
import { ViewState } from '../types';
import { ArrowLeft, ShieldCheck, FileText, Scale, HeartHandshake, BookOpen, HelpCircle, Lock, Globe, Server, Users, Crown } from 'lucide-react';

interface InfoPageProps {
    view: ViewState;
    onNavigate: (view: ViewState) => void;
    isLoggedIn: boolean; // New prop
}

const InfoPage: React.FC<InfoPageProps> = ({ view, onNavigate, isLoggedIn }) => {
    
    const getContent = () => {
        switch (view) {
            case ViewState.PRIVACY:
                return {
                    title: "Privacy Policy",
                    icon: <ShieldCheck size={48} className="text-gold-500" />,
                    content: (
                        <div className="space-y-8 text-gray-300 leading-relaxed">
                            <p className="text-lg">At Emperial Slots, we value your trust and are committed to protecting your personal information. This Privacy Policy outlines how we handle your data.</p>
                            
                            <div className="bg-black/40 p-6 rounded-xl border border-gray-800">
                                <h3 className="text-gold-400 font-cinzel font-bold text-xl mb-3 flex items-center gap-2"><Lock size={20}/> 1. Information Collection</h3>
                                <p>We collect information you provide directly to us, such as when you create an account, make a transaction, or contact support. This includes your name, email address, phone number, and transaction history.</p>
                            </div>

                            <div className="bg-black/40 p-6 rounded-xl border border-gray-800">
                                <h3 className="text-gold-400 font-cinzel font-bold text-xl mb-3 flex items-center gap-2"><Server size={20}/> 2. Use of Information</h3>
                                <p>Your data is used to maintain your account, process transactions, improve our services, and communicate with you about updates and promotions. We do not sell your personal data to third parties.</p>
                            </div>

                            <div className="bg-black/40 p-6 rounded-xl border border-gray-800">
                                <h3 className="text-gold-400 font-cinzel font-bold text-xl mb-3 flex items-center gap-2"><Globe size={20}/> 3. Data Security</h3>
                                <p>We employ industry-standard encryption and security protocols to protect your data from unauthorized access. Your financial information is processed securely through our crypto partners.</p>
                            </div>
                        </div>
                    )
                };
            case ViewState.TERMS:
                return {
                    title: "Terms and Conditions",
                    icon: <FileText size={48} className="text-gold-500" />,
                    content: (
                        <div className="space-y-8 text-gray-300 leading-relaxed">
                             <p className="text-lg">Welcome to Emperial Slots. By accessing our platform, you agree to comply with these Terms and Conditions.</p>

                            <div className="bg-black/40 p-6 rounded-xl border border-gray-800">
                                <h3 className="text-gold-400 font-cinzel font-bold text-xl mb-3">1. Eligibility</h3>
                                <p>You must be at least 21 years old to use our services. Use of our platform is void where prohibited by law.</p>
                            </div>

                            <div className="bg-black/40 p-6 rounded-xl border border-gray-800">
                                <h3 className="text-gold-400 font-cinzel font-bold text-xl mb-3">2. Account Rules</h3>
                                <p>You are responsible for maintaining the confidentiality of your login credentials. Multiple accounts for a single user are strictly prohibited and may result in a ban.</p>
                            </div>

                            <div className="bg-black/40 p-6 rounded-xl border border-gray-800">
                                <h3 className="text-gold-400 font-cinzel font-bold text-xl mb-3">3. Deposits & Withdrawals</h3>
                                <p>All transactions are final. Withdrawals are subject to verification and our AML policy. The minimum withdrawal amount is $50.</p>
                            </div>
                        </div>
                    )
                };
            case ViewState.AML:
                return {
                    title: "AML & KYC Policy",
                    icon: <Scale size={48} className="text-gold-500" />,
                    content: (
                        <div className="space-y-8 text-gray-300 leading-relaxed">
                            <p className="text-lg">We are dedicated to preventing money laundering and financing of terrorism. Our AML (Anti-Money Laundering) and KYC (Know Your Customer) policies are strictly enforced.</p>

                            <div className="bg-black/40 p-6 rounded-xl border border-gray-800">
                                <h3 className="text-gold-400 font-cinzel font-bold text-xl mb-3">1. Verification</h3>
                                <p>We reserve the right to request proof of identity (ID, Passport) and proof of address before processing significant withdrawals.</p>
                            </div>

                            <div className="bg-black/40 p-6 rounded-xl border border-gray-800">
                                <h3 className="text-gold-400 font-cinzel font-bold text-xl mb-3">2. Monitoring</h3>
                                <p>All transactions are monitored for suspicious patterns. Any activity suspected of being related to money laundering will be reported to the relevant authorities.</p>
                            </div>
                        </div>
                    )
                };
            case ViewState.RESPONSIBLE:
                return {
                    title: "Responsible Gaming",
                    icon: <HeartHandshake size={48} className="text-gold-500" />,
                    content: (
                        <div className="space-y-8 text-gray-300 leading-relaxed">
                             <p className="text-lg">Gaming is a form of entertainment. We encourage all players to gamble responsibly and within their means.</p>

                            <div className="bg-black/40 p-6 rounded-xl border border-gray-800">
                                <h3 className="text-gold-400 font-cinzel font-bold text-xl mb-3">Control Your Play</h3>
                                <ul className="list-disc list-inside space-y-2 ml-2">
                                    <li>Set deposit limits before you start.</li>
                                    <li>Never chase losses.</li>
                                    <li>Do not play if it interferes with your daily life.</li>
                                </ul>
                            </div>

                            <div className="bg-black/40 p-6 rounded-xl border border-gray-800">
                                <h3 className="text-gold-400 font-cinzel font-bold text-xl mb-3">Need Help?</h3>
                                <p>If you feel you have a gambling problem, please contact our support team for self-exclusion options or visit <a href="#" className="text-blue-400 hover:underline">Gamblers Anonymous</a>.</p>
                            </div>
                        </div>
                    )
                };
            case ViewState.BLOG:
                return {
                    title: "Empire Blog",
                    icon: <BookOpen size={48} className="text-gold-500" />,
                    content: (
                        <div className="text-center py-12">
                            <div className="w-24 h-24 bg-black border border-gold-600/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-gold-glow">
                                <Crown className="w-12 h-12 text-gold-500 animate-pulse-slow" />
                            </div>
                            <h3 className="text-2xl font-cinzel font-bold text-white mb-4">Coming Soon</h3>
                            <p className="text-gray-400 max-w-md mx-auto">Our editorial team is working on bringing you the latest strategies, game reviews, and casino news. Stay tuned!</p>
                        </div>
                    )
                };
            case ViewState.FAQ_PAGE:
                return {
                    title: "Frequently Asked Questions",
                    icon: <HelpCircle size={48} className="text-gold-500" />,
                    content: (
                        <div className="text-center py-12">
                            <div className="bg-[#1a1a1a] border border-gold-600/30 rounded-xl p-8 max-w-lg mx-auto shadow-lg">
                                <Users className="w-12 h-12 text-gold-400 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">Need Answers?</h3>
                                <p className="text-gray-400 mb-6">Our interactive Help Center is built into our Support Widget.</p>
                                <p className="text-sm text-gold-500">Click the chat icon in the bottom right corner to search our FAQ database instantly.</p>
                            </div>
                        </div>
                    )
                };
            default:
                return { title: "", icon: null, content: null };
        }
    };

    const { title, icon, content } = getContent();

    if (!title) return null;

    const handleBack = () => {
        if (isLoggedIn) {
            onNavigate(ViewState.HOME);
        } else {
            onNavigate(ViewState.AUTH);
        }
    };

    return (
        <div className="min-h-screen bg-black font-sans pt-24 pb-20 relative overflow-hidden">
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            
            <div className="container mx-auto px-4 relative z-10 max-w-4xl">
                <button 
                    onClick={handleBack} 
                    className="mb-8 flex items-center gap-2 text-gold-400 hover:text-white transition-colors group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
                    {isLoggedIn ? "Back to Home" : "Let's Register in the Empire"}
                </button>

                <div className="bg-[#121212] border border-gold-600/30 rounded-2xl shadow-gold-glow overflow-hidden">
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] p-8 md:p-12 border-b border-gold-600/20 text-center relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent"></div>
                        <div className="mb-6 inline-block p-4 rounded-full bg-black border border-gold-500/30 shadow-lg">
                            {icon}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-white to-gold-300 drop-shadow-md">
                            {title}
                        </h1>
                    </div>

                    {/* Content Body */}
                    <div className="p-8 md:p-12 bg-[#0F0F0F]">
                        {content}
                    </div>

                    {/* Footer of the Card */}
                    <div className="bg-black p-6 text-center border-t border-gray-800">
                        <p className="text-gray-600 text-xs uppercase tracking-widest">Emperial Slots Official Policy</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InfoPage;
