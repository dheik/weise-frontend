import { useRef, useState, useEffect } from 'react';
import {
    X, Utensils, Car, Home, HeartPulse, Wallet,
    ShoppingBag, GraduationCap, Plane, Tag, Check, ChevronDown,
    Dumbbell, Gift, Gamepad2, Wifi, Zap, Droplet, Smartphone,
    Briefcase, PiggyBank, Landmark
} from 'lucide-react';
import api from '../services/api';
import type { Category } from '../types';

interface NewTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

// Helper de Ícones (Mantido igual)
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    alimentacao: <Utensils size={18} />,
    transporte: <Car size={18} />,
    casa: <Home size={18} />,
    saude: <HeartPulse size={18} />,
    salario: <Wallet size={18} />,
    compras: <ShoppingBag size={18} />,
    educacao: <GraduationCap size={18} />,
    viagem: <Plane size={18} />,
    lazer: <Gamepad2 size={18} />,
    academia: <Dumbbell size={18} />,
    presente: <Gift size={18} />,
    contas: <Zap size={18} />,
    servicos: <Wifi size={18} />,
    agua: <Droplet size={18} />,
    tecnologia: <Smartphone size={18} />,
    trabalho: <Briefcase size={18} />,
    investimento: <PiggyBank size={18} />,
    banco: <Landmark size={18} />,
    default: <Tag size={18} />
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

    // Novos Mapeamentos
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

export default function NewTransactionModal({ isOpen, onClose, onSuccess }: NewTransactionModalProps) {
    // Form States
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
    const [categoryId, setCategoryId] = useState('');

    // Dropdown State
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const categoryDropdownRef = useRef<HTMLDivElement>(null);

    // Data States
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            api.get('/categories').then(res => setCategories(res.data));
        }
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
                setIsCategoryOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredCategories = categories.filter(c => c.type === type);
    const selectedCategory = categories.find(c => c.id === categoryId);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/transactions', {
                description,
                amount: parseFloat(amount),
                date,
                type,
                categoryId: categoryId || null
            });

            // Reset form
            setDescription('');
            setAmount('');
            setCategoryId('');
            setType('EXPENSE');
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar transação');
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            {/* Mudança Principal: Cores sólidas explicitas (bg-white / dark:bg-zinc-950) 
                Isso garante que não haverá transparência no cartão.
            */}
            <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                {/* Header Fixo */}
                <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <div>
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Nova Transação</h2>
                        <p className="text-xs text-zinc-500">Preencha os dados abaixo</p>
                    </div>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                {/* Corpo com Scroll se necessário */}
                <div className="overflow-y-auto custom-scrollbar">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">

                        {/* Switch de Tipo (Visual Sólido) */}
                        <div className="grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                            <button
                                type="button"
                                onClick={() => { setType('INCOME'); setCategoryId(''); }}
                                className={`py-2.5 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${type === 'INCOME'
                                    ? 'bg-white dark:bg-zinc-800 text-emerald-600 shadow-sm border border-zinc-200 dark:border-zinc-700'
                                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
                                    }`}
                            >
                                Receita
                            </button>
                            <button
                                type="button"
                                onClick={() => { setType('EXPENSE'); setCategoryId(''); }}
                                className={`py-2.5 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${type === 'EXPENSE'
                                    ? 'bg-white dark:bg-zinc-800 text-rose-600 shadow-sm border border-zinc-200 dark:border-zinc-700'
                                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
                                    }`}
                            >
                                Despesa
                            </button>
                        </div>

                        {/* Inputs Principais */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-zinc-500 mb-1.5 ml-1">Descrição</label>
                                <input
                                    type="text"
                                    required
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder={type === 'INCOME' ? 'Ex: Salário, Freelance...' : 'Ex: Supermercado, Aluguel...'}
                                    className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all p-3 text-sm outline-none font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-1.5 ml-1">Valor</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-bold">R$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        placeholder="0,00"
                                        className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all p-3 pl-8 text-sm outline-none font-medium text-zinc-900 dark:text-zinc-100"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-1.5 ml-1">Data</label>
                                <input
                                    type="date"
                                    required
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all p-3 text-sm outline-none font-medium text-zinc-900 dark:text-zinc-100 [color-scheme:light] dark:[color-scheme:dark]"
                                />
                            </div>
                        </div>

                        {/* Área de Categorias (Dropdown) */}
                        <div className="relative" ref={categoryDropdownRef}>
                            <label className="block text-xs font-bold text-zinc-500 mb-1.5 ml-1">Categoria</label>

                            <button
                                type="button"
                                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${isCategoryOpen
                                    ? 'bg-white dark:bg-zinc-900 border-blue-500 ring-4 ring-blue-500/10'
                                    : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                            >
                                <div className="flex items-center gap-2">
                                    {selectedCategory ? (
                                        <>
                                            <div className="text-blue-600 dark:text-blue-400">{getCategoryIcon(selectedCategory.name)}</div>
                                            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 capitalize">{selectedCategory.name}</span>
                                        </>
                                    ) : (
                                        <span className="text-sm text-zinc-400 font-medium">Selecione uma categoria...</span>
                                    )}
                                </div>
                                <ChevronDown size={18} className={`text-zinc-400 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isCategoryOpen && (
                                <div className="absolute z-10 bottom-full mb-2 w-full p-2 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-black/50 animate-in fade-in zoom-in-95 duration-100 origin-bottom">
                                    <div className="grid grid-cols-3 gap-2 max-h-[240px] overflow-y-auto [&::-webkit-scrollbar]:hidden">
                                        {filteredCategories.length > 0 ? filteredCategories.map(cat => {
                                            const isSelected = categoryId === cat.id;
                                            return (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => { setCategoryId(cat.id); setIsCategoryOpen(false); }}
                                                    className={`
                                                        relative flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-center
                                                        ${isSelected
                                                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500'
                                                            : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300'
                                                        }
                                                    `}
                                                >
                                                    {isSelected && (
                                                        <div className="absolute top-2 right-2 text-blue-500">
                                                            <Check size={14} strokeWidth={3} />
                                                        </div>
                                                    )}

                                                    <div className={`p-2.5 rounded-full transition-transform ${isSelected ? 'bg-blue-100 dark:bg-blue-900/40 scale-110' : 'bg-zinc-200/50 dark:bg-zinc-800'}`}>
                                                        {getCategoryIcon(cat.name)}
                                                    </div>
                                                    <span className="text-xs font-semibold truncate w-full px-1">
                                                        {cat.name}
                                                    </span>
                                                </button>
                                            );
                                        }) : (
                                            <div className="col-span-full py-8 text-center text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                                                Nenhuma categoria encontrada.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                {/* Footer Fixo */}
                <div className="p-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-sm">
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !description || !amount || !categoryId}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <span className="animate-pulse">Salvando...</span>
                        ) : (
                            <>
                                <Check size={18} /> Confirmar Lançamento
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}