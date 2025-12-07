
import React, { useRef, useState, useEffect } from 'react';
import { User, Game, ImageSettings, ViewState } from '../types';
import { GoldButton, FeatureTile } from '../components/UI';
import { Copy, Bitcoin, Star, Shield, Headphones, Play, Download, Video, Flame, Users, UserPlus, Gamepad2, ArrowUpRight, Zap, Trophy } from 'lucide-react';
import { useResponsiveImage } from '../hooks/useResponsiveImage';

interface HomePageProps {
  user: User;
  onNavigate: (view: ViewState) => void;
  heroBgConfig?: ImageSettings;
  tabletHeroBg?: ImageSettings; // NEW
  featuredGames?: Game[];
  
  heroLeftChar?: ImageSettings;
  heroRightChar?: ImageSettings;
  heroWelcomeChar?: ImageSettings;
  tabletWelcomeChar?: ImageSettings; // NEW

  featuredGameLeftChar?: ImageSettings;
  featuredGameRightChar?: ImageSettings;
  howItWorksBg?: ImageSettings;
  fishSectionBg?: ImageSettings;
  fishSectionLeftChar?: ImageSettings;
  featuredGamesBg?: ImageSettings;
  whyChooseBg?: ImageSettings;
  
  // Mobile Props
  mobileHeroWelcomeChar?: ImageSettings;
  mobileHeroLeftDecor?: ImageSettings;
  mobileHeroRightDecor?: ImageSettings;
  mobileHeroTextScale?: number;
}

