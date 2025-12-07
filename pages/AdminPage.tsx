
import React, { useState, useEffect } from 'react';
import { GoldButton, InputField } from '../components/UI';
import { 
    Shield, Database, LogOut, Lock, Check, 
    LayoutDashboard, ChevronLeft, ChevronRight, Eye, 
    UploadCloud, ChevronDown, Flame, Info, Image as ImageIcon, Gamepad2, Edit, Trash2, Plus, Video, AlertTriangle, ArrowUpRight, X, Webhook, HelpCircle, MessageCircle, Send, Bot, FileText, File, Activity, Smartphone, Layers, Share2, MonitorPlay, Crown, User as UserIcon, Search, Wallet, CreditCard, DollarSign, Apple, Smartphone as PhoneIcon, Tablet
} from 'lucide-react';
import { ViewState, SiteConfig, ImageSettings, Game, PlatformStatus, GamePanelSoftware, FAQ, TelegramSettings, Tutorial, UploadedDocument, IntroGame, User, AdminRole, CashFlowProvider } from '../types';
import { initFirebase } from '../firebaseClient';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, where, updateDoc } from 'firebase/firestore';

interface AdminPageProps {
  user?: User;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
  onPreview: (config: SiteConfig) => void;
}

// Helper to check permissions
const hasAccess = (user: User | undefined, permission: string): boolean => {
    if (!user) return false;
    if (user.role === 'Emperor' || user.role === 'King') return true; // Full access
    return user.adminPermissions?.includes(permission) || false;
};

