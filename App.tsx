
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionType, BudgetSummary } from './types';
import { 
  PlusIcon, 
  MinusIcon, 
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
    { name: 'รายรับ', value: summary.totalIncome, color: '#059669' },
    { name: 'รายจ่าย', value: summary.totalExpense, color: '#DC2626' },
  ];

  return (
    <div className="min-h-screen text-slate-800 pb-24">
      {/* Header */}
      <header className="bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 text-white p-6 shadow-2xl sticky top-0 z-10 rounded-b-[2.5rem] border-b-4 border-amber-400/30">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-white/20 p-2 rounded-2xl backdrop-blur-md">
                <WalletIcon className="w-8 h-8 text-amber-100" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">ระบบงบประมาณผ้าป่า</h1>
            </div>
            <div className="flex flex-col gap-1.5 mt-2 opacity-95">
              <div className="flex items-center gap-2 text-amber-50 font-medium bg-black/10 px-3 py-1 rounded-full w-fit">
                <AcademicCapIcon className="w-4 h-4" />
                <span>โรงเรียนประจักษ์ศิลปาคม</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 pl-1">
                <div className="flex items-center gap-2 text-sm text-orange-50 font-light">
                  <CalendarDaysIcon className="w-4 h-4" />
                  <span>12 เมษายน 2569</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-yellow-100 font-medium">
                  <ComputerDesktopIcon className="w-4 h-4" />
                  <span>เพื่อจัดหาคอมพิวเตอร์เพื่อการศึกษา</span>
                </div>
              </div>
            </div>
          </div>
          <button 
            onClick={handleAiInsight}
            disabled={loadingAi}
            className="bg-amber-100/20 hover:bg-amber-100/30 border border-white/30 px-5 py-2.5 rounded-2xl transition-all group flex items-center gap-2 backdrop-blur-lg self-end md:self-center shadow-lg active:scale-95"
          >
            <SparklesIcon className={`w-5 h-5 text-amber-200 ${loadingAi ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}`} />
            <span className="text-sm font-semibold uppercase tracking-wider">AI วิเคราะห์</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-8 mt-6">
        {/* Stats Cards - เพิ่มความอิ่มของสีและเงา */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-[2rem] shadow-xl shadow-green-900/5 border border-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-green-100 rounded-2xl shadow-inner">
                <ArrowDownCircleIcon className="w-7 h-7 text-green-600" />
              </div>
              <span className="text-slate-500 font-semibold text-sm uppercase tracking-wide">รายรับรวม</span>
            </div>
            <p className="text-4xl font-black text-green-700">
              {summary.totalIncome.toLocaleString()} <span className="text-xs font-medium text-slate-400">บาท</span>
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-[2rem] shadow-xl shadow-red-900/5 border border-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-red-100 rounded-2xl shadow-inner">
                <ArrowUpCircleIcon className="w-7 h-7 text-red-600" />
              </div>
              <span className="text-slate-500 font-semibold text-sm uppercase tracking-wide">รายจ่ายรวม</span>
            </div>
            <p className="text-4xl font-black text-red-700">
              {summary.totalExpense.toLocaleString()} <span className="text-xs font-medium text-slate-400">บาท</span>
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 p-6 rounded-[2rem] shadow-2xl shadow-orange-900/20 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="flex items-center gap-3 mb-3 relative z-10">
              <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md border border-white/20">
                <WalletIcon className="w-7 h-7 text-amber-100" />
              </div>
              <span className="text-orange-100 font-semibold text-sm uppercase tracking-wide">คงเหลือสุทธิ</span>
            </div>
            <p className="text-4xl font-black relative z-10">
              {summary.balance.toLocaleString()} <span className="text-xs font-medium text-orange-200">บาท</span>
            </p>
          </div>
        </div>

        {/* AI Insight Box - เพิ่มความเด่นด้วยขอบทองและพื้นหลังเหลือบ */}
        {aiInsight && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-[2rem] shadow-lg border-2 border-amber-200 animate-in fade-in slide-in-from-top-6 duration-700 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
            <div className="flex items-center gap-2 mb-3 text-orange-700">
              <SparklesIcon className="w-6 h-6 animate-pulse" />
              <h3 className="font-extrabold text-lg uppercase tracking-tight">AI วิเคราะห์สรุปบุญ</h3>
            </div>
            <p className="text-slate-800 italic leading-relaxed text-lg font-medium">"{aiInsight}"</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form - ปรับให้ดูนุ่มนวลแต่มีมิติ */}
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-[2.5rem] shadow-xl border border-orange-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-slate-800">
              <div className="p-2 bg-orange-100 rounded-xl">
                <PlusIcon className="w-5 h-5 text-orange-600" />
              </div>
              บันทึกรายการบุญ
            </h2>
            <form onSubmit={addTransaction} className="space-y-6">
              <div className="flex p-1.5 bg-slate-100 rounded-2xl shadow-inner">
                <button
                  type="button"
                  onClick={() => setType(TransactionType.INCOME)}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
                    type === TransactionType.INCOME ? 'bg-white shadow-md text-green-700 scale-100' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  รายรับ
                </button>
                <button
                  type="button"
                  onClick={() => setType(TransactionType.EXPENSE)}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
                    type === TransactionType.EXPENSE ? 'bg-white shadow-md text-red-700 scale-100' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  รายจ่าย
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase ml-2">รายการ / ชื่อผู้บริจาค</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ระบุชื่อหรือรายการ..."
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.25rem] px-5 py-4 focus:outline-none focus:border-orange-300 focus:bg-white transition-all shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase ml-2">จำนวนเงิน (บาท)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.25rem] px-5 py-4 focus:outline-none focus:border-orange-300 focus:bg-white transition-all shadow-sm font-mono text-xl text-orange-700 font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-orange-200 transition-all active:scale-95 flex items-center justify-center gap-3 text-lg"
              >
                บันทึกรายการ
              </button>
            </form>
          </div>

          {/* Visualization - ปรับพื้นหลัง Chart ให้ดูสะอาดแต่ไม่จืด */}
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-[2.5rem] shadow-xl border border-orange-100 flex flex-col h-[480px]">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-slate-800">
              <div className="p-2 bg-amber-100 rounded-xl">
                <ChartPieIcon className="w-5 h-5 text-amber-600" />
              </div>
              สถิติงบประมาณ
            </h2>
            <div className="flex-1 min-h-0 bg-slate-50/50 rounded-3xl p-4 border border-slate-100">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 14, fontWeight: 600}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '15px' }}
                    cursor={{fill: 'rgba(245, 158, 11, 0.05)'}}
                  />
                  <Bar dataKey="value" radius={[15, 15, 0, 0]} barSize={60}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Transactions Table - ปรับสี Header และ Row ให้ดูแพงขึ้น */}
        <div className="bg-white/90 backdrop-blur-sm rounded-[2.5rem] shadow-2xl border border-orange-100 overflow-hidden">
          <div className="p-8 border-b border-orange-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-b from-white to-orange-50/30">
            <h2 className="text-xl font-bold flex items-center gap-3 text-slate-800">
              <div className="p-2 bg-orange-100 rounded-xl text-orange-600">
                <DocumentTextIcon className="w-6 h-6" />
              </div>
              ประวัติรายการทั้งหมด
            </h2>
            <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl">
              {[
                { id: 'all', label: 'ทั้งหมด', color: 'orange' },
                { id: 'income', label: 'รายรับ', color: 'green' },
                { id: 'expense', label: 'รายจ่าย', color: 'red' }
              ].map((btn) => (
                <button 
                  key={btn.id}
                  onClick={() => setActiveTab(btn.id as any)}
                  className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                    activeTab === btn.id 
                    ? `bg-white shadow-md text-${btn.color}-600 scale-105` 
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
                <tr className="bg-slate-50/80 text-slate-500 text-[11px] uppercase font-black tracking-[0.1em]">
                  <th className="px-8 py-5">วันที่</th>
                  <th className="px-8 py-5">รายการ</th>
                  <th className="px-8 py-5 text-center">ประเภท</th>
                  <th className="px-8 py-5 text-right">จำนวนเงิน</th>
                  <th className="px-8 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-50/50">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-slate-400 italic font-medium">
                      ไม่มีประวัติรายการที่ต้องการแสดง
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-orange-50/40 transition-all group">
                      <td className="px-8 py-6 text-sm text-slate-500 font-medium">{t.date}</td>
                      <td className="px-8 py-6 font-bold text-slate-700 text-lg">{t.title}</td>
                      <td className="px-8 py-6 text-center">
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                          t.type === TransactionType.INCOME 
                          ? 'bg-green-100 text-green-700 border border-green-200 shadow-sm' 
                          : 'bg-red-100 text-red-700 border border-red-200 shadow-sm'
                        }`}>
                          {t.type === TransactionType.INCOME ? 'รายรับ' : 'รายจ่าย'}
                        </span>
                      </td>
                      <td className={`px-8 py-6 text-right font-mono font-black text-xl ${
                        t.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {t.type === TransactionType.INCOME ? '+' : '-'}{t.amount.toLocaleString()}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => deleteTransaction(t.id)}
                          className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                        >
                          <TrashIcon className="w-5 h-5" />
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

      {/* Floating Bottom Nav - ปรับให้โค้งมนและเด่นขึ้น */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-slate-900/95 backdrop-blur-xl text-white px-8 py-4 rounded-[2.5rem] shadow-2xl z-20 md:hidden border border-white/10">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className={`flex flex-col items-center gap-1 transition-all ${window.scrollY < 300 ? 'text-orange-400 scale-110' : 'opacity-60'}`}>
           <WalletIcon className="w-6 h-6" />
           <span className="text-[10px] font-bold">สรุป</span>
        </button>
        <div className="w-px h-8 bg-white/20"></div>
        <button onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })} className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100 hover:text-orange-400 transition-all">
           <PlusIcon className="w-6 h-6" />
           <span className="text-[10px] font-bold">เพิ่ม</span>
        </button>
         <div className="w-px h-8 bg-white/20"></div>
        <button onClick={() => window.scrollTo({ top: 1200, behavior: 'smooth' })} className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100 hover:text-orange-400 transition-all">
           <DocumentTextIcon className="w-6 h-6" />
           <span className="text-[10px] font-bold">รายการ</span>
        </button>
      </div>
    </div>
  );
};

export default App;
