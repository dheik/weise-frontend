import { useRef, useState, useMemo, useEffect } from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { useTheme } from '../components/theme-provider';
import SummaryCard from '../components/SummaryCard';
import {
    LogOut, Plus, Trash2, Calendar, Search, FilterX,
    Utensils, Car, Home, HeartPulse, Wallet, ShoppingBag,
    GraduationCap, Plane, Tag, ChevronLeft, ChevronRight,
    Dumbbell, Gift, Gamepad2, Wifi, Zap, Droplet, Smartphone,
    Briefcase, PiggyBank, Landmark
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NewTransactionModal from '../components/NewTransactionModal';
import FinancialHistoryChart from '../components/charts/FinancialHistoryChart';
import ExpensesPieChart from '../components/charts/ExpensesPieChart';
import api from '../services/api';
import { toast } from 'sonner';
import logo from '../assets/logo.png';
import logoDark from '../assets/logo-dark.png';
import { ModeToggle } from '../components/mode-toggle';

// Helper de Ícones ampliado
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    alimentacao: <Utensils size={20} />,
    transporte: <Car size={20} />,
    casa: <Home size={20} />,
    saude: <HeartPulse size={20} />,
    salario: <Wallet size={20} />,
    compras: <ShoppingBag size={20} />,
    educacao: <GraduationCap size={20} />,
    viagem: <Plane size={20} />,
    lazer: <Gamepad2 size={20} />,
    academia: <Dumbbell size={20} />,
    presente: <Gift size={20} />,
    contas: <Zap size={20} />,       // Luz, Energia
    servicos: <Wifi size={20} />,    // Internet, Assinaturas
    agua: <Droplet size={20} />,
    tecnologia: <Smartphone size={20} />,
    trabalho: <Briefcase size={20} />,
    investimento: <PiggyBank size={20} />,
    banco: <Landmark size={20} />,
    default: <Tag size={20} />
};

function getCategoryIcon(name: string) {
    if (!name) return CATEGORY_ICONS.default;
    const key = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (key.includes('aliment') || key.includes('comida') || key.includes('restaurante') || key.includes('mercado') || key.includes('lanche')) return CATEGORY_ICONS.alimentacao;
    if (key.includes('transporte') || key.includes('carro') || key.includes('uber') || key.includes('combustivel') || key.includes('gasolina')) return CATEGORY_ICONS.transporte;
    if (key.includes('casa') || key.includes('moradia') || key.includes('aluguel') || key.includes('condominio')) return CATEGORY_ICONS.casa;
    if (key.includes('saude') || key.includes('medico') || key.includes('farmacia') || key.includes('remedio') || key.includes('exame')) return CATEGORY_ICONS.saude;
    if (key.includes('salario') || key.includes('pagamento') || key.includes('holerite') || key.includes('renda')) return CATEGORY_ICONS.salario;
    if (key.includes('compra') || key.includes('shopping') || key.includes('loja') || key.includes('roupa')) return CATEGORY_ICONS.compras;
    if (key.includes('educacao') || key.includes('curso') || key.includes('faculdade') || key.includes('livro') || key.includes('escola')) return CATEGORY_ICONS.educacao;
    if (key.includes('viagem') || key.includes('ferias') || key.includes('hotel') || key.includes('passagem')) return CATEGORY_ICONS.viagem;

    // Novos mapeamentos
    if (key.includes('academia') || key.includes('esporte') || key.includes('fitness') || key.includes('treino')) return CATEGORY_ICONS.academia;
    if (key.includes('lazer') || key.includes('jogo') || key.includes('game') || key.includes('cinema') || key.includes('diversao')) return CATEGORY_ICONS.lazer;
    if (key.includes('presente') || key.includes('aniversario') || key.includes('natal')) return CATEGORY_ICONS.presente;
    if (key.includes('luz') || key.includes('energia') || key.includes('eletricidade')) return CATEGORY_ICONS.contas;
    if (key.includes('agua') || key.includes('esgoto') || key.includes('saneamento')) return CATEGORY_ICONS.agua;
    if (key.includes('internet') || key.includes('wifi') || key.includes('tv') || key.includes('assinatura') || key.includes('netflix') || key.includes('spotify') || key.includes('servico')) return CATEGORY_ICONS.servicos;
    if (key.includes('celular') || key.includes('telefone') || key.includes('computador') || key.includes('eletronico')) return CATEGORY_ICONS.tecnologia;
    if (key.includes('trabalho') || key.includes('freelance') || key.includes('job') || key.includes('projeto')) return CATEGORY_ICONS.trabalho;
    if (key.includes('investimento') || key.includes('poupanca') || key.includes('cdb') || key.includes('acoes') || key.includes('cripto')) return CATEGORY_ICONS.investimento;
    if (key.includes('banco') || key.includes('taxa') || key.includes('transferencia') || key.includes('pix')) return CATEGORY_ICONS.banco;

    return CATEGORY_ICONS.default;
}

