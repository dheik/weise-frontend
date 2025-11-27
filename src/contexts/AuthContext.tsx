import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import api from '../services/api';
import { jwtDecode } from "jwt-decode";

interface User {
    email: string;
    name?: string; // Opcional, caso adicione depois no Token
}

interface AuthContextData {
    user: User | null;
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('weise_token');

        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // CORREÇÃO 2: Decodificar também ao recarregar a página (F5)
            try {
                const decoded: any = jwtDecode(token);
                setUser({
                    email: decoded.sub, // 'sub' é onde o Spring Security guarda o email por padrão
                });
            } catch (error) {
                console.error("Token inválido no storage", error);
                logout(); // Se o token estiver corrompido, desloga
            }
        }

        setLoading(false);
    }, []);

    function login(token: string) {
        localStorage.setItem('weise_token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // CORREÇÃO 3: Decodificar corretamente no Login (removi o placeholder fixo)
        const decoded: any = jwtDecode(token);
        setUser({
            email: decoded.sub,
        });
    }

    function logout() {
        localStorage.removeItem('weise_token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}