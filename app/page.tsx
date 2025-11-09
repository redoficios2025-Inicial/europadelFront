'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaWhatsapp, FaShoppingCart, FaStar } from 'react-icons/fa';
import styles from './stylesPage/page.module.css';
import Footer from './components/Footer';

// ✅ CAMBIO CRÍTICO: Cambiar la URL a productos públicos solo
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

export default function HomePage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [filtro, setFiltro] = useState<'todos' | 'pelota' | 'ropa' | 'accesorio'>('todos');
  const [busqueda, setBusqueda] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    cargarProductos();

    // ✅ Polling cada 10 segundos para mantener actualizados los productos
    const interval = setInterval(() => {
      cargarProductos(true); // true = silencioso, sin mostrar loading
    }, 10000);

    return () => clearInterval(interval);
  }, [filtro]);

  const cargarProductos = async (silencioso = false) => {
    if (!silencioso) {
      setLoading(true);
      setError('');
    }

    try {
      const params = new URLSearchParams();
      if (filtro !== 'todos') params.append('categoria', filtro);

      const url = `${API_URL}?${params.toString()}`;
      console.log('🔍 Cargando productos PÚBLICOS desde:', url);

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      console.log('📦 Respuesta del servidor:', {
        success: data.success,
        count: data.count,
        mensaje: data.message
      });

      if (data.success && data.data) {
        console.log('📊 Total productos PÚBLICOS recibidos:', data.data.length);

        // ✅ Filtrar solo productos con stock > 0
        const productosDisponibles = data.data.filter((p: Producto) => p.stock > 0);

        console.log(`✅ Productos con stock disponible: ${productosDisponibles.length}`);

        if (productosDisponibles.length > 0) {
          console.log('🔍 Muestra de productos:', productosDisponibles.slice(0, 2).map((p: Producto) => ({
            nombre: p.nombre,
            stock: p.stock,
            whatsapp: p.userWhatsapp || p.whatsappAdmin,
            vendedorId: p.vendedorId
          })));
        }

        setProductos(productosDisponibles);
      } else {
        console.warn('⚠️ No hay productos públicos disponibles');
        setProductos([]);
      }
    } catch (err) {
      console.error('❌ Error al cargar productos:', err);
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
    // ✅ Prioridad: userWhatsapp del vendedor > whatsappAdmin > número por defecto
    if (producto.userWhatsapp && producto.userWhatsapp.trim()) {
      return producto.userWhatsapp.replace(/\D/g, '');
    }
    if (producto.whatsappAdmin && producto.whatsappAdmin.trim()) {
      return producto.whatsappAdmin.replace(/\D/g, '');
    }
    return '543462529718'; // Número por defecto
  };

  const handleWhatsApp = (producto: Producto) => {
    const numero = getWhatsAppNumber(producto);
    const mensaje = `Hola! Estoy interesado en: *${producto.nombre}* - ${producto.marca} (Código: ${producto.codigo})\nPrecio: ${formatearPrecio(producto.precioFinal, producto.moneda)}`;

    console.log(`📱 Abriendo WhatsApp con número: ${numero}`);
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const handleVerMas = () => window.location.href = '/productosall';

  // Filtrar búsqueda y limitar a 6 productos
  const productosFiltrados = productos
    .slice(0, 6)
    .filter(p => {
      const term = busqueda.toLowerCase();
      return p.nombre.toLowerCase().includes(term)
        || p.marca.toLowerCase().includes(term)
        || p.descripcion.toLowerCase().includes(term)
        || p.codigo.toLowerCase().includes(term);
    });

  if (loading) return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p>Cargando productos...</p>
    </div>
  );

  if (error) return (
    <div className={styles.container}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem' }}>
        <div style={{ background: 'white', borderRadius: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '3rem', textAlign: 'center', maxWidth: '500px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff4757', marginBottom: '1.5rem' }}>⚠️ {error}</h2>
          <button
            onClick={() => cargarProductos()}
            style={{ padding: '1rem 2rem', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '1rem', fontWeight: '700', cursor: 'pointer', fontSize: '1rem' }}
          >
            Reintentar
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <Image src="/assets/padel.jpg" alt="Cancha de pádel" fill priority quality={90} className={styles.heroBgImage} sizes="100vw" />
        </div>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Euro Padel</h1>
          <p className={styles.heroSubtitle}>EL PUNTO DECISIVO EMPIEZA AQUÍ</p>
          <div className={styles.heroStats}>
            <div className={styles.stat}><FaStar className={styles.statIcon} /><span>Nuestros clientes nos siguen eligiendo</span></div>
            <div className={styles.stat}><FaShoppingCart className={styles.statIcon} /><span>Envíos a todo el país</span></div>
          </div>
        </div>
      </section>

      {/* Buscador */}
      <section className={styles.filtros}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <input
              type="text"
              placeholder="🔍 Buscar productos por nombre, marca o código..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{
                width: '100%', maxWidth: '600px', padding: '1rem 1.5rem', fontSize: '1rem',
                border: '2px solid rgba(102, 126, 234, 0.2)', borderRadius: '100px', outline: 'none',
                transition: 'all 0.3s ease', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', backgroundColor: 'white', color: '#000'
              }}
              onFocus={e => { e.target.style.borderColor = '#667eea'; e.target.style.boxShadow = '0 8px 25px rgba(102,126,234,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(102,126,234,0.2)'; e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)'; }}
            />
          </div>
          {busqueda && <div style={{ textAlign: 'center', color: '#667eea', fontWeight: '600', fontSize: '0.938rem' }}>
            {productosFiltrados.length === 0 ? '❌ No se encontraron productos' : `✓ ${productosFiltrados.length} producto${productosFiltrados.length !== 1 ? 's' : ''} encontrado${productosFiltrados.length !== 1 ? 's' : ''}`}
          </div>}
        </div>
      </section>

      {/* Grid de Productos */}
      <section className={styles.productosSection}>
        {productosFiltrados.length === 0 ? (
          <div className={styles.noProductos}>
            <p>{busqueda ? `No se encontraron productos que coincidan con "${busqueda}"` : 'No hay productos disponibles. Los vendedores aún no han publicado productos.'}</p>
          </div>
        ) : (
          <>
            <div className={styles.productosGrid}>
              {productosFiltrados.map((producto, index) => {
                const precioSinDescuento = calcularPrecioSinDescuento(producto.precio, producto.recargos);
                const precioConDescuento = producto.precioFinal;

                return (
                  <article key={`${producto._id}-${index}`} className={styles.productCard}>
                    {producto.destacado && <div className={styles.badge}>⭐ Destacado</div>}
                    <div className={styles.imageContainer}>
                      {producto.imagenUrl ? (
                        <img src={producto.imagenUrl} alt={producto.nombre} className={styles.productImage} />
                      ) : (
                        <div className={styles.noImage}>
                          <img src="./assets/europadel.jpg" alt="Imagen por defecto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                      <div className={styles.precioSobreImagen}>
                        <div className={`${styles.precioFinalImagen} ${producto.moneda === 'USD' ? styles.precioUSD : ''}`}>
                          {formatearPrecio(precioConDescuento, producto.moneda)}
                        </div>
                      </div>
                    </div>

                    <div className={styles.productInfo}>
                      <div className={styles.topLabels}>
                        <span className={styles.marca}>{producto.marca}</span>
                        {producto.descuento > 0 && <span className={styles.descuentoBadge}>-{producto.descuento}%</span>}
                      </div>
                      {producto.descuento > 0 && <div className={styles.precioTachado}>{formatearPrecio(precioSinDescuento, producto.moneda)}</div>}
                      <h3 className={styles.productName}>{producto.nombre}</h3>
                      <p className={styles.descripcion}>{producto.descripcion}</p>
                      <div className={styles.btnContainer}>
                        <button className={styles.whatsappBtn} onClick={() => handleWhatsApp(producto)}>
                          <FaWhatsapp /> Consultar por WhatsApp
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {productos.length > 6 && (
              <div className={styles.verMasContainer}>
                <button onClick={handleVerMas} className={styles.verMasBtn}>
                  Ver Más Productos ({productos.length - 6} más)
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <Footer />
    </div>
  );
}
