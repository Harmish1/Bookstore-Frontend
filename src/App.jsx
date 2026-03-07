import { useState, useEffect, useCallback } from "react";
import "./App.css";

const USER_ID = "user-1";
const CATEGORIES = ["All", "Programming", "DevOps", "Architecture", "JavaScript"];
const SORT_OPTIONS = ["Featured", "Price: Low to High", "Price: High to Low", "Rating", "Title A-Z"];

const CATALOG_URL = import.meta.env.VITE_CATALOG_URL || 'http://localhost:5000';
const CART_URL = import.meta.env.VITE_CART_URL || 'http://localhost:8080';

// ─── APIs ─────────────────────────────────────────────────────────────────────
const catalogApi = {
  getAllBooks: async () => {
    try {
      const res = await fetch(`${CATALOG_URL}/books`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch { return getMockBooks(); }
  },
  health: async () => {
    try { const res = await fetch(`${CATALOG_URL}/health`); return res.ok; } catch { return false; }
  }
};

const cartApi = {
  getCart: async (userId = 'user-1') => {
    try { const res = await fetch(`${CART_URL}/cart/${userId}`); if (!res.ok) throw new Error(); return await res.json(); } catch { return null; }
  },
  addItem: async (userId = 'user-1', item) => {
    try { const res = await fetch(`${CART_URL}/cart/${userId}/items`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookId: item.id, title: item.title, price: item.price, quantity: 1 }) }); return res.ok ? await res.json() : null; } catch { return null; }
  },
  updateItem: async (userId = 'user-1', bookId, quantity) => {
    try { const res = await fetch(`${CART_URL}/cart/${userId}/items/${bookId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quantity }) }); return res.ok ? await res.json() : null; } catch { return null; }
  },
  removeItem: async (userId = 'user-1', bookId) => {
    try { const res = await fetch(`${CART_URL}/cart/${userId}/items/${bookId}`, { method: 'DELETE' }); return res.ok; } catch { return null; }
  },
  checkout: async (userId = 'user-1', cartItems) => {
    try { const res = await fetch(`${CART_URL}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, items: cartItems.map(i => ({ bookId: i.id, quantity: i.qty, price: i.price })), total: cartItems.reduce((s, i) => s + i.price * i.qty, 0) }) }); return res.ok ? await res.json() : null; } catch { return null; }
  },
  health: async () => {
    try { const res = await fetch(`${CART_URL}/health`); return res.ok; } catch { return false; }
  }
};

const getMockBooks = () => [
  { id: 1, title: "Clean Code", author: "Robert C. Martin", price: 34.99, category: "Programming", rating: 4.8, stock: 12, isbn: "9780132350884", description: "A handbook of agile software craftsmanship. Teaches best practices for writing clean, readable, and maintainable code through practical examples and case studies." },
  { id: 2, title: "The Pragmatic Programmer", author: "Andrew Hunt", price: 45.99, category: "Programming", rating: 4.9, stock: 8, isbn: "9780135957059", description: "Your journey to mastery. Covers topics from personal responsibility and career development to architectural techniques for keeping your code flexible and easy to adapt." },
  { id: 3, title: "Design Patterns", author: "Gang of Four", price: 54.99, category: "Architecture", rating: 4.7, stock: 5, isbn: "9780201633610", description: "The classic catalog of 23 design patterns for object-oriented software. An essential reference for every software engineer building scalable, reusable systems." },
  { id: 4, title: "You Don't Know JS", author: "Kyle Simpson", price: 29.99, category: "JavaScript", rating: 4.6, stock: 15, isbn: "9781491924464", description: "A deep dive into the core mechanisms of JavaScript. Dispels common myths and misconceptions, helping developers write more reliable and performant code." },
  { id: 5, title: "Kubernetes in Action", author: "Marko Luksa", price: 59.99, category: "DevOps", rating: 4.8, stock: 6, isbn: "9781617293726", description: "A comprehensive guide to deploying and managing containerized applications on Kubernetes. Covers clusters, pods, services, and real-world deployment strategies." },
  { id: 6, title: "The DevOps Handbook", author: "Gene Kim", price: 39.99, category: "DevOps", rating: 4.9, stock: 10, isbn: "9781942788003", description: "How to create world-class agility, reliability, and security in technology organizations. The definitive guide for transforming your development and operations pipeline." },
  { id: 7, title: "Site Reliability Engineering", author: "Google SRE Team", price: 49.99, category: "DevOps", rating: 4.7, stock: 7, isbn: "9781491929124", description: "How Google runs production systems. Reveals the practices and tools that keep Google's services reliable, scalable, and efficient at massive scale." },
  { id: 8, title: "Refactoring", author: "Martin Fowler", price: 44.99, category: "Architecture", rating: 4.8, stock: 9, isbn: "9780134757599", description: "Improving the design of existing code. A step-by-step guide to refactoring techniques that help you make code easier to understand and cheaper to modify." },
];

// ─── Open Library Cover URL ───────────────────────────────────────────────────
const getCoverUrl = (isbn, size = "M") =>
  `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg`;

