const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const cartCount = document.getElementById("cartCount");
const cartItemsContainer = document.getElementById("cartItems");
const subtotalElement = document.getElementById("subtotal");
const totalPriceElement = document.getElementById("totalPrice");
const checkoutBtn = document.getElementById("checkoutBtn");

const storageKey = "velvetBrewCart";
let cart = loadCart();

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const targetId = anchor.getAttribute("href");
    const target = targetId ? document.querySelector(targetId) : null;
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

document.querySelectorAll(".add-to-cart").forEach((button) => {
  button.addEventListener("click", () => {
    const id = button.dataset.id;
    const name = button.dataset.name;
    const price = Number(button.dataset.price);

    if (!cart[id]) {
      cart[id] = { id, name, price, quantity: 0 };
    }

    cart[id].quantity += 1;
    persistAndRender();

    button.textContent = "Added";
    button.disabled = true;
    setTimeout(() => {
      button.textContent = "Add to Cart";
      button.disabled = false;
    }, 700);
  });
});

cartItemsContainer.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const itemId = target.dataset.id;
  if (!itemId || !cart[itemId]) return;

  if (target.classList.contains("increase")) {
    cart[itemId].quantity += 1;
  }

  if (target.classList.contains("decrease")) {
    cart[itemId].quantity -= 1;
    if (cart[itemId].quantity <= 0) {
      delete cart[itemId];
    }
  }

  if (target.classList.contains("remove-btn")) {
    delete cart[itemId];
  }

  persistAndRender();
});

checkoutBtn.addEventListener("click", () => {
  if (Object.keys(cart).length === 0) {
    alert("Your cart is empty. Add coffee to continue.");
    return;
  }
  alert("Order placed successfully. Thank you for choosing Velvet Brew!");
  cart = {};
  persistAndRender();
});

function loadCart() {
  const storedCart = localStorage.getItem(storageKey);
  if (!storedCart) return {};
  try {
    return JSON.parse(storedCart);
  } catch {
    return {};
  }
}

function saveCart() {
  localStorage.setItem(storageKey, JSON.stringify(cart));
}

function getSubtotal() {
  return Object.values(cart).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
}

function getCartCount() {
  return Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
}

function formatPrice(value) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function renderCartItems() {
  const items = Object.values(cart);
  if (items.length === 0) {
    cartItemsContainer.innerHTML =
      '<div class="empty-cart">Your cart is empty. Add your favorite coffee.</div>';
    return;
  }

  cartItemsContainer.innerHTML = items
    .map(
      (item) => `
        <article class="cart-item">
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <p>${formatPrice(item.price)} each</p>
          </div>
          <div class="qty-controls">
            <button class="decrease" data-id="${item.id}" aria-label="Decrease quantity">-</button>
            <span>${item.quantity}</span>
            <button class="increase" data-id="${item.id}" aria-label="Increase quantity">+</button>
          </div>
          <button class="remove-btn" data-id="${item.id}" aria-label="Remove item">Remove</button>
        </article>
      `
    )
    .join("");
}

function renderTotals() {
  const subtotal = getSubtotal();
  subtotalElement.textContent = formatPrice(subtotal);
  totalPriceElement.textContent = formatPrice(subtotal);
  cartCount.textContent = String(getCartCount());
}

function persistAndRender() {
  saveCart();
  renderCartItems();
  renderTotals();
}

persistAndRender();

const revealElements = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealElements.forEach((element) => revealObserver.observe(element));
