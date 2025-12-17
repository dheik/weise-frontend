import { useEffect, useState, useMemo, useRef } from 'react';
import api from '../services/api';
import {
    LogOut, Plus, Trash2, Calendar, Search, FilterX,
    Utensils, Car, Home, HeartPulse, Wallet, ShoppingBag,
    GraduationCap, Plane, Tag, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NewTransactionModal from '../components/NewTransactionModal';
import FinancialHistoryChart from '../components/charts/FinancialHistoryChart';
import ExpensesPieChart from '../components/charts/ExpensesPieChart';
import type { Transaction } from '../types';

export default function Dashboard() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Estados de Filtro Global (Datas)
    const today = new Date();
    // Default: Mês atual
    const [startDate, setStartDate] = useState(() => {
        const d = new Date(today.getFullYear(), today.getMonth(), 1);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => {
        const d = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Último dia
        return d.toISOString().split('T')[0];
    });

    // Estados de Filtro Interativo (Clique nos Gráficos)
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Helper de Ícones
    function getCategoryIcon(name: string) {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('aliment') || lowerName.includes('comida') || lowerName.includes('restaurante')) return <Utensils size={20} />;
        if (lowerName.includes('transporte') || lowerName.includes('carro') || lowerName.includes('uber')) return <Car size={20} />;
        if (lowerName.includes('casa') || lowerName.includes('moradia') || lowerName.includes('aluguel')) return <Home size={20} />;
        if (lowerName.includes('saúde') || lowerName.includes('médico') || lowerName.includes('farmácia')) return <HeartPulse size={20} />;
        if (lowerName.includes('salário') || lowerName.includes('pagamento')) return <Wallet size={20} />;
        if (lowerName.includes('compra') || lowerName.includes('shopping')) return <ShoppingBag size={20} />;
        if (lowerName.includes('educação') || lowerName.includes('curso')) return <GraduationCap size={20} />;
        if (lowerName.includes('viagem') || lowerName.includes('férias')) return <Plane size={20} />;
        return <Tag size={20} />;
    }

    // Lista de meses para o filtro rápido (últimos 12 meses + 6 futuros)
    const monthOptions = useMemo(() => {
        const options = [];
        const start = new Date();
        start.setMonth(start.getMonth() - 11); // Começa 1 ano atrás

        for (let i = 0; i < 18; i++) {
            const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
            options.push(d);
        }
        return options;
    }, []);

    function selectMonth(date: Date) {
        // Define inicio e fim do mês selecionado
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        setStartDate(firstDay.toISOString().split('T')[0]);
        setEndDate(lastDay.toISOString().split('T')[0]);
    }

    function isSameMonth(d1: Date, dateStr: string) {
        const [y, m] = dateStr.split('-');
        return d1.getFullYear() === parseInt(y) && d1.getMonth() === (parseInt(m) - 1);
    }

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const { current } = scrollContainerRef;
            const scrollAmount = 200;
            if (direction === 'left') {
                current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    async function fetchTransactions() {
        try {
            const response = await api.get('/transactions', {
                params: { startDate: startDate || null, endDate: endDate || null }
            });
            setTransactions(response.data);
            setSelectedDate(null);
            setSelectedCategory(null);
        } catch (error: any) {
            if (error.response?.status === 403) handleLogout();
        }
    }

    const displayedTransactions = useMemo(() => {
        return transactions.filter(t => {
            if (selectedDate && !t.date.startsWith(selectedDate)) return false;
            if (selectedCategory && t.category?.name !== selectedCategory) return false;
            return true;
        });
    }, [transactions, selectedDate, selectedCategory]);

    async function handleDelete(id: string) {
        if (!confirm('Tem certeza que deseja excluir esta transação?')) return;
        try {
            await api.delete(`/transactions/${id}`);
            fetchTransactions();
        } catch (error) {
            alert('Erro ao excluir');
        }
    }

    useEffect(() => {
        fetchTransactions();
    }, [startDate, endDate]);

    function handleLogout() {
        localStorage.removeItem('weise_token');
        navigate('/');
    }

    const income = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
    const total = income - expense;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
            <nav className="border-b border-slate-800 bg-slate-900 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-md">
                <h1 className="text-xl font-bold text-white tracking-tight">Weise<span className="text-blue-500">.</span></h1>
                <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition">
                    <LogOut size={16} /> <span className="hidden sm:inline">Sair</span>
                </button>
            </nav>

            <main className="mx-auto max-w-6xl p-4 sm:p-6 space-y-8">

                {/* Filtro de Mês (Navegação com Setas) */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs text-slate-400 ml-1 font-medium">Navegar por Mês</label>

                    <div className="relative group/nav">
                        {/* Botão Esquerda */}
                        <button
                            onClick={() => scroll('left')}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-slate-900/80 text-white border border-slate-700 shadow-lg backdrop-blur-sm opacity-0 group-hover/nav:opacity-100 transition-opacity -ml-3 sm:ml-0"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <div
                            ref={scrollContainerRef}
                            className="flex gap-3 overflow-x-auto py-2 [&::-webkit-scrollbar]:hidden mask-gradient px-1 scroll-smooth"
                        >
                            {monthOptions.map((date, idx) => {
                                const active = isSameMonth(date, startDate);
                                const label = date.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '').toUpperCase();
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => selectMonth(date)}
                                        className={`
                                            flex-shrink-0 px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 whitespace-nowrap border
                                            ${active
                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-105'
                                                : 'bg-slate-900/40 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200 hover:border-slate-600 backdrop-blur-sm'
                                            }
                                        `}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Botão Direita */}
                        <button
                            onClick={() => scroll('right')}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-slate-900/80 text-white border border-slate-700 shadow-lg backdrop-blur-sm opacity-0 group-hover/nav:opacity-100 transition-opacity -mr-3 sm:mr-0"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Filtros de Data Customizada e Resumo */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">

                    {/* Inputs de Data (Estilo Customizado) */}
                    <div className="md:col-span-1 flex flex-col gap-3">
                        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-sm space-y-4">
                            {/* Data Início */}
                            <div className="group relative">
                                <label className="text-xs text-slate-500 font-medium ml-1 mb-1 block">Início</label>
                                <div
                                    onClick={() => (document.getElementById('start-date-input') as HTMLInputElement)?.showPicker()}
                                    className="flex items-center gap-3 bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 cursor-pointer hover:border-slate-700 hover:bg-slate-900 transition-all group-hover:shadow-md group-hover:shadow-blue-900/10"
                                >
                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                        <Calendar size={18} />
                                    </div>
                                    <input
                                        id="start-date-input"
                                        type="date"
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                        className="bg-transparent text-sm text-slate-200 font-medium w-full focus:outline-none [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:hidden cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Data Fim */}
                            <div className="group relative">
                                <label className="text-xs text-slate-500 font-medium ml-1 mb-1 block">Fim</label>
                                <div
                                    onClick={() => (document.getElementById('end-date-input') as HTMLInputElement)?.showPicker()}
                                    className="flex items-center gap-3 bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 cursor-pointer hover:border-slate-700 hover:bg-slate-900 transition-all group-hover:shadow-md group-hover:shadow-blue-900/10"
                                >
                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                        <Calendar size={18} />
                                    </div>
                                    <input
                                        id="end-date-input"
                                        type="date"
                                        value={endDate}
                                        onChange={e => setEndDate(e.target.value)}
                                        className="bg-transparent text-sm text-slate-200 font-medium w-full focus:outline-none [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:hidden cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cards de Resumo */}
                    <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Plus size={40} />
                            </div>
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Entradas</span>
                            <p className="mt-1 text-2xl font-bold text-green-500">
                                {income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <LogOut size={40} />
                            </div>
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Saídas</span>
                            <p className="mt-1 text-2xl font-bold text-red-500">
                                {expense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Wallet size={40} />
                            </div>
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Saldo</span>
                            <p className={`mt-1 text-2xl font-bold ${total >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                                {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Gráficos */}
                {transactions.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <FinancialHistoryChart
                                transactions={transactions}
                                onBarClick={(date) => {
                                    setSelectedCategory(null);
                                    setSelectedDate(date === selectedDate ? null : date);
                                }}
                            />
                        </div>
                        <div className="lg:col-span-1">
                            <ExpensesPieChart
                                transactions={transactions}
                                onSliceClick={(category) => {
                                    setSelectedDate(null);
                                    setSelectedCategory(category === selectedCategory ? null : category);
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Lista de Transações (Extrato) */}
                <div className="rounded-xl border border-slate-800 bg-slate-900 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-800 p-6">
                        <div className="flex items-center gap-4">
                            <h2 className="font-semibold text-white">Extrato</h2>
                            {(selectedDate || selectedCategory) && (
                                <div className="flex items-center gap-2 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs border border-blue-500/20 animate-in fade-in zoom-in duration-200">
                                    <span>
                                        Filtrado por: <b>
                                            {selectedDate
                                                ? (() => {
                                                    const parts = selectedDate.split('-');
                                                    if (parts.length === 3) {
                                                        const [year, month, day] = parts;
                                                        return `${day}/${month}/${year}`;
                                                    }
                                                    const [year, month] = parts;
                                                    const date = new Date(parseInt(year), parseInt(month) - 1);
                                                    return date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
                                                })()
                                                : selectedCategory
                                            }
                                        </b>
                                    </span>
                                    <button
                                        onClick={() => { setSelectedDate(null); setSelectedCategory(null); }}
                                        className="hover:text-white transition-colors"
                                    >
                                        <FilterX size={14} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition shadow-lg shadow-blue-900/20 active:scale-95"
                        >
                            <Plus size={16} /> Nova
                        </button>
                    </div>

                    <div className="p-4">
                        {displayedTransactions.length === 0 ? (
                            <div className="text-center py-16 opacity-50">
                                <Search className="mx-auto mb-3 text-slate-600" size={40} />
                                <p className="text-slate-400">Nenhuma transação encontrada.</p>
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {displayedTransactions.map(t => (
                                    <li key={t.id} className="group flex items-center justify-between rounded-lg bg-slate-800/40 p-4 hover:bg-slate-800 transition border border-transparent hover:border-slate-700">
                                        <div className="flex items-center gap-4">
                                            {/* Ícone da Categoria */}
                                            <div className={`
                                                h-12 w-12 rounded-xl flex items-center justify-center transition-colors
                                                ${t.type === 'INCOME'
                                                    ? 'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20'
                                                    : 'bg-rose-500/10 text-rose-500 group-hover:bg-rose-500/20'
                                                }
                                            `}>
                                                {getCategoryIcon(t.category?.name || '')}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{t.description}</p>
                                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                                    <span className="bg-slate-700/50 px-2 py-0.5 rounded text-slate-400">
                                                        {t.category?.name || 'Sem Categoria'}
                                                    </span>
                                                    <span>{new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`font-bold tabular-nums ${t.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {t.type === 'INCOME' ? '+' : '-'}
                                                {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </span>
                                            <button
                                                onClick={() => handleDelete(t.id)}
                                                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-500 transition p-2 hover:bg-red-500/10 rounded"
                                                title="Excluir"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </main>

            <NewTransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => fetchTransactions()}
            />
        </div>
    );
}