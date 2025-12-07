
import React, { useState } from 'react';
import { ViewState, Tutorial } from '../types';
import { ArrowLeft, Play, Search, Video } from 'lucide-react';

interface TutorialsPageProps {
    onNavigate: (view: ViewState) => void;
    tutorials: Tutorial[];
}

const TutorialsPage: React.FC<TutorialsPageProps> = ({ onNavigate, tutorials }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTutorials = (tutorials || []).filter(t => 
        t.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-black font-sans pt-24 pb-20 relative">
            <div className="container mx-auto px-4 relative z-10 max-w-4xl">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button onClick={() => onNavigate(ViewState.HOME)} className="p-2 bg-gray-900 rounded-full text-gold-400 hover:text-white transition-colors">
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="text-3xl font-cinzel font-bold text-white">Video Tutorials</h1>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input 
                            type="text" 
                            placeholder="Search guides..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#121212] border border-gray-800 rounded-full py-3 pl-10 pr-4 text-white focus:border-gold-500 outline-none"
                        />
                    </div>
                </div>

                {/* Tutorials List */}
                <div className="space-y-4">
                    {filteredTutorials.map((t) => (
                        <div key={t.id} className="group bg-[#121212] border border-gray-800 rounded-xl p-4 flex items-center gap-6 hover:border-gold-500/50 transition-all duration-300 hover:bg-black">
                            <a 
                                href={t.videoUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="w-16 h-16 bg-black rounded-full border-2 border-gold-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-gold-glow cursor-pointer"
                            >
                                <Play className="text-gold-500 w-6 h-6 ml-1" fill="currentColor" />
                            </a>
                            <div className="flex-1">
                                <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-gold-400 transition-colors mb-1">
                                    {t.title}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Video size={12} />
                                    <span>Video Guide</span>
                                </div>
                            </div>
                            <div className="hidden md:block px-4 py-2 bg-gray-900 rounded-lg text-xs text-gray-400 group-hover:text-white transition-colors">
                                Watch Now
                            </div>
                        </div>
                    ))}

                    {filteredTutorials.length === 0 && (
                        <div className="text-center py-12 text-gray-500 italic">
                            No tutorials found matching your search.
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default TutorialsPage;
