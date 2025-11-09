"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Download, Package, Search, ChevronLeft, ChevronRight, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import { useUser } from '../../components/userContext'; // ✅ Importar el hook del contexto

const API_URL = 'https://padel-back-kohl.vercel.app/api';

interface Recargos {
  transporte?: number;
  margen?: number;
  otros?: number;
}

interface ProductoBackend {
  _id: string;
  codigo: string;
  nombre: string;
  marca: string;
  soloVendedores: boolean;
  soloUsuarios: boolean;
  descripcion: string;
  precio: number;
  precioFinal?: number;
  stock?: number;
  categoria: string;
  recargos?: Recargos;
  moneda?: 'ARS' | 'USD';
  vendedorId?: string;
  productoAdmin?: boolean;
  productoVendedor?: boolean;
}

type EstadoProducto = 'Disponible' | 'Bajo Stock' | 'Agotado';

interface ProductoTransformado {
  id: string;
  nombre: string;
  categoria: string;
  cantidad: number;
  precio: string;
  estado: EstadoProducto;
  proveedor: string;
  porcentajeRecargo: string;
  precioConRecargo: string;
  _id: string;
  moneda: 'ARS' | 'USD';
  precioFinal: number;
  stock: number;
}

interface ApiResponse {
  success: boolean;
  data: ProductoBackend[];
}

const transformarProducto = (producto: ProductoBackend): ProductoTransformado => {
  const recargoTotal = (producto.recargos?.transporte || 0) +
    (producto.recargos?.margen || 0) +
    (producto.recargos?.otros || 0);

  const cantidad = producto.stock ?? 0;
  const precioFinalCalc = producto.precioFinal ?? producto.precio;

  const determinarEstado = (cantidad: number): EstadoProducto => {
    if (cantidad === 0) return 'Agotado';
    if (cantidad < 10) return 'Bajo Stock';
    return 'Disponible';
  };

  return {
    id: producto.codigo,
    nombre: producto.nombre,
    categoria: producto.categoria,
    cantidad,
    precio: producto.precio.toFixed(2),
    estado: determinarEstado(cantidad),
    proveedor: producto.marca,
    porcentajeRecargo: recargoTotal.toFixed(2),
    precioConRecargo: precioFinalCalc.toFixed(2),
    _id: producto._id,
    moneda: producto.moneda || 'ARS',
    precioFinal: precioFinalCalc,
    stock: cantidad
  };
};