export default function Dashboard() {
    const { transactions, summary, isLoading, dateRange, setDateRange, refresh } = useDashboard();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const startDateRef = useRef<HTMLInputElement>(null);
    const endDateRef = useRef<HTMLInputElement>(null);
    const { theme } = useTheme();

    // Estados de Filtro Interativo (Clique nos Gráficos)
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Lista de meses
    const monthOptions = useMemo(() => {
        const options = [];
        const start = new Date();
        start.setMonth(start.getMonth() - 11);

        for (let i = 0; i < 18; i++) {
            const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
            options.push(d);
        }
        return options;
    }, []);

    // Scroll inicial para o mês atual (índice 11 sempre, já que começamos -11 meses)
    useEffect(() => {
        if (scrollContainerRef.current) {
            // Pequeno timeout para garantir que o render ocorreu
            setTimeout(() => {
                const buttons = scrollContainerRef.current?.querySelectorAll('button');
                const currentMonthBtn = buttons?.[11];
                if (currentMonthBtn) {
                    currentMonthBtn.scrollIntoView({
                        behavior: 'auto', // Instantâneo na carga
                        block: 'nearest',
                        inline: 'center'
                    });
                }
            }, 100);
        }
    }, [monthOptions]);

    function selectMonth(date: Date, event: React.MouseEvent) {
        let newStart = new Date(date.getFullYear(), date.getMonth(), 1);
        let newEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        if (event.shiftKey && dateRange.start) {
            const currentStart = new Date(dateRange.start);
            const currentEnd = new Date(dateRange.end);

            // Determine the total range

            // However, if we clicked a month AFTER the current range, we want that month's end.
            // If we clicked BEFORE, we might want to keep the current end.
            // Let's simplify: Union of [currentStart, currentEnd] and [newStart, newEnd]

            const start = newStart < currentStart ? newStart : currentStart;
            const end = newEnd > currentEnd ? newEnd : currentEnd;

            setDateRange({
                start: start.toISOString().split('T')[0],
                end: end.toISOString().split('T')[0]
            });
        } else {
            // Single selection
            setDateRange({
                start: newStart.toISOString().split('T')[0],
                end: newEnd.toISOString().split('T')[0]
            });
        }
    }

    function isSelectedMonth(d1: Date) {
        if (!dateRange.start || !dateRange.end) return false;

        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);
        const currentMonthStart = new Date(d1.getFullYear(), d1.getMonth(), 1);
        const currentMonthEnd = new Date(d1.getFullYear(), d1.getMonth() + 1, 0);

        return start <= currentMonthEnd && end >= currentMonthStart;
    }

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const { current } = scrollContainerRef;
            const scrollAmount = 200;
            current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

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
            toast.success("Transação excluída com sucesso");
            refresh();
        } catch (error) {
            toast.error("Erro ao excluir transação");
        }
    }

    function handleLogout() {
        localStorage.removeItem('weise_token');
        navigate('/');
    }

    return (
        <div className="min-h-screen bg-background pb-20 relative overflow-hidden selection:bg-primary/10">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
                <div className="absolute bottom-[20%] right-[-5%] w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[120px]" />
            </div>

            <nav className="border-b border-border/40 bg-background/80 backdrop-blur-md px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm transition-all duration-300">
                <div className="flex items-center gap-4">
                    <img
                        src={theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? logo : logoDark}
                        alt="Weise"
                        className="h-12 w-auto"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <ModeToggle />
                    <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition">
                        <LogOut size={16} /> <span className="hidden sm:inline">Sair</span>
                    </button>
                </div>
            </nav>

            <main className="mx-auto max-w-6xl p-4 sm:p-6 space-y-8">
                {/* Filtro de Mês */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs text-slate-400 ml-1 font-medium">Navegar por Mês</label>
                    <div className="relative group/nav">
                        <button onClick={() => scroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-card/80 text-foreground border shadow-sm backdrop-blur-sm opacity-0 group-hover/nav:opacity-100 transition-opacity -ml-3 sm:ml-0 hover:bg-accent">
                            <ChevronLeft size={20} />
                        </button>
                        <div
                            ref={scrollContainerRef}
                            className="flex gap-3 overflow-x-auto py-6 px-4 scroll-smooth snap-x snap-mandatory [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] [&::-webkit-scrollbar]:hidden"
                        >
                            {monthOptions.map((date, idx) => {
                                const label = date.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '').toUpperCase();
                                return (
                                    <button
                                        key={idx}
                                        onClick={(e) => selectMonth(date, e)}
                                        className={`flex-shrink-0 snap-center px-6 py-2.5 rounded-full text-xs font-bold transition-all duration-300 whitespace-nowrap border ${isSelectedMonth(date) ? 'bg-[#7c3aed] text-white border-[#7c3aed] shadow-lg shadow-purple-500/25 scale-105 ring-2 ring-purple-500/20' : 'bg-card text-muted-foreground border-transparent hover:border-border hover:bg-accent/50 hover:text-accent-foreground shadow-sm hover:shadow'}`}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                        <button onClick={() => scroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-card/80 text-foreground border shadow-sm backdrop-blur-sm opacity-0 group-hover/nav:opacity-100 transition-opacity -mr-3 sm:mr-0 hover:bg-accent">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Filtros e Resumo */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                    <div className="md:col-span-1 flex flex-col gap-3">
                        <div className="bg-card p-4 rounded-xl border shadow-sm space-y-4">
                            <div className="group relative">
                                <label className="text-xs text-muted-foreground font-medium ml-1 mb-1 block">Início</label>
                                <div onClick={() => startDateRef.current?.showPicker()} className="flex items-center gap-3 bg-secondary/50 border border-transparent rounded-lg px-4 py-3 cursor-pointer hover:bg-secondary transition-colors">
                                    <div className="text-foreground"><Calendar size={18} /></div>
                                    <input ref={startDateRef} type="date" value={dateRange.start} onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))} className="bg-transparent text-sm text-foreground font-medium w-full focus:outline-none [color-scheme:light] dark:[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:hidden cursor-pointer" />
                                </div>
                            </div>
                            <div className="group relative">
                                <label className="text-xs text-slate-500 font-medium ml-1 mb-1 block">Fim</label>
                                <div onClick={() => endDateRef.current?.showPicker()} className="flex items-center gap-3 bg-secondary/50 border border-transparent rounded-lg px-4 py-3 cursor-pointer hover:bg-secondary transition-colors">
                                    <div className="text-foreground"><Calendar size={18} /></div>
                                    <input ref={endDateRef} type="date" value={dateRange.end} onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))} className="bg-transparent text-sm text-foreground font-medium w-full focus:outline-none [color-scheme:light] dark:[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:hidden cursor-pointer" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {isLoading ? (
                            [1, 2, 3].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)
                        ) : (
                            <>
                                <SummaryCard
                                    title="Entradas"
                                    value={summary.totalIncome}
                                    color="text-emerald-600 dark:text-emerald-400"
                                    iconClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                                    icon={Plus}
                                />
                                <SummaryCard
                                    title="Saídas"
                                    value={summary.totalExpense}
                                    color="text-red-600 dark:text-red-400"
                                    iconClass="bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                                    icon={LogOut}
                                />
                                <SummaryCard
                                    title="Saldo"
                                    value={summary.balance}
                                    color={summary.balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}
                                    iconClass="bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400"
                                    icon={Wallet}
                                />
                            </>
                        )}
                    </div>
                </div>

                {/* Gráficos */}
                {
                    transactions.length > 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <FinancialHistoryChart transactions={transactions} onBarClick={(date) => { setSelectedCategory(null); setSelectedDate(date === selectedDate ? null : date); }} />
                            </div>
                            <div className="lg:col-span-1">
                                <ExpensesPieChart transactions={transactions} onSliceClick={(category) => { setSelectedDate(null); setSelectedCategory(category === selectedCategory ? null : category); }} />
                            </div>
                        </div>
                    )
                }

                {/* Extrato */}
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="flex items-center justify-between border-b p-6">
                        <div className="flex items-center gap-4">
                            <h2 className="font-semibold text-lg">Extrato</h2>
                            {(selectedDate || selectedCategory) && (
                                <div className="flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs">
                                    <span>Filtrado por: <b>{selectedDate ? new Date(selectedDate).toLocaleDateString('pt-BR') : selectedCategory}</b></span>
                                    <button onClick={() => { setSelectedDate(null); setSelectedCategory(null); }} className="hover:text-white transition-colors"><FilterX size={14} /></button>
                                </div>
                            )}
                        </div>
                        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition shadow-sm active:scale-95">
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
                                    <li key={t.id} className="group flex items-center justify-between rounded-lg bg-transparent p-4 hover:bg-muted/50 transition border border-transparent hover:border-border">
                                        <div className="flex items-center gap-4">
                                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-colors bg-secondary text-secondary-foreground group-hover:bg-background`}>
                                                {getCategoryIcon(t.category?.name || '')}
                                            </div>
                                            <div>
                                                <p className="font-medium text-card-foreground">{t.description}</p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                    <span className="bg-secondary px-2 py-0.5 rounded">{t.category?.name || 'Sem Categoria'}</span>
                                                    <span>{new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`font-bold tabular-nums ${t.type === 'INCOME' ? 'text-success-foreground dark:text-emerald-400' : 'text-destructive-foreground dark:text-rose-400'}`}>
                                                {t.type === 'INCOME' ? '+' : '-'}
                                                {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </span>
                                            <button onClick={() => handleDelete(t.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition p-2 hover:bg-destructive/10 rounded" title="Excluir">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </main >

            <NewTransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => refresh()}
            />
        </div >
    );
}