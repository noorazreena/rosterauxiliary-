'use client';

import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query, doc, updateDoc, Timestamp, orderBy, limit } from 'firebase/firestore';
import { Shield, History, Plus, CheckCircle2, Clock, ArrowUpRight, ArrowDownLeft, X, RotateCcw, CheckSquare, Square, PenTool, AlertTriangle, Info, Key, Radio, Zap, Anchor, Lightbulb, FileText, Download } from 'lucide-react';

// Firebase configuration - these will be provided by the environment
declare const __firebase_config: string;
declare const __initial_auth_token: string | undefined;
declare const __app_id: string | undefined;

const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
  apiKey: "demo",
  authDomain: "demo.firebaseapp.com",
  projectId: "demo",
  storageBucket: "demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'ecoworld-ap-log-v3';

interface StaffMember {
  id: string;
  rank: string;
  name: string;
  vehicle: string;
  vKey: string;
  walkieNo: string;
  pepperSpray: string;
  handcuffs: string;
  tBaton: string;
  torchlight: string;
  walkieSn: string;
  batterySn: string;
}

interface EquipmentLog {
  id: string;
  timestamp: Timestamp;
  staffName: string;
  staffId: string;
  staffRank: string;
  shift: string;
  issuedVehicle: string;
  issuedVKey: string;
  issuedWalkie: string;
  issuedPepperSpray: string;
  issuedHandcuffs: string;
  issuedTBaton: string;
  issuedTorchlight: string;
  dateStr: string;
  timeStr: string;
  returnStatus: string;
  returnTimeStr?: string;
  returnDateStr?: string;
  returnRemarks?: string;
  hasIncident?: boolean;
  returnedInventory?: Record<string, boolean>;
  userId: string;
}

interface TakenItems {
  vehicle: boolean;
  vKey: boolean;
  walkie: boolean;
  pepperSpray: boolean;
  handcuffs: boolean;
  tBaton: boolean;
  torchlight: boolean;
}

interface FormData {
  staffIndex: string;
  shift: string;
  vehicle: string;
  vKey: string;
  walkieSn: string;
  pepperSpray: string;
  handcuffs: string;
  tBaton: string;
  torchlight: string;
  signed: boolean;
  takenItems: TakenItems;
}

