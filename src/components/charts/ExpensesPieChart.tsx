import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { Transaction } from '../../types';

interface Props {
    transactions: Transaction[];
    onSliceClick: (categoryName: string) => void; // Nova prop
}

const COLORS = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
    '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#6366f1'
];

export default function ExpensesPieChart({ transactions, onSliceClick }: Props) {
    const data = useMemo(() => {
        const expenses = transactions.filter(t => t.type === 'EXPENSE');
        const grouped = new Map();

        expenses.forEach(t => {
            const categoryName = t.category?.name || 'Outros';
            const current = grouped.get(categoryName) || 0;
            grouped.set(categoryName, current + t.amount);
        });

        return Array.from(grouped.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [transactions]);

    if (data.length === 0) return null;

    return (
        <div className="h-[300px] w-full bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm [&_*]:outline-none">
            <h3 className="text-white font-semibold mb-4 text-sm">Despesas por Categoria</h3>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                        onClick={(data: any) => {
                            // Retorna o nome da categoria clicada
                            onSliceClick(data.name);
                        }}
                        style={{ cursor: 'pointer' }}
                    >
                        {data.map((_, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                                stroke="#1e293b"
                                strokeWidth={2}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: number | undefined) => `R$ ${value?.toFixed(2) ?? '0.00'}`}
                    />
                    <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        wrapperStyle={{ fontSize: '13px', color: '#94a3b8' }}
                        iconType="circle"
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}