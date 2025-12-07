
import React from 'react';
import { ArrowLeft, Gamepad2, Shield, Headphones, LayoutDashboard, Lock, Zap, Clock, Crown } from 'lucide-react';
import { ViewState, ImageSettings } from '../types';
import { GoldButton } from '../components/UI';
import { useResponsiveImage } from '../hooks/useResponsiveImage';

interface AboutPageProps {
  onNavigate: (view: ViewState) => void;
  heroLeftConfig?: ImageSettings;
  closingRightConfig?: ImageSettings;
  aboutPassionImg?: ImageSettings;
}

const AboutPage: React.FC<AboutPageProps> = ({ onNavigate, heroLeftConfig, closingRightConfig, aboutPassionImg }) => {
  
  const { getResponsiveStyle: getHeroLeftStyle } = useResponsiveImage(heroLeftConfig);
  const { getResponsiveStyle: getClosingRightStyle } = useResponsiveImage(closingRightConfig);
  const { getResponsiveStyle: getPassionStyle } = useResponsiveImage(aboutPassionImg);

  const benefits = [
    { title: "No Redemption Limits", desc: "Enjoy unlimited redemptions without restrictions", icon: <Shield size={40} /> },
    { title: "Exceptional Customer Support", desc: "24/7 dedicated support team ready to assist", icon: <Headphones size={40} /> },
    { title: "Personalized Player Dashboard", desc: "Manage all accounts in one secure location", icon: <LayoutDashboard size={40} /> },
    { title: "Advanced Safety & Security", desc: "Industry-leading encryption and protection", icon: <Lock size={40} /> },
    { title: "Top-Grade Software & Innovation", desc: "Cutting-edge technology for seamless gameplay", icon: <Zap size={40} /> },
    { title: "24/7 Instant Processing", desc: "Automated deposits and redeems anytime", icon: <Clock size={40} /> }
  ];

  return (
    <div className="min-h-screen relative bg-black overflow-x-hidden font-sans">
      <header className="fixed top-0 left-0 w-full z-50 bg-[#121212]/95 backdrop-blur-md border-b border-gold-600/30 h-16 lg:h-20 flex items-center justify-between px-4 lg:px-8 transition-all duration-300 shadow-lg">
        <button onClick={() => onNavigate(ViewState.GAMES_INTRO)} className="flex items-center gap-2 text-gold-400 hover:text-white transition-colors font-cinzel group text-sm lg:text-base">
            <Gamepad2 size={18} className="lg:w-5 lg:h-5 group-hover:rotate-12 transition-transform" />
            <span className="hidden md:inline">Our Games</span>
        </button>
        <div className="flex items-center gap-2 lg:gap-3 cursor-pointer" onClick={() => onNavigate(ViewState.AUTH)}>
            <Crown className="text-gold-500 w-6 h-6 lg:w-8 lg:h-8 drop-shadow-md" />
            <h2 className="text-lg lg:text-2xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-200 to-gold-500">EMPERIAL SLOTS</h2>
        </div>
        <button onClick={() => onNavigate(ViewState.AUTH)} className="flex items-center gap-2 text-gold-400 hover:text-white transition-colors font-cinzel group text-sm lg:text-base">
            <ArrowLeft size={18} className="lg:w-5 lg:h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Sign In</span>
        </button>
      </header>

      <div className="relative w-full min-h-[40vh] mt-16 lg:mt-20 flex flex-col items-center justify-center bg-black overflow-hidden border-b border-gold-600/30">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[300px] md:w-[400px] h-[300px] md:h-[400px] bg-gold-500/15 blur-[120px] pointer-events-none animate-pulse-slow" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[300px] md:w-[400px] h-[300px] md:h-[400px] bg-gold-500/15 blur-[120px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '1.5s' }} />

        <div className="absolute left-0 top-0 h-full w-full lg:w-1/2 pointer-events-none flex items-center justify-center lg:justify-start lg:pl-32">
           <div className="absolute left-1/2 lg:left-20 top-1/2 -translate-x-1/2 lg:translate-x-0 -translate-y-1/2 w-[60%] h-[80%] bg-gold-500/30 blur-[80px] rounded-full animate-pulse-slow"></div>
           <img 
             src={heroLeftConfig?.url || "https://iili.io/f2ZhwEx.png"} 
             alt="About Hero" 
             className="h-full w-auto object-contain drop-shadow-[0_0_30px_rgba(239,191,50,0.3)] relative z-10"
             style={getHeroLeftStyle()}
           />
        </div>

        <div className="absolute inset-0 bg-black/50 z-10" />

        <div className="relative z-20 container mx-auto px-4 flex flex-col items-center text-center gap-4 py-12">
            <h1 className="text-3xl md:text-5xl font-cinzel font-bold text-gold-200 drop-shadow-lg animate-fade-in">About Us</h1>
            <p className="text-white text-sm md:text-lg max-w-4xl leading-relaxed drop-shadow-md animate-fade-in px-4" style={{ animationDelay: '0.2s' }}>
                Emperial Slots is a trusted and secure platform where players can enjoy online sweepstakes, slots, fish games, and more — all in one seamless experience.
            </p>
            <p className="text-yellow-400 text-xs md:text-base font-cinzel font-semibold tracking-wide max-w-3xl drop-shadow-md animate-fade-in px-4" style={{ animationDelay: '0.4s' }}>
                Our mission is to deliver a premium gaming environment built on innovation, reliability, and industry-leading technology.
            </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 lg:py-16">
         <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-2">
            <div className="w-full lg:w-1/2 space-y-4 md:space-y-6 z-20 text-center lg:text-left">
                <h3 className="text-2xl md:text-3xl font-cinzel font-bold text-gold-500">Gaming is our passion.</h3>
                <div className="h-1 w-20 bg-gold-500 rounded-full mx-auto lg:mx-0" />
                <p className="text-gray-300 leading-relaxed text-base md:text-lg">We offer an exciting and diverse collection of high-quality online games that players love. Over the years, we have proudly served thousands of users through a curated selection of entertainment options.</p>
                <p className="text-gray-300 leading-relaxed text-base md:text-lg">This constant growth inspires us to keep improving, innovate new ideas, and continually deliver top-tier service.</p>
            </div>
            <div className="w-full lg:w-1/2 flex justify-center relative">
                 <div className="absolute inset-0 bg-gold-500/10 blur-3xl rounded-full" />
                 <img 
                    src={aboutPassionImg?.url || "https://iili.io/f2t4Pjf.png"} 
                    alt="Passion for Gaming"
                    className="relative z-10 h-[400px] md:h-[700px] w-auto object-contain drop-shadow-2xl mask-image-bottom" 
                    style={getPassionStyle()}
                 />
            </div>
         </div>
      </div>

      <div className="bg-black py-12 lg:py-16 relative">
        <div className="container mx-auto px-4">
            <h2 className="text-center text-2xl md:text-3xl font-cinzel font-bold text-gold-500 mb-8 md:mb-12">What You Benefit From:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {benefits.map((item, idx) => (
                    <div key={idx} className="group relative bg-[#1a1a1a] border border-gold-600/50 rounded-2xl p-6 md:p-8 flex flex-col items-center text-center transition-all duration-500 shadow-lg hover:shadow-gold-glow overflow-hidden hover:border-gold-400 hover:border-2 hover:-translate-y-2">
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-[200%] transition-transform duration-[1000ms] bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none z-0"></div>
                        <div className="relative z-10 w-14 h-14 md:w-16 md:h-16 rounded-full bg-black border border-gold-600/30 flex items-center justify-center mb-6 text-gold-500 group-hover:text-gold-300 group-hover:scale-110 transition-all duration-300">{item.icon}</div>
                        <h3 className="relative z-10 text-gold-200 font-cinzel font-bold text-lg mb-3 group-hover:text-white transition-colors">{item.title}</h3>
                        <p className="relative z-10 text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </div>

      <div className="bg-black pt-12 pb-20 border-t border-gold-600/10 relative overflow-hidden">
          <div className="hidden xl:block absolute -right-20 bottom-0 h-[90%] pointer-events-none z-0">
              <img 
                src={closingRightConfig?.url || "https://iili.io/f2bVmib.png"} 
                alt="Emperial Character" 
                className="h-full w-auto object-contain drop-shadow-2xl opacity-90"
                style={getClosingRightStyle()}
              />
          </div>

          <div className="container mx-auto px-4 max-w-4xl text-center flex flex-col gap-6 md:gap-8 relative z-10">
             <p className="text-white text-base md:text-lg leading-relaxed animate-fade-in">At Emperial Slots, your safety and satisfaction come first. We work continuously to develop cutting-edge solutions to help you enjoy the highest gaming potential.</p>
             <p className="text-white text-base md:text-lg leading-relaxed animate-fade-in">Many players struggle with slow responses or manual processes when buying or redeeming credits — we solve that with our automated player dashboard.</p>
             <p className="text-gold-400 font-cinzel font-bold text-lg md:text-xl tracking-wide animate-pulse-slow">Manage all your gaming accounts in one secure and convenient place.</p>
             <p className="text-white text-base md:text-lg leading-relaxed animate-fade-in">Deposits and redeems are available 24/7, and every request updates instantly through both email and SMS so you always stay informed.</p>
             <div className="h-16 md:h-32"></div>
             <p className="text-white text-base md:text-lg leading-relaxed animate-fade-in">We value our community and encourage players to share their experience with Emperial Slots.</p>
             <div className="mt-8 flex flex-col items-center gap-6">
                <h2 className="text-2xl md:text-4xl font-cinzel font-bold text-gold-500 drop-shadow-lg">You are now ready to enjoy the future of online gaming.</h2>
                <GoldButton className="text-lg md:text-xl px-8 md:px-10 py-3 md:py-4 w-full md:w-auto" onClick={() => onNavigate(ViewState.AUTH)}>Let's Join the Empire Now!</GoldButton>
             </div>
          </div>
      </div>

      <div className="h-10 bg-black text-center text-gray-800 text-xs py-4">&copy; 2025 Emperial Slots. All rights reserved.</div>
    </div>
  );
};

export default AboutPage;
