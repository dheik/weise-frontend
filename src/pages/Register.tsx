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
        <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-slate-100">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-slate-900 p-8 shadow-2xl border border-slate-800">

                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white">Crie sua conta</h2>
                    <p className="mt-2 text-sm text-slate-400">Comece a gerenciar suas finanças hoje</p>
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
                                className="block w-full rounded-lg border border-slate-700 bg-slate-800 p-3 pl-10 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition"
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
                                className="block w-full rounded-lg border border-slate-700 bg-slate-800 p-3 pl-10 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition"
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
                                className="block w-full rounded-lg border border-slate-700 bg-slate-800 p-3 pl-10 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition"
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
                        className="group relative flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 transition-all"
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
                        <span className="text-slate-400">Já tem uma conta? </span>
                        <Link to="/" className="font-medium text-blue-500 hover:text-blue-400 transition">
                            Fazer login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
