
import React, { useState } from 'react';
import { User, Mail, Lock, Crown, Info, ShieldCheck, MapPin } from 'lucide-react';
import { GoldButton, InputField } from '../components/UI';
import { ViewState, ImageSettings } from '../types';
import { initFirebase } from '../firebaseClient';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendEmailVerification,
    sendPasswordResetEmail,
    updateProfile,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    signOut
} from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useResponsiveImage } from '../hooks/useResponsiveImage';

interface AuthPageProps {
  onLogin: (email: string, name: string) => void;
  onNavigate: (view: ViewState) => void;
  hostessConfig?: ImageSettings;
  mobileHostessConfig?: ImageSettings;
  tabletHostessConfig?: ImageSettings; // NEW
  bgConfig?: ImageSettings;
  mobileBgConfig?: ImageSettings;
  tabletBgConfig?: ImageSettings; // NEW
  authCircleImages?: string[];
  mobileAuthCircleImages?: string[];
}

const AuthPage: React.FC<AuthPageProps> = ({ 
    onLogin, onNavigate, 
    hostessConfig, mobileHostessConfig, tabletHostessConfig,
    bgConfig, mobileBgConfig, tabletBgConfig,
    authCircleImages, mobileAuthCircleImages 
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [heardFrom, setHeardFrom] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const [authError, setAuthError] = useState('');
  const [isGoldError, setIsGoldError] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Responsive Hooks
  const { getResponsiveStyle: getHostessStyle } = useResponsiveImage(hostessConfig);
  const { getResponsiveStyle: getMobileHostessStyle } = useResponsiveImage(mobileHostessConfig);
  const { getResponsiveStyle: getTabletHostessStyle } = useResponsiveImage(tabletHostessConfig);
  
  const { getResponsiveStyle: getBgStyle } = useResponsiveImage(bgConfig);
  const { getResponsiveStyle: getMobileBgStyle } = useResponsiveImage(mobileBgConfig);
  const { getResponsiveStyle: getTabletBgStyle } = useResponsiveImage(tabletBgConfig);

  const ADMIN_EMAIL = "ashaanzaman7@gmail.com";
  const DEFAULT_ADMIN_PASS = "112233";
  const STORAGE_KEY_AUTH = "emperial_admin_auth";

  const generateUniquePlayerId = async (db: any): Promise<string> => {
     let unique = false;
     let newId = "";
     let attempts = 0;

     while (!unique && attempts < 10) {
         const randomNum = Math.floor(100000 + Math.random() * 900000);
         newId = `EP-${randomNum}`;
         const q = query(collection(db, "users"), where("playerId", "==", newId));
         const querySnapshot = await getDocs(q);
         if (querySnapshot.empty) { unique = true; }
         attempts++;
     }
     return newId;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsGoldError(false);
    
    // 1. Check Admin Bypass FIRST (Before Firebase)
    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        const storedConfig = JSON.parse(localStorage.getItem(STORAGE_KEY_AUTH) || 'null');
        const currentPass = storedConfig?.password || DEFAULT_ADMIN_PASS;
        
        if (password === currentPass) {
            if (storedConfig?.pin) { setShowPinModal(true); return; } 
            else { onLogin('ashaanzaman7@gmail.com', 'The Emperor'); return; }
        } else {
             setAuthError("Invalid Admin Credentials"); return;
        }
    }

    if (!email || !password) { setAuthError("Please fill in all fields."); return; }
    if (isRegister) {
        if (password !== confirmPassword) { setAuthError("Passwords do not match."); return; }
        if (!termsAccepted) { setAuthError("You must accept the Terms & Conditions."); return; }
    }

    const fb = initFirebase();
    if (fb) {
        setIsLoading(true);
        const { auth, db } = fb;
        try {
            await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
            if (isRegister) {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                await updateProfile(user, { displayName: name });
                const playerId = await generateUniquePlayerId(db);
                await setDoc(doc(db, "users", user.uid), { 
                    name, 
                    email, 
                    playerId, 
                    balance: 0.00, 
                    createdAt: new Date().toISOString(),
                    heardFrom: heardFrom || 'Not Specified'
                });
                await sendEmailVerification(user);
                await signOut(auth);
                setShowVerificationModal(true);
                setIsRegister(false);
            } else {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                if (!userCredential.user.emailVerified) { await signOut(auth); setShowVerificationModal(true); return; }
            }
        } catch (err: any) {
            console.error("Firebase Auth Error:", err);
            if (err.code === 'auth/email-already-in-use') { setAuthError("Player already exists. Sign in?"); setIsGoldError(true); } 
            else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') { setAuthError("Invalid credentials."); } 
            else if (err.code === 'auth/weak-password') { setAuthError("Password should be at least 6 characters."); } 
            else { setAuthError(err.message || "Authentication failed."); }
        } finally { setIsLoading(false); }
        return;
    }
    onLogin(email, isRegister ? name : 'Emperor Player');
  };

  const handleForgotPassword = async () => {
      if (!email) { setAuthError("Please enter your email address first."); return; }
      const fb = initFirebase();
      if (fb) { try { await sendPasswordResetEmail(fb.auth, email); setShowForgotModal(true); } catch (err: any) { setAuthError(err.message || "Failed to send reset email."); } } 
      else { setAuthError("Backend not configured."); }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const storedConfig = JSON.parse(localStorage.getItem(STORAGE_KEY_AUTH) || 'null');
      if (storedConfig && storedConfig.pin === pinInput) { onLogin('ashaanzaman7@gmail.com', 'Administrator'); } 
      else { setPinError("Incorrect PIN"); setPinInput(''); }
  };

  const defaultCircleImages = [
    "https://iili.io/f2Q9rAB.jpg", "https://iili.io/f2Q96t1.png", "https://iili.io/f2Q9e6b.jpg",
    "https://iili.io/f2Q9g9V.jpg", "https://iili.io/f2Q94wP.jpg", "https://iili.io/f2Q9ioF.jpg"
  ];
  const imagesToUse = (authCircleImages && authCircleImages.length > 0) ? authCircleImages : defaultCircleImages;
  
  const mobileCirclesToUse = (mobileAuthCircleImages && mobileAuthCircleImages.length > 0) 
      ? mobileAuthCircleImages 
      : [...imagesToUse, ...imagesToUse].slice(0, 12); 

  const mobileCircles = mobileCirclesToUse.slice(0, 12);
  while (mobileCircles.length < 12) {
      mobileCircles.push(defaultCircleImages[mobileCircles.length % defaultCircleImages.length]);
  }

  return (
    <div className="relative z-10 min-h-screen flex items-center justify-center overflow-hidden px-4">
      <div className="absolute inset-0 z-0">
          {/* Desktop Background (lg+) */}
          <img 
            src={bgConfig?.url || "https://iili.io/f3UKPft.png"} 
            alt="Auth Background" 
            className="hidden lg:block w-full h-full object-cover"
            style={getBgStyle()}
          />
          {/* Tablet Background (md to lg) */}
          <img 
            src={tabletBgConfig?.url || "https://iili.io/f3UKPft.png"} 
            alt="Tablet Auth Background" 
            className="hidden md:block lg:hidden w-full h-full object-cover"
            style={getTabletBgStyle()}
          />
          {/* Mobile Background (< md) */}
          <img 
            src={mobileBgConfig?.url || "https://iili.io/f3UKPft.png"} 
            alt="Mobile Auth Background" 
            className="md:hidden w-full h-full object-cover"
            style={getMobileBgStyle()}
          />
      </div>

      {/* DESKTOP SIDE CIRCLES (> 1024px) */}
      <div className="hidden lg:flex flex-col gap-8 absolute left-16 top-1/2 -translate-y-1/2 z-20">
        {imagesToUse.map((imgUrl, idx) => (
          <div key={`l-${idx}`} className="w-20 h-20 rounded-full border-2 border-gold-500/50 bg-black/60 flex items-center justify-center shadow-gold-glow animate-pulse-slow hover:scale-110 transition-transform overflow-hidden">
            <img src={imgUrl} className="w-full h-full object-cover opacity-80 hover:opacity-100" />
          </div>
        ))}
      </div>
      
      <div className="hidden lg:flex flex-col gap-8 absolute right-16 top-1/2 -translate-y-1/2 z-20">
        {imagesToUse.map((imgUrl, idx) => (
          <div key={`r-${idx}`} className="w-20 h-20 rounded-full border-2 border-gold-500/50 bg-black/60 flex items-center justify-center shadow-gold-glow animate-pulse-slow hover:scale-110 transition-transform overflow-hidden" style={{ animationDelay: `${idx * 0.2}s` }}>
             <img src={imgUrl} className="w-full h-full object-cover opacity-80 hover:opacity-100" />
          </div>
        ))}
      </div>

      <div className="relative w-full max-w-md mx-auto z-30 flex flex-col items-center">
        
        {/* MOBILE VIEW (< 768px) */}
        <div className="md:hidden w-full flex flex-col items-center mb-6">
             <div className="text-center mb-6 relative z-30">
                <Crown className="mx-auto text-gold-500 w-12 h-12 mb-2 drop-shadow-lg" />
                <h1 className="text-3xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-200 to-gold-500">EMPERIAL SLOTS</h1>
                <p className="text-gold-600/80 font-cinzel text-xs tracking-widest mt-2">JOIN THE EMPIRE</p>
             </div>

             <div className="relative w-full h-[320px] flex items-center justify-center">
                 <div className="absolute inset-0 flex items-center justify-center z-10">
                     <div style={getMobileHostessStyle()} className="h-full flex items-center justify-center transition-all duration-300">
                         <img 
                            src={mobileHostessConfig?.url || "https://i.postimg.cc/d3vSD6dn/Untitled-(1).png"}
                            className="h-full object-contain animate-float drop-shadow-[0_0_15px_rgba(239,191,50,0.5)]"
                         />
                     </div>
                 </div>
                 
                 <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-2 z-20">
                    {mobileCircles.slice(0, 6).map((imgUrl, idx) => (
                        <div 
                            key={`m-l-${idx}`} 
                            className="w-10 h-10 rounded-full border border-gold-500 bg-black/60 overflow-hidden shadow-gold-glow animate-float"
                            style={{ animationDelay: `${idx * 0.3}s` }}
                        >
                            <img src={imgUrl} className="w-full h-full object-cover opacity-90" />
                        </div>
                    ))}
                 </div>

                 <div className="absolute right-0 top-0 h-full flex flex-col justify-between py-2 z-20">
                    {mobileCircles.slice(6, 12).map((imgUrl, idx) => (
                        <div 
                            key={`m-r-${idx}`} 
                            className="w-10 h-10 rounded-full border border-gold-500 bg-black/60 overflow-hidden shadow-gold-glow animate-float"
                            style={{ animationDelay: `${(idx + 2) * 0.3}s` }}
                        >
                            <img src={imgUrl} className="w-full h-full object-cover opacity-90" />
                        </div>
                    ))}
                 </div>
             </div>
        </div>

        {/* TABLET VIEW (768px - 1024px) - Separate Hostess Configuration */}
        <div className="hidden md:block lg:hidden absolute -left-40 top-1/2 -translate-y-1/2 pointer-events-none z-50">
           <img 
              src={tabletHostessConfig?.url || "https://i.postimg.cc/d3vSD6dn/Untitled-(1).png"} 
              className="h-[450px] w-auto object-contain drop-shadow-[0_0_25px_rgba(239,191,50,0.5)] animate-float"
              style={getTabletHostessStyle()}
           />
        </div>

        {/* DESKTOP HOSTESS (> 1024px) */}
        <div className="hidden lg:block absolute -left-80 -bottom-16 pointer-events-none z-50">
           <img 
              src={hostessConfig?.url || "https://i.postimg.cc/d3vSD6dn/Untitled-(1).png"} 
              className="h-[570px] w-auto object-contain drop-shadow-[0_0_25px_rgba(239,191,50,0.5)] animate-float"
              style={getHostessStyle()}
           />
        </div>

        {/* HEADER TEXT (Tablet & Desktop) */}
        <div className="hidden md:block text-center mb-8 animate-float relative z-20">
          <Crown className="mx-auto text-gold-500 w-12 h-12 md:w-16 md:h-16 mb-2 drop-shadow-lg" />
          <h1 className="text-3xl md:text-4xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-200 to-gold-500">EMPERIAL SLOTS</h1>
          <p className="text-gold-600/80 font-cinzel text-xs md:text-sm tracking-widest mt-2">JOIN THE EMPIRE</p>
        </div>

        <div className="w-full bg-deep/90 border border-gold-600 rounded-2xl p-6 md:p-8 shadow-gold-glow backdrop-blur-sm relative overflow-hidden z-30">
          <div className="flex mb-8 border-b border-gold-600/30">
            <button onClick={() => { setIsRegister(false); setAuthError(''); setIsGoldError(false); }} className={`flex-1 pb-4 text-center font-cinzel font-bold transition-colors ${!isRegister ? 'text-gold-400 border-b-2 border-gold-400' : 'text-gray-500 hover:text-gold-600'}`}>SIGN IN</button>
            <button onClick={() => { setIsRegister(true); setAuthError(''); setIsGoldError(false); }} className={`flex-1 pb-4 text-center font-cinzel font-bold transition-colors ${isRegister ? 'text-gold-400 border-b-2 border-gold-400' : 'text-gray-500 hover:text-gold-600'}`}>REGISTER</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in text-left">
            {isRegister && <InputField label="Full Name" icon={User} placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} />}
            <InputField label="Email" icon={Mail} type="text" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <InputField label="Password" icon={Lock} type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            
            {isRegister && (
                <>
                    <InputField label="Confirm Password" icon={Lock} type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    
                    {/* Updated to Dropdown */}
                    <div className="flex flex-col gap-2 w-full">
                        <label className="text-gold-400 text-sm font-cinzel">Where did you hear about us?</label>
                        <div className="relative group">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-600 w-5 h-5 group-focus-within:text-gold-400 transition-colors" />
                            <select 
                                value={heardFrom} 
                                onChange={(e) => setHeardFrom(e.target.value)}
                                className="w-full bg-black/60 border border-gold-600/50 rounded-lg py-3 pl-10 pr-4 text-white appearance-none focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400 transition-all cursor-pointer placeholder-gray-500"
                            >
                                <option value="" disabled>Select an option</option>
                                <option value="Facebook">Facebook</option>
                                <option value="Instagram">Instagram</option>
                                <option value="TikTok">TikTok</option>
                                <option value="Google">Google Search</option>
                                <option value="Friend">Friend / Referral</option>
                                <option value="Other">Other</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="w-4 h-4 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {authError && (
                <div className={`bg-black/40 border p-3 rounded text-center animate-fade-in ${isGoldError ? 'border-gold-500/50 bg-gold-900/10' : 'border-red-500/50 bg-red-900/20'}`}>
                    <p className={`text-xs font-bold ${isGoldError ? 'text-gold-500' : 'text-red-400'}`}>{authError}</p>
                </div>
            )}

            {isRegister && (
                <div className="space-y-3">
                     <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" required className="accent-gold-500 w-5 h-5 flex-shrink-0" />
                        <span className="text-xs md:text-sm text-gray-400 group-hover:text-gold-400 transition-colors">I confirm I am 21+ years old</span>
                     </label>
                     <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="accent-gold-500 w-5 h-5 flex-shrink-0" />
                        <span className="text-gray-400 text-xs md:text-sm group-hover:text-gold-400 transition-colors">
                            I accept the <span onClick={(e) => {e.preventDefault(); onNavigate(ViewState.TERMS);}} className="text-gold-400 hover:underline cursor-pointer hover:text-gold-300 z-50 relative">Terms & Conditions</span> | <span onClick={(e) => {e.preventDefault(); onNavigate(ViewState.PRIVACY);}} className="text-gold-400 hover:underline cursor-pointer hover:text-gold-300 z-50 relative">Privacy Policy</span>
                        </span>
                     </label>
                     
                     <div className="bg-black/40 p-3 rounded border border-gray-800 text-[10px] text-gray-500 leading-relaxed mt-2">
                        By clicking "Finish Registration!", you agree to SugarSweeps Terms of Use and Privacy Policy. You consent to receive Emails and SMS messages from SugarSweeps to provide updates on your orders and/or for marketing purposes. Message frequency depends on your activity. You may opt-out by texting "STOP". Message and data rates may apply.
                     </div>
                </div>
            )}

            {!isRegister && (
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="accent-gold-500 w-5 h-5" />
                        <span className="text-sm text-gray-400 group-hover:text-gold-400 transition-colors">Remember me</span>
                    </label>
                    <button type="button" className="text-sm text-gold-600 hover:text-gold-400 transition-colors font-cinzel" onClick={handleForgotPassword}>Forgot Password?</button>
                </div>
            )}

            <GoldButton type="submit" className="w-full uppercase tracking-wider" disabled={isLoading}>
                {isLoading ? 'Processing...' : (isRegister ? 'Finish Registration!' : 'Enter Empire')}
            </GoldButton>
          </form>
        </div>
      </div>

      {showPinModal && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center px-4 animate-fade-in">
            <div className="w-full max-w-sm bg-[#121212] border-2 border-gold-500 rounded-2xl p-8 shadow-[0_0_50px_rgba(239,191,50,0.4)] text-center relative overflow-hidden">
                <ShieldCheck className="w-16 h-16 text-gold-500 mx-auto mb-4 animate-pulse relative z-10" />
                <h2 className="text-3xl font-cinzel font-bold text-gold-400 mb-1 relative z-10 drop-shadow-md">Welcome Emperor</h2>
                <form onSubmit={handlePinSubmit} className="space-y-4 relative z-10 mt-6">
                    <input type="password" maxLength={6} className="w-full bg-black border border-gold-600 rounded-lg py-4 text-center text-2xl tracking-[0.5em] text-gold-400 outline-none" placeholder="••••" autoFocus value={pinInput} onChange={(e) => setPinInput(e.target.value)} />
                    {pinError && <p className="text-red-500 text-sm font-bold">{pinError}</p>}
                    <div className="flex gap-3 mt-6">
                        <button type="button" onClick={() => {setShowPinModal(false); setPinInput('');}} className="flex-1 py-3 bg-gray-800 text-gray-400 rounded-xl hover:bg-gray-700">Cancel</button>
                        <GoldButton type="submit" className="flex-1 py-3 text-sm">Unlock</GoldButton>
                    </div>
                </form>
            </div>
        </div>
      )}

      {showForgotModal && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center px-4 animate-fade-in">
            <div className="w-full max-w-sm bg-[#121212] border border-gold-600 rounded-2xl p-8 shadow-gold-glow text-center relative overflow-hidden">
                <Crown className="w-12 h-12 text-gold-500 mx-auto mb-4 drop-shadow-md relative z-10" />
                <h3 className="text-2xl font-cinzel font-bold text-gold-400 mb-4 relative z-10">EMPERIAL SLOTS</h3>
                <div className="bg-black/60 p-4 rounded-xl border border-gold-600/30 mb-6 relative z-10">
                    <p className="text-white text-lg leading-relaxed">Please check <span className="text-gold-500 font-bold underline decoration-gold-500/50 underline-offset-4">{email}</span> to reset your password.</p>
                </div>
                <GoldButton onClick={() => setShowForgotModal(false)} className="w-full relative z-10">I Understand</GoldButton>
            </div>
        </div>
      )}

      {showVerificationModal && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center px-4 animate-fade-in">
            <div className="w-full max-w-sm bg-[#121212] border-2 border-gold-600 rounded-2xl p-8 shadow-gold-glow-lg text-center relative overflow-hidden">
                <div className="w-16 h-16 bg-gold-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-gold-500 relative z-10"><Mail className="w-8 h-8 text-gold-500 animate-pulse" /></div>
                <h3 className="text-2xl font-cinzel font-bold text-white mb-2 relative z-10">Verify Your Email</h3>
                <h4 className="text-gold-500 font-cinzel font-bold text-sm tracking-widest mb-6 relative z-10">ACTION REQUIRED</h4>
                <div className="bg-black/80 p-5 rounded-xl border border-gray-800 mb-6 relative z-10 shadow-inner">
                    <p className="text-gray-300 text-sm leading-relaxed">We have sent you the email verification to:</p>
                    <p className="text-gold-400 font-bold text-lg my-2 break-all">{email}</p>
                    <p className="text-gray-400 text-xs italic mt-2">verify it and log in, pls check the spam if you wont found our emial in inbox.</p>
                </div>
                <GoldButton onClick={() => setShowVerificationModal(false)} className="w-full relative z-10">Okay, I'll Check</GoldButton>
            </div>
        </div>
      )}

      <button onClick={() => onNavigate(ViewState.ABOUT)} className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 group flex items-center bg-black/80 border-2 border-gold-500 rounded-full p-2 md:p-4 shadow-gold-glow hover:shadow-gold-glow-lg hover:bg-gold-900/20 transition-all duration-500">
        <Info className="text-gold-400 w-6 h-6 md:w-8 md:h-8" />
      </button>
    </div>
  );
};

export default AuthPage;
