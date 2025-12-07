
import React, { useState, useEffect } from 'react';
import { User, ViewState, CashFlowConfig } from '../types';
import { ArrowLeft, Bitcoin, Copy, CheckCircle, Wallet, CreditCard, Loader2, DollarSign } from 'lucide-react';
import { GoldButton, InputField } from '../components/UI';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Placeholder for your deployed Cloud Run service URL
const BACKEND_URL = "https://your-cloud-run-service-url.run.app";

interface DepositPageProps {
    user: User;
    onNavigate: (view: ViewState) => void;
    cashFlowConfig?: CashFlowConfig;
}

// Inner Component for Stripe Form to use hooks
const StripeCheckoutForm = ({ amount, onSuccess }: { amount: number, onSuccess: () => void }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsProcessing(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.href, // In a real SPA, handle redirect or use redirect: "if_required"
            },
            redirect: "if_required"
        });

        if (error) {
            setMessage(error.message || "An unexpected error occurred.");
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            setMessage("Payment Successful!");
            onSuccess();
        } else {
            setMessage("Payment processing. check your balance shortly.");
        }

        setIsProcessing(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
            <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
            {message && <div className="text-red-400 text-sm font-bold text-center bg-red-900/20 p-2 rounded">{message}</div>}
            <GoldButton disabled={isProcessing || !stripe || !elements} className="w-full">
                {isProcessing ? "Processing..." : `Pay $${amount}`}
            </GoldButton>
        </form>
    );
};

