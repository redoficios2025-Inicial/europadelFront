'use client';

import { useState, useEffect } from 'react';
import { FaWhatsapp, FaSearch, FaArrowLeft, FaStar, FaFilter, FaShoppingCart } from 'react-icons/fa';
import styles from '../stylesPage/page.module.css';

const API_URL = 'https://padel-back-kohl.vercel.app/api/productos-publicos';

interface Producto {
  _id: string;
  soloVendedores: boolean;
  soloUsuarios: boolean;
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
  whatsappAdmin?: string;
  userWhatsapp?: string;
  vendedorId?: string;
  stock: number;
  recargos: {
    transporte: number;
    margen: number;
    otros: number;
  };
  productoVendedor?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Filtros {
  buscar: string;
  categoria: 'todos' | 'pelota' | 'ropa' | 'accesorio';
  destacado: boolean;
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [filtros, setFiltros] = useState<Filtros>({
    buscar: '',
    categoria: 'todos',
    destacado: false,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [productoDetalle, setProductoDetalle] = useState<Producto | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    cargarProductos();
    const interval = setInterval(() => {
      cargarProductos(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [filtros.categoria, filtros.destacado]);

  const cargarProductos = async (silencioso = false) => {
    if (!silencioso) {
      setLoading(true);
      setError('');
    }

    try {
      const params = new URLSearchParams();
      if (filtros.categoria !== 'todos') params.append('categoria', filtros.categoria);
      if (filtros.destacado) params.append('destacado', 'true');

      const url = `${API_URL}?${params.toString()}`;
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (data.success && data.data) {
        const productosDisponibles = data.data.filter((p: Producto) => p.stock > 0);
        setProductos(productosDisponibles);
      } else {
        setProductos([]);
      }
    } catch (err) {
      console.error('Error al cargar productos:', err);
      if (!silencioso) {
        const errorMsg = err instanceof Error ? err.message : 'Error de conexión con el servidor';
        setError(errorMsg);
      }
    } finally {
      if (!silencioso) setLoading(false);
    }
  };

  const formatearPrecio = (precio: number, moneda: 'ARS' | 'USD'): string => {
    if (moneda === 'ARS') {
      return `${precio.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `USD ${precio.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const calcularPrecioSinDescuento = (precio: number, recargos: { transporte: number; margen: number; otros: number }): number => {
    const porcentajeTotal = recargos.transporte + recargos.margen + recargos.otros;
    return precio + (precio * porcentajeTotal / 100);
  };

  const getWhatsAppNumber = (producto: Producto): string => {
    if (producto.userWhatsapp && producto.userWhatsapp.trim()) {
      return producto.userWhatsapp.replace(/\D/g, '');
    }
    if (producto.whatsappAdmin && producto.whatsappAdmin.trim()) {
      return producto.whatsappAdmin.replace(/\D/g, '');
    }
    return '543462529718';
  };

  const handleWhatsApp = (producto: Producto): void => {
    const numero = getWhatsAppNumber(producto);
    const mensaje = `Hola! Estoy interesado en: *${producto.nombre}* - ${producto.marca} (Código: ${producto.codigo})\nPrecio: ${formatearPrecio(producto.precioFinal, producto.moneda)}`;
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const verDetalle = (producto: Producto): void => {
    setProductoDetalle(producto);
    setShowModal(true);
  };

  const productosFiltrados = productos.filter((p: Producto) => {
    const term = filtros.buscar.toLowerCase();
    return p.nombre.toLowerCase().includes(term) ||
      p.marca.toLowerCase().includes(term) ||
      p.descripcion.toLowerCase().includes(term) ||
      p.codigo.toLowerCase().includes(term);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-500 mb-4">⚠️ {error}</h2>
          <button
            onClick={() => cargarProductos()}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold rounded-xl hover:shadow-lg transition-all"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 mb-6 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all"
          >
            <FaArrowLeft /> Volver al Inicio
          </button>
          <h1 className="text-5xl font-black mb-3">Catálogo Completo</h1>
          <p className="text-xl text-purple-100">Todos nuestros productos disponibles</p>
        </div>
      </section>

      {/* Filtros */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Buscador */}
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={filtros.buscar}
                onChange={(e) => setFiltros({ ...filtros, buscar: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-purple-600 focus:outline-none transition-all text-gray-800"
              />
            </div>

            {/* Categoría */}
            <div className="relative">
              <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={filtros.categoria}
                onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value as 'todos' | 'pelota' | 'ropa' | 'accesorio' })}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-purple-600 focus:outline-none transition-all appearance-none cursor-pointer text-gray-800"
              >
                <option value="todos">Todas las categorías</option>
                <option value="pelota">⚽ Pelotas</option>
                <option value="ropa">👕 Ropa</option>
                <option value="accesorio">🎒 Accesorios</option>
              </select>
            </div>

            {/* Destacados */}
            <label className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl cursor-pointer hover:shadow-md transition-all">
              <input
                type="checkbox"
                checked={filtros.destacado}
                onChange={(e) => setFiltros({ ...filtros, destacado: e.target.checked })}
                className="w-5 h-5 rounded accent-purple-600"
              />
              <FaStar className="text-yellow-500" />
              <span className="font-semibold text-gray-700">Solo destacados</span>
            </label>
          </div>

          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-gray-600">
              Se encontraron <strong className="text-purple-600">{productosFiltrados.length}</strong> productos
            </p>
          </div>
        </div>

        {/* Grid de Productos */}
        {productosFiltrados.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
            <p className="text-xl text-gray-600 mb-6">No se encontraron productos con los filtros seleccionados</p>
            <button
              onClick={() => setFiltros({ buscar: '', categoria: 'todos', destacado: false })}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold rounded-xl hover:shadow-lg transition-all"
            >
              Limpiar Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productosFiltrados.map((producto, index) => {
              const precioSinDescuento = calcularPrecioSinDescuento(producto.precio, producto.recargos);
              const precioConDescuento = producto.precioFinal;

              return (
                <article
                  key={`${producto._id}-${index}`}
                  className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group relative"
                >
                  {/* Badges */}
                  <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                    {producto.destacado && (
                      <span className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold rounded-full text-sm shadow-lg">
                        ⭐ Destacado
                      </span>
                    )}
                    {producto.descuento > 0 && (
                      <span className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded-full text-sm shadow-lg">
                        -{producto.descuento}%
                      </span>
                    )}
                  </div>

                  {/* Imagen */}
                  <div
                    className="relative h-72 overflow-hidden cursor-pointer"
                    onClick={() => verDetalle(producto)}
                  >
                    {producto.imagenUrl ? (
                      <img
                        src={producto.imagenUrl}
                        alt={producto.nombre}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                        <img
                          src="./assets/europadel.jpg"
                          alt="Imagen por defecto"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {/* Precio sobre imagen */}
                    <div className="absolute bottom-4 right-4">
                      <div className={`px-6 py-3 rounded-2xl font-black text-2xl shadow-2xl ${producto.moneda === 'USD'
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                          : 'bg-white text-purple-600'
                        }`}>
                        {formatearPrecio(precioConDescuento, producto.moneda)}
                      </div>
                    </div>
                  </div>

                  {/* Info del producto */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-4 py-1 bg-purple-100 text-purple-600 rounded-full text-sm font-bold">
                        {producto.marca}
                      </span>
                      <span className="text-2xl">
                        {producto.categoria === 'pelota' && '⚽'}
                        {producto.categoria === 'ropa' && '👕'}
                        {producto.categoria === 'accesorio' && '🎒'}
                      </span>
                    </div>

                    {producto.descuento > 0 && <div className={styles.precioTachado}>{formatearPrecio(precioSinDescuento, producto.moneda)}</div>}


                    <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                      {producto.nombre}
                    </h3>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {producto.descripcion}
                    </p>

                    {/* Botones */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => verDetalle(producto)}
                        className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
                      >
                        Ver Detalle
                      </button>
                      <button
                        onClick={() => handleWhatsApp(producto)}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <FaWhatsapp className="text-xl" />
                        WhatsApp
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Modal Detalle */}
      {showModal && productoDetalle && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-2xl font-bold text-gray-600 hover:bg-gray-100 transition-all"
            >
              ×
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
              {/* Imagen */}
              <div className="relative h-96 rounded-2xl overflow-hidden">
                {productoDetalle.imagenUrl ? (
                  <img
                    src={productoDetalle.imagenUrl}
                    alt={productoDetalle.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                    <span className="text-gray-400 text-xl">Sin imagen</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col">
                <div className="flex gap-2 mb-4">
                  {productoDetalle.destacado && (
                    <span className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold rounded-full text-sm">
                      ⭐ Destacado
                    </span>
                  )}
                  <span className="px-4 py-2 bg-purple-100 text-purple-600 rounded-full text-sm font-bold">
                    {productoDetalle.categoria}
                  </span>
                </div>

                <h2 className="text-3xl font-black text-gray-800 mb-2">
                  {productoDetalle.nombre}
                </h2>
                <p className="text-xl text-purple-600 font-bold mb-2">
                  {productoDetalle.marca}
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Código: {productoDetalle.codigo}
                </p>

                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Descripción</h3>
                  <p className="text-gray-600">{productoDetalle.descripcion}</p>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  {productoDetalle.descuento > 0 && (
                    <>
                      <span className="text-gray-400 line-through text-lg">
                        {formatearPrecio(productoDetalle.precio, productoDetalle.moneda)}
                      </span>
                      <span className="px-3 py-1 bg-red-500 text-white rounded-full font-bold text-sm">
                        -{productoDetalle.descuento}%
                      </span>
                    </>
                  )}
                </div>

                <div className={`text-4xl font-black mb-6 ${productoDetalle.moneda === 'USD' ? 'text-green-600' : 'text-purple-600'
                  }`}>
                  {formatearPrecio(productoDetalle.precioFinal, productoDetalle.moneda)}
                </div>

                <button
                  onClick={() => handleWhatsApp(productoDetalle)}
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-2xl hover:shadow-lg transition-all flex items-center justify-center gap-3 text-lg"
                >
                  <FaWhatsapp className="text-2xl" />
                  Consultar por WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gradient-to-r from-purple-900 to-blue-900 text-white py-12 px-4 mt-16">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-3xl font-black mb-4">Euro Padel</h3>
          <p className="text-purple-200 mb-6">El punto decisivo empieza aquí</p>
          <div className="flex justify-center gap-6 text-sm text-purple-300">
            <span>© 2024 Euro Padel</span>
            <span>•</span>
            <span>Todos los derechos reservados</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
