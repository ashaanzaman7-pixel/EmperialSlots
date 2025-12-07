
import React, { useState } from 'react';
import { ViewState } from '../types';
import { ArrowLeft, Bitcoin, CreditCard, DollarSign, Wallet, Building2, Smartphone } from 'lucide-react';
import { GoldButton, InputField } from '../components/UI';

interface WithdrawPageProps {
    onNavigate: (view: ViewState) => void;
}

const WithdrawPage: React.FC<WithdrawPageProps> = ({ onNavigate }) => {
    const [amount, setAmount] = useState('');
    const [selectedMethod, setSelectedMethod] = useState<string>('bitcoin');
    const [details, setDetails] = useState(''); 

    const methods = [
        { id: 'bitcoin', name: 'Bitcoin', icon: <Bitcoin size={24} className="text-orange-500" /> },
        { id: 'cashapp', name: 'Cash App', icon: <DollarSign size={24} className="text-green-500" /> },
        { id: 'chime', name: 'Chime', icon: <Building2 size={24} className="text-teal-400" /> },
        { id: 'paypal', name: 'PayPal', icon: <span className="font-bold text-blue-700 text-xl">P</span> },
    ];

    const handleWithdraw = (e: React.FormEvent) => {
        e.preventDefault();
        if(!amount || !details) { alert("Please fill all fields"); return; }
        alert(`Withdrawal request for $${amount} via ${selectedMethod} to ${details} submitted!`);
        onNavigate(ViewState.DASHBOARD);
    };

    return (
        <div className="min-h-screen bg-black font-sans pt-24 pb-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 z-0"></div>
            
            <div className="container mx-auto px-4 relative z-10 max-w-2xl">
                <button onClick={() => onNavigate(ViewState.HOME)} className="mb-8 flex items-center gap-2 text-gold-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} /> Back to Home
                </button>

                <div className="bg-[#121212] border border-gold-600/30 rounded-2xl p-8 shadow-gold-glow">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-gold-500/50">
                            <ArrowLeft size={32} className="text-gold-500 rotate-45" />
                        </div>
                        <h1 className="text-3xl font-cinzel font-bold text-white mb-2">Request Withdrawal</h1>
                        <p className="text-gray-400">Cash out your winnings securely.</p>
                    </div>
                    
                    <div className="flex gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar justify-center">
                        {methods.map(m => (
                            <button 
                                key={m.id}
                                onClick={() => setSelectedMethod(m.id)}
                                className={`flex flex-col items-center justify-center min-w-[90px] p-4 rounded-xl border transition-all ${selectedMethod === m.id ? 'bg-gold-900/20 border-gold-500 shadow-gold-glow' : 'bg-black/40 border-gray-800 hover:border-gray-600'}`}
                            >
                                <div className="mb-2">{m.icon}</div>
                                <span className={`text-xs font-bold ${selectedMethod === m.id ? 'text-gold-400' : 'text-gray-500'}`}>{m.name}</span>
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleWithdraw} className="space-y-6">
                        <div className="bg-black/40 p-6 rounded-xl border border-gray-800">
                            <label className="text-gold-400 font-bold text-sm mb-2 block">Withdraw Amount (USD)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">$</span>
                                <input 
                                    type="number" 
                                    value={amount} 
                                    onChange={(e) => setAmount(e.target.value)} 
                                    className="w-full bg-black border border-gray-700 rounded-lg py-4 pl-10 pr-4 text-2xl text-white font-bold focus:border-gold-500 outline-none"
                                    placeholder="Min $50"
                                />
                            </div>
                        </div>

                        {selectedMethod === 'bitcoin' && (
                            <InputField label="Your BTC Wallet Address" placeholder="bc1..." value={details} onChange={(e) => setDetails(e.target.value)} icon={Wallet} />
                        )}
                        
                        {selectedMethod === 'cashapp' && (
                            <InputField label="Your Cash App Tag" placeholder="$Cashtag" value={details} onChange={(e) => setDetails(e.target.value)} icon={DollarSign} />
                        )}

                        {selectedMethod === 'chime' && (
                            <InputField label="Chime Email or Phone" placeholder="name@example.com" value={details} onChange={(e) => setDetails(e.target.value)} icon={Smartphone} />
                        )}

                        {selectedMethod === 'paypal' && (
                            <InputField label="PayPal Email" placeholder="name@example.com" value={details} onChange={(e) => setDetails(e.target.value)} />
                        )}

                        <GoldButton className="w-full py-4 text-lg">Submit Request</GoldButton>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default WithdrawPage;
