const CART_URL = import.meta.env.VITE_CART_URL || 'http://localhost:8080';
export const cartApi = {
  getCart: async (userId='user-1') => {
    try { const res = await fetch(`${CART_URL}/cart/${userId}`); if(!res.ok) throw new Error(); return await res.json(); } catch { return null; }
  },
  addItem: async (userId='user-1', item) => {
    try { const res = await fetch(`${CART_URL}/cart/${userId}/items`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({bookId:item.id,title:item.title,price:item.price,quantity:1}) }); return res.ok ? await res.json() : null; } catch { return null; }
  },
  updateItem: async (userId='user-1', bookId, quantity) => {
    try { const res = await fetch(`${CART_URL}/cart/${userId}/items/${bookId}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({quantity}) }); return res.ok ? await res.json() : null; } catch { return null; }
  },
  removeItem: async (userId='user-1', bookId) => {
    try { const res = await fetch(`${CART_URL}/cart/${userId}/items/${bookId}`, {method:'DELETE'}); return res.ok; } catch { return null; }
  },
  checkout: async (userId='user-1', cartItems) => {
    try { const res = await fetch(`${CART_URL}/orders`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({userId,items:cartItems.map(i=>({bookId:i.id,quantity:i.qty,price:i.price})),total:cartItems.reduce((s,i)=>s+i.price*i.qty,0)}) }); return res.ok ? await res.json() : null; } catch { return null; }
  },
  health: async () => {
    try { const res = await fetch(`${CART_URL}/health`); return res.ok; } catch { return false; }
  }
};
