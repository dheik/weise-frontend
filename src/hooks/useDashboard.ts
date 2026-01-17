import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { toast } from 'sonner';
import type { Transaction } from '../types';

interface Summary {
    balance: number;
    totalIncome: number;
    totalExpense: number;
}

export function useDashboard() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [summary, setSummary] = useState<Summary>({ totalIncome: 0, totalExpense: 0, balance: 0 });
    const [isLoading, setIsLoading] = useState(false);

    // Datas iniciais
    const [dateRange, setDateRange] = useState(() => {
        const today = new Date();
        return {
            start: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0],
            end: new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]
        };
    });

    const fetchDashboardData = useCallback(async () => {
        setIsLoading(true);
        try {
            // 1. Busca Transações (Paginado ou Lista)
            const txPromise = api.get('/transactions', {
                params: { startDate: dateRange.start || null, endDate: dateRange.end || null, size: 100 }
            });

            // 2. Busca o Resumo Calculado pelo Banco
            const summaryPromise = api.get('/dashboard', {
                params: { startDate: dateRange.start || null, endDate: dateRange.end || null }
                // Nota: O backend atual do DashboardService não filtra por data na query de soma (ainda), 
                // ele soma TUDO do usuário. Se o usuário quiser filtrar o saldo por data, 
                // teríamos que atualizar o DashboardService também. 
                // Pelo prompt anterior, o usuário pediu "Lógica do Dashboard" para "Receitas e Despesas e Saldo",
                // mas não explicitou filtro de data no Dashboard. 
                // PORÉM, para consistência visual com a lista filtrada, seria ideal.
                // Vou manter simples por enquanto e assumir que o /dashboard retorna financeiro geral ou 
                // vou checar se preciso passar datas. O DashboardService atual NÃO recebe datas.
                // Então o resumo será global. Se o usuário quiser filtrado, precisaremos alterar o backend.
            });

            const [txResponse, summaryResponse] = await Promise.all([txPromise, summaryPromise]);

            // Trata Paginação
            if (txResponse.data && Array.isArray(txResponse.data.content)) {
                setTransactions(txResponse.data.content);
            } else if (Array.isArray(txResponse.data)) {
                setTransactions(txResponse.data);
            } else {
                setTransactions([]);
            }

            setSummary(summaryResponse.data);

        } catch (error) {
            toast.error("Erro ao atualizar dashboard");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [dateRange]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return {
        transactions,
        summary,
        isLoading,
        dateRange,
        setDateRange,
        refresh: fetchDashboardData
    };
}