const HomePage: React.FC<HomePageProps> = ({ 
    user, onNavigate, 
    heroBgConfig, tabletHeroBg,
    featuredGames, heroLeftChar, heroRightChar, 
    heroWelcomeChar, tabletWelcomeChar,
    featuredGameLeftChar, featuredGameRightChar, howItWorksBg, fishSectionBg, fishSectionLeftChar, featuredGamesBg, whyChooseBg,
    mobileHeroWelcomeChar, mobileHeroLeftDecor, mobileHeroRightDecor, mobileHeroTextScale = 1
}) => {
  
  const [bgOpacity, setBgOpacity] = useState(1);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Responsive Hooks
  const { getResponsiveStyle: getHeroBgStyle } = useResponsiveImage(heroBgConfig);
  const { getResponsiveStyle: getTabletHeroBgStyle } = useResponsiveImage(tabletHeroBg);
  
  const { getResponsiveStyle: getHeroLeftStyle } = useResponsiveImage(heroLeftChar);
  const { getResponsiveStyle: getHeroRightStyle } = useResponsiveImage(heroRightChar);
  
  const { getResponsiveStyle: getWelcomeStyle } = useResponsiveImage(heroWelcomeChar);
  const { getResponsiveStyle: getTabletWelcomeStyle } = useResponsiveImage(tabletWelcomeChar);
  
  const { getResponsiveStyle: getMobileWelcomeStyle } = useResponsiveImage(mobileHeroWelcomeChar);
  const { getResponsiveStyle: getMobileLeftDecorStyle } = useResponsiveImage(mobileHeroLeftDecor);
  const { getResponsiveStyle: getMobileRightDecorStyle } = useResponsiveImage(mobileHeroRightDecor);
  
  const { getResponsiveStyle: getFeaturedBgStyle } = useResponsiveImage(featuredGamesBg);
  const { getResponsiveStyle: getFeaturedLeftStyle } = useResponsiveImage(featuredGameLeftChar);
  const { getResponsiveStyle: getFeaturedRightStyle } = useResponsiveImage(featuredGameRightChar);
  
  const { getResponsiveStyle: getHowItWorksBgStyle } = useResponsiveImage(howItWorksBg);
  
  const { getResponsiveStyle: getFishBgStyle } = useResponsiveImage(fishSectionBg);
  const { getResponsiveStyle: getFishLeftStyle } = useResponsiveImage(fishSectionLeftChar);
  
  const { getResponsiveStyle: getWhyChooseBgStyle } = useResponsiveImage(whyChooseBg);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      
      const fadeThreshold = 800; 
      const distanceToBottom = rect.bottom;

      if (distanceToBottom < fadeThreshold) {
         const newOpacity = Math.max(0, (distanceToBottom - 100) / (fadeThreshold - 100));
         setBgOpacity(newOpacity);
      } else {
         setBgOpacity(1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const defaultGames = [
    { 
      id: '1', 
      title: 'Royal Slots', 
      image: 'https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?q=80&w=1887&auto=format&fit=crop', 
      isHot: true,
      rating: 4.8,
      activePlayers: '12.5K'
    },
    { 
      id: '2', 
      title: 'Golden Poker', 
      image: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?q=80&w=2073&auto=format&fit=crop',
      isHot: true,
      rating: 4.9,
      activePlayers: '18.2K'
    }
  ];

  const gamesToDisplay = featuredGames && featuredGames.length > 0 ? featuredGames : defaultGames;

  const features = [
    { title: "Elite Security", description: "State-of-the-art encryption keeps your treasury safe.", icon: <Shield size={32} /> },
    { title: "VIP Support", description: "24/7 concierge service for all your gaming needs.", icon: <Headphones size={32} /> },
    { title: "Instant Payouts", description: "Withdraw your winnings with lightning speed.", icon: <Bitcoin size={32} /> },
    { title: "Exclusive Games", description: "Access titles found only in the Empire.", icon: <Star size={32} /> },
    { title: "Fair Play Certified", description: "RNG certified algorithms for 100% transparent odds.", icon: <Trophy size={32} /> },
    { title: "High Performance", description: "Zero lag experience across all devices.", icon: <Zap size={32} /> },
  ];

  const scrollingFeatures = [...features, ...features, ...features];

  const howItWorksSteps = [
    {
      title: "Create Account & Setup",
      icon: <UserPlus size={20} />,
      points: [
        "Register for an account.",
        "After approval, login in.",
        "Download the games if the software is app based."
      ]
    },
    {
      title: "Deposit Funds",
      icon: <Bitcoin size={20} />,
      points: [
        "To deposit, click on the balance on the top right. Then click deposit to go to the deposit page.",
        "Enter the amount you want to deposit in USD, and then click on submit. The system will calculate the equivalent amount in Bitcoin for you to make the payment.",
        "Send Bitcoin to the wallet address provided in order to fund your account."
      ]
    },
    {
      title: "Transfer & Play",
      icon: <Gamepad2 size={20} />,
      points: [
        "After you complete the deposit, you can use the balance to transfer credits to any game software.",
        "Go to the “Transfer Credits” page and choose the game software you want to add credits to and the amount.",
        "Go to the “Gaming Accounts” page to find each of your gaming accounts usernames and passwords.",
        "Now you can enjoy playing the games!"
      ]
    },
    {
      title: "Redeem & Withdraw",
      icon: <ArrowUpRight size={20} />,
      points: [
        "When you are ready to redeem, go to the “Redeem Credits” page and select the gaming account you want to redeem from. Type in the amount.",
        "After the redeem has been approved, the funds will be ready in your account balance to be withdrawn.",
        "Click “Withdraw”. Go to the “Withdrawal” page or click on your account balance on the top right.",
        "Enter Your Bitcoin wallet and the amount you want to withdraw."
      ]
    }
  ];

  const renderGameCard = (game: Game) => (
       <div className="group relative bg-[#0F0F0F] border border-gold-600/30 rounded-2xl overflow-hidden hover:border-gold-500 transition-all duration-500 hover:shadow-gold-glow flex flex-col w-full h-[250px] md:h-[480px] md:max-w-[350px]">
        <div className="h-[65%] w-full relative overflow-hidden">
            <img 
            src={game.image} 
            alt={game.title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-transparent to-transparent opacity-60"></div>
            
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 duration-300">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gold-500/90 flex items-center justify-center animate-bounce shadow-gold-glow">
                <Play fill="black" className="ml-1 w-6 h-6 md:w-8 md:h-8 text-black"/>
                </div>
            </div>

            {game.isHot && (
                <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-gradient-to-r from-red-600 to-red-800 text-white text-[10px] md:text-xs font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 animate-pulse">
                <Flame size={12} className="md:w-3.5 md:h-3.5" fill="currentColor" /> HOT
                </div>
            )}
            
            {game.rating && (
                <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-black/80 backdrop-blur-sm border border-gold-500/30 text-gold-400 text-[10px] md:text-xs font-bold px-2 py-1 md:px-2.5 md:py-1.5 rounded-lg shadow-lg flex items-center gap-1.5">
                <Star size={12} className="md:w-3.5 md:h-3.5" fill="currentColor" /> {game.rating}
                </div>
            )}
        </div>

        <div className="flex-1 p-3 md:p-5 flex flex-col justify-between relative z-10 bg-[#0F0F0F]">
            <div>
                <h3 className="text-gold-100 font-cinzel font-bold text-sm md:text-2xl mb-1 md:mb-2 truncate group-hover:text-gold-400 transition-colors">
                {game.title}
                </h3>
                {game.activePlayers && (
                <p className="text-gray-400 text-[10px] md:text-sm flex items-center gap-1 md:gap-2">
                    <Users size={12} className="md:w-3.5 md:h-3.5 text-gold-600" />
                    <span>{game.activePlayers} players</span>
                </p>
                )}
            </div>

            <div className="flex items-center gap-2 md:gap-3 mt-2 md:mt-4">
                <button className="p-2 md:p-3 rounded-lg md:rounded-xl bg-black border border-gray-800 text-gray-400 hover:text-gold-400 hover:border-gold-500 transition-all hover:bg-gold-900/20" title="Watch Trailer">
                    <Video size={16} className="md:w-[20px] md:h-[20px]" />
                </button>

                <button className="flex-1 bg-gradient-to-r from-gold-500 to-gold-400 text-black font-cinzel font-bold py-2 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm uppercase tracking-wider hover:shadow-gold-glow transition-all transform hover:scale-105 flex items-center justify-center gap-1 md:gap-2 overflow-hidden relative">
                    <div className="absolute inset-0 bg-white/30 skew-x-12 -translate-x-full group-hover:translate-x-[200%] transition-transform duration-700"></div>
                    <Play size={14} className="md:w-[18px] md:h-[18px]" fill="black" /> Play
                </button>

                <button className="p-2 md:p-3 rounded-lg md:rounded-xl bg-black border border-gray-800 text-gray-400 hover:text-gold-400 hover:border-gold-500 transition-all hover:bg-gold-900/20" title="Download Game">
                    <Download size={16} className="md:w-[20px] md:h-[20px]" />
                </button>
            </div>
        </div>
    </div>
  );

  return (
    <div className="pb-20">
      
      {/* 
          ==================================================
          DESKTOP HERO CONTENT (hidden lg:flex)
          ================================================== 
      */}
      <div className="hidden lg:flex relative min-h-screen w-full flex-col items-center justify-center text-center px-4 mb-0 overflow-hidden">
        <div className="absolute inset-0 z-0">
            <img 
              src={heroBgConfig?.url || "https://iili.io/f2peUSn.jpg"} 
              alt="Hero Background" 
              className="w-full h-full object-cover transition-all duration-300 ease-out"
              style={getHeroBgStyle()}
            />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black" />
        
        <div className="relative z-20 flex flex-col items-center justify-center">
            <div className="transition-all duration-300 ease-out mb-6 relative z-10" style={getWelcomeStyle()}>
                <img src={heroWelcomeChar?.url || "https://iili.io/39Qp4YF.png"} className="w-48 h-auto object-contain animate-float drop-shadow-[0_0_25px_rgba(239,191,50,0.6)]" alt="Welcome" />
            </div>
            <div className="text-center relative z-0">
                 <div className="inline-flex items-center gap-3 bg-black/80 border border-gold-500 rounded-full px-6 py-2 cursor-pointer hover:bg-gold-500/20 transition-colors group mb-6 animate-float" onClick={() => alert('ID Copied!')} style={{ animationDelay: '0.5s' }}>
                    <span className="text-gray-400 text-sm font-cinzel">PLAYER ID</span>
                    <span className="text-gold-400 font-bold tracking-widest text-base">{user.playerId}</span>
                    <Copy size={12} className="w-4 h-4 text-gold-600 group-hover:text-gold-400" />
                </div>
                <div className="w-full max-w-4xl mx-auto">
                    <h2 className="text-2xl text-white mb-2 tracking-widest uppercase font-sans drop-shadow-md">Hi! Welcome to</h2>
                    <div className="font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600 drop-shadow-xl leading-tight mb-6">
                        <span className="block text-5xl md:text-7xl mb-4">EMPERIAL SLOTS</span>
                        <span className="block text-2xl md:text-4xl tracking-normal">THE PINNACLE OF LUXURY GAMING</span>
                    </div>
                </div>
                <p className="text-gray-200 text-xl max-w-2xl mx-auto mb-10 font-sans leading-relaxed drop-shadow-md px-4">Make your first deposit and play your favorite games now!</p>
            </div>
        </div>

        <div className="absolute bottom-0 left-0 h-[85%] z-10 pointer-events-none origin-bottom-left transition-all duration-300 ease-out" style={getHeroLeftStyle()}>
            <img src={heroLeftChar?.url || "https://iili.io/f2bVmib.png"} className="h-full w-auto object-contain drop-shadow-2xl" />
        </div>
        <div className="absolute bottom-0 right-0 h-[85%] z-10 pointer-events-none origin-bottom-right transition-all duration-300 ease-out" style={getHeroRightStyle()}>
            <img src={heroRightChar?.url || "https://iili.io/f2t4Pjf.png"} className="h-full w-auto object-contain drop-shadow-2xl" />
        </div>

        {/* Desktop Payment & Button */}
        <div className="relative z-10 flex flex-row items-center justify-center gap-6 mb-10 w-full px-4">
            <div className="flex gap-6 items-center bg-black/60 px-6 py-3 rounded-xl border border-gold-600/30 backdrop-blur-sm shadow-lg overflow-x-auto max-w-full no-scrollbar">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="GPay" className="h-6 w-auto opacity-80 hover:opacity-100 transition-opacity flex-shrink-0" />
                 <img src="https://upload.wikimedia.org/wikipedia/commons/3/31/Apple_logo_white.svg" alt="Apple" className="h-6 w-auto opacity-80 hover:opacity-100 transition-opacity flex-shrink-0" />
                 <div className="h-6 w-px bg-gray-700 mx-2 flex-shrink-0"></div>
                 <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-7 w-auto opacity-80 hover:opacity-100 transition-opacity flex-shrink-0" />
                 <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-5 w-auto brightness-0 invert opacity-80 hover:opacity-100 transition-opacity flex-shrink-0" />
                 <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-5 w-auto brightness-0 invert opacity-80 hover:opacity-100 transition-opacity flex-shrink-0" />
            </div>
            <div className="flex items-center gap-3 bg-black/80 px-5 py-3 rounded-xl border border-gold-500/50 backdrop-blur-sm hover:bg-black transition-colors cursor-pointer flex-shrink-0">
                <div className="bg-white rounded-full p-0.5"><img src="https://upload.wikimedia.org/wikipedia/commons/4/46/Bitcoin.svg" alt="Bitcoin" className="h-6 w-6" /></div>
                <div className="flex flex-col text-left"><span className="text-gold-400 text-xs font-bold uppercase tracking-wider">Recommended</span><span className="text-white text-sm font-bold leading-none">Crypto</span></div>
            </div>
        </div>

        <GoldButton onClick={() => onNavigate(ViewState.DEPOSIT)} className="relative z-10 text-xl px-12 py-4 shadow-gold-glow-lg">DEPOSIT NOW</GoldButton>
      </div>


      {/* 
          ==================================================
          TABLET HERO CONTENT (hidden md:flex lg:hidden)
          - Customized specifically for Tablet View
          ================================================== 
      */}
      <div className="hidden md:flex lg:hidden relative min-h-screen w-full flex-col items-center justify-center text-center px-4 mb-0 overflow-hidden">
        <div className="absolute inset-0 z-0">
            <img 
              src={tabletHeroBg?.url || "https://iili.io/f2peUSn.jpg"} 
              alt="Tablet Hero Background" 
              className="w-full h-full object-cover"
              style={getTabletHeroBgStyle()}
            />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black" />
        
        <div className="relative z-20 flex flex-col items-center justify-center">
            <div className="transition-all duration-300 ease-out mb-6 relative z-10" style={getTabletWelcomeStyle()}>
                <img src={tabletWelcomeChar?.url || "https://iili.io/39Qp4YF.png"} className="w-40 h-auto object-contain animate-float drop-shadow-[0_0_25px_rgba(239,191,50,0.6)]" alt="Welcome" />
            </div>
            <div className="text-center relative z-0">
                 <div className="inline-flex items-center gap-3 bg-black/80 border border-gold-500 rounded-full px-6 py-2 cursor-pointer hover:bg-gold-500/20 transition-colors group mb-6 animate-float" onClick={() => alert('ID Copied!')}>
                    <span className="text-gray-400 text-sm font-cinzel">PLAYER ID</span>
                    <span className="text-gold-400 font-bold tracking-widest text-base">{user.playerId}</span>
                    <Copy size={12} className="w-4 h-4 text-gold-600 group-hover:text-gold-400" />
                </div>
                <div className="w-full max-w-4xl mx-auto">
                    <h2 className="text-2xl text-white mb-2 tracking-widest uppercase font-sans drop-shadow-md">Hi! Welcome to</h2>
                    <div className="font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600 drop-shadow-xl leading-tight mb-6">
                        <span className="block text-5xl mb-4">EMPERIAL SLOTS</span>
                        <span className="block text-2xl tracking-normal">THE PINNACLE OF LUXURY GAMING</span>
                    </div>
                </div>
                <p className="text-gray-200 text-lg max-w-2xl mx-auto mb-10 font-sans leading-relaxed drop-shadow-md px-4">Make your first deposit and play your favorite games now!</p>
            </div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center gap-4 mb-8 w-full px-2">
             <div className="flex gap-4 items-center bg-black/60 px-6 py-3 rounded-xl border border-gold-600/30 backdrop-blur-sm shadow-lg">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="GPay" className="h-5 w-auto opacity-90" />
                 <img src="https://upload.wikimedia.org/wikipedia/commons/3/31/Apple_logo_white.svg" alt="Apple" className="h-5 w-auto opacity-90" />
                 <div className="h-5 w-px bg-gray-700 mx-1"></div>
                 <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 w-auto opacity-90" />
                 <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4 w-auto brightness-0 invert opacity-90" />
                 <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4 w-auto brightness-0 invert opacity-90" />
             </div>
             <GoldButton onClick={() => onNavigate(ViewState.DEPOSIT)} className="relative z-10 text-lg px-10 py-3 shadow-gold-glow">DEPOSIT NOW</GoldButton>
        </div>
      </div>


      {/* 
          ==================================================
          MOBILE HERO CONTENT (flex md:hidden)
          ================================================== 
      */}
      <div className="flex md:hidden relative min-h-screen w-full flex-col items-center justify-center text-center px-4 mb-0 overflow-hidden">
        <div className="absolute inset-0 z-0">
            <img 
              src={heroBgConfig?.url || "https://iili.io/f2peUSn.jpg"} 
              alt="Hero Background" 
              className="w-full h-full object-cover"
              style={getHeroBgStyle()} 
            />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black" />

        <div className="relative z-20 flex flex-col items-center justify-center w-full">
            <div className="transition-all duration-300 ease-out mb-4 relative z-10" style={getMobileWelcomeStyle()}>
                <img 
                    src={mobileHeroWelcomeChar?.url || "https://iili.io/39Qp4YF.png"} 
                    className="w-32 h-auto object-contain animate-float drop-shadow-[0_0_20px_rgba(239,191,50,0.5)]" 
                    alt="Welcome"
                />
            </div>
            <div className="text-center relative z-0 w-full">
                 <div className="inline-flex items-center gap-2 bg-black/80 border border-gold-500 rounded-full px-4 py-1 cursor-pointer hover:bg-gold-500/20 transition-colors group mb-4 animate-float" onClick={() => alert('ID Copied!')}>
                    <span className="text-gray-400 text-[10px] font-cinzel">PLAYER ID</span>
                    <span className="text-gold-400 font-bold tracking-widest text-xs">{user.playerId}</span>
                    <Copy size={12} className="text-gold-600" />
                </div>

                <div className="w-full max-w-md mx-auto">
                    <div className="flex items-center justify-center gap-2 mb-2 w-full">
                        <div className="w-12 h-12 flex-shrink-0" style={getMobileLeftDecorStyle()}>
                            {mobileHeroLeftDecor?.url && <img src={mobileHeroLeftDecor.url} className="w-full h-full object-contain opacity-80" />}
                        </div>
                        <h2 className="text-sm text-white tracking-widest uppercase font-sans drop-shadow-md whitespace-nowrap">Hi! Welcome to</h2>
                        <div className="w-12 h-12 flex-shrink-0" style={getMobileRightDecorStyle()}>
                            {mobileHeroRightDecor?.url && <img src={mobileHeroRightDecor.url} className="w-full h-full object-contain opacity-80" />}
                        </div>
                    </div>

                    <div 
                        className="font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600 drop-shadow-xl leading-tight mb-4 transition-transform duration-300"
                        style={{ transform: `scale(${mobileHeroTextScale || 1})` }}
                    >
                        <span className="block text-3xl mb-1">EMPERIAL SLOTS</span>
                        <span className="block text-xs tracking-wide">THE PINNACLE OF LUXURY GAMING</span>
                    </div>
                </div>
                
                <p className="text-gray-200 text-xs max-w-xs mx-auto mb-6 font-sans leading-relaxed drop-shadow-md px-4">Make your first deposit and play your favorite games now!</p>
            </div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center gap-4 mb-8 w-full px-2">
            <div className="flex gap-4 items-center bg-black/60 px-4 py-2 rounded-xl border border-gold-600/30 backdrop-blur-sm shadow-lg overflow-x-auto max-w-full no-scrollbar scale-90">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="GPay" className="h-4 w-auto opacity-90" />
                 <img src="https://upload.wikimedia.org/wikipedia/commons/3/31/Apple_logo_white.svg" alt="Apple" className="h-4 w-auto opacity-90" />
                 <div className="h-4 w-px bg-gray-700 mx-1"></div>
                 <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5 w-auto opacity-90" />
                 <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3 w-auto brightness-0 invert opacity-90" />
                 <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-3 w-auto brightness-0 invert opacity-90" />
            </div>
            
            <div className="flex items-center gap-2 bg-black/80 px-4 py-2 rounded-xl border border-gold-500/50 backdrop-blur-sm hover:bg-black transition-colors cursor-pointer">
                <div className="bg-white rounded-full p-0.5"><img src="https://upload.wikimedia.org/wikipedia/commons/4/46/Bitcoin.svg" alt="Bitcoin" className="h-4 w-4" /></div>
                <div className="flex flex-col text-left"><span className="text-gold-400 text-[10px] font-bold uppercase tracking-wider">Recommended</span><span className="text-white text-xs font-bold leading-none">Crypto</span></div>
            </div>

            <GoldButton onClick={() => onNavigate(ViewState.DEPOSIT)} className="relative z-10 text-sm px-8 py-3 shadow-gold-glow">DEPOSIT NOW</GoldButton>
        </div>
      </div>


      {/* FEATURED GAMES */}
      <div ref={sectionRef} className="relative py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
            {featuredGamesBg?.url && (
                <img 
                    src={featuredGamesBg.url} 
                    className="w-full h-full object-cover transition-all duration-300 ease-out" 
                    style={getFeaturedBgStyle()} 
                />
            )}
            <div className="absolute inset-0 bg-black/80 z-0"></div>
        </div>

        <div className="relative z-20 py-6 mb-4 md:mb-8 transition-all duration-300">
           <div className="container mx-auto px-4 text-center animate-fade-in relative z-20">
              <h2 className="text-2xl md:text-5xl font-cinzel font-bold text-gold-100 mb-2 drop-shadow-lg">Featured Games</h2>
              <p className="text-gold-400 text-xs md:text-lg font-cinzel tracking-wide drop-shadow-md">Start playing and win big!</p>
           </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-[1200px] mx-auto">
            
            {/* MOBILE GRID VIEW (md:hidden) */}
            <div className="grid grid-cols-2 gap-3 md:hidden">
                {gamesToDisplay.map((game) => (
                    <div key={game.id} className="w-full">
                        {renderGameCard(game)}
                    </div>
                ))}
            </div>

            {/* DESKTOP/TABLET FLEX VIEW (hidden md:flex) */}
            <div className="hidden md:flex flex-wrap justify-center gap-8">
                {gamesToDisplay.map((game, index) => {
                    const isLastItem = index === gamesToDisplay.length - 1;
                    const isStartOfNewRow = index % 3 === 0; 
                    const showFlankingImages = isLastItem && isStartOfNewRow;

                    if (showFlankingImages) {
                        return (
                            <React.Fragment key={`flanked-${game.id}`}>
                                <div className="hidden lg:flex items-end justify-end w-[350px] opacity-100 pointer-events-none transition-all duration-300 ease-out" style={getFeaturedLeftStyle()}>
                                    <img src={featuredGameLeftChar?.url || "https://iili.io/f2bVmib.png"} className="h-[80%] object-contain drop-shadow-lg" />
                                </div>
                                <div key={game.id} className="w-[350px]">{renderGameCard(game)}</div>
                                <div className="hidden lg:flex items-end justify-start w-[350px] opacity-100 pointer-events-none transition-all duration-300 ease-out" style={getFeaturedRightStyle()}>
                                    <img src={featuredGameRightChar?.url || "https://iili.io/f2t4Pjf.png"} className="h-[80%] object-contain drop-shadow-lg" />
                                </div>
                            </React.Fragment>
                        );
                    }
                    return <div key={game.id} className="w-[350px]">{renderGameCard(game)}</div>;
                })}
            </div>

          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="bg-[#0A0A0A] py-16 md:py-24 relative overflow-hidden border-t border-gold-600/10">
        <div className="absolute inset-0 z-0">
            {howItWorksBg?.url && (
                <img 
                    src={howItWorksBg.url} 
                    className="w-full h-full object-cover transition-all duration-300 ease-out" 
                    style={getHowItWorksBgStyle()} 
                />
            )}
        </div>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute top-1/4 -left-20 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-gold-500/5 rounded-full blur-[120px] animate-pulse-slow"></div>
            <div className="absolute bottom-1/4 -right-20 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-gold-500/5 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
                <h2 className="text-2xl md:text-5xl font-cinzel font-bold text-gold-100 mb-6 drop-shadow-lg leading-tight">How to create an account, deposit and withdraw</h2>
                <p className="text-gray-400 text-base md:text-lg leading-relaxed">Follow these steps to get your account set up, to play, and to redeem your winnings. We also have tutorial videos you can watch if you want more detail.</p>
            </div>
            <div className="relative">
                <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-transparent via-gold-600/50 to-transparent"></div>
                <div className="flex flex-col gap-8 md:gap-0">
                    {howItWorksSteps.map((step, index) => (
                        <div key={index} className={`flex flex-col md:flex-row items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''} gap-8 relative group`}>
                            <div className="w-full md:w-1/2 px-4">
                                <div className={`bg-[#121212] border border-gold-600/20 p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-gold-glow hover:border-gold-500/50 transition-all duration-500 transform hover:-translate-y-2 relative overflow-hidden ${index % 2 === 0 ? 'text-left md:text-left' : 'text-left md:text-right'}`}>
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000 skew-x-12"></div>
                                    <h3 className={`text-xl md:text-2xl font-cinzel font-bold text-gold-400 mb-4 flex items-center gap-3 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} justify-start ${index % 2 === 0 ? '' : 'md:justify-end'}`}>
                                        <span className="hidden md:block">{index + 1}.</span> {step.title}
                                    </h3>
                                    <ul className={`space-y-3 flex flex-col ${index % 2 !== 0 ? 'md:items-end' : 'md:items-start'}`}>
                                        {step.points.map((point, pIdx) => (
                                            <li key={pIdx} className={`text-gray-300 text-sm leading-relaxed flex items-start gap-3 ${index % 2 !== 0 ? 'md:flex-row-reverse md:text-right' : ''}`}>
                                                <span className="mt-2 w-1.5 h-1.5 bg-gold-500 rounded-full flex-shrink-0 shadow-[0_0_8px_rgba(239,191,50,0.8)]"></span><span>{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <div className="hidden md:flex absolute left-1/2 top-8 transform -translate-x-1/2 w-10 h-10 md:w-14 md:h-14 bg-black border-2 border-gold-500 rounded-full items-center justify-center shadow-gold-glow z-10 group-hover:scale-110 transition-transform duration-300 group-hover:bg-gold-900/20">
                                <div className="text-gold-400 group-hover:text-white transition-colors">{step.icon}</div>
                            </div>
                            <div className="hidden md:block w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* FISH TABLE SECTION */}
      <div className="bg-[#050505] py-16 md:py-24 relative overflow-hidden border-t border-gold-600/10">
          <div className="absolute inset-0 z-0">
                {fishSectionBg?.url && (
                    <img 
                        src={fishSectionBg.url} 
                        className="w-full h-full object-cover transition-all duration-300 ease-out" 
                        style={getFishBgStyle()} 
                    />
                )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-0 pointer-events-none"></div>
          
          <div className="hidden xl:block absolute left-0 bottom-0 z-10 pointer-events-none transition-all duration-300 ease-out" style={getFishLeftStyle()}>
                {fishSectionLeftChar?.url && (
                    <img 
                        src={fishSectionLeftChar.url} 
                        className="h-[500px] w-auto object-contain drop-shadow-2xl" 
                    />
                )}
          </div>

          <div className="container mx-auto px-4 relative z-10 text-center">
                <h3 className="text-gold-500 font-cinzel text-lg tracking-[0.5em] mb-4 animate-pulse-slow">THE NEW ERA</h3>
                <h1 className="text-4xl md:text-6xl font-cinzel font-bold text-white mb-2 drop-shadow-2xl">FISH TABLE</h1>
                <h2 className="text-2xl md:text-4xl font-cinzel font-bold text-gold-400 mb-8">SWEEPSTAKES GAMES</h2>
                
                <div className="max-w-3xl mx-auto bg-black/60 backdrop-blur-md border border-gold-600/30 p-8 rounded-2xl shadow-gold-glow relative z-20">
                    <h4 className="text-2xl text-white font-bold mb-6">Play Fish Table Games Online <br /><span className="text-gold-400">Reel in the Riches!</span></h4>
                    
                    <div className="space-y-4 text-gray-300 text-base md:text-lg leading-relaxed">
                        <p>Online is an all-new way to play your favorite type of sweepstakes, reels, and fish games on an app.</p>
                        <p>Online fish table games have essentially become the most popular and fun gaming option across the globe. So, let’s get ready and dive in!</p>
                        <p className="text-white font-bold">All you need to do is shoot your canon/laser and hit the fish.</p>
                        <p>Then, you receive a certain amount of points depending on the fish that was killed. Fortunately, when you score high, you will receive a lot of credits.</p>
                        <p>Alongside this, you get numerous amazing bonuses while playing these fish games.</p>
                    </div>
                    
                    <div className="mt-8">
                        <GoldButton onClick={() => onNavigate(ViewState.GAMES_INTRO)} className="px-10 py-3 mx-auto">Dive In Now</GoldButton>
                    </div>
                </div>
          </div>
      </div>

      {/* INFINITE SLIDER */}
      <div className="bg-deep py-16 md:py-20 border-y border-gold-600/20 overflow-hidden relative group">
        <div className="absolute inset-0 z-0 pointer-events-none">
            {whyChooseBg?.url && (
                <img 
                    src={whyChooseBg.url} 
                    className="w-full h-full object-cover transition-all duration-300 ease-out" 
                    style={getWhyChooseBgStyle()} 
                />
            )}
            <div className="absolute inset-0 bg-black/70 z-0"></div>
        </div>

        <div className="container mx-auto px-4 mb-8 md:mb-12 relative z-10">
            <h2 className="text-center text-2xl md:text-3xl font-cinzel font-bold text-gold-400">Why Choose The Empire</h2>
        </div>
        <div className="absolute top-0 left-0 w-10 md:w-40 h-full bg-gradient-to-r from-black via-black/80 to-transparent z-20 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-10 md:w-40 h-full bg-gradient-to-l from-black via-black/80 to-transparent z-20 pointer-events-none"></div>
        <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused] relative z-10">
            {scrollingFeatures.map((feat, idx) => (
                <div key={idx} className="w-[300px] md:w-[350px] mx-4 flex-shrink-0"><FeatureTile {...feat} /></div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
