"use client";
import { useState, useEffect, useRef } from 'react';
import { Edit2, Trash2, Plus, X, Save, Search, Filter, Star, Package, DollarSign, Tag, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser } from '../components/userContext';

const API_URL = 'https://padel-back-kohl.vercel.app/api/productosadmin';
const AUTH_URL = 'https://padel-back-kohl.vercel.app/api/auth/login';

interface ProductoAdminForm {
    _id?: string;
    stock: string;
    codigo: string;
    nombre: string;
    marca: string;
    descripcion: string;
    precioAdminFijo: string;
    moneda: 'ARS' | 'USD';
    imagen: string;
    imagenUrl: string;
    categoria: 'pelota' | 'ropa' | 'accesorio';
    destacado: boolean;
    whatsappAdmin: string;
}

interface ProductoAdmin {
    _id: string;
    stock: number;
    codigo: string;
    nombre: string;
    marca: string;
    descripcion: string;
    precioAdminFijo: number;
    moneda: 'ARS' | 'USD';
    imagenUrl: string;
    categoria: 'pelota' | 'ropa' | 'accesorio';
    destacado: boolean;
    whatsappAdmin: string;
    createdAt: string;
    updatedAt: string;
}

interface Login {
    email: string;
    password: string;
}

interface Filtros {
    buscar: string;
    categoria: string;
}

interface NotificacionResponse {
    success: boolean;
    message: string;
    whatsappEnviados?: string[];
    emailsEnviados?: string[];
    errores?: string[];
}

const initialForm: ProductoAdminForm = {
    codigo: '', nombre: '', marca: '', descripcion: '', precioAdminFijo: '', stock: '0',
    moneda: 'ARS', imagen: '', imagenUrl: '', categoria: 'pelota',
    destacado: false, whatsappAdmin: '+54 341 355 9329',
};

