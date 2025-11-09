// "use client";
// import { useState, useEffect, useRef } from 'react';
// import { Edit2, Trash2, Plus, X, Save, Search, Filter, Star, Package, DollarSign, Tag } from 'lucide-react';

// const API_URL = 'https://padel-back-kohl.vercel.app/api/productos';

// interface ProductoForm {
//   _id?: string;
//   codigo: string;
//   nombre: string;
//   marca: string;
//   descripcion: string;
//   precio: string;
//   precioFinal: number;
//   moneda: 'ARS' | 'USD';
//   descuento: string;
//   imagen: string;
//   imagenUrl: string;
//   categoria: 'pelota' | 'ropa' | 'accesorio';
//   destacado: boolean;
//   whatsapp: string;
//   recargoTransporte: string;
//   recargoMargen: string;
//   recargoOtros: string;
// }

// interface Producto {
//   _id: string;
//   codigo: string;
//   nombre: string;
//   marca: string;
//   descripcion: string;
//   precio: number;
//   precioFinal: number;
//   moneda: 'ARS' | 'USD';
//   descuento: number;
//   imagenUrl: string;
//   categoria: 'pelota' | 'ropa' | 'accesorio';
//   destacado: boolean;
//   whatsapp: string;
//   recargos: {
//     transporte: number;
//     margen: number;
//     otros: number;
//   };
//   createdAt: string;
//   updatedAt: string;
// }

// interface Login {
//   id: string;
//   email: string;
//   password: string;
// }

// interface Filtros {
//   buscar: string;
//   categoria: string;
// }

// const initialForm: ProductoForm = {
//   codigo: '', nombre: '', marca: '', descripcion: '', precio: '', precioFinal: 0,
//   moneda: 'ARS', descuento: '0', imagen: '', imagenUrl: '', categoria: 'pelota',
//   destacado: false, whatsapp: '', recargoTransporte: '0', recargoMargen: '0', recargoOtros: '0',
// };

// export default function AdminProductos() {
//   const [isAuth, setIsAuth] = useState<boolean>(false);
//   const [login, setLogin] = useState<Login>({ id: '', email: '', password: '' });
//   const [error, setError] = useState<string>('');
//   const [loading, setLoading] = useState<boolean>(false);
//   const [form, setForm] = useState<ProductoForm>(initialForm);
//   const [productos, setProductos] = useState<Producto[]>([]);
//   const [editMode, setEditMode] = useState<boolean>(false);
//   const [preview, setPreview] = useState<string>('');
//   const [showModal, setShowModal] = useState<boolean>(false);
//   const [productoDetalle, setProductoDetalle] = useState<Producto | null>(null);
//   const [filtros, setFiltros] = useState<Filtros>({ buscar: '', categoria: 'todos' });
//   const fileRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     if (sessionStorage.getItem('isAuthenticated') === 'true') setIsAuth(true);
//   }, []);

//   useEffect(() => {
//     if (isAuth) cargar();
//   }, [isAuth]);

//   useEffect(() => {
//     if (isAuth) calcular();
//   }, [form.precio, form.recargoTransporte, form.recargoMargen, form.recargoOtros, isAuth]);

//   const handleLogin = () => {
//     setLoading(true);
//     setError('');
//     if (login.id === '123456' && login.email === 'test@gmail.com' && login.password === '123456') {
//       sessionStorage.setItem('isAuthenticated', 'true');
//       sessionStorage.setItem('authToken', 'TEST_TOKEN_2024');
//       setTimeout(() => { setLoading(false); setIsAuth(true); }, 500);
//     } else {
//       setLoading(false);
//       setError('Credenciales incorrectas');
//     }
//   };

//   const logout = () => {
//     sessionStorage.clear();
//     setIsAuth(false);
//     setProductos([]);
//     reset();
//   };

