import { useEffect, useState } from 'react';
import api from '../services/api';
import { LogOut, Plus, Trash2, Calendar, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NewTransactionModal from '../components/NewTransactionModal';
import type {Transaction} from '../types';

export default function Dashboard() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    // Filtros de Data (Padrão: Começo do mês atual até hoje)
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1); // Dia 1 do mês

    const [startDate, setStartDate] = useState(firstDay.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

    // Busca dados com filtro
    async function fetchTransactions() {
        try {
            // Passamos os parâmetros na URL query string
            const response = await api.get('/transactions', {
                params: {
                    startDate: startDate || null,
                    endDate: endDate || null
                }
            });
            setTransactions(response.data);
        } catch (error: any) {
            if (error.response?.status === 403) handleLogout();
        }
    }

    // Deletar transação
    async function handleDelete(id: string) {
        if (!confirm('Tem certeza que deseja excluir esta transação?')) return;
        try {
            await api.delete(`/transactions/${id}`);
            fetchTransactions(); // Recarrega a lista
        } catch (error) {
            alert('Erro ao excluir');
        }
    }

    // Recarrega sempre que mudar os filtros de data
    useEffect(() => {
        fetchTransactions();
    }, [startDate, endDate]);

    function handleLogout() {
        localStorage.removeItem('weise_token');
        navigate('/');
    }

    // Cálculos de totais (baseados na lista filtrada)
    const income = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
    const total = income - expense;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
            <nav className="border-b border-slate-800 bg-slate-900 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <h1 className="text-xl font-bold text-white">Weise</h1>
                <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition">
                    <LogOut size={16} /> Sair
                </button>
            </nav>

            <main className="mx-auto max-w-5xl p-6 space-y-8">

                {/* Barra de Filtros */}
                <div className="flex flex-wrap items-end gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">Data Início</label>
                        <div className="flex items-center gap-2 bg-slate-800 rounded px-3 py-2 border border-slate-700">
                            <Calendar size={16} className="text-slate-400" />
                            <input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="bg-transparent text-sm text-white focus:outline-none [color-scheme:dark]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-slate-400 block mb-1">Data Fim</label>
                        <div className="flex items-center gap-2 bg-slate-800 rounded px-3 py-2 border border-slate-700">
                            <Calendar size={16} className="text-slate-400" />
                            <input
                                type="date"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className="bg-transparent text-sm text-white focus:outline-none [color-scheme:dark]"
                            />
                        </div>
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                        <span className="text-xs text-slate-500">Exibindo {transactions.length} registros</span>
                    </div>
                </div>

                {/* Cards de Resumo */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                        <span className="text-sm text-slate-400">Entradas</span>
                        <p className="mt-2 text-2xl font-bold text-green-500">
                            {income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                        <span className="text-sm text-slate-400">Saídas</span>
                        <p className="mt-2 text-2xl font-bold text-red-500">
                            {expense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                        <span className="text-sm text-slate-400">Saldo no Período</span>
                        <p className="mt-2 text-2xl font-bold text-white">
                            {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                    </div>
                </div>

                {/* Lista de Transações */}
                <div className="rounded-xl border border-slate-800 bg-slate-900">
                    <div className="flex items-center justify-between border-b border-slate-800 p-6">
                        <h2 className="font-semibold text-white">Extrato</h2>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition"
                        >
                            <Plus size={16} /> Nova
                        </button>
                    </div>

                    <div className="p-6">
                        {transactions.length === 0 ? (
                            <div className="text-center py-10 opacity-50">
                                <Search className="mx-auto mb-2" size={32} />
                                <p>Nenhuma transação neste período.</p>
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {transactions.map(t => (
                                    <li key={t.id} className="group flex items-center justify-between rounded-lg bg-slate-800/50 p-4 hover:bg-slate-800 transition border border-transparent hover:border-slate-700">
                                        <div className="flex items-center gap-4">
                                            {/* Ícone ou Inicial da Categoria */}
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg ${
                                                t.type === 'INCOME' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                            }`}>
                                                {t.category?.name.charAt(0).toUpperCase() || '?'}
                                            </div>

                                            <div>
                                                <p className="font-medium text-white">{t.description}</p>
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="bg-slate-700 px-2 py-0.5 rounded text-slate-300">
                            {t.category?.name || 'Sem Categoria'}
                          </span>
                                                    <span>{new Date(t.date).toLocaleDateString('pt-BR')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                      <span className={`font-bold ${t.type === 'INCOME' ? 'text-green-500' : 'text-red-500'}`}>
                        {t.type === 'INCOME' ? '+' : '-'}
                          {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>

                                            {/* Botão de Excluir (Só aparece quando passa o mouse na linha - group-hover) */}
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