
import React from 'react';
import { ArrowLeft, Crown, Info, Play, Download } from 'lucide-react';
import { ViewState, IntroGame } from '../types';
import { GoldButton } from '../components/UI';

interface GamesIntroPageProps {
  onNavigate: (view: ViewState) => void;
  introGames?: IntroGame[];
}

const GamesIntroPage: React.FC<GamesIntroPageProps> = ({ onNavigate, introGames }) => {
  
  // Fallback data if none provided
  const defaultGames: IntroGame[] = [
    {
        id: '1',
        title: "Royal Flush Slots",
        description: "Experience the thrill of premium slot machines with stunning graphics and exciting bonus rounds.",
        image: "https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?q=80&w=1887&auto=format&fit=crop",
        showDownload: false
    }
  ];

  const gamesToDisplay = (introGames && introGames.length > 0) ? introGames : defaultGames;

  return (
    <div className="min-h-screen bg-black font-sans overflow-x-hidden">
      
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-[#121212]/95 backdrop-blur-md border-b border-gold-600/30 h-20 flex items-center justify-between px-4 lg:px-8 shadow-lg">
        <button 
            onClick={() => onNavigate(ViewState.ABOUT)} 
            className="flex items-center gap-2 text-gold-400 hover:text-white transition-colors font-cinzel group"
        >
            <Info size={20} className="group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline">About Us</span>
        </button>
        
        <div 
            className="flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform" 
            onClick={() => onNavigate(ViewState.AUTH)}
        >
            <Crown className="text-gold-500 w-8 h-8 drop-shadow-md animate-pulse-slow" />
            <h2 className="text-xl lg:text-2xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-200 to-gold-500">
                EMPERIAL SLOTS
            </h2>
        </div>

        <button 
            onClick={() => onNavigate(ViewState.AUTH)} 
            className="flex items-center gap-2 text-gold-400 hover:text-white transition-colors font-cinzel group"
        >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Sign In</span>
        </button>
      </header>

      {/* Game Sections */}
      <div className="pt-20">
        {gamesToDisplay.map((game) => (
            <section key={game.id} className="relative min-h-[85vh] flex items-center justify-center border-b border-gold-600/20 overflow-hidden group">
                
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <img 
                        src={game.image} 
                        alt={game.title} 
                        className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[2s] ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/90"></div>
                </div>

                {/* Content Box */}
                <div className="relative z-10 container mx-auto px-4 flex flex-col items-center text-center max-w-4xl">
                    <div className="mb-6 p-4 rounded-full bg-black/50 border border-gold-500/50 backdrop-blur-md shadow-gold-glow animate-float">
                        <Play fill="currentColor" className="text-gold-400 w-12 h-12 ml-1" />
                    </div>
                    
                    <h2 className="text-4xl md:text-7xl font-cinzel font-bold text-gold-100 mb-6 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
                        {game.title}
                    </h2>
                    
                    <p className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-2xl drop-shadow-md mb-10 font-light">
                        {game.description}
                    </p>

                    <div className="flex flex-col md:flex-row gap-6">
                        {game.playLink && (
                            <a href={game.playLink} target="_blank" rel="noreferrer">
                                <GoldButton className="px-10 py-3 text-lg uppercase tracking-widest">
                                    Play Now
                                </GoldButton>
                            </a>
                        )}
                        
                        {/* Optional Download Button */}
                        {game.showDownload && game.downloadLink && (
                            <a href={game.downloadLink} target="_blank" rel="noreferrer">
                                <button className="flex items-center justify-center gap-2 px-10 py-3 rounded-xl border-2 border-gold-500 text-gold-400 font-cinzel font-bold text-lg uppercase tracking-widest hover:bg-gold-500/10 transition-colors shadow-lg">
                                    <Download size={20} /> Download
                                </button>
                            </a>
                        )}
                    </div>
                </div>
            </section>
        ))}

        {/* Final CTA Section */}
        <section className="min-h-[50vh] flex flex-col items-center justify-center bg-black relative overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold-900/20 via-black to-black"></div>
             
             <div className="relative z-10 text-center px-4">
                <Crown className="text-gold-500 w-16 h-16 mx-auto mb-6 animate-float" />
                <h2 className="text-4xl md:text-6xl font-cinzel font-bold text-white mb-4">
                    Ready to Play?
                </h2>
                <p className="text-gold-400/80 text-lg mb-10">
                    Join thousands of players and start winning today
                </p>
                
                <GoldButton onClick={() => onNavigate(ViewState.AUTH)} className="text-xl px-12 py-4">
                    Sign In Now
                </GoldButton>
             </div>
        </section>
      </div>
      
      <div className="h-10 bg-black text-center text-gray-800 text-xs py-4">&copy; 2025 Emperial Slots. All rights reserved.</div>
    </div>
  );
};

export default GamesIntroPage;
