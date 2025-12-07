
import React, { useState } from 'react';
import { ViewState, PlatformStatus, ImageSettings } from '../types';
import { AlertTriangle, Activity, Search, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { useResponsiveImage } from '../hooks/useResponsiveImage';

interface StatusPageProps {
  onNavigate: (view: ViewState) => void;
  statusList: PlatformStatus[];
  bgConfig?: ImageSettings;
}

const StatusPage: React.FC<StatusPageProps> = ({ onNavigate, statusList, bgConfig }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Responsive Hooks
  const { getResponsiveStyle: getBgStyle } = useResponsiveImage(bgConfig);

  const fallbackData: PlatformStatus[] = [
        { id: 'backend-issue-1', name: 'Game Server Node 1', image: 'https://cdn-icons-png.flaticon.com/512/2282/2282245.png', status: 'Down', details: 'Backend problem' },
        { id: 'd1', name: 'Fire Kirin', image: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=100&h=100&fit=crop', status: 'Operational', details: '' },
        { id: 'd2', name: 'Orion Stars', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=100&h=100&fit=crop', status: 'Operational', details: '' },
  ];

  const activeData = (statusList && statusList.length > 0) ? statusList : fallbackData;

  const filteredPlatforms = activeData.filter(p => (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filteredPlatforms.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPlatforms.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => { if (page >= 1 && page <= totalPages) { setCurrentPage(page); } };

  return (
    <div className="min-h-screen bg-black font-sans text-white">
      <div className="relative w-full min-h-[25vh] mt-20 flex flex-col items-center justify-center bg-black overflow-hidden border-b border-gold-600/30 px-4 py-12">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gold-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gold-500/10 blur-[100px] pointer-events-none" />
        <div className="flex flex-col items-center text-center mb-8 z-10">
            <div className="bg-gold-500/10 p-3 rounded-full mb-4 border border-gold-500/30"><Activity className="text-gold-500 w-8 h-8 animate-pulse" /></div>
            <h1 className="text-2xl md:text-5xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-200 to-gold-500 drop-shadow-lg">GAMING SOFTWARE STATUS</h1>
        </div>
        <div className="relative z-10 max-w-3xl w-full bg-[#0A0A0A] border-2 border-gold-500 rounded-xl p-6 md:p-8 text-center shadow-[0_0_30px_rgba(239,191,50,0.15)]">
           <div className="flex items-center justify-center gap-2 mb-4"><AlertTriangle className="text-red-500 animate-pulse" size={24} /><h3 className="text-red-500 font-cinzel font-bold text-lg md:text-xl uppercase tracking-widest">Disclaimer</h3></div>
           <p className="text-white font-bold text-base md:text-lg mb-4">PLEASE NOTE, WE DO NOT OWN THE PLATFORMS AND DO NOT CONTROL THEIR FUNCTION.</p>
           <p className="text-gray-300 text-xs md:text-sm leading-relaxed">We will forward any reported issues to the platform owners' technical support teams, but please allow for delays as we do not control how quickly technical problems are addressed and resolved.</p>
        </div>
      </div>

      <div className="relative w-full py-12 md:py-16 overflow-hidden">
         <div className="absolute inset-0 z-0">
             <img 
                src={bgConfig?.url || "https://iili.io/f3kRcpn.png"} 
                alt="Status Background" 
                className="w-full h-full object-cover"
                style={getBgStyle()}
             />
             <div className="absolute inset-0 bg-black/20"></div>
         </div>

         <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-6xl mx-auto">
                <div className="bg-[#1a1a1a] border border-gold-600/20 rounded-lg overflow-hidden shadow-2xl backdrop-blur-sm">
                    <div className="p-4 md:p-6 border-b border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 bg-[#151515]">
                        <div className="flex items-center gap-2 text-gray-300 text-sm font-medium"><span>Show</span><select value={itemsPerPage} onChange={(e) => alert("Items per page fixed in this view for demo")} className="bg-black border border-gold-600/30 rounded px-2 py-1 text-white focus:border-gold-500 outline-none cursor-pointer"><option value={10}>10</option></select><span>entries</span></div>
                        <div className="flex items-center gap-2 bg-black border border-gold-600/30 rounded px-3 py-1.5 focus-within:border-gold-500 transition-colors w-full md:w-auto"><Search size={16} className="text-gold-500" /><input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="bg-transparent text-white text-sm outline-none w-full md:w-48 placeholder-gray-600" /></div>
                    </div>

                    <div className="block lg:hidden p-4 space-y-4">
                        {currentItems.map((platform) => (
                            <div key={platform.id} className="bg-black/60 border border-gray-800 rounded-xl p-4 flex items-center gap-4 relative overflow-hidden">
                                <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-700 bg-black p-1 flex-shrink-0"><img src={platform.image || 'https://placehold.co/100x100?text=No+Img'} alt={platform.name} className="w-full h-full object-cover" onError={(e) => e.currentTarget.src = 'https://placehold.co/100x100?text=Error'} /></div>
                                <div className="flex-1 min-w-0"><h4 className="font-bold text-white text-base truncate">{platform.name || 'Unknown Game'}</h4><div className="mt-1 flex items-center gap-2">{platform.status === 'Operational' ? (<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/30"><span className="w-1 h-1 rounded-full bg-green-400"></span>Operational</span>) : (<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/30"><span className="w-1 h-1 rounded-full bg-red-400"></span>Down</span>)}</div>{platform.details && <p className="text-xs text-red-300 italic mt-1 truncate">{platform.details}</p>}</div>
                            </div>
                        ))}
                    </div>

                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead className="bg-black border-b border-gold-600/50"><tr><th className="px-6 py-5 text-left text-xs font-bold text-gold-400 uppercase tracking-wider w-[25%] font-cinzel">ICON</th><th className="px-6 py-5 text-left text-xs font-bold text-gold-400 uppercase tracking-wider w-[25%] font-cinzel">GAMES</th><th className="px-6 py-5 text-left text-xs font-bold text-gold-400 uppercase tracking-wider w-[20%] font-cinzel">STATUS</th><th className="px-6 py-5 text-left text-xs font-bold text-gold-400 uppercase tracking-wider w-[30%] font-cinzel">REASON</th></tr></thead>
                            <tbody className="divide-y divide-gray-800 bg-[#1a1a1a]">
                                {currentItems.map((platform) => (
                                    <tr key={platform.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4"><div className="w-14 h-14 rounded-lg overflow-hidden border border-gray-700 bg-black p-1"><img src={platform.image || 'https://placehold.co/100x100?text=No+Img'} alt={platform.name} className="w-full h-full object-cover" onError={(e) => e.currentTarget.src = 'https://placehold.co/100x100?text=Error'} /></div></td>
                                        <td className="px-6 py-4"><span className="font-bold text-white text-lg">{platform.name || 'Unknown Game'}</span></td>
                                        <td className="px-6 py-4 align-middle">{platform.status === 'Operational' ? (<span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/30"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>Fully Operational</span>) : (<span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/30 shadow-red-500/20 shadow-lg"><span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>Down</span>)}</td>
                                        <td className="px-6 py-4 text-sm">{platform.details ? (<span className="text-red-300 italic flex items-center gap-2"><Info size={14} /> {platform.details}</span>) : (<span className="text-gray-600">-</span>)}</td>
                                    </tr>
                                ))}
                                {currentItems.length === 0 && (<tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">No entries found matching your search.</td></tr>)}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-[#151515] p-4 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
                        <div className="text-gray-400 font-medium">Showing <span className="text-white font-bold">{filteredPlatforms.length > 0 ? indexOfFirstItem + 1 : 0}</span> to <span className="text-white font-bold">{Math.min(indexOfLastItem, filteredPlatforms.length)}</span> of <span className="text-white font-bold">{filteredPlatforms.length}</span> entries</div>
                        <div className="flex items-center gap-1">
                             <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded border border-gray-700 text-gray-400 hover:text-white hover:border-gold-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={16} /></button>
                             {Array.from({ length: totalPages }).map((_, idx) => (<button key={idx} onClick={() => handlePageChange(idx + 1)} className={`w-8 h-8 flex items-center justify-center rounded border font-medium transition-colors ${currentPage === idx + 1 ? 'bg-gold-500 border-gold-500 text-black font-bold' : 'bg-transparent border-gray-700 text-gray-400 hover:border-gold-500 hover:text-white'}`}>{idx + 1}</button>))}
                             <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded border border-gray-700 text-gray-400 hover:text-white hover:border-gold-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronRight size={16} /></button>
                        </div>
                    </div>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default StatusPage;
