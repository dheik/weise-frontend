import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'sonner';
import { ThemeProvider } from './components/theme-provider';

function App() {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="weise-ui-theme">
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        {/* Rotas Públicas */}
                        <Route path="/" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Rotas Privadas (Protegidas) */}
                        <Route element={<PrivateRoute />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
                <Toaster position="top-right" richColors />
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;