const STAFF_DATABASE: StaffMember[] = [
  { id: '74722', rank: 'SJN/PB', name: 'MOHD KHAIRUL AZWANDY', vehicle: 'WB 2525 V', vKey: 'KEY WB 2525 V', walkieNo: 'N01', pepperSpray: 'N01 EXP:03/2025', handcuffs: 'EW001-N', tBaton: 'MP302359', torchlight: 'N01', walkieSn: 'N01 S/N:871TRXN726', batterySn: 'S/N:50002E685F04' },
  { id: '94340', rank: 'KPL/PB', name: 'KALAIARASU', vehicle: 'WB 7324 V', vKey: 'KEY WB 7324 V', walkieNo: 'N02', pepperSpray: 'N02 EXP:03/2025', handcuffs: 'EW002-N', tBaton: 'MP302314', torchlight: 'N02', walkieSn: 'N02 S/N:871TRXN766', batterySn: 'S/N:50002E5672A4' },
  { id: '48805', rank: 'KONST/PB', name: 'AHMAD ZAKI', vehicle: 'WB 2552 T', vKey: 'KEY WB 2552 T', walkieNo: 'N03', pepperSpray: 'N03 EXP:03/2025', handcuffs: 'EW003-N', tBaton: 'MP302994', torchlight: 'N03', walkieSn: 'N03 S/N:871TRXN722', batterySn: 'S/N:50002E700581' },
  { id: '84103', rank: 'KONST/PB', name: 'MOHD NURUL SHAZRIEN', vehicle: 'WB 4140 V', vKey: 'KEY WB 4140 V', walkieNo: 'N04', pepperSpray: 'N04 EXP:03/2025', handcuffs: 'EW004-N', tBaton: 'MP302274', torchlight: 'N04', walkieSn: 'N04 S/N:871TRXN739', batterySn: 'S/N:50002E6FE4EC' },
  { id: '83185', rank: 'KONST/PB', name: 'ASRUL', vehicle: 'WB 4760 U', vKey: 'KEY WB 4760 U', walkieNo: 'N05', pepperSpray: 'N05 EXP:03/2025', handcuffs: 'EW005-N', tBaton: 'MP302271', torchlight: 'N05', walkieSn: 'N05 S/N:871TRXN750', batterySn: 'S/N:50002E7696F7' },
  { id: '91202', rank: 'KONST/PB', name: 'MUHAMMAD AFIQ', vehicle: 'WB 4795 U', vKey: 'KEY WB 4795 U', walkieNo: 'N06', pepperSpray: 'N06 EXP:03/2025', handcuffs: 'EW006-N', tBaton: 'MP302323', torchlight: 'N06', walkieSn: 'N06 S/N:871TRXN769', batterySn: 'S/N:50002E6896F4' },
  { id: '94327', rank: 'KONST/PB', name: 'VILVANATH', vehicle: 'WB 4753 U', vKey: 'KEY WB 4753 U', walkieNo: 'N07', pepperSpray: 'N07 EXP:03/2025', handcuffs: 'EW007-N', tBaton: 'MP302327', torchlight: 'N07', walkieSn: 'N07 S/N:871TRXN772', batterySn: 'S/N:50002E6FDF51' },
  { id: '7835', rank: 'KONST/PB', name: 'NOORAZREENA', vehicle: '-', vKey: '-', walkieNo: 'N08', pepperSpray: 'N08 EXP:03/2025', handcuffs: 'EW008-N', tBaton: 'MP302331', torchlight: 'N08', walkieSn: 'N08 S/N:871TRXN774', batterySn: 'S/N:50002E67F754' }
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [logs, setLogs] = useState<EquipmentLog[]>([]);
  const [view, setView] = useState<string>('dashboard');
  const [showActionMenu, setShowActionMenu] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [processing, setProcessing] = useState<boolean>(false);
  
  const [selectedLogForReturn, setSelectedLogForReturn] = useState<EquipmentLog | null>(null);
  const [returnRemarks, setReturnRemarks] = useState<string>('');
  const [isIncident, setIsIncident] = useState<boolean>(false);
  const [returnedItems, setReturnedItems] = useState<Record<string, boolean>>({});

  const formatDisplayDate = (d: Date): string => d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const formatDisplayTime = (d: Date): string => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

  const [formData, setFormData] = useState<FormData>({
    staffIndex: "", shift: 'MORNING', 
    vehicle: '', vKey: '', walkieSn: '', pepperSpray: '', handcuffs: '', tBaton: '', torchlight: '',
    signed: false,
    takenItems: { vehicle: true, vKey: true, walkie: true, pepperSpray: true, handcuffs: true, tBaton: true, torchlight: true }
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error('Auth error:', error);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'equipment_logs'), orderBy('timestamp', 'desc'), limit(100));
    const unsubscribe = onSnapshot(q, (s) => setLogs(s.docs.map(d => ({ id: d.id, ...d.data() } as EquipmentLog))));
    return () => unsubscribe();
  }, [user]);

  const exportToExcel = () => {
    const headers = ["Date", "Time Out", "Time In", "Shift", "Rank", "Name", "ID", "Vehicle", "Walkie", "Pepper Spray", "Handcuffs", "Status", "Remarks"];
    const rows = logs.map(log => [
        log.dateStr,
        log.timeStr,
        log.returnTimeStr || "-",
        log.shift,
        log.staffRank,
        log.staffName,
        log.staffId,
        log.issuedVehicle,
        log.issuedWalkie,
        log.issuedPepperSpray,
        log.issuedHandcuffs,
        log.hasIncident ? "INCIDENT" : log.returnStatus,
        `"${(log.returnRemarks || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `AP_Equipment_Log_${formatDisplayDate(new Date())}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Improved PDF/Print Function for Iframe environments
  const exportToPDF = () => {
    try {
        // Force the browser to focus on this window before printing
        window.focus();
        window.print();
    } catch (e) {
        console.error("Print failed:", e);
        alert("Please use the browser's Print option (Ctrl+P) to save as PDF.");
    }
  };

  const handleStaffChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = e.target.value;
    if (!idx) { setFormData({...formData, staffIndex: ""}); return; }
    const s = STAFF_DATABASE[parseInt(idx)];
    setFormData({
      ...formData, staffIndex: idx, vehicle: s.vehicle, vKey: s.vKey, walkieSn: s.walkieSn,
      pepperSpray: s.pepperSpray, handcuffs: s.handcuffs, tBaton: s.tBaton, torchlight: s.torchlight,
      signed: false,
      takenItems: { vehicle: s.vehicle !== '-', vKey: s.vKey !== '-', walkie: true, pepperSpray: true, handcuffs: true, tBaton: true, torchlight: true }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || processing || !formData.signed) return;
    setProcessing(true);
    const s = STAFF_DATABASE[parseInt(formData.staffIndex)];
    
    const finalData = {
      timestamp: Timestamp.now(), staffName: s.name, staffId: s.id, staffRank: s.rank, shift: formData.shift,
      issuedVehicle: formData.takenItems.vehicle ? formData.vehicle : "N/A",
      issuedVKey: formData.takenItems.vKey ? formData.vKey : "N/A",
      issuedWalkie: formData.takenItems.walkie ? formData.walkieSn : "N/A",
      issuedPepperSpray: formData.takenItems.pepperSpray ? formData.pepperSpray : "N/A",
      issuedHandcuffs: formData.takenItems.handcuffs ? formData.handcuffs : "N/A",
      issuedTBaton: formData.takenItems.tBaton ? formData.tBaton : "N/A",
      issuedTorchlight: formData.takenItems.torchlight ? formData.torchlight : "N/A",
      dateStr: formatDisplayDate(new Date()), timeStr: formatDisplayTime(new Date()),
      returnStatus: 'PENDING', userId: user.uid
    };

    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'equipment_logs'), finalData);
      setView('dashboard'); setShowActionMenu(false);
      setFormData({ staffIndex: "", shift: 'MORNING', vehicle: '', vKey: '', walkieSn: '', pepperSpray: '', handcuffs: '', tBaton: '', torchlight: '', signed: false, takenItems: { vehicle: true, vKey: true, walkie: true, pepperSpray: true, handcuffs: true, tBaton: true, torchlight: true } });
    } catch (err) { console.error(err); } finally { setProcessing(false); }
  };

  const handleReturn = async () => {
    if (!user || !selectedLogForReturn || processing) return;
    
    setProcessing(true);
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'equipment_logs', selectedLogForReturn.id), {
        returnStatus: 'RETURNED', 
        returnTimestamp: Timestamp.now(), 
        returnTimeStr: formatDisplayTime(new Date()),
        returnDateStr: formatDisplayDate(new Date()), 
        returnRemarks: returnRemarks || "All items returned in good condition", 
        hasIncident: isIncident,
        returnedInventory: returnedItems 
      });
      setSelectedLogForReturn(null); setReturnRemarks(''); setIsIncident(false); setReturnedItems({});
    } catch (err) { console.error(err); } finally { setProcessing(false); }
  };

  const toggleReturnItem = (key: string) => {
    setReturnedItems(prev => ({
        ...prev,
        [key]: !prev[key]
    }));
  };

  return (
    <div className="max-w-xl mx-auto bg-slate-50 min-h-screen pb-32 font-sans antialiased">
      <style>{`
        @media print {
            @page { size: auto; margin: 10mm; }
            body { background: white !important; color: black !important; }
            nav, header, .no-print, button { display: none !important; }
            .print-only { display: block !important; }
            .print-container { padding: 0 !important; width: 100% !important; }
            .log-card { 
                break-inside: avoid; 
                border: 1px solid #000 !important; 
                margin-bottom: 15px !important; 
                padding: 15px !important;
                box-shadow: none !important; 
                background: white !important;
            }
            .main-p { padding: 0 !important; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
        .print-only { display: none; }
      `}</style>

      <header className="bg-emerald-950 p-6 text-white shadow-xl sticky top-0 z-30 border-b-4 border-emerald-500 no-print">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Shield className="text-emerald-400" size={32} />
            <div>
              <h1 className="font-black text-[13px] uppercase tracking-tight">Auxiliary Police EcoWorld</h1>
              <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-[0.2em]">Equipment Record V3.5.1</p>
            </div>
          </div>
          <div className="text-right font-mono">
            <p className="text-[10px] text-emerald-600/70">{formatDisplayDate(currentTime)}</p>
            <p className="text-lg font-black">{formatDisplayTime(currentTime)}</p>
          </div>
        </div>
      </header>

      <main className="p-4 main-p">
        <div className="print-only mb-8 border-b-4 border-black pb-4 text-center">
            <h1 className="text-2xl font-black uppercase tracking-tighter">EcoWorld Auxiliary Police</h1>
            <h2 className="text-lg font-bold uppercase underline">Official Equipment Deployment Audit Log</h2>
            <p className="text-[10px] font-bold uppercase mt-2">Report ID: {appId.toUpperCase()} • Generated: {formatDisplayDate(new Date())} {formatDisplayTime(new Date())}</p>
        </div>

        {selectedLogForReturn && (
          <div className="fixed inset-0 bg-emerald-950/95 z-[60] p-6 flex items-center justify-center overflow-y-auto no-print">
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 space-y-6 my-auto">
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-2 ${isIncident ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                   {isIncident ? <AlertTriangle size={32} /> : <RotateCcw size={32} />}
                </div>
                <h3 className="font-black text-slate-900 uppercase text-lg">Asset Recovery</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedLogForReturn.staffName}</p>
              </div>

              <div className="space-y-3">
                <p className="text-[9px] font-black text-slate-400 uppercase px-2">Verify Item Returns:</p>
                <div className="max-h-48 overflow-y-auto pr-1 space-y-2">
                    {[
                        { key: 'issuedWalkie', label: 'Walkie Set', icon: <Radio size={14}/> },
                        { key: 'issuedVehicle', label: 'Vehicle Unit', icon: <Shield size={14}/> },
                        { key: 'issuedVKey', label: 'Vehicle Keys', icon: <Key size={14}/> },
                        { key: 'issuedPepperSpray', label: 'Pepper Spray', icon: <Zap size={14}/> },
                        { key: 'issuedHandcuffs', label: 'Handcuffs', icon: <Anchor size={14}/> },
                        { key: 'issuedTBaton', label: 'T-Baton', icon: <Zap size={14}/> },
                        { key: 'issuedTorchlight', label: 'Torchlight', icon: <Lightbulb size={14}/> }
                    ].filter(item => {
                        const key = item.key as keyof EquipmentLog;
                        return selectedLogForReturn[key] !== "N/A";
                    }).map(item => (
                        <div key={item.key} onClick={() => toggleReturnItem(item.key)} className={`p-3 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${returnedItems[item.key] ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-slate-50 opacity-60'}`}>
                            <div className="flex items-center gap-3">
                                <div className={returnedItems[item.key] ? 'text-emerald-600' : 'text-slate-400'}>{item.icon}</div>
                                <div className="text-[10px] font-black uppercase text-slate-700">{item.label}</div>
                            </div>
                            {returnedItems[item.key] ? <CheckSquare className="text-emerald-600" /> : <Square className="text-slate-300" />}
                        </div>
                    ))}
                </div>

                <div className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${isIncident ? 'border-red-500 bg-red-50' : 'border-slate-100 bg-slate-50'}`} onClick={() => setIsIncident(!isIncident)}>
                  <div className="flex items-center gap-3">
                    {isIncident ? <CheckSquare className="text-red-600" /> : <Square className="text-slate-300" />}
                    <span className="font-black text-[11px] uppercase text-slate-700">Report Damage / Incident</span>
                  </div>
                </div>

                <textarea className="w-full bg-slate-50 rounded-2xl p-4 text-[10px] font-bold border-2 border-transparent focus:border-emerald-500 outline-none h-20" placeholder="Additional remarks..." value={returnRemarks} onChange={(e) => setReturnRemarks(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { setSelectedLogForReturn(null); setReturnedItems({}); }} className="py-4 rounded-2xl bg-slate-100 text-slate-400 font-black uppercase text-[10px]">Cancel</button>
                <button onClick={handleReturn} disabled={processing} className={`py-4 rounded-2xl text-white font-black uppercase text-[10px] shadow-lg ${isIncident ? 'bg-red-600' : 'bg-emerald-600'}`}>Confirm</button>
              </div>
            </div>
          </div>
        )}

        {view === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-center no-print">
              <div className="bg-white p-5 rounded-[2.5rem] border-b-4 border-orange-500 shadow-sm">
                <Clock className="text-orange-500 mx-auto mb-2" size={24} />
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">On Field</p>
                <p className="text-4xl font-black text-slate-800">{logs.filter(l => l.returnStatus === 'PENDING').length}</p>
              </div>
              <div className="bg-white p-5 rounded-[2.5rem] border-b-4 border-emerald-500 shadow-sm">
                <CheckCircle2 className="text-emerald-500 mx-auto mb-2" size={24} />
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Secured Today</p>
                <p className="text-4xl font-black text-slate-800">{logs.filter(l => l.returnStatus === 'RETURNED' && l.returnDateStr === formatDisplayDate(new Date())).length}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase px-4 tracking-[0.2em] no-print">Active Deployments</p>
              {logs.filter(l => l.returnStatus === 'PENDING').length === 0 ? (
                <div className="text-center py-10 opacity-20 no-print"><Shield size={48} className="mx-auto mb-2" /><p className="font-black uppercase text-[10px]">No Active Staff</p></div>
              ) : (
                logs.filter(l => l.returnStatus === 'PENDING').map((log) => (
                    <div key={log.id} className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm flex justify-between items-center log-card">
                    <div>
                        <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase">{log.shift}</span>
                        <h3 className="font-black text-slate-900 uppercase text-lg mt-1">{log.staffName}</h3>
                        <p className="text-[10px] font-bold text-emerald-700">{log.staffRank} • {log.staffId}</p>
                    </div>
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl no-print"><Clock size={20} /></div>
                    <div className="print-only text-[10px] font-black">Out: {log.timeStr}</div>
                    </div>
                ))
              )}
            </div>
          </div>
        )}

        {view === 'add' && (
          <div className="bg-white rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-right-4 no-print">
             <div className="flex justify-between items-center mb-8">
                <h2 className="font-black text-2xl text-slate-900 uppercase italic">Deployment</h2>
                <button onClick={() => setView('dashboard')} className="p-2 bg-slate-100 rounded-full text-slate-400"><X size={20}/></button>
             </div>
             <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-slate-50 p-1 rounded-[1.5rem] grid grid-cols-2 gap-1 font-black text-[10px] uppercase">
                  <button type="button" onClick={() => setFormData({...formData, shift: 'MORNING'})} className={`py-3 rounded-[1.2rem] ${formData.shift === 'MORNING' ? 'bg-white shadow-md text-emerald-900' : 'text-slate-400'}`}>Morning</button>
                  <button type="button" onClick={() => setFormData({...formData, shift: 'NIGHT'})} className={`py-3 rounded-[1.2rem] ${formData.shift === 'NIGHT' ? 'bg-emerald-950 shadow-md text-white' : 'text-slate-400'}`}>Night</button>
                </div>
                <select required className="w-full p-5 rounded-[1.5rem] bg-slate-50 font-black text-slate-800 border-2 border-transparent focus:border-emerald-500 outline-none appearance-none" value={formData.staffIndex} onChange={handleStaffChange}>
                  <option value="">-- SELECT PERSONNEL --</option>
                  {STAFF_DATABASE.map((s, idx) => <option key={s.id} value={idx}>{s.rank} {s.name}</option>)}
                </select>

                {formData.staffIndex !== "" && (
                  <div className="space-y-3">
                    <p className="text-[9px] font-black text-slate-400 uppercase px-2">Equipment Checklist</p>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { label: 'Walkie S/N', val: formData.walkieSn, key: 'walkie', icon: <Radio size={14}/> },
                        { label: 'Vehicle No', val: formData.vehicle, key: 'vehicle', icon: <Shield size={14}/> },
                        { label: 'Vehicle Key', val: formData.vKey, key: 'vKey', icon: <Key size={14}/> },
                        { label: 'Pepper Spray', val: formData.pepperSpray, key: 'pepperSpray', icon: <Zap size={14}/> },
                        { label: 'Handcuffs', val: formData.handcuffs, key: 'handcuffs', icon: <Anchor size={14}/> },
                        { label: 'T-Baton', val: formData.tBaton, key: 'tBaton', icon: <Zap size={14}/> },
                        { label: 'Torchlight', val: formData.torchlight, key: 'torchlight', icon: <Lightbulb size={14}/> }
                      ].map(item => (
                        <div key={item.key} className={`bg-slate-50 p-4 rounded-2xl flex items-center justify-between transition-all ${formData.takenItems[item.key as keyof TakenItems] ? 'opacity-100 border border-emerald-100 bg-white' : 'opacity-40'}`}>
                          <div className="flex items-center gap-3">
                            <div className="text-emerald-500">{item.icon}</div>
                            <div>
                               <p className="text-[7px] font-black text-slate-400 uppercase">{item.label}</p>
                               <p className="text-[10px] font-black text-slate-800">{item.val}</p>
                            </div>
                          </div>
                          <button type="button" onClick={() => setFormData(p => ({...p, takenItems: {...p.takenItems, [item.key]: !p.takenItems[item.key as keyof TakenItems]}}))}>
                             {formData.takenItems[item.key as keyof TakenItems] ? <CheckSquare className="text-emerald-600" /> : <Square className="text-slate-300" />}
                          </button>
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={() => setFormData({...formData, signed: !formData.signed})} className={`w-full p-4 mt-4 rounded-xl border-2 border-dashed flex items-center justify-center gap-3 ${formData.signed ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-emerald-200 text-emerald-300'}`}>
                       <PenTool size={20} /> <span className="font-black text-xs uppercase">{formData.signed ? 'Signed' : 'Click to Sign Authorization'}</span>
                    </button>
                  </div>
                )}
                <button type="submit" disabled={!formData.signed || processing} className="w-full bg-emerald-950 text-white p-6 rounded-[2.5rem] font-black uppercase shadow-2xl disabled:opacity-30">Deploy Now</button>
             </form>
          </div>
        )}

        {view === 'return' && (
          <div className="space-y-4 no-print">
             <h2 className="font-black text-2xl text-slate-900 uppercase italic px-4">Recovery</h2>
             {logs.filter(l => l.returnStatus === 'PENDING').length === 0 ? (
                <div className="bg-white p-12 rounded-[3rem] text-center opacity-40 italic font-black uppercase text-[10px]">No Assets to Recover</div>
             ) : (
                logs.filter(l => l.returnStatus === 'PENDING').map((log) => (
                    <div key={log.id} className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 flex justify-between items-center">
                    <div>
                        <h3 className="font-black text-lg text-slate-900 uppercase">{log.staffName}</h3>
                        <p className="text-[8px] font-black text-emerald-600 uppercase">{log.shift} DEPLOYMENT</p>
                    </div>
                    <button onClick={() => { setSelectedLogForReturn(log); setReturnedItems({}); }} className="bg-emerald-600 text-white p-4 rounded-2xl font-black uppercase text-[10px] shadow-lg">Recover</button>
                    </div>
                ))
             )}
          </div>
        )}

        {view === 'history' && (
          <div className="space-y-4 pb-10">
            <div className="flex justify-between items-center px-4 no-print">
                <h2 className="font-black text-2xl text-slate-900 uppercase italic">Archive</h2>
                <div className="flex gap-2">
                    <button onClick={exportToExcel} title="Export to Excel" className="p-3 bg-white border border-slate-200 rounded-xl text-emerald-700 shadow-sm hover:bg-emerald-50 transition-colors"><Download size={18} /></button>
                    <button onClick={exportToPDF} title="Save as PDF" className="p-3 bg-white border border-slate-200 rounded-xl text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"><FileText size={18} /></button>
                </div>
            </div>

            {logs.map((log) => (
              <div key={log.id} className={`bg-white p-6 rounded-[2.5rem] border shadow-sm log-card ${log.hasIncident ? 'border-red-500 bg-red-50/50' : 'border-slate-100'}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">{log.dateStr} • {log.shift}</p>
                    <h4 className="font-black text-slate-800 uppercase text-sm">{log.staffName}</h4>
                  </div>
                  <div className={`text-[8px] font-black px-3 py-1.5 rounded-full ${log.returnStatus === 'PENDING' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {log.hasIncident ? 'INCIDENT REPORTED' : log.returnStatus}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[8px] font-bold text-slate-500 bg-slate-50/50 p-3 rounded-2xl mb-4">
                  <p>Walkie: {log.issuedWalkie}</p>
                  <p>Vehicle: {log.issuedVehicle}</p>
                  <p>Out: {log.timeStr}</p>
                  <p>In: {log.returnTimeStr || '-'}</p>
                </div>

                {log.returnStatus === 'RETURNED' && (
                    <div className="mb-4">
                        <p className="text-[7px] font-black text-slate-400 uppercase mb-2">Verified Return Inventory:</p>
                        <div className="flex flex-wrap gap-1">
                            {(['issuedWalkie', 'issuedVehicle', 'issuedVKey', 'issuedPepperSpray', 'issuedHandcuffs', 'issuedTBaton', 'issuedTorchlight'] as const).map(key => (
                                log[key] !== "N/A" && (
                                    <span key={key} className={`text-[7px] font-black px-2 py-1 rounded-full uppercase ${log.returnedInventory?.[key] ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                        {key.replace('issued', '')} {log.returnedInventory?.[key] ? '✓' : '✗'}
                                    </span>
                                )
                            ))}
                        </div>
                    </div>
                )}

                {log.returnRemarks && (
                   <div className={`p-4 rounded-2xl flex gap-3 items-start ${log.hasIncident ? 'bg-red-100 border border-red-200' : 'bg-emerald-50'}`}>
                      <div className={log.hasIncident ? 'text-red-600' : 'text-emerald-600'}><Info size={14}/></div>
                      <div>
                        <p className={`text-[8px] font-black uppercase mb-1 ${log.hasIncident ? 'text-red-700' : 'text-emerald-700'}`}>Personnel Remarks</p>
                        <p className={`text-[10px] font-bold ${log.hasIncident ? 'text-red-900' : 'text-slate-600'}`}>&quot;{log.returnRemarks}&quot;</p>
                      </div>
                   </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {showActionMenu && (
          <div className="fixed inset-0 bg-emerald-950/98 z-50 flex items-center justify-center p-6 backdrop-blur-md no-print">
            <div className="w-full max-w-xs space-y-4">
              <button onClick={() => { setView('add'); setShowActionMenu(false); }} className="w-full p-6 bg-orange-600 text-white rounded-[2rem] flex justify-between items-center shadow-xl">
                <span className="font-black text-xl uppercase italic">Deploy</span> <ArrowUpRight size={24} />
              </button>
              <button onClick={() => { setView('return'); setShowActionMenu(false); }} className="w-full p-6 bg-emerald-600 text-white rounded-[2rem] flex justify-between items-center shadow-xl">
                <span className="font-black text-xl uppercase italic">Recovery</span> <ArrowDownLeft size={24} />
              </button>
              <button onClick={() => setShowActionMenu(false)} className="w-full py-6 text-white/40 font-black uppercase text-[10px] tracking-[0.4em]">Close</button>
            </div>
          </div>
        )}

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-emerald-950/95 backdrop-blur-md rounded-[2.5rem] p-4 flex items-center justify-around shadow-2xl z-40 no-print">
        <button onClick={() => setView('dashboard')} className={`p-4 rounded-2xl ${view === 'dashboard' ? 'bg-emerald-500 text-white shadow-lg' : 'text-emerald-300/40'}`}><Shield size={22} /></button>
        <button onClick={() => setShowActionMenu(true)} className="bg-white text-emerald-950 p-5 rounded-3xl -mt-12 shadow-2xl border-4 border-emerald-950"><Plus size={28} strokeWidth={3} /></button>
        <button onClick={() => setView('history')} className={`p-4 rounded-2xl ${view === 'history' ? 'bg-emerald-500 text-white shadow-lg' : 'text-emerald-300/40'}`}><History size={22} /></button>
      </nav>
    </div>
  );
}
