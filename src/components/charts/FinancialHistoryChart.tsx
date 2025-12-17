import { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import type { Transaction } from '../../types';

interface Props {
    transactions: Transaction[];
    onBarClick: (date: string) => void;
}

export default function FinancialHistoryChart({ transactions, onBarClick }: Props) {
    const data = useMemo(() => {
        const grouped = new Map();

        transactions.forEach(t => {
            // Garante que agrupa pelo dia (YYYY-MM-DD) mesmo que venha com horário
            const dateKey = t.date.substring(0, 10);

            if (!grouped.has(dateKey)) {
                grouped.set(dateKey, { name: dateKey, income: 0, expense: 0 });
            }

            const item = grouped.get(dateKey);
            if (t.type === 'INCOME') {
                item.income += t.amount;
            } else {
                item.expense += t.amount;
            }
        });

        // Ordena por data (String comparison funciona bem para YYYY-MM-DD)
        return Array.from(grouped.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [transactions]);

    if (data.length === 0) return null;

    return (
        <div className="h-[300px] w-full bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm [&_*]:outline-none">
            <h3 className="text-white font-semibold mb-4 text-sm">Fluxo de Caixa Diário</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 5, right: 0, left: -20, bottom: 20 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis
                        dataKey="name"
                        stroke="#64748b"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => {
                            const [, month, day] = value.split('-');
                            return `${day}/${month}`;
                        }}
                    />
                    <YAxis
                        stroke="#64748b"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `R$${value}`}
                    />
                    <Tooltip
                        cursor={{ fill: '#1e293b', opacity: 0.4 }}
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                        labelFormatter={(label) => {
                            const [year, month, day] = label.split('-');
                            return `${day}/${month}/${year}`;
                        }}
                        formatter={(value: number | undefined) => [
                            `R$ ${value?.toFixed(2) ?? '0.00'}`,
                            ''
                        ]}
                    />

                    <Bar
                        name="Receitas"
                        dataKey="income"
                        fill="#22c55e"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                        onClick={(data: any) => onBarClick(data.name)}
                        cursor="pointer"
                    />
                    <Bar
                        name="Despesas"
                        dataKey="expense"
                        fill="#ef4444"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                        onClick={(data: any) => onBarClick(data.name)}
                        cursor="pointer"
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}