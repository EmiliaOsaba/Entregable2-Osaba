// ===== Mini Tienda (Entregable 2) =====
// DOM, Eventos, Arrays/Objetos, Funciones con parámetros, LocalStorage y sin alert()/prompt().

const $ = (sel) => document.querySelector(sel);
const formatUYU = (n) =>
  new Intl.NumberFormat("es-UY", { style: "currency", currency: "UYU" }).format(
    n
  );

// --- Modelos y datos ---
class Product {
  constructor({ id, name, price, stock = 0, category = "General" }) {
    this.id = id;
    this.name = name;
    this.price = Number(price);
    this.stock = Number(stock);
    this.category = category || "General";
  }
}

const STORAGE_KEYS = {
  PRODUCTS: "e2_products",
  CART: "e2_cart",
};

// Semilla inicial (se carga solo si no hay nada en storage)
const SEED_PRODUCTS = [
  new Product({
    id: crypto.randomUUID(),
    name: "Camisa",
    price: 1500,
    stock: 12,
    category: "Ropa",
  }),
  new Product({
    id: crypto.randomUUID(),
    name: "Pantalón",
    price: 2300,
    stock: 20,
    category: "Ropa",
  }),
  new Product({
    id: crypto.randomUUID(),
    name: "Championes",
    price: 4500,
    stock: 30,
    category: "Calzado",
  }),
  new Product({
    id: crypto.randomUUID(),
    name: "Gorra",
    price: 800,
    stock: 25,
    category: "Accesorio",
  }),
];

// Estado de la app
let products = [];
let cart = []; // {id, name, unitPrice, qty}

// --- Persistencia ---
function saveState() {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
}
function loadState() {
  const p = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || "null");
  const c = JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || "null");
  products =
    Array.isArray(p) && p.length ? p.map((x) => new Product(x)) : SEED_PRODUCTS;
  cart = Array.isArray(c) ? c : [];
}

// --- Renderizado ---
function renderProducts(list) {
  const ul = $("#productList");
  ul.innerHTML = "";
  if (!list.length) {
    ul.innerHTML =
      '<li class="card"><em>No hay productos para mostrar</em></li>';
    return;
  }
  const frag = document.createDocumentFragment();
  list.forEach((prod) => {
    const li = document.createElement("li");
    li.className = "card";
    li.innerHTML = `
      <div>
        <h3>${prod.name}</h3>
        <div class="meta">
          <span class="price">${formatUYU(prod.price)}</span> · 
          <span class="badge">${prod.category}</span> · 
          <span class="badge ${prod.stock === 0 ? "danger" : ""}">Stock: ${
      prod.stock
    }</span>
        </div>
      </div>
      <div class="actions">
        <button class="btn ghost" data-action="add" data-id="${prod.id}" ${
      prod.stock === 0 ? "disabled" : ""
    }>Agregar</button>
      </div>
    `;
    frag.appendChild(li);
  });
  ul.appendChild(frag);
}

function renderCart() {
  const ul = $("#cartList");
  ul.innerHTML = "";
  if (!cart.length) {
    ul.innerHTML = '<li class="card"><em>Tu carrito está vacío</em></li>';
  } else {
    cart.forEach((item) => {
      const li = document.createElement("li");
      li.className = "card";
      li.innerHTML = `
        <div>
          <h3>${item.name}</h3>
          <div class="meta">${formatUYU(item.unitPrice)} c/u</div>
        </div>
        <div class="actions">
          <button class="btn ghost" data-action="dec" data-id="${
            item.id
          }">−</button>
          <span class="badge">${item.qty}</span>
          <button class="btn ghost" data-action="inc" data-id="${
            item.id
          }">+</button>
          <button class="btn" data-action="remove" data-id="${
            item.id
          }">Quitar</button>
        </div>
      `;
      ul.appendChild(li);
    });
  }
  // Totales
  const items = cart.reduce((acc, i) => acc + i.qty, 0);
  const total = cart.reduce((acc, i) => acc + i.qty * i.unitPrice, 0);
  $("#cartItems").textContent = items;
  $("#cartTotal").textContent = formatUYU(total);
}