export default function AdminProductosFijo() {
    const [isAuth, setIsAuth] = useState<boolean>(false);
    const [login, setLogin] = useState<Login>({ email: '', password: '' });
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [form, setForm] = useState<ProductoAdminForm>(initialForm);
    const [productos, setProductos] = useState<ProductoAdmin[]>([]);
    const [editMode, setEditMode] = useState<boolean>(false);
    const [preview, setPreview] = useState<string>('');
    const [showModal, setShowModal] = useState<boolean>(false);
    const [productoDetalle, setProductoDetalle] = useState<ProductoAdmin | null>(null);
    const [filtros, setFiltros] = useState<Filtros>({ buscar: '', categoria: 'todos' });
    const [showNotificacion, setShowNotificacion] = useState<boolean>(false);
    const [notificacionData, setNotificacionData] = useState<NotificacionResponse | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const { user } = useUser();
    const router = useRouter();

    useEffect(() => {
        const token = sessionStorage.getItem('authTokenAdmin');
        if (token) {
            setIsAuth(true);
        }
    }, []);

    useEffect(() => {
        if (isAuth) cargar();
    }, [isAuth]);

    // ✅ CAMBIO 2: Login real contra tu API
    const handleLogin = async () => {
        setLoading(true);
        setError('');
        
        try {
            const response = await fetch(AUTH_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: login.email,
                    password: login.password,
                }),
            });

            const data = await response.json();
            
            if (response.ok && data.success && data.token) {
                // ✅ Verificar que el usuario sea admin
                if (data.user.rol !== 'admin') {
                    setError('❌ Acceso denegado: Solo administradores pueden acceder');
                    setLoading(false);
                    return;
                }

                // ✅ Guardar el JWT real
                sessionStorage.setItem('authTokenAdmin', data.token);
                sessionStorage.setItem('isAuthenticatedAdmin', 'true');
                
                console.log('✅ Login exitoso como admin');
                setIsAuth(true);
            } else {
                setError(data.message || '❌ Credenciales incorrectas');
            }
        } catch (err) {
            console.error('Error en login:', err);
            setError('❌ Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        sessionStorage.clear();
        setIsAuth(false);
        setProductos([]);
        reset();
    };

    // ✅ CAMBIO 3: Headers correctos en todas las peticiones
    const getAuthHeaders = () => {
        const token = sessionStorage.getItem('authTokenAdmin');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        };
    };

    const cargar = async () => {
        try {
            console.log('📥 Cargando productos...');
            const res = await fetch(API_URL, {
                method: 'GET',
                headers: getAuthHeaders(),
            });
            
            const data = await res.json();
            console.log('Respuesta del servidor:', data);
            
            if (data.success) {
                setProductos(data.data || []);
                console.log('✅ Productos cargados:', data.data?.length);
            } else {
                console.error('❌ Error al cargar:', data.message);
                if (res.status === 401) {
                    alert('Sesión expirada. Por favor inicia sesión nuevamente.');
                    logout();
                }
            }
        } catch (e) {
            console.error('❌ Error de conexión:', e);
            alert('Error al cargar productos. Verifica tu conexión.');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement;
        const { name, value, type } = target;
        const checked = target.checked;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleImg = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5242880) {
            alert('Imagen muy grande (máx 5MB)');
            if (fileRef.current) fileRef.current.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            const r = reader.result as string;
            setForm(prev => ({ ...prev, imagen: r }));
            setPreview(r);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            console.log('📤 Enviando producto...');
            const payload = {
                ...form,
                id: editMode ? form._id : undefined,
                precioAdminFijo: parseFloat(form.precioAdminFijo),
                stock: parseInt(form.stock),
            };

            const res = await fetch(API_URL, {
                method: editMode ? 'PUT' : 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload),
            });
            
            const data = await res.json();
            console.log('Respuesta:', data);
            
            if (data.success) {
                alert(editMode ? '✅ Producto actualizado!' : '✅ Producto creado y notificado a vendedores!');

                if (!editMode && data.notificaciones) {
                    setNotificacionData(data.notificaciones);
                    setShowNotificacion(true);
                }

                reset();
                await cargar();
            } else {
                alert('❌ Error: ' + data.message);
                if (res.status === 401) {
                    logout();
                }
            }
        } catch (err) {
            console.error('❌ Error:', err);
            alert('❌ Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const editar = (p: ProductoAdmin) => {
        setForm({
            _id: p._id, codigo: p.codigo, nombre: p.nombre, marca: p.marca, descripcion: p.descripcion,
            stock: p.stock.toString(), precioAdminFijo: p.precioAdminFijo.toString(), moneda: p.moneda,
            imagen: '', imagenUrl: p.imagenUrl, categoria: p.categoria,
            destacado: p.destacado, whatsappAdmin: p.whatsappAdmin,
        });
        setPreview(p.imagenUrl);
        setEditMode(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const eliminar = async (id: string) => {
        if (!confirm('⚠️ ¿Estás seguro de eliminar este producto?')) return;
        setLoading(true);
        
        try {
            const res = await fetch(`${API_URL}?id=${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            
            const data = await res.json();
            
            if (data.success) {
                alert('✅ Producto eliminado!');
                await cargar();
            } else {
                alert('❌ Error: ' + data.message);
            }
        } catch (err) {
            console.error('❌ Error:', err);
            alert('❌ Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const verDetalle = (p: ProductoAdmin) => {
        setProductoDetalle(p);
        setShowModal(true);
    };

    const reset = () => {
        setForm(initialForm);
        setPreview('');
        setEditMode(false);
        if (fileRef.current) fileRef.current.value = '';
    };

    const fmt = (p: number, m: 'ARS' | 'USD') =>
        m === 'ARS' ? `$${p.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `USD $${p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const productosFiltrados = productos.filter(p => {
        const matchBuscar = p.nombre.toLowerCase().includes(filtros.buscar.toLowerCase()) ||
            p.marca.toLowerCase().includes(filtros.buscar.toLowerCase()) ||
            p.codigo.toLowerCase().includes(filtros.buscar.toLowerCase());
        const matchCategoria = filtros.categoria === 'todos' || p.categoria === filtros.categoria;
        return matchBuscar && matchCategoria;
    });

    if (!isAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-600 to-red-500 p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
                            <Star size={40} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Panel ADMIN</h1>
                        <p className="text-gray-600">Gestión de Productos con Precio Fijo</p>
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700">Email Admin</label>
                            <input
                                type="email"
                                value={login.email}
                                onChange={e => setLogin(p => ({ ...p, email: e.target.value }))}
                                required
                                placeholder="admin@padel.com"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 outline-none transition text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700">Contraseña</label>
                            <input
                                type="password"
                                value={login.password}
                                onChange={e => setLogin(p => ({ ...p, password: e.target.value }))}
                                required
                                placeholder="••••••"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 outline-none transition text-gray-900"
                            />
                        </div>
                        {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
                        <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold disabled:opacity-50 hover:shadow-lg transition transform hover:scale-105">
                            {loading ? 'Verificando...' : 'Acceder como Admin'}
                        </button>
                    </form>
                    <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl text-xs border border-purple-100">
                        <p className="font-semibold mb-2 text-purple-900">⚠️ Usa tus credenciales de admin reales</p>
                        <p className="text-gray-700">Debes tener una cuenta registrada con rol admin en tu base de datos</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 p-3 sm:p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl p-4 mb-4 sm:mb-6 shadow-lg border border-purple-200">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <Star size={32} className="text-purple-600" fill="currentColor" />
                            <div>
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    {editMode ? '✏️ Editar' : '➕ Crear'} Producto Admin
                                </h1>
                                <p className="text-gray-600 mt-1 text-xs sm:text-sm">Total de productos: <strong className="text-purple-600">{productos.length}</strong> | Precio Fijo para Vendedores</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <button
                                onClick={() => router.push(`/dashboard/${user?.id}`)}
                                className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-sm rounded-xl font-semibold transition shadow-md"
                            >
                                📊 Dashboard
                            </button>
                            <button
                                onClick={logout}
                                className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm rounded-xl font-semibold transition shadow-md"
                            >
                                Cerrar Sesión Admin
                            </button>
                        </div>
                    </div>
                </div>

                <form className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-8 shadow-lg border border-purple-100" onSubmit={handleSubmit}>
                    {/* ... resto del formulario igual ... */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        <div>
                            <label className="block mb-2 font-semibold text-xs sm:text-sm flex items-center gap-2 text-gray-700">
                                <Tag size={16} className="text-purple-600" />
                                Código *
                            </label>
                            <input
                                type="text"
                                name="codigo"
                                value={form.codigo}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-purple-500 transition text-sm text-gray-900"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-semibold text-xs sm:text-sm flex items-center gap-2 text-gray-700">
                                <Package size={16} className="text-purple-600" />
                                Nombre *
                            </label>
                            <input
                                type="text"
                                name="nombre"
                                value={form.nombre}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-purple-500 transition text-sm text-gray-900"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-semibold text-xs sm:text-sm text-gray-700">Marca *</label>
                            <input
                                type="text"
                                name="marca"
                                value={form.marca}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-purple-500 transition text-sm text-gray-900"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-semibold text-xs sm:text-sm flex items-center gap-2 text-gray-700">
                                <Package size={16} className="text-purple-600" />
                                Stock/Cantidad *
                            </label>
                            <input
                                type="number"
                                name="stock"
                                value={form.stock}
                                onChange={handleChange}
                                required
                                min="0"
                                step="1"
                                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-purple-500 transition text-sm text-gray-900"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-semibold text-xs sm:text-sm text-gray-700">Categoría *</label>
                            <select
                                name="categoria"
                                value={form.categoria}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-purple-500 transition text-sm text-gray-900"
                            >
                                <option value="pelota">⚽ Pelota</option>
                                <option value="ropa">👕 Ropa</option>
                                <option value="accesorio">🎒 Accesorio</option>
                            </select>
                        </div>

                        <div>
                            <label className="block mb-2 font-semibold text-xs sm:text-sm flex items-center gap-2 text-gray-700">
                                <DollarSign size={16} className="text-emerald-600" />
                                Precio Fijo Admin *
                            </label>
                            <input
                                type="number"
                                name="precioAdminFijo"
                                value={form.precioAdminFijo}
                                onChange={handleChange}
                                required
                                step="0.01"
                                min="0"
                                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-purple-500 transition text-sm text-gray-900"
                            />
                            <p className="text-xs text-purple-600 mt-1 font-semibold">Este precio será enviado a vendedores</p>
                        </div>

                        <div>
                            <label className="block mb-2 font-semibold text-xs sm:text-sm text-gray-700">Moneda *</label>
                            <select
                                name="moneda"
                                value={form.moneda}
                                onChange={handleChange}
                                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-purple-500 transition text-sm text-gray-900"
                            >
                                <option value="ARS">🇦🇷 ARS (Pesos)</option>
                                <option value="USD">🇺🇸 USD (Dólares)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block mb-2 font-semibold text-xs sm:text-sm text-gray-700 flex items-center gap-2">
                                <Send size={16} className="text-green-600" />
                                WhatsApp Admin *
                            </label>
                            <input
                                type="text"
                                name="whatsappAdmin"
                                value={form.whatsappAdmin}
                                onChange={handleChange}
                                required
                                placeholder="+54 XXX XX XXXX"
                                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-purple-500 transition text-sm text-gray-900"
                            />
                            <p className="text-xs text-gray-500 mt-1">Para notificaciones</p>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 font-semibold cursor-pointer mt-4 sm:mt-8 bg-gradient-to-r from-yellow-50 to-amber-50 p-3 rounded-xl hover:from-yellow-100 hover:to-amber-100 transition border border-yellow-200">
                                <input type="checkbox" name="destacado" checked={form.destacado} onChange={handleChange} className="w-5 h-5 accent-yellow-500" />
                                <Star size={18} fill={form.destacado ? 'gold' : 'none'} className="text-yellow-500" />
                                <span className="text-xs sm:text-sm">Producto Destacado</span>
                            </label>
                        </div>

                        <div className="md:col-span-2 lg:col-span-3">
                            <label className="block mb-2 font-semibold text-xs sm:text-sm text-gray-700">Descripción *</label>
                            <textarea
                                name="descripcion"
                                value={form.descripcion}
                                onChange={handleChange}
                                required
                                rows={4}
                                placeholder="Describe el producto detalladamente..."
                                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-purple-500 resize-y transition text-sm text-gray-900"
                            />
                        </div>

                        <div className="md:col-span-2 lg:col-span-3">
                            <label className="block mb-2 font-semibold text-xs sm:text-sm text-gray-700">Imagen (Opcional)</label>
                            <input ref={fileRef} type="file" accept="image/*" onChange={handleImg} className="hidden" />
                            <button type="button" onClick={() => fileRef.current?.click()} className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition shadow-md text-sm">
                                📷 Seleccionar Imagen
                            </button>
                            <p className="text-xs text-gray-500 mt-2">Máximo 5MB. Puedes guardar sin imagen.</p>
                            {preview && (
                                <div className="mt-4 border-2 border-purple-200 rounded-xl p-3 inline-block bg-gradient-to-br from-purple-50 to-pink-50">
                                    <img src={preview} alt="Preview" className="max-w-full md:max-w-xs max-h-60 rounded-lg shadow-lg" />
                                </div>
                            )}
                        </div>

                        <div className="md:col-span-2 lg:col-span-3 bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 p-4 sm:p-6 rounded-2xl border-2 border-purple-300">
                            <h3 className="text-sm font-bold text-gray-800 mb-4 text-center flex items-center justify-center gap-2">
                                <DollarSign size={20} className="text-purple-600" />
                                Precio que verán los Vendedores
                            </h3>

                            <div className="flex justify-between items-center bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-lg border-2 border-purple-400 shadow-md">
                                <span className="text-base font-bold text-purple-900">💰 PRECIO FIJO:</span>
                                <span className="text-2xl font-bold text-purple-700">{fmt(parseFloat(form.precioAdminFijo) || 0, form.moneda)}</span>
                            </div>

                            <p className="text-xs text-center text-gray-600 mt-3 bg-white p-2 rounded-lg">
                                ℹ️ Los vendedores recibirán este producto con este precio fijo. Ellos podrán aplicar sus propios descuentos y recargos.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <button type="submit" disabled={loading} className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl font-bold text-sm sm:text-base disabled:opacity-50 transition shadow-lg flex items-center justify-center gap-2">
                            {loading ? '⏳ Guardando y Notificando...' : editMode ? <><Save size={20} /> Actualizar</> : <><Plus size={20} /> Crear y Notificar</>}
                        </button>
                        {editMode && (
                            <button type="button" onClick={reset} className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-gray-600 to-slate-700 hover:from-gray-700 hover:to-slate-800 text-white rounded-xl font-bold text-sm sm:text-base transition shadow-lg flex items-center justify-center gap-2">
                                <X size={20} /> Cancelar
                            </button>
                        )}
                    </div>
                </form>

                {/* Resto del componente igual... filtros, lista de productos, modales */}
                <div className="bg-white rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-lg border border-purple-100">
                    <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                            <label className="block text-xs sm:text-sm font-semibold mb-2 flex items-center gap-2 text-gray-700">
                                <Search size={16} className="text-purple-600" />
                                Buscar
                            </label>
                            <input
                                type="text"
                                placeholder="Nombre, marca o código..."
                                value={filtros.buscar}
                                onChange={(e) => setFiltros({ ...filtros, buscar: e.target.value })}
                                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-purple-500 transition text-sm text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-semibold mb-2 flex items-center gap-2 text-gray-700">
                                <Filter size={16} className="text-purple-600" />
                                Categoría
                            </label>
                            <select
                                value={filtros.categoria}
                                onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
                                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-purple-500 transition text-sm text-gray-900"
                            >
                                <option value="todos">Todas las categorías</option>
                                <option value="pelota">⚽ Pelotas</option>
                                <option value="ropa">👕 Ropa</option>
                                <option value="accesorio">🎒 Accesorios</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border border-purple-100">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        <Package className="text-purple-600" />
                        Productos Admin ({productosFiltrados.length})
                    </h2>

                    {loading && productos.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
                            <p className="mt-4 text-gray-600">Cargando productos...</p>
                        </div>
                    ) : productosFiltrados.length === 0 ? (
                        <p className="text-center text-gray-500 py-10">No hay productos para mostrar</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                            {productosFiltrados.map(p => (
                                <div key={p._id} className="bg-white border-2 border-purple-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-purple-400 transition-all duration-300">
                                    {p.imagenUrl ? (
                                        <div className="relative h-40 sm:h-48 bg-gray-100">
                                            <img src={p.imagenUrl} alt={p.nombre} className="w-full h-full object-cover" />
                                            {p.destacado && (
                                                <span className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                                                    <Star size={10} fill="currentColor" /> Destacado
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="relative h-40 sm:h-48 flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden rounded-xl">
                                            <img
                                                src="/assets/padeljona.jpg"
                                                alt="Producto destacado"
                                                className="object-contain h-full w-full transition-transform duration-500 hover:scale-105"
                                            />
                                            {p.destacado && (
                                                <span className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                                                    <Star size={10} fill="currentColor" /> Destacado
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div className="p-3 sm:p-4">
                                        <div className="flex justify-between mb-2 gap-1.5 flex-wrap">
                                            <span className="bg-purple-800 text-white px-2 py-1 rounded-lg text-xs font-bold">{p.codigo}</span>
                                            <span className="bg-purple-600 text-white px-2 py-1 rounded-lg text-xs font-bold capitalize">{p.categoria}</span>
                                        </div>

                                        <h3 className="text-sm sm:text-base font-bold mb-1 truncate text-gray-900">{p.nombre}</h3>
                                        <p className="text-xs sm:text-sm font-semibold text-purple-700 mb-2">{p.marca}</p>
                                        <p className="text-xs text-gray-700 mb-3 line-clamp-2">{p.descripcion}</p>

                                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 p-2.5 sm:p-3 rounded-xl mb-3">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs text-gray-700 font-semibold">Precio Admin Fijo:</span>
                                                <span className="text-base sm:text-lg font-bold text-purple-700">{fmt(p.precioAdminFijo, p.moneda)}</span>
                                            </div>
                                            <hr className="border-purple-300 mb-2" />
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-gray-900">Stock:</span>
                                                <span className={`text-sm font-bold ${p.stock > 5 ? 'text-emerald-700' : p.stock > 0 ? 'text-amber-700' : 'text-red-700'}`}>
                                                    {p.stock}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                                            <button
                                                onClick={() => verDetalle(p)}
                                                className="py-2 bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-800 text-white rounded-lg font-semibold transition shadow-md text-xs flex items-center justify-center"
                                            >
                                                👁️
                                            </button>
                                            <button
                                                onClick={() => editar(p)}
                                                className="py-2 bg-gradient-to-r from-blue-600 to-cyan-700 hover:from-blue-700 hover:to-cyan-800 text-white rounded-lg font-semibold transition shadow-md text-xs flex items-center justify-center"
                                            >
                                                <Edit2 size={12} />
                                            </button>
                                            <button
                                                onClick={() => eliminar(p._id)}
                                                disabled={loading}
                                                className="py-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white rounded-lg font-semibold transition shadow-md text-xs flex items-center justify-center disabled:opacity-50"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showModal && productoDetalle && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-3 sm:p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-10 rounded-t-3xl">
                            <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Detalle del Producto Admin</h2>
                            <button onClick={() => setShowModal(false)} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center text-3xl transition">×</button>
                        </div>

                        <div className="p-4 sm:p-6">
                            <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                                <div>
                                    {productoDetalle.imagenUrl ? (
                                        <img src={productoDetalle.imagenUrl} alt={productoDetalle.nombre} className="w-full rounded-2xl shadow-xl border-2 border-purple-200" />
                                    ) : (
                                        <div className="w-full h-60 sm:h-80 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl shadow-xl border-2 border-purple-200 flex items-center justify-center">
                                            <Package size={80} className="text-purple-300" />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3 sm:space-y-4">
                                    <div className="flex gap-2 flex-wrap">
                                        <span className="bg-purple-800 text-white px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm">{productoDetalle.codigo}</span>
                                        <span className="bg-purple-600 text-white px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm capitalize">{productoDetalle.categoria}</span>
                                        {productoDetalle.destacado && (
                                            <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1">
                                                <Star size={14} fill="currentColor" />
                                                Destacado
                                            </span>
                                        )}
                                    </div>

                                    <div className="border-b-2 border-gray-200 pb-2 sm:pb-3">
                                        <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-1">Nombre</p>
                                        <p className="text-base sm:text-xl md:text-2xl font-bold text-gray-900">{productoDetalle.nombre}</p>
                                    </div>

                                    <div className="border-b-2 border-gray-200 pb-2 sm:pb-3">
                                        <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-1">Marca</p>
                                        <p className="text-sm sm:text-lg md:text-xl font-semibold text-purple-700">{productoDetalle.marca}</p>
                                    </div>

                                    <div className="border-b-2 border-gray-200 pb-2 sm:pb-3">
                                        <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-1">Descripción</p>
                                        <p className="text-gray-900 leading-relaxed text-xs sm:text-sm">{productoDetalle.descripcion}</p>
                                    </div>

                                    <div className="border-b-2 border-gray-200 pb-2 sm:pb-3">
                                        <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-1">Stock Disponible</p>
                                        <p className={`text-lg sm:text-xl font-bold ${productoDetalle.stock > 5 ? 'text-emerald-700' : productoDetalle.stock > 0 ? 'text-amber-700' : 'text-red-700'}`}>
                                            {productoDetalle.stock} {productoDetalle.stock === 1 ? 'unidad' : 'unidades'}
                                        </p>
                                    </div>

                                    <div className="border-b-2 border-gray-200 pb-2 sm:pb-3">
                                        <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-1">WhatsApp Admin</p>
                                        <p className="text-sm sm:text-base md:text-lg font-semibold text-green-700">{productoDetalle.whatsappAdmin}</p>
                                    </div>

                                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-400 p-3 sm:p-4 md:p-5 rounded-2xl">
                                        <div className="flex justify-between items-center mb-2 sm:mb-3">
                                            <span className="text-sm sm:text-lg md:text-xl font-bold text-gray-900">Precio Admin Fijo:</span>
                                            <span className="text-lg sm:text-2xl md:text-3xl font-bold text-purple-700">{fmt(productoDetalle.precioAdminFijo, productoDetalle.moneda)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs sm:text-sm">
                                            <span className="text-gray-700">Moneda:</span>
                                            <span className="font-bold text-gray-900">{productoDetalle.moneda}</span>
                                        </div>
                                        <p className="text-xs text-center text-purple-600 mt-3 bg-white p-2 rounded-lg font-semibold">
                                            Este precio fue enviado a los vendedores
                                        </p>
                                    </div>

                                    <div className="bg-gray-100 border border-gray-300 p-2.5 sm:p-3 md:p-4 rounded-xl text-xs text-gray-700">
                                        <p className="mb-1"><strong className="text-gray-900">Creado:</strong> {new Date(productoDetalle.createdAt).toLocaleString('es-AR')}</p>
                                        <p><strong className="text-gray-900">Última actualización:</strong> {new Date(productoDetalle.updatedAt).toLocaleString('es-AR')}</p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
                                        <button
                                            onClick={() => { editar(productoDetalle); setShowModal(false); }}
                                            className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-cyan-700 hover:from-blue-700 hover:to-cyan-800 text-white rounded-xl font-bold transition shadow-lg text-sm flex items-center justify-center gap-2"
                                        >
                                            <Edit2 size={16} /> Editar
                                        </button>
                                        <button
                                            onClick={() => { eliminar(productoDetalle._id); setShowModal(false); }}
                                            className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white rounded-xl font-bold transition shadow-lg text-sm flex items-center justify-center gap-2"
                                        >
                                            <Trash2 size={16} /> Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showNotificacion && notificacionData && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-3 sm:p-4" onClick={() => setShowNotificacion(false)}>
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-10 rounded-t-3xl">
                            <h2 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2">
                                <Send size={24} />
                                Estado de Notificaciones
                            </h2>
                            <button onClick={() => setShowNotificacion(false)} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center text-3xl transition">×</button>
                        </div>

                        <div className="p-4 sm:p-6 space-y-4">
                            <div className={`p-4 rounded-xl ${notificacionData.success ? 'bg-green-50 border-2 border-green-300' : 'bg-yellow-50 border-2 border-yellow-300'}`}>
                                <p className={`font-bold text-lg mb-2 ${notificacionData.success ? 'text-green-800' : 'text-yellow-800'}`}>
                                    {notificacionData.success ? '✅ Producto creado exitosamente' : '⚠️ Producto creado con algunas notificaciones pendientes'}
                                </p>
                                <p className="text-sm text-gray-700">{notificacionData.message}</p>
                            </div>

                            {notificacionData.whatsappEnviados && notificacionData.whatsappEnviados.length > 0 && (
                                <div className="bg-green-50 border-2 border-green-300 p-4 rounded-xl">
                                    <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                                        <Send size={18} className="text-green-600" />
                                        WhatsApp Enviados ({notificacionData.whatsappEnviados.length})
                                    </h3>
                                    <ul className="space-y-1">
                                        {notificacionData.whatsappEnviados.map((num, idx) => (
                                            <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                                                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                                                {num}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {notificacionData.emailsEnviados && notificacionData.emailsEnviados.length > 0 && (
                                <div className="bg-blue-50 border-2 border-blue-300 p-4 rounded-xl">
                                    <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                                        📧 Emails Enviados ({notificacionData.emailsEnviados.length})
                                    </h3>
                                    <ul className="space-y-1">
                                        {notificacionData.emailsEnviados.map((email, idx) => (
                                            <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                                                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                                {email}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {notificacionData.errores && notificacionData.errores.length > 0 && (
                                <div className="bg-red-50 border-2 border-red-300 p-4 rounded-xl">
                                    <h3 className="font-bold text-red-800 mb-2">⚠️ Errores en Notificaciones</h3>
                                    <ul className="space-y-1">
                                        {notificacionData.errores.map((err, idx) => (
                                            <li key={idx} className="text-sm text-red-700">{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <button
                                onClick={() => setShowNotificacion(false)}
                                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold transition shadow-lg"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
