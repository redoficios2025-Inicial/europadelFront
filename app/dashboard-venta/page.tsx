'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import { FaWhatsapp, FaShoppingCart, FaStar, FaFire } from 'react-icons/fa';
import styles from '../stylesPage/page.module.css';

interface Producto {
  _id: string;
  codigo: string;
  nombre: string;
  marca: string;
  descripcion: string;
  precio: number;
  moneda: 'ARS' | 'USD';
  descuento?: number;
  imagenUrl: string;
  categoria: 'pelota' | 'ropa' | 'accesorio';
  destacado?: boolean;
  whatsapp: string;
}

// Productos mock para demostración
const productosMock: Producto[] = [
  {
    _id: '1',
    codigo: '0001',
    nombre: 'Pelotas Head Padel Pro',
    marca: 'Head',
    descripcion: 'Pack x3 pelotas profesionales de alta durabilidad',
    precio: 25000,
    moneda: 'ARS',
    descuento: 15,
    imagenUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=500&q=80',
    categoria: 'pelota',
    destacado: true,
    whatsapp: '5493416123456'
  },
  {
    _id: '2',
    codigo: '0002',
    nombre: 'Remera Técnica Bullpadel',
    marca: 'Bullpadel',
    descripcion: 'Remera dry-fit con tecnología anti-transpirante',
    precio: 45,
    moneda: 'USD',
    imagenUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80',
    categoria: 'ropa',
    destacado: true,
    whatsapp: '5493416123456'
  },
  {
    _id: '3',
    codigo: '0003',
    nombre: 'Pelotas Wilson Tour',
    marca: 'Wilson',
    descripcion: 'Pack x3 pelotas homologadas para torneos',
    precio: 28500,
    moneda: 'ARS',
    descuento: 10,
    imagenUrl: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=500&q=80',
    categoria: 'pelota',
    whatsapp: '5493416123456'
  },
  {
    _id: '4',
    codigo: '0004',
    nombre: 'Short Deportivo Adidas',
    marca: 'Adidas',
    descripcion: 'Short con bolsillos laterales y ajuste elástico',
    precio: 52000,
    moneda: 'ARS',
    imagenUrl: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&q=80',
    categoria: 'ropa',
    whatsapp: '5493416123456'
  },
  {
    _id: '5',
    codigo: '0005',
    nombre: 'Pelotas Dunlop Pro',
    marca: 'Dunlop',
    descripcion: 'Pack x3 pelotas con núcleo de goma premium',
    precio: 35,
    moneda: 'USD',
    descuento: 20,
    imagenUrl: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=500&q=80',
    categoria: 'pelota',
    destacado: true,
    whatsapp: '5493416123456'
  },
  {
    _id: '6',
    codigo: '0006',
    nombre: 'Conjunto Nox Pro Series',
    marca: 'Nox',
    descripcion: 'Remera + Short conjunto completo profesional',
    precio: 120,
    moneda: 'USD',
    imagenUrl: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=500&q=80',
    categoria: 'ropa',
    destacado: true,
    whatsapp: '5493416123456'
  }
];

export default function HomePage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [filtro, setFiltro] = useState<'todos' | 'pelota' | 'ropa'>('todos');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga desde base de datos
    const cargarProductos = async () => {
      try {
        // En producción: const res = await fetch('/api/productos');
        // const data = await res.json();
        // setProductos(data);

        setTimeout(() => {
          setProductos(productosMock);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error al cargar productos:', error);
        setLoading(false);
      }
    };

    cargarProductos();
  }, []);

  const formatearPrecio = (precio: number, moneda: 'ARS' | 'USD'): string => {
    if (moneda === 'ARS') {
      return `$${precio.toLocaleString('es-AR')}`;
    }
    return `USD $${precio}`;
  };

  const calcularPrecioConDescuento = (precio: number, descuento?: number): number => {
    if (!descuento) return precio;
    return precio - (precio * descuento / 100);
  };

  const handleWhatsApp = (producto: Producto) => {
    const mensaje = `Hola! Estoy interesado en: *${producto.nombre}* - ${producto.marca} (Código: ${producto.codigo})`;
    const url = `https://wa.me/${producto.whatsapp}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  const productosFiltrados = filtro === 'todos'
    ? productos
    : productos.filter(p => p.categoria === filtro);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Cargando productos...</p>
      </div>
    );
  }

  return (
    <>
    <Navbar/>
      <div className={styles.container}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroOverlay}></div>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              <FaFire className={styles.fireIcon} />
              Tienda de Pádel Premium
            </h1>
            <p className={styles.heroSubtitle}>
              Las mejores pelotas y ropa deportiva para tu juego
            </p>
            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <FaStar className={styles.statIcon} />
                <span>+500 clientes satisfechos</span>
              </div>
              <div className={styles.stat}>
                <FaShoppingCart className={styles.statIcon} />
                <span>Envíos a todo el país</span>
              </div>
            </div>
          </div>
        </section>

        {/* Filtros */}
        <section className={styles.filtros}>
          <button
            className={`${styles.filtroBtn} ${filtro === 'todos' ? styles.active : ''}`}
            onClick={() => setFiltro('todos')}
          >
            Todos los Productos
          </button>
          <button
            className={`${styles.filtroBtn} ${filtro === 'pelota' ? styles.active : ''}`}
            onClick={() => setFiltro('pelota')}
          >
            Pelotas
          </button>
          <button
            className={`${styles.filtroBtn} ${filtro === 'ropa' ? styles.active : ''}`}
            onClick={() => setFiltro('ropa')}
          >
            Ropa Deportiva
          </button>
        </section>

        {/* Grid de Productos */}
        <section className={styles.productosSection}>
          <div className={styles.productosGrid}>
            {productosFiltrados.map((producto) => {
              const precioFinal = calcularPrecioConDescuento(producto.precio, producto.descuento);

              return (
                <article key={producto._id} className={styles.productCard}>
                  {producto.destacado && (
                    <div className={styles.badge}>⭐ Destacado</div>
                  )}
                  {producto.descuento && (
                    <div className={styles.descuentoBadge}>-{producto.descuento}%</div>
                  )}

                  <div className={styles.imageContainer}>
                    <img
                      src={producto.imagenUrl}
                      alt={producto.nombre}
                      className={styles.productImage}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>

                  <div className={styles.productInfo}>
                    <span className={styles.marca}>{producto.marca}</span>
                    <h3 className={styles.productName}>{producto.nombre}</h3>
                    <p className={styles.descripcion}>{producto.descripcion}</p>

                    <div className={styles.precioContainer}>
                      {producto.descuento ? (
                        <>
                          <span className={styles.precioTachado}>
                            {formatearPrecio(producto.precio, producto.moneda)}
                          </span>
                          <span className={styles.precioFinal}>
                            {formatearPrecio(precioFinal, producto.moneda)}
                          </span>
                        </>
                      ) : (
                        <span className={styles.precioFinal}>
                          {formatearPrecio(producto.precio, producto.moneda)}
                        </span>
                      )}
                    </div>

                    <button
                      className={styles.whatsappBtn}
                      onClick={() => handleWhatsApp(producto)}
                    >
                      <FaWhatsapp /> Consultar por WhatsApp
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}