const MenuItem: React.FC<{ icon: React.ReactNode; label: string; isOpen: boolean; active: boolean; onClick: () => void; hidden?: boolean }> = ({ icon, label, isOpen, active, onClick, hidden }) => {
  if (hidden) return null;
  return (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group relative ${
        active 
            ? 'bg-gradient-to-r from-gold-600 to-gold-500 text-black shadow-gold-glow font-bold' 
            : 'text-gray-400 hover:bg-white/5 hover:text-white'
        }`}
    >
        <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
        </div>
        
        {isOpen ? (
        <span className="whitespace-nowrap overflow-hidden transition-all duration-300 origin-left">
            {label}
        </span>
        ) : (
        <div className="absolute left-full ml-4 bg-gray-900 text-gold-400 text-xs px-2 py-1 rounded border border-gold-600/30 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
            {label}
        </div>
        )}
        
        {active && isOpen && <div className="ml-auto w-1.5 h-1.5 bg-black rounded-full animate-pulse" />}
    </button>
  );
};

const BackendCard: React.FC<{ 
    title: string; 
    icon: React.ReactNode; 
    description: string; 
    isEnabled: boolean; 
    onToggle: () => void; 
    children: React.ReactNode; 
    guideContent?: React.ReactNode 
}> = ({ title, icon, description, isEnabled, onToggle, children, guideContent }) => {
    const [showGuide, setShowGuide] = useState(false);

    return (
        <div className={`bg-[#121212] border transition-all duration-300 rounded-2xl overflow-hidden ${isEnabled ? 'border-gold-600/50 shadow-gold-glow' : 'border-gray-800'}`}>
            <div className="p-6 border-b border-gray-800 flex justify-between items-start">
                <div className="flex gap-4">
                    <div className={`p-3 rounded-xl ${isEnabled ? 'bg-gold-500/10 text-gold-500' : 'bg-gray-800 text-gray-500'}`}>
                        {icon}
                    </div>
                    <div>
                        <h3 className={`text-xl font-bold font-cinzel ${isEnabled ? 'text-white' : 'text-gray-500'}`}>{title}</h3>
                        <p className="text-sm text-gray-400 mt-1 max-w-sm">{description}</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={isEnabled} onChange={onToggle} />
                        <div className="w-14 h-8 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gold-500"></div>
                    </label>
                    {guideContent && (
                        <button onClick={() => setShowGuide(!showGuide)} className="text-xs text-gold-500 hover:underline flex items-center gap-1">
                            <Info size={12} /> {showGuide ? 'Hide Guide' : 'Setup Guide'}
                        </button>
                    )}
                </div>
            </div>
            
            {showGuide && guideContent && (
                <div className="bg-blue-900/10 border-b border-blue-900/30 p-4 animate-fade-in">
                    {guideContent}
                </div>
            )}

            <div className={`p-6 space-y-4 transition-all duration-300 ${!isEnabled ? 'opacity-50 pointer-events-none filter blur-[1px]' : ''}`}>
                {children}
            </div>
        </div>
    );
};

const ImageControlPanel: React.FC<{ 
    label: string; 
    settings: ImageSettings; 
    onChange: (key: keyof ImageSettings, value: any) => void; 
}> = ({ label, settings, onChange }) => {
    
    return (
        <div className="bg-[#151515] border border-gray-800 rounded-xl p-6 space-y-6 animate-fade-in h-full flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-800 pb-4 gap-4">
                <h3 className="text-lg font-bold text-white font-cinzel">{label}</h3>
            </div>
            
            <div className="space-y-4 flex-1">
                <InputField 
                    label="Image URL"
                    value={settings.url || ''} 
                    onChange={(e) => onChange('url', e.target.value)} 
                    placeholder="https://..." 
                    icon={UploadCloud}
                />
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs text-gray-400 font-bold uppercase">Position X (px)</label>
                        <input 
                            type="number" 
                            value={settings.positionX || 0} 
                            onChange={(e) => onChange('positionX', Number(e.target.value))}
                            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-gold-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-gray-400 font-bold uppercase">Position Y (px)</label>
                        <input 
                            type="number" 
                            value={settings.positionY || 0} 
                            onChange={(e) => onChange('positionY', Number(e.target.value))}
                            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-gold-500"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs text-gray-400 font-bold uppercase">Scale (0.1x - 10x)</label>
                    <input 
                        type="number" 
                        min="0.1" 
                        max="10" 
                        step="0.1" 
                        value={settings.scale || 1} 
                        onChange={(e) => onChange('scale', Number(e.target.value))}
                        className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-gold-500"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between">
                        <label className="text-xs text-gray-400 font-bold uppercase">Opacity ({Math.round((settings?.opacity ?? 1) * 100)}%)</label>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.05" 
                        value={settings?.opacity ?? 1} 
                        onChange={(e) => onChange('opacity', Number(e.target.value))}
                        className="w-full accent-blue-500 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            </div>
            
            <div className="mt-auto pt-4 border-t border-gray-800">
                <div className="text-xs text-gray-500 italic text-center">
                    Changes apply immediately.
                </div>
            </div>
        </div>
    );
};

const AdminPage: React.FC<AdminPageProps> = ({ user, onNavigate, onLogout, onPreview }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Logic to determine initial tab based on permissions
  const getInitialTab = () => {
      if (hasAccess(user, 'backends')) return 'backends';
      if (hasAccess(user, 'games')) return 'featured_games';
      if (hasAccess(user, 'images')) return 'images';
      return 'featured_games'; // Safe fallback
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab());
  const [isGamesMenuOpen, setIsGamesMenuOpen] = useState(true);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  
  // Security State
  const [isPinEnabled, setIsPinEnabled] = useState(false);
  const [pin, setPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Personal Admin Pin (for sub-admins)
  const [personalPin, setPersonalPin] = useState('');

  // Nobility State
  const [nobilitySearch, setNobilitySearch] = useState('');
  const [searchedUser, setSearchedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<AdminRole>('Peasant');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [targetAdminPin, setTargetAdminPin] = useState('');

  // Firebase Config State
  const [firebaseConfig, setFirebaseConfig] = useState({
      enabled: false,
      apiKey: '',
      authDomain: '',
      projectId: ''
  });

  // Modal State
  const [isFAQModalOpen, setIsFAQModalOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<Partial<FAQ> | null>(null);
  
  const [isTutorialModalOpen, setIsTutorialModalOpen] = useState(false);
  const [editingTutorial, setEditingTutorial] = useState<Partial<Tutorial> | null>(null);
  
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Partial<Game> | null>(null);
  
  const [isIntroGameModalOpen, setIsIntroGameModalOpen] = useState(false);
  const [editingIntroGame, setEditingIntroGame] = useState<Partial<IntroGame> | null>(null);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<Partial<PlatformStatus> | null>(null);
  
  const [isSoftwareModalOpen, setIsSoftwareModalOpen] = useState(false);
  const [editingSoftware, setEditingSoftware] = useState<Partial<GamePanelSoftware> | null>(null);

  const DEFAULT_CONFIG: SiteConfig = {
      authHostess: { url: "https://i.postimg.cc/d3vSD6dn/Untitled-(1).png", positionX: 0, positionY: 0, scale: 1, opacity: 1 },
      mobileAuthHostess: { url: "https://i.postimg.cc/d3vSD6dn/Untitled-(1).png", positionX: 0, positionY: 0, scale: 1, opacity: 1 },
      tabletAuthHostess: { url: "https://i.postimg.cc/d3vSD6dn/Untitled-(1).png", positionX: 0, positionY: 0, scale: 1, opacity: 1 },
      
      authBg: { url: "https://iili.io/f3UKPft.png", positionX: 0, positionY: 0, scale: 1, opacity: 0.3 },
      mobileAuthBg: { url: "https://iili.io/f3UKPft.png", positionX: 0, positionY: 0, scale: 1, opacity: 0.3 },
      tabletAuthBg: { url: "https://iili.io/f3UKPft.png", positionX: 0, positionY: 0, scale: 1, opacity: 0.3 },

      mobileSidebarBg: { url: "", positionX: 0, positionY: 0, scale: 1, opacity: 0.95 },
      authCircleImages: [
        "https://iili.io/f2Q9rAB.jpg", "https://iili.io/f2Q96t1.png", "https://iili.io/f2Q9e6b.jpg",
        "https://iili.io/f2Q9g9V.jpg", "https://iili.io/f2Q94wP.jpg", "https://iili.io/f2Q9ioF.jpg"
      ],
      mobileAuthCircleImages: [
        "https://iili.io/f2Q9rAB.jpg", "https://iili.io/f2Q96t1.png", "https://iili.io/f2Q9e6b.jpg",
        "https://iili.io/f2Q9g9V.jpg", "https://iili.io/f2Q94wP.jpg", "https://iili.io/f2Q9ioF.jpg",
        "https://iili.io/f2Q9rAB.jpg", "https://iili.io/f2Q96t1.png", "https://iili.io/f2Q9e6b.jpg",
        "https://iili.io/f2Q9g9V.jpg", "https://iili.io/f2Q94wP.jpg", "https://iili.io/f2Q9ioF.jpg"
      ],
      homeHeroBg: { url: "https://iili.io/f2peUSn.jpg", positionX: 0, positionY: 0, scale: 1, opacity: 1 },
      tabletHeroBg: { url: "https://iili.io/f2peUSn.jpg", positionX: 0, positionY: 0, scale: 1, opacity: 1 },

      heroLeftChar: { url: "https://iili.io/f2bVmib.png", positionX: 0, positionY: 0, scale: 1, opacity: 1 },
      heroRightChar: { url: "https://iili.io/f2t4Pjf.png", positionX: 0, positionY: 0, scale: 1, opacity: 1 },
      heroWelcomeChar: { url: "https://iili.io/39Qp4YF.png", positionX: 0, positionY: 0, scale: 1, opacity: 1 },
      
      tabletHeroWelcomeChar: { url: "https://iili.io/39Qp4YF.png", positionX: 0, positionY: 0, scale: 1, opacity: 1 },
      
      // Mobile Hero Defaults
      mobileHeroWelcomeChar: { url: "https://iili.io/39Qp4YF.png", positionX: 0, positionY: 0, scale: 1, opacity: 1 },
      mobileHeroLeftDecor: { url: "", positionX: 0, positionY: 0, scale: 1, opacity: 1 },
      mobileHeroRightDecor: { url: "", positionX: 0, positionY: 0, scale: 1, opacity: 1 },
      mobileHeroTextScale: 1,

      featuredGameLeftChar: { url: "https://iili.io/f2bVmib.png", positionX: 0, positionY: 0, scale: 1, opacity: 1 },
      featuredGameRightChar: { url: "https://iili.io/f2t4Pjf.png", positionX: 0, positionY: 0, scale: 1, opacity: 1 },
      aboutHeroLeft: { url: "https://iili.io/f2ZhwEx.png", positionX: 0, positionY: 0, scale: 1, opacity: 0.5 },
      aboutPassionImg: { url: "https://iili.io/f2t4Pjf.png", positionX: 0, positionY: 0, scale: 1, opacity: 1 },
      aboutClosingRight: { url: "https://iili.io/f2bVmib.png", positionX: 0, positionY: 0, scale: 1, opacity: 1 },
      statusBg: { url: "https://iili.io/f3kRcpn.png", positionX: 0, positionY: 0, scale: 1, opacity: 0.5 },
      profileBg: { url: "https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?q=80&w=2068&auto=format&fit=crop", positionX: 0, positionY: 0, scale: 1, opacity: 0.4 },
      profileCardPeekingImg: { url: "https://ulvmrnawiacptzonkouh.supabase.co/storage/v1/object/sign/pic/Untitled%20(5).png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wNzBkNjg3MC0zYmQ4LTQ5ZDEtYTQ1ZC02NDFhNTM5ZTI4YjQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwaWMvVW50aXRsZWQgKDUpLnBuZyIsImlhdCI6MTc2NDM4NDI4OCwiZXhwIjoxNzk1OTIwMjg4fQ.P-NUmmoKCyXgrED-DYAg_L9MEQuhl7ZsxQF9MGTBuV4", positionX: 0, positionY: 0, scale: 1, opacity: 1 },
      gamePanelBg: { url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop", positionX: 0, positionY: 0, scale: 1, opacity: 0.3 },
      dashboardBg: { url: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?q=80&w=2070&auto=format&fit=crop", positionX: 0, positionY: 0, scale: 1, opacity: 0.6 },
      footerBg: { url: "https://www.transparenttextures.com/patterns/poker-chip.png", positionX: 0, positionY: 0, scale: 1, opacity: 0.03 },
      footerRightChar: { url: "https://ulvmrnawiacptzonkouh.supabase.co/storage/v1/object/sign/pic/Untitled%20(5).png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wNzBkNjg3MC0zYmQ4LTQ5ZDEtYTQ1ZC02NDFhNTM5ZTI4YjQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwaWMvVW50aXRsZWQgKDUpLnBuZyIsImlhdCI6MTc2NDM9MjkyNSwiZXhwIjoxNzk1OTI4OTI1fQ.tC89rn1Dal5VKk3nD5GXNozzNNoDkMwAc2JdZxjSrW8", positionX: 0, positionY: 0, scale: 1, opacity: 1 },
      howItWorksBg: { url: "", positionX: 0, positionY: 0, scale: 1, opacity: 0.1 },
      fishSectionBg: { url: "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?q=80&w=2070&auto=format&fit=crop", positionX: 0, positionY: 0, scale: 1, opacity: 0.4 },
      fishSectionLeftChar: { url: "https://ulvmrnawiacptzonkouh.supabase.co/storage/v1/object/sign/pic/Untitled%20(6).png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wNzBkNjg3MC0zYmQ4LTQ5ZDEtYTQ1ZC02NDFhNTM5ZTI4YjQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwaWMvVW50aXRsZWQgKDYpLnBuZyIsImlhdCI6MTc2NDM9Mjk2OSwiZXhwIjoxNzk1OTI4OTY5fQ.1WORF54memtmStM3IlbfvM7iuIEprRToVSYWhbPE-i8", positionX: 0, positionY: 0, scale: 1, opacity: 1 },
      gamePanelWarningChar: { url: "https://ulvmrnawiacptzonkouh.supabase.co/storage/v1/object/sign/pic/77428f52-9600-4ae8-a8af-4fe35d2b78af.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wNzBkNjg3MC0zYmQ4LTQ5ZDEtYTQ1ZC02NDFhNTM5ZTI4YjQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwaWMvNzc0MjhmNTItOTYwMC00YWU4LWE4YWYtNGZlMzVkMmI3OGFmLnBuZyIsImlhdCI6MTc2NDM9MzAyNCwiZXhwIjoxNzk1OTI5MDI0fQ.hKM7oz4GM7D7gsll6E4z2OBWMwlVcuWx8ugwSfv2jEo", positionX: 0, positionY: 0, scale: 1, opacity: 1 },
      featuredGamesBg: { url: "", positionX: 0, positionY: 0, scale: 1, opacity: 0.2 },
      whyChooseBg: { url: "https://ulvmrnawiacptzonkouh.supabase.co/storage/v1/object/sign/pic/Untitled%20(13).png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wNzBkNjg3MC0zYmQ4LTQ5ZDEtYTQ1ZC02NDFhNTM5ZTI4YjQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwaWMvVW50aXRsZWQgKDEzKS5wbmciLCJpYXQiOjE3NjQ0ODI3MDcsImV4cCI6MTc5NjAxODcwN30.fOkrtrWJzZ6VU_txbrLYH05KPVbZJHO8qfNylh3e2So", positionX: 0, positionY: 0, scale: 1, opacity: 0.5 },
      featuredGames: [],
      introGames: [],
      platformStatus: [],
      gamePanelSoftware: [],
      gamePanelRules: { adding: "", redeeming: "" },
      faqs: [],
      tutorials: [],
      
      // Webhooks
      webhooks: {
        accountCreate: "",
        passwordReset: "",
        addCredits: "",
        redeemCredits: "",
        freePlay: ""
      },

      enableSupportTab: false,
      aiConfig: { enabled: false, provider: 'gemini', geminiKey: '', openRouterKey: '', systemPrompt: '', knowledgeBase: '' },
      supportContact: { enabled: false, method: 'telegram', botToken: '', chatId: '', webhookUrl: '' },
      socialLinks: {
        facebook: "https://facebook.com",
        youtube: "https://youtube.com",
        instagram: "https://instagram.com"
      },
      cashFlow: {
        stripe: { enabled: false, apiKey: '', apiSecret: '', webhookSecret: '' },
        paypal: { enabled: false, email: '' },
        coinbase: { enabled: false, apiKey: '' },
        cashapp: { enabled: false, cashtag: '' }
      },
      telegram: {
        create: { botToken: '', chatId: '' },
        reset: { botToken: '', chatId: '' },
        transaction: { botToken: '', chatId: '' },
        freePlay: { botToken: '', chatId: '' }
      }
  };
  
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [activeImageSection, setActiveImageSection] = useState<string>('all_images');

  useEffect(() => {
    const draftConfig = sessionStorage.getItem('admin_draft_config');
    const draftUI = sessionStorage.getItem('admin_ui_state');

    if (draftConfig) {
        try {
            const parsedDraft = JSON.parse(draftConfig);
            const mergedConfig = { ...DEFAULT_CONFIG, ...parsedDraft };
            // Ensure deep merge for nested objects
            mergedConfig.webhooks = { ...DEFAULT_CONFIG.webhooks, ...(parsedDraft.webhooks || {}) };
            mergedConfig.cashFlow = { ...DEFAULT_CONFIG.cashFlow, ...(parsedDraft.cashFlow || {}) };
            mergedConfig.socialLinks = { ...DEFAULT_CONFIG.socialLinks, ...(parsedDraft.socialLinks || {}) };

            setSiteConfig(mergedConfig);
            
            if (draftUI) {
                const ui = JSON.parse(draftUI);
                if (ui.activeTab) setActiveTab(ui.activeTab);
                if (ui.activeImageSection) setActiveImageSection(ui.activeImageSection);
                if (ui.isGamesMenuOpen !== undefined) setIsGamesMenuOpen(ui.isGamesMenuOpen);
            }
            setMessage({ text: "Restored unsaved changes from preview.", type: 'success' });
        } catch (e) {
            console.error("Error restoring draft:", e);
            loadFromLocalStorage();
        }
    } else {
        loadFromLocalStorage();
    }
    
    const storedAuth = JSON.parse(localStorage.getItem('emperial_admin_auth') || 'null');
    if (storedAuth) {
        setIsPinEnabled(!!storedAuth.pin);
        setPin(storedAuth.pin || '');
    }
    
    if (user?.adminPin) {
        setPersonalPin(user.adminPin);
    }

    const fbEnabled = localStorage.getItem('firebase_enabled') === 'true';
    if (fbEnabled) {
        setFirebaseConfig({
            enabled: true,
            apiKey: localStorage.getItem('firebase_api_key') || '',
            authDomain: localStorage.getItem('firebase_auth_domain') || '',
            projectId: localStorage.getItem('firebase_project_id') || ''
        });
    }

    const fb = initFirebase();
    if (fb) {
        getDocs(query(collection(fb.db, "admin_documents"), orderBy("timestamp", "desc")))
            .then(snap => {
                const docs: UploadedDocument[] = [];
                snap.forEach(d => docs.push({ id: d.id, ...d.data() } as UploadedDocument));
                setUploadedDocs(docs);
            })
            .catch(console.error);
    }
  }, [user]);

  const loadFromLocalStorage = () => {
      const storedConfig = localStorage.getItem('site_config');
      if (storedConfig) {
          try {
              const parsed = JSON.parse(storedConfig);
              setSiteConfig({ ...DEFAULT_CONFIG, ...parsed });
          } catch (e) {
              console.error(e);
              setSiteConfig(DEFAULT_CONFIG);
          }
      } else {
          setSiteConfig(DEFAULT_CONFIG);
      }
  };

  const handlePreview = () => {
      sessionStorage.setItem('admin_draft_config', JSON.stringify(siteConfig));
      sessionStorage.setItem('admin_ui_state', JSON.stringify({ activeTab, activeImageSection, isGamesMenuOpen }));
      onPreview(siteConfig);
  };

  const handlePublish = () => {
      localStorage.setItem('site_config', JSON.stringify(siteConfig));
      sessionStorage.removeItem('admin_draft_config');
      sessionStorage.removeItem('admin_ui_state');
      
      setMessage({ text: 'Configuration published successfully!', type: 'success' });
      
      localStorage.setItem('firebase_enabled', String(firebaseConfig.enabled));
      if (firebaseConfig.enabled) {
          localStorage.setItem('firebase_api_key', firebaseConfig.apiKey);
          localStorage.setItem('firebase_auth_domain', firebaseConfig.authDomain);
          localStorage.setItem('firebase_project_id', firebaseConfig.projectId);
      }
      
      setTimeout(() => window.location.reload(), 1500);
  };

  const handleSaveSecurity = () => {
      if (newPassword && newPassword !== confirmPassword) {
          setMessage({ text: 'Passwords do not match', type: 'error' });
          return;
      }
      const newAuth = { pin: isPinEnabled ? pin : '', password: newPassword || '112233' };
      localStorage.setItem('emperial_admin_auth', JSON.stringify(newAuth));
      
      if (personalPin && user?.id) {
          const fb = initFirebase();
          if (fb) {
              updateDoc(doc(fb.db, "users", user.id), { adminPin: personalPin })
                 .then(() => console.log("Updated personal PIN"))
                 .catch(e => console.error(e));
          }
      }

      setMessage({ text: 'Security settings updated', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
  };

  const handleNobilitySearch = async () => {
      if (!nobilitySearch) return;
      const fb = initFirebase();
      if (!fb) return;

      try {
          const usersRef = collection(fb.db, "users");
          let q = query(usersRef, where("email", "==", nobilitySearch));
          let snapshot = await getDocs(q);
          
          if (snapshot.empty) {
              q = query(usersRef, where("playerId", "==", nobilitySearch));
              snapshot = await getDocs(q);
          }

          if (!snapshot.empty) {
              const userData = snapshot.docs[0].data() as User;
              userData.id = snapshot.docs[0].id;
              setSearchedUser(userData);
              setSelectedRole(userData.role || 'Peasant');
              setSelectedPermissions(userData.adminPermissions || []);
              setTargetAdminPin(userData.adminPin || '');
          } else {
              setSearchedUser(null);
              setMessage({ text: "User not found.", type: 'error' });
          }
      } catch (e) { console.error(e); }
  };

  const handleSaveNobility = async () => {
      if (!searchedUser) return;
      const fb = initFirebase();
      if (!fb) return;

      try {
          await updateDoc(doc(fb.db, "users", searchedUser.id), {
              role: selectedRole,
              adminPermissions: selectedPermissions,
              adminPin: targetAdminPin
          });
          setMessage({ text: `Updated nobility for ${searchedUser.name}`, type: 'success' });
          setSearchedUser({ ...searchedUser, role: selectedRole, adminPermissions: selectedPermissions, adminPin: targetAdminPin });
      } catch (e) {
           setMessage({ text: "Failed to update nobility.", type: 'error' });
      }
  };

  const togglePermission = (perm: string) => {
      setSelectedPermissions(prev => 
          prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
      );
  };

  const updateImageSetting = (key: keyof SiteConfig, field: keyof ImageSettings, value: any) => { 
      const currentSetting = (siteConfig[key] as ImageSettings) || (DEFAULT_CONFIG[key] as ImageSettings);
      setSiteConfig({ 
          ...siteConfig, 
          [key]: { 
              ...currentSetting, 
              [field]: value 
          } 
      }); 
  };

  const updateMobileTextScale = (val: number) => {
      setSiteConfig({ ...siteConfig, mobileHeroTextScale: val });
  };
  
  const updateSocialLink = (key: keyof typeof siteConfig.socialLinks, value: string) => {
      setSiteConfig({
          ...siteConfig,
          socialLinks: {
              ...siteConfig.socialLinks,
              [key]: value
          }
      });
  };

  const updateWebhook = (key: keyof typeof siteConfig.webhooks, value: string) => {
      setSiteConfig({
          ...siteConfig,
          webhooks: {
              ...siteConfig.webhooks,
              [key]: value
          }
      });
  };

  const updateMobileAuthCircleImage = (index: number, url: string) => {
      const newImages = [...(siteConfig.mobileAuthCircleImages || [])];
      newImages[index] = url;
      setSiteConfig({ ...siteConfig, mobileAuthCircleImages: newImages });
  };

  const updateTelegramConfig = (section: 'create' | 'reset' | 'transaction' | 'freePlay', field: 'botToken' | 'chatId', value: string) => {
      setSiteConfig({
          ...siteConfig,
          telegram: {
              ...siteConfig.telegram,
              [section]: {
                  ...siteConfig.telegram[section],
                  [field]: value
              }
          }
      });
  };
  
  const updateCashFlow = (provider: keyof typeof siteConfig.cashFlow, field: string, value: any) => {
      setSiteConfig({
          ...siteConfig,
          cashFlow: {
              ...siteConfig.cashFlow,
              [provider]: {
                  ...siteConfig.cashFlow[provider],
                  [field]: value
              }
          }
      });
  };

  const handleSaveFAQ = () => { if (!editingFAQ) return; const newFAQ = { ...editingFAQ, id: editingFAQ.id || Date.now().toString() } as FAQ; const newFAQs = editingFAQ.id ? (siteConfig.faqs || []).map(f => f.id === newFAQ.id ? newFAQ : f) : [...(siteConfig.faqs || []), newFAQ]; setSiteConfig({ ...siteConfig, faqs: newFAQs }); setIsFAQModalOpen(false); setEditingFAQ(null); }; const handleDeleteFAQ = (id: string) => { setSiteConfig({ ...siteConfig, faqs: (siteConfig.faqs || []).filter(f => f.id !== id) }); };
  const handleSaveTutorial = () => { if (!editingTutorial) return; const newTutorial = { ...editingTutorial, id: editingTutorial.id || Date.now().toString() } as Tutorial; const newList = editingTutorial.id ? (siteConfig.tutorials || []).map(t => t.id === newTutorial.id ? newTutorial : t) : [...(siteConfig.tutorials || []), newTutorial]; setSiteConfig({ ...siteConfig, tutorials: newList }); setIsTutorialModalOpen(false); setEditingTutorial(null); }; const handleDeleteTutorial = (id: string) => { setSiteConfig({ ...siteConfig, tutorials: (siteConfig.tutorials || []).filter(t => t.id !== id) }); };
  const handleSaveGame = () => { if (!editingGame) return; const newGame = { ...editingGame, id: editingGame.id || Date.now().toString() } as Game; const newList = editingGame.id ? (siteConfig.featuredGames || []).map(g => g.id === newGame.id ? newGame : g) : [...(siteConfig.featuredGames || []), newGame]; setSiteConfig({ ...siteConfig, featuredGames: newList }); setIsGameModalOpen(false); setEditingGame(null); }; const handleDeleteGame = (id: string) => { setSiteConfig({ ...siteConfig, featuredGames: (siteConfig.featuredGames || []).filter(g => g.id !== id) }); };
  const handleSaveStatus = () => { if (!editingStatus) return; const newStatus = { ...editingStatus, id: editingStatus.id || Date.now().toString() } as PlatformStatus; const newList = editingStatus.id ? (siteConfig.platformStatus || []).map(s => s.id === newStatus.id ? newStatus : s) : [...(siteConfig.platformStatus || []), newStatus]; setSiteConfig({ ...siteConfig, platformStatus: newList }); setIsStatusModalOpen(false); setEditingStatus(null); }; const handleDeleteStatus = (id: string) => { setSiteConfig({ ...siteConfig, platformStatus: (siteConfig.platformStatus || []).filter(s => s.id !== id) }); };
  const handleSaveSoftware = () => { if (!editingSoftware) return; const newSoftware = { ...editingSoftware, id: editingSoftware.id || Date.now().toString() } as GamePanelSoftware; const newList = editingSoftware.id ? (siteConfig.gamePanelSoftware || []).map(s => s.id === newSoftware.id ? newSoftware : s) : [...(siteConfig.gamePanelSoftware || []), newSoftware]; setSiteConfig({ ...siteConfig, gamePanelSoftware: newList }); setIsSoftwareModalOpen(false); setEditingSoftware(null); }; const handleDeleteSoftware = (id: string) => { setSiteConfig({ ...siteConfig, gamePanelSoftware: (siteConfig.gamePanelSoftware || []).filter(s => s.id !== id) }); };
  const handleSaveIntroGame = () => { if (!editingIntroGame) return; const newGame = { ...editingIntroGame, id: editingIntroGame.id || Date.now().toString(), showDownload: editingIntroGame.showDownload ?? false } as IntroGame; const newList = editingIntroGame.id ? (siteConfig.introGames || []).map(g => g.id === newGame.id ? newGame : g) : [...(siteConfig.introGames || []), newGame]; setSiteConfig({ ...siteConfig, introGames: newList }); setIsIntroGameModalOpen(false); setEditingIntroGame(null); }; const handleDeleteIntroGame = (id: string) => { setSiteConfig({ ...siteConfig, introGames: (siteConfig.introGames || []).filter(g => g.id !== id) }); };
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => { if (!e.target.files || !e.target.files[0]) return; const file = e.target.files[0]; setUploadingDoc(true); const reader = new FileReader(); reader.onload = async (ev) => { const content = ev.target?.result as string; const fb = initFirebase(); if (fb) { try { const docRef = await addDoc(collection(fb.db, "admin_documents"), { name: file.name, content: content, timestamp: new Date().toISOString() }); setUploadedDocs(prev => [...prev, { id: docRef.id, name: file.name, content, timestamp: new Date().toISOString() }]); setMessage({ text: 'Document uploaded successfully', type: 'success' }); } catch (err) { console.error(err); setMessage({ text: 'Failed to upload document', type: 'error' }); } } else { setMessage({ text: 'Firebase not configured', type: 'error' }); } setUploadingDoc(false); }; reader.readAsText(file); };
  const handleDeleteDoc = async (id: string) => { const fb = initFirebase(); if (fb) { try { await deleteDoc(doc(fb.db, "admin_documents", id)); setUploadedDocs(prev => prev.filter(d => d.id !== id)); } catch (e) { console.error(e); } } };

  return (
    <div className="flex h-screen bg-[#0A0A0A] text-white font-sans overflow-hidden">
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-[#121212] border-r border-gold-600/20 transition-all duration-300 flex flex-col relative z-20`}> 
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="absolute -right-3 top-8 bg-gold-500 rounded-full p-1 text-black shadow-gold-glow hover:bg-gold-400 transition-colors"> {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />} </button> 
          <div className={`p-6 flex items-center ${isSidebarOpen ? 'justify-start gap-3' : 'justify-center'}`}> <LayoutDashboard className="text-gold-500 flex-shrink-0" size={24} /> {isSidebarOpen && ( <div> <h2 className="font-cinzel font-bold text-gold-200 whitespace-nowrap">{user?.role ? user.role + "'s Panel" : "Ruler's Panel"}</h2> <p className="text-xs text-gray-500">Admin Control</p> </div> )} </div> 
          <nav className="flex-1 py-6 space-y-2 px-3 overflow-y-auto"> 
            <MenuItem icon={<Crown size={20} />} label="Nobility" isOpen={isSidebarOpen} active={activeTab === 'nobility'} onClick={() => setActiveTab('nobility')} hidden={!hasAccess(user, 'nobility')} />
            <MenuItem icon={<Database size={20} />} label="Backends" isOpen={isSidebarOpen} active={activeTab === 'backends'} onClick={() => setActiveTab('backends')} hidden={!hasAccess(user, 'backends')} /> 
            <MenuItem icon={<Wallet size={20} />} label="Cash Flow" isOpen={isSidebarOpen} active={activeTab === 'cashflow'} onClick={() => setActiveTab('cashflow')} hidden={!hasAccess(user, 'backends')} />
            <MenuItem icon={<Shield size={20} />} label="Security" isOpen={isSidebarOpen} active={activeTab === 'security'} onClick={() => setActiveTab('security')} hidden={!hasAccess(user, 'security')} /> 
            <MenuItem icon={<ImageIcon size={20} />} label="Images" isOpen={isSidebarOpen} active={activeTab === 'images'} onClick={() => setActiveTab('images')} hidden={!hasAccess(user, 'images')} /> 
            <MenuItem icon={<Smartphone size={20} />} label="Mobile" isOpen={isSidebarOpen} active={activeTab === 'mobile'} onClick={() => setActiveTab('mobile')} hidden={!hasAccess(user, 'mobile')} /> 
            <MenuItem icon={<Share2 size={20} />} label="Socials" isOpen={isSidebarOpen} active={activeTab === 'socials'} onClick={() => setActiveTab('socials')} hidden={!hasAccess(user, 'socials')} /> 
            <MenuItem icon={<Webhook size={20} />} label="Webhook" isOpen={isSidebarOpen} active={activeTab === 'webhook'} onClick={() => setActiveTab('webhook')} hidden={!hasAccess(user, 'webhook')} /> 
            <MenuItem icon={<Send size={20} />} label="Telegram" isOpen={isSidebarOpen} active={activeTab === 'telegram'} onClick={() => setActiveTab('telegram')} hidden={!hasAccess(user, 'telegram')} /> 
            <MenuItem icon={<HelpCircle size={20} />} label="Support" isOpen={isSidebarOpen} active={activeTab === 'support'} onClick={() => setActiveTab('support')} hidden={!hasAccess(user, 'support')} /> 
            <MenuItem icon={<Video size={20} />} label="Tutorials" isOpen={isSidebarOpen} active={activeTab === 'tutorials'} onClick={() => setActiveTab('tutorials')} hidden={!hasAccess(user, 'tutorials')} /> 
            <div> 
                <button onClick={() => { setIsGamesMenuOpen(!isGamesMenuOpen); if(!isSidebarOpen) setIsSidebarOpen(true); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${activeTab.includes('game') || activeTab === 'status' ? 'text-gold-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}> <div className="flex items-center gap-4"> <Gamepad2 size={20} /> {isSidebarOpen && <span className="font-medium text-sm">Games</span>} </div> {isSidebarOpen && <ChevronDown size={16} className={`transform transition-transform ${isGamesMenuOpen ? 'rotate-180' : ''}`} />} </button> 
                {isSidebarOpen && isGamesMenuOpen && hasAccess(user, 'games') && ( 
                    <div className="ml-12 space-y-1 mt-1 border-l border-gray-800 pl-2"> 
                        <button onClick={() => setActiveTab('featured_games')} className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${activeTab === 'featured_games' ? 'bg-gold-500/10 text-gold-500 border border-gold-500/20' : 'text-gray-500 hover:text-gray-300'}`}> Featured Games </button> 
                        <button onClick={() => setActiveTab('games_intro')} className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${activeTab === 'games_intro' ? 'bg-gold-500/10 text-gold-500 border border-gold-500/20' : 'text-gray-500 hover:text-gray-300'}`}> Games Intro </button>
                        <button onClick={() => setActiveTab('status')} className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${activeTab === 'status' ? 'bg-gold-500/10 text-gold-500 border border-gold-500/20' : 'text-gray-500 hover:text-gray-300'}`}> Status </button> 
                        <button onClick={() => setActiveTab('game_panel_software')} className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${activeTab === 'game_panel_software' ? 'bg-gold-500/10 text-gold-500 border border-gold-500/20' : 'text-gray-500 hover:text-gray-300'}`}> Game Panel Software </button> 
                    </div> 
                )} 
            </div> 
          </nav> 
          <div className="p-4 border-t border-gray-800 flex-shrink-0"> <div className={`flex items-center ${isSidebarOpen ? 'justify-start gap-3' : 'justify-center'}`}> <div className="w-8 h-8 rounded-full bg-gold-600 flex items-center justify-center text-black font-bold text-xs">A</div> {isSidebarOpen && ( <div className="overflow-hidden"> <p className="text-sm text-white truncate">{user?.role || 'Emperor'}</p> <p className="text-xs text-gray-500 truncate">{user?.name}</p> </div> )} </div> </div> 
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen">
          <header className="flex-shrink-0 h-16 bg-[#121212]/50 border-b border-gray-800 flex items-center justify-between px-4 md:px-8 backdrop-blur-sm"> 
            <h1 className="text-lg md:text-xl font-cinzel text-gold-400 uppercase truncate mr-4">{activeTab.replace('_', ' ')}</h1> 
            <div className="flex items-center gap-2 md:gap-4 overflow-x-auto"> 
                <button onClick={() => onNavigate(ViewState.HOME)} className="flex items-center gap-2 px-3 md:px-4 py-2 text-gold-400 hover:text-gold-300 border border-gold-600/30 rounded-lg hover:bg-gold-900/10 transition-all whitespace-nowrap"> <ArrowUpRight size={16} /> <span className="text-sm font-bold hidden sm:inline">Visit Site</span> </button> 
                <button onClick={handlePreview} className="flex items-center gap-2 px-3 md:px-4 py-2 text-gray-300 hover:text-white border border-gray-700 rounded-lg hover:bg-gray-800 transition-all whitespace-nowrap"> <Eye size={16} /> <span className="text-sm hidden sm:inline">Preview</span> </button> 
                <button onClick={handlePublish} className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gold-600 text-black font-bold rounded-lg hover:bg-gold-500 shadow-gold-glow transition-all whitespace-nowrap"> <UploadCloud size={16} /> <span className="text-sm hidden sm:inline">Publish</span> </button> 
                <div className="h-6 w-px bg-gray-700 mx-2 hidden sm:block"></div> 
                <button onClick={onLogout} className="text-red-500 hover:text-red-400 text-sm font-cinzel flex items-center gap-2 whitespace-nowrap"> <LogOut size={16} /> <span className="hidden sm:inline">Logout</span> </button> 
            </div> 
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#0A0A0A] relative">
            {message && (
                <div className={`fixed top-20 right-8 z-50 p-4 rounded-lg border shadow-lg flex items-center gap-3 animate-fade-in ${message.type === 'success' ? 'bg-green-950/80 border-green-500 text-green-400' : 'bg-red-950/80 border-red-500 text-red-400'}`}> 
                    {message.type === 'success' ? <Check size={20} /> : <AlertTriangle size={20} />} 
                    <span>{message.text}</span> 
                    <button onClick={() => setMessage(null)} className="ml-4 hover:opacity-70">✕</button> 
                </div> 
            )}

            {activeTab === 'nobility' && hasAccess(user, 'nobility') && (
                <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                    <div className="bg-[#121212] border border-gold-600/50 rounded-xl p-8 text-center">
                        <Crown className="w-16 h-16 text-gold-500 mx-auto mb-4 drop-shadow-lg" />
                        <h2 className="text-3xl font-cinzel font-bold text-white mb-2">Nobility & Roles</h2>
                        <p className="text-gray-400">Appoint subjects to positions of power within the Empire.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-[#151515] border border-gray-800 rounded-xl p-6 h-full">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Search size={18} className="text-gold-500" /> Find Subject</h3>
                            <div className="flex gap-2 mb-6">
                                <input 
                                    type="text" 
                                    placeholder="Enter Email or Player ID" 
                                    className="flex-1 bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-gold-500 outline-none"
                                    value={nobilitySearch}
                                    onChange={(e) => setNobilitySearch(e.target.value)}
                                />
                                <button onClick={handleNobilitySearch} className="bg-gold-600 text-black font-bold px-4 py-2 rounded-lg hover:bg-gold-500">Search</button>
                            </div>

                            {searchedUser && (
                                <div className="bg-black/50 border border-gold-500/30 rounded-xl p-4 animate-fade-in">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-gold-600 rounded-full flex items-center justify-center text-black font-bold text-lg">{searchedUser.name.charAt(0)}</div>
                                        <div>
                                            <p className="text-white font-bold">{searchedUser.name}</p>
                                            <p className="text-gold-500 text-xs font-mono">{searchedUser.playerId}</p>
                                            <p className="text-gray-500 text-xs">{searchedUser.email}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-xs text-gray-400">
                                        <p>Current Role: <span className="text-white font-bold">{searchedUser.role || 'Peasant'}</span></p>
                                        <p>Balance: <span className="text-green-400">${searchedUser.balance}</span></p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={`bg-[#151515] border border-gray-800 rounded-xl p-6 h-full ${!searchedUser ? 'opacity-50 pointer-events-none' : ''}`}>
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Crown size={18} className="text-gold-500" /> Grant Titles</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Assign Rank</label>
                                    <select 
                                        className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-gold-500 outline-none"
                                        value={selectedRole}
                                        onChange={(e) => setSelectedRole(e.target.value as AdminRole)}
                                    >
                                        <option value="Peasant">Peasant (No Access)</option>
                                        <option value="Baron">Baron</option>
                                        <option value="Viscount">Viscount</option>
                                        <option value="Count">Count</option>
                                        <option value="Marquis">Marquis</option>
                                        <option value="Duke">Duke</option>
                                        <option value="King">King (Full Access)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Permissions</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['images', 'games', 'support', 'security', 'backends', 'mobile', 'socials', 'webhook', 'telegram'].map(perm => (
                                            <label key={perm} className="flex items-center gap-2 cursor-pointer bg-black/30 p-2 rounded hover:bg-black/60">
                                                <input 
                                                    type="checkbox" 
                                                    className="accent-gold-500"
                                                    checked={selectedPermissions.includes(perm)}
                                                    onChange={() => togglePermission(perm)}
                                                    disabled={selectedRole === 'King'} 
                                                />
                                                <span className="text-xs text-gray-300 capitalize">{perm}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Set Admin PIN</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-gold-500 outline-none font-mono tracking-widest"
                                        placeholder="Create 4-6 digit PIN"
                                        value={targetAdminPin}
                                        onChange={(e) => setTargetAdminPin(e.target.value)}
                                    />
                                    <p className="text-[10px] text-gray-500 mt-1">This PIN is required for them to access the panel.</p>
                                </div>

                                <GoldButton onClick={handleSaveNobility} className="w-full mt-4">Confirm Title</GoldButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {activeTab === 'cashflow' && hasAccess(user, 'backends') && (
                <div className="max-w-5xl space-y-8 animate-fade-in">
                    <div className="bg-[#121212] border border-gold-600/50 rounded-xl p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2"><Wallet size={24} className="text-gold-500"/> Cash Flow Management</h2>
                        <p className="text-gray-400 text-sm">Connect your payment providers to automate deposits and withdrawals.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* STRIPE */}
                        <BackendCard title="Stripe" icon={<CreditCard size={24} />} description="Credit/Debit Cards" isEnabled={siteConfig.cashFlow?.stripe?.enabled} onToggle={() => updateCashFlow('stripe', 'enabled', !siteConfig.cashFlow?.stripe?.enabled)} guideContent={
                            <div className="text-xs text-gray-300 space-y-2">
                                <p>1. Log in to Stripe Dashboard.</p>
                                <p>2. Go to Developers {'>'} API Keys.</p>
                                <p>3. Copy <strong>Publishable Key</strong> and <strong>Secret Key</strong>.</p>
                                <p>4. For Webhooks, go to Developers {'>'} Webhooks and add endpoint.</p>
                            </div>
                        }>
                            <InputField label="API Key (Publishable)" value={siteConfig.cashFlow?.stripe?.apiKey} onChange={(e) => updateCashFlow('stripe', 'apiKey', e.target.value)} />
                            <InputField label="Secret Key" type="password" value={siteConfig.cashFlow?.stripe?.apiSecret} onChange={(e) => updateCashFlow('stripe', 'apiSecret', e.target.value)} />
                            <InputField label="Webhook Secret" type="password" value={siteConfig.cashFlow?.stripe?.webhookSecret} onChange={(e) => updateCashFlow('stripe', 'webhookSecret', e.target.value)} />
                        </BackendCard>
                        
                        {/* PAYPAL */}
                        <BackendCard title="PayPal" icon={<span className="font-bold text-xl">P</span>} description="Direct Transfers" isEnabled={siteConfig.cashFlow?.paypal?.enabled} onToggle={() => updateCashFlow('paypal', 'enabled', !siteConfig.cashFlow?.paypal?.enabled)} guideContent={<p className="text-xs text-gray-300">Enter your PayPal Business Email to receive funds directly.</p>}>
                            <InputField label="PayPal Business Email" value={siteConfig.cashFlow?.paypal?.email} onChange={(e) => updateCashFlow('paypal', 'email', e.target.value)} placeholder="business@example.com" />
                        </BackendCard>

                        {/* COINBASE */}
                        <BackendCard title="Coinbase Commerce" icon={<div className="w-6 h-6 bg-blue-500 rounded-full"/>} description="Crypto Payments" isEnabled={siteConfig.cashFlow?.coinbase?.enabled} onToggle={() => updateCashFlow('coinbase', 'enabled', !siteConfig.cashFlow?.coinbase?.enabled)} guideContent={
                            <div className="text-xs text-gray-300 space-y-2">
                                <p>1. Go to Coinbase Commerce Settings.</p>
                                <p>2. Create an API Key.</p>
                                <p>3. Add Webhook endpoint: <code>https://YOUR_CLOUD_RUN_URL/coinbase/webhook</code></p>
                                <p>4. Copy the API Key and Shared Secret.</p>
                            </div>
                        }>
                            <InputField label="API Key" value={siteConfig.cashFlow?.coinbase?.apiKey} onChange={(e) => updateCashFlow('coinbase', 'apiKey', e.target.value)} />
                            <InputField label="Webhook Secret" type="password" value={siteConfig.cashFlow?.coinbase?.webhookSecret} onChange={(e) => updateCashFlow('coinbase', 'webhookSecret', e.target.value)} />
                        </BackendCard>

                        {/* CASH APP */}
                        <BackendCard title="Cash App" icon={<DollarSign size={24} />} description="Peer to Peer" isEnabled={siteConfig.cashFlow?.cashapp?.enabled} onToggle={() => updateCashFlow('cashapp', 'enabled', !siteConfig.cashFlow?.cashapp?.enabled)} guideContent={<p className="text-xs text-gray-300">Enter your $Cashtag for direct payments.</p>}>
                            <InputField label="$Cashtag" value={siteConfig.cashFlow?.cashapp?.cashtag} onChange={(e) => updateCashFlow('cashapp', 'cashtag', e.target.value)} placeholder="$MyCashtag" />
                        </BackendCard>
                    </div>
                </div>
            )}

            {activeTab === 'backends' && hasAccess(user, 'backends') && ( 
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in"> 
                    <BackendCard title="Firebase (Required)" icon={<Flame size={24} />} description="Handles Authentication, Database, and Realtime sync." isEnabled={firebaseConfig.enabled} onToggle={() => setFirebaseConfig(prev => ({ ...prev, enabled: !prev.enabled }))} guideContent={<div className="text-sm text-gray-300 space-y-2"><p>1. Go to console.firebase.google.com</p><p>2. Create a project.</p><p>3. Go to Project Settings.</p><p>4. Copy API Key, Auth Domain, Project ID.</p><p>5. Enable Email/Password Auth.</p><p>6. Create 'users' collection in Firestore.</p></div>}>
                        <InputField label="API Key" value={firebaseConfig.apiKey} onChange={(e) => setFirebaseConfig(prev => ({...prev, apiKey: e.target.value}))} placeholder="AIzaSy..." /> 
                        <InputField label="Auth Domain" value={firebaseConfig.authDomain} onChange={(e) => setFirebaseConfig(prev => ({...prev, authDomain: e.target.value}))} placeholder="project-id.firebaseapp.com" /> 
                        <InputField label="Project ID" value={firebaseConfig.projectId} onChange={(e) => setFirebaseConfig(prev => ({...prev, projectId: e.target.value}))} placeholder="project-id" /> 
                    </BackendCard> 
                </div> 
            )}
            
            {activeTab === 'security' && hasAccess(user, 'security') && ( 
                <div className="max-w-2xl bg-[#121212] border border-gray-800 rounded-xl p-8 animate-fade-in"> 
                    <h3 className="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-4">Admin Security</h3> 
                    <div className="space-y-6">
                        {user?.role !== 'Emperor' && (
                            <div className="bg-black/40 border border-gold-500/30 rounded-lg p-4">
                                <h4 className="text-gold-400 font-bold mb-2">Your Personal PIN</h4>
                                <p className="text-xs text-gray-400 mb-3">This PIN allows you to return to the Admin Panel.</p>
                                <InputField label="Set Your PIN" type="password" maxLength={6} value={personalPin} onChange={(e) => setPersonalPin(e.target.value)} placeholder="••••" />
                            </div>
                        )}
                        {user?.role === 'Emperor' && (
                            <>
                                <div className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-gray-800"> 
                                    <div><h4 className="text-white font-bold">Enable Master PIN</h4><p className="text-xs text-gray-500">Require a PIN for Master Admin access.</p></div> 
                                    <label className="relative inline-flex items-center cursor-pointer"> 
                                        <input type="checkbox" className="sr-only peer" checked={isPinEnabled} onChange={() => setIsPinEnabled(!isPinEnabled)} /> 
                                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500"></div> 
                                    </label> 
                                </div> 
                                {isPinEnabled && ( <InputField label="Set Master PIN (4-6 digits)" type="password" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value)} placeholder="••••" /> )} 
                                <hr className="border-gray-800" /> 
                                <h4 className="text-gold-400 font-bold text-sm uppercase">Change Master Password</h4> 
                                <InputField label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /> 
                                <InputField label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /> 
                            </>
                        )}
                        <GoldButton onClick={handleSaveSecurity} className="w-full">Update Security Settings</GoldButton> 
                    </div> 
                </div> 
            )}

            {activeTab === 'mobile' && hasAccess(user, 'mobile') && (
                <div className="flex flex-col gap-8 animate-fade-in max-w-6xl">
                    <div className="bg-[#121212] border border-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Layers size={20} className="text-gold-500"/> Mobile Hero Section</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                            <ImageControlPanel label="Mobile Welcome Character (Center)" settings={siteConfig.mobileHeroWelcomeChar || DEFAULT_CONFIG.mobileHeroWelcomeChar} onChange={(k, v) => updateImageSetting('mobileHeroWelcomeChar', k, v)} />
                            <ImageControlPanel label="Left Decor Image (Flanking Text)" settings={siteConfig.mobileHeroLeftDecor || DEFAULT_CONFIG.mobileHeroLeftDecor} onChange={(k, v) => updateImageSetting('mobileHeroLeftDecor', k, v)} />
                            <ImageControlPanel label="Right Decor Image (Flanking Text)" settings={siteConfig.mobileHeroRightDecor || DEFAULT_CONFIG.mobileHeroRightDecor} onChange={(k, v) => updateImageSetting('mobileHeroRightDecor', k, v)} />
                        </div>
                        <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
                            <label className="text-gold-400 text-sm font-bold block mb-2">"EMPERIAL SLOTS" Text Scale (Mobile Only)</label>
                            <div className="flex items-center gap-4">
                                <input type="range" min="0.5" max="2.0" step="0.1" value={siteConfig.mobileHeroTextScale || 1} onChange={(e) => updateMobileTextScale(parseFloat(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gold-500" />
                                <span className="text-white font-mono w-12 text-center">{(siteConfig.mobileHeroTextScale || 1).toFixed(1)}x</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="w-full md:w-1/2 space-y-6">
                            <div className="bg-[#121212] border border-gray-800 rounded-xl p-6"><ImageControlPanel label="Auth Page Mobile Hostess (Queen)" settings={siteConfig.mobileAuthHostess || DEFAULT_CONFIG.mobileAuthHostess} onChange={(k, v) => updateImageSetting('mobileAuthHostess', k, v)} /></div>
                            <div className="bg-[#121212] border border-gray-800 rounded-xl p-6"><ImageControlPanel label="Mobile Auth Background" settings={siteConfig.mobileAuthBg || DEFAULT_CONFIG.mobileAuthBg} onChange={(k, v) => updateImageSetting('mobileAuthBg', k, v)} /></div>
                            <div className="bg-[#121212] border border-gray-800 rounded-xl p-6"><ImageControlPanel label="Mobile Sidebar Background" settings={siteConfig.mobileSidebarBg || DEFAULT_CONFIG.mobileSidebarBg} onChange={(k, v) => updateImageSetting('mobileSidebarBg', k, v)} /></div>
                            
                            {/* Tablet Settings */}
                            <div className="bg-[#121212] border border-gray-800 rounded-xl p-6 mt-8"><h3 className="text-white font-bold mb-4 flex items-center gap-2"><Tablet size={18} /> Tablet Settings</h3>
                                <ImageControlPanel label="Tablet Auth Hostess" settings={siteConfig.tabletAuthHostess || DEFAULT_CONFIG.tabletAuthHostess} onChange={(k, v) => updateImageSetting('tabletAuthHostess', k, v)} />
                                <div className="h-4"></div>
                                <ImageControlPanel label="Tablet Auth Background" settings={siteConfig.tabletAuthBg || DEFAULT_CONFIG.tabletAuthBg} onChange={(k, v) => updateImageSetting('tabletAuthBg', k, v)} />
                                <div className="h-4"></div>
                                <ImageControlPanel label="Tablet Hero Background" settings={siteConfig.tabletHeroBg || DEFAULT_CONFIG.tabletHeroBg} onChange={(k, v) => updateImageSetting('tabletHeroBg', k, v)} />
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 bg-[#121212] border border-gray-800 rounded-xl p-6"><h3 className="text-xl font-bold text-white mb-4">Mobile Circles</h3><div className="grid grid-cols-2 gap-4">{(siteConfig.mobileAuthCircleImages || DEFAULT_CONFIG.mobileAuthCircleImages).map((url, idx) => (<InputField key={idx} label={`Circle ${idx + 1}`} value={url} onChange={(e) => updateMobileAuthCircleImage(idx, e.target.value)} />))}</div></div>
                    </div>
                </div>
            )}
            
            {activeTab === 'socials' && hasAccess(user, 'socials') && (
                <div className="max-w-2xl bg-[#121212] border border-gray-800 rounded-xl p-8 animate-fade-in">
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><Share2 className="text-gold-500" /> Social Media Links</h3>
                    <div className="space-y-6"><InputField label="Facebook URL" value={siteConfig.socialLinks?.facebook || ''} onChange={(e) => updateSocialLink('facebook', e.target.value)} /><InputField label="Instagram URL" value={siteConfig.socialLinks?.instagram || ''} onChange={(e) => updateSocialLink('instagram', e.target.value)} /><InputField label="YouTube URL" value={siteConfig.socialLinks?.youtube || ''} onChange={(e) => updateSocialLink('youtube', e.target.value)} /></div>
                </div>
            )}
            
            {activeTab === 'webhook' && hasAccess(user, 'webhook') && (
                <div className="max-w-3xl space-y-6 animate-fade-in"> 
                    <div className="bg-[#121212] border border-gray-800 rounded-xl p-8"> 
                        <div className="flex items-center gap-3 mb-6"> <Webhook className="text-gold-500" size={24} /> <h3 className="text-xl font-bold text-white">Webhook Configuration</h3> </div> 
                        <p className="text-gray-400 text-sm mb-6">Configure endpoints to receive automated events from the Game Panel.</p> 
                        <div className="space-y-6"> 
                            <InputField label="Account Creation" value={siteConfig.webhooks.accountCreate} onChange={(e) => updateWebhook('accountCreate', e.target.value)} placeholder="https://..." />
                            <InputField label="Password Reset" value={siteConfig.webhooks.passwordReset} onChange={(e) => updateWebhook('passwordReset', e.target.value)} placeholder="https://..." />
                            <InputField label="Add Credits" value={siteConfig.webhooks.addCredits} onChange={(e) => updateWebhook('addCredits', e.target.value)} placeholder="https://..." />
                            <InputField label="Redeem Credits" value={siteConfig.webhooks.redeemCredits} onChange={(e) => updateWebhook('redeemCredits', e.target.value)} placeholder="https://..." />
                            <InputField label="Free Play" value={siteConfig.webhooks.freePlay} onChange={(e) => updateWebhook('freePlay', e.target.value)} placeholder="https://..." />
                        </div> 
                    </div> 
                </div>
            )}

            {activeTab === 'images' && hasAccess(user, 'images') && ( <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-140px)] gap-8 animate-fade-in pb-20 lg:pb-0"> <div className="w-full lg:w-1/3 bg-[#121212] border border-gray-800 rounded-xl overflow-hidden flex flex-col h-64 lg:h-full"> <div className="p-4 bg-black/50 border-b border-gray-800 text-gold-400 font-bold font-cinzel flex-shrink-0">Select Section</div> <div className="flex-1 overflow-y-auto"> 
                {['all_images', 'auth', 'auth_bg', 'auth_circles', 'tablet_auth', 'tablet_auth_bg', 'home', 'tablet_hero_bg', 'hero_left', 'hero_right', 'hero_welcome', 'tablet_hero_welcome', 'featured_bg', 'featured_left', 'featured_right', 'how_it_works_bg', 'fish_section_bg', 'fish_section_left', 'why_choose_bg', 'about_passion', 'profile_bg', 'profile_card_peeking', 'game_panel_bg', 'game_panel_warning', 'dashboardBg', 'footerBg', 'footerRightChar'].map(key => (
                    <button key={key} onClick={() => setActiveImageSection(key)} className={`w-full text-left p-4 border-b border-gray-800 hover:bg-gray-900 transition-colors ${activeImageSection === key ? 'bg-gold-900/20 border-l-4 border-l-gold-500' : ''}`}>{key.replace(/_/g, ' ').toUpperCase()}</button>
                ))}
            </div> </div> <div className="w-full lg:flex-1 flex flex-col gap-6 h-auto lg:h-full"> 
                {activeImageSection === 'all_images' ? ( <div className="bg-[#151515] border border-gray-800 rounded-xl h-full overflow-hidden flex flex-col animate-fade-in"><div className="p-4 bg-black/50 border-b border-gray-800"><h3 className="font-bold text-white">All Images</h3></div><div className="flex-1 overflow-y-auto p-6 space-y-6"></div></div> ) : (
                    <ImageControlPanel label={activeImageSection.replace(/_/g, ' ').toUpperCase()} settings={siteConfig[activeImageSection as keyof SiteConfig] as ImageSettings || {url: '', positionX: 0, positionY: 0, scale: 1}} onChange={(k, v) => updateImageSetting(activeImageSection as any, k, v)} />
                )}
            </div> </div> )}

            {activeTab === 'games_intro' && hasAccess(user, 'games') && (
                <div className="space-y-6 animate-fade-in">
                     <div className="bg-[#121212] border border-gray-800 rounded-xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2"><MonitorPlay className="text-gold-500" /> Games Intro Page</h3>
                            <button onClick={() => { setEditingIntroGame({ id: '', title: '', description: '', image: '', showDownload: false }); setIsIntroGameModalOpen(true); }} className="bg-gold-600 text-black font-bold px-4 py-2 rounded-lg hover:bg-gold-500 flex items-center gap-2"><Plus size={16} /> Add Intro Game</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(siteConfig.introGames || []).map(game => (
                                <div key={game.id} className="bg-black/40 border border-gray-800 rounded-xl overflow-hidden group hover:border-gold-500/50 transition-all">
                                    <div className="relative h-48">
                                        <img src={game.image} className="w-full h-full object-cover" alt={game.title} />
                                        <div className="absolute top-2 right-2 flex gap-2">
                                            <button onClick={() => { setEditingIntroGame(game); setIsIntroGameModalOpen(true); }} className="p-2 bg-black/80 text-white rounded hover:bg-gold-500 hover:text-black"><Edit size={14} /></button>
                                            <button onClick={() => handleDeleteIntroGame(game.id)} className="p-2 bg-red-900/80 text-white rounded hover:bg-red-600"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-bold text-white text-lg mb-1">{game.title}</h4>
                                        <p className="text-gray-400 text-xs line-clamp-2 mb-3">{game.description}</p>
                                        <div className="flex gap-2 text-xs">
                                            {game.playLink && <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded border border-green-900/50">Play Link Active</span>}
                                            {game.showDownload && <span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded border border-blue-900/50">Download Active</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                     </div>
                </div>
            )}
            
            {activeTab === 'featured_games' && hasAccess(user, 'games') && ( 
                <div className="space-y-6 animate-fade-in"> 
                    <div className="bg-[#121212] border border-gray-800 rounded-xl p-6"> 
                        <div className="flex justify-between items-center mb-6"> 
                            <h3 className="text-xl font-bold text-white flex items-center gap-2"><Gamepad2 className="text-gold-500" /> Featured Games</h3> 
                            <button onClick={() => { setEditingGame({ id: '', title: '', image: '', rating: 5, activePlayers: '' }); setIsGameModalOpen(true); }} className="bg-gold-600 text-black font-bold px-4 py-2 rounded-lg hover:bg-gold-500 flex items-center gap-2"><Plus size={16} /> Add Game</button> 
                        </div> 
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> 
                            {(siteConfig.featuredGames || []).map(game => ( 
                                <div key={game.id} className="bg-black/40 border border-gray-800 rounded-xl overflow-hidden group hover:border-gold-500/50 transition-all"> 
                                    <div className="relative h-40"> 
                                        <img src={game.image} className="w-full h-full object-cover" alt={game.title} /> 
                                        <div className="absolute top-2 right-2 flex gap-2"> 
                                            <button onClick={() => { setEditingGame(game); setIsGameModalOpen(true); }} className="p-2 bg-black/80 text-white rounded hover:bg-gold-500 hover:text-black"><Edit size={14} /></button> 
                                            <button onClick={() => handleDeleteGame(game.id)} className="p-2 bg-red-900/80 text-white rounded hover:bg-red-600"><Trash2 size={14} /></button> 
                                        </div> 
                                        {game.isHot && <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded">HOT</span>} 
                                    </div> 
                                    <div className="p-4"> 
                                        <h4 className="font-bold text-white">{game.title}</h4> 
                                        <p className="text-xs text-gray-500">{game.activePlayers} Players • {game.rating} ★</p> 
                                    </div> 
                                </div> 
                            ))} 
                        </div> 
                    </div> 
                </div> 
            )}

            {activeTab === 'status' && hasAccess(user, 'games') && ( 
                <div className="space-y-6 animate-fade-in"> 
                    <div className="bg-[#121212] border border-gray-800 rounded-xl p-6"> 
                        <div className="flex justify-between items-center mb-6"> 
                            <h3 className="text-xl font-bold text-white flex items-center gap-2"><Activity className="text-gold-500" /> Platform Status</h3> 
                            <button onClick={() => { setEditingStatus({ id: '', name: '', image: '', status: 'Operational', details: '' }); setIsStatusModalOpen(true); }} className="bg-gold-600 text-black font-bold px-4 py-2 rounded-lg hover:bg-gold-500 flex items-center gap-2"><Plus size={16} /> Add Status</button> 
                        </div> 
                        <div className="overflow-x-auto"> 
                            <table className="w-full text-left"> 
                                <thead className="bg-black/50 text-xs text-gray-400 uppercase"> 
                                    <tr><th className="p-4">Platform</th><th className="p-4">Status</th><th className="p-4">Reason</th><th className="p-4 text-right">Actions</th></tr> 
                                </thead> 
                                <tbody className="divide-y divide-gray-800"> 
                                    {(siteConfig.platformStatus || []).map(status => ( 
                                        <tr key={status.id} className="hover:bg-white/5"> 
                                            <td className="p-4 flex items-center gap-3"> 
                                                <img src={status.image} className="w-8 h-8 rounded bg-gray-800 object-cover" alt={status.name} /> 
                                                <span className="font-bold text-white">{status.name}</span> 
                                            </td> 
                                            <td className="p-4"> 
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${status.status === 'Operational' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>{status.status}</span> 
                                            </td> 
                                            <td className="p-4 text-sm text-gray-400">{status.details || '-'}</td> 
                                            <td className="p-4 text-right space-x-2"> 
                                                <button onClick={() => { setEditingStatus(status); setIsStatusModalOpen(true); }} className="text-blue-400 hover:text-white"><Edit size={16} /></button> 
                                                <button onClick={() => handleDeleteStatus(status.id)} className="text-red-400 hover:text-white"><Trash2 size={16} /></button> 
                                            </td> 
                                        </tr> 
                                    ))} 
                                </tbody> 
                            </table> 
                        </div> 
                    </div> 
                </div> 
            )}

            {activeTab === 'game_panel_software' && hasAccess(user, 'games') && ( 
                <div className="space-y-6 animate-fade-in"> 
                    <div className="bg-[#121212] border border-gray-800 rounded-xl p-6"> 
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Gamepad2 className="text-gold-500" /> Game Panel Software</h3> 
                        <button onClick={() => { setEditingSoftware({ id: '', name: '', image: '', status: 'Active' }); setIsSoftwareModalOpen(true); }} className="bg-gold-600 text-black font-bold px-4 py-2 rounded-lg hover:bg-gold-500 flex items-center gap-2"><Plus size={16} /> Add Software</button> 
                    </div> 
                    <div className="overflow-x-auto"> 
                        <table className="w-full text-left"> 
                            <thead className="bg-black/50 text-xs text-gray-400 uppercase"> 
                                <tr><th className="p-4">Software</th><th className="p-4">Download Link</th><th className="p-4 text-right">Actions</th></tr> 
                            </thead> 
                            <tbody className="divide-y divide-gray-800"> 
                                {(siteConfig.gamePanelSoftware || []).map(sw => ( 
                                    <tr key={sw.id} className="hover:bg-white/5"> 
                                        <td className="p-4 flex items-center gap-3"> 
                                            <img src={sw.image} className="w-8 h-8 rounded bg-gray-800 object-cover" /> 
                                            <span className="font-bold text-white">{sw.name}</span> 
                                        </td> 
                                        <td className="p-4 text-sm text-gray-400 truncate max-w-xs">{sw.downloadUrl || '-'}</td> 
                                        <td className="p-4 text-right space-x-2"> 
                                            <button onClick={() => { setEditingSoftware(sw); setIsSoftwareModalOpen(true); }} className="text-blue-400 hover:text-white"><Edit size={16} /></button> 
                                            <button onClick={() => handleDeleteSoftware(sw.id)} className="text-red-400 hover:text-white"><Trash2 size={16} /></button> 
                                        </td> 
                                    </tr> 
                                ))} 
                            </tbody> 
                        </table> 
                    </div> 
                </div> 
            )}

            {activeTab === 'telegram' && hasAccess(user, 'telegram') && ( <div className="max-w-4xl space-y-6 animate-fade-in"> <div className="bg-[#121212] border border-gray-800 rounded-xl p-8"> <div className="flex items-center gap-3 mb-6"> <Send className="text-blue-400" size={24} /> <h3 className="text-xl font-bold text-white">Telegram Notifications</h3> </div> <div className="grid grid-cols-1 md:grid-cols-2 gap-8"> <div className="space-y-4 p-4 border border-gray-800 rounded-xl bg-black/30"> <h4 className="text-gold-400 font-bold border-b border-gray-700 pb-2">Account Creation</h4> <InputField label="Bot Token" value={siteConfig.telegram.create.botToken} onChange={(e) => updateTelegramConfig('create', 'botToken', e.target.value)} /> <InputField label="Chat ID" value={siteConfig.telegram.create.chatId} onChange={(e) => updateTelegramConfig('create', 'chatId', e.target.value)} /> </div> <div className="space-y-4 p-4 border border-gray-800 rounded-xl bg-black/30"> <h4 className="text-blue-400 font-bold border-b border-gray-700 pb-2">Password Reset</h4> <InputField label="Bot Token" value={siteConfig.telegram.reset.botToken} onChange={(e) => updateTelegramConfig('reset', 'botToken', e.target.value)} /> <InputField label="Chat ID" value={siteConfig.telegram.reset.chatId} onChange={(e) => updateTelegramConfig('reset', 'chatId', e.target.value)} /> </div> <div className="space-y-4 p-4 border border-gray-800 rounded-xl bg-black/30"> <h4 className="text-green-400 font-bold border-b border-gray-700 pb-2">Transactions (Add/Redeem)</h4> <InputField label="Bot Token" value={siteConfig.telegram.transaction.botToken} onChange={(e) => updateTelegramConfig('transaction', 'botToken', e.target.value)} /> <InputField label="Chat ID" value={siteConfig.telegram.transaction.chatId} onChange={(e) => updateTelegramConfig('transaction', 'chatId', e.target.value)} /> </div> <div className="space-y-4 p-4 border border-gray-800 rounded-xl bg-black/30"> <h4 className="text-purple-400 font-bold border-b border-gray-700 pb-2">Free Play Claims</h4> <InputField label="Bot Token" value={siteConfig.telegram.freePlay.botToken} onChange={(e) => updateTelegramConfig('freePlay', 'botToken', e.target.value)} /> <InputField label="Chat ID" value={siteConfig.telegram.freePlay.chatId} onChange={(e) => updateTelegramConfig('freePlay', 'chatId', e.target.value)} /> </div> </div> </div> </div> )}
            {activeTab === 'support' && hasAccess(user, 'support') && ( <div className="max-w-5xl space-y-8 animate-fade-in"> <div className="bg-[#121212] border border-gray-800 rounded-xl p-6"> <div className="flex justify-between items-center mb-6"> <h3 className="text-lg font-bold text-white flex items-center gap-2"><HelpCircle className="text-gold-500"/> FAQ Manager</h3> <button onClick={() => { setEditingFAQ({id: '', question: '', answer: '', isFeatured: false}); setIsFAQModalOpen(true); }} className="px-4 py-2 bg-gold-600 text-black font-bold rounded-lg hover:bg-gold-500 text-sm flex items-center gap-2"><Plus size={16}/> Add Question</button> </div> <div className="space-y-3"> {(siteConfig.faqs || []).map(faq => ( <div key={faq.id} className="bg-black/40 border border-gray-800 p-4 rounded-lg flex justify-between items-start group"> <div> <p className="font-bold text-white text-sm">{faq.question}</p> <p className="text-gray-500 text-xs truncate w-96">{faq.answer}</p> {faq.isFeatured && <span className="inline-block mt-2 text-[10px] bg-gold-900/30 text-gold-400 px-2 py-0.5 rounded border border-gold-600/30">Featured in Knowledge Base</span>} </div> <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"> <button onClick={() => { setEditingFAQ(faq); setIsFAQModalOpen(true); }} className="p-2 hover:bg-gray-700 rounded text-blue-400"><Edit size={14} /></button> <button onClick={() => handleDeleteFAQ(faq.id)} className="p-2 hover:bg-gray-700 rounded text-red-400"><Trash2 size={14} /></button> </div> </div> ))} </div> </div> <div className="bg-[#121212] border border-gray-800 rounded-xl p-6"> <div className="flex items-center justify-between mb-6"> <h3 className="text-lg font-bold text-white flex items-center gap-2"><Bot className="text-purple-500"/> AI Assistant Configuration</h3> <label className="relative inline-flex items-center cursor-pointer"> <input type="checkbox" className="sr-only peer" checked={siteConfig.aiConfig?.enabled} onChange={() => setSiteConfig({...siteConfig, aiConfig: {...siteConfig.aiConfig, enabled: !siteConfig.aiConfig.enabled}})} /> <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500"></div> </label> </div> <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${!siteConfig.aiConfig?.enabled ? 'opacity-50 pointer-events-none' : ''}`}> <div className="space-y-4"> <label className="text-xs text-gray-400 font-bold uppercase">Provider</label> <select value={siteConfig.aiConfig?.provider} onChange={(e) => setSiteConfig({...siteConfig, aiConfig: {...siteConfig.aiConfig, provider: e.target.value as any}})} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-gold-500"> <option value="gemini">Google Gemini (Free Tier Available)</option> <option value="openrouter">OpenRouter (Unified API)</option> </select> {siteConfig.aiConfig?.provider === 'gemini' ? ( <InputField label="Gemini API Key" type="password" value={siteConfig.aiConfig?.geminiKey} onChange={(e) => setSiteConfig({...siteConfig, aiConfig: {...siteConfig.aiConfig, geminiKey: e.target.value}})} /> ) : ( <InputField label="OpenRouter Key" type="password" value={siteConfig.aiConfig?.openRouterKey} onChange={(e) => setSiteConfig({...siteConfig, aiConfig: {...siteConfig.aiConfig, openRouterKey: e.target.value}})} /> )} </div> <div className="space-y-2"> <label className="text-xs text-gray-400 font-bold uppercase">System Prompt</label> <textarea className="w-full h-32 bg-black border border-gray-700 rounded-lg p-3 text-white text-sm outline-none focus:border-gold-500" value={siteConfig.aiConfig?.systemPrompt} onChange={(e) => setSiteConfig({...siteConfig, aiConfig: {...siteConfig.aiConfig, systemPrompt: e.target.value}})} placeholder="You are a helpful assistant..." /> </div> <div className="col-span-1 md:col-span-2 space-y-2"> <label className="text-xs text-gray-400 font-bold uppercase">Knowledge Base (Manual Text)</label> <textarea className="w-full h-32 bg-black border border-gray-700 rounded-lg p-3 text-white text-sm outline-none focus:border-gold-500" value={siteConfig.aiConfig?.knowledgeBase} onChange={(e) => setSiteConfig({...siteConfig, aiConfig: {...siteConfig.aiConfig, knowledgeBase: e.target.value}})} placeholder="Paste important rules, policies, or info here for the AI to reference..." /> </div> </div> <div className="mt-8 border-t border-gray-800 pt-6"> <h4 className="text-white font-bold mb-4 flex items-center gap-2"><FileText size={16} className="text-blue-400"/> Knowledge Documents (Firestore)</h4> <div className="flex items-center gap-4 mb-4"> <label className="cursor-pointer bg-black border border-dashed border-gray-600 rounded-lg px-6 py-3 hover:border-gold-500 transition-colors flex items-center gap-2 text-sm text-gray-400 hover:text-white"> <UploadCloud size={18} /> <span>{uploadingDoc ? 'Uploading...' : 'Upload Document (.txt, .md, .csv)'}</span> <input type="file" accept=".txt,.md,.csv,.json" className="hidden" onChange={handleFileUpload} disabled={uploadingDoc} /> </label> </div> <div className="space-y-2 max-h-40 overflow-y-auto"> {uploadedDocs.map(doc => ( <div key={doc.id} className="flex justify-between items-center bg-black/30 p-2 rounded border border-gray-800"> <div className="flex items-center gap-2"> <File size={14} className="text-gray-500" /> <span className="text-sm text-gray-300">{doc.name}</span> <span className="text-xs text-gray-600">({new Date(doc.timestamp).toLocaleDateString()})</span> </div> <button onClick={() => handleDeleteDoc(doc.id)} className="text-red-500 hover:text-red-400 p-1"><X size={14}/></button> </div> ))} {uploadedDocs.length === 0 && <p className="text-xs text-gray-600 italic">No documents uploaded.</p>} </div> </div> </div> <div className="bg-[#121212] border border-gray-800 rounded-xl p-6"> <div className="flex items-center justify-between mb-6"> <h3 className="text-lg font-bold text-white flex items-center gap-2"><MessageCircle className="text-green-500"/> Support Ticket System</h3> <label className="relative inline-flex items-center cursor-pointer"> <input type="checkbox" className="sr-only peer" checked={siteConfig.enableSupportTab} onChange={() => setSiteConfig({...siteConfig, enableSupportTab: !siteConfig.enableSupportTab})} /> <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500"></div> </label> </div> <div className={`space-y-4 ${!siteConfig.enableSupportTab ? 'opacity-50 pointer-events-none' : ''}`}> <div className="flex gap-4 mb-4"> <button onClick={() => setSiteConfig({...siteConfig, supportContact: {...siteConfig.supportContact, method: 'telegram'}})} className={`px-4 py-2 rounded border ${siteConfig.supportContact.method === 'telegram' ? 'bg-blue-900/20 border-blue-500 text-blue-400' : 'bg-black border-gray-700 text-gray-400'}`}>Telegram</button> <button onClick={() => setSiteConfig({...siteConfig, supportContact: {...siteConfig.supportContact, method: 'webhook'}})} className={`px-4 py-2 rounded border ${siteConfig.supportContact.method === 'webhook' ? 'bg-purple-900/20 border-purple-500 text-purple-400' : 'bg-black border-gray-700 text-gray-400'}`}>Webhook</button> </div> {siteConfig.supportContact.method === 'telegram' ? ( <> <InputField label="Bot Token" value={siteConfig.supportContact.botToken} onChange={(e) => setSiteConfig({...siteConfig, supportContact: {...siteConfig.supportContact, botToken: e.target.value}})} /> <InputField label="Chat ID" value={siteConfig.supportContact.chatId} onChange={(e) => setSiteConfig({...siteConfig, supportContact: {...siteConfig.supportContact, chatId: e.target.value}})} /> </> ) : ( <InputField label="Webhook URL" value={siteConfig.supportContact.webhookUrl} onChange={(e) => setSiteConfig({...siteConfig, supportContact: {...siteConfig.supportContact, webhookUrl: e.target.value}})} /> )} </div> </div> </div> )}
            {activeTab === 'tutorials' && hasAccess(user, 'tutorials') && ( <div className="max-w-4xl space-y-6 animate-fade-in"> <div className="flex justify-between items-center bg-[#121212] p-6 rounded-xl border border-gray-800"> <h3 className="text-xl font-bold text-white">Video Tutorials</h3> <button onClick={() => { setEditingTutorial({id: '', title: '', videoUrl: ''}); setIsTutorialModalOpen(true); }} className="bg-gold-600 text-black font-bold px-4 py-2 rounded-lg hover:bg-gold-500 flex items-center gap-2"><Plus size={16} /> Add Video</button> </div> <div className="grid grid-cols-1 gap-4"> {(siteConfig.tutorials || []).map(t => ( <div key={t.id} className="bg-[#121212] border border-gray-800 p-4 rounded-xl flex items-center justify-between group hover:border-gold-500/30 transition-colors"> <div className="flex items-center gap-4"> <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-gold-500"><Video size={20} /></div> <div> <h4 className="font-bold text-white">{t.title}</h4> <a href={t.videoUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline">{t.videoUrl}</a> </div> </div> <div className="flex gap-2"> <button onClick={() => { setEditingTutorial(t); setIsTutorialModalOpen(true); }} className="p-2 bg-gray-800 rounded hover:bg-gray-700 text-gray-300"><Edit size={16} /></button> <button onClick={() => handleDeleteTutorial(t.id)} className="p-2 bg-red-900/20 rounded hover:bg-red-900/40 text-red-400"><Trash2 size={16} /></button> </div> </div> ))} </div> </div> )}

          </div>
      </main>

      {/* --- MODALS --- */}
      {isTutorialModalOpen && ( <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"> <div className="bg-[#151515] border border-gray-700 rounded-xl p-6 w-full max-w-md"> <h3 className="text-xl font-bold text-white mb-4">Edit Tutorial</h3> <div className="space-y-4"> <InputField label="Title" value={editingTutorial?.title || ''} onChange={(e) => setEditingTutorial({...editingTutorial!, title: e.target.value})} /> <InputField label="Video Link" value={editingTutorial?.videoUrl || ''} onChange={(e) => setEditingTutorial({...editingTutorial!, videoUrl: e.target.value})} /> </div> <div className="flex justify-end gap-3 mt-6"> <button onClick={() => setIsTutorialModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button> <GoldButton onClick={handleSaveTutorial} className="px-6 py-2 text-sm">Save</GoldButton> </div> </div> </div> )}
      {isFAQModalOpen && ( <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"> <div className="bg-[#151515] border border-gray-700 rounded-xl p-6 w-full max-w-md"> <h3 className="text-xl font-bold text-white mb-4">Edit FAQ</h3> <div className="space-y-4"> <InputField label="Question" value={editingFAQ?.question || ''} onChange={(e) => setEditingFAQ({...editingFAQ!, question: e.target.value})} /> <div className="space-y-2"> <label className="text-xs font-bold text-gold-400 uppercase">Answer</label> <textarea className="w-full h-32 bg-black border border-gray-700 rounded-lg p-3 text-white text-sm outline-none focus:border-gold-500" value={editingFAQ?.answer || ''} onChange={(e) => setEditingFAQ({...editingFAQ!, answer: e.target.value})} /> </div> <label className="flex items-center gap-2 cursor-pointer"> <input type="checkbox" checked={editingFAQ?.isFeatured || false} onChange={(e) => setEditingFAQ({...editingFAQ!, isFeatured: e.target.checked})} className="accent-gold-500" /> <span className="text-sm text-gray-300">Feature in Knowledge Base</span> </label> </div> <div className="flex justify-end gap-3 mt-6"> <button onClick={() => setIsFAQModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button> <GoldButton onClick={handleSaveFAQ} className="px-6 py-2 text-sm">Save</GoldButton> </div> </div> </div> )}
      {isGameModalOpen && ( <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"> <div className="bg-[#151515] border border-gray-700 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"> <h3 className="text-xl font-bold text-white mb-4">Edit Featured Game</h3> <div className="space-y-4"> <InputField label="Title" value={editingGame?.title || ''} onChange={(e) => setEditingGame({...editingGame!, title: e.target.value})} /> <InputField label="Image URL" value={editingGame?.image || ''} onChange={(e) => setEditingGame({...editingGame!, image: e.target.value})} /> <InputField label="Active Players" value={editingGame?.activePlayers || ''} onChange={(e) => setEditingGame({...editingGame!, activePlayers: e.target.value})} /> <InputField label="Star Rating (0-5)" type="number" step="0.1" value={editingGame?.rating || 0} onChange={(e) => setEditingGame({...editingGame!, rating: Number(e.target.value)})} /> <div className="flex items-center gap-2"> <label className="text-sm text-gold-400 font-bold uppercase w-24">Hot Tag</label> <input type="checkbox" checked={editingGame?.isHot || false} onChange={(e) => setEditingGame({...editingGame!, isHot: e.target.checked})} className="accent-gold-500 w-5 h-5" /> </div> <div className="pt-4 border-t border-gray-800 space-y-4"> <p className="text-xs text-gray-500 font-bold uppercase">Action Links (Optional)</p> <InputField label="Play Link" value={editingGame?.playLink || ''} onChange={(e) => setEditingGame({...editingGame!, playLink: e.target.value})} placeholder="https://..." /> <InputField label="Download Link" value={editingGame?.downloadLink || ''} onChange={(e) => setEditingGame({...editingGame!, downloadLink: e.target.value})} placeholder="https://..." /> <InputField label="Video Link" value={editingGame?.videoLink || ''} onChange={(e) => setEditingGame({...editingGame!, videoLink: e.target.value})} placeholder="https://..." /> </div> </div> <div className="flex justify-end gap-3 mt-6"> <button onClick={() => setIsGameModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button> <GoldButton onClick={handleSaveGame} className="px-6 py-2 text-sm">Save Game</GoldButton> </div> </div> </div> )}
      {isIntroGameModalOpen && ( <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"> <div className="bg-[#151515] border border-gray-700 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"> <h3 className="text-xl font-bold text-white mb-4">Edit Intro Game</h3> <div className="space-y-4"> <InputField label="Title" value={editingIntroGame?.title || ''} onChange={(e) => setEditingIntroGame({...editingIntroGame!, title: e.target.value})} /> <div className="space-y-2"> <label className="text-xs text-gray-400 font-bold uppercase">Description</label> <textarea className="w-full h-32 bg-black border border-gray-700 rounded-lg p-3 text-white text-sm outline-none focus:border-gold-500" value={editingIntroGame?.description || ''} onChange={(e) => setEditingIntroGame({...editingIntroGame!, description: e.target.value})} /> </div> <InputField label="Background Image URL" value={editingIntroGame?.image || ''} onChange={(e) => setEditingIntroGame({...editingIntroGame!, image: e.target.value})} /> <div className="flex items-center gap-2"> <label className="text-sm text-gold-400 font-bold uppercase w-24">Download Button</label> <input type="checkbox" checked={editingIntroGame?.showDownload || false} onChange={(e) => setEditingIntroGame({...editingIntroGame!, showDownload: e.target.checked})} className="accent-gold-500 w-5 h-5" /> </div> <div className="pt-4 border-t border-gray-800 space-y-4"> <InputField label="Play Link" value={editingIntroGame?.playLink || ''} onChange={(e) => setEditingIntroGame({...editingIntroGame!, playLink: e.target.value})} placeholder="https://..." /> <InputField label="Download Link" value={editingIntroGame?.downloadLink || ''} onChange={(e) => setEditingIntroGame({...editingIntroGame!, downloadLink: e.target.value})} placeholder="https://..." /> </div> </div> <div className="flex justify-end gap-3 mt-6"> <button onClick={() => setIsIntroGameModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button> <GoldButton onClick={handleSaveIntroGame} className="px-6 py-2 text-sm">Save Game</GoldButton> </div> </div> </div> )}
      {isStatusModalOpen && ( <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"> <div className="bg-[#151515] border border-gray-700 rounded-xl p-6 w-full max-w-md"> <h3 className="text-xl font-bold text-white mb-4">Edit Platform Status</h3> <div className="space-y-4"> <InputField label="Platform Name" value={editingStatus?.name || ''} onChange={(e) => setEditingStatus({...editingStatus!, name: e.target.value})} /> <InputField label="Icon URL" value={editingStatus?.image || ''} onChange={(e) => setEditingStatus({...editingStatus!, image: e.target.value})} /> <div className="space-y-2"> <label className="text-xs text-gray-400 font-bold uppercase">Current Status</label> <div className="flex gap-2"> <button onClick={() => setEditingStatus({...editingStatus!, status: 'Operational'})} className={`flex-1 py-2 rounded text-xs font-bold ${editingStatus?.status === 'Operational' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'}`}>Operational</button> <button onClick={() => setEditingStatus({...editingStatus!, status: 'Down'})} className={`flex-1 py-2 rounded text-xs font-bold ${editingStatus?.status === 'Down' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}>Down</button> </div> </div> <InputField label="Reason / Details" value={editingStatus?.details || ''} onChange={(e) => setEditingStatus({...editingStatus!, details: e.target.value})} placeholder="e.g. Maintenance, Server Error..." /> </div> <div className="flex justify-end gap-3 mt-6"> <button onClick={() => setIsStatusModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button> <GoldButton onClick={handleSaveStatus} className="px-6 py-2 text-sm">Save Status</GoldButton> </div> </div> </div> )}
      {isSoftwareModalOpen && ( <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"> <div className="bg-[#151515] border border-gray-700 rounded-xl p-6 w-full max-w-md"> <h3 className="text-xl font-bold text-white mb-4">Edit Game Panel Software</h3> <div className="space-y-4"> <InputField label="Software Name" value={editingSoftware?.name || ''} onChange={(e) => setEditingSoftware({...editingSoftware!, name: e.target.value})} /> <InputField label="Icon URL" value={editingSoftware?.image || ''} onChange={(e) => setEditingSoftware({...editingSoftware!, image: e.target.value})} /> <InputField label="Download Link" value={editingSoftware?.downloadUrl || ''} onChange={(e) => setEditingSoftware({...editingSoftware!, downloadUrl: e.target.value})} placeholder="https://..." /> </div> <div className="flex justify-end gap-3 mt-6"> <button onClick={() => setIsSoftwareModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button> <GoldButton onClick={handleSaveSoftware} className="px-6 py-2 text-sm">Save Software</GoldButton> </div> </div> </div> )}

    </div>
  );
};

export default AdminPage;
