import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/login', { email, password });
            const token = response.data.token;

            login(token);
            navigate('/dashboard');
        } catch (err: any) {
            console.error(err);
            setError('Falha no login. Verifique seu e-mail e senha.');
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogleSuccess(credentialResponse: any) {
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/google', {
                token: credentialResponse.credential
            });

            const token = response.data.token;

            login(token);
            navigate('/dashboard');
        } catch (err: any) {
            console.error("Google Error:", err);
            setError('Falha ao autenticar com Google. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-slate-100">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-slate-900 p-8 shadow-2xl border border-slate-800">

                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white">Weise</h2>
                    <p className="mt-2 text-sm text-slate-400">Gestão financeira inteligente</p>
                </div>

                <div className="mt-8 space-y-6">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
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
                                    placeholder="Sua senha"
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
                                    Acessar Plataforma
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-slate-900 px-2 text-slate-400">Ou continue com</span>
                        </div>
                    </div>

                    <div className="flex justify-center w-full">
                        <div className="w-full flex justify-center">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => setError('Falha ao conectar com Google')}
                                theme="filled_black"
                                shape="pill"
                                text="continue_with"
                                width="100%"
                                size="large"
                            />
                        </div>
                    </div>

                    <div className="text-center text-sm">
                        <span className="text-slate-400">Não tem uma conta? </span>
                        <Link to="/register" className="font-medium text-blue-500 hover:text-blue-400 transition">
                            Criar conta grátis
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}