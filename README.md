# Entregable N°2 · Mini Tienda (DOM + Eventos + LocalStorage)

Este proyecto implementa un **simulador de carrito de compras** para cumplir la consigna:

- **Interactividad**: formularios, inputs de búsqueda/orden y botones que modifican el **DOM**.
- **Funcionalidad**: flujo completo de agregar productos, filtrar/ordenar, añadir al carrito, cambiar cantidades, quitar/vaciar y finalizar (simulado).
- **Escalabilidad**: clase `Product`, arrays de objetos, funciones con parámetros y delegación de eventos.
- **Integridad**: JavaScript en archivo separado, sin `alert()`/`prompt()`. Mensajes mostrados en el DOM.
- **Storage**: persiste **productos y carrito en `localStorage`** para conservar el estado entre recargas.
- **Legibilidad**: nombres significativos, comentarios y código ordenado.

## Estructura
```
Entregable2-Osaba-v2/
  index.html
  css/
    style.css
  js/
    app.js
  data/
    products.json        ← Datos de muestra opcionales
  assets/
```

> **Nota**: Por CORS, `fetch()` a archivos locales suele fallar si abrís `index.html` con doble click. Aquí usamos datos “semilla” en `app.js` y guardamos todo en `localStorage`. `data/products.json` queda como referencia.

## Cómo probar
1. Abrí `index.html` (recomendado: servidor local tipo “Live Server” en VS Code).
2. Probá: buscar, ordenar, **agregar al carrito**, **sumar/restar**, **quitar/vaciar** y **crear productos** desde el formulario.
3. Recargá: verás que **persisten** carrito y productos agregados.

## Entrega
Comprimí la carpeta como **`Entregable2+Osaba.zip`** y subila en el campus.