const DepositPage: React.FC<DepositPageProps> = ({ user, onNavigate, cashFlowConfig }) => {
    const [amount, setAmount] = useState('');
    const [copied, setCopied] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<string>('bitcoin');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Stripe State
    const [clientSecret, setClientSecret] = useState('');
    const [stripePromise, setStripePromise] = useState<any>(null);

    // Mock BTC Rate
    const btcRate = 0.000015; 
    const btcValue = amount ? (parseInt(amount) * btcRate).toFixed(6) : "0.000000";
    const walletAddress = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";

    // Initialize Stripe Promise if Key exists
    useEffect(() => {
        if (cashFlowConfig?.stripe?.apiKey) {
            setStripePromise(loadStripe(cashFlowConfig.stripe.apiKey));
        }
    }, [cashFlowConfig]);

    const handleCopy = () => {
        navigator.clipboard.writeText(walletAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCoinbaseCheckout = async () => {
        if (!amount || parseInt(amount) <= 0) { setError("Please enter a valid amount."); return; }
        setLoading(true); setError('');

        try {
            if (BACKEND_URL.includes("your-cloud-run")) console.warn("Backend URL not configured.");
            const response = await fetch(`${BACKEND_URL}/create-payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: amount, userId: user.id }),
            });
            const data = await response.json();
            if (data.checkoutUrl) window.location.href = data.checkoutUrl;
            else throw new Error(data.error || "Failed to create payment link.");
        } catch (err: any) {
            setError("Failed to initialize payment.");
        } finally {
            setLoading(false);
        }
    };

    const initStripePayment = async () => {
        if (!amount || parseInt(amount) <= 0) { setError("Enter amount first."); return; }
        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/create-stripe-payment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: parseInt(amount), userId: user.id }),
            });
            const data = await res.json();
            setClientSecret(data.clientSecret);
        } catch (err) {
            setError("Could not initiate Stripe payment.");
        } finally {
            setLoading(false);
        }
    };

    // Reset Stripe state when method changes
    useEffect(() => {
        if (selectedMethod !== 'stripe') {
            setClientSecret('');
        } else if (amount && !clientSecret) {
            // Auto init if amount present
            initStripePayment();
        }
    }, [selectedMethod]);

    const methods = [
        { id: 'bitcoin', name: 'Bitcoin', icon: <Bitcoin size={24} className="text-orange-500" /> },
        { id: 'coinbase', name: 'Coinbase', icon: <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs text-white font-bold">C</div> }, 
        { id: 'stripe', name: 'Card / Apple Pay', icon: <CreditCard size={24} className="text-blue-400" /> },
        { id: 'cashapp', name: 'Cash App', icon: <DollarSign size={24} className="text-green-500" /> },
    ];

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
                            <Wallet className="text-gold-500 w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-cinzel font-bold text-white mb-2">Deposit Funds</h1>
                        <p className="text-gray-400">Securely add credits to your account.</p>
                    </div>
                    
                    <div className="bg-black/40 p-6 rounded-xl border border-gray-800 mb-6">
                        <label className="text-gold-400 font-bold text-sm mb-2 block">Amount (USD)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">$</span>
                            <input 
                                type="number" 
                                value={amount} 
                                onChange={(e) => { setAmount(e.target.value); setClientSecret(''); }} 
                                className="w-full bg-black border border-gray-700 rounded-lg py-4 pl-10 pr-4 text-2xl text-white font-bold focus:border-gold-500 outline-none"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar justify-center">
                        {methods.map(m => (
                            <button 
                                key={m.id}
                                onClick={() => { setSelectedMethod(m.id); setError(''); }}
                                className={`flex flex-col items-center justify-center min-w-[90px] p-3 rounded-xl border transition-all ${selectedMethod === m.id ? 'bg-gold-900/20 border-gold-500 shadow-gold-glow' : 'bg-black/40 border-gray-800 hover:border-gray-600'}`}
                            >
                                <div className="mb-1">{m.icon}</div>
                                <span className={`text-xs font-bold ${selectedMethod === m.id ? 'text-gold-400' : 'text-gray-500'}`}>{m.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="space-y-6">
                        
                        {/* BITCOIN MANUAL */}
                        {selectedMethod === 'bitcoin' && (
                            <>
                                <div className="bg-black/40 p-6 rounded-xl border border-gray-800 flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-xs font-bold uppercase mb-1">Equivalent in BTC</p>
                                        <p className="text-xl font-mono text-gold-400">{btcValue} BTC</p>
                                    </div>
                                    <Bitcoin className="text-orange-500 w-8 h-8" />
                                </div>
                                <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gold-600/20 text-center space-y-4">
                                    <p className="text-white font-bold">Send Bitcoin to this address:</p>
                                    <div onClick={handleCopy} className="bg-black border border-dashed border-gray-600 rounded-lg p-3 flex items-center justify-between gap-4 cursor-pointer hover:border-gold-500 group transition-colors">
                                        <code className="text-gray-300 text-xs md:text-sm break-all font-mono">{walletAddress}</code>
                                        {copied ? <CheckCircle size={18} className="text-green-500 flex-shrink-0" /> : <Copy size={18} className="text-gray-500 group-hover:text-gold-500 flex-shrink-0" />}
                                    </div>
                                    <GoldButton className="w-full py-4 text-lg" onClick={() => alert("Please contact support with hash.")}>I Have Sent Payment</GoldButton>
                                </div>
                            </>
                        )}
                        
                        {/* COINBASE COMMERCE */}
                        {selectedMethod === 'coinbase' && (
                            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gold-600/20 text-center space-y-4">
                                <p className="text-white font-bold">Pay with Crypto via Coinbase</p>
                                <p className="text-xs text-gray-400">Supports BTC, ETH, LTC, and more. Instant automated credit.</p>
                                <GoldButton className="w-full py-4 text-lg flex items-center justify-center gap-2" onClick={handleCoinbaseCheckout} disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin" /> : 'Proceed to Coinbase'}
                                </GoldButton>
                            </div>
                        )}

                        {/* STRIPE */}
                        {selectedMethod === 'stripe' && (
                            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gold-600/20">
                                {!clientSecret ? (
                                    <div className="text-center py-4">
                                        <p className="text-gray-400 mb-4">Enter an amount above to load payment options.</p>
                                        <GoldButton onClick={initStripePayment} disabled={loading || !amount} className="w-full">
                                            {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Load Card Options'}
                                        </GoldButton>
                                    </div>
                                ) : (
                                    stripePromise && (
                                        <Elements stripe={stripePromise} options={{ 
                                            clientSecret, 
                                            appearance: { 
                                                theme: 'night', 
                                                variables: { colorPrimary: '#efbf32', colorBackground: '#000000', colorText: '#ffffff' } 
                                            } 
                                        }}>
                                            <StripeCheckoutForm amount={parseInt(amount)} onSuccess={() => alert("Success! Check balance.")} />
                                        </Elements>
                                    )
                                )}
                            </div>
                        )}

                        {/* CASH APP */}
                        {selectedMethod === 'cashapp' && (
                            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gold-600/20 text-center space-y-4">
                                <DollarSign className="w-12 h-12 text-green-500 mx-auto" />
                                <h3 className="text-white font-bold text-lg">Pay with Cash App</h3>
                                <div className="bg-black border border-green-500/30 p-4 rounded-lg">
                                    <p className="text-gray-400 text-xs uppercase mb-1">Send Payment To</p>
                                    <p className="text-green-400 font-bold text-xl">{cashFlowConfig?.cashapp?.cashtag || "$EmperialSlots"}</p>
                                </div>
                                <p className="text-xs text-gray-400">Include your Player ID: <span className="text-white font-bold">{user.playerId}</span> in the note.</p>
                                <GoldButton className="w-full" onClick={() => alert("Confirming... (Simulated)")}>I Sent It</GoldButton>
                            </div>
                        )}

                        {error && <p className="text-red-500 text-sm text-center font-bold">{error}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DepositPage;
