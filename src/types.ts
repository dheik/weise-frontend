export interface Category {
    id: string;
    name: string;
    type: 'INCOME' | 'EXPENSE';
}

export interface Transaction {
    id: string;
    description: string;
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    date: string;
    category?: Category;
}