const InventoryDashboard: React.FC = () => {
  // ✅ Obtener datos del contexto (incluyendo el token)
  const { user, token, isAuthenticated } = useUser();
  
  const [productos, setProductos] = useState<ProductoTransformado[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('Todas');
  const [moneda, setMoneda] = useState<"ARS" | "USD">("ARS");
  const itemsPerPage = 50;

  const formatearNumero = (numero: number | string, moneda: 'ARS' | 'USD' = 'ARS'): string => {
    const num = typeof numero === 'string' ? parseFloat(numero) : numero;
    if (isNaN(num)) return '0,00';

    if (moneda === 'USD') {
      return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return num.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const cargarProductos = async (): Promise<void> => {
    if (!user?.id || !user?.rol) {
      console.warn('⚠️ No hay usuario o rol disponible');
      return;
    }

    if (!token) {
      console.error('❌ No hay token de autenticación');
      setError('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      let url = '';
      
      // 🔍 LOG COMPLETO DEL USUARIO
      console.log('📦 DATOS DEL USUARIO COMPLETO:', JSON.stringify(user, null, 2));
      console.log('👤 Rol del usuario:', user.rol);
      console.log('🆔 ID del usuario:', user.id);
      console.log('🔐 Token presente:', token ? 'Sí ✅' : 'No ❌');
      
      if (user.rol === 'admin') {
        url = `${API_URL}/productos`;
        console.log('✅ Usuario ADMIN - Cargando TODOS los productos');
      } else if (user.rol === 'vendedor') {
        url = `${API_URL}/productos-vendedor?vendedorId=${user.id}`;
        console.log('✅ Usuario VENDEDOR - Cargando productos del vendedor:', user.id);
      } else if (user.rol === 'usuario') {
        // Si es un usuario normal, también puede ver productos
        url = `${API_URL}/productos`;
        console.log('✅ Usuario NORMAL - Cargando productos generales');
      }

      console.log('🌐 URL DE LA API:', url);
      console.log('🔑 Token a enviar:', token ? 'Presente' : 'Ausente');

      // ✅ AGREGAR TOKEN EN LOS HEADERS
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // 🔑 Token de autenticación
        },
      });

      console.log('📡 Headers enviados:', {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token.substring(0, 20)}...` : 'Sin token'
      });

      console.log('📡 Status de respuesta:', response.status);
      console.log('📡 Status text:', response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error del servidor:', errorText);
        
        if (response.status === 401) {
          throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
        }
        
        throw new Error(`Error ${response.status}: ${response.statusText}. Detalles: ${errorText}`);
      }

      const data: ApiResponse = await response.json();
      console.log('📊 Datos recibidos:', data);

      if (data.success && Array.isArray(data.data)) {
        console.log('📦 Total productos recibidos del backend:', data.data.length);
        
        // ✅ El backend ya filtra por vendedorId en la query, no es necesario filtrar de nuevo
        // Solo transformamos los productos recibidos
        const productosTransformados = data.data.map(transformarProducto);
        setProductos(productosTransformados);
        
        console.log(`✅ Productos cargados exitosamente: ${productosTransformados.length}`);
        
        if (productosTransformados.length === 0) {
          console.warn('⚠️ No se encontraron productos para este usuario');
        }
      } else {
        console.error('❌ Formato de respuesta inválido:', data);
        throw new Error('Formato de respuesta inválido');
      }
    } catch (err) {
      console.error('❌ Error al cargar productos:', err);
      console.error('❌ Error completo:', JSON.stringify(err, null, 2));
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id && user?.rol && token) {
      cargarProductos();
    } else {
      console.warn('⚠️ Falta información para cargar productos:', {
        userId: user?.id,
        rol: user?.rol,
        token: token ? 'Presente' : 'Ausente'
      });
    }
  }, [user?.id, user?.rol, token]);

  const filteredProducts = useMemo<ProductoTransformado[]>(() => {
    return productos.filter(p => {
      const matchSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = filterCategory === 'Todas' || p.categoria === filterCategory;
      return matchSearch && matchCategory;
    });
  }, [productos, searchTerm, filterCategory]);

  const currentProducts = useMemo<ProductoTransformado[]>(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const downloadExcel = (): void => {
    if (!user) return;
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const headers = ['ID', 'Nombre', 'Categoría', 'Cant.', 'Precio Base', '% Rec.', 'Precio Final', 'Estado', 'Marca'];

    let htmlContent = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
<x:Name>Productos</x:Name>
<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
<style>
table { 
  border-collapse: collapse; 
  width: 100%; 
  font-size: 10pt; 
  font-family: Calibri, Arial, sans-serif;
  mso-displayed-decimal-separator: ",";
  mso-displayed-thousand-separator: ".";
}
th { 
  background-color: #4f46e5; 
  color: white; 
  font-weight: bold; 
  padding: 8px 4px; 
  border: 1px solid #3730a3;
  text-align: center;
  mso-pattern: auto none;
}
td { 
  padding: 6px 4px; 
  border: 1px solid #cbd5e1;
  text-align: center;
  mso-number-format: "@";
}
tr:nth-child(even) { 
  background-color: #f1f5f9;
  mso-pattern: auto none;
}
.disponible { 
  background-color: #dcfce7; 
  color: #166534; 
  font-weight: bold;
  mso-pattern: auto none;
}
.bajo-stock { 
  background-color: #fef3c7; 
  color: #92400e; 
  font-weight: bold;
  mso-pattern: auto none;
}
.agotado { 
  background-color: #fee2e2; 
  color: #991b1b; 
  font-weight: bold;
  mso-pattern: auto none;
}
.precio { 
  color: #059669; 
  font-weight: bold;
}
.precio-final { 
  color: #7c3aed; 
  font-weight: bold;
}
.recargo {
  color: #2563eb;
  font-weight: bold;
}
.nombre-col { 
  text-align: left;
  max-width: 300px;
}
</style>
</head>
<body>
<h2 style="color: #4f46e5; text-align: center; font-size: 16pt; font-weight: bold; margin: 12px 0;">LISTA DE PRECIOS EUROPADEL</h2>
<p style="text-align: center; color: #64748b; font-size: 10pt; margin: 8px 0;">${user.rol === 'admin' ? 'ADMIN - Todos los productos' : `Vendedor: ${user.nombre}`} - Página ${currentPage} - Generado: ${new Date().toLocaleDateString('es-AR')}</p>
<table border="1" cellspacing="0" cellpadding="0">
<thead>
<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
</thead>
<tbody>`;

    currentProducts.forEach(p => {
      const estadoClass = p.estado === 'Disponible' ? 'disponible' : p.estado === 'Bajo Stock' ? 'bajo-stock' : 'agotado';
      const precioBase = Number(p.precio);
      const porcentajeRecargo = Number(p.porcentajeRecargo);
      const precioFinal = precioBase * (1 + porcentajeRecargo / 100);

      const precioFormateado = formatearNumero(precioBase, p.moneda);
      const precioFinalFormateado = formatearNumero(precioFinal, p.moneda);

      htmlContent += `<tr>
<td style="font-weight: bold;">${p.id}</td>
<td class="nombre-col">${p.nombre}</td>
<td>${p.categoria}</td>
<td style="font-weight: bold;">${p.cantidad}</td>
<td class="precio">${precioFormateado}</td>
<td class="recargo">${formatearNumero(porcentajeRecargo)}%</td>
<td class="precio-final">${precioFinalFormateado}</td>
<td class="${estadoClass}">${p.estado}</td>
<td>${p.proveedor}</td>
</tr>`;
    });

    htmlContent += `</tbody></table>
<p style="margin-top: 12px; text-align: center; color: #64748b; font-size: 9pt;">Total productos en página: ${currentProducts.length}</p>
</body></html>`;

    const blob = new Blob(['\ufeff', htmlContent], {
      type: isMobile ? 'application/vnd.ms-excel;charset=utf-8' : 'application/vnd.ms-excel'
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `lista_precios_${user.rol}_${user.rol === 'vendedor' ? user.nombre : 'admin'}_pag${currentPage}.xls`;

    if (isMobile) {
      link.target = '_blank';
    }

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(link.href), 100);
  };

  const downloadWord = (): void => {
    if (!user) return;
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    let content = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta name="ProgId" content="Word.Document">
<meta name="Generator" content="Microsoft Word 15">
<meta name="Originator" content="Microsoft Word 15">
<style>
@page WordSection1 {
  size: 11.0in 8.5in;
  margin: 0.5in;
  mso-page-orientation: landscape;
}
div.WordSection1 { page: WordSection1; }
body { 
  font-family: Calibri, Arial, sans-serif;
  font-size: 11pt;
}
h1 { 
  color: #4f46e5;
  text-align: center;
  font-size: 18pt;
  font-weight: bold;
  margin: 12pt 0;
}
p.subtitle {
  text-align: center;
  color: #64748b;
  font-size: 9pt;
  margin: 6pt 0;
}
table { 
  border-collapse: collapse;
  width: 100%;
  font-size: 9pt;
  margin-top: 12pt;
}
th { 
  background-color: #4f46e5;
  color: white;
  padding: 6pt 3pt;
  border: 1pt solid #3730a3;
  font-weight: bold;
  text-align: center;
}
td { 
  padding: 4pt 3pt;
  border: 1pt solid #cbd5e1;
  text-align: center;
}
tr:nth-child(even) td {
  background-color: #f1f5f9;
}
.disponible { 
  background-color: #dcfce7;
  color: #166534;
  font-weight: bold;
}
.bajo-stock { 
  background-color: #fef3c7;
  color: #92400e;
  font-weight: bold;
}
.agotado { 
  background-color: #fee2e2;
  color: #991b1b;
  font-weight: bold;
}
.nombre-col { 
  text-align: left;
  max-width: 250pt;
}
.precio { 
  color: #059669;
  font-weight: bold;
}
.recargo { 
  color: #2563eb;
  font-weight: bold;
}
.precio-final { 
  color: #7c3aed;
  font-weight: bold;
}
</style>
</head>
<body>
<div class="WordSection1">
<h1>LISTA DE PRECIOS EUROPADEL</h1>
<p class="subtitle">${user.rol === 'admin' ? 'ADMIN - Todos los productos' : `Vendedor: ${user.nombre}`} - Página ${currentPage} - ${new Date().toLocaleDateString('es-AR')}</p>
<table border="1" cellspacing="0" cellpadding="0">
<thead>
<tr>
<th>ID</th>
<th>Nombre</th>
<th>Categoría</th>
<th>Cant.</th>
<th>Precio Base</th>
<th>% Rec.</th>
<th>Precio Final</th>
<th>Estado</th>
<th>Marca</th>
</tr>
</thead>
<tbody>`;

    currentProducts.forEach(p => {
      const estadoClass = p.estado === 'Disponible' ? 'disponible' : p.estado === 'Bajo Stock' ? 'bajo-stock' : 'agotado';
      const precioBase = Number(p.precio);
      const porcentajeRecargo = Number(p.porcentajeRecargo);
      const precioFinal = precioBase * (1 + porcentajeRecargo / 100);

      const precioFormateado = formatearNumero(precioBase, p.moneda);
      const precioFinalFormateado = formatearNumero(precioFinal, p.moneda);

      content += `<tr>
<td><b>${p.id}</b></td>
<td class="nombre-col">${p.nombre}</td>
<td>${p.categoria}</td>
<td><b>${p.cantidad}</b></td>
<td class="precio">${precioFormateado}</td>
<td class="recargo">${formatearNumero(porcentajeRecargo)}%</td>
<td class="precio-final">${precioFinalFormateado}</td>
<td class="${estadoClass}">${p.estado}</td>
<td>${p.proveedor}</td>
</tr>`;
    });

    content += `</tbody>
</table>
<p style="margin-top: 12pt; text-align: center; color: #64748b; font-size: 8pt;">Total: ${currentProducts.length} productos</p>
</div>
</body>
</html>`;

    const blob = new Blob(['\ufeff', content], {
      type: isMobile ? 'application/msword;charset=utf-8' : 'application/msword'
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `lista_precios_${user.rol}_${user.rol === 'vendedor' ? user.nombre : 'admin'}_pag${currentPage}.doc`;

    if (isMobile) {
      link.target = '_blank';
    }

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(link.href), 100);
  };

  const downloadPDF = (): void => {
    if (!user) return;
    
    let content = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Lista Precios ${user.rol === 'admin' ? 'Admin' : `Vendedor ${user.nombre}`}</title>
<style>
@page { 
  size: landscape;
  margin: 1cm;
}
@media print {
  body { 
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
body { 
  font-family: Arial, sans-serif;
  padding: 20px;
}
h1 { 
  color: #4f46e5;
  text-align: center;
  font-size: 24px;
}
.subtitle {
  text-align: center;
  color: #64748b;
  font-size: 11px;
  margin: 8px 0 15px 0;
}
table { 
  border-collapse: collapse;
  width: 100%;
  font-size: 10px;
}
th { 
  background-color: #4f46e5;
  color: white;
  padding: 10px 6px;
  border: 2px solid #3730a3;
}
td { 
  padding: 7px 5px;
  border: 1px solid #cbd5e1;
  text-align: center;
}
tr:nth-child(even) { 
  background-color: #f1f5f9;
}
.disponible { 
  background-color: #dcfce7;
  color: #166534;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 4px;
}
.bajo-stock { 
  background-color: #fef3c7;
  color: #92400e;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 4px;
}
.agotado { 
  background-color: #fee2e2;
  color: #991b1b;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 4px;
}
.nombre-col { 
  text-align: left;
  max-width: 200px;
}
.precio { 
  color: #059669;
  font-weight: bold;
}
.recargo {
  color: #2563eb;
  font-weight: bold;
}
.precio-final { 
  color: #7c3aed;
  font-weight: bold;
}
</style>
</head>
<body>
<h1>📦 LISTA DE PRECIOS EUROPADEL</h1>
<p class="subtitle">${user.rol === 'admin' ? 'ADMIN - Todos los productos' : `Vendedor: ${user.nombre}`} - Página ${currentPage} - ${new Date().toLocaleDateString('es-AR')}</p>
<table>
<thead>
<tr>
<th>ID</th>
<th>Nombre</th>
<th>Categoría</th>
<th>Cantidad</th>
<th>Precio Base</th>
<th>% Recargo</th>
<th>Precio Final</th>
<th>Estado</th>
<th>Marca</th>
</tr>
</thead>
<tbody>`;

    currentProducts.forEach(p => {
      const estadoClass = p.estado === 'Disponible' ? 'disponible' : p.estado === 'Bajo Stock' ? 'bajo-stock' : 'agotado';
      const precioBase = Number(p.precio);
      const porcentajeRecargo = Number(p.porcentajeRecargo);
      const precioFinal = precioBase * (1 + porcentajeRecargo / 100);

      const precioFormateado = formatearNumero(precioBase, p.moneda);
      const precioFinalFormateado = formatearNumero(precioFinal, p.moneda);

      content += `<tr>
<td><strong>${p.id}</strong></td>
<td class="nombre-col">${p.nombre}</td>
<td>${p.categoria}</td>
<td><strong>${p.cantidad}</strong></td>
<td class="precio">${precioFormateado}</td>
<td class="recargo">${formatearNumero(porcentajeRecargo)}%</td>
<td class="precio-final">${precioFinalFormateado}</td>
<td><span class="${estadoClass}">${p.estado}</span></td>
<td>${p.proveedor}</td>
</tr>`;
    });

    content += `</tbody>
</table>
<div style="margin-top: 15px; text-align: center; color: #64748b; font-size: 10px;">
<p><strong>Total:</strong> ${currentProducts.length} productos</p>
</div>
</body>
</html>`;

    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');

    if (printWindow) {
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 250);
      };
    } else {
      alert('Por favor, permite las ventanas emergentes para descargar el PDF');
    }

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const categories = useMemo(() => ['Todas', ...new Set(productos.map(p => p.categoria))], [productos]);

  const productosARS = productos.filter(p => p.moneda === 'ARS');
  const productosUSD = productos.filter(p => p.moneda === 'USD');

  const valorTotalARS = productosARS.reduce((sum, p) => sum + ((Number(p.precioFinal) || 0) * (Number(p.stock) || 0)), 0);
  const valorTotalUSD = productosUSD.reduce((sum, p) => sum + ((Number(p.precioFinal) || 0) * (Number(p.stock) || 0)), 0);

  const stockTotal = productos.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
  const stockDisponibles = productos.filter(p => p.estado === 'Disponible').reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
  const stockBajoStock = productos.filter(p => p.estado === 'Bajo Stock').reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
  const stockAgotado = productos.filter(p => p.estado === 'Agotado').reduce((sum, p) => sum + (Number(p.stock) || 0), 0);

  const stats = {
    total: productos.length,
    disponible: productos.filter(p => p.estado === 'Disponible').length,
    bajoStock: productos.filter(p => p.estado === 'Bajo Stock').length,
    agotado: productos.filter(p => p.estado === 'Agotado').length,
    stockDisponibles,
    stockBajoStock,
    stockAgotado,
    stockTotal,
    totalValue: moneda === 'ARS'
      ? `${valorTotalARS.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `USD ${valorTotalUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    cantidadProductos: moneda === 'ARS' ? productosARS.length : productosUSD.length
  };

  // ✅ Validación de autenticación y datos del usuario
  if (!isAuthenticated || !user || !token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-12 text-center max-w-md">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h3 className="text-xl font-semibold text-slate-800 mb-2">Acceso no autorizado</h3>
          <p className="text-slate-600 mb-4">Debes iniciar sesión para acceder al dashboard.</p>
          <a 
            href="/login" 
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Ir a Login
          </a>
        </div>
      </div>
    );
  }

  if (!user.id || !user.rol) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-12 text-center max-w-md">
          <AlertCircle size={48} className="mx-auto text-amber-500 mb-4" />
          <h3 className="text-xl font-semibold text-slate-800 mb-2">Información incompleta</h3>
          <p className="text-slate-600">Se requiere ID de usuario y rol para acceder.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-slate-800 mb-2">Dashboard de Inventario</h1>
              <p className="text-sm sm:text-base text-slate-600">
                {user.rol === 'admin' ? (
                  <span className="font-semibold text-purple-600">👑 ADMIN - Todos los productos</span>
                ) : (
                  <>Vendedor: <span className="font-semibold text-indigo-600">{user.nombre}</span></>
                )}
              </p>
            </div>
            <button onClick={cargarProductos} disabled={loading} className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50 text-sm sm:text-base w-full sm:w-auto justify-center">
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              Recargar
            </button>
          </div>
        </div>

        {loading && (
          <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-slate-600 text-sm sm:text-base">Cargando productos...</p>
          </div>
        )}

        {error && !loading &&  (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6 mb-6">
            <div className="flex items-start gap-3 text-red-800">
              <AlertCircle size={24} className="flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-sm sm:text-base">Error al cargar productos</h3>
                <p className="text-xs sm:text-sm mt-1">{error}</p>
                <button onClick={cargarProductos} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs sm:text-sm">
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && productos.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-slate-600 mb-1">Disponibles</p>
                    <p className="text-2xl sm:text-3xl font-bold text-slate-800">{stats.disponible}</p>
                    <p className="text-xs text-slate-500 mt-1">Stock: {stats.stockDisponibles} unidades</p>
                  </div>
                  <div className="bg-green-100 p-2 sm:p-3 rounded-lg">
                    <Package className="text-green-600" size={20} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-slate-600 mb-1">Bajo Stock</p>
                    <p className="text-2xl sm:text-3xl font-bold text-slate-800">{stats.bajoStock}</p>
                    <p className="text-xs text-slate-500 mt-1">Stock: {stats.stockBajoStock} unidades</p>
                  </div>
                  <div className="bg-yellow-100 p-2 sm:p-3 rounded-lg">
                    <Package className="text-yellow-600" size={20} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-slate-600 mb-1">Agotados</p>
                    <p className="text-2xl sm:text-3xl font-bold text-slate-800">{stats.agotado}</p>
                    <p className="text-xs text-slate-500 mt-1">Stock: {stats.stockAgotado} unidades</p>
                  </div>
                  <div className="bg-red-100 p-2 sm:p-3 rounded-lg">
                    <Package className="text-red-600" size={20} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-indigo-500">
                <div className="mb-3">
                  <p className="text-xs sm:text-sm text-slate-600 mb-1">Valor Total ({stats.cantidadProductos} productos)</p>
                  <p className="text-lg sm:text-xl font-bold text-slate-800 break-words">
                    {stats.totalValue}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setMoneda("ARS")}
                      className={`flex-1 sm:flex-none px-3 py-1 rounded text-xs font-semibold transition ${moneda === "ARS" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                    >
                      Pesos
                    </button>
                    <button
                      onClick={() => setMoneda("USD")}
                      className={`flex-1 sm:flex-none px-3 py-1 rounded text-xs font-semibold transition ${moneda === "USD" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                    >
                      Dólares
                    </button>
                  </div>

                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <Package className="text-indigo-600" size={18} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="Buscar por nombre o código..."
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                      className="w-full pl-10 pr-4 py-2 sm:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm sm:text-base"
                    />
                  </div>

                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                    <select
                      value={filterCategory}
                      onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                      className="w-full sm:w-auto pl-10 pr-8 py-2 sm:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none bg-white text-sm sm:text-base"
                    >
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button onClick={downloadExcel} className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md text-sm">
                    <Download size={18} />Excel
                  </button>
                  <button onClick={downloadWord} className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md text-sm">
                    <Download size={18} />Word
                  </button>
                  <button onClick={downloadPDF} className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md text-sm">
                    <Download size={18} />PDF
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-max">
                  <thead className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">Código</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">Nombre</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">Categoría</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">Stock</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">Precio Base</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">% Rec.</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">Precio Final</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">Estado</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">Marca</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {currentProducts.map((producto, idx) => (
                      <tr key={producto._id} className={`hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-slate-800 whitespace-nowrap">{producto.id}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-700">{producto.nombre}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-600 whitespace-nowrap">{producto.categoria}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-700 font-semibold whitespace-nowrap">{producto.cantidad}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-green-600 font-semibold whitespace-nowrap">${Number(producto.precio).toLocaleString('es-AR')}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-blue-600 font-bold whitespace-nowrap">{producto.porcentajeRecargo}%</td>

                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-purple-600 font-bold whitespace-nowrap">
                          ${((Number(producto.precio) || 0) * (1 + (Number(producto.porcentajeRecargo) || 0) / 100))
                            .toLocaleString(producto.moneda === "USD" ? "en-US" : "es-AR", { minimumFractionDigits: 2 })}
                        </td>

                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${producto.estado === 'Disponible' ? 'bg-green-100 text-green-800' : producto.estado === 'Bajo Stock' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                            {producto.estado}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-600 whitespace-nowrap">{producto.proveedor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-slate-50 px-3 sm:px-6 py-3 sm:py-4 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs sm:text-sm text-slate-600 text-center sm:text-left">
                    Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredProducts.length)} de {filteredProducts.length} productos
                  </p>

                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-slate-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) pageNum = i + 1;
                      else if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = currentPage - 2 + i;

                      return (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${currentPage === pageNum ? 'bg-indigo-600 text-white shadow-md' : 'border border-slate-300 hover:bg-white text-slate-700'}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-slate-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {!loading && !error && productos.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 text-center">
            <Package size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-2">No hay productos</h3>
            <p className="text-sm sm:text-base text-slate-600">Este vendedor no tiene productos asociados.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryDashboard;