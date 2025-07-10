const pdfParse = require('pdf-parse');

async function parsearRemitoPDF(buffer) {
  const data = await pdfParse(buffer);
  const texto = data.text;
  const lineas = texto.split('\n').map(l => l.trim()).filter(Boolean);

  // CUIT
  const cuit = texto.match(/\d{2}-\d{8}-\d/)?.[0] || '';

  // Línea del CUIT para deducir domicilio
  const cuitLine = lineas.find(l => l.includes(cuit));
  const domicilio = cuitLine ? cuitLine.replace(cuit, '').trim() : '';

  // Condición IVA (buscamos una línea que contenga palabras comunes)
  const condicionIVARegex = /(Responsable.*|Monotributo|Exento)/i;
  const condicion_iva = lineas.find(l => condicionIVARegex.test(l)) || '';

  // Cliente: lógica definitiva, busca hacia arriba la primera línea que no sea campo administrativo, producto ni vacía, sin límite de distancia
  let cliente = '';
  const camposAdmin = /:|condicion|cuenta|localidad|domicilio|cuit|cliente|u\. medida|cantidad|denominacion|codigo|fecha|operacion|inscripto|nº|resp|bolsa|tonelada|granel|entrega|remito|producto|bultos|medida|iva|cta cte/i;
  const idxCliente = lineas.findIndex(l => l.replace(/\s/g, '').toLowerCase() === 'cliente:');
  if (idxCliente > 0) {
    for (let i = idxCliente - 1; i >= 0; i--) {
      const posible = lineas[i].trim();
      if (
        posible &&
        !camposAdmin.test(posible) &&
        !/\d/.test(posible)
      ) {
        cliente = posible;
        break;
      }
    }
  }
  // Si no se encontró, buscar 'Cliente: NOMBRE' en la misma línea
  if (!cliente) {
    const clienteLine = lineas.find(l => l.toLowerCase().startsWith('cliente:'));
    if (clienteLine) {
      let posible = clienteLine.split(':').slice(1).join(':').trim();
      if (posible) {
        cliente = posible;
      }
    }
  }
  // Fallback: buscar la siguiente línea válida después de 'Cliente:'
  if (!cliente && idxCliente !== -1) {
    for (let i = idxCliente + 1; i < lineas.length - 1; i++) {
      if (lineas[i]) {
        cliente = lineas[i].trim();
        break;
      }
    }
  }

  // Condición de la operación
  const idxCondOp = lineas.findIndex(l => l.includes('Condición de la Operación:'));
  const condicion_operacion = idxCondOp !== -1 ? lineas[idxCondOp + 1]?.trim() || '' : '';

  // Fecha
  const fecha = texto.match(/(\d{1,2}\/\d{1,2}\/\d{4})/)?.[1] || '';

  // Productos en bloques de 3 líneas
  const productos = [];
  for (let i = 0; i < lineas.length - 2; i++) {
    const l1 = lineas[i];
    const l2 = lineas[i + 1];
    const l3 = lineas[i + 2];

    const cantidad = parseFloat(l2);
    const codigo = l3.match(/^\d{3,6}$/) ? l3 : null;
    const unidad = l1.match(/(Bolsas|Toneladas|Litros|Cajas|Kilogramos|kg|Gr|gr|lts|m3|u|U|Unidades)$/)?.[1] || '';
    const nombre = unidad ? l1.replace(unidad, '').trim() : '';

    if (!isNaN(cantidad) && codigo && nombre) {
      productos.push({
        nombre,
        cantidad,
        unidad,
        codigo_bit: codigo
      });
    }
  }

  return {
    cliente,
    domicilio,
    localidad: '',
    condicion_iva,
    cuit,
    condicion_operacion,
    fecha_emision: fecha,
    productos
  };
}

module.exports = parsearRemitoPDF;
