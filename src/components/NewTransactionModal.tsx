import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import api from '../services/api';
import type {Category} from '../types';

interface NewTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function NewTransactionModal({ isOpen, onClose, onSuccess }: NewTransactionModalProps) {
    // Form States
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
    const [categoryId, setCategoryId] = useState(''); // ID da categoria selecionada

    // Data States
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);

    // Busca categorias ao abrir o modal
    useEffect(() => {
        if (isOpen) {
            api.get('/categories').then(res => setCategories(res.data));
        }
    }, [isOpen]);

    // Filtra as categorias baseado no Tipo selecionado (Receita ou Despesa)
    const filteredCategories = categories.filter(c => c.type === type);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/transactions', {
                description,
                amount: parseFloat(amount),
                date,
                type,
                categoryId: categoryId || null // Envia o ID ou null
            });

            // Reset
            setDescription('');
            setAmount('');
            setCategoryId('');
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-slate-900 p-6 border border-slate-800 shadow-2xl">

                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Nova Transação</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Tipo (Botões) */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => { setType('INCOME'); setCategoryId(''); }} // Limpa categoria ao trocar tipo
                            className={`p-3 rounded border font-semibold transition ${
                                type === 'INCOME'
                                    ? 'bg-green-500/10 border-green-500 text-green-500'
                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                            }`}
                        >
                            Receita
                        </button>
                        <button
                            type="button"
                            onClick={() => { setType('EXPENSE'); setCategoryId(''); }}
                            className={`p-3 rounded border font-semibold transition ${
                                type === 'EXPENSE'
                                    ? 'bg-red-500/10 border-red-500 text-red-500'
                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                            }`}
                        >
                            Despesa
                        </button>
                    </div>

                    {/* Descrição */}
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Descrição</label>
                        <input
                            type="text" required value={description} onChange={e => setDescription(e.target.value)}
                            className="w-full rounded bg-slate-800 border border-slate-700 p-3 text-white focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    {/* Valor */}
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Valor (R$)</label>
                        <input
                            type="number" step="0.01" required value={amount} onChange={e => setAmount(e.target.value)}
                            className="w-full rounded bg-slate-800 border border-slate-700 p-3 text-white focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    {/* Seletor de Categoria (Novo!) */}
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Categoria</label>
                        <select
                            required
                            value={categoryId}
                            onChange={e => setCategoryId(e.target.value)}
                            className="w-full rounded bg-slate-800 border border-slate-700 p-3 text-white focus:border-blue-500 focus:outline-none appearance-none"
                        >
                            <option value="" disabled>Selecione uma categoria...</option>
                            {filteredCategories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Data */}
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Data</label>
                        <input
                            type="date" required value={date} onChange={e => setDate(e.target.value)}
                            className="w-full rounded bg-slate-800 border border-slate-700 p-3 text-white focus:border-blue-500 focus:outline-none [color-scheme:dark]"
                        />
                    </div>

                    <button
                        type="submit" disabled={loading}
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded transition disabled:opacity-50"
                    >
                        {loading ? 'Salvando...' : 'Cadastrar'}
                    </button>
                </form>
            </div>
        </div>
    );
}