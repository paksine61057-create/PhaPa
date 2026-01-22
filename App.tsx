
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionType, BudgetSummary, TransactionCategory } from './types';
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
  ComputerDesktopIcon,
  CheckCircleIcon,
  CakeIcon,
  BeakerIcon,
  Square3Stack3DIcon,
  HeartIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { getBudgetInsights } from './services/geminiService';

const GOAL_TARGET = 200000; 
const PRICE_PER_PC = 20000;

const categoryConfig = {
  [TransactionCategory.CATERING]: { icon: CakeIcon, color: 'text-orange-600', bg: 'bg-orange-100', hex: '#EA580C' },
  [TransactionCategory.DRINKS]: { icon: BeakerIcon, color: 'text-blue-600', bg: 'bg-blue-100', hex: '#2563EB' },
  [TransactionCategory.GLASS]: { icon: Square3Stack3DIcon, color: 'text-purple-600', bg: 'bg-purple-100', hex: '#9333EA' },
  [TransactionCategory.DONATION]: { icon: HeartIcon, color: 'text-emerald-600', bg: 'bg-emerald-100', hex: '#10B981' },
};

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('phapa_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense'>('all');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.INCOME);
  const [category, setCategory] = useState<TransactionCategory>(TransactionCategory.DONATION);

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
    return { totalIncome: income, totalExpense: expense, balance: income - expense };
  }, [transactions]);

  const progressPercent = Math.min((summary.balance / GOAL_TARGET) * 100, 100);
  const pcCount = Math.floor(summary.balance / PRICE_PER_PC);

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
      category,
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
    if (transactions.length === 0) return;
    setLoadingAi(true);
    const insight = await getBudgetInsights(transactions, summary);
    setAiInsight(insight);
    setLoadingAi(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const barData = [
    { name: 'รายรับ', value: summary.totalIncome, color: '#10B981' },
    { name: 'รายจ่าย', value: summary.totalExpense, color: '#F43F5E' },
  ];

  const pieData = Object.values(TransactionCategory).map(cat => ({
    name: cat,
    value: transactions.filter(t => t.category === cat).reduce((sum, t) => sum + t.amount, 0),
    color: categoryConfig[cat].hex
  })).filter(d => d.value > 0);

  return (
    <div className="min-h-screen text-slate-800 pb-24">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white pt-10 pb-16 px-6 shadow-2xl sticky top-0 z-20 rounded-b-[3rem] border-b-4 border-amber-300/40 no-print">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md shadow-inner border border-white/30">
                <WalletIcon className="w-8 h-8 text-amber-100" />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight drop-shadow-md">สรุปงบผ้าป่าการศึกษา</h1>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-amber-50 font-bold">
                <AcademicCapIcon className="w-5 h-5" />
                <span>โรงเรียนประจักษ์ศิลปาคม - 12 เม.ย. 2569</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handlePrint}
              className="bg-white/20 hover:bg-white/30 border border-white/40 px-6 py-3 rounded-2xl transition-all flex items-center gap-3 backdrop-blur-lg shadow-xl active:scale-95"
            >
              <PrinterIcon className="w-6 h-6 text-white" />
              <span className="text-sm font-black uppercase tracking-widest">พิมพ์รายงาน/PDF</span>
            </button>
            <button 
              onClick={handleAiInsight}
              disabled={loadingAi || transactions.length === 0}
              className="bg-white text-orange-600 px-6 py-3 rounded-2xl transition-all flex items-center gap-3 shadow-xl active:scale-95 disabled:opacity-50"
            >
              <SparklesIcon className={`w-6 h-6 text-orange-400 ${loadingAi ? 'animate-spin' : ''}`} />
              <span className="text-sm font-black uppercase tracking-widest">AI วิเคราะห์งบ</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-8 -mt-8 relative z-10">
        
        {/* Goal Progress */}
        <div className="bg-white/95 backdrop-blur-md p-8 rounded-[2.5rem] shadow-2xl border border-orange-100 no-print">
           <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 text-center md:text-left">
              <div>
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
                  เป้าหมาย: จัดหาคอมพิวเตอร์ (เครื่องละ {PRICE_PER_PC.toLocaleString()} บาท)
                </h3>
                <p className="text-slate-500">ยอดเงินคงเหลือปัจจุบันสามารถจัดหาได้ประมาณ <span className="text-orange-600 font-black">{pcCount}</span> เครื่อง</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-orange-600">{progressPercent.toFixed(1)}%</span>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ของเป้าหมาย {GOAL_TARGET.toLocaleString()} บ. (10 เครื่อง)</p>
              </div>
           </div>
           <div className="w-full bg-slate-100 h-6 rounded-full overflow-hidden shadow-inner">
              <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
           </div>
        </div>

        {/* AI Insight Box */}
        {aiInsight && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-8 rounded-[2.5rem] shadow-xl border-2 border-amber-200 animate-in fade-in slide-in-from-top-6 relative overflow-hidden no-print">
            <div className="absolute top-0 left-0 w-2 h-full bg-amber-400"></div>
            <div className="flex items-center gap-3 mb-4 text-orange-700">
              <SparklesIcon className="w-6 h-6 animate-pulse" />
              <h3 className="font-extrabold text-xl uppercase tracking-tighter italic">AI สรุปบุญ</h3>
            </div>
            <p className="text-slate-800 italic leading-relaxed text-lg font-medium">"{aiInsight}"</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="flex flex-col gap-6 stats-container no-print">
          <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-emerald-50 flex items-center gap-4">
            <div className="p-4 bg-emerald-100 rounded-2xl"><ArrowDownCircleIcon className="w-8 h-8 text-emerald-600" /></div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">รายรับ</p>
              <p className="text-2xl font-black text-emerald-600">{summary.totalIncome.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-rose-50 flex items-center gap-4">
            <div className="p-4 bg-rose-100 rounded-2xl"><ArrowUpCircleIcon className="w-8 h-8 text-rose-600" /></div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">รายจ่าย</p>
              <p className="text-2xl font-black text-rose-600">{summary.totalExpense.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-600 to-amber-500 p-6 rounded-[2rem] shadow-2xl text-white flex items-center gap-4">
            <div className="p-4 bg-white/20 rounded-2xl"><WalletIcon className="w-8 h-8 text-white" /></div>
            <div>
              <p className="text-xs font-black text-orange-100 uppercase tracking-widest">คงเหลือ</p>
              <p className="text-2xl font-black text-white">{summary.balance.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Form and Charts */}
        <div className="flex flex-col gap-8 no-print">
          <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-orange-50">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
              <PlusIcon className="w-6 h-6 text-orange-600" />
              บันทึกรายการ
            </h2>
            <form onSubmit={addTransaction} className="space-y-5">
              <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                <button type="button" onClick={() => { setType(TransactionType.INCOME); setCategory(TransactionCategory.DONATION); }} className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${type === TransactionType.INCOME ? 'bg-white shadow text-emerald-600' : 'text-slate-400'}`}>รายรับ</button>
                <button type="button" onClick={() => { setType(TransactionType.EXPENSE); setCategory(TransactionCategory.CATERING); }} className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${type === TransactionType.EXPENSE ? 'bg-white shadow text-rose-600' : 'text-slate-400'}`}>รายจ่าย</button>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">เลือกหมวดหมู่</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.values(TransactionCategory).map((cat) => {
                    const Config = categoryConfig[cat];
                    const Icon = Config.icon;
                    const isActive = category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${isActive ? `border-orange-500 ${Config.bg}` : 'border-slate-50 bg-slate-50 hover:bg-white'}`}
                      >
                        <Icon className={`w-6 h-6 mb-1 ${isActive ? Config.color : 'text-slate-400'}`} />
                        <span className={`text-[10px] font-black ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>{cat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ชื่อรายการ / ผู้บริจาค"
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 focus:bg-white focus:border-orange-200 outline-none transition-all font-bold"
                />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="จำนวนเงิน"
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 focus:bg-white focus:border-orange-200 outline-none transition-all font-mono text-xl font-black text-orange-600"
                />
              </div>
              <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-orange-100 transition-all active:scale-95">บันทึกข้อมูล</button>
            </form>
          </div>

          <div className="flex flex-col gap-8 charts-container no-print">
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-50">
              <h3 className="font-black text-slate-400 text-xs uppercase tracking-widest mb-6">เปรียบเทียบรับ-จ่าย</h3>
              <div className="min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#cbd5e1', fontSize: 10}} />
                    <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={60}>
                      {barData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-50">
              <h3 className="font-black text-slate-400 text-xs uppercase tracking-widest mb-6">สัดส่วนแยกตามหมวด</h3>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="min-h-[250px] w-full md:w-1/2">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value">
                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full md:w-1/2">
                  {pieData.map((d, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-500">{d.name}</span>
                        <span className="text-sm font-black text-slate-800">{d.value.toLocaleString()} บ.</span>
                      </div>
                    </div>
                  ))}
                  {pieData.length === 0 && <p className="col-span-2 text-center text-slate-400 font-bold py-4 italic">ยังไม่มีข้อมูลการใช้จ่าย</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Table UI */}
        <div className="bg-white rounded-[3rem] shadow-2xl border border-orange-50 overflow-hidden no-print">
          <div className="p-8 border-b border-orange-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h2 className="text-2xl font-black flex items-center gap-4">
              <DocumentTextIcon className="w-7 h-7 text-orange-600" />
              ประวัติรายการ
            </h2>
            <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl overflow-x-auto">
              {['all', 'income', 'expense'].map((t) => (
                <button key={t} onClick={() => setActiveTab(t as any)} className={`px-6 py-2 rounded-xl text-sm font-black whitespace-nowrap transition-all ${activeTab === t ? 'bg-white shadow text-orange-600' : 'text-slate-400'}`}>
                  {t === 'all' ? 'ทั้งหมด' : t === 'income' ? 'รายรับ' : 'รายจ่าย'}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                  <th className="px-10 py-6">วันที่</th>
                  <th className="px-10 py-6">หมวดหมู่</th>
                  <th className="px-10 py-6">รายการ</th>
                  <th className="px-10 py-6 text-right">จำนวน (บาท)</th>
                  <th className="px-10 py-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-50">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-10 py-24 text-center text-slate-400 italic font-bold">ยังไม่มีข้อมูลบันทึกในหมวดนี้</td>
                  </tr>
                ) : (
                  filteredTransactions.map((t) => {
                    const Config = categoryConfig[t.category];
                    const Icon = Config.icon;
                    return (
                      <tr key={t.id} className="hover:bg-orange-50/30 transition-all group">
                        <td className="px-10 py-6 text-sm text-slate-400 font-bold">{t.date}</td>
                        <td className="px-10 py-6">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${Config.bg} ${Config.color} border-current opacity-80`}>
                            <Icon className="w-4 h-4" />
                            <span className="text-[10px] font-black">{t.category}</span>
                          </div>
                        </td>
                        <td className="px-10 py-6 font-extrabold text-slate-700 text-lg">{t.title}</td>
                        <td className={`px-10 py-6 text-right font-mono font-black text-xl ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {t.type === TransactionType.INCOME ? '+' : '-'}{t.amount.toLocaleString()}
                        </td>
                        <td className="px-10 py-6 text-right">
                          <button onClick={() => deleteTransaction(t.id)} className="p-2 text-slate-200 hover:text-rose-600 transition-all opacity-0 group-hover:opacity-100"><TrashIcon className="w-5 h-5" /></button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Printable Report (Official Format) */}
        <div id="printable-report" className="bg-white text-black p-10 font-serif leading-relaxed">
          {/* Page 1: Overview Summary */}
          <div className="report-page">
            <div className="report-title">
              <h1 className="text-2xl font-bold mb-1 uppercase">รายงานสรุปผลการดำเนินงานงบประมาณงานผ้าป่าเพื่อการศึกษา</h1>
              <h2 className="text-xl font-bold mb-1">โรงเรียนประจักษ์ศิลปาคม</h2>
              <p className="text-md font-bold underline">ประจำปีการศึกษา 2569</p>
              <p className="text-sm mt-4 italic">วันที่พิมพ์เอกสาร: {new Date().toLocaleDateString('th-TH')} เวลา {new Date().toLocaleTimeString('th-TH')}</p>
            </div>

            <div className="mb-10">
              <h3 className="text-lg font-bold mb-6 border-b-2 border-black inline-block uppercase">ส่วนที่ 1: สรุปยอดเงินรวมทั้งหมด</h3>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-4 text-center">หัวข้อรายการสรุป</th>
                    <th className="border p-4 text-right">จำนวนเงิน (บาท)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="h-12">
                    <td className="border p-4 font-bold">1. ยอดรายรับสะสมทั้งหมด (Total Income)</td>
                    <td className="border p-4 text-right font-mono text-xl">{summary.totalIncome.toLocaleString()}</td>
                  </tr>
                  <tr className="h-12">
                    <td className="border p-4 font-bold">2. ยอดรายจ่ายสะสมทั้งหมด (Total Expense)</td>
                    <td className="border p-4 text-right font-mono text-xl">{summary.totalExpense.toLocaleString()}</td>
                  </tr>
                  <tr className="bg-gray-50 h-16">
                    <td className="border p-4 font-bold text-2xl">ยอดเงินคงเหลือสุทธิ (Net Balance)</td>
                    <td className="border p-4 text-right font-mono font-bold text-2xl underline decoration-double">
                      {summary.balance.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="mt-8 p-6 border-2 border-black rounded-xl bg-gray-50">
                <p className="text-lg leading-relaxed">
                  <strong>สรุปผลการวิเคราะห์เป้าหมาย:</strong> จากยอดเงินคงเหลือจำนวน {summary.balance.toLocaleString()} บาท 
                  ทางคณะกรรมการสามารถจัดหาเครื่องคอมพิวเตอร์เพื่อการศึกษาได้ประมาณ 
                  <span className="text-xl font-bold underline px-2">{pcCount}</span> เครื่อง 
                  (ตามราคามาตรฐานครุภัณฑ์เครื่องละ {PRICE_PER_PC.toLocaleString()} บาท)
                </p>
              </div>
            </div>
          </div>

          {/* Page 2: Category Summary */}
          <div className="page-break">
            <h3 className="text-lg font-bold mb-6 border-b-2 border-black inline-block uppercase mt-10">ส่วนที่ 2: สรุปยอดเงินรายรับ-รายจ่าย แยกตามหมวดหมู่</h3>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 h-12">
                  <th className="border p-2 text-center">ลำดับ</th>
                  <th className="border p-2">ชื่อหมวดหมู่รายการ</th>
                  <th className="border p-2 text-right">รายรับ (บาท)</th>
                  <th className="border p-2 text-right">รายจ่าย (บาท)</th>
                  <th className="border p-2 text-right">คงเหลือสุทธิ (บาท)</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(TransactionCategory).map((cat, idx) => {
                  const catIncome = transactions.filter(t => t.category === cat && t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
                  const catExpense = transactions.filter(t => t.category === cat && t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);
                  return (
                    <tr key={cat} className="h-10">
                      <td className="border p-2 text-center">{idx + 1}</td>
                      <td className="border p-2 font-bold">{cat}</td>
                      <td className="border p-2 text-right font-mono">{catIncome.toLocaleString()}</td>
                      <td className="border p-2 text-right font-mono">{catExpense.toLocaleString()}</td>
                      <td className="border p-2 text-right font-mono font-bold">{ (catIncome - catExpense).toLocaleString() }</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Page 3: Detailed Ledger */}
          <div className="page-break">
            <h3 className="text-lg font-bold mb-6 border-b-2 border-black inline-block uppercase mt-10">ส่วนที่ 3: รายการบัญชีโดยละเอียด (รายรับ-รายจ่ายทั้งหมด)</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-center">ลำดับ</th>
                  <th className="border p-2 text-center whitespace-nowrap">วันที่บันทึก</th>
                  <th className="border p-2">ชื่อรายการ / ผู้บริจาค</th>
                  <th className="border p-2 text-center">หมวดหมู่</th>
                  <th className="border p-2 text-right">จำนวนเงิน (บาท)</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr><td colSpan={5} className="border p-8 text-center italic text-lg">--- ไม่มีรายการที่บันทึก ---</td></tr>
                ) : (
                  transactions.map((t, idx) => (
                    <tr key={t.id} className="h-10">
                      <td className="border p-2 text-center">{idx + 1}</td>
                      <td className="border p-2 text-center whitespace-nowrap font-mono">{t.date}</td>
                      <td className="border p-2 font-bold">{t.title}</td>
                      <td className="border p-2 text-center text-xs">{t.category}</td>
                      <td className={`border p-2 text-right font-mono font-bold ${t.type === TransactionType.INCOME ? 'text-black' : 'italic'}`}>
                        {t.type === TransactionType.INCOME ? '(+) ' : '(-) '} {t.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {aiInsight && (
              <div className="mt-12 p-6 border-2 border-dashed border-black bg-gray-50 rounded-xl italic">
                <h4 className="text-sm font-bold uppercase mb-2 not-italic underline">บทวิเคราะห์และข้อเสนอแนะโดยระบบ AI:</h4>
                <p className="leading-relaxed">"{aiInsight}"</p>
              </div>
            )}

            <div className="signature-section mt-20">
              <div className="signature-box">
                <p className="mb-20 italic">ขอรับรองว่าข้อมูลข้างต้นเป็นความจริงทุกประการ</p>
                <p className="mb-12">ลงชื่อ............................................................</p>
                <p className="mb-2">(............................................................)</p>
                <p className="font-bold">เจ้าหน้าที่บัญชี / ผู้สรุปรายงาน</p>
              </div>
              <div className="signature-box">
                <p className="mb-20 italic">ตรวจสอบและพิจารณาอนุมัติ</p>
                <p className="mb-12">ลงชื่อ............................................................</p>
                <p className="mb-2">(............................................................)</p>
                <p className="font-bold">ผู้อำนวยการโรงเรียนประจักษ์ศิลปาคม</p>
              </div>
            </div>

            <div className="mt-24 text-center text-[10px] text-gray-500 border-t border-gray-100 pt-6 italic">
              เอกสารฉบับนี้พิมพ์โดยระบบบริหารจัดการงบประมาณ Pha Pa Budget Pro v4.0 - โรงเรียนประจักษ์ศิลปาคม
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
