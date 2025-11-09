'use client';

import { useState, FormEvent, ChangeEvent } from 'react';

interface RecoverFormData {
    email: string;
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
}

type RecoveryMode = 'request' | 'reset';

export default function PasswordRecovery() {
    const [mode, setMode] = useState<RecoveryMode>('request');
    const [recoverData, setRecoverData] = useState<RecoverFormData>({
        email: ''
    });
    const [resetData, setResetData] = useState<ResetPasswordData>({
        email: '',
        code: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleRecoverChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setRecoverData(prev => ({
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

    const handleRequestCode = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
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
                    email: recoverData.email
                }),
            });

            const data: ApiResponse = await response.json();

            if (response.ok) {
                setResetData({ ...resetData, email: recoverData.email });
                setMessage({
                    type: 'success',
                    text: 'Se ha enviado un código de recuperación a tu correo.'
                });
                setTimeout(() => {
                    setMode('reset');
                    setMessage(null);
                }, 2000);
            } else {
                setMessage({ type: 'error', text: data.message || 'Error al solicitar código' });
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

    const handleResetPassword = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
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
                    text: '¡Contraseña restablecida exitosamente! Se ha enviado un email de confirmación.'
                });
                setTimeout(() => {
                    window.location.href = '/login';
                }, 3000);
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

    const resetForm = (): void => {
        setRecoverData({ email: '' });
        setResetData({ email: '', code: '', newPassword: '', confirmNewPassword: '' });
        setMessage(null);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                <div className="text-center mb-6">
                    <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
                        <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800">
                        {mode === 'request' ? 'Recuperar Contraseña' : 'Nueva Contraseña'}
                    </h2>
                    <p className="text-gray-600 mt-2">
                        {mode === 'request' 
                            ? 'Ingresa tu correo y te enviaremos un código' 
                            : 'Ingresa el código y tu nueva contraseña'}
                    </p>
                </div>

                {message && (
                    <div className={`mb-4 p-4 rounded-lg ${message.type === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                        {message.text}
                    </div>
                )}

                {/* FORMULARIO DE SOLICITUD DE CÓDIGO */}
                {mode === 'request' && (
                    <form onSubmit={handleRequestCode} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Correo electrónico
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={recoverData.email}
                                onChange={handleRecoverChange}
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
                            <a
                                href="/login"
                                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                            >
                                ← Volver al inicio de sesión
                            </a>
                        </div>
                    </form>
                )}

                {/* FORMULARIO DE RESET */}
                {mode === 'reset' && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-blue-800">
                                📧 Código enviado a <strong>{resetData.email}</strong>
                            </p>
                        </div>

                        <div>
                            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                                Código de recuperación
                            </label>
                            <input
                                type="text"
                                id="code"
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
                                    setMode('request');
                                    resetForm();
                                }}
                                className="text-gray-600 hover:text-gray-800 font-medium text-sm"
                            >
                                ← Reenviar código
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}