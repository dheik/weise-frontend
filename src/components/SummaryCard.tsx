
import { type LucideIcon } from 'lucide-react';

interface SummaryCardProps {
    title: string;
    value: number;
    color: string;
    iconClass: string;
    icon: LucideIcon;
}

export default function SummaryCard({ title, value, color, iconClass, icon: Icon }: SummaryCardProps) {
    return (
        <div className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="tracking-tight text-sm font-medium text-muted-foreground">{title}</span>
                <div className={`p-2 rounded-full ${iconClass} shadow-sm`}>
                    <Icon size={16} />
                </div>
            </div>
            <div className="p-6 pt-0">
                <div className={`text-2xl font-bold ${color}`}>
                    {value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
            </div>
        </div>
    );
}
