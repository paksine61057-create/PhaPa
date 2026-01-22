
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
    { name: 'รายรับ', value: summary.totalIncome, color: '#10B981' },
    { name: 'รายจ่าย', value: summary.totalExpense, color: '#EF4444' },
  ];

  return (
    <div className="min-h-screen bg-orange-50/30 text-slate-800 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 shadow-lg sticky top-0 z-10 rounded-b-3xl">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <WalletIcon className="w-8 h-8" />
              <h1 className="text-2xl font-bold">จัดการงบประมาณงานผ้าป่า</h1>
            </div>
            <div className="flex flex-col gap-1 opacity-90">
              <div className="flex items-center gap-2 text-orange-50 font-medium">
                <AcademicCapIcon className="w-4 h-4" />
                <span>โรงเรียนประจักษ์ศิลปาคม</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <div className="flex items-center gap-2 text-sm text-orange-100">
                  <CalendarDaysIcon className="w-4 h-4" />
                  <span>12 เมษายน 2569</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-yellow-200 font-medium">
                  <ComputerDesktopIcon className="w-4 h-4" />
                  <span>วัตถุประสงค์: จัดหาคอมพิวเตอร์เพื่อการศึกษา</span>
                </div>
              </div>
            </div>
          </div>
          <button 
            onClick={handleAiInsight}
            disabled={loadingAi}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-2xl transition-all group flex items-center gap-2 backdrop-blur-sm self-end md:self-center"
          >
            <SparklesIcon className={`w-5 h-5 ${loadingAi ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">AI วิเคราะห์</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6 mt-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-orange-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-xl">
                <ArrowDownCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-slate-500 font-medium">รายรับรวม</span>
            </div>
            <p className="text-3xl font-bold text-green-600">
              {summary.totalIncome.toLocaleString()} <span className="text-sm font-normal text-slate-400">บาท</span>
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-orange-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-100 rounded-xl">
                <ArrowUpCircleIcon className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-slate-500 font-medium">รายจ่ายรวม</span>
            </div>
            <p className="text-3xl font-bold text-red-600">
              {summary.totalExpense.toLocaleString()} <span className="text-sm font-normal text-slate-400">บาท</span>
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-orange-100 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-xl">
                <WalletIcon className="w-6 h-6" />
              </div>
              <span className="text-orange-100 font-medium">คงเหลือสุทธิ</span>
            </div>
            <p className="text-3xl font-bold">
              {summary.balance.toLocaleString()} <span className="text-sm font-normal text-orange-200">บาท</span>
            </p>
          </div>
        </div>

        {/* AI Insight Box */}
        {aiInsight && (
          <div className="bg-white p-5 rounded-3xl shadow-sm border-2 border-orange-200 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-2 mb-2 text-orange-600">
              <SparklesIcon className="w-5 h-5" />
              <h3 className="font-bold">AI วิเคราะห์งบประมาณ</h3>
            </div>
            <p className="text-slate-700 italic leading-relaxed">"{aiInsight}"</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-orange-100 h-fit">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <PlusIcon className="w-5 h-5 text-orange-500" />
              บันทึกรายการใหม่
            </h2>
            <form onSubmit={addTransaction} className="space-y-4">
              <div className="flex p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setType(TransactionType.INCOME)}
                  className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                    type === TransactionType.INCOME ? 'bg-white shadow-sm text-green-600' : 'text-slate-500'
                  }`}
                >
                  รายรับ
                </button>
                <button
                  type="button"
                  onClick={() => setType(TransactionType.EXPENSE)}
                  className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                    type === TransactionType.EXPENSE ? 'bg-white shadow-sm text-red-600' : 'text-slate-500'
                  }`}
                >
                  รายจ่าย
                </button>
              </div>

              <div>
                <label className="block text-sm text-slate-500 mb-1">รายการ / ชื่อผู้บริจาค</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น ผ้าป่าครอบครัว มั่งมี"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-500 mb-1">จำนวนเงิน (บาท)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2"
              >
                บันทึกรายการ
              </button>
            </form>
          </div>

          {/* Visualization */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-orange-100 h-[400px]">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <ChartPieIcon className="w-5 h-5 text-orange-500" />
              สรุปภาพรวมรายรับ-รายจ่าย
            </h2>
            <div className="h-full pb-8">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <DocumentTextIcon className="w-5 h-5 text-orange-500" />
              ประวัติรายการทั้งหมด
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setActiveTab('all')}
                className={`px-4 py-1.5 rounded-full text-sm transition-all ${activeTab === 'all' ? 'bg-orange-100 text-orange-600 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                ทั้งหมด
              </button>
              <button 
                onClick={() => setActiveTab('income')}
                className={`px-4 py-1.5 rounded-full text-sm transition-all ${activeTab === 'income' ? 'bg-green-100 text-green-600 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                รายรับ
              </button>
              <button 
                onClick={() => setActiveTab('expense')}
                className={`px-4 py-1.5 rounded-full text-sm transition-all ${activeTab === 'expense' ? 'bg-red-100 text-red-600 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                รายจ่าย
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-4">วันที่</th>
                  <th className="px-6 py-4">รายการ</th>
                  <th className="px-6 py-4">ประเภท</th>
                  <th className="px-6 py-4 text-right">จำนวนเงิน</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                      ยังไม่มีรายการบันทึก
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-orange-50/20 transition-colors group">
                      <td className="px-6 py-4 text-sm text-slate-500">{t.date}</td>
                      <td className="px-6 py-4 font-medium text-slate-700">{t.title}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          t.type === TransactionType.INCOME 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                        }`}>
                          {t.type === TransactionType.INCOME ? 'รายรับ' : 'รายจ่าย'}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-right font-mono font-bold ${
                        t.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {t.type === TransactionType.INCOME ? '+' : '-'}{t.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => deleteTransaction(t.id)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <TrashIcon className="w-4 h-4" />
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

      {/* Floating Bottom Nav */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/90 backdrop-blur text-white px-6 py-3 rounded-full shadow-2xl z-20 md:hidden">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex flex-col items-center gap-1 opacity-100 text-orange-400">
           <WalletIcon className="w-5 h-5" />
           <span className="text-[10px]">สรุป</span>
        </button>
        <div className="w-px h-6 bg-white/20"></div>
        <button onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })} className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100">
           <PlusIcon className="w-5 h-5" />
           <span className="text-[10px]">เพิ่ม</span>
        </button>
         <div className="w-px h-6 bg-white/20"></div>
        <button onClick={() => window.scrollTo({ top: 1000, behavior: 'smooth' })} className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100">
           <DocumentTextIcon className="w-5 h-5" />
           <span className="text-[10px]">รายการ</span>
        </button>
      </div>
    </div>
  );
};

export default App;