function applyFilters() {
  const term = $("#searchInput").value.trim().toLowerCase();
  const sort = $("#sortSelect").value;
  let list = products.filter(
    (p) =>
      p.name.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
  );
  const sorters = {
    alphaAsc: (a, b) => a.name.localeCompare(b.name),
    alphaDesc: (a, b) => b.name.localeCompare(a.name),
    priceAsc: (a, b) => a.price - b.price,
    priceDesc: (a, b) => b.price - a.price,
  };
  list.sort(sorters[sort]);
  renderProducts(list);
}

// --- Lógica del carrito ---
function addToCart(prodId) {
  const prod = products.find((p) => p.id === prodId);
  if (!prod || prod.stock <= 0) return;
  const existing = cart.find((i) => i.id === prodId);
  if (existing) {
    if (prod.stock - existing.qty <= 0) return;
    existing.qty += 1;
  } else {
    cart.push({ id: prod.id, name: prod.name, unitPrice: prod.price, qty: 1 });
  }
  prod.stock -= 1;
  saveState();
  applyFilters();
  renderCart();
}

function changeQty(prodId, delta) {
  const item = cart.find((i) => i.id === prodId);
  const prod = products.find((p) => p.id === prodId);
  if (!item || !prod) return;
  const newQty = item.qty + delta;
  if (newQty <= 0) {
    // devolver stock y quitar
    prod.stock += item.qty;
    cart = cart.filter((i) => i.id !== prodId);
  } else {
    // verificar stock disponible
    if (delta > 0 && prod.stock <= 0) return;
    item.qty = newQty;
    prod.stock -= delta;
  }
  saveState();
  applyFilters();
  renderCart();
}

function removeFromCart(prodId) {
  const item = cart.find((i) => i.id === prodId);
  const prod = products.find((p) => p.id === prodId);
  if (!item || !prod) return;
  prod.stock += item.qty;
  cart = cart.filter((i) => i.id !== prodId);
  saveState();
  applyFilters();
  renderCart();
}

function clearCart() {
  // devolver stock
  cart.forEach((i) => {
    const p = products.find((p) => p.id === i.id);
    if (p) p.stock += i.qty;
  });
  cart = [];
  saveState();
  applyFilters();
  renderCart();
}

// --- Formulario nuevo producto ---
function handleNewProduct(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const data = Object.fromEntries(new FormData(form).entries());
  const msg = $("#formMsg");

  const name = data.name?.trim();
  const price = Number(data.price);
  const stock = Number.parseInt(data.stock, 10);
  const category = (data.category || "General").trim();

  if (!name || name.length < 2) {
    msg.textContent = "El nombre debe tener al menos 2 caracteres.";
    return;
  }
  if (!Number.isFinite(price) || price <= 0) {
    msg.textContent = "El precio debe ser un número mayor a 0.";
    return;
  }
  if (!Number.isInteger(stock) || stock < 0) {
    msg.textContent = "El stock debe ser un entero mayor o igual a 0.";
    return;
  }

  const newProd = new Product({
    id: crypto.randomUUID(),
    name,
    price,
    stock,
    category,
  });
  products.push(newProd);
  msg.textContent = "✅ Producto creado y guardado.";
  form.reset();
  saveState();
  applyFilters();
}

// --- Checkout simulado ---
function checkout() {
  if (!cart.length) {
    $("#cartMsg").textContent = "Agregá productos para continuar.";
    return;
  }
  const total = cart.reduce((acc, i) => acc + i.qty * i.unitPrice, 0);
  $("#cartMsg").textContent = `Monto total a pagar ${formatUYU(
    total
  )}. ¡Gracias!`;
  clearCart();
}

// --- Eventos / Inicio ---
function bindEvents() {
  $("#searchInput").addEventListener("input", applyFilters);
  $("#sortSelect").addEventListener("change", applyFilters);

  $("#productList").addEventListener("click", (e) => {
    const btn = e.target.closest('button[data-action="add"]');
    if (btn) addToCart(btn.dataset.id);
  });

  $("#cartList").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    if (action === "inc") changeQty(id, +1);
    if (action === "dec") changeQty(id, -1);
    if (action === "remove") removeFromCart(id);
  });

  $("#newProductForm").addEventListener("submit", handleNewProduct);
  $("#clearCartBtn").addEventListener("click", clearCart);
  $("#checkoutBtn").addEventListener("click", checkout);
}

function init() {
  loadState();
  bindEvents();
  applyFilters();
  renderCart();
}

document.addEventListener("DOMContentLoaded", init);
