const CATALOG_URL = import.meta.env.VITE_CATALOG_URL || 'http://localhost:5000';
export const catalogApi = {
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
export const getMockBooks = () => [
  { id:1, title:"Clean Code", author:"Robert C. Martin", price:34.99, category:"Programming", rating:4.8, stock:12 },
  { id:2, title:"The Pragmatic Programmer", author:"Andrew Hunt", price:45.99, category:"Programming", rating:4.9, stock:8 },
  { id:3, title:"Design Patterns", author:"Gang of Four", price:54.99, category:"Architecture", rating:4.7, stock:5 },
  { id:4, title:"You Don't Know JS", author:"Kyle Simpson", price:29.99, category:"JavaScript", rating:4.6, stock:15 },
  { id:5, title:"Kubernetes in Action", author:"Marko Luksa", price:59.99, category:"DevOps", rating:4.8, stock:6 },
  { id:6, title:"The DevOps Handbook", author:"Gene Kim", price:39.99, category:"DevOps", rating:4.9, stock:10 },
  { id:7, title:"Site Reliability Engineering", author:"Google SRE Team", price:49.99, category:"DevOps", rating:4.7, stock:7 },
  { id:8, title:"Refactoring", author:"Martin Fowler", price:44.99, category:"Architecture", rating:4.8, stock:9 },
];
