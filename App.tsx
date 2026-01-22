
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionType, BudgetSummary } from './types';
import { 
  PlusIcon, 
  TrashIcon, 
  ChartPieIcon, 
  DocumentTextIcon, 
  SparklesIcon,
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  WalletIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from 'recharts';
import { getBudgetInsights } from './services/geminiService';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('phapa_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense'>('all');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.INCOME);

  useEffect(() => {
    localStorage.setItem('phapa_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const summary = useMemo<BudgetSummary>(() => {
    const income = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((acc, t) => acc + t.amount, 0);
    return {
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense
    };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    if (activeTab === 'all') return transactions;
    return transactions.filter(t => 
      activeTab === 'income' ? t.type === TransactionType.INCOME : t.type === TransactionType.EXPENSE
    );
  }, [transactions, activeTab]);

  const addTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      title,
      amount: parseFloat(amount),
      type,
      date: new Date().toLocaleDateString('th-TH'),
    };

    setTransactions([newTransaction, ...transactions]);
    setTitle('');
    setAmount('');
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleAiInsight = async () => {
    setLoadingAi(true);
    const insight = await getBudgetInsights(transactions, summary);
    setAiInsight(insight);
    setLoadingAi(false);
  };

  const chartData = [
    { name: 'รายรับ', value: summary.totalIncome, color: '#10B981' },
    { name: 'รายจ่าย', value: summary.totalExpense, color: '#F43F5E' },
  ];

  return (
    <div className="min-h-screen text-slate-800 pb-24">
      {/* Header - Vibrant Gradient */}
      <header className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white pt-10 pb-16 px-6 shadow-2xl sticky top-0 z-20 rounded-b-[3rem] border-b-4 border-amber-300/40 overflow-hidden">
        {/* Abstract shapes in header */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-10 -mb-10 blur-2xl pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md shadow-inner border border-white/30">
                <WalletIcon className="w-8 h-8 text-amber-100" />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight drop-shadow-md uppercase">
                งบประมาณผ้าป่า
              </h1>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-amber-50 font-bold text-lg">
                <AcademicCapIcon className="w-5 h-5" />
                <span>โรงเรียนประจักษ์ศิลปาคม</span>
              </div>
              <div className="flex flex-wrap gap-4 pl-1">
                <div className="flex items-center gap-2 text-sm text-orange-50 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                  <CalendarDaysIcon className="w-4 h-4" />
                  <span>12 เมษายน 2569</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-yellow-200 font-bold bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
                  <ComputerDesktopIcon className="w-4 h-4" />
                  <span>จัดหาคอมพิวเตอร์เพื่อการศึกษา</span>
                </div>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleAiInsight}
            disabled={loadingAi}
            className="bg-amber-100/20 hover:bg-amber-100/30 border border-white/40 px-6 py-3 rounded-2xl transition-all group flex items-center gap-3 backdrop-blur-lg shadow-xl active:scale-95 disabled:opacity-50"
          >
            <SparklesIcon className={`w-6 h-6 text-amber-200 ${loadingAi ? 'animate-spin' : 'group-hover:scale-125 transition-transform'}`} />
            <span className="text-sm font-black uppercase tracking-widest">AI สรุปข้อมูล</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-8 -mt-8 relative z-10">
        {/* Stats Cards - More colorful and depth */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/90 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl border border-white flex flex-col items-center text-center">
            <div className="p-3 bg-emerald-100 rounded-2xl mb-4 shadow-sm">
              <ArrowDownCircleIcon className="w-8 h-8 text-emerald-600" />
            </div>
            <span className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">รายรับรวม</span>
            <p className="text-4xl font-black text-emerald-600">
              {summary.totalIncome.toLocaleString()}
            </p>
            <span className="text-xs font-medium text-slate-400 mt-1">บาท</span>
          </div>

          <div className="bg-white/90 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl border border-white flex flex-col items-center text-center">
            <div className="p-3 bg-rose-100 rounded-2xl mb-4 shadow-sm">
              <ArrowUpCircleIcon className="w-8 h-8 text-rose-600" />
            </div>
            <span className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">รายจ่ายรวม</span>
            <p className="text-4xl font-black text-rose-600">
              {summary.totalExpense.toLocaleString()}
            </p>
            <span className="text-xs font-medium text-slate-400 mt-1">บาท</span>
          </div>

          <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 p-8 rounded-[2.5rem] shadow-2xl text-white flex flex-col items-center text-center border-b-4 border-amber-800/30 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl group-hover:scale-125 transition-transform"></div>
            <div className="p-3 bg-white/20 rounded-2xl mb-4 shadow-inner border border-white/20 relative z-10">
              <WalletIcon className="w-8 h-8 text-amber-50" />
            </div>
            <span className="text-orange-100 font-bold text-xs uppercase tracking-widest mb-1 relative z-10">คงเหลือสุทธิ</span>
            <p className="text-4xl font-black relative z-10 drop-shadow-md">
              {summary.balance.toLocaleString()}
            </p>
            <span className="text-xs font-medium text-orange-200 mt-1 relative z-10">บาท</span>
          </div>
        </div>

        {/* AI Insight Box - Outstanding design */}
        {aiInsight && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-8 rounded-[2.5rem] shadow-xl border-2 border-amber-200 animate-in fade-in slide-in-from-top-6 duration-700 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-amber-400"></div>
            <div className="flex items-center gap-3 mb-4 text-orange-700">
              <div className="bg-white p-2 rounded-xl shadow-sm">
                <SparklesIcon className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="font-extrabold text-xl uppercase tracking-tighter italic">AI วิเคราะห์บุญ</h3>
            </div>
            <p className="text-slate-800 italic leading-relaxed text-lg font-medium pl-2">
              "{aiInsight}"
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Card */}
          <div className="bg-white/80 backdrop-blur-md p-8 rounded-[3rem] shadow-2xl border border-orange-100/50">
            <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-800">
              <div className="p-2 bg-orange-100 rounded-xl">
                <PlusIcon className="w-6 h-6 text-orange-600" />
              </div>
              ลงบันทึกรายการ
            </h2>
            <form onSubmit={addTransaction} className="space-y-6">
              <div className="flex p-2 bg-slate-100/80 rounded-2xl shadow-inner">
                <button
                  type="button"
                  onClick={() => setType(TransactionType.INCOME)}
                  className={`flex-1 py-4 px-4 rounded-xl text-sm font-black transition-all duration-300 flex items-center justify-center gap-2 ${
                    type === TransactionType.INCOME ? 'bg-white shadow-md text-emerald-600 scale-100' : 'text-slate-400'
                  }`}
                >
                  <ArrowDownCircleIcon className="w-4 h-4" />
                  รายรับ
                </button>
                <button
                  type="button"
                  onClick={() => setType(TransactionType.EXPENSE)}
                  className={`flex-1 py-4 px-4 rounded-xl text-sm font-black transition-all duration-300 flex items-center justify-center gap-2 ${
                    type === TransactionType.EXPENSE ? 'bg-white shadow-md text-rose-600 scale-100' : 'text-slate-400'
                  }`}
                >
                  <ArrowUpCircleIcon className="w-4 h-4" />
                  รายจ่าย
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-500 uppercase ml-2 tracking-widest">ชื่อรายการ / ผู้บริจาค</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น มจพ. สมชาย บริจาค"
                  className="w-full bg-white/50 border-2 border-slate-100 rounded-[1.5rem] px-6 py-4 focus:outline-none focus:border-orange-400 focus:bg-white transition-all shadow-sm placeholder:text-slate-300"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-500 uppercase ml-2 tracking-widest">จำนวนเงิน (บาท)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white/50 border-2 border-slate-100 rounded-[1.5rem] px-6 py-4 focus:outline-none focus:border-orange-400 focus:bg-white transition-all shadow-sm font-mono text-2xl text-orange-600 font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-orange-200 transition-all active:scale-95 flex items-center justify-center gap-3 text-xl tracking-tight mt-4"
              >
                บันทึกข้อมูล
              </button>
            </form>
          </div>

          {/* Visualization Card */}
          <div className="bg-white/80 backdrop-blur-md p-8 rounded-[3rem] shadow-2xl border border-orange-100/50 flex flex-col h-[520px]">
            <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-800">
              <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                <ChartPieIcon className="w-6 h-6" />
              </div>
              สรุปภาพรวม
            </h2>
            <div className="flex-1 min-h-0 bg-slate-50/50 rounded-[2rem] p-6 border border-slate-100">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b', fontSize: 14, fontWeight: 800}} 
                    dy={15} 
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: 'rgba(245, 158, 11, 0.05)'}}
                    contentStyle={{ borderRadius: '2rem', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '20px' }}
                  />
                  <Bar dataKey="value" radius={[20, 20, 0, 0]} barSize={80}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white/90 backdrop-blur-md rounded-[3rem] shadow-2xl border border-orange-100 overflow-hidden">
          <div className="p-8 border-b border-orange-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-b from-white to-orange-50/20">
            <h2 className="text-2xl font-black flex items-center gap-4 text-slate-800">
              <div className="p-3 bg-orange-100 rounded-2xl text-orange-600 shadow-sm">
                <DocumentTextIcon className="w-7 h-7" />
              </div>
              ประวัติรายการ
            </h2>
            <div className="flex gap-2 bg-slate-100/80 p-1.5 rounded-2xl">
              {[
                { id: 'all', label: 'ทั้งหมด', color: 'orange' },
                { id: 'income', label: 'รายรับ', color: 'emerald' },
                { id: 'expense', label: 'รายจ่าย', color: 'rose' }
              ].map((btn) => (
                <button 
                  key={btn.id}
                  onClick={() => setActiveTab(btn.id as any)}
                  className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${
                    activeTab === btn.id 
                    ? `bg-white shadow-md text-orange-600 scale-105` 
                    : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase font-black tracking-[0.2em]">
                  <th className="px-10 py-6">วันที่</th>
                  <th className="px-10 py-6">รายการ</th>
                  <th className="px-10 py-6 text-center">ประเภท</th>
                  <th className="px-10 py-6 text-right">จำนวน (บาท)</th>
                  <th className="px-10 py-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-50">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-10 py-24 text-center text-slate-400 italic font-bold text-lg">
                      ยังไม่มีรายการบันทึก...
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-orange-50/40 transition-all group">
                      <td className="px-10 py-7 text-sm text-slate-400 font-bold">{t.date}</td>
                      <td className="px-10 py-7 font-extrabold text-slate-700 text-xl">{t.title}</td>
                      <td className="px-10 py-7 text-center">
                        <span className={`inline-flex items-center px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest ${
                          t.type === TransactionType.INCOME 
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                          : 'bg-rose-100 text-rose-700 border border-rose-200'
                        }`}>
                          {t.type === TransactionType.INCOME ? 'รายรับ' : 'รายจ่าย'}
                        </span>
                      </td>
                      <td className={`px-10 py-7 text-right font-mono font-black text-2xl ${
                        t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {t.type === TransactionType.INCOME ? '+' : '-'}{t.amount.toLocaleString()}
                      </td>
                      <td className="px-10 py-7 text-right">
                        <button 
                          onClick={() => deleteTransaction(t.id)}
                          className="p-3 text-slate-200 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                        >
                          <TrashIcon className="w-6 h-6" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Floating Bottom Nav for Mobile */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-8 bg-slate-900/95 backdrop-blur-2xl text-white px-10 py-5 rounded-[2.5rem] shadow-2xl z-30 md:hidden border border-white/10">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex flex-col items-center gap-1 transition-all text-orange-400 scale-110">
           <WalletIcon className="w-6 h-6" />
           <span className="text-[10px] font-black uppercase">สรุป</span>
        </button>
        <div className="w-px h-8 bg-white/20"></div>
        <button onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })} className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100 hover:text-orange-400 transition-all">
           <PlusIcon className="w-6 h-6" />
           <span className="text-[10px] font-black uppercase">เพิ่ม</span>
        </button>
         <div className="w-px h-8 bg-white/20"></div>
        <button onClick={() => window.scrollTo({ top: 1200, behavior: 'smooth' })} className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100 hover:text-orange-400 transition-all">
           <DocumentTextIcon className="w-6 h-6" />
           <span className="text-[10px] font-black uppercase">ประวัติ</span>
        </button>
      </div>
    </div>
  );
};

export default App;
