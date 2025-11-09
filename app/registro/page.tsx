'use client';

import { useState, FormEvent, ChangeEvent } from 'react';


import { useUser } from '../components/userContext';
import AuthPage from '../components/authPage';



// Importa el tipo User de tu contexto
interface User {
    id: string;
    nombre: string;
    email: string;
     rol: 'admin' | 'vendedor' | 'usuario';
}

interface FormData {
    nombre: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface VerificationData {
    email: string;
    code: string;
}

interface ResetPasswordData {
    email: string;
    code: string;
    newPassword: string;
    confirmNewPassword: string;
}

interface ApiResponse {
    success: boolean;
    message: string;
    token?: string;
    usuario?: User;
}

type FormMode = 'register' | 'verify' | 'recover' | 'reset' | 'login';

interface AuthFormProps {
    onLoginSuccess?: (user: User, token: string) => void;
}

export default function AuthForm({ onLoginSuccess }: AuthFormProps) {
    const [mode, setMode] = useState<FormMode>('register');
    const [formData, setFormData] = useState<FormData>({
        nombre: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [verificationData, setVerificationData] = useState<VerificationData>({
        email: '',
        code: ''
    });
    const [resetData, setResetData] = useState<ResetPasswordData>({
        email: '',
        code: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [registeredEmail, setRegisteredEmail] = useState<string>('');

    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    console.log(useUser)


    const handleVerificationChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setVerificationData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleResetChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setResetData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRegister = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        console.log('🚀 Iniciando registro...', { nombre: formData.nombre, email: formData.email });

        try {
            if (formData.password !== formData.confirmPassword) {
                setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
                setLoading(false);
                return;
            }

            if (formData.password.length < 6) {
                setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
                setLoading(false);
                return;
            }

            console.log('📤 Enviando petición a backend...');

            const response = await fetch('https://padel-back-kohl.vercel.app/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre: formData.nombre,
                    email: formData.email,
                    password: formData.password
                }),
            });

            console.log('📥 Respuesta recibida:', response.status, response.statusText);

            const data: ApiResponse = await response.json();
            console.log('📦 Datos:', data);

            if (response.ok) {
                setRegisteredEmail(formData.email);
                setVerificationData({ email: formData.email, code: '' });
                setMessage({
                    type: 'success',
                    text: 'Registro exitoso. Revisa tu correo para obtener el código de verificación.'
                });
                console.log('✅ Registro exitoso, cambiando a modo verificación...');
                setTimeout(() => {
                    setMode('verify');
                    setMessage(null);
                }, 2000);
            } else {
                setMessage({ type: 'error', text: data.message || 'Error en el registro' });
            }
        } catch (error) {
            console.error('❌ Error en handleRegister:', error);
            setMessage({
                type: 'error',
                text: error instanceof Error ? error.message : 'Error de conexión con el servidor. ¿Está el backend corriendo en https://padel-back-kohl.vercel.app?'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch('https://padel-back-kohl.vercel.app/api/auth/verify-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(verificationData),
            });

            const data: ApiResponse = await response.json();

            if (response.ok && data.token && data.usuario) {
                setMessage({
                    type: 'success',
                    text: '¡Cuenta verificada exitosamente! Redirigiendo...'
                });

                // Guardar token en localStorage
                localStorage.setItem('token', data.token);

                console.log('✅ Usuario verificado:', data.usuario);

                // Llamar al callback con los datos del usuario
                if (onLoginSuccess) {
                    onLoginSuccess(data.usuario, data.token);
                } else {
                    // Si no hay callback, guardar en localStorage y redirigir manualmente
                    localStorage.setItem('user', JSON.stringify(data.usuario));
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 1500);
                }
            } else {
                setMessage({ type: 'error', text: data.message || 'Código inválido' });
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: error instanceof Error ? error.message : 'Error de conexión con el servidor'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRecover = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch('https://padel-back-kohl.vercel.app/api/auth/recover-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email
                }),
            });

            const data: ApiResponse = await response.json();

            if (response.ok) {
                setResetData({ ...resetData, email: formData.email });
                setMessage({
                    type: 'success',
                    text: 'Se ha enviado un código a tu correo. Revísalo para continuar.'
                });
                setTimeout(() => {
                    setMode('reset');
                    setMessage(null);
                }, 2000);
            } else {
                setMessage({ type: 'error', text: data.message || 'Error al recuperar contraseña' });
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: error instanceof Error ? error.message : 'Error de conexión con el servidor'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (resetData.newPassword !== resetData.confirmNewPassword) {
                setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
                setLoading(false);
                return;
            }

            if (resetData.newPassword.length < 6) {
                setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
                setLoading(false);
                return;
            }

            const response = await fetch('https://padel-back-kohl.vercel.app/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: resetData.email,
                    code: resetData.code,
                    newPassword: resetData.newPassword
                }),
            });

            const data: ApiResponse = await response.json();

            if (response.ok) {
                setMessage({
                    type: 'success',
                    text: '¡Contraseña restablecida exitosamente! Puedes iniciar sesión ahora.'
                });
                setTimeout(() => {
                    setMode('login');
                    setMessage(null);
                    setFormData({ nombre: '', email: resetData.email, password: '', confirmPassword: '' });
                }, 2000);
            } else {
                setMessage({ type: 'error', text: data.message || 'Error al restablecer contraseña' });
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: error instanceof Error ? error.message : 'Error de conexión con el servidor'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch('https://padel-back-kohl.vercel.app/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                }),
            });

            const data: ApiResponse = await response.json();

            if (response.ok && data.token && data.usuario) {
                setMessage({
                    type: 'success',
                    text: '¡Login exitoso! Redirigiendo...'
                });

                // Guardar token en localStorage
                localStorage.setItem('token', data.token);

                console.log('✅ Login exitoso:', data.usuario);

                // Llamar al callback con los datos del usuario
                if (onLoginSuccess) {
                    onLoginSuccess(data.usuario, data.token);
                } else {
                    // Si no hay callback, guardar en localStorage y redirigir manualmente
                    localStorage.setItem('user', JSON.stringify(data.usuario));
                    setTimeout(() => {
                        window.location.href = '/dashboard';
                    }, 1500);
                }
            } else {
                setMessage({ type: 'error', text: data.message || 'Error al iniciar sesión' });
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: error instanceof Error ? error.message : 'Error de conexión con el servidor'
            });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = (): void => {
        setFormData({ nombre: '', email: '', password: '', confirmPassword: '' });
        setVerificationData({ email: '', code: '' });
        setResetData({ email: '', code: '', newPassword: '', confirmNewPassword: '' });
        setMessage(null);
    };

    const getTitle = (): string => {
        switch (mode) {
            case 'register': return 'Crear Cuenta';
            case 'verify': return 'Verificar Email';
            case 'recover': return 'Recuperar Contraseña';
            case 'reset': return 'Nueva Contraseña';
            case 'login': return 'Iniciar Sesión';
            default: return 'Autenticación';
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
                    {getTitle()}
                </h2>

                {message && (
                    <div className={`mb-4 p-4 rounded-lg ${message.type === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                        {message.text}
                    </div>
                )}

                {/* FORMULARIO DE REGISTRO */}
                {mode === 'register' && (
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre completo
                            </label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="Juan Pérez"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Correo electrónico
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="tu@email.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Confirmar contraseña
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Registrando...' : 'Registrarse'}
                        </button>

                        <div className="text-center space-y-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setMode('login');
                                    resetForm();
                                }}
                                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                            >
                                ¿Ya tienes cuenta? Inicia sesión
                            </button>
                        </div>
                    </form>
                )}

                {/* FORMULARIO DE VERIFICACIÓN */}
                {mode === 'verify' && (
                    <form onSubmit={handleVerify} className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-blue-800">
                                📧 Hemos enviado un código de 6 dígitos a <strong>{registeredEmail || verificationData.email}</strong>
                            </p>
                        </div>

                        <div>
                            <label htmlFor="verify-code" className="block text-sm font-medium text-gray-700 mb-1">
                                Código de verificación
                            </label>
                            <input
                                type="text"
                                id="verify-code"
                                name="code"
                                value={verificationData.code}
                                onChange={handleVerificationChange}
                                required
                                maxLength={6}
                                className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition tracking-widest"
                                placeholder="000000"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Verificando...' : 'Verificar cuenta'}
                        </button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setMode('register');
                                    resetForm();
                                }}
                                className="text-gray-600 hover:text-gray-800 font-medium text-sm"
                            >
                                ← Volver al registro
                            </button>
                        </div>
                    </form>
                )}

                {/* FORMULARIO DE RECUPERACIÓN */}
                {mode === 'recover' && (
                    <form onSubmit={handleRecover} className="space-y-4">
                        <p className="text-sm text-gray-600 mb-4">
                            Ingresa tu correo electrónico y te enviaremos un código para restablecer tu contraseña.
                        </p>

                        <div>
                            <label htmlFor="recover-email" className="block text-sm font-medium text-gray-700 mb-1">
                                Correo electrónico
                            </label>
                            <input
                                type="email"
                                id="recover-email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="tu@email.com"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Enviando...' : 'Enviar código'}
                        </button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setMode('register');
                                    resetForm();
                                }}
                                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                            >
                                ← Volver al registro
                            </button>
                        </div>
                    </form>
                )}

                {/* FORMULARIO DE RESET */}
                {mode === 'reset' && (
                    <form onSubmit={handleReset} className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-blue-800">
                                📧 Código enviado a <strong>{resetData.email}</strong>
                            </p>
                        </div>

                        <div>
                            <label htmlFor="reset-code" className="block text-sm font-medium text-gray-700 mb-1">
                                Código de recuperación
                            </label>
                            <input
                                type="text"
                                id="reset-code"
                                name="code"
                                value={resetData.code}
                                onChange={handleResetChange}
                                required
                                maxLength={6}
                                className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition tracking-widest"
                                placeholder="000000"
                            />
                        </div>

                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Nueva contraseña
                            </label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={resetData.newPassword}
                                onChange={handleResetChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Confirmar nueva contraseña
                            </label>
                            <input
                                type="password"
                                id="confirmNewPassword"
                                name="confirmNewPassword"
                                value={resetData.confirmNewPassword}
                                onChange={handleResetChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Restableciendo...' : 'Restablecer contraseña'}
                        </button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setMode('recover');
                                    resetForm();
                                }}
                                className="text-gray-600 hover:text-gray-800 font-medium text-sm"
                            >
                                ← Reenviar código
                            </button>
                        </div>
                    </form>
                )}

                {/* FORMULARIO DE LOGIN */}
                {mode === 'login' && (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
                                Correo electrónico
                            </label>
                            <input
                                type="email"
                                id="login-email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="tu@email.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                id="login-password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                        </button>

                        <div className="text-center space-y-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setMode('recover');
                                    resetForm();
                                }}
                                className="block w-full text-blue-600 hover:text-blue-800 font-medium text-sm"
                            >
                                ¿Olvidaste tu contraseña?
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setMode('register');
                                    resetForm();
                                }}
                                className="block w-full text-gray-600 hover:text-gray-800 font-medium text-sm"
                            >
                                ¿No tienes cuenta? Regístrate
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}