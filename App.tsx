
import React, { useState, useEffect, useRef } from 'react';
import ParticleBackground from './components/ParticleBackground';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import DashboardPage from './pages/DashboardPage';
import GamesIntroPage from './pages/GamesIntroPage';
import AdminPage from './pages/AdminPage';
import StatusPage from './pages/StatusPage';
import ProfilePage from './pages/ProfilePage';
import GamePanelPage from './pages/GamePanelPage'; 
import P2PTransferPage from './pages/P2PTransferPage';
import SupportWidget from './components/SupportWidget';
import DepositPage from './pages/DepositPage';
import WithdrawPage from './pages/WithdrawPage';
import TutorialsPage from './pages/TutorialsPage';
import InfoPage from './pages/InfoPage';
import Footer from './components/Footer'; 
import { User, ViewState, SiteConfig, AdminRole } from './types';
import { Menu, X, User as UserIcon, Crown, EyeOff, LogOut, LayoutDashboard, Lock, ChevronDown, RefreshCcw, MessageCircle, Wallet, ArrowUpRight } from 'lucide-react';
import { GoldButton } from './components/UI';
import { initFirebase } from './firebaseClient';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, getDoc } from 'firebase/firestore'; 
import { useResponsiveImage } from './hooks/useResponsiveImage';

// Default Configuration
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

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.AUTH);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [previewConfig, setPreviewConfig] = useState<SiteConfig | null>(null);
  const [showAdminReturnPin, setShowAdminReturnPin] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminPinError, setAdminPinError] = useState('');
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [showBalanceMenu, setShowBalanceMenu] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);

  const activeConfig = previewConfig || siteConfig;
  const { getResponsiveStyle: getMobileSidebarBgStyle } = useResponsiveImage(activeConfig.mobileSidebarBg);
  
  // Fix for Admin Logout Loop: Track user state in ref to access inside closure
  const userRef = useRef<User | null>(null);

  // Update ref whenever user state changes
  useEffect(() => {
      userRef.current = user;
  }, [user]);

  // Track scroll position for Header visibility
  useEffect(() => {
      const handleScroll = () => {
          setScrollY(window.scrollY);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
      const storedConfig = localStorage.getItem('site_config');
      if (storedConfig) {
          try {
            const parsed = JSON.parse(storedConfig);
            const merged = { 
                ...DEFAULT_CONFIG, 
                ...parsed,
                tutorials: parsed.tutorials || DEFAULT_CONFIG.tutorials, 
                aiConfig: parsed.aiConfig || DEFAULT_CONFIG.aiConfig,
                supportContact: parsed.supportContact || DEFAULT_CONFIG.supportContact,
                gamePanelRules: parsed.gamePanelRules || DEFAULT_CONFIG.gamePanelRules,
                introGames: parsed.introGames || DEFAULT_CONFIG.introGames,
                mobileAuthCircleImages: parsed.mobileAuthCircleImages || DEFAULT_CONFIG.mobileAuthCircleImages,
                mobileAuthBg: parsed.mobileAuthBg || DEFAULT_CONFIG.mobileAuthBg,
                mobileSidebarBg: parsed.mobileSidebarBg || DEFAULT_CONFIG.mobileSidebarBg,
                mobileHeroLeftDecor: parsed.mobileHeroLeftDecor || DEFAULT_CONFIG.mobileHeroLeftDecor,
                mobileHeroRightDecor: parsed.mobileHeroRightDecor || DEFAULT_CONFIG.mobileHeroRightDecor,
                mobileHeroWelcomeChar: parsed.mobileHeroWelcomeChar || DEFAULT_CONFIG.mobileHeroWelcomeChar,
                mobileHeroTextScale: parsed.mobileHeroTextScale || DEFAULT_CONFIG.mobileHeroTextScale,
                socialLinks: parsed.socialLinks || DEFAULT_CONFIG.socialLinks,
                webhooks: parsed.webhooks || DEFAULT_CONFIG.webhooks,
                cashFlow: parsed.cashFlow || DEFAULT_CONFIG.cashFlow,
                tabletAuthHostess: parsed.tabletAuthHostess || DEFAULT_CONFIG.tabletAuthHostess,
                tabletAuthBg: parsed.tabletAuthBg || DEFAULT_CONFIG.tabletAuthBg,
                tabletHeroBg: parsed.tabletHeroBg || DEFAULT_CONFIG.tabletHeroBg,
                tabletHeroWelcomeChar: parsed.tabletHeroWelcomeChar || DEFAULT_CONFIG.tabletHeroWelcomeChar,
            };
            
            if (!merged.platformStatus || merged.platformStatus.length === 0) {
                merged.platformStatus = [
                    { id: 'backend-issue-1', name: 'Game Server Node 1', image: 'https://cdn-icons-png.flaticon.com/512/2282/2282245.png', status: 'Down', details: 'Backend problem' }
                ];
            }
            setSiteConfig(merged);
          } catch (e) { console.error("Failed to parse site config", e); }
      }
  }, []);

  // Firebase Auth Listener & RBAC Logic
  useEffect(() => {
      const fb = initFirebase();
      if (fb) {
          let unsubscribeUserDoc: (() => void) | null = null;
          const unsubscribeAuth = onAuthStateChanged(fb.auth, async (firebaseUser) => {
              if (firebaseUser) {
                  if (!firebaseUser.emailVerified && firebaseUser.email !== 'ashaanzaman7@gmail.com') {
                      await signOut(fb.auth);
                      return;
                  }
                  const userDocRef = doc(fb.db, "users", firebaseUser.uid);
                  unsubscribeUserDoc = onSnapshot(userDocRef, (docSnap) => {
                      if (docSnap.exists()) {
                          const userData = docSnap.data();
                          
                          // Construct user object
                          const updatedUser: User = {
                              id: firebaseUser.uid,
                              email: firebaseUser.email || '',
                              name: userData.name || firebaseUser.displayName || 'Player',
                              playerId: userData.playerId || 'EP-UNKNOWN',
                              balance: userData.balance || 0.00,
                              photoURL: userData.photoURL || '',
                              phone: userData.phone || '',
                              country: userData.country || '',
                              profileCardBg: userData.profileCardBg || '',
                              createdAt: userData.createdAt || new Date().toISOString(),
                              // RBAC Fields
                              role: userData.role || 'Peasant',
                              adminPermissions: userData.adminPermissions || [],
                              adminPin: userData.adminPin || ''
                          };
                          
                          // Hardcode Emperor for master email
                          if (updatedUser.email === 'ashaanzaman7@gmail.com') {
                              updatedUser.role = 'Emperor';
                              updatedUser.adminPermissions = ['all'];
                          }

                          setUser(updatedUser);
                      } else {
                          setUser({
                              id: firebaseUser.uid,
                              email: firebaseUser.email || '',
                              name: firebaseUser.displayName || 'Player',
                              playerId: 'EP-PENDING',
                              balance: 0.00,
                              photoURL: '',
                              createdAt: new Date().toISOString()
                          });
                      }
                  });
                  
                  // Redirect if coming from Auth and user is admin
                  if (currentView === ViewState.AUTH) {
                      setCurrentView(ViewState.HOME);
                  }
              } else {
                  if (unsubscribeUserDoc) unsubscribeUserDoc();
                  
                  // === CRITICAL FIX: MASTER ADMIN BYPASS ===
                  // If the current local user is the Master Admin (Emperor), do NOT listen to the null signal from Firebase.
                  // This prevents the app from logging you out when Firebase connects but finds no corresponding cloud user.
                  if (userRef.current?.email === 'ashaanzaman7@gmail.com') {
                      console.log("Ignoring Firebase logout: Master Admin active locally.");
                      return;
                  }

                  setUser(null);
                  if (currentView !== ViewState.AUTH && currentView !== ViewState.ABOUT && currentView !== ViewState.GAMES_INTRO && currentView !== ViewState.BLOG && currentView !== ViewState.FAQ_PAGE && currentView !== ViewState.PRIVACY && currentView !== ViewState.TERMS && currentView !== ViewState.AML && currentView !== ViewState.RESPONSIBLE) {
                    setCurrentView(ViewState.AUTH);
                  }
              }
          });
          return () => { if (unsubscribeUserDoc) unsubscribeUserDoc(); unsubscribeAuth(); };
      }
  }, [currentView]);

  const handleLogin = (email: string, name: string) => { 
      // Simulation for testing logic without full firebase
      if (email.toLowerCase() === 'ashaanzaman7@gmail.com') { 
          setUser({ 
              id: 'admin', 
              playerId: 'EMPEROR', 
              email: 'ashaanzaman7@gmail.com', 
              name: 'The Emperor', 
              balance: 999999, 
              createdAt: new Date().toISOString(),
              role: 'Emperor',
              adminPermissions: ['all']
          }); 
          setCurrentView(ViewState.ADMIN_DASHBOARD); 
          return; 
      } 
      
      // Placeholder User
      const newUser: User = { 
          id: '123', 
          playerId: `EP-${Math.floor(100000 + Math.random() * 900000)}`, 
          email, 
          name, 
          balance: 0.00, 
          createdAt: new Date().toISOString() 
      }; 
      setUser(newUser); 
      setCurrentView(ViewState.HOME); 
  };
  
  const handleLogout = async () => {
    const fb = initFirebase();
    if (fb) {
      await signOut(fb.auth);
    }
    setUser(null);
    setCurrentView(ViewState.AUTH);
  };

  const handlePreviewMode = (config: SiteConfig) => {
    setPreviewConfig(config);
    setCurrentView(ViewState.HOME); // Force navigation to the Home View for preview
  };

  const cancelPreview = () => {
    setPreviewConfig(null);
  };

  const handleReturnToAdmin = () => { 
      // Check for User's personal PIN if set in DB, otherwise check local storage backup
      if (user?.adminPin) {
           setShowAdminReturnPin(true); 
      } else {
          // Fallback to global pin logic for master admin if not set in user profile
          const storedAuth = JSON.parse(localStorage.getItem("emperial_admin_auth") || 'null'); 
          if (storedAuth && storedAuth.pin) { 
              setShowAdminReturnPin(true); 
          } else { 
              setCurrentView(ViewState.ADMIN_DASHBOARD); 
          } 
      }
  };

  const verifyAdminReturnPin = (e: React.FormEvent) => { 
      e.preventDefault(); 
      
      // Check User's Personal PIN First
      if (user?.adminPin) {
          if (user.adminPin === adminPinInput) {
               setShowAdminReturnPin(false); setAdminPinInput(''); setAdminPinError(''); setCurrentView(ViewState.ADMIN_DASHBOARD);
               return;
          }
      }

      // Fallback to global pin
      const storedAuth = JSON.parse(localStorage.getItem("emperial_admin_auth") || 'null'); 
      if (storedAuth && storedAuth.pin === adminPinInput) { 
          setShowAdminReturnPin(false); setAdminPinInput(''); setAdminPinError(''); setCurrentView(ViewState.ADMIN_DASHBOARD); 
      } else { 
          setAdminPinError('Incorrect PIN'); setAdminPinInput(''); 
      } 
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewState.AUTH:
        return (
            <AuthPage 
                onLogin={handleLogin} 
                onNavigate={setCurrentView} 
                hostessConfig={activeConfig.authHostess} 
                mobileHostessConfig={activeConfig.mobileAuthHostess}
                tabletHostessConfig={activeConfig.tabletAuthHostess} // Pass tablet prop
                bgConfig={activeConfig.authBg} 
                mobileBgConfig={activeConfig.mobileAuthBg}
                tabletBgConfig={activeConfig.tabletAuthBg} // Pass tablet prop
                authCircleImages={activeConfig.authCircleImages} 
                mobileAuthCircleImages={activeConfig.mobileAuthCircleImages} 
            />
        );
      case ViewState.ABOUT:
        return <AboutPage onNavigate={setCurrentView} heroLeftConfig={activeConfig.aboutHeroLeft} closingRightConfig={activeConfig.aboutClosingRight} aboutPassionImg={activeConfig.aboutPassionImg} />;
      case ViewState.GAMES_INTRO:
        return <GamesIntroPage onNavigate={setCurrentView} introGames={activeConfig.introGames} />; 
      case ViewState.DASHBOARD:
        return user ? <DashboardPage user={user} onLogout={handleLogout} onNavigate={setCurrentView} onSupportOpen={() => setIsSupportOpen(true)} bgConfig={activeConfig.dashboardBg} /> : null;
      case ViewState.PROFILE: 
        return user ? <ProfilePage user={user} onNavigate={setCurrentView} bgConfig={activeConfig.profileBg} peekingImgConfig={activeConfig.profileCardPeekingImg} /> : null;
      case ViewState.GAME_PANEL:
        return user ? ( 
            <GamePanelPage 
                user={user} 
                onNavigate={setCurrentView} 
                bgConfig={activeConfig.gamePanelBg} 
                webhookUrl={activeConfig.webhookUrl} 
                resetWebhookUrl={activeConfig.resetWebhookUrl} 
                transactionWebhookUrl={activeConfig.transactionWebhookUrl} 
                softwareList={activeConfig.gamePanelSoftware} 
                telegramConfig={activeConfig.telegram}
                rules={activeConfig.gamePanelRules}
                onSupportOpen={() => setIsSupportOpen(true)}
                warningChar={activeConfig.gamePanelWarningChar}
            /> 
        ) : null;
      case ViewState.ADMIN_DASHBOARD:
        // Ensure AdminPage receives user prop for RBAC
        return <AdminPage user={user} onNavigate={setCurrentView} onLogout={handleLogout} onPreview={handlePreviewMode} />;
      case ViewState.STATUS:
        return <StatusPage onNavigate={setCurrentView} statusList={activeConfig.platformStatus} bgConfig={activeConfig.statusBg} />;
      case ViewState.P2P_TRANSFER:
        return user ? <P2PTransferPage user={user} onNavigate={setCurrentView} /> : null;
      case ViewState.DEPOSIT:
        // Pass CashFlow Config to Deposit Page so it has keys
        return user ? <DepositPage user={user} onNavigate={setCurrentView} cashFlowConfig={activeConfig.cashFlow} /> : null;
      case ViewState.WITHDRAW:
        return user ? <WithdrawPage onNavigate={setCurrentView} /> : null;
      case ViewState.TUTORIALS:
        return user ? <TutorialsPage onNavigate={setCurrentView} tutorials={activeConfig.tutorials} /> : null;
      case ViewState.PRIVACY:
      case ViewState.TERMS:
      case ViewState.AML:
      case ViewState.RESPONSIBLE:
      case ViewState.BLOG:
      case ViewState.FAQ_PAGE:
        return <InfoPage view={currentView} onNavigate={setCurrentView} isLoggedIn={!!user} />;
      case ViewState.HOME:
      default:
        return user ? (
            <HomePage 
                user={user} 
                onNavigate={setCurrentView} 
                heroBgConfig={activeConfig.homeHeroBg} 
                tabletHeroBg={activeConfig.tabletHeroBg} // Pass new tablet bg
                featuredGames={activeConfig.featuredGames} 
                heroLeftChar={activeConfig.heroLeftChar} 
                heroRightChar={activeConfig.heroRightChar} 
                heroWelcomeChar={activeConfig.heroWelcomeChar} 
                tabletWelcomeChar={activeConfig.tabletHeroWelcomeChar} // Pass new tablet char
                featuredGameLeftChar={activeConfig.featuredGameLeftChar} 
                featuredGameRightChar={activeConfig.featuredGameRightChar} 
                howItWorksBg={activeConfig.howItWorksBg} 
                fishSectionBg={activeConfig.fishSectionBg} 
                fishSectionLeftChar={activeConfig.fishSectionLeftChar}
                featuredGamesBg={activeConfig.featuredGamesBg}
                whyChooseBg={activeConfig.whyChooseBg}
                
                // Pass new mobile hero props
                mobileHeroWelcomeChar={activeConfig.mobileHeroWelcomeChar}
                mobileHeroLeftDecor={activeConfig.mobileHeroLeftDecor}
                mobileHeroRightDecor={activeConfig.mobileHeroRightDecor}
                mobileHeroTextScale={activeConfig.mobileHeroTextScale}
            />
        ) : null;
    }
  };

  // Logic to show/hide header based on scroll on HOME page only OR if hovered
  const isHeaderVisible = true; 

  return (
    <div className="relative min-h-screen bg-black text-white font-sans overflow-hidden">
      <ParticleBackground />
      
      {currentView !== ViewState.AUTH && (
          <SupportWidget config={activeConfig} isOpen={isSupportOpen} onOpen={() => setIsSupportOpen(true)} onClose={() => setIsSupportOpen(false)} />
      )}

      {previewConfig && (
          <div className="fixed top-0 left-0 w-full z-[100] pointer-events-none flex justify-center">
              <div className="bg-red-600 text-white text-xs font-bold px-4 py-1 rounded-b-lg shadow-lg animate-pulse pointer-events-auto flex items-center gap-4">
                  <span>PREVIEW MODE ACTIVE</span>
                  <button onClick={cancelPreview} className="bg-white text-red-600 px-3 py-1 rounded hover:bg-gray-100 flex items-center gap-1"><EyeOff size={14} /> EXIT PREVIEW</button>
              </div>
          </div>
      )}

      {user && currentView !== ViewState.ADMIN_DASHBOARD && (
        <>
          <nav 
            className={`fixed top-0 left-0 w-full z-50 bg-[#121212]/95 backdrop-blur-md border-b border-gold-600/30 h-14 md:h-20 flex items-center justify-between px-6 lg:px-12 shadow-lg transition-transform duration-500`}
          >
            <div className="flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform" onClick={() => setCurrentView(ViewState.HOME)}>
              <Crown className="text-gold-500 w-6 h-6 md:w-8 md:h-8 drop-shadow-md" />
              <span className="font-cinzel font-bold text-lg md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-200 to-gold-500">EMPERIAL SLOTS</span>
            </div>

            <div className="hidden lg:flex items-center gap-8">
              {(user.id === 'admin' || (user.role && user.role !== 'Peasant')) && (
                 <button onClick={handleReturnToAdmin} className="flex items-center gap-2 text-gold-400 bg-black/50 px-3 py-1 rounded border border-gold-600/50 font-bold text-xs"><LayoutDashboard size={14} /> Back to Admin</button>
              )}
              <button onClick={() => setCurrentView(ViewState.HOME)} className={`${currentView === ViewState.HOME ? 'text-gold-400' : 'text-gray-400'} hover:text-gold-300 transition-colors font-cinzel text-sm`}>HOME</button>
              <button onClick={() => setCurrentView(ViewState.GAME_PANEL)} className={`${currentView === ViewState.GAME_PANEL ? 'text-gold-400' : 'text-gray-400'} hover:text-gold-300 transition-colors font-cinzel text-sm`}>GAME PANEL</button>
              <button onClick={() => setCurrentView(ViewState.PROFILE)} className={`${currentView === ViewState.PROFILE ? 'text-gold-400' : 'text-gray-400'} hover:text-gold-300 transition-colors font-cinzel text-sm uppercase`}>Profile</button>
              <button onClick={() => setCurrentView(ViewState.DASHBOARD)} className={`${currentView === ViewState.DASHBOARD ? 'text-gold-400' : 'text-gray-400'} hover:text-gold-300 transition-colors font-cinzel text-sm`}>DASHBOARD</button>
              <button onClick={() => setCurrentView(ViewState.STATUS)} className={`${currentView === ViewState.STATUS ? 'text-gold-400' : 'text-gray-400'} hover:text-gold-300 transition-colors font-cinzel text-sm`}>STATUS</button>
              <button onClick={() => setCurrentView(ViewState.TUTORIALS)} className={`${currentView === ViewState.TUTORIALS ? 'text-gold-400' : 'text-gray-400'} hover:text-gold-300 transition-colors font-cinzel text-sm`}>TUTORIALS</button>
              <button onClick={() => setIsSupportOpen(true)} className={`text-gray-400 hover:text-gold-300 transition-colors font-cinzel text-sm uppercase flex items-center gap-1`}><MessageCircle size={16} /> CONTACT US</button>
              <div className="h-6 w-px bg-gold-600/30" />
              
              <div className="relative">
                  <button onClick={() => setShowBalanceMenu(!showBalanceMenu)} className="flex items-center gap-3 bg-gold-900/20 px-4 py-2 rounded-full border border-gold-600/30 hover:bg-gold-900/40 transition-colors">
                     <div className="text-right"><div className="text-xs text-gray-400">Balance</div><div className="text-gold-400 font-bold text-sm">${user.balance.toLocaleString()}</div></div>
                     <UserIcon size={24} className="text-gold-500" />
                     <ChevronDown size={16} className="text-gray-500" />
                  </button>
                  {showBalanceMenu && (
                      <div className="absolute top-full right-0 mt-2 w-48 bg-[#151515] border border-gold-600/30 rounded-xl shadow-xl overflow-hidden z-50 animate-fade-in">
                          <button onClick={() => { setShowBalanceMenu(false); setCurrentView(ViewState.DEPOSIT); }} className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gold-500/10 hover:text-gold-400 border-b border-gray-800">Deposit</button>
                          <button onClick={() => { setShowBalanceMenu(false); setCurrentView(ViewState.WITHDRAW); }} className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gold-500/10 hover:text-gold-400 border-b border-gray-800">Withdraw</button>
                          <button onClick={() => { setShowBalanceMenu(false); setCurrentView(ViewState.P2P_TRANSFER); }} className="w-full text-left px-4 py-3 text-sm text-gold-400 hover:bg-gold-500/10 font-bold flex items-center gap-2"><RefreshCcw size={14} /> P2P Transfer</button>
                      </div>
                  )}
              </div>
              <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors font-cinzel text-sm border border-red-900/30 px-3 py-2 rounded-lg"><LogOut size={18} /></button>
            </div>

            {/* Mobile Hamburger Toggle */}
            <button className="lg:hidden text-gold-400 z-[60] relative" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X /> : <Menu />}
            </button>
          </nav>

          {/* MOBILE SIDEBAR NAVIGATION */}
          {isMenuOpen && (
            <>
                {/* Backdrop Overlay */}
                <div 
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
                    onClick={() => setIsMenuOpen(false)}
                ></div>

                {/* Collapsible Sidebar (Left Side Drawer) */}
                <div className="fixed top-0 left-0 h-full w-[75%] md:w-1/2 bg-[#121212] border-r border-gold-600/30 z-50 lg:hidden flex flex-col shadow-2xl animate-fade-in transform transition-transform overflow-hidden">
                    {/* Background Image for Sidebar */}
                    {activeConfig.mobileSidebarBg?.url && (
                        <div className="absolute inset-0 z-0">
                            <img 
                                src={activeConfig.mobileSidebarBg.url} 
                                alt="Sidebar BG" 
                                className="w-full h-full object-cover"
                                style={getMobileSidebarBgStyle()} 
                            />
                            <div className="absolute inset-0 bg-black/80"></div>
                        </div>
                    )}

                    <div className="relative z-10 flex flex-col h-full pt-16">
                        {/* Profile Section at Top */}
                        <div className="p-6 border-b border-gray-800/50 bg-gradient-to-b from-transparent to-black/20">
                            <div className="flex items-center gap-4 mb-4">
                                {user.photoURL ? (
                                    <img src={user.photoURL} className="w-14 h-14 rounded-full border-2 border-gold-500 object-cover" alt="Profile" />
                                ) : (
                                    <div className="w-14 h-14 bg-gold-600 rounded-full flex items-center justify-center text-black font-bold font-cinzel text-xl border-2 border-gold-400">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <p className="text-white font-bold text-lg leading-tight">{user.name}</p>
                                    <p className="text-gold-500 text-sm font-mono mt-1 tracking-wide">${user.balance.toLocaleString()}</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <button onClick={() => { setCurrentView(ViewState.DEPOSIT); setIsMenuOpen(false); }} className="flex items-center justify-center gap-2 bg-green-900/40 border border-green-500/30 text-green-400 py-2 rounded-lg text-sm font-bold hover:bg-green-900/60 transition-colors">
                                    <Wallet size={16} /> Deposit
                                </button>
                                <button onClick={() => { setCurrentView(ViewState.WITHDRAW); setIsMenuOpen(false); }} className="flex items-center justify-center gap-2 bg-red-900/40 border border-red-500/30 text-red-400 py-2 rounded-lg text-sm font-bold hover:bg-red-900/60 transition-colors">
                                    <ArrowUpRight size={16} /> Withdraw
                                </button>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                            {(user.id === 'admin' || (user.role && user.role !== 'Peasant')) && (
                                <button onClick={() => { handleReturnToAdmin(); setIsMenuOpen(false); }} className="w-full text-left py-3 px-4 rounded-lg text-gold-400 hover:bg-white/5 font-cinzel font-bold border border-gold-600/20 mb-2 bg-gold-900/10">
                                    Back to Admin
                                </button>
                            )}
                            <button onClick={() => { setCurrentView(ViewState.HOME); setIsMenuOpen(false); }} className="w-full text-left py-3 px-4 rounded-lg text-white hover:bg-white/10 font-cinzel border-l-2 border-transparent hover:border-gold-500 transition-all">Home</button>
                            <button onClick={() => { setCurrentView(ViewState.GAME_PANEL); setIsMenuOpen(false); }} className="w-full text-left py-3 px-4 rounded-lg text-white hover:bg-white/10 font-cinzel border-l-2 border-transparent hover:border-gold-500 transition-all">Game Panel</button>
                            <button onClick={() => { setCurrentView(ViewState.PROFILE); setIsMenuOpen(false); }} className="w-full text-left py-3 px-4 rounded-lg text-white hover:bg-white/10 font-cinzel border-l-2 border-transparent hover:border-gold-500 transition-all">Player Profile</button>
                            <button onClick={() => { setCurrentView(ViewState.DASHBOARD); setIsMenuOpen(false); }} className="w-full text-left py-3 px-4 rounded-lg text-white hover:bg-white/10 font-cinzel border-l-2 border-transparent hover:border-gold-500 transition-all">Dashboard</button>
                            <button onClick={() => { setCurrentView(ViewState.STATUS); setIsMenuOpen(false); }} className="w-full text-left py-3 px-4 rounded-lg text-white hover:bg-white/10 font-cinzel border-l-2 border-transparent hover:border-gold-500 transition-all">Status</button>
                            <button onClick={() => { setCurrentView(ViewState.TUTORIALS); setIsMenuOpen(false); }} className="w-full text-left py-3 px-4 rounded-lg text-white hover:bg-white/10 font-cinzel border-l-2 border-transparent hover:border-gold-500 transition-all">Tutorials</button>
                            <button onClick={() => { setCurrentView(ViewState.P2P_TRANSFER); setIsMenuOpen(false); }} className="w-full text-left py-3 px-4 rounded-lg text-gold-200 hover:bg-white/10 font-cinzel font-bold border-l-2 border-transparent hover:border-gold-500 transition-all">P2P Transfer</button>
                            <button onClick={() => { setIsSupportOpen(true); setIsMenuOpen(false); }} className="w-full text-left py-3 px-4 rounded-lg text-white hover:bg-white/10 font-cinzel border-l-2 border-transparent hover:border-gold-500 transition-all flex items-center gap-2"><MessageCircle size={18} /> Contact Us</button>
                        </div>

                        {/* Logout at Bottom */}
                        <div className="p-6 border-t border-gray-800/50">
                            <button onClick={handleLogout} className="w-full py-3 border border-red-900/50 rounded-lg text-red-500 hover:bg-red-900/10 font-cinzel text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                                <LogOut size={16} /> Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </>
          )}
          
          {/* Conditional padding for Hero view vs others */}
          <div className={currentView === ViewState.HOME ? '' : 'pt-20'}>{renderContent()}</div>
        </>
      )}

      {(!user || currentView === ViewState.ADMIN_DASHBOARD) && renderContent()}
      
      {/* Footer (Hidden on Login and specific pages like Games Intro/About) */}
      {currentView !== ViewState.AUTH && currentView !== ViewState.GAMES_INTRO && currentView !== ViewState.ABOUT && (
          <Footer onNavigate={setCurrentView} bgConfig={activeConfig.footerBg} rightCharConfig={activeConfig.footerRightChar} socialLinks={activeConfig.socialLinks} />
      )}

      {/* Admin Pin Logic... */}
      {showAdminReturnPin && (
          <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-[#121212] border border-gold-600 rounded-xl p-8 w-full max-w-sm text-center shadow-gold-glow">
                  <Lock className="w-12 h-12 text-gold-500 mx-auto mb-4" /><h3 className="text-xl font-cinzel font-bold text-gold-200 mb-6">Admin Access Required</h3>
                  <form onSubmit={verifyAdminReturnPin}>
                      <input type="password" maxLength={6} placeholder="Enter PIN" className="w-full bg-black border border-gold-600/50 rounded-lg py-3 px-4 text-center text-xl text-white outline-none mb-4" value={adminPinInput} onChange={(e) => setAdminPinInput(e.target.value)} autoFocus />
                      {adminPinError && <p className="text-red-500 text-sm mb-4">{adminPinError}</p>}
                      <div className="flex gap-3"><button type="button" onClick={() => setShowAdminReturnPin(false)} className="flex-1 py-2 text-gray-400 hover:text-white">Cancel</button><GoldButton type="submit" className="flex-1 py-2 text-sm">Verify</GoldButton></div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default App;
