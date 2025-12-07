
import React from 'react';
import { User, ViewState, ImageSettings } from '../types';
import { 
    Gamepad2, User as UserIcon, RefreshCcw, 
    Activity, MessageCircle, Home, ArrowRight,
    ChevronDown, LogOut, Wallet, ArrowUpRight, Video 
} from 'lucide-react';
import { useResponsiveImage } from '../hooks/useResponsiveImage';

interface DashboardPageProps {
  user: User;
  onLogout: () => void;
  onNavigate: (view: ViewState) => void;
  onSupportOpen: () => void;
  bgConfig?: ImageSettings;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ user, onLogout, onNavigate, onSupportOpen, bgConfig }) => {
  
  const { getResponsiveStyle } = useResponsiveImage(bgConfig);

  const cards = [
      {
          title: "Game Panel",
          desc: "Command Center",
          details: "Your personal hub for managing game accounts, setting passwords, and launching software.",
          icon: <Gamepad2 className="w-12 h-12 text-gold-500" />,
          action: () => onNavigate(ViewState.GAME_PANEL),
          color: "group-hover:border-gold-500"
      },
      {
          title: "Player Profile",
          desc: "Personalized Stats",
          details: "Update your account details, manage notification preferences, and view your membership status.",
          icon: <UserIcon className="w-12 h-12 text-blue-400" />,
          action: () => onNavigate(ViewState.PROFILE),
          color: "group-hover:border-blue-500"
      },
      {
          title: "Deposit Funds",
          desc: "Add Credits",
          details: "Securely fund your account instantly via Bitcoin or other supported methods.",
          icon: <Wallet className="w-12 h-12 text-emerald-400" />,
          action: () => onNavigate(ViewState.DEPOSIT),
          color: "group-hover:border-emerald-500"
      },
      {
          title: "Withdraw",
          desc: "Cash Out",
          details: "Request payouts of your winnings directly to your wallet.",
          icon: <ArrowUpRight className="w-12 h-12 text-orange-400" />,
          action: () => onNavigate(ViewState.WITHDRAW),
          color: "group-hover:border-orange-500"
      },
      {
          title: "P2P Transfer",
          desc: "Instant Funds",
          details: "Send credits instantly to other players securely. View your complete transaction history.",
          icon: <RefreshCcw className="w-12 h-12 text-green-400" />,
          action: () => onNavigate(ViewState.P2P_TRANSFER),
          color: "group-hover:border-green-500"
      },
      {
          title: "Tutorials",
          desc: "Video Guides",
          details: "Watch helpful videos on how to get started, deposit, and play.",
          icon: <Video className="w-12 h-12 text-teal-400" />,
          action: () => onNavigate(ViewState.TUTORIALS),
          color: "group-hover:border-teal-500"
      },
      {
          title: "System Status",
          desc: "Live Health",
          details: "Check the real-time operational status of all gaming platforms and servers.",
          icon: <Activity className="w-12 h-12 text-red-400" />,
          action: () => onNavigate(ViewState.STATUS),
          color: "group-hover:border-red-500"
      },
      {
          title: "Support Center",
          desc: "24/7 Assistance",
          details: "Access our Knowledge Base, Chat with AI, or contact our support team directly.",
          icon: <MessageCircle className="w-12 h-12 text-purple-400" />,
          action: onSupportOpen,
          color: "group-hover:border-purple-500"
      },
      {
          title: "Main Landing",
          desc: "Home Page",
          details: "Return to the main welcome page to view featured games and payment options.",
          icon: <Home className="w-12 h-12 text-gray-400" />,
          action: () => onNavigate(ViewState.HOME),
          color: "group-hover:border-gray-500"
      }
  ];

  return (
    <div className="min-h-screen bg-black font-sans relative overflow-hidden">
      
      {/* Full Screen Background */}
      <div className="absolute inset-0 z-0">
         <img 
            src={bgConfig?.url || "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?q=80&w=2070&auto=format&fit=crop"} 
            alt="Dashboard Background" 
            className="w-full h-full object-cover transition-transform duration-[20s] ease-in-out hover:scale-110"
            style={getResponsiveStyle()}
         />
         <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black/90"></div>
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-80"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-24 flex flex-col items-center">
         
         {/* Hero Section */}
         <div className="text-center mb-16 animate-fade-in">
             <h1 className="text-3xl sm:text-4xl md:text-6xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-200 via-white to-gold-200 mb-4 drop-shadow-2xl leading-tight">
                 Welcome Back, {user.name}
             </h1>
             
             {/* Balance Chip */}
             <div className="inline-flex items-center gap-4 bg-black/60 backdrop-blur-md border-2 border-gold-500/50 rounded-full px-4 py-2 md:px-8 md:py-3 shadow-[0_0_30px_rgba(239,191,50,0.3)] hover:border-gold-400 transition-colors group cursor-default">
                 <div className="text-right">
                     <p className="text-gold-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">Total Balance</p>
                     <p className="text-xl md:text-3xl font-bold text-white">${user.balance.toLocaleString()}</p>
                 </div>
                 <div className="h-8 md:h-10 w-px bg-gold-500/30"></div>
                 <div className="text-left">
                     <p className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-widest">Player ID</p>
                     <p className="text-gold-200 font-mono text-base md:text-lg">{user.playerId}</p>
                 </div>
             </div>
         </div>

         {/* Cards Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
             {cards.map((card, idx) => (
                 <div 
                    key={idx} 
                    onClick={card.action}
                    className={`group relative bg-[#121212]/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 cursor-pointer overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:bg-black/90 ${card.color}`}
                    style={{ animationDelay: `${idx * 0.1}s` }}
                 >
                     {/* Hover Gradient Shine */}
                     <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                     
                     <div className="relative z-10 flex flex-col h-full justify-between">
                         <div className="flex justify-between items-start mb-6">
                             <div className="p-4 rounded-2xl bg-black border border-gray-800 group-hover:border-gray-700 transition-colors shadow-lg">
                                 {card.icon}
                             </div>
                             <ArrowRight className="text-gray-600 group-hover:text-white transform group-hover:translate-x-1 transition-all" />
                         </div>
                         
                         <div>
                             <h3 className="text-2xl font-cinzel font-bold text-white mb-1 group-hover:text-gold-200 transition-colors">{card.title}</h3>
                             <p className="text-gold-500 font-bold text-xs uppercase tracking-widest mb-4">{card.desc}</p>
                             
                             {/* Description Dropdown Effect */}
                             <div className="overflow-hidden max-h-0 group-hover:max-h-24 transition-all duration-500 ease-in-out opacity-0 group-hover:opacity-100">
                                 <div className="pt-4 border-t border-gray-800 text-gray-400 text-sm leading-relaxed">
                                     {card.details}
                                 </div>
                             </div>
                             
                             <div className="mt-2 flex items-center justify-center w-6 h-6 rounded-full bg-gray-900 text-gray-500 group-hover:opacity-0 transition-opacity">
                                 <ChevronDown size={14} />
                             </div>
                         </div>
                     </div>
                 </div>
             ))}
         </div>

         <div className="mt-16">
             <button onClick={onLogout} className="flex items-center gap-2 text-red-500 hover:text-red-400 bg-red-950/20 hover:bg-red-950/40 border border-red-900/50 px-8 py-3 rounded-xl transition-all font-cinzel font-bold">
                 <LogOut size={20} /> Sign Out
             </button>
         </div>

      </div>
    </div>
  );
};

export default DashboardPage;
