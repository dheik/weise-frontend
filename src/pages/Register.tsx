import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import api from '../services/api';

export default function Register() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/auth/register', { name, email, password });
            navigate('/');
        } catch (err: any) {
            console.error(err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Falha ao criar conta. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
            <div className="w-full max-w-md space-y-8 rounded-2xl border bg-card p-8 shadow-sm">

                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Crie sua conta</h2>
                    <p className="mt-2 text-sm text-muted-foreground">Comece a gerenciar suas finanças hoje</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleRegister}>
                    <div className="space-y-4">
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                                <User size={20} />
                            </div>
                            <input
                                type="text"
                                required
                                placeholder="Nome Completo"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="block w-full rounded-lg border border-brand-600/20 bg-brand-950/50 p-3 pl-10 text-brand-200 placeholder-brand-600/50 focus:border-brand-400 focus:ring-brand-400 focus:outline-none transition group-hover:border-brand-600/30"
                            />
                        </div>

                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                                <Mail size={20} />
                            </div>
                            <input
                                type="email"
                                required
                                placeholder="Seu e-mail"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="block w-full rounded-lg border bg-background p-3 pl-10 text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring focus:outline-none transition"
                            />
                        </div>

                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                                <Lock size={20} />
                            </div>
                            <input
                                type="password"
                                required
                                minLength={6}
                                placeholder="Sua senha (mín. 6 caracteres)"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="block w-full rounded-lg border bg-background p-3 pl-10 text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring focus:outline-none transition"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-center text-sm text-red-500 bg-red-900/20 p-2 rounded border border-red-900/50">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative flex w-full justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-70 transition-all font-sans tracking-wide shadow-sm"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin h-5 w-5" />
                        ) : (
                            <>
                                Criar Conta
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </button>

                    <div className="text-center text-sm">
                        <span className="text-muted-foreground">Já tem uma conta? </span>
                        <Link to="/" className="font-medium text-primary hover:text-primary/90 transition">
                            Fazer login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
