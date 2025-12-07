
import React, { useState, useEffect } from 'react';
import { User, ViewState, P2PTransaction } from '../types';
import { Send, ArrowLeft, Search, History, ArrowUpRight, ArrowDownLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import { GoldButton, InputField } from '../components/UI';
import { initFirebase } from '../firebaseClient';
import { doc, collection, query, where, getDocs, runTransaction, onSnapshot, orderBy, addDoc } from 'firebase/firestore';

interface P2PTransferPageProps {
  user: User;
  onNavigate: (view: ViewState) => void;
}

const P2PTransferPage: React.FC<P2PTransferPageProps> = ({ user, onNavigate }) => {
  const [amount, setAmount] = useState('');
  const [receiverEmail, setReceiverEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [history, setHistory] = useState<P2PTransaction[]>([]);

  // Load History
  useEffect(() => {
      const fb = initFirebase();
      if (fb && user.id) {
          const historyRef = collection(fb.db, "users", user.id, "p2p_history");
          const q = query(historyRef, orderBy("timestamp", "desc"));
          
          const unsubscribe = onSnapshot(q, (snapshot) => {
              const txs: P2PTransaction[] = [];
              snapshot.forEach(doc => {
                  txs.push({ id: doc.id, ...doc.data() } as P2PTransaction);
              });
              setHistory(txs);
          });
          return () => unsubscribe();
      }
  }, [user.id]);

  const handleTransfer = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setSuccessMsg('');
      setLoading(true);

      // 1. Validation
      const valAmount = parseInt(amount);
      if (isNaN(valAmount) || valAmount < 2 || amount.includes('.')) {
          setError("Amount must be a whole number and at least $2.");
          setLoading(false);
          return;
      }

      if (receiverEmail.toLowerCase() === user.email.toLowerCase()) {
          setError("You cannot send funds to yourself.");
          setLoading(false);
          return;
      }

      const fb = initFirebase();
      if (!fb) { setError("System error."); setLoading(false); return; }

      try {
          // 2. Find Receiver by Email
          const usersRef = collection(fb.db, "users");
          const q = query(usersRef, where("email", "==", receiverEmail));
          const querySnapshot = await getDocs(q);

          if (querySnapshot.empty) {
              setError("Receiver email not found in our system.");
              setLoading(false);
              return;
          }

          const receiverDoc = querySnapshot.docs[0];
          const receiverData = receiverDoc.data();
          const receiverUid = receiverDoc.id;

          // 3. Run Atomic Transaction
          await runTransaction(fb.db, async (transaction) => {
              const senderDocRef = doc(fb.db, "users", user.id);
              const receiverDocRef = doc(fb.db, "users", receiverUid);

              const senderSnap = await transaction.get(senderDocRef);
              if (!senderSnap.exists()) throw new Error("Sender not found");

              const senderBalance = senderSnap.data().balance || 0;
              if (senderBalance < valAmount) {
                  throw new Error("Insufficient balance.");
              }

              const newSenderBalance = senderBalance - valAmount;
              const newReceiverBalance = (receiverData.balance || 0) + valAmount;

              // Update Balances
              transaction.update(senderDocRef, { balance: newSenderBalance });
              transaction.update(receiverDocRef, { balance: newReceiverBalance });
          });

          // 4. Log History (Post-Transaction Success)
          const timestamp = new Date().toISOString();
          
          // Log for Sender
          await addDoc(collection(fb.db, "users", user.id, "p2p_history"), {
              type: 'Sent',
              amount: valAmount,
              counterpartyName: receiverData.name || 'Unknown',
              counterpartyEmail: receiverData.email,
              timestamp: timestamp,
              status: 'Success'
          });

          // Log for Receiver
          await addDoc(collection(fb.db, "users", receiverUid, "p2p_history"), {
              type: 'Received',
              amount: valAmount,
              counterpartyName: user.name,
              counterpartyEmail: user.email,
              timestamp: timestamp,
              status: 'Success'
          });

          setSuccessMsg(`Successfully sent $${valAmount} to ${receiverData.name}!`);
          setAmount('');
          setReceiverEmail('');

      } catch (err: any) {
          console.error(err);
          setError(err.message || "Transfer failed.");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans relative overflow-hidden pt-24 pb-12">
        
        {/* Background */}
        <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0A] via-black to-[#121212]"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
            <button onClick={() => onNavigate(ViewState.HOME)} className="mb-8 flex items-center gap-2 text-gold-400 hover:text-white transition-colors">
                <ArrowLeft size={20} /> Back to Home
            </button>

            <div className="flex flex-col xl:flex-row gap-8">
                
                {/* LEFT: TRANSFER FORM */}
                <div className="w-full xl:w-1/3">
                    <div className="bg-[#151515] border border-gold-600/30 rounded-2xl p-6 md:p-8 shadow-[0_0_40px_rgba(239,191,50,0.1)]">
                        <h1 className="text-2xl md:text-3xl font-cinzel font-bold text-gold-400 mb-2 flex items-center gap-3">
                            <Send className="text-gold-500" /> P2P Transfer
                        </h1>
                        <p className="text-gray-400 text-sm mb-8">Instantly send credits to another player.</p>

                        <form onSubmit={handleTransfer} className="space-y-6">
                            {/* Sender (You) */}
                            <div className="bg-black/40 p-4 rounded-xl border border-gray-800">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">From Account</p>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-white">{user.name}</span>
                                    <span className="text-gold-500 font-mono">${user.balance.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute left-1/2 -translate-x-1/2 -top-3 bg-[#151515] p-1 rounded-full border border-gray-700 z-10">
                                    <div className="w-6 h-6 bg-gold-900/50 rounded-full flex items-center justify-center">
                                        <ArrowDownLeft size={14} className="text-gold-500" />
                                    </div>
                                </div>
                                <hr className="border-gray-800" />
                            </div>

                            {/* Receiver Input */}
                            <InputField 
                                label="Receiver Email" 
                                placeholder="Enter player email" 
                                type="email"
                                value={receiverEmail}
                                onChange={(e) => setReceiverEmail(e.target.value)}
                            />

                            {/* Amount Input */}
                            <InputField 
                                label="Amount" 
                                placeholder="Min $2 (Whole number)" 
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />

                            {error && (
                                <div className="bg-red-900/20 border border-red-500/50 p-3 rounded text-red-400 text-sm flex items-start gap-2">
                                    <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {successMsg && (
                                <div className="bg-green-900/20 border border-green-500/50 p-3 rounded text-green-400 text-sm flex items-start gap-2">
                                    <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                                    <span>{successMsg}</span>
                                </div>
                            )}

                            <GoldButton type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Processing Transaction...' : 'Send Funds'}
                            </GoldButton>
                        </form>
                    </div>
                </div>

                {/* RIGHT: HISTORY TABLE */}
                <div className="w-full xl:w-2/3">
                    <div className="bg-[#151515] border border-gold-600/30 rounded-2xl overflow-hidden shadow-xl h-full flex flex-col">
                        <div className="p-6 border-b border-gray-800 bg-[#1a1a1a] flex justify-between items-center">
                            <h2 className="text-lg md:text-xl font-cinzel font-bold text-white flex items-center gap-2">
                                <History className="text-gold-500" /> Transaction History
                            </h2>
                        </div>

                        {/* MOBILE / TABLET CARD VIEW (< lg) */}
                        <div className="block lg:hidden p-4 space-y-3 max-h-[500px] overflow-y-auto">
                            {history.length === 0 ? (
                                <p className="text-center text-gray-500 italic py-4">No transactions found.</p>
                            ) : (
                                history.map((tx) => (
                                    <div key={tx.id} className="bg-black/40 border border-gray-800 rounded-xl p-4 flex justify-between items-center">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                {tx.type === 'Sent' ? (
                                                    <span className="text-red-400 font-bold text-sm flex items-center gap-1"><ArrowUpRight size={14} /> Sent</span>
                                                ) : (
                                                    <span className="text-green-400 font-bold text-sm flex items-center gap-1"><ArrowDownLeft size={14} /> Received</span>
                                                )}
                                                <span className="text-xs text-gray-600">•</span>
                                                <span className="text-xs text-gray-500">{new Date(tx.timestamp).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-white text-sm font-bold">{tx.counterpartyName}</p>
                                            <p className="text-gray-500 text-xs truncate w-32">{tx.counterpartyEmail}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-lg font-bold ${tx.type === 'Sent' ? 'text-red-400' : 'text-green-400'}`}>
                                                {tx.type === 'Sent' ? '-' : '+'}${tx.amount.toLocaleString()}
                                            </div>
                                            <span className="text-[10px] bg-green-900/20 text-green-500 px-1.5 py-0.5 rounded border border-green-900/50 uppercase">{tx.status}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* DESKTOP TABLE VIEW (>= lg) */}
                        <div className="hidden lg:block overflow-x-auto flex-1">
                            <table className="w-full">
                                <thead className="bg-black text-xs text-gray-500 font-bold uppercase">
                                    <tr>
                                        <th className="px-6 py-4 text-left">Type</th>
                                        <th className="px-6 py-4 text-left">Counterparty</th>
                                        <th className="px-6 py-4 text-left">Date</th>
                                        <th className="px-6 py-4 text-right">Amount</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {history.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                                                No transactions found.
                                            </td>
                                        </tr>
                                    ) : (
                                        history.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    {tx.type === 'Sent' ? (
                                                        <span className="flex items-center gap-2 text-red-400 font-bold text-sm">
                                                            <div className="p-1 bg-red-900/30 rounded"><ArrowUpRight size={14} /></div> Sent
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-2 text-green-400 font-bold text-sm">
                                                            <div className="p-1 bg-green-900/30 rounded"><ArrowDownLeft size={14} /></div> Received
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="text-white font-medium text-sm">{tx.counterpartyName}</p>
                                                        <p className="text-gray-500 text-xs">{tx.counterpartyEmail}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-400 text-sm">
                                                    {new Date(tx.timestamp).toLocaleDateString()} <span className="text-xs opacity-50">{new Date(tx.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                </td>
                                                <td className={`px-6 py-4 text-right font-bold ${tx.type === 'Sent' ? 'text-red-400' : 'text-green-400'}`}>
                                                    {tx.type === 'Sent' ? '-' : '+'}${tx.amount.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="px-2 py-1 rounded bg-green-900/20 text-green-500 text-xs font-bold border border-green-900/50">
                                                        {tx.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
};

export default P2PTransferPage;
