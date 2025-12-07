
import React, { useState, useEffect } from 'react';
import { User, ViewState, ImageSettings } from '../types';
import { User as UserIcon, Mail, Clock, Gamepad2, Edit2, Camera, Copy, Check, X, UploadCloud, AlertTriangle, BadgeCheck, Phone, Globe, Image as ImageIcon } from 'lucide-react';
import { GoldButton, InputField } from '../components/UI';
import { initFirebase } from '../firebaseClient';
import { doc, updateDoc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { useResponsiveImage } from '../hooks/useResponsiveImage';

interface ProfilePageProps {
  user: User;
  onNavigate: (view: ViewState) => void;
  bgConfig?: ImageSettings;
  peekingImgConfig?: ImageSettings;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onNavigate, bgConfig, peekingImgConfig }) => {
  
  const [copiedUid, setCopiedUid] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageLinkInput, setImageLinkInput] = useState('');
  const [showCardBgModal, setShowCardBgModal] = useState(false);
  const [cardBgInput, setCardBgInput] = useState('');
  const [showEditDetailsModal, setShowEditDetailsModal] = useState(false);
  const [newName, setNewName] = useState(user.name);
  const [newPhone, setNewPhone] = useState(user.phone || '');
  const [newCountry, setNewCountry] = useState(user.country || '');
  const [marketingPrefs, setMarketingPrefs] = useState({ email: false, sms: false });

  // Responsive Hooks
  const { getResponsiveStyle: getBgStyle } = useResponsiveImage(bgConfig);
  const { getResponsiveStyle: getPeekingStyle } = useResponsiveImage(peekingImgConfig);

  const isVerified = Boolean(user.name && user.email && user.phone && user.country && user.photoURL);

  useEffect(() => {
      const fb = initFirebase();
      if (fb && user.id) {
          const checkPrefs = async () => {
              const emailSnap = await getDoc(doc(fb.db, "marketing_email", user.id));
              const smsSnap = await getDoc(doc(fb.db, "marketing_sms", user.id));
              setMarketingPrefs({ email: emailSnap.exists(), sms: smsSnap.exists() });
          };
          checkPrefs();
      }
  }, [user.id]);

  const handleCopyUid = () => { if (user.id) { navigator.clipboard.writeText(user.id); setCopiedUid(true); setTimeout(() => setCopiedUid(false), 2000); } };
  const handleSaveImage = async () => { if (!imageLinkInput.trim()) return; const fb = initFirebase(); if (fb && user.id) { try { await updateDoc(doc(fb.db, "users", user.id), { photoURL: imageLinkInput }); setShowImageModal(false); setImageLinkInput(''); } catch (e) { console.error("Error updating profile image", e); } } };
  const handleSaveCardBg = async () => { if (!cardBgInput.trim()) return; const fb = initFirebase(); if (fb && user.id) { try { await updateDoc(doc(fb.db, "users", user.id), { profileCardBg: cardBgInput }); setShowCardBgModal(false); setCardBgInput(''); } catch (e) { console.error("Error updating card background", e); } } };
  const handleSaveDetails = async () => { const fb = initFirebase(); if (fb && user.id) { try { await updateDoc(doc(fb.db, "users", user.id), { name: newName, phone: newPhone, country: newCountry }); setShowEditDetailsModal(false); } catch (e) { console.error("Error updating details", e); } } };
  const handleMarketingChange = async (type: 'email' | 'sms', checked: boolean) => { setMarketingPrefs(prev => ({ ...prev, [type]: checked })); const fb = initFirebase(); if (fb && user.id) { const collectionName = type === 'email' ? 'marketing_email' : 'marketing_sms'; const docRef = doc(fb.db, collectionName, user.id); if (checked) { await setDoc(docRef, { email: user.email, timestamp: new Date().toISOString() }); } else { await deleteDoc(docRef); } } };

  const defaultCardBg = "https://ulvmrnawiacptzonkouh.supabase.co/storage/v1/object/sign/pic/Adobe%20Express%20-%20file%20(1).png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wNzBkNjg3MC0zYmQ4LTQ5ZDEtYTQ1ZC02NDFhNTM5ZTI4YjQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwaWMvQWRvYmUgRXhwcmVzcyAtIGZpbGUgKDEpLnBuZyIsImlhdCI6MTc2NDM4MTkxNCwiZXhwIjoxNzk1OTE3OTE0fQ.cfaTrEs2qJ1a1LT4hJ5ZuczMdlNdQf1W58Aen9JqwGs";
  const activeCardBg = user.profileCardBg || defaultCardBg;
  const memberSinceDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'Unknown';

  return (
    <div className="min-h-screen bg-black font-sans relative overflow-hidden">
      <div className="absolute inset-0 z-0">
         <img 
            src={bgConfig?.url || "https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?q=80&w=2068&auto=format&fit=crop"} 
            alt="Profile Background" 
            className="w-full h-full object-cover"
            style={getBgStyle()}
         />
         <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-24 pb-40">
         <h1 className="text-3xl md:text-5xl font-cinzel font-bold text-gold-100 mb-8 md:mb-12 text-center drop-shadow-lg">Player Profile</h1>
         <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
             <div className="xl:col-span-1 relative">
                 <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 flex items-center justify-center">
                     {peekingImgConfig && peekingImgConfig.url && (
                         <img 
                            src={peekingImgConfig.url} 
                            className="w-full h-full object-contain opacity-80"
                            style={getPeekingStyle()}
                         />
                     )}
                 </div>
                 <div className="bg-[#121212] border border-gold-600/30 rounded-2xl p-6 md:p-8 text-center relative overflow-hidden shadow-gold-glow z-10 group/card">
                     <button onClick={() => setShowCardBgModal(true)} className="absolute top-2 right-2 z-20 bg-black/50 hover:bg-black p-2 rounded-full border border-gray-600 hover:border-gold-500 transition-all opacity-0 group-hover/card:opacity-100" title="Edit Card Background">
                         <Edit2 size={14} className="text-white" />
                     </button>
                     <div className="absolute inset-0 z-0 opacity-50"><img src={activeCardBg} alt="Card BG" className="w-full h-full object-cover" /></div>
                     <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black/90 z-0"></div>
                     <div className="relative z-10">
                        <div className="relative inline-block mb-6 group cursor-pointer" onClick={() => setShowImageModal(true)}>
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-gold-500 p-1 mx-auto overflow-hidden bg-black relative">
                                {user.photoURL ? (<img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />) : (<div className="w-full h-full rounded-full bg-neutral-800 flex items-center justify-center text-gold-500"><UserIcon size={48} className="md:w-16 md:h-16" /></div>)}
                                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Edit2 className="text-white w-8 h-8" /></div>
                            </div>
                            {isVerified && (<div className="absolute bottom-0 right-0 bg-black rounded-full p-1 border border-black"><BadgeCheck className="w-8 h-8 text-blue-500 fill-blue-500/20" /></div>)}
                        </div>
                        <div className="flex items-center justify-center gap-2 mb-1"><h2 className="text-xl md:text-2xl font-cinzel font-bold text-white">{user.name}</h2></div>
                        <p className="text-gold-500 font-bold tracking-widest text-xs md:text-sm mb-6">{user.playerId}</p>
                        <div className="space-y-4 text-left bg-black/40 p-4 rounded-xl border border-gray-800 backdrop-blur-sm">
                            <div className="flex items-center gap-3 text-gray-300"><Mail size={16} className="text-gold-600 flex-shrink-0" /><span className="text-xs md:text-sm truncate">{user.email}</span></div>
                            <div className="flex items-center gap-3 text-gray-300"><Clock size={16} className="text-gold-600 flex-shrink-0" /><span className={`text-xs md:text-sm ${isVerified ? 'text-blue-400 font-bold' : ''}`}>{isVerified ? 'Trusted Member Since' : 'Member Since'}: {memberSinceDate}</span></div>
                        </div>
                        <div className="mt-8">
                            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Current Balance</p>
                            <div className="text-2xl md:text-3xl font-bold text-gold-400 mb-6">${user.balance.toLocaleString()}</div>
                            <GoldButton className="w-full py-3 text-sm flex items-center justify-center gap-2" onClick={() => onNavigate(ViewState.GAME_PANEL)}><Gamepad2 size={18} /> Game Panel</GoldButton>
                        </div>
                     </div>
                 </div>
             </div>
             <div className="md:col-span-2 space-y-8">
                 <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6 md:p-8">
                     <div className="flex items-center justify-between mb-6"><h3 className="text-lg md:text-xl font-cinzel font-bold text-gold-200">Account Details</h3><button onClick={() => { setNewName(user.name); setNewPhone(user.phone || ''); setNewCountry(user.country || ''); setShowEditDetailsModal(true); }} className="text-gold-500 hover:text-white flex items-center gap-2 text-xs md:text-sm transition-colors"><Edit2 size={14} /> Edit Details</button></div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2"><label className="text-xs text-gray-500 uppercase font-bold flex items-center gap-2"><UserIcon size={12} /> Display Name</label><div className="bg-black/50 border border-gray-800 rounded-lg p-3 text-gray-300 text-sm">{user.name}</div></div>
                         <div className="space-y-2"><label className="text-xs text-gray-500 uppercase font-bold flex items-center gap-2"><Mail size={12} /> Email Address</label><div className="bg-black/50 border border-gray-800 rounded-lg p-3 text-gray-300 opacity-60 cursor-not-allowed text-sm">{user.email}</div></div>
                         <div className="space-y-2"><label className="text-xs text-gray-500 uppercase font-bold flex items-center gap-2"><Phone size={12} /> Phone Number</label><div className="bg-black/50 border border-gray-800 rounded-lg p-3 text-gray-300 text-sm">{user.phone || 'Not Set'}</div></div>
                         <div className="space-y-2"><label className="text-xs text-gray-500 uppercase font-bold flex items-center gap-2"><Globe size={12} /> Country</label><div className="bg-black/50 border border-gray-800 rounded-lg p-3 text-gray-300 text-sm">{user.country || 'Not Set'}</div></div>
                     </div>
                     <div className="mt-8 pt-6 border-t border-gray-800">
                         <h4 className="text-gold-500 text-sm font-bold mb-4">Stay Updated</h4>
                         <div className="flex flex-col sm:flex-row gap-6">
                             <label className="flex items-center gap-3 cursor-pointer group bg-black/30 p-4 rounded-xl border border-gray-800 hover:border-gold-500/30 transition-all flex-1"><input type="checkbox" checked={marketingPrefs.email} onChange={(e) => handleMarketingChange('email', e.target.checked)} className="w-5 h-5 accent-gold-500" /><div><span className="text-white font-bold text-sm block">Email Updates</span><span className="text-xs text-gray-500">Receive news and promotions via email</span></div></label>
                             <label className="flex items-center gap-3 cursor-pointer group bg-black/30 p-4 rounded-xl border border-gray-800 hover:border-gold-500/30 transition-all flex-1"><input type="checkbox" checked={marketingPrefs.sms} onChange={(e) => handleMarketingChange('sms', e.target.checked)} className="w-5 h-5 accent-gold-500" /><div><span className="text-white font-bold text-sm block">SMS Notifications</span><span className="text-xs text-gray-500">Get important alerts on your phone</span></div></label>
                         </div>
                     </div>
                 </div>
             </div>
         </div>
         <div className="max-w-md mx-auto text-center animate-fade-in pb-12">
             <p className="text-gray-500 text-xs uppercase tracking-widest font-bold mb-2">System User ID</p>
             <div onClick={handleCopyUid} className="group relative bg-[#0A0A0A] border border-gray-800 hover:border-gold-500/50 rounded-lg py-3 px-6 cursor-pointer transition-all duration-300 hover:bg-gold-900/10 active:scale-95">
                 <div className="flex items-center justify-center gap-3"><code className="text-gray-300 font-mono text-xs md:text-sm group-hover:text-gold-400 transition-colors break-all">{user.id}</code>{copiedUid ? (<Check size={16} className="text-green-500 animate-bounce flex-shrink-0" />) : (<Copy size={16} className="text-gray-600 group-hover:text-gold-500 transition-colors flex-shrink-0" />)}</div>
                 <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gold-500 text-black text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Click to Copy</div>
             </div>
         </div>
         {showImageModal && (<div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"><div className="bg-[#121212] border border-gold-600/50 rounded-2xl p-8 w-full max-w-md shadow-gold-glow"><div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-white flex items-center gap-2"><Camera className="text-gold-500" /> Update Profile Image</h3><button onClick={() => setShowImageModal(false)}><X className="text-gray-500 hover:text-white" /></button></div><div className="space-y-4"><div className="bg-black/50 p-4 rounded-lg border border-gray-800 text-sm text-gray-300 space-y-2"><p className="font-bold text-gold-400">How to get a direct image link:</p><ol className="list-decimal list-inside space-y-1 text-xs text-gray-400"><li>Go to <a href="https://freeimage.host" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">freeimage.host</a></li><li>Upload your picture there</li><li>Copy the provided <strong>Direct Link</strong> (ends in .png or .jpg)</li><li>Paste it below and click Save</li></ol></div><InputField label="Image Direct Link" placeholder="https://..." value={imageLinkInput} onChange={(e) => setImageLinkInput(e.target.value)} icon={UploadCloud} /></div><div className="mt-8 flex justify-end gap-3"><button onClick={() => setShowImageModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button><GoldButton onClick={handleSaveImage} className="px-6 py-2 text-sm">Save Image</GoldButton></div></div></div>)}
         {showCardBgModal && (<div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"><div className="bg-[#121212] border border-gold-600/50 rounded-2xl p-8 w-full max-w-md shadow-gold-glow"><div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-white flex items-center gap-2"><ImageIcon className="text-gold-500" /> Card Background</h3><button onClick={() => setShowCardBgModal(false)}><X className="text-gray-500 hover:text-white" /></button></div><div className="space-y-4"><p className="text-gray-400 text-sm">Customize the look of your profile card by providing a direct image link.</p><InputField label="Card Background URL" placeholder="https://..." value={cardBgInput} onChange={(e) => setCardBgInput(e.target.value)} icon={UploadCloud} /></div><div className="mt-8 flex justify-end gap-3"><button onClick={() => setShowCardBgModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button><GoldButton onClick={handleSaveCardBg} className="px-6 py-2 text-sm">Update Card</GoldButton></div></div></div>)}
         {showEditDetailsModal && (<div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"><div className="bg-[#121212] border border-gold-600/50 rounded-2xl p-8 w-full max-w-md shadow-gold-glow"><div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-white">Edit Details</h3><button onClick={() => setShowEditDetailsModal(false)}><X className="text-gray-500 hover:text-white" /></button></div><div className="space-y-4"><InputField label="Display Name" value={newName} onChange={(e) => setNewName(e.target.value)} icon={UserIcon} /><InputField label="Phone Number" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="+1 (555) 000-0000" icon={Phone} /><div className="flex flex-col gap-2 w-full"><label className="text-gold-400 text-sm font-cinzel flex items-center gap-2"><Globe size={14} /> Country</label><select value={newCountry} onChange={(e) => setNewCountry(e.target.value)} className="w-full bg-black/60 border border-gold-600/50 rounded-lg py-3 px-4 text-white focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400 transition-all appearance-none cursor-pointer"><option value="" disabled>Select a country</option><option value="USA">United States</option><option value="Canada">Canada</option><option value="UK">United Kingdom</option><option value="Australia">Australia</option><option value="Germany">Germany</option><option value="France">France</option><option value="Mexico">Mexico</option><option value="Other">Other</option></select></div></div><div className="mt-8 flex justify-end gap-3"><button onClick={() => setShowEditDetailsModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button><GoldButton onClick={handleSaveDetails} className="px-6 py-2 text-sm">Save Changes</GoldButton></div></div></div>)}
      </div>
    </div>
  );
};

export default ProfilePage;
