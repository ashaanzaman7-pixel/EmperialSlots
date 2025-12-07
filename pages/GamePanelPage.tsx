
import React, { useState, useEffect, useRef } from 'react';
import { User, ViewState, ImageSettings, GamePanelSoftware, TelegramSettings } from '../types';
import { Mail, Search, Save, RotateCcw, Loader2, Clock, Download, History, Gift, X, CheckCircle, AlertTriangle, FileText, RefreshCw } from 'lucide-react';
import { GoldButton, InputField } from '../components/UI';
import { initFirebase } from '../firebaseClient';
import { doc, setDoc, collection, onSnapshot, updateDoc, addDoc, query, orderBy, getDocs, where, getDoc, increment } from 'firebase/firestore';
import { sendTelegramMessage, checkTelegramUpdates } from '../services/telegramService';
import { useResponsiveImage } from '../hooks/useResponsiveImage';

interface GamePanelPageProps {
  user: User;
  onNavigate: (view: ViewState) => void;
  bgConfig?: ImageSettings;
  webhookUrl?: string;
  resetWebhookUrl?: string;
  transactionWebhookUrl?: string;
  softwareList?: GamePanelSoftware[];
  telegramConfig?: {
      create: TelegramSettings;
      reset: TelegramSettings;
      transaction: TelegramSettings;
      freePlay: TelegramSettings;
  };
  rules?: { adding: string; redeeming: string };
  onSupportOpen: () => void;
  warningChar?: ImageSettings;
}

interface PendingRequest {
    id: string;
    gameId: string;
    type: 'SAVE' | 'RESET' | 'ADD' | 'REDEEM' | 'FREEPLAY';
    details: any;
    status: 'pending' | 'approved' | 'rejected';
    timestamp: number;
}

interface FirestoreRequestData {
    type: 'SAVE' | 'RESET' | 'ADD' | 'REDEEM' | 'FREEPLAY';
    details: any;
    status: string;
    timestamp: number;
    processed_by_frontend?: boolean;
}

const GamePanelPage: React.FC<GamePanelPageProps> = ({ user, onNavigate, bgConfig, webhookUrl, resetWebhookUrl, transactionWebhookUrl, softwareList, telegramConfig, rules, onSupportOpen, warningChar }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data State
  const [dbPasswords, setDbPasswords] = useState<{ [gameId: string]: string }>({});
  const [localPasswords, setLocalPasswords] = useState<{ [gameId: string]: string }>({});
  const [freePlayRedeemed, setFreePlayRedeemed] = useState<{ [gameId: string]: boolean }>({});
  
  // Request State
  const [pendingRequests, setPendingRequests] = useState<{ [gameId: string]: PendingRequest }>({});
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  
  // Modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingGame, setPendingGame] = useState<{ id: string, name: string } | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetForm, setResetForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [resetError, setResetError] = useState('');
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionType, setTransactionType] = useState<'ADD' | 'REDEEM'>('ADD');
  const [transactionAmount, setTransactionAmount] = useState('');
  const [showFreePlayModal, setShowFreePlayModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showBalanceAlert, setShowBalanceAlert] = useState<{show: boolean, amount: number}>({ show: false, amount: 0 });
  const [showRedeemAlert, setShowRedeemAlert] = useState(false);
  const [showBusyModal, setShowBusyModal] = useState(false);
  
  // Processing Modal State
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [processingState, setProcessingState] = useState<'loading' | 'success' | 'error'>('loading');
  const [processingMessage, setProcessingMessage] = useState('');
  const [processingSubMessage, setProcessingSubMessage] = useState('');

  // Timers for transactions
  const [actionTimers, setActionTimers] = useState<{ [gameId: string]: number }>({});
  
  // Polling Refs
  const pollingRef = useRef<{ [reqId: string]: boolean }>({});
  const pollingOffsets = useRef<{ [reqId: string]: number }>({});

  const { getResponsiveStyle: getBgStyle } = useResponsiveImage(bgConfig);
  const { getResponsiveStyle: getWarningCharStyle } = useResponsiveImage(warningChar);

  const defaultGames: GamePanelSoftware[] = [
    { id: 'fk', name: 'Fire Kirin', status: 'Active', image: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=100&h=100&fit=crop' },
    { id: 'os', name: 'Orion Stars', status: 'Active', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=100&h=100&fit=crop' },
  ];
  const gamesToDisplay = softwareList && softwareList.length > 0 ? softwareList : defaultGames;
  const filteredGames = gamesToDisplay.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Cleanup Polling on Unmount
  useEffect(() => {
      return () => {
          // Stop all polling loops when component unmounts
          Object.keys(pollingRef.current).forEach(key => {
              pollingRef.current[key] = false;
          });
      };
  }, []);

  // 1. Listen for Account Data
  useEffect(() => {
    const fb = initFirebase();
    if (fb && user.id) {
        const unsubscribe = onSnapshot(collection(fb.db, "users", user.id, "game_accounts"), (snapshot) => {
            const loadedData: { [key: string]: string } = {};
            const redeemed: { [key: string]: boolean } = {};
            snapshot.forEach((doc) => {
                const data = doc.data() as any;
                if (data.password) { loadedData[doc.id] = data.password; }
                if (data.freePlayRedeemed) { redeemed[doc.id] = true; }
            });
            setDbPasswords(loadedData);
            setFreePlayRedeemed(redeemed);
        });
        return () => unsubscribe();
    }
  }, [user.id]);

  // 2. Timer Logic (Decrementor)
  useEffect(() => {
      const interval = setInterval(() => {
          setActionTimers(prev => {
              const next = { ...prev };
              let changed = false;
              Object.keys(next).forEach(gameId => {
                  // Check if there is an active pending request for this game
                  const req = pendingRequests[gameId];
                  // Only keep timer running if there is a valid PENDING request
                  if (req && req.status === 'pending') {
                      next[gameId] -= 1; 
                      changed = true;
                  } else {
                      // If no request (maybe finished/cancelled), clean up timer
                      if (next[gameId] !== undefined) {
                          delete next[gameId];
                          changed = true;
                      }
                  }
              });
              return changed ? next : prev;
          });
      }, 1000);
      return () => clearInterval(interval);
  }, [pendingRequests]);

  // 3. Load Pending Requests on Init (with cleanup for old/stale requests)
  useEffect(() => {
    const fb = initFirebase();
    if (fb && user.id) {
        const q = query(collection(fb.db, "users", user.id, "requests"), where("status", "==", "pending"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const currentPending: { [gameId: string]: PendingRequest } = {};
            let newTimers: { [gameId: string]: number } | null = null;
            const now = Date.now();
            const TTL = 15 * 60 * 1000; // 15 minutes TTL for ghost busting

            snapshot.forEach((docSnap) => {
                // Ensure data is typed correctly
                const data = docSnap.data() as any;
                // Safety Check: Ensure request isn't ancient
                if (data.timestamp && (now - data.timestamp > TTL)) return;

                if (data.details && data.details.gameId) {
                    const reqId = docSnap.id;
                    const gameId = data.details.gameId;
                    
                    currentPending[gameId] = {
                        id: reqId,
                        gameId: gameId,
                        type: data.type,
                        details: data.details,
                        status: 'pending',
                        timestamp: data.timestamp
                    };
                    
                    // Auto-restart polling if needed (only for recent requests)
                    if (!pollingRef.current[reqId] && telegramConfig?.create) {
                         // Determine which config to use based on type
                         let configToUse = telegramConfig.create;
                         if (data.type === 'RESET') configToUse = telegramConfig.reset;
                         else if (data.type === 'ADD' || data.type === 'REDEEM') configToUse = telegramConfig.transaction;
                         else if (data.type === 'FREEPLAY') configToUse = telegramConfig.freePlay;

                         startPolling(reqId, configToUse); 
                    }

                    // Calculate time
                    const created = data.timestamp || now;
                    const elapsedSeconds = Math.floor((now - created) / 1000);
                    const remaining = 120 - elapsedSeconds; 

                    if (newTimers === null) newTimers = {};
                    newTimers[gameId] = remaining;
                }
            });

            setPendingRequests(currentPending);

            // Force synchronization of timers with found requests
            setActionTimers(prev => {
                if (!newTimers) return {}; // Clear all if no requests
                const next = { ...prev };
                
                // Remove timers for games that no longer have pending requests
                Object.keys(next).forEach(gid => {
                    if (!newTimers![gid]) delete next[gid];
                });

                // Add/Update timers
                Object.entries(newTimers).forEach(([gid, time]) => {
                    if (next[gid] === undefined) next[gid] = time;
                });
                
                return next;
            });
        });
        return () => unsubscribe();
    }
  }, [user.id]);


  const handleLocalPasswordChange = (gameId: string, val: string) => setLocalPasswords(prev => ({ ...prev, [gameId]: val }));
  
  const initiateSave = (gameId: string, gameName: string) => { setPendingGame({ id: gameId, name: gameName }); setShowConfirmModal(true); };
  const initiateReset = (gameId: string, gameName: string) => { setPendingGame({ id: gameId, name: gameName }); setResetForm({ oldPassword: '', newPassword: '', confirmPassword: '' }); setResetError(''); setShowResetModal(true); };
  
  const initiateTransaction = (gameId: string, gameName: string, type: 'ADD' | 'REDEEM') => { 
      const hasActiveTransaction = Object.values(pendingRequests).some((req: any) => req.type === 'ADD' || req.type === 'REDEEM');
      if (hasActiveTransaction) {
          setShowBusyModal(true);
          return;
      }
      setPendingGame({ id: gameId, name: gameName }); 
      setTransactionType(type); 
      setTransactionAmount(''); 
      setShowTransactionModal(true); 
  };
  
  const initiateFreePlay = (gameId: string, gameName: string) => { setPendingGame({ id: gameId, name: gameName }); setShowFreePlayModal(true); };

  const logToHistory = async (action: string, details: any, isError: boolean = false) => { 
      const fb = initFirebase(); 
      if (fb && user.id) { 
          try { 
              await addDoc(collection(fb.db, "users", user.id, "history"), { 
                  action, 
                  details, 
                  isError,
                  timestamp: new Date().toISOString() 
              }); 
          } catch (e) {} 
      } 
  };

  // --- CLIENT SIDE POLLING LOOP (Optimized with OFFSET) ---
  const startPolling = async (reqId: string, settings: TelegramSettings | undefined) => {
      if (!settings) return;
      if (pollingRef.current[reqId]) return; // Prevent double polling

      pollingRef.current[reqId] = true;
      pollingOffsets.current[reqId] = 0; // Reset offset for new request
      
      const startTime = Date.now();
      const timeout = 300000; // 5 mins max poll time

      const poll = async () => {
          if (!pollingRef.current[reqId]) return;
          
          if (Date.now() - startTime > timeout) {
              delete pollingRef.current[reqId];
              delete pollingOffsets.current[reqId];
              return; 
          }

          // Pass the current offset to get only NEW updates
          const currentOffset = pollingOffsets.current[reqId] || 0;
          const update = await checkTelegramUpdates(settings, reqId, currentOffset);
          
          // Update local offset tracker to avoid duplicates
          if (update.nextOffset > currentOffset) {
              pollingOffsets.current[reqId] = update.nextOffset;
          }

          if (update.clicked) {
              // INSTANT UI UPDATE (Optimistic)
              delete pollingRef.current[reqId];
              delete pollingOffsets.current[reqId];
              
              // Determine Status
              const status = update.action === 'approve' ? 'approved' : 'rejected';
              
              // Update UI immediately to show done/declined
              // IMPORTANT: Using reqId directly ensures we target the right request even if state pendingGame changed
              updateUIOnCompletion(reqId, status); 
              
              // Perform DB operations in background
              await completeRequest(reqId, status);

          } else {
              // Loop with delay
              if (pollingRef.current[reqId]) {
                  setTimeout(poll, 1000); 
              }
          }
      };

      poll();
  };

  const completeRequest = async (reqId: string, status: 'approved' | 'rejected') => {
      const fb = initFirebase();
      if (!fb || !user.id) return;

      try {
          const reqDocRef = doc(fb.db, "users", user.id, "requests", reqId);
          const reqSnap = await getDoc(reqDocRef);

          if (!reqSnap.exists()) return;

          // Casting to FirestoreRequestData to avoid type issues with unknown
          const reqData = reqSnap.data() as FirestoreRequestData;
          const details = reqData.details;

          // Ensure UI is updated if we missed the optimistic update (e.g. refresh)
          updateUIOnCompletion(reqId, status, details?.gameId);

          // Idempotency check
          if (reqData.processed_by_frontend) return;

          if (status === 'approved') {
              if (reqData.type === 'SAVE' && details.password) {
                  await setDoc(doc(fb.db, "users", user.id, "game_accounts", details.gameId), { password: details.password, updatedAt: new Date().toISOString() }, { merge: true });
                  await logToHistory("Account Created", { game: details.gameName });
              } 
              else if (reqData.type === 'RESET' && details.newPassword) {
                  await updateDoc(doc(fb.db, "users", user.id, "game_accounts", details.gameId), { password: details.newPassword, updatedAt: new Date().toISOString() });
                  await logToHistory("Password Reset", { game: details.gameName });
              }
              else if (reqData.type === 'FREEPLAY') {
                  await setDoc(doc(fb.db, "users", user.id, "game_accounts", details.gameId), { freePlayRedeemed: true }, { merge: true });
                  await logToHistory("Free Play Redeemed", { game: details.gameName });
              }
              else if (reqData.type === 'ADD') {
                  await updateDoc(doc(fb.db, "users", user.id), { balance: increment(-details.amount) });
                  await logToHistory("Deposit Approved", { game: details.gameName, amount: details.amount });

                  try {
                      const cashRecordRef = doc(fb.db, "users", user.id, "cash_records", details.gameId);
                      const cashRecordSnap = await getDoc(cashRecordRef);
                      let recentAdds = [];
                      if (cashRecordSnap.exists()) { recentAdds = cashRecordSnap.data()?.recent_adds || []; }
                      recentAdds.push({ amount: details.amount, date: new Date().toISOString() });
                      if (recentAdds.length > 2) { recentAdds = recentAdds.slice(recentAdds.length - 2); }
                      await setDoc(cashRecordRef, { recent_adds: recentAdds }, { merge: true });
                  } catch (err) { console.error("Failed to update cash records", err); }
              }
              else if (reqData.type === 'REDEEM') {
                  await updateDoc(doc(fb.db, "users", user.id), { balance: increment(details.amount) });
                  await logToHistory("Redeem Approved", { game: details.gameName, amount: details.amount });
              }
          } else if (status === 'rejected') {
              if (reqData.type === 'REDEEM') {
                  await logToHistory("Request Declined", { game: details.gameName, amount: details.amount, reason: `Insufficient balance for redeeming amount from ${details.gameName}` }, true);
              } else {
                  await logToHistory("Request Rejected", { game: details.gameName, type: reqData.type }, true);
              }
          }

          // Mark as processed
          await updateDoc(reqDocRef, { status: status, processed_by_frontend: true });

      } catch (e) {
          console.error("Error completing request:", e);
      }
  };

  const updateUIOnCompletion = (reqId: string, status: 'approved' | 'rejected', gameId?: string) => {
      // 1. Update Modal if visible
      // We check if this request matches the one currently blocking the screen
      if (currentRequestId === reqId) {
           if (status === 'approved') {
              setProcessingState('success');
              setProcessingMessage("Successfully Processed!");
              setProcessingSubMessage("Your request has been completed.");
           } else {
              setProcessingState('error');
              setProcessingMessage("Request Denied.");
              setProcessingSubMessage("Admin declined your request.");
           }
           // Fast close
           setTimeout(() => {
              setShowProcessingModal(false);
              setProcessingState('loading');
              setCurrentRequestId(null);
           }, 1500);
      }

      // 2. Clear Pending State & Timer Locally
      // This removes the "Reset Pending" / "Transaction Pending" from the row
      
      // If gameId not provided, try to find it in pendingRequests
      let targetGameId = gameId;
      if (!targetGameId) {
          const found = Object.values(pendingRequests).find((r: any) => r.id === reqId);
          if (found) targetGameId = found.gameId;
      }

      if (targetGameId) {
          setPendingRequests(prev => {
              const next = { ...prev };
              delete next[targetGameId!];
              return next;
          });
          setActionTimers(prev => {
              const next = { ...prev };
              delete next[targetGameId!];
              return next;
          });
      }
  };


  // --- CORE LOGIC: Create Request ---
  const createRequest = async (type: 'SAVE' | 'RESET' | 'ADD' | 'REDEEM' | 'FREEPLAY', details: any, tgSettings: TelegramSettings | undefined, message: string, uiMessage: string, uiSub: string) => {
      const fb = initFirebase();
      if (!fb || !user.id) return;

      setShowProcessingModal(true);
      setProcessingState('loading');
      setProcessingMessage(uiMessage);
      setProcessingSubMessage(uiSub);

      try {
          // Use a fixed timestamp for consistency
          const now = Date.now();
          
          const reqRef = await addDoc(collection(fb.db, "users", user.id, "requests"), {
              type,
              details: { ...details, gameId: pendingGame?.id, gameName: pendingGame?.name },
              status: 'pending',
              timestamp: now,
              userId: user.id,
              userName: user.name,
              playerId: user.playerId,
              processed_by_frontend: false
          });

          setCurrentRequestId(reqRef.id);
          
          if (pendingGame) {
              setPendingRequests(prev => ({
                  ...prev,
                  [pendingGame.id]: {
                      id: reqRef.id,
                      gameId: pendingGame.id,
                      type,
                      details,
                      status: 'pending',
                      timestamp: now
                  }
              }));
              setActionTimers(prev => ({ ...prev, [pendingGame.id]: 120 }));
          }
          
          const buttons = [];
          buttons.push({ text: "✅ Confirm", callback_data: `approve:${user.id}:${reqRef.id}` });
          if (type === 'REDEEM') {
              buttons.push({ text: "❌ Decline", callback_data: `decline:${user.id}:${reqRef.id}` });
          } else {
              buttons.push({ text: "❌ Decline", callback_data: `decline:${user.id}:${reqRef.id}` });
          }

          await sendTelegramMessage(tgSettings, message, [buttons]);
          startPolling(reqRef.id, tgSettings);

      } catch (e) {
          console.error("Error creating request", e);
          setProcessingState('error');
          setProcessingMessage("System Error");
          setProcessingSubMessage("Please try again.");
          setTimeout(() => setShowProcessingModal(false), 2000);
      }
  };

  const handleConfirmAndLock = async () => {
      if (!pendingGame) return;
      setShowConfirmModal(false);
      const pass = localPasswords[pendingGame.id];
      const msg = `🆕 <b>ACCOUNT SAVE REQUEST</b>\n👤 User: ${user.name}\n🆔 ID: ${user.playerId}\n🎮 Game: ${pendingGame.name}\n🔑 Pass: <code>${pass}</code>`;
      await createRequest('SAVE', { password: pass }, telegramConfig?.create, msg, "Setting up your account...", "Please wait while we secure your credentials.");
  };

  const handleResetConfirm = async () => {
      if (!pendingGame) return;
      if (resetForm.newPassword !== resetForm.confirmPassword) { setResetError("Passwords do not match"); return; }
      if (resetForm.oldPassword !== dbPasswords[pendingGame.id]) { setResetError("Incorrect old password"); return; }
      setShowResetModal(false);
      const msg = `🔄 <b>PASSWORD RESET REQUEST</b>\n👤 User: ${user.name}\n🆔 ID: ${user.playerId}\n🎮 Game: ${pendingGame.name}\n🔑 Old: <code>${resetForm.oldPassword}</code>\n🆕 New: <code>${resetForm.newPassword}</code>`;
      await createRequest('RESET', { oldPassword: resetForm.oldPassword, newPassword: resetForm.newPassword }, telegramConfig?.reset, msg, "Resetting Password...", "Your new credentials are being applied.");
  };

  const handleTransactionConfirm = async () => {
      if (!pendingGame) return;
      const amount = parseInt(transactionAmount);
      if (isNaN(amount) || amount <= 0 || transactionAmount.includes('.')) { alert("Please enter a valid whole number amount."); return; }

      if (transactionType === 'ADD' && user.balance < amount) {
          setShowTransactionModal(false);
          setShowBalanceAlert({ show: true, amount });
          return;
      }

      if (transactionType === 'REDEEM' && amount < 50) {
          setShowTransactionModal(false);
          setShowRedeemAlert(true); 
          return;
      }

      setShowTransactionModal(false); 
      const msg = `💸 <b>${transactionType} REQUEST</b>\n👤 User: ${user.name}\n🆔 ID: ${user.playerId}\n🎮 Game: ${pendingGame.name}\n💰 Amount: <b>${amount}</b>`;
      await createRequest(transactionType, { amount }, telegramConfig?.transaction, msg, "Processing Transaction...", "Verifying funds and updating balance.");
  };

  const handleFreePlayConfirm = async () => {
      if (!pendingGame) return;
      setShowFreePlayModal(false);
      const msg = `🎁 <b>FREE PLAY REQUEST</b>\n👤 User: ${user.name}\n🆔 ID: ${user.playerId}\n🎮 Game: ${pendingGame.name}`;
      await createRequest('FREEPLAY', {}, telegramConfig?.freePlay, msg, "Activating Free Play...", "Checking eligibility...");
  };

  const loadHistory = async () => { const fb = initFirebase(); if (fb && user.id) { const q = query(collection(fb.db, "users", user.id, "history"), orderBy("timestamp", "desc")); const snapshot = await getDocs(q); const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); setHistoryData(data); setShowHistoryModal(true); } };
  const formatTimer = (seconds: number) => { const absSeconds = Math.abs(seconds); const m = Math.floor(absSeconds / 60); const s = absSeconds % 60; const sign = seconds < 0 ? "-" : ""; return `${sign}${m}:${s.toString().padStart(2, '0')}`; };

  return (
    <div className="min-h-screen bg-black font-sans relative overflow-hidden">
        <div className="absolute inset-0 z-0">
            <img 
                src={bgConfig?.url || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop"} 
                alt="Game Panel Background" 
                className="w-full h-full object-cover"
                style={getBgStyle()}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black"></div>
        </div>

        <div className="container mx-auto px-4 py-24 pb-12 relative z-10">
            <div className="flex flex-col items-center text-center mb-8">
                <h1 className="text-3xl md:text-5xl font-cinzel font-bold text-gold-100 mb-2 drop-shadow-lg">GAME PANEL</h1>
                <p className="text-gray-400 text-sm md:text-base max-w-xl">Manage your gaming accounts and access premium software.</p>
            </div>

            <div className="relative bg-[#1a1a1a]/80 border-l-4 border-gold-500 rounded-r-xl p-6 mb-8 max-w-4xl mx-auto shadow-lg backdrop-blur-sm flex items-start gap-4">
                <div className="hidden lg:block absolute -left-20 bottom-0 pointer-events-none">
                    {warningChar && warningChar.url && (
                        <img 
                            src={warningChar.url} 
                            className="h-[200px] w-auto object-contain drop-shadow-lg"
                            style={getWarningCharStyle()} 
                        />
                    )}
                </div>
                <AlertTriangle className="text-gold-500 flex-shrink-0 mt-1" size={24} />
                <div className="space-y-2 text-sm text-gray-300">
                    <p><strong className="text-white">Note:</strong> Each player is granted a single Free Play opportunity. Select your game wisely.</p>
                    <p><strong className="text-white">Important:</strong> Please review the Adding and Redeeming Rules before initiating transactions.</p>
                    <p><strong className="text-white">Redemption Policy:</strong> Do not request more than your available balance. You must be logged out of the specific gaming platform to process redemption. Non-compliant requests will be denied.</p>
                </div>
            </div>

            <div className="bg-[#121212]/90 border border-gold-600/30 rounded-2xl shadow-gold-glow overflow-hidden backdrop-blur-md">
                <div className="p-4 md:p-6 border-b border-gray-800 bg-black/40 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <input type="text" placeholder="Search games..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:border-gold-500 outline-none" />
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={loadHistory} className="flex items-center gap-2 text-gray-400 hover:text-white text-xs md:text-sm font-bold transition-colors"><History size={16} /> History</button>
                        <button onClick={() => setShowRulesModal(true)} className="flex items-center gap-2 text-gold-400 hover:text-white text-xs md:text-sm font-bold transition-colors"><FileText size={16} /> Rules</button>
                        <button onClick={onSupportOpen} className="flex items-center gap-2 bg-gold-900/20 text-gold-400 border border-gold-600/30 px-4 py-2 rounded-lg hover:bg-gold-900/40 text-xs md:text-sm font-bold transition-colors"><Mail size={16} /> Support</button>
                    </div>
                </div>

                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full min-w-[1000px]">
                        <thead className="bg-black text-xs text-gold-500 font-bold uppercase font-cinzel tracking-wider">
                            <tr>
                                <th className="px-6 py-4 text-left">Software</th>
                                <th className="px-6 py-4 text-left">Password</th>
                                <th className="px-6 py-4 text-left">Account ID</th>
                                <th className="px-6 py-4 text-center">Settings</th>
                                <th className="px-6 py-4 text-center">IN / OUT</th>
                                <th className="px-6 py-4 text-center">Free Play</th>
                                <th className="px-6 py-4 text-center">Download</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {filteredGames.map((game) => {
                                const isSaved = !!dbPasswords[game.id];
                                const activeReq = pendingRequests[game.id];
                                // Only consider it pending if there is an ACTUAL active request in state
                                const isPendingSave = activeReq?.type === 'SAVE';
                                const isPendingReset = activeReq?.type === 'RESET';
                                const isPendingFree = activeReq?.type === 'FREEPLAY';
                                
                                const currentPassword = isSaved ? dbPasswords[game.id] : (localPasswords[game.id] || '');
                                const timer = actionTimers[game.id];
                                const isFreeRedeemed = freePlayRedeemed[game.id];

                                return (
                                    <tr key={game.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4"><div className="flex items-center gap-3"><img src={game.image} className="w-10 h-10 rounded bg-gray-800 object-cover border border-gray-700" alt={game.name} /><span className="font-bold text-white">{game.name}</span></div></td>
                                        
                                        {/* PASSWORD COLUMN */}
                                        <td className="px-6 py-4">
                                            {isPendingSave ? (
                                                <div className="text-xs text-gold-500 font-bold animate-pulse flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Account is being setup...</div>
                                            ) : (
                                                <input type="text" value={currentPassword} onChange={(e) => handleLocalPasswordChange(game.id, e.target.value)} disabled={isSaved} placeholder="Set Password" className={`bg-black/50 border rounded px-3 py-2 text-sm w-32 outline-none transition-colors ${isSaved ? 'border-green-500/50 text-green-400 cursor-not-allowed opacity-80' : 'border-gray-700 text-white focus:border-gold-500'}`} />
                                            )}
                                        </td>
                                        
                                        <td className="px-6 py-4"><span className="font-mono text-gold-400 text-sm tracking-wide bg-black/40 px-2 py-1 rounded border border-gold-900/30">{user.playerId}</span></td>
                                        
                                        {/* SETTINGS (SAVE/RESET) */}
                                        <td className="px-6 py-4 text-center">
                                            {isPendingSave ? (
                                                <span className="text-gray-500 text-[10px] uppercase font-bold">Setup Pending</span>
                                            ) : isPendingReset ? (
                                                timer > 0 ? (
                                                    <span className="text-gold-400 font-mono text-xs flex items-center justify-center gap-1"><Clock size={12} /> {formatTimer(timer)}</span>
                                                ) : (
                                                    <div className="px-4 py-1.5 rounded bg-blue-900/10 text-blue-400 border border-blue-500/30 text-xs font-bold flex items-center justify-center gap-1 mx-auto animate-pulse">Reset Pending</div>
                                                )
                                            ) : isSaved ? ( 
                                                <button onClick={() => initiateReset(game.id, game.name)} className="px-4 py-1.5 rounded bg-blue-900/20 text-blue-400 border border-blue-500/50 hover:bg-blue-900/40 text-xs font-bold transition-all flex items-center justify-center gap-1 mx-auto"><RotateCcw size={12} /> Reset</button> 
                                            ) : ( 
                                                <button onClick={() => initiateSave(game.id, game.name)} disabled={!currentPassword} className={`px-4 py-1.5 rounded text-xs font-bold transition-all flex items-center justify-center gap-1 mx-auto ${currentPassword ? 'bg-green-600 text-black hover:bg-green-500 shadow-lg cursor-pointer' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}><Save size={12} /> Save</button> 
                                            )}
                                        </td>
                                        
                                        {/* IN/OUT (Timer) */}
                                        <td className="px-6 py-4 text-center">
                                            {timer !== undefined && (activeReq?.type === 'ADD' || activeReq?.type === 'REDEEM') ? ( 
                                                timer > 0 ? (
                                                    <span className="text-gold-400 font-mono text-xs flex items-center justify-center gap-1"><Clock size={12} /> {formatTimer(timer)}</span>
                                                ) : (
                                                    <span className="text-red-400 font-bold text-xs animate-pulse">Pending...</span>
                                                )
                                            ) : ( 
                                                <div className="flex justify-center gap-2"><button onClick={() => initiateTransaction(game.id, game.name, 'ADD')} className="px-3 py-1 bg-gold-500/10 text-gold-500 border border-gold-500/50 rounded hover:bg-gold-500 hover:text-black text-xs font-bold transition-colors">ADD</button><button onClick={() => initiateTransaction(game.id, game.name, 'REDEEM')} className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/50 rounded hover:bg-red-500 hover:text-black text-xs font-bold transition-colors">REDEEM</button></div> 
                                            )}
                                        </td>
                                        
                                        {/* FREE PLAY */}
                                        <td className="px-6 py-4 text-center">
                                            {isPendingFree ? (
                                                <span className="text-xs font-bold text-gray-400 flex items-center justify-center gap-1"><Loader2 size={12} className="animate-spin"/> Pending</span>
                                            ) : isFreeRedeemed ? ( 
                                                <span className="text-gray-500 text-xs font-bold uppercase">Redeemed</span> 
                                            ) : ( 
                                                <button onClick={() => initiateFreePlay(game.id, game.name)} disabled={!isSaved} className={`p-2 rounded-full transition-all ${isSaved ? 'bg-green-500 text-black hover:scale-110 shadow-lg animate-bounce' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`} title="Free Play"><Gift size={16} /></button> 
                                            )}
                                        </td>
                                        
                                        <td className="px-6 py-4 text-center">{game.downloadUrl && ( <a href={game.downloadUrl} target="_blank" className="inline-block p-2 rounded bg-black border border-gray-700 text-gray-400 hover:text-white hover:border-gold-500 transition-colors"><Download size={16} /></a> )}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                
                {/* MOBILE VIEW */}
                <div className="block lg:hidden p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredGames.map((game) => {
                            const isSaved = !!dbPasswords[game.id];
                            const activeReq = pendingRequests[game.id];
                            const isPendingSave = activeReq?.type === 'SAVE';
                            const isPendingReset = activeReq?.type === 'RESET';
                            const isPendingFree = activeReq?.type === 'FREEPLAY';
                            
                            const currentPassword = isSaved ? dbPasswords[game.id] : (localPasswords[game.id] || '');
                            const timer = actionTimers[game.id];
                            const isFreeRedeemed = freePlayRedeemed[game.id];
                            
                            return (
                                <div key={game.id} className="bg-black/40 border border-gray-800 rounded-xl p-5 flex flex-col gap-4 relative overflow-hidden">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3"><img src={game.image} className="w-12 h-12 rounded bg-gray-800 object-cover border border-gray-700" alt={game.name} /><div><h3 className="font-bold text-white text-lg">{game.name}</h3><span className="text-xs text-gold-500 font-mono tracking-wide">{user.playerId}</span></div></div>
                                        {game.downloadUrl && ( <a href={game.downloadUrl} target="_blank" className="p-2 rounded bg-black border border-gray-700 text-gray-400 hover:text-white hover:border-gold-500 transition-colors"><Download size={18} /></a> )}
                                    </div>
                                    
                                    <div className="flex gap-2 items-center">
                                        {isPendingSave ? (
                                            <div className="flex-1 bg-black/30 border border-gold-500/30 rounded py-2 px-3 text-gold-400 text-xs font-bold animate-pulse flex items-center gap-2"><Loader2 size={14} className="animate-spin"/> Account Setup Pending...</div>
                                        ) : (
                                            <input type="text" value={currentPassword} onChange={(e) => handleLocalPasswordChange(game.id, e.target.value)} disabled={isSaved} placeholder="Set Password" className={`flex-1 bg-black/50 border rounded px-3 py-2 text-sm outline-none transition-colors ${isSaved ? 'border-green-500/50 text-green-400 cursor-not-allowed opacity-80' : 'border-gray-700 text-white focus:border-gold-500'}`} />
                                        )}
                                        
                                        {isPendingSave ? null : isPendingReset ? (
                                             timer > 0 ? (
                                                <div className="px-3 py-2 rounded bg-blue-900/20 text-blue-400 border border-blue-500/50 text-xs font-mono">{formatTimer(timer)}</div>
                                            ) : (
                                                <div className="px-3 py-2 rounded bg-blue-900/20 text-blue-400 border border-blue-500/50 text-xs font-bold animate-pulse">Pending</div>
                                            )
                                        ) : isSaved ? ( 
                                            <button onClick={() => initiateReset(game.id, game.name)} className="px-3 rounded bg-blue-900/20 text-blue-400 border border-blue-500/50 hover:bg-blue-900/40 text-xs font-bold transition-all flex items-center justify-center gap-1"><RotateCcw size={16} /></button> 
                                        ) : ( 
                                            <button onClick={() => initiateSave(game.id, game.name)} disabled={!currentPassword} className={`px-3 rounded text-xs font-bold transition-all flex items-center justify-center gap-1 ${currentPassword ? 'bg-green-600 text-black hover:bg-green-500 shadow-lg' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}><Save size={16} /></button> 
                                        )}
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                        {timer !== undefined && (activeReq?.type === 'ADD' || activeReq?.type === 'REDEEM') ? ( 
                                            timer > 0 ? (
                                                <div className="col-span-2 flex items-center justify-center bg-black/60 border rounded py-2 text-gold-400 font-mono text-sm animate-pulse"><Clock size={14} className="mr-2" /> {formatTimer(timer)}</div>
                                            ) : (
                                                 <div className="col-span-2 flex items-center justify-center bg-black/60 border border-red-500/30 rounded py-2 text-red-400 font-bold text-sm animate-pulse">Transaction Pending...</div>
                                            )
                                        ) : ( 
                                            <><button onClick={() => initiateTransaction(game.id, game.name, 'ADD')} className="py-2 bg-gold-500/10 text-gold-500 border border-gold-500/50 rounded hover:bg-gold-500 hover:text-black text-xs font-bold transition-colors">ADD</button><button onClick={() => initiateTransaction(game.id, game.name, 'REDEEM')} className="py-2 bg-red-500/10 text-red-500 border border-red-500/50 rounded hover:bg-red-500 hover:text-black text-xs font-bold transition-colors">REDEEM</button></> 
                                        )}
                                        
                                        {isPendingFree ? (
                                            <div className="flex items-center justify-center"><Loader2 size={18} className="text-green-500 animate-spin"/></div>
                                        ) : isFreeRedeemed ? ( 
                                            <div className="flex items-center justify-center bg-gray-900 border border-gray-800 rounded text-gray-500 text-[10px] font-bold uppercase">Redeemed</div> 
                                        ) : ( 
                                            <button onClick={() => initiateFreePlay(game.id, game.name)} disabled={!isSaved} className={`flex items-center justify-center rounded transition-all ${isSaved ? 'bg-green-500 text-black animate-bounce shadow-lg' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}><Gift size={18} /></button> 
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>

        {showRulesModal && (
            <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-[#151515] border border-gold-600 rounded-xl p-8 max-w-lg w-full shadow-gold-glow relative">
                    <button onClick={() => setShowRulesModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20} /></button>
                    <h3 className="text-2xl font-cinzel font-bold text-gold-100 mb-6 flex items-center gap-2"><FileText className="text-gold-500"/> Official Rules</h3>
                    <div className="space-y-6">
                        <div className="bg-black/40 p-4 rounded-xl border border-gray-800">
                            <h4 className="text-gold-400 font-bold mb-2 uppercase text-sm">Adding Coins</h4>
                            <p className="text-gray-300 text-sm leading-relaxed">{rules?.adding || "Please read rules before adding."}</p>
                        </div>
                        <div className="bg-black/40 p-4 rounded-xl border border-gray-800">
                            <h4 className="text-red-400 font-bold mb-2 uppercase text-sm">Redeeming Coins</h4>
                            <p className="text-gray-300 text-sm leading-relaxed">{rules?.redeeming || "Please read rules before redeeming."}</p>
                        </div>
                    </div>
                    <GoldButton onClick={() => setShowRulesModal(false)} className="w-full mt-8 py-3 text-sm">I Understand</GoldButton>
                </div>
            </div>
        )}

        {showConfirmModal && pendingGame && (
            <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-[#151515] border border-gold-600 rounded-xl p-8 max-w-sm w-full text-center shadow-gold-glow">
                    <AlertTriangle className="w-12 h-12 text-gold-500 mx-auto mb-4 animate-pulse" />
                    <h3 className="text-xl font-bold text-white mb-2">Confirm Password</h3>
                    <p className="text-gray-400 mb-6 text-sm">Are you sure you want <strong>{localPasswords[pendingGame.id]}</strong> as the password for {pendingGame.name}?</p>
                    <div className="flex gap-3"><button onClick={() => setShowConfirmModal(false)} className="flex-1 py-2 rounded bg-gray-800 text-white hover:bg-gray-700 transition-colors">Cancel</button><GoldButton onClick={handleConfirmAndLock} className="flex-1 py-2 text-sm">Confirm & Lock</GoldButton></div>
                </div>
            </div>
        )}

        {showTransactionModal && pendingGame && (
            <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-[#151515] border border-gold-600 rounded-xl p-8 max-w-sm w-full text-center shadow-gold-glow">
                    <h3 className="text-xl font-bold text-white mb-4">{transactionType === 'ADD' ? 'Add Coins' : 'Redeem Coins'}</h3>
                    <p className="text-gold-400 text-sm mb-4 font-mono uppercase">{pendingGame.name} (ID: {user.playerId})</p>
                    <InputField type="number" placeholder="Enter whole amount..." value={transactionAmount} onChange={(e) => setTransactionAmount(e.target.value)} autoFocus />
                    <div className="flex gap-3 mt-6"><button onClick={() => setShowTransactionModal(false)} className="flex-1 py-2 rounded bg-gray-800 text-white hover:bg-gray-700 transition-colors">Cancel</button><GoldButton onClick={handleTransactionConfirm} className="flex-1 py-2 text-sm">Confirm</GoldButton></div>
                </div>
            </div>
        )}
        
        {showBalanceAlert.show && (
            <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-[#151515] border-2 border-red-500 rounded-2xl p-8 max-w-sm w-full text-center shadow-[0_0_40px_rgba(239,68,68,0.4)]">
                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4 animate-bounce" />
                    <h3 className="text-2xl font-cinzel font-bold text-white mb-4">Insufficient Balance</h3>
                    <p className="text-gray-300 mb-6 leading-relaxed">
                        Your balance is less than <span className="text-gold-400 font-bold">${showBalanceAlert.amount}</span>.
                    </p>
                    <p className="text-sm text-gray-400 italic mb-8">Deposit balance and enjoy your favorite game. And win jackpot!</p>
                    <GoldButton onClick={() => { setShowBalanceAlert({ show: false, amount: 0 }); onNavigate(ViewState.DEPOSIT); }} className="w-full">Deposit Now</GoldButton>
                    <button onClick={() => setShowBalanceAlert({ show: false, amount: 0 })} className="mt-4 text-gray-500 hover:text-white text-sm">Close</button>
                </div>
            </div>
        )}
        
        {/* REDEEM ALERT MODAL */}
        {showRedeemAlert && (
            <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-[#151515] border-2 border-red-500 rounded-2xl p-8 max-w-sm w-full text-center shadow-[0_0_40px_rgba(239,68,68,0.4)]">
                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4 animate-bounce" />
                    <h3 className="text-2xl font-cinzel font-bold text-white mb-4">Warning</h3>
                    <p className="text-red-400 font-bold mb-2">Amount should be 50$ or more</p>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6">Please read the redeem rule for more understanding.</p>
                    <GoldButton onClick={() => setShowRedeemAlert(false)} className="w-full">I Understand</GoldButton>
                </div>
            </div>
        )}

        {/* BUSY / BLOCKING ALERT MODAL */}
        {showBusyModal && (
            <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-[#151515] border-2 border-gold-500 rounded-xl p-8 max-w-sm w-full text-center shadow-gold-glow">
                    <div className="w-16 h-16 bg-gold-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-gold-500/50">
                        <Loader2 className="text-gold-500 w-8 h-8 animate-spin" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Request In Progress</h3>
                    <p className="text-gray-300 text-sm leading-relaxed mb-6 uppercase tracking-wide">
                        WE ARE BUSY WITH YOUR CURRENT REQUEST, THIS WON'T TAKE TOO LONG.
                    </p>
                    <GoldButton onClick={() => setShowBusyModal(false)} className="w-full py-3 text-sm">Okay, I'll Wait</GoldButton>
                </div>
            </div>
        )}

        {showResetModal && pendingGame && (
            <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-[#151515] border border-gold-600 rounded-xl p-8 max-w-sm w-full text-center shadow-gold-glow">
                    <RotateCcw className="w-10 h-10 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-6">Reset Password</h3>
                    <div className="space-y-4 text-left"><InputField type="text" placeholder="Old Password" value={resetForm.oldPassword} onChange={(e) => setResetForm({...resetForm, oldPassword: e.target.value})} /><InputField type="text" placeholder="New Password" value={resetForm.newPassword} onChange={(e) => setResetForm({...resetForm, newPassword: e.target.value})} /><InputField type="text" placeholder="Confirm New Password" value={resetForm.confirmPassword} onChange={(e) => setResetForm({...resetForm, confirmPassword: e.target.value})} /></div>
                    {resetError && <p className="text-red-500 text-xs mt-4 font-bold text-center">{resetError}</p>}
                    <div className="flex gap-3 mt-6"><button onClick={() => setShowResetModal(false)} className="flex-1 py-2 rounded bg-gray-800 text-white hover:bg-gray-700 transition-colors">Cancel</button><button onClick={handleResetConfirm} className="flex-1 py-2 rounded bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors">Reset</button></div>
                </div>
            </div>
        )}

        {showFreePlayModal && pendingGame && (
            <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-[#151515] border border-green-500/50 rounded-xl p-8 max-w-sm w-full text-center shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                    <Gift className="w-12 h-12 text-green-500 mx-auto mb-4 animate-bounce" />
                    <h3 className="text-xl font-bold text-white mb-2">Enable Free Play?</h3>
                    <p className="text-gray-400 mb-6 text-sm">Are you sure you want to enable free play for <strong>{pendingGame.name}</strong>? This can only be done once.</p>
                    <div className="flex gap-3"><button onClick={() => setShowFreePlayModal(false)} className="flex-1 py-2 rounded bg-gray-800 text-white hover:bg-gray-700 transition-colors">Cancel</button><button onClick={handleFreePlayConfirm} className="flex-1 py-2 rounded bg-green-600 text-black font-bold hover:bg-green-500 transition-colors shadow-lg">Yes, Enable</button></div>
                </div>
            </div>
        )}

        {showProcessingModal && (
            <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
                <div className="text-center relative w-full max-w-sm">
                    {/* Add manual refresh button in case socket hangs */}
                    <button 
                        onClick={() => setCurrentRequestId(currentRequestId)} // Re-triggers effect
                        className="absolute top-0 right-8 text-gray-500 hover:text-gold-500 p-2"
                        title="Force Check Status"
                    >
                        <RefreshCw size={16} />
                    </button>
                    
                    {/* Close Button */}
                    <button 
                        onClick={() => setShowProcessingModal(false)}
                        className="absolute top-0 right-0 text-gray-500 hover:text-white p-2"
                        title="Close"
                    >
                        <X size={18} />
                    </button>

                    {processingState === 'loading' ? ( 
                        <>
                            <div className="relative w-20 h-20 mx-auto mb-6">
                                <div className="absolute inset-0 border-4 border-gold-500/30 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-t-gold-500 rounded-full animate-spin"></div>
                                <Loader2 className="absolute inset-0 m-auto text-gold-500 w-8 h-8 animate-pulse" />
                            </div>
                            <h3 className="text-2xl font-cinzel font-bold text-white mb-2 animate-pulse">{processingMessage}</h3>
                            <p className="text-gray-400 text-sm">{processingSubMessage}</p>
                        </> 
                    ) : processingState === 'success' ? ( 
                        <div className="animate-fade-in transform scale-110">
                            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(34,197,94,0.6)]">
                                <CheckCircle className="text-black w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Success!</h3>
                            <p className="text-green-400">{processingMessage}</p>
                        </div> 
                    ) : (
                        <div className="animate-fade-in transform scale-110">
                            <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(239,68,68,0.6)]">
                                <X className="text-black w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Rejected</h3>
                            <p className="text-red-400">{processingMessage}</p>
                        </div>
                    )}
                </div>
            </div>
        )}

        {showHistoryModal && (
            <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-[#151515] border border-gold-600/30 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-gold-glow">
                    <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#1a1a1a]"><h3 className="text-xl font-bold text-white flex items-center gap-2"><History className="text-gold-500" /> Activity Log</h3><button onClick={() => setShowHistoryModal(false)}><X className="text-gray-500 hover:text-white" /></button></div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                        {historyData.length === 0 ? ( <p className="text-center text-gray-500 italic">No history found.</p> ) : ( historyData.map((item, idx) => ( 
                            <div key={idx} className={`border p-4 rounded-xl flex items-start justify-between ${item.isError ? 'bg-red-900/10 border-red-900/30' : 'bg-black/40 border-gray-800'}`}>
                                <div>
                                    <p className={`${item.isError ? 'text-red-400' : 'text-gold-400'} font-bold text-sm mb-1 flex items-center gap-2`}>
                                        {item.isError && <AlertTriangle size={12} />}
                                        {item.action}
                                    </p>
                                    <p className="text-gray-400 text-xs">
                                        {item.details?.game && <span className="text-white mr-2">{item.details.game}</span>}
                                        {item.details?.amount && <span className={`${item.isError ? 'text-gray-500' : 'text-green-400 font-bold'} mr-2`}>${item.details.amount}</span>}
                                        {item.details?.reason && <span className="text-red-300 block mt-1 italic">{item.details.reason}</span>}
                                    </p>
                                </div>
                                <div className="text-right"><p className="text-gray-500 text-[10px]">{new Date(item.timestamp).toLocaleDateString()}</p><p className="text-gray-600 text-[10px]">{new Date(item.timestamp).toLocaleTimeString()}</p></div>
                            </div> 
                        )) )}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default GamePanelPage;