//   const cargar = async () => {
//     try {
//       const res = await fetch(API_URL, {
//         headers: { 'Authorization': `Bearer ${sessionStorage.getItem('authToken')}` }
//       });
//       const data = await res.json();
//       if (data.success) setProductos(data.data);
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   const calcular = () => {
//     const p = parseFloat(form.precio) || 0;
//     const t = (parseFloat(form.recargoTransporte) || 0) + (parseFloat(form.recargoMargen) || 0) + (parseFloat(form.recargoOtros) || 0);
//     setForm(prev => ({ ...prev, precioFinal: p * (1 + t / 100) }));
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const target = e.target as HTMLInputElement;
//     const { name, value, type } = target;
//     const checked = target.checked;
//     setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
//   };

//   const handleImg = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     if (file.size > 5242880) {
//       alert('Imagen muy grande (máx 5MB)');
//       if (fileRef.current) fileRef.current.value = '';
//       return;
//     }
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       const r = reader.result as string;
//       setForm(prev => ({ ...prev, imagen: r }));
//       setPreview(r);
//     };
//     reader.readAsDataURL(file);
//   };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const res = await fetch(API_URL, {
//         method: editMode ? 'PUT' : 'POST',
//         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionStorage.getItem('authToken')}` },
//         body: JSON.stringify({
//           ...form,
//           id: editMode ? form._id : undefined,
//           precio: parseFloat(form.precio),
//           descuento: parseFloat(form.descuento),
//           recargoTransporte: parseFloat(form.recargoTransporte),
//           recargoMargen: parseFloat(form.recargoMargen),
//           recargoOtros: parseFloat(form.recargoOtros),
//         }),
//       });
//       const data = await res.json();
//       if (data.success) {
//         alert(editMode ? '✅ Producto actualizado!' : '✅ Producto creado!');
//         reset();
//         await cargar();
//       } else alert('❌ Error: ' + data.message);
//     } catch (err) {
//       alert('❌ Error de conexión');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const editar = (p: Producto) => {
//     setForm({
//       _id: p._id, codigo: p.codigo, nombre: p.nombre, marca: p.marca, descripcion: p.descripcion,
//       precio: p.precio.toString(), precioFinal: p.precioFinal, moneda: p.moneda,
//       descuento: p.descuento.toString(), imagen: '', imagenUrl: p.imagenUrl, categoria: p.categoria,
//       destacado: p.destacado, whatsapp: p.whatsapp, recargoTransporte: p.recargos.transporte.toString(),
//       recargoMargen: p.recargos.margen.toString(), recargoOtros: p.recargos.otros.toString(),
//     });
//     setPreview(p.imagenUrl);
//     setEditMode(true);
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   const eliminar = async (id: string) => {
//     if (!confirm('⚠️ ¿Estás seguro de eliminar este producto?')) return;
//     setLoading(true);
//     try {
//       const res = await fetch(`${API_URL}?id=${id}`, {
//         method: 'DELETE',
//         headers: { 'Authorization': `Bearer ${sessionStorage.getItem('authToken')}` }
//       });
//       const data = await res.json();
//       if (data.success) {
//         alert('✅ Producto eliminado!');
//         await cargar();
//       } else {
//         alert('❌ Error: ' + data.message);
//       }
//     } catch (err) {
//       alert('❌ Error de conexión');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const verDetalle = (p: Producto) => {
//     setProductoDetalle(p);
//     setShowModal(true);
//   };

//   const reset = () => {
//     setForm(initialForm);
//     setPreview('');
//     setEditMode(false);
//     if (fileRef.current) fileRef.current.value = '';
//   };

//   const fmt = (p: number, m: 'ARS' | 'USD') =>
//     m === 'ARS' ? `$${p.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : `USD $${p.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

//   const productosFiltrados = productos.filter(p => {
//     const matchBuscar = p.nombre.toLowerCase().includes(filtros.buscar.toLowerCase()) ||
//       p.marca.toLowerCase().includes(filtros.buscar.toLowerCase()) ||
//       p.codigo.toLowerCase().includes(filtros.buscar.toLowerCase());
//     const matchCategoria = filtros.categoria === 'todos' || p.categoria === filtros.categoria;
//     return matchBuscar && matchCategoria;
//   });

//   if (!isAuth) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-purple-900 p-5">
//         <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">
//           <div className="text-center mb-8">
//             <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center mx-auto mb-5">
//               <Package size={40} className="text-white" />
//             </div>
//             <h1 className="text-3xl font-bold mb-2">Admin - Productos</h1>
//             <p className="text-gray-600">Ingresa tus credenciales</p>
//           </div>
//           <div className="space-y-5">
//             <div>
//               <label className="block text-sm font-semibold mb-2">ID</label>
//               <input type="text" value={login.id} onChange={e => setLogin(p => ({ ...p, id: e.target.value }))} required placeholder="123456" className="w-full px-4 py-3 border-2 rounded-lg focus:border-purple-600 outline-none" />
//             </div>
//             <div>
//               <label className="block text-sm font-semibold mb-2">Email</label>
//               <input type="email" value={login.email} onChange={e => setLogin(p => ({ ...p, email: e.target.value }))} required placeholder="test@gmail.com" className="w-full px-4 py-3 border-2 rounded-lg focus:border-purple-600 outline-none" />
//             </div>
//             <div>
//               <label className="block text-sm font-semibold mb-2">Contraseña</label>
//               <input type="password" value={login.password} onChange={e => setLogin(p => ({ ...p, password: e.target.value }))} required placeholder="••••••" className="w-full px-4 py-3 border-2 rounded-lg focus:border-purple-600 outline-none" />
//             </div>
//             {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
//             <button onClick={handleLogin} disabled={loading} className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg font-semibold disabled:opacity-50 hover:shadow-lg transition">
//               {loading ? 'Iniciando...' : 'Iniciar Sesión'}
//             </button>
//           </div>
//           <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs">
//             <p className="font-semibold mb-2">Credenciales de prueba:</p>
//             <p>ID: <strong>123456</strong> | Email: <strong>test@gmail.com</strong> | Pass: <strong>123456</strong></p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-5">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg flex justify-between items-center">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-800">{editMode ? '✏️ Editar' : '➕ Crear'} Producto</h1>
//             <p className="text-gray-600 mt-1">Total de productos: <strong>{productos.length}</strong></p>
//           </div>
//           <button onClick={logout} className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition shadow">
//             Cerrar Sesión
//           </button>
//         </div>

//         {/* Formulario */}
//         <form className="bg-white rounded-2xl p-8 mb-8 shadow-lg" onSubmit={handleSubmit}>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
//             <div>
//               <label className="block mb-2 font-semibold text-sm flex items-center gap-2">
//                 <Tag size={16} className="text-purple-600" />
//                 Código *
//               </label>
//               <input type="text" name="codigo" value={form.codigo} onChange={handleChange} required className="w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-purple-600 transition" />
//             </div>

//             <div>
//               <label className="block mb-2 font-semibold text-sm flex items-center gap-2">
//                 <Package size={16} className="text-purple-600" />
//                 Nombre *
//               </label>
//               <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required className="w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-purple-600 transition" />
//             </div>

//             <div>
//               <label className="block mb-2 font-semibold text-sm">Marca *</label>
//               <input type="text" name="marca" value={form.marca} onChange={handleChange} required className="w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-purple-600 transition" />
//             </div>

//             <div>
//               <label className="block mb-2 font-semibold text-sm">Categoría *</label>
//               <select name="categoria" value={form.categoria} onChange={handleChange} required className="w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-purple-600 transition">
//                 <option value="pelota">⚽ Pelota</option>
//                 <option value="ropa">👕 Ropa</option>
//                 <option value="accesorio">🎒 Accesorio</option>
//               </select>
//             </div>

//             <div>
//               <label className="block mb-2 font-semibold text-sm flex items-center gap-2">
//                 <DollarSign size={16} className="text-green-600" />
//                 Precio *
//               </label>
//               <input type="number" name="precio" value={form.precio} onChange={handleChange} required step="0.01" min="0" className="w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-purple-600 transition" />
//             </div>

//             <div>
//               <label className="block mb-2 font-semibold text-sm">Moneda *</label>
//               <select name="moneda" value={form.moneda} onChange={handleChange} className="w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-purple-600 transition">
//                 <option value="ARS">🇦🇷 ARS (Pesos)</option>
//                 <option value="USD">🇺🇸 USD (Dólares)</option>
//               </select>
//             </div>

//             <div>
//               <label className="block mb-2 font-semibold text-sm">Descuento (%)</label>
//               <input type="number" name="descuento" value={form.descuento} onChange={handleChange} step="0.01" min="0" max="100" className="w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-purple-600 transition" />
//             </div>

//             <div>
//               <label className="block mb-2 font-semibold text-sm">WhatsApp *</label>
//               <input type="text" name="whatsapp" value={form.whatsapp} onChange={handleChange} required placeholder="+5493411234567" className="w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-purple-600 transition" />
//             </div>

//             <div>
//               <label className="block mb-2 font-semibold text-sm">Rec. Transporte (%)</label>
//               <input type="number" name="recargoTransporte" value={form.recargoTransporte} onChange={handleChange} step="0.01" min="0" className="w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-purple-600 transition" />
//             </div>

//             <div>
//               <label className="block mb-2 font-semibold text-sm">Margen (%)</label>
//               <input type="number" name="recargoMargen" value={form.recargoMargen} onChange={handleChange} step="0.01" min="0" className="w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-purple-600 transition" />
//             </div>

//             <div>
//               <label className="block mb-2 font-semibold text-sm">Otros Recargos (%)</label>
//               <input type="number" name="recargoOtros" value={form.recargoOtros} onChange={handleChange} step="0.01" min="0" className="w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-purple-600 transition" />
//             </div>

//             <div>
//               <label className="flex items-center gap-2 font-semibold cursor-pointer mt-8 bg-yellow-50 p-3 rounded-lg hover:bg-yellow-100 transition">
//                 <input type="checkbox" name="destacado" checked={form.destacado} onChange={handleChange} className="w-5 h-5" />
//                 <Star size={18} fill={form.destacado ? 'gold' : 'none'} className="text-yellow-500" />
//                 Producto Destacado
//               </label>
//             </div>

//             <div className="md:col-span-2 lg:col-span-3">
//               <label className="block mb-2 font-semibold text-sm">Descripción *</label>
//               <textarea name="descripcion" value={form.descripcion} onChange={handleChange} required rows={4} placeholder="Describe el producto detalladamente..." className="w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-purple-600 resize-y transition" />
//             </div>

//             <div className="md:col-span-2 lg:col-span-3">
//               <label className="block mb-2 font-semibold text-sm">Imagen (Opcional)</label>
//               <input ref={fileRef} type="file" accept="image/*" onChange={handleImg} className="hidden" />
//               <button type="button" onClick={() => fileRef.current?.click()} className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition shadow">
//                 📷 Seleccionar Imagen
//               </button>
//               <p className="text-xs text-gray-500 mt-2">Máximo 5MB. Puedes guardar sin imagen.</p>
//               {preview && (
//                 <div className="mt-4 border-2 rounded-lg p-3 inline-block bg-gray-50">
//                   <img src={preview} alt="Preview" className="max-w-[300px] max-h-[300px] rounded-lg shadow" />
//                 </div>
//               )}
//             </div>

//             <div className="md:col-span-2 lg:col-span-3 bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-200">
//               <div className="flex justify-around items-center flex-wrap gap-5">
//                 <div className="text-center">
//                   <span className="block text-sm font-semibold mb-2 text-gray-600">Precio Base:</span>
//                   <span className="text-2xl font-bold text-gray-700">{fmt(parseFloat(form.precio) || 0, form.moneda)}</span>
//                 </div>
//                 <div className="text-3xl text-gray-400">→</div>
//                 <div className="text-center">
//                   <span className="block text-sm font-semibold mb-2 text-gray-600">Precio Final:</span>
//                   <span className="text-3xl font-bold text-green-600">{fmt(form.precioFinal, form.moneda)}</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="mt-8 flex gap-3">
//             <button type="submit" disabled={loading} className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-lg disabled:opacity-50 transition shadow-lg flex items-center gap-2">
//               {loading ? '⏳ Guardando...' : editMode ? <><Save size={20} /> Actualizar</> : <><Plus size={20} /> Crear Producto</>}
//             </button>
//             {editMode && (
//               <button type="button" onClick={reset} className="px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold text-lg transition shadow-lg flex items-center gap-2">
//                 <X size={20} /> Cancelar
//               </button>
//             )}
//           </div>
//         </form>

//         {/* Filtros */}
//         <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
//           <div className="grid md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
//                 <Search size={16} />
//                 Buscar
//               </label>
//               <input
//                 type="text"
//                 placeholder="Nombre, marca o código..."
//                 value={filtros.buscar}
//                 onChange={(e) => setFiltros({ ...filtros, buscar: e.target.value })}
//                 className="w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-purple-600"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
//                 <Filter size={16} />
//                 Categoría
//               </label>
//               <select
//                 value={filtros.categoria}
//                 onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
//                 className="w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-purple-600"
//               >
//                 <option value="todos">Todas las categorías</option>
//                 <option value="pelota">⚽ Pelotas</option>
//                 <option value="ropa">👕 Ropa</option>
//                 <option value="accesorio">🎒 Accesorios</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Lista de Productos */}
//         <div className="bg-white rounded-2xl p-8 shadow-lg">
//           <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
//             <Package className="text-purple-600" />
//             Productos ({productosFiltrados.length})
//           </h2>

//           {loading && productos.length === 0 ? (
//             <div className="text-center py-20">
//               <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
//               <p className="mt-4 text-gray-600">Cargando productos...</p>
//             </div>
//           ) : productosFiltrados.length === 0 ? (
//             <p className="text-center text-gray-500 py-10">No hay productos para mostrar</p>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {productosFiltrados.map(p => (
//                 <div key={p._id} className="border-2 rounded-xl overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-1">
//                   {p.imagenUrl ? (
//                     <div className="relative h-48 bg-gray-100">
//                       <img src={p.imagenUrl} alt={p.nombre} className="w-full h-full object-cover" />
//                       {p.destacado && (
//                         <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow">
//                           <Star size={12} fill="currentColor" /> Destacado
//                         </span>
//                       )}
//                     </div>
//                   ) : (
//                     <div className="relative h-48 flex items-center justify-center border-2 border-dashed border-gray-400 bg-gray-200">
//                       <img
//                         src="./assets/europadel.jpg"
//                         alt="Imagen por defecto"
//                         className="w-full h-full object-cover rounded"
//                       />
//                       {p.destacado && (
//                         <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow">
//                           <Star size={12} fill="currentColor" /> Destacado
//                         </span>
//                       )}
//                     </div>
//                   )}

//                   <div className="p-5">
//                     <div className="flex justify-between mb-3 gap-2">
//                       <span className="bg-gray-200 px-3 py-1 rounded text-xs font-bold">{p.codigo}</span>
//                       <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-xs font-bold capitalize">{p.categoria}</span>
//                     </div>

//                     <h3 className="text-lg font-bold mb-1 truncate">{p.nombre}</h3>
//                     <p className="text-sm font-semibold text-gray-600 mb-3">{p.marca}</p>
//                     <p className="text-sm text-gray-700 mb-4 line-clamp-2">{p.descripcion}</p>

//                     <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg mb-4">
//                       <div className="flex justify-between mb-2">
//                         <span className="text-xs text-gray-600">Base:</span>
//                         <span className="text-sm font-semibold">{fmt(Number(p.precio), p.moneda)}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-xs text-gray-600">Final:</span>
//                         <span className="text-base font-bold text-green-600">{fmt(p.precioFinal, p.moneda)}</span>
//                       </div>
//                       {Number(p.descuento) > 0 && (
//                         <span className="inline-block mt-2 bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">
//                           -{p.descuento}% OFF
//                         </span>
//                       )}
//                     </div>

//                     {(p.recargos.transporte > 0 || p.recargos.margen > 0 || p.recargos.otros > 0) && (
//                       <div className="bg-yellow-50 p-2 rounded mb-3 text-xs">
//                         <p className="font-bold mb-1">Recargos:</p>
//                         <div className="flex flex-wrap gap-1">
//                           {p.recargos.transporte > 0 && <span className="bg-yellow-200 px-2 py-1 rounded">T:{p.recargos.transporte}%</span>}
//                           {p.recargos.margen > 0 && <span className="bg-yellow-200 px-2 py-1 rounded">M:{p.recargos.margen}%</span>}
//                           {p.recargos.otros > 0 && <span className="bg-yellow-200 px-2 py-1 rounded">O:{p.recargos.otros}%</span>}
//                         </div>
//                       </div>
//                     )}

//                     <div className="flex gap-2">
//                       <button onClick={() => verDetalle(p)} className="flex-1 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded font-semibold transition">
//                         👁️ Ver
//                       </button>
//                       <button onClick={() => editar(p)} className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-semibold transition flex items-center justify-center gap-1">
//                         <Edit2 size={16} /> Editar
//                       </button>
//                       <button onClick={() => eliminar(p._id)} disabled={loading} className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-semibold transition flex items-center justify-center gap-1 disabled:opacity-50">
//                         <Trash2 size={16} /> Borrar
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Modal Detalle */}
//       {showModal && productoDetalle && (
//         <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
//           <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
//             <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
//               <h2 className="text-2xl font-bold">Detalle del Producto</h2>
//               <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 text-3xl">×</button>
//             </div>

//             <div className="p-6">
//               <div className="grid md:grid-cols-2 gap-6">
//                 <div>
//                   {productoDetalle.imagenUrl ? (
//                     <img
//                       src={productoDetalle.imagenUrl}
//                       alt={productoDetalle.nombre}
//                       className="w-full rounded-xl shadow-lg"
//                     />
//                   ) : (
//                     <img
//                       src="./assets/europadel.jpg"
//                       alt="Imagen por defecto"
//                       className="w-full rounded-xl shadow-lg"
//                     />
//                   )}
//                 </div>
//                 <div className="space-y-4">
//                   <div className="flex gap-2 flex-wrap">
//                     <span className="bg-gray-200 px-4 py-2 rounded-lg font-bold text-sm">{productoDetalle.codigo}</span>
//                     <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-bold text-sm capitalize">{productoDetalle.categoria}</span>
//                     {productoDetalle.destacado && (
//                       <span className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-1">
//                         <Star size={16} fill="currentColor" />
//                         Destacado
//                       </span>
//                     )}
//                   </div>

//                   <div className="border-b pb-3">
//                     <p className="text-sm text-gray-600 font-semibold mb-1">Nombre</p>
//                     <p className="text-2xl font-bold">{productoDetalle.nombre}</p>
//                   </div>

//                   <div className="border-b pb-3">
//                     <p className="text-sm text-gray-600 font-semibold mb-1">Marca</p>
//                     <p className="text-xl font-semibold">{productoDetalle.marca}</p>
//                   </div>

//                   <div className="border-b pb-3">
//                     <p className="text-sm text-gray-600 font-semibold mb-1">Descripción</p>
//                     <p className="text-gray-700 leading-relaxed">{productoDetalle.descripcion}</p>
//                   </div>

//                   <div className="border-b pb-3">
//                     <p className="text-sm text-gray-600 font-semibold mb-1">WhatsApp</p>
//                     <p className="text-lg font-semibold text-green-600">{productoDetalle.whatsapp}</p>
//                   </div>

//                   <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border-2 border-green-200">
//                     <div className="flex justify-between items-center mb-3">
//                       <span className="text-gray-700 font-semibold">Precio Base:</span>
//                       <span className="text-lg font-bold line-through text-gray-500">{fmt(Number(productoDetalle.precio), productoDetalle.moneda)}</span>
//                     </div>
//                     <div className="flex justify-between items-center mb-3">
//                       <span className="text-xl font-bold">Precio Final:</span>
//                       <span className="text-3xl font-bold text-green-600">{fmt(productoDetalle.precioFinal, productoDetalle.moneda)}</span>
//                     </div>
//                     <div className="flex justify-between items-center text-sm">
//                       <span className="text-gray-600">Moneda:</span>
//                       <span className="font-bold">{productoDetalle.moneda}</span>
//                     </div>
//                     {Number(productoDetalle.descuento) > 0 && (
//                       <div className="mt-3 text-center">
//                         <span className="bg-red-500 text-white px-4 py-2 rounded-full font-bold">
//                           DESCUENTO: {productoDetalle.descuento}%
//                         </span>
//                       </div>
//                     )}
//                   </div>

//                   {(productoDetalle.recargos.transporte > 0 || productoDetalle.recargos.margen > 0 || productoDetalle.recargos.otros > 0) && (
//                     <div className="bg-yellow-50 p-4 rounded-xl border-2 border-yellow-200">
//                       <p className="font-bold mb-3 text-gray-700">Recargos Aplicados:</p>
//                       <div className="space-y-2">
//                         {productoDetalle.recargos.transporte > 0 && (
//                           <div className="flex justify-between">
//                             <span className="text-sm">Transporte:</span>
//                             <span className="bg-yellow-200 px-3 py-1 rounded font-bold text-sm">{productoDetalle.recargos.transporte}%</span>
//                           </div>
//                         )}
//                         {productoDetalle.recargos.margen > 0 && (
//                           <div className="flex justify-between">
//                             <span className="text-sm">Margen:</span>
//                             <span className="bg-yellow-200 px-3 py-1 rounded font-bold text-sm">{productoDetalle.recargos.margen}%</span>
//                           </div>
//                         )}
//                         {productoDetalle.recargos.otros > 0 && (
//                           <div className="flex justify-between">
//                             <span className="text-sm">Otros:</span>
//                             <span className="bg-yellow-200 px-3 py-1 rounded font-bold text-sm">{productoDetalle.recargos.otros}%</span>
//                           </div>
//                         )}
//                         <div className="border-t pt-2 mt-2">
//                           <div className="flex justify-between">
//                             <span className="font-bold">Total Recargos:</span>
//                             <span className="bg-yellow-300 px-3 py-1 rounded font-bold">
//                               {productoDetalle.recargos.transporte + productoDetalle.recargos.margen + productoDetalle.recargos.otros}%
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-600">
//                     <p className="mb-1"><strong>Creado:</strong> {new Date(productoDetalle.createdAt).toLocaleString('es-AR')}</p>
//                     <p><strong>Última actualización:</strong> {new Date(productoDetalle.updatedAt).toLocaleString('es-AR')}</p>
//                   </div>

//                   <div className="flex gap-3 pt-4">
//                     <button onClick={() => { editar(productoDetalle); setShowModal(false); }} className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold transition flex items-center justify-center gap-2">
//                       <Edit2 size={18} /> Editar
//                     </button>
//                     <button onClick={() => { eliminar(productoDetalle._id); setShowModal(false); }} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition flex items-center justify-center gap-2">
//                       <Trash2 size={18} /> Eliminar
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



"use client";
import { useState, useEffect, useRef } from 'react';
import { Edit2, Trash2, Plus, X, Save, Search, Filter, Star, Package, DollarSign, Tag } from 'lucide-react';

const API_URL = 'https://padel-back-kohl.vercel.app/api/productos';

interface ProductoForm {
  _id?: string;
  codigo: string;
  nombre: string;
  marca: string;
  descripcion: string;
  precio: string;
  precioFinal: number;
  moneda: 'ARS' | 'USD';
  descuento: string;
  imagen: string;
  imagenUrl: string;
  categoria: 'pelota' | 'ropa' | 'accesorio';
  destacado: boolean;
  whatsapp: string;
  recargoTransporte: string;
  recargoMargen: string;
  recargoOtros: string;
}

interface Producto {
  _id: string;
  codigo: string;
  nombre: string;
  marca: string;
  descripcion: string;
  precio: number;
  precioFinal: number;
  moneda: 'ARS' | 'USD';
  descuento: number;
  imagenUrl: string;
  categoria: 'pelota' | 'ropa' | 'accesorio';
  destacado: boolean;
  whatsapp: string;
  recargos: {
    transporte: number;
    margen: number;
    otros: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface Login {
  id: string;
  email: string;
  password: string;
}

interface Filtros {
  buscar: string;
  categoria: string;
}

const initialForm: ProductoForm = {
  codigo: '', nombre: '', marca: '', descripcion: '', precio: '', precioFinal: 0,
  moneda: 'ARS', descuento: '0', imagen: '', imagenUrl: '', categoria: 'pelota',
  destacado: false, whatsapp: '', recargoTransporte: '0', recargoMargen: '0', recargoOtros: '0',
};

export default function AdminProductos() {
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [login, setLogin] = useState<Login>({ id: '', email: '', password: '' });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [form, setForm] = useState<ProductoForm>(initialForm);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [preview, setPreview] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [productoDetalle, setProductoDetalle] = useState<Producto | null>(null);
  const [filtros, setFiltros] = useState<Filtros>({ buscar: '', categoria: 'todos' });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (sessionStorage.getItem('isAuthenticated') === 'true') setIsAuth(true);
  }, []);

  useEffect(() => {
    if (isAuth) cargar();
  }, [isAuth]);

  useEffect(() => {
    if (isAuth) calcular();
  }, [form.precio, form.recargoTransporte, form.recargoMargen, form.recargoOtros, isAuth]);

  const handleLogin = () => {
    setLoading(true);
    setError('');
    if (login.id === '123456' && login.email === 'test@gmail.com' && login.password === '123456') {
      sessionStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('authToken', 'TEST_TOKEN_2024');
      setTimeout(() => { setLoading(false); setIsAuth(true); }, 500);
    } else {
      setLoading(false);
      setError('Credenciales incorrectas');
    }
  };

  const logout = () => {
    sessionStorage.clear();
    setIsAuth(false);
    setProductos([]);
    reset();
  };

  const cargar = async () => {
    try {
      const res = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('authToken')}` }
      });
      const data = await res.json();
      if (data.success) setProductos(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const calcular = () => {
    const p = parseFloat(form.precio) || 0;
    const t = (parseFloat(form.recargoTransporte) || 0) + (parseFloat(form.recargoMargen) || 0) + (parseFloat(form.recargoOtros) || 0);
    setForm(prev => ({ ...prev, precioFinal: p * (1 + t / 100) }));
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
      const res = await fetch(API_URL, {
        method: editMode ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionStorage.getItem('authToken')}` },
        body: JSON.stringify({
          ...form,
          id: editMode ? form._id : undefined,
          precio: parseFloat(form.precio),
          descuento: parseFloat(form.descuento),
          recargoTransporte: parseFloat(form.recargoTransporte),
          recargoMargen: parseFloat(form.recargoMargen),
          recargoOtros: parseFloat(form.recargoOtros),
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(editMode ? '✅ Producto actualizado!' : '✅ Producto creado!');
        reset();
        await cargar();
      } else alert('❌ Error: ' + data.message);
    } catch (err) {
      alert('❌ Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const editar = (p: Producto) => {
    setForm({
      _id: p._id, codigo: p.codigo, nombre: p.nombre, marca: p.marca, descripcion: p.descripcion,
      precio: p.precio.toString(), precioFinal: p.precioFinal, moneda: p.moneda,
      descuento: p.descuento.toString(), imagen: '', imagenUrl: p.imagenUrl, categoria: p.categoria,
      destacado: p.destacado, whatsapp: p.whatsapp, recargoTransporte: p.recargos.transporte.toString(),
      recargoMargen: p.recargos.margen.toString(), recargoOtros: p.recargos.otros.toString(),
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
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('authToken')}` }
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Producto eliminado!');
        await cargar();
      } else {
        alert('❌ Error: ' + data.message);
      }
    } catch (err) {
      alert('❌ Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const verDetalle = (p: Producto) => {
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
    m === 'ARS' ? `$${p.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : `USD $${p.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const productosFiltrados = productos.filter(p => {
    const matchBuscar = p.nombre.toLowerCase().includes(filtros.buscar.toLowerCase()) ||
      p.marca.toLowerCase().includes(filtros.buscar.toLowerCase()) ||
      p.codigo.toLowerCase().includes(filtros.buscar.toLowerCase());
    const matchCategoria = filtros.categoria === 'todos' || p.categoria === filtros.categoria;
    return matchBuscar && matchCategoria;
  });

  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-purple-900 p-5">
        <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center mx-auto mb-5">
              <Package size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2 text-gray-900">Admin - Productos</h1>
            <p className="text-gray-600">Ingresa tus credenciales</p>
          </div>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">ID</label>
              <input type="text" value={login.id} onChange={e => setLogin(p => ({ ...p, id: e.target.value }))} required placeholder="123456" className="w-full px-4 py-3 border-2 rounded-lg focus:border-purple-600 outline-none text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">Email</label>
              <input type="email" value={login.email} onChange={e => setLogin(p => ({ ...p, email: e.target.value }))} required placeholder="test@gmail.com" className="w-full px-4 py-3 border-2 rounded-lg focus:border-purple-600 outline-none text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">Contraseña</label>
              <input type="password" value={login.password} onChange={e => setLogin(p => ({ ...p, password: e.target.value }))} required placeholder="••••••" className="w-full px-4 py-3 border-2 rounded-lg focus:border-purple-600 outline-none text-gray-900" />
            </div>
            {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
            <button onClick={handleLogin} disabled={loading} className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg font-semibold disabled:opacity-50 hover:shadow-lg transition">
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </div>
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-900">
            <p className="font-semibold mb-2">Credenciales de prueba:</p>
            <p>ID: <strong>123456</strong> | Email: <strong>test@gmail.com</strong> | Pass: <strong>123456</strong></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-5">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{editMode ? '✏️ Editar' : '➕ Crear'} Producto</h1>
            <p className="text-gray-600 mt-1">Total de productos: <strong>{productos.length}</strong></p>
          </div>
          <button onClick={logout} className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition shadow">
            Cerrar Sesión
          </button>
        </div>

        {/* Formulario */}
        <form className="bg-white rounded-2xl p-8 mb-8 shadow-lg" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block mb-2 font-semibold text-sm flex items-center gap-2 text-gray-900">
                <Tag size={16} className="text-purple-600" />
                Código *
              </label>
              <input type="text" name="codigo" value={form.codigo} onChange={handleChange} required className="w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-purple-600 transition text-gray-900" />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-sm flex items-center gap-2 text-gray-900">
                <Package size={16} className="text-purple-600" />
                Nombre *
              </label>
              <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required className="w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-purple-600 transition text-gray-900" />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-sm text-gray-900">Marca *</label>
              <input type="text" name="marca" value={form.marca} onChange={handleChange} required className="w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-purple-600 transition text-gray-900" />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-sm text-gray-900">Categoría *</label>
              <select name="categoria" value={form.categoria} onChange={handleChange} required className="w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-purple-600 transition text-gray-900">
                <option value="pelota">⚽ Pelota</option>
                <option value="ropa">👕 Ropa</option>
                <option value="accesorio">🎒 Accesorio</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-sm flex items-center gap-2 text-gray-900">
                <DollarSign size={16} className="text-green-600" />
                Precio *
              </label>
              <input type="number" name="precio" value={form.precio} onChange={handleChange} required step="0.01" min="0" className="w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-purple-600 transition text-gray-900" />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-sm text-gray-900">Moneda *</label>
              <select name="moneda" value={form.moneda} onChange={handleChange} className="w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-purple-600 transition text-gray-900">
                <option value="ARS">🇦🇷 ARS (Pesos)</option>
                <option value="USD">🇺🇸 USD (Dólares)</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-sm text-gray-900">Descuento (%)</label>
              <input type="number" name="descuento" value={form.descuento} onChange={handleChange} step="0.01" min="0" max="100" className="w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-purple-600 transition text-gray-900" />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-sm text-gray-900">WhatsApp *</label>
              <input type="text" name="whatsapp" value={form.whatsapp} onChange={handleChange} required placeholder="+5493411234567" className="w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-purple-600 transition text-gray-900 placeholder-gray-400" />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-sm text-gray-900">Rec. Transporte (%)</label>
              <input type="number" name="recargoTransporte" value={form.recargoTransporte} onChange={handleChange} step="0.01" min="0" className="w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-purple-600 transition text-gray-900" />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-sm text-gray-900">Margen (%)</label>
              <input type="number" name="recargoMargen" value={form.recargoMargen} onChange={handleChange} step="0.01" min="0" className="w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-purple-600 transition text-gray-900" />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-sm text-gray-900">Otros Recargos (%)</label>
              <input type="number" name="recargoOtros" value={form.recargoOtros} onChange={handleChange} step="0.01" min="0" className="w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-purple-600 transition text-gray-900" />
            </div>

            <div>
              <label className="flex items-center gap-2 font-semibold cursor-pointer mt-8 bg-yellow-50 p-3 rounded-lg hover:bg-yellow-100 transition text-gray-900">
                <input type="checkbox" name="destacado" checked={form.destacado} onChange={handleChange} className="w-5 h-5" />
                <Star size={18} fill={form.destacado ? 'gold' : 'none'} className="text-yellow-500" />
                Producto Destacado
              </label>
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block mb-2 font-semibold text-sm text-gray-900">Descripción *</label>
              <textarea name="descripcion" value={form.descripcion} onChange={handleChange} required rows={4} placeholder="Describe el producto detalladamente..." className="w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-purple-600 resize-y transition text-gray-900 placeholder-gray-400" />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block mb-2 font-semibold text-sm text-gray-900">Imagen (Opcional)</label>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImg} className="hidden" />
              <button type="button" onClick={() => fileRef.current?.click()} className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition shadow">
                📷 Seleccionar Imagen
              </button>
              <p className="text-xs text-gray-500 mt-2">Máximo 5MB. Puedes guardar sin imagen.</p>
              {preview && (
                <div className="mt-4 border-2 rounded-lg p-3 inline-block bg-gray-50">
                  <img src={preview} alt="Preview" className="max-w-[300px] max-h-[300px] rounded-lg shadow" />
                </div>
              )}
            </div>

            <div className="md:col-span-2 lg:col-span-3 bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-200">
              <div className="flex justify-around items-center flex-wrap gap-5">
                <div className="text-center">
                  <span className="block text-sm font-semibold mb-2 text-gray-700">Precio Base:</span>
                  <span className="text-2xl font-bold text-gray-900">{fmt(parseFloat(form.precio) || 0, form.moneda)}</span>
                </div>
                <div className="text-3xl text-gray-400">→</div>
                <div className="text-center">
                  <span className="block text-sm font-semibold mb-2 text-gray-700">Precio Final:</span>
                  <span className="text-3xl font-bold text-green-600">{fmt(form.precioFinal, form.moneda)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button type="submit" disabled={loading} className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-lg disabled:opacity-50 transition shadow-lg flex items-center gap-2">
              {loading ? '⏳ Guardando...' : editMode ? <><Save size={20} /> Actualizar</> : <><Plus size={20} /> Crear Producto</>}
            </button>
            {editMode && (
              <button type="button" onClick={reset} className="px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold text-lg transition shadow-lg flex items-center gap-2">
                <X size={20} /> Cancelar
              </button>
            )}
          </div>
        </form>

        {/* Filtros */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2 text-gray-900">
                <Search size={16} />
                Buscar
              </label>
              <input
                type="text"
                placeholder="Nombre, marca o código..."
                value={filtros.buscar}
                onChange={(e) => setFiltros({ ...filtros, buscar: e.target.value })}
                className="w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-purple-600 text-gray-900 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2 text-gray-900">
                <Filter size={16} />
                Categoría
              </label>
              <select
                value={filtros.categoria}
                onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
                className="w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-purple-600 text-gray-900"
              >
                <option value="todos">Todas las categorías</option>
                <option value="pelota">⚽ Pelotas</option>
                <option value="ropa">👕 Ropa</option>
                <option value="accesorio">🎒 Accesorios</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Productos */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Package className="text-purple-600" />
            Productos ({productosFiltrados.length})
          </h2>

          {loading && productos.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Cargando productos...</p>
            </div>
          ) : productosFiltrados.length === 0 ? (
            <p className="text-center text-gray-500 py-10">No hay productos para mostrar</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productosFiltrados.map(p => (
                <div key={p._id} className="border-2 rounded-xl overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-1">
                  {p.imagenUrl ? (
                    <div className="relative h-48 bg-gray-100">
                      <img src={p.imagenUrl} alt={p.nombre} className="w-full h-full object-cover" />
                      {p.destacado && (
                        <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow">
                          <Star size={12} fill="currentColor" /> Destacado
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="relative h-48 flex items-center justify-center border-2 border-dashed border-gray-400 bg-gray-200">
                      <img
                        src="./assets/europadel.jpg"
                        alt="Imagen por defecto"
                        className="w-full h-full object-cover rounded"
                      />
                      {p.destacado && (
                        <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow">
                          <Star size={12} fill="currentColor" /> Destacado
                        </span>
                      )}
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex justify-between mb-3 gap-2">
                      <span className="bg-gray-200 px-3 py-1 rounded text-xs font-bold">{p.codigo}</span>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-xs font-bold capitalize">{p.categoria}</span>
                    </div>

                    <h3 className="text-lg font-bold mb-1 truncate">{p.nombre}</h3>
                    <p className="text-sm font-semibold text-gray-600 mb-3">{p.marca}</p>
                    <p className="text-sm text-gray-700 mb-4 line-clamp-2">{p.descripcion}</p>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg mb-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-xs text-gray-600">Base:</span>
                        <span className="text-sm font-semibold">{fmt(Number(p.precio), p.moneda)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Final:</span>
                        <span className="text-base font-bold text-green-600">{fmt(p.precioFinal, p.moneda)}</span>
                      </div>
                      {Number(p.descuento) > 0 && (
                        <span className="inline-block mt-2 bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">
                          -{p.descuento}% OFF
                        </span>
                      )}
                    </div>

                    {(p.recargos.transporte > 0 || p.recargos.margen > 0 || p.recargos.otros > 0) && (
                      <div className="bg-yellow-50 p-2 rounded mb-3 text-xs">
                        <p className="font-bold mb-1">Recargos:</p>
                        <div className="flex flex-wrap gap-1">
                          {p.recargos.transporte > 0 && <span className="bg-yellow-200 px-2 py-1 rounded">T:{p.recargos.transporte}%</span>}
                          {p.recargos.margen > 0 && <span className="bg-yellow-200 px-2 py-1 rounded">M:{p.recargos.margen}%</span>}
                          {p.recargos.otros > 0 && <span className="bg-yellow-200 px-2 py-1 rounded">O:{p.recargos.otros}%</span>}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button onClick={() => verDetalle(p)} className="flex-1 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded font-semibold transition">
                        👁️ Ver
                      </button>
                      <button onClick={() => editar(p)} className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-semibold transition flex items-center justify-center gap-1">
                        <Edit2 size={16} /> Editar
                      </button>
                      <button onClick={() => eliminar(p._id)} disabled={loading} className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-semibold transition flex items-center justify-center gap-1 disabled:opacity-50">
                        <Trash2 size={16} /> Borrar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Detalle */}
      {showModal && productoDetalle && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold text-gray-900">Detalle del Producto</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 text-3xl">×</button>
            </div>

            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  {productoDetalle.imagenUrl ? (
                    <img
                      src={productoDetalle.imagenUrl}
                      alt={productoDetalle.nombre}
                      className="w-full rounded-xl shadow-lg"
                    />
                  ) : (
                    <img
                      src="./assets/europadel.jpg"
                      alt="Imagen por defecto"
                      className="w-full rounded-xl shadow-lg"
                    />
                  )}
                </div>
                <div className="space-y-4">
                  <div className="flex gap-2 flex-wrap">
                    <span className="bg-gray-200 px-4 py-2 rounded-lg font-bold text-sm text-gray-900">{productoDetalle.codigo}</span>
                    <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-bold text-sm capitalize">{productoDetalle.categoria}</span>
                    {productoDetalle.destacado && (
                      <span className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-1">
                        <Star size={16} fill="currentColor" />
                        Destacado
                      </span>
                    )}
                  </div>

                  <div className="border-b pb-3">
                    <p className="text-sm text-gray-600 font-semibold mb-1">Nombre</p>
                    <p className="text-2xl font-bold text-gray-900">{productoDetalle.nombre}</p>
                  </div>

                  <div className="border-b pb-3">
                    <p className="text-sm text-gray-600 font-semibold mb-1">Marca</p>
                    <p className="text-xl font-semibold text-gray-900">{productoDetalle.marca}</p>
                  </div>

                  <div className="border-b pb-3">
                    <p className="text-sm text-gray-600 font-semibold mb-1">Descripción</p>
                    <p className="text-gray-700 leading-relaxed">{productoDetalle.descripcion}</p>
                  </div>

                  <div className="border-b pb-3">
                    <p className="text-sm text-gray-600 font-semibold mb-1">WhatsApp</p>
                    <p className="text-lg font-semibold text-green-600">{productoDetalle.whatsapp}</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border-2 border-green-200">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-700 font-semibold">Precio Base:</span>
                      <span className="text-lg font-bold line-through text-gray-500">{fmt(Number(productoDetalle.precio), productoDetalle.moneda)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xl font-bold text-gray-900">Precio Final:</span>
                      <span className="text-3xl font-bold text-green-600">{fmt(productoDetalle.precioFinal, productoDetalle.moneda)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Moneda:</span>
                      <span className="font-bold text-gray-900">{productoDetalle.moneda}</span>
                    </div>
                    {Number(productoDetalle.descuento) > 0 && (
                      <div className="mt-3 text-center">
                        <span className="bg-red-500 text-white px-4 py-2 rounded-full font-bold">
                          DESCUENTO: {productoDetalle.descuento}%
                        </span>
                      </div>
                    )}
                  </div>

                  {(productoDetalle.recargos.transporte > 0 || productoDetalle.recargos.margen > 0 || productoDetalle.recargos.otros > 0) && (
                    <div className="bg-yellow-50 p-4 rounded-xl border-2 border-yellow-200">
                      <p className="font-bold mb-3 text-gray-900">Recargos Aplicados:</p>
                      <div className="space-y-2">
                        {productoDetalle.recargos.transporte > 0 && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-900">Transporte:</span>
                            <span className="bg-yellow-200 px-3 py-1 rounded font-bold text-sm text-gray-900">{productoDetalle.recargos.transporte}%</span>
                          </div>
                        )}
                        {productoDetalle.recargos.margen > 0 && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-900">Margen:</span>
                            <span className="bg-yellow-200 px-3 py-1 rounded font-bold text-sm text-gray-900">{productoDetalle.recargos.margen}%</span>
                          </div>
                        )}
                        {productoDetalle.recargos.otros > 0 && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-900">Otros:</span>
                            <span className="bg-yellow-200 px-3 py-1 rounded font-bold text-sm text-gray-900">{productoDetalle.recargos.otros}%</span>
                          </div>
                        )}
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between">
                            <span className="font-bold text-gray-900">Total Recargos:</span>
                            <span className="bg-yellow-300 px-3 py-1 rounded font-bold text-gray-900">
                              {productoDetalle.recargos.transporte + productoDetalle.recargos.margen + productoDetalle.recargos.otros}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-600">
                    <p className="mb-1"><strong>Creado:</strong> {new Date(productoDetalle.createdAt).toLocaleString('es-AR')}</p>
                    <p><strong>Última actualización:</strong> {new Date(productoDetalle.updatedAt).toLocaleString('es-AR')}</p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button onClick={() => { editar(productoDetalle); setShowModal(false); }} className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold transition flex items-center justify-center gap-2">
                      <Edit2 size={18} /> Editar
                    </button>
                    <button onClick={() => { eliminar(productoDetalle._id); setShowModal(false); }} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition flex items-center justify-center gap-2">
                      <Trash2 size={18} /> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}