// ─── Service Status Badge ─────────────────────────────────────────────────────
function ServiceBadge({ name, online }) {
  return (
    <div className={`service-badge ${online ? "online" : "offline"}`}>
      <span className="badge-dot" />
      {name}: {online ? "Online" : "Offline"}
    </div>
  );
}

// ─── Book Card ────────────────────────────────────────────────────────────────
function BookCard({ book, onAdd, adding, wishlist, onToggleWishlist }) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const colors = ["#00d4ff", "#e94560", "#f5a623", "#a78bfa", "#34d399"];
  const color = colors[book.id % colors.length];
  const isWishlisted = wishlist.includes(book.id);

  return (
    <div className="book-card">
      <div className="book-cover" style={imgError || !book.isbn
        ? { background: `linear-gradient(135deg, #0f1623 0%, ${color}22 100%)`, borderBottom: `2px solid ${color}33` }
        : {}
      }>
        {/* Real cover image */}
        {book.isbn && !imgError ? (
          <img
            src={getCoverUrl(book.isbn)}
            alt={book.title}
            className={`cover-img ${imgLoaded ? "loaded" : ""}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        ) : null}

        {/* Fallback gradient cover */}
        {(imgError || !book.isbn || !imgLoaded) && (
          <div className="cover-fallback">
            <div className="book-spine" style={{ background: color }} />
            <p className="cover-title">{book.title}</p>
            <p className="cover-author">{book.author}</p>
          </div>
        )}

        {/* Category tag */}
        <span className="book-category-tag" style={{ color, borderColor: `${color}44`, background: `${color}11` }}>
          {book.category}
        </span>

        {/* Wishlist button */}
        <button
          className={`wishlist-btn ${isWishlisted ? "active" : ""}`}
          onClick={(e) => { e.stopPropagation(); onToggleWishlist(book.id); }}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          {isWishlisted ? "♥" : "♡"}
        </button>

        {/* Hover overlay */}
        <div className="cover-overlay">
          <p className="overlay-description">{book.description}</p>
          <button
            className="overlay-add-btn"
            onClick={() => onAdd(book)}
            disabled={adding || book.stock === 0}
          >
            {adding ? "Adding…" : book.stock === 0 ? "Out of Stock" : "+ Add to Cart"}
          </button>
        </div>
      </div>

      <div className="book-info">
        <div className="book-title-row">
          <p className="book-title">{book.title}</p>
          <p className="book-author">{book.author}</p>
        </div>
        <div className="book-meta">
          <span className="book-rating">★ {book.rating}</span>
          {book.stock !== undefined && (
            <span className={`book-stock ${book.stock < 5 ? "low" : ""}`}>
              {book.stock < 5 ? `⚠ ${book.stock} left` : `${book.stock} in stock`}
            </span>
          )}
        </div>
        <div className="book-footer">
          <span className="book-price">£{book.price?.toFixed(2)}</span>
          <button
            className="add-btn"
            onClick={() => onAdd(book)}
            disabled={adding || book.stock === 0}
          >
            {adding ? "Adding…" : book.stock === 0 ? "Out of Stock" : "+ Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Cart Sidebar ─────────────────────────────────────────────────────────────
function CartSidebar({ cart, onClose, onUpdate, onRemove, onCheckout, checking }) {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  return (
    <div className="cart-overlay" onClick={onClose}>
      <aside className="cart-sidebar" onClick={e => e.stopPropagation()}>
        <div className="cart-header">
          <h2>🛒 Your Cart</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        {cart.length === 0 ? (
          <div className="cart-empty">
            <span className="empty-icon">📦</span>
            <p>Your cart is empty</p>
            <small>Add some books to get started</small>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map(item => (
                <div className="cart-item" key={item.id}>
                  <div className="cart-item-info">
                    <p className="cart-item-title">{item.title}</p>
                    <p className="cart-item-author">{item.author}</p>
                    <p className="cart-item-subtotal">£{(item.price * item.qty).toFixed(2)}</p>
                  </div>
                  <div className="cart-item-controls">
                    <button onClick={() => onUpdate(item.id, item.qty - 1)}>−</button>
                    <span>{item.qty}</span>
                    <button onClick={() => onUpdate(item.id, item.qty + 1)}>+</button>
                    <button className="remove-btn" onClick={() => onRemove(item.id)} title="Remove">🗑</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-footer">
              <div className="cart-total">
                <span>Total ({cart.reduce((s, i) => s + i.qty, 0)} items)</span>
                <strong>£{total.toFixed(2)}</strong>
              </div>
              <button className="checkout-btn" onClick={onCheckout} disabled={checking}>
                {checking ? "Processing…" : "Checkout →"}
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [books, setBooks] = useState([]);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Featured");
  const [toast, setToast] = useState(null);
  const [addingId, setAddingId] = useState(null);
  const [checking, setChecking] = useState(false);
  const [services, setServices] = useState({ catalog: false, cart: false });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    Promise.all([catalogApi.health(), cartApi.health()]).then(([catalog, cart]) => {
      setServices({ catalog, cart });
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    catalogApi.getAllBooks()
      .then(data => {
        // Deduplicate by id
        const unique = Array.from(new Map(data.map(b => [b.id, b])).values());
        setBooks(unique);
      })
      .catch(() => showToast("Could not reach Catalog Service", "error"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    cartApi.getCart(USER_ID).then(data => {
      if (data?.items) {
        setCart(data.items.map(i => ({
          id: i.bookId, title: i.title, price: i.price, qty: i.quantity, author: i.author || ""
        })));
      }
    });
  }, []);

  const handleAdd = useCallback(async (book) => {
    setAddingId(book.id);
    setCart(prev => {
      const existing = prev.find(i => i.id === book.id);
      if (existing) return prev.map(i => i.id === book.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...book, qty: 1 }];
    });
    await cartApi.addItem(USER_ID, book);
    showToast(`"${book.title}" added to cart!`);
    setAddingId(null);
  }, []);

  const handleUpdate = useCallback(async (id, qty) => {
    if (qty < 1) return handleRemove(id);
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
    await cartApi.updateItem(USER_ID, id, qty);
  }, []);

  const handleRemove = useCallback(async (id) => {
    setCart(prev => prev.filter(i => i.id !== id));
    await cartApi.removeItem(USER_ID, id);
  }, []);

  const handleCheckout = async () => {
    setChecking(true);
    const result = await cartApi.checkout(USER_ID, cart);
    if (result !== null) {
      showToast("🎉 Order placed successfully!");
      setCart([]);
      setCartOpen(false);
    } else {
      showToast("Checkout failed — Cart Service offline", "error");
    }
    setChecking(false);
  };

  const handleToggleWishlist = (id) => {
    setWishlist(prev =>
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    );
  };

  // Filter + sort
  const filtered = books
    .filter(b => {
      const matchCat = category === "All" || b.category === category;
      const matchSearch = b.title?.toLowerCase().includes(search.toLowerCase()) ||
        b.author?.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sort === "Price: Low to High") return a.price - b.price;
      if (sort === "Price: High to Low") return b.price - a.price;
      if (sort === "Rating") return b.rating - a.rating;
      if (sort === "Title A-Z") return a.title.localeCompare(b.title);
      return 0;
    });

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="app">
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

      <nav className="navbar">
        <div className="nav-left">
          <div className="nav-logo">📚 <span>BookVault</span></div>
          <div className="service-badges">
            <ServiceBadge name="Catalog" online={services.catalog} />
            <ServiceBadge name="Cart" online={services.cart} />
          </div>
        </div>
        <input
          className="search-input"
          placeholder="Search books or authors…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button className="cart-btn" onClick={() => setCartOpen(true)}>
          🛒 Cart {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
        </button>
      </nav>

      <section className="hero">
        <div className="hero-text">
          <p className="hero-eyebrow">CSC8113 · Microservices Bookstore</p>
          <h1>Find your next <span className="accent">great read</span></h1>
          <p className="hero-sub">Powered by Flask Catalog Service · Spring Boot Cart Service · PostgreSQL</p>
        </div>
        <div className="hero-stats">
          <div className="stat"><span>{books.length || "8"}+</span><label>Books</label></div>
          <div className="stat"><span>3</span><label>Services</label></div>
          <div className="stat"><span>K8s</span><label>Deployed</label></div>
        </div>
      </section>

      <div className="controls-bar">
        <div className="category-bar">
          {CATEGORIES.map(cat => (
            <button key={cat} className={`cat-btn ${category === cat ? "active" : ""}`} onClick={() => setCategory(cat)}>
              {cat}
            </button>
          ))}
        </div>
        <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
          {SORT_OPTIONS.map(s => <option key={s} value={s}>{s === "Featured" ? "Sort: Featured" : s}</option>)}
        </select>
      </div>

      <main className="catalog">
        <div className="catalog-header">
          <h2>{category === "All" ? "All Books" : category} <span className="count">({filtered.length} found)</span></h2>
          {!services.catalog && (
            <p className="offline-notice">⚠ Catalog Service offline — showing demo data</p>
          )}
        </div>

        {loading ? (
          <div className="loading-grid">
            {[...Array(8)].map((_, i) => <div key={i} className="skeleton" />)}
          </div>
        ) : (
          <div className="book-grid">
            {filtered.map(book => (
              <BookCard
                key={book.id}
                book={book}
                onAdd={handleAdd}
                adding={addingId === book.id}
                wishlist={wishlist}
                onToggleWishlist={handleToggleWishlist}
              />
            ))}
            {filtered.length === 0 && (
              <div className="no-results">No books found for "{search}"</div>
            )}
          </div>
        )}
      </main>

      {cartOpen && (
        <CartSidebar
          cart={cart}
          onClose={() => setCartOpen(false)}
          onUpdate={handleUpdate}
          onRemove={handleRemove}
          onCheckout={handleCheckout}
          checking={checking}
        />
      )}

      <footer className="footer">
        BookVault © 2025 · CSC8113 DevOps Project · React + Vite + Kubernetes
      </footer>
    </div>
  );
}