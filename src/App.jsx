import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

const USER_ID = "user-1";
const CATEGORIES = ["All", "Fiction", "Science", "History", "Biography", "Self-Help", "Programming", "Fantasy", "Mystery", "Psychology", "Business", "Kids"];
const SORT_OPTIONS = ["Featured", "Price: Low to High", "Price: High to Low", "Rating", "Title A-Z"];
const CATALOG_URL = import.meta.env.VITE_CATALOG_URL || 'http://localhost:5000';
const CART_URL = import.meta.env.VITE_CART_URL || 'http://localhost:8080';

const catalogApi = {
  getAllBooks: async () => { try { const res = await fetch(`${CATALOG_URL}/books`); if (!res.ok) throw new Error(); return await res.json(); } catch { return getMockBooks(); } },
  health: async () => { try { const res = await fetch(`${CATALOG_URL}/health`); return res.ok; } catch { return false; } }
};
const cartApi = {
  getCart: async (userId = 'user-1') => { try { const res = await fetch(`${CART_URL}/cart/${userId}`); if (!res.ok) throw new Error(); return await res.json(); } catch { return null; } },
  addItem: async (userId = 'user-1', item) => { try { const res = await fetch(`${CART_URL}/cart/${userId}/items`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookId: item.id, title: item.title, price: item.price, quantity: 1 }) }); return res.ok ? await res.json() : null; } catch { return null; } },
  updateItem: async (userId = 'user-1', bookId, quantity) => { try { const res = await fetch(`${CART_URL}/cart/${userId}/items/${bookId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quantity }) }); return res.ok ? await res.json() : null; } catch { return null; } },
  removeItem: async (userId = 'user-1', bookId) => { try { const res = await fetch(`${CART_URL}/cart/${userId}/items/${bookId}`, { method: 'DELETE' }); return res.ok; } catch { return null; } },
  checkout: async (userId = 'user-1', cartItems) => { try { const res = await fetch(`${CART_URL}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, items: cartItems.map(i => ({ bookId: i.id, quantity: i.qty, price: i.price })), total: cartItems.reduce((s, i) => s + i.price * i.qty, 0) }) }); return res.ok ? await res.json() : null; } catch { return null; } },
  health: async () => { try { const res = await fetch(`${CART_URL}/health`); return res.ok; } catch { return false; } }
};

const getMockBooks = () => [
  { id: 1, title: "To Kill a Mockingbird", author: "Harper Lee", price: 12.99, category: "Fiction", rating: 4.8, stock: 12, isbn: "9780446310789", description: "A gripping tale of racial injustice and childhood innocence in the American South." },
  { id: 2, title: "1984", author: "George Orwell", price: 10.99, category: "Fiction", rating: 4.9, stock: 8, isbn: "9780451524935", description: "A dystopian masterpiece about totalitarianism, surveillance, and the fight for truth." },
  { id: 3, title: "The Great Gatsby", author: "F. Scott Fitzgerald", price: 9.99, category: "Fiction", rating: 4.7, stock: 5, isbn: "9780743273565", description: "A classic American novel exploring themes of wealth, class, love, and the American Dream." },
  { id: 4, title: "Pride and Prejudice", author: "Jane Austen", price: 8.99, category: "Fiction", rating: 4.8, stock: 15, isbn: "9780141439518", description: "The beloved story of Elizabeth Bennet and Mr. Darcy." },
  { id: 5, title: "The Alchemist", author: "Paulo Coelho", price: 13.99, category: "Fiction", rating: 4.7, stock: 6, isbn: "9780062315007", description: "An enchanting story about following your dreams." },
  { id: 6, title: "Brave New World", author: "Aldous Huxley", price: 11.99, category: "Fiction", rating: 4.6, stock: 9, isbn: "9780060850524", description: "A chilling vision of a future society controlled through pleasure and conditioning." },
  { id: 7, title: "The Catcher in the Rye", author: "J.D. Salinger", price: 10.99, category: "Fiction", rating: 4.5, stock: 7, isbn: "9780316769174", description: "The story of Holden Caulfield's rebellious journey through New York City." },
  { id: 8, title: "Lord of the Flies", author: "William Golding", price: 9.99, category: "Fiction", rating: 4.6, stock: 11, isbn: "9780571295715", description: "Stranded boys descend into savagery on a deserted island." },
  { id: 9, title: "A Brief History of Time", author: "Stephen Hawking", price: 14.99, category: "Science", rating: 4.7, stock: 7, isbn: "9780553380163", description: "From the Big Bang to black holes, Hawking explores the nature of the universe." },
  { id: 10, title: "The Selfish Gene", author: "Richard Dawkins", price: 13.99, category: "Science", rating: 4.7, stock: 8, isbn: "9780198788607", description: "A revolutionary view of evolution from the gene's perspective." },
  { id: 11, title: "Cosmos", author: "Carl Sagan", price: 16.99, category: "Science", rating: 4.9, stock: 6, isbn: "9780345539434", description: "A personal voyage through the universe by the legendary astronomer." },
  { id: 12, title: "The Double Helix", author: "James D. Watson", price: 12.99, category: "Science", rating: 4.5, stock: 10, isbn: "9780743216302", description: "The personal account of the discovery of the structure of DNA." },
  { id: 13, title: "Sapiens", author: "Yuval Noah Harari", price: 18.99, category: "History", rating: 4.8, stock: 10, isbn: "9780062316097", description: "A bold and captivating account of humankind's creation and evolution." },
  { id: 14, title: "Guns, Germs, and Steel", author: "Jared Diamond", price: 17.99, category: "History", rating: 4.7, stock: 8, isbn: "9780393317558", description: "Why some civilizations came to dominate others across the globe." },
  { id: 15, title: "The Silk Roads", author: "Peter Frankopan", price: 19.99, category: "History", rating: 4.6, stock: 5, isbn: "9781408839997", description: "A new history of the world through the lens of the Silk Roads trade routes." },
  { id: 16, title: "SPQR", author: "Mary Beard", price: 16.99, category: "History", rating: 4.6, stock: 9, isbn: "9781846683800", description: "A history of ancient Rome and how it shaped the modern world." },
  { id: 17, title: "The Diary of a Young Girl", author: "Anne Frank", price: 9.99, category: "Biography", rating: 4.9, stock: 14, isbn: "9780553296983", description: "The moving wartime diary of Anne Frank, hiding from the Nazis in Amsterdam." },
  { id: 18, title: "Long Walk to Freedom", author: "Nelson Mandela", price: 15.99, category: "Biography", rating: 4.9, stock: 8, isbn: "9780316548182", description: "The autobiography of Nelson Mandela, from his childhood to his presidency." },
  { id: 19, title: "Steve Jobs", author: "Walter Isaacson", price: 17.99, category: "Biography", rating: 4.7, stock: 6, isbn: "9781451648539", description: "The exclusive biography of Apple's visionary co-founder." },
  { id: 20, title: "Educated", author: "Tara Westover", price: 14.99, category: "Biography", rating: 4.8, stock: 11, isbn: "9780399590504", description: "A memoir about a woman who grows up in a survivalist family and educates herself." },
  { id: 21, title: "Atomic Habits", author: "James Clear", price: 16.99, category: "Self-Help", rating: 4.9, stock: 9, isbn: "9780735211292", description: "Tiny changes, remarkable results. How small habits create big transformations." },
  { id: 22, title: "The 7 Habits of Highly Effective People", author: "Stephen Covey", price: 15.99, category: "Self-Help", rating: 4.7, stock: 12, isbn: "9780743269513", description: "Powerful lessons in personal change for professional and personal effectiveness." },
  { id: 23, title: "Man's Search for Meaning", author: "Viktor Frankl", price: 11.99, category: "Self-Help", rating: 4.9, stock: 7, isbn: "9780807014271", description: "A Holocaust survivor's account of finding purpose amidst suffering." },
  { id: 24, title: "How to Win Friends and Influence People", author: "Dale Carnegie", price: 12.99, category: "Self-Help", rating: 4.7, stock: 10, isbn: "9780671027032", description: "The timeless classic on building meaningful relationships and influence." },
  { id: 25, title: "Clean Code", author: "Robert C. Martin", price: 34.99, category: "Programming", rating: 4.8, stock: 6, isbn: "9780132350884", description: "Essential best practices for writing clean, readable, and maintainable code." },
  { id: 26, title: "The Pragmatic Programmer", author: "Andrew Hunt", price: 45.99, category: "Programming", rating: 4.9, stock: 8, isbn: "9780135957059", description: "Your journey to mastery in software development." },
  { id: 27, title: "You Don't Know JS", author: "Kyle Simpson", price: 29.99, category: "Programming", rating: 4.6, stock: 15, isbn: "9781491924464", description: "A deep dive into the core mechanisms of JavaScript." },
  { id: 28, title: "Design Patterns", author: "Gang of Four", price: 54.99, category: "Programming", rating: 4.7, stock: 5, isbn: "9780201633610", description: "The classic catalog of 23 design patterns for object-oriented software." },
  { id: 29, title: "The Hobbit", author: "J.R.R. Tolkien", price: 11.99, category: "Fantasy", rating: 4.9, stock: 14, isbn: "9780547928227", description: "A magical adventure of Bilbo Baggins, a hobbit who joins a quest for treasure." },
  { id: 30, title: "The Name of the Wind", author: "Patrick Rothfuss", price: 13.99, category: "Fantasy", rating: 4.8, stock: 9, isbn: "9780756404741", description: "The tale of Kvothe, a legendary wizard told in his own words." },
  { id: 31, title: "A Wizard of Earthsea", author: "Ursula K. Le Guin", price: 10.99, category: "Fantasy", rating: 4.7, stock: 8, isbn: "9780547722023", description: "A young boy's journey to become a great wizard in the archipelago of Earthsea." },
  { id: 32, title: "American Gods", author: "Neil Gaiman", price: 14.99, category: "Fantasy", rating: 4.7, stock: 7, isbn: "9780380789030", description: "Old gods battle new gods in a mythic American road trip." },
  { id: 33, title: "Gone Girl", author: "Gillian Flynn", price: 13.99, category: "Mystery", rating: 4.6, stock: 11, isbn: "9780307588371", description: "A psychological thriller about a marriage gone terribly wrong." },
  { id: 34, title: "The Girl with the Dragon Tattoo", author: "Stieg Larsson", price: 14.99, category: "Mystery", rating: 4.7, stock: 8, isbn: "9780307454546", description: "A journalist and a hacker investigate a decades-old disappearance in Sweden." },
  { id: 35, title: "Big Little Lies", author: "Liane Moriarty", price: 12.99, category: "Mystery", rating: 4.6, stock: 10, isbn: "9780399167065", description: "Three women's lives intersect in a deadly schoolyard incident." },
  { id: 36, title: "In the Woods", author: "Tana French", price: 13.99, category: "Mystery", rating: 4.5, stock: 9, isbn: "9780143113492", description: "A detective investigates a murder that echoes his own traumatic past." },
  { id: 37, title: "Thinking, Fast and Slow", author: "Daniel Kahneman", price: 17.99, category: "Psychology", rating: 4.7, stock: 8, isbn: "9780374533557", description: "Reveals the two systems that drive the way we think and shape our judgments." },
  { id: 38, title: "The Power of Now", author: "Eckhart Tolle", price: 14.99, category: "Psychology", rating: 4.7, stock: 9, isbn: "9781577314806", description: "A guide to spiritual enlightenment through living in the present moment." },
  { id: 39, title: "Flow", author: "Mihaly Csikszentmihalyi", price: 15.99, category: "Psychology", rating: 4.6, stock: 7, isbn: "9780061339202", description: "The psychology of optimal experience and how to achieve it." },
  { id: 40, title: "The Body Keeps the Score", author: "Bessel van der Kolk", price: 16.99, category: "Psychology", rating: 4.8, stock: 10, isbn: "9780143127741", description: "How trauma reshapes body and brain, and the path to recovery." },
  { id: 41, title: "Zero to One", author: "Peter Thiel", price: 16.99, category: "Business", rating: 4.7, stock: 10, isbn: "9780804139021", description: "Notes on startups, or how to build the future." },
  { id: 42, title: "The Lean Startup", author: "Eric Ries", price: 17.99, category: "Business", rating: 4.6, stock: 8, isbn: "9780307887894", description: "How today's entrepreneurs use continuous innovation to create successful businesses." },
  { id: 43, title: "Good to Great", author: "Jim Collins", price: 18.99, category: "Business", rating: 4.7, stock: 7, isbn: "9780066620992", description: "Why some companies make the leap and others don't." },
  { id: 44, title: "The Innovator's Dilemma", author: "Clayton Christensen", price: 19.99, category: "Business", rating: 4.6, stock: 6, isbn: "9781633691780", description: "How great firms fail when confronted with disruptive technologies." },
  { id: 45, title: "The Very Hungry Caterpillar", author: "Eric Carle", price: 7.99, category: "Kids", rating: 4.9, stock: 20, isbn: "9780399226908", description: "A beloved children's classic about a caterpillar eating through the week." },
  { id: 46, title: "Where the Wild Things Are", author: "Maurice Sendak", price: 8.99, category: "Kids", rating: 4.9, stock: 18, isbn: "9780064431781", description: "Max's wild imagination takes him to the land of wild things." },
  { id: 47, title: "Charlotte's Web", author: "E.B. White", price: 9.99, category: "Kids", rating: 4.9, stock: 15, isbn: "9780061124952", description: "The heartwarming story of a pig named Wilbur and his friend Charlotte the spider." },
  { id: 48, title: "Matilda", author: "Roald Dahl", price: 8.99, category: "Kids", rating: 4.9, stock: 16, isbn: "9780142410370", description: "A brilliant young girl with magical powers overcomes her dreadful parents and headmistress." },
  { id: 49, title: "The Road", author: "Cormac McCarthy", price: 13.99, category: "Fiction", rating: 4.7, stock: 8, isbn: "9780307387899", description: "A father and son journey through a post-apocalyptic America." },
  { id: 50, title: "Dune", author: "Frank Herbert", price: 15.99, category: "Fantasy", rating: 4.8, stock: 9, isbn: "9780441013593", description: "An epic tale of politics, religion, and survival on a desert planet." },
  { id: 51, title: "Astrophysics for People in a Hurry", author: "Neil deGrasse Tyson", price: 13.99, category: "Science", rating: 4.7, stock: 11, isbn: "9780393609394", description: "The universe explained simply for busy modern readers." },
  { id: 52, title: "The Art of War", author: "Sun Tzu", price: 7.99, category: "History", rating: 4.8, stock: 14, isbn: "9781590302255", description: "The ancient Chinese classic on military strategy and tactics." },
  { id: 53, title: "Becoming", author: "Michelle Obama", price: 18.99, category: "Biography", rating: 4.9, stock: 10, isbn: "9781524763138", description: "An intimate memoir by the former First Lady of the United States." },
  { id: 54, title: "Deep Work", author: "Cal Newport", price: 15.99, category: "Self-Help", rating: 4.8, stock: 9, isbn: "9781455586691", description: "Rules for focused success in a distracted world." },
  { id: 55, title: "Kubernetes in Action", author: "Marko Luksa", price: 59.99, category: "Programming", rating: 4.8, stock: 6, isbn: "9781617293726", description: "A comprehensive guide to deploying containerized applications on Kubernetes." },
  { id: 56, title: "The Shadow of the Wind", author: "Carlos Ruiz Zafon", price: 13.99, category: "Mystery", rating: 4.8, stock: 8, isbn: "9780143034902", description: "A young boy discovers a mysterious book in post-war Barcelona." },
  { id: 57, title: "Quiet", author: "Susan Cain", price: 15.99, category: "Psychology", rating: 4.7, stock: 9, isbn: "9780307352149", description: "The power of introverts in a world that can't stop talking." },
  { id: 58, title: "The Hard Thing About Hard Things", author: "Ben Horowitz", price: 17.99, category: "Business", rating: 4.7, stock: 7, isbn: "9780062273208", description: "Building a business when there are no easy answers." },
  { id: 59, title: "The Lion, the Witch and the Wardrobe", author: "C.S. Lewis", price: 9.99, category: "Kids", rating: 4.9, stock: 17, isbn: "9780064404990", description: "Four children step through a wardrobe into the magical world of Narnia." },
  { id: 60, title: "Norwegian Wood", author: "Haruki Murakami", price: 12.99, category: "Fiction", rating: 4.7, stock: 8, isbn: "9780375704024", description: "A coming-of-age story set in 1960s Tokyo about love and loss." },
  { id: 61, title: "The Origin of Species", author: "Charles Darwin", price: 11.99, category: "Science", rating: 4.7, stock: 6, isbn: "9780140432053", description: "Darwin's groundbreaking theory of evolution by natural selection." },
  { id: 62, title: "Alexander Hamilton", author: "Ron Chernow", price: 19.99, category: "Biography", rating: 4.8, stock: 7, isbn: "9780143034759", description: "The definitive biography of America's most enigmatic Founding Father." },
  { id: 63, title: "The Subtle Art of Not Giving a F*ck", author: "Mark Manson", price: 14.99, category: "Self-Help", rating: 4.6, stock: 12, isbn: "9780062457714", description: "A counterintuitive approach to living a good life." },
  { id: 64, title: "Refactoring", author: "Martin Fowler", price: 44.99, category: "Programming", rating: 4.8, stock: 5, isbn: "9780134757599", description: "Improving the design of existing code step by step." },
  { id: 65, title: "The Name of the Rose", author: "Umberto Eco", price: 14.99, category: "Mystery", rating: 4.7, stock: 7, isbn: "9780156001311", description: "A medieval monk investigates a series of mysterious deaths in an Italian abbey." },
  { id: 66, title: "Influence", author: "Robert Cialdini", price: 16.99, category: "Psychology", rating: 4.8, stock: 9, isbn: "9780062937650", description: "The psychology of persuasion and how to defend against it." },
  { id: 67, title: "Shoe Dog", author: "Phil Knight", price: 17.99, category: "Business", rating: 4.8, stock: 8, isbn: "9781501135927", description: "The memoir of Nike's founder — an honest account of starting a business." },
  { id: 68, title: "Harry Potter and the Philosopher's Stone", author: "J.K. Rowling", price: 10.99, category: "Kids", rating: 4.9, stock: 20, isbn: "9780439708180", description: "A young boy discovers he is a wizard on his 11th birthday." },
  { id: 69, title: "One Hundred Years of Solitude", author: "Gabriel Garcia Marquez", price: 13.99, category: "Fiction", rating: 4.8, stock: 7, isbn: "9780060883287", description: "A multigenerational epic of the Buendía family in the mythical town of Macondo." },
  { id: 70, title: "The Martian", author: "Andy Weir", price: 13.99, category: "Science", rating: 4.8, stock: 10, isbn: "9780553418026", description: "An astronaut stranded on Mars must use science to survive." },
  { id: 71, title: "The Guns of August", author: "Barbara Tuchman", price: 16.99, category: "History", rating: 4.7, stock: 6, isbn: "9780345476098", description: "How the catastrophic decisions of August 1914 led to World War I." },
  { id: 72, title: "I Know Why the Caged Bird Sings", author: "Maya Angelou", price: 12.99, category: "Biography", rating: 4.8, stock: 9, isbn: "9780345514400", description: "Maya Angelou's account of her childhood and early years growing up in the American South." },
  { id: 73, title: "The 4-Hour Work Week", author: "Tim Ferriss", price: 15.99, category: "Self-Help", rating: 4.5, stock: 10, isbn: "9780307465351", description: "Escape the 9-5, live anywhere, and join the new rich." },
  { id: 74, title: "The DevOps Handbook", author: "Gene Kim", price: 39.99, category: "Programming", rating: 4.9, stock: 7, isbn: "9781942788003", description: "How to create world-class agility, reliability, and security in technology organizations." },
  { id: 75, title: "The Hound of the Baskervilles", author: "Arthur Conan Doyle", price: 8.99, category: "Mystery", rating: 4.8, stock: 11, isbn: "9780140437867", description: "Sherlock Holmes investigates the legend of a ghostly hound on the moors." },
  { id: 76, title: "Grit", author: "Angela Duckworth", price: 15.99, category: "Psychology", rating: 4.7, stock: 8, isbn: "9781501111105", description: "The power of passion and perseverance over talent." },
  { id: 77, title: "Thinking in Systems", author: "Donella Meadows", price: 17.99, category: "Business", rating: 4.7, stock: 6, isbn: "9781603580557", description: "A primer on systems thinking and how to apply it to complex problems." },
  { id: 78, title: "Percy Jackson and the Lightning Thief", author: "Rick Riordan", price: 9.99, category: "Kids", rating: 4.8, stock: 18, isbn: "9780786838653", description: "A young boy discovers he is the son of a Greek god." },
  { id: 79, title: "The Kite Runner", author: "Khaled Hosseini", price: 13.99, category: "Fiction", rating: 4.8, stock: 9, isbn: "9781594480003", description: "A sweeping story of fathers and sons, guilt and redemption, set in Afghanistan." },
  { id: 80, title: "The Periodic Table", author: "Primo Levi", price: 13.99, category: "Science", rating: 4.7, stock: 7, isbn: "9780805210415", description: "A memoir in which each chapter is named after a chemical element." },
  { id: 81, title: "The Crusades", author: "Thomas Asbridge", price: 18.99, category: "History", rating: 4.6, stock: 5, isbn: null, description: "A definitive history of the medieval holy wars." },
  { id: 82, title: "Open", author: "Andre Agassi", price: 15.99, category: "Biography", rating: 4.8, stock: 8, isbn: "9780307388407", description: "The brutal and inspiring autobiography of tennis legend Andre Agassi." },
  { id: 83, title: "Essentialism", author: "Greg McKeown", price: 14.99, category: "Self-Help", rating: 4.7, stock: 10, isbn: "9780804137386", description: "The disciplined pursuit of less — doing only what matters most." },
  { id: 84, title: "Site Reliability Engineering", author: "Google SRE Team", price: 49.99, category: "Programming", rating: 4.7, stock: 5, isbn: "9781491929124", description: "How Google runs production systems at massive scale." },
  { id: 85, title: "The Secret History", author: "Donna Tartt", price: 13.99, category: "Mystery", rating: 4.7, stock: 9, isbn: "9781400031702", description: "A group of classics students at a New England college unravel a dark secret." },
  { id: 86, title: "Emotional Intelligence", author: "Daniel Goleman", price: 16.99, category: "Psychology", rating: 4.7, stock: 8, isbn: "9780553383713", description: "Why emotional intelligence can matter more than IQ." },
  { id: 87, title: "The Wealth of Nations", author: "Adam Smith", price: 14.99, category: "Business", rating: 4.6, stock: 6, isbn: "9780140432084", description: "The foundational text of modern economics and capitalism." },
  { id: 88, title: "The Gruffalo", author: "Julia Donaldson", price: 7.99, category: "Kids", rating: 4.9, stock: 22, isbn: "9780333710937", description: "A mouse invents a monster called the Gruffalo — and then meets one." },
];

const getCoverUrl = (isbn, size = "M") => `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg`;

// ─── Hamburger Side Menu ──────────────────────────────────────────────────────
function SideMenu({ open, onClose, onCategorySelect, onCartOpen, onHelpOpen, storedUser, wishlistCount, cartCount, onTrending }) {
  const catIcons = { "Fiction":"📖","Science":"🔬","History":"🏛️","Biography":"👤","Self-Help":"💡","Programming":"💻","Fantasy":"🧙","Mystery":"🔍","Psychology":"🧠","Business":"💼","Kids":"🧸" };
  return (
    <>
      {open && <div className="menu-overlay" onClick={onClose} />}
      <div className={`side-menu ${open ? "open" : ""}`}>
        <div className="menu-header">
          <div className="menu-user-info">
            <div className="menu-avatar">{storedUser ? storedUser[0].toUpperCase() : "G"}</div>
            <div>
              <div className="menu-greeting">Hello, {storedUser || "sign in"}</div>
              <div className="menu-subtext">Welcome to PageTurn</div>
            </div>
          </div>
          <button className="menu-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="menu-section">
          <div className="menu-section-title">Trending</div>
          <button className="menu-item" onClick={() => { onTrending("bestsellers"); onClose(); }}>📜 Best Sellers</button>
          <button className="menu-item" onClick={() => { onTrending("new"); onClose(); }}>🆕 New Releases</button>
          <button className="menu-item" onClick={() => { onTrending("popular"); onClose(); }}>🔥 Most Popular</button>
        </div>
        <div className="menu-section">
          <div className="menu-section-title">Browse Categories</div>
          {["Fiction","Science","History","Biography","Self-Help","Programming","Fantasy","Mystery","Psychology","Business","Kids"].map(cat => (
            <button key={cat} className="menu-item" onClick={() => { onCategorySelect(cat); onClose(); }}>
              {catIcons[cat]} {cat}
            </button>
          ))}
        </div>
        <div className="menu-section">
          <div className="menu-section-title">My Account</div>
          <button className="menu-item" onClick={() => { onClose(); }}>
            ♥ Wishlist {wishlistCount > 0 && <span className="menu-badge">{wishlistCount}</span>}
          </button>
          <button className="menu-item" onClick={() => { onCartOpen(); onClose(); }}>
            🛒 Cart {cartCount > 0 && <span className="menu-badge">{cartCount}</span>}
          </button>
        </div>
        <div className="menu-section">
          <div className="menu-section-title">Help & Info</div>
          <button className="menu-item" onClick={() => { onHelpOpen(); onClose(); }}>❓ Help Centre</button>
          <button className="menu-item" onClick={onClose}>📦 Track Order</button>
        </div>
      </div>
    </>
  );
}

// ─── Book Detail Modal ────────────────────────────────────────────────────────
function BookDetailModal({ book, onClose, onAdd, adding, cartQty, wishlist, onToggleWishlist }) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const colors = ["#00d4ff", "#e94560", "#f5a623", "#a78bfa", "#34d399"];
  const color = colors[book.id % colors.length];
  const isWishlisted = wishlist.includes(book.id);
  const remaining = book.stock - cartQty;
  const outOfStock = remaining <= 0;

  const stars = (rating) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return Array.from({ length: 5 }, (_, i) =>
      i < full ? "★" : (i === full && half ? "½" : "☆")
    ).join("");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="book-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>
        <div className="modal-body">
          <div className="modal-cover" style={imgError || !book.isbn ? { background: `linear-gradient(135deg, #0f1623 0%, ${color}22 100%)`, border: `2px solid ${color}33` } : {}}>
            {book.isbn && !imgError
              ? <img src={getCoverUrl(book.isbn, "L")} alt={book.title} className={`modal-cover-img ${imgLoaded ? "loaded" : ""}`} onLoad={() => setImgLoaded(true)} onError={() => setImgError(true)} />
              : null}
            <div className="cover-fallback modal-fallback" style={{ display: (imgError || !book.isbn || !imgLoaded) ? "flex" : "none", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", background: `linear-gradient(135deg, #0f1623 0%, ${color}33 100%)` }}>
              <div className="book-spine" style={{ background: color }} />
              <p className="cover-title">{book.title}</p>
              <p className="cover-author">{book.author}</p>
            </div>
          </div>
          <div className="modal-details">
            <div className="modal-category-tag" style={{ color, borderColor: `${color}44`, background: `${color}11` }}>{book.category}</div>
            <h2 className="modal-title">{book.title}</h2>
            <p className="modal-author">by {book.author}</p>
            <div className="modal-rating-row">
              <span className="modal-stars" style={{ color: "#f5a623" }}>{stars(book.rating)}</span>
              <span className="modal-rating-num">{book.rating} / 5.0</span>
            </div>
            <p className="modal-description">{book.description}</p>
            <div className="modal-meta-grid">
              <div className="modal-meta-item"><span className="meta-label">Genre</span><span className="meta-value">{book.category}</span></div>
              <div className="modal-meta-item"><span className="meta-label">ISBN</span><span className="meta-value">{book.isbn || "N/A"}</span></div>
              <div className="modal-meta-item"><span className="meta-label">Price</span><span className="meta-value" style={{ color: "#a78bfa", fontWeight: 700 }}>£{book.price?.toFixed(2)}</span></div>
              <div className="modal-meta-item">
                <span className="meta-label">Availability</span>
                <span className={`meta-value ${outOfStock ? "out" : remaining < 5 ? "low-stock" : "in-stock"}`}>
                  {outOfStock ? "Out of Stock" : remaining < 5 ? `⚠ ${remaining} left` : `${remaining} in stock`}
                </span>
              </div>
              {cartQty > 0 && <div className="modal-meta-item"><span className="meta-label">In your cart</span><span className="meta-value">{cartQty} {cartQty === 1 ? "copy" : "copies"}</span></div>}
            </div>
            <div className="modal-actions">
              <button className={`wishlist-full-btn ${isWishlisted ? "active" : ""}`} onClick={() => onToggleWishlist(book.id)}>
                {isWishlisted ? "♥ Wishlisted" : "♡ Add to Wishlist"}
              </button>
              <button className="modal-add-btn" onClick={() => onAdd(book)} disabled={adding || outOfStock}>
                {adding ? "Adding…" : outOfStock ? "Out of Stock" : "+ Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Book Card ────────────────────────────────────────────────────────────────
function BookCard({ book, onAdd, adding, wishlist, onToggleWishlist, cartQty, onOpenDetail }) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const colors = ["#00d4ff", "#e94560", "#f5a623", "#a78bfa", "#34d399"];
  const color = colors[book.id % colors.length];
  const isWishlisted = wishlist.includes(book.id);
  const remaining = book.stock - cartQty;
  const outOfStock = remaining <= 0;

  return (
    <div className="book-card" onClick={onOpenDetail} style={{ cursor: "pointer" }}>
      <div className="book-cover" style={imgError || !book.isbn ? { background: `linear-gradient(135deg, #0f1623 0%, ${color}22 100%)`, borderBottom: `2px solid ${color}33` } : {}}>
        {book.isbn && !imgError ? <img src={getCoverUrl(book.isbn)} alt={book.title} className={`cover-img ${imgLoaded ? "loaded" : ""}`} onLoad={() => setImgLoaded(true)} onError={() => setImgError(true)} /> : null}
        <div className="cover-fallback" style={{ display: (imgError || !book.isbn || !imgLoaded) ? "flex" : "none", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", background: `linear-gradient(135deg, #0f1623 0%, ${color}33 100%)` }}><div className="book-spine" style={{ background: color }} /><p className="cover-title">{book.title}</p><p className="cover-author">{book.author}</p></div>
        <span className="book-category-tag" style={{ color, borderColor: `${color}44`, background: `${color}11` }}>{book.category}</span>
        <button className={`wishlist-btn ${isWishlisted ? "active" : ""}`} onClick={(e) => { e.stopPropagation(); onToggleWishlist(book.id); }}>{isWishlisted ? "♥" : "♡"}</button>
        <div className="cover-overlay">
          <p className="overlay-description" style={{ fontSize: "0.8rem", opacity: 0.8 }}>Tap for full details</p>
          <button className="overlay-add-btn" onClick={(e) => { e.stopPropagation(); onAdd(book); }} disabled={adding || outOfStock}>{adding ? "Adding…" : outOfStock ? "Out of Stock" : "+ Add to Cart"}</button>
        </div>
      </div>
      <div className="book-info">
        <div className="book-title-row"><p className="book-title">{book.title}</p><p className="book-author">{book.author}</p></div>
        <div className="book-meta">
          <span className="book-rating">★ {book.rating}</span>
          {book.stock !== undefined && <span className={`book-stock ${outOfStock ? "low" : remaining < 5 ? "low" : ""}`}>{outOfStock ? "Out of Stock" : remaining < 5 ? `⚠ ${remaining} left` : `${remaining} in stock`}</span>}
        </div>
        <div className="book-footer">
          <span className="book-price">£{book.price?.toFixed(2)}</span>
          <button className="add-btn" onClick={(e) => { e.stopPropagation(); onAdd(book); }} disabled={adding || outOfStock}>{adding ? "Adding…" : outOfStock ? "Out of Stock" : "+ Cart"}</button>
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
        <div className="cart-header"><h2>🛒 Your Cart</h2><button className="close-btn" onClick={onClose}>✕</button></div>
        {cart.length === 0 ? (<div className="cart-empty"><span className="empty-icon">📦</span><p>Your cart is empty</p><small>Add some books to get started</small></div>) : (
          <><div className="cart-items">{cart.map(item => (<div className="cart-item" key={item.id}><div className="cart-item-info"><p className="cart-item-title">{item.title}</p><p className="cart-item-author">{item.author}</p><p className="cart-item-subtotal">£{(item.price * item.qty).toFixed(2)}</p></div><div className="cart-item-controls"><button onClick={() => onUpdate(item.id, item.qty - 1)}>−</button><span>{item.qty}</span><button onClick={() => onUpdate(item.id, item.qty + 1)}>+</button><button className="remove-btn" onClick={() => onRemove(item.id)}>🗑</button></div></div>))}</div>
          <div className="cart-footer"><div className="cart-total"><span>Total ({cart.reduce((s, i) => s + i.qty, 0)} items)</span><strong>£{total.toFixed(2)}</strong></div><button className="checkout-btn" onClick={onCheckout} disabled={checking}>{checking ? "Processing…" : "Checkout →"}</button></div></>
        )}
      </aside>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const navigate = useNavigate();
  const storedUser = JSON.parse(sessionStorage.getItem('pt_user') || '{}');
  const userName = storedUser?.name || "User";

  const [books, setBooks] = useState([]);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Featured");
  const [toast, setToast] = useState(null);
  const [addingId, setAddingId] = useState(null);
  const [checking, setChecking] = useState(false);
  const [services, setServices] = useState({ catalog: false, cart: false });
  const [activeTab, setActiveTab] = useState("shop");
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [trending, setTrending] = useState(null);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const handleLogout = () => { sessionStorage.removeItem('pt_user'); navigate('/login'); };
  const handleLogoutRequest = () => setLogoutConfirm(true);
  const handleHelpOpen = () => navigate('/help');

  useEffect(() => { Promise.all([catalogApi.health(), cartApi.health()]).then(([catalog, cart]) => setServices({ catalog, cart })); }, []);
  useEffect(() => {
    setLoading(true);
    catalogApi.getAllBooks().then(data => { const unique = Array.from(new Map(data.map(b => [b.id, b])).values()); setBooks(unique); }).catch(() => showToast("Could not reach Catalog Service", "error")).finally(() => setLoading(false));
  }, []);
  useEffect(() => { cartApi.getCart(USER_ID).then(data => { if (data?.items) setCart(data.items.map(i => ({ id: i.bookId, title: i.title, price: i.price, qty: i.quantity, author: i.author || "" }))); }); }, []);

  const handleAdd = useCallback(async (book) => {
    const cartItem = cart.find(i => i.id === book.id);
    const currentQty = cartItem ? cartItem.qty : 0;
    if (currentQty >= book.stock) {
      showToast(`No more copies available for "${book.title}"`, "error");
      return;
    }
    setAddingId(book.id);
    setCart(prev => { const existing = prev.find(i => i.id === book.id); if (existing) return prev.map(i => i.id === book.id ? { ...i, qty: i.qty + 1 } : i); return [...prev, { ...book, qty: 1 }]; });
    await cartApi.addItem(USER_ID, book);
    showToast(`"${book.title}" added to cart!`);
    setAddingId(null);
  }, [cart]);

  const handleRemove = useCallback(async (id) => { setCart(prev => prev.filter(i => i.id !== id)); await cartApi.removeItem(USER_ID, id); }, []);
  const handleUpdate = useCallback(async (id, qty) => { if (qty < 1) return handleRemove(id); setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i)); await cartApi.updateItem(USER_ID, id, qty); }, [handleRemove]);
  const handleCheckout = async () => {
    setChecking(true);
    const result = await cartApi.checkout(USER_ID, cart);
    if (result !== null) { showToast("🎉 Order placed successfully!"); setCart([]); setCartOpen(false); }
    else showToast("Checkout failed — Cart Service offline", "error");
    setChecking(false);
  };
  const handleToggleWishlist = (id) => setWishlist(prev => prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]);

  const filtered = books.filter(b => {
    const matchCat = category === "All" || b.category === category;
    const matchSearch = b.title?.toLowerCase().includes(search.toLowerCase()) || b.author?.toLowerCase().includes(search.toLowerCase());
    const matchWishlist = activeTab === "wishlist" ? wishlist.includes(b.id) : true;
    return matchCat && matchSearch && matchWishlist;
  }).sort((a, b) => {
    if (trending === "bestsellers") return b.rating - a.rating;
    if (trending === "popular") return b.rating - a.rating;
    if (trending === "new") return b.id - a.id;
    if (sort === "Price: Low to High") return a.price - b.price;
    if (sort === "Price: High to Low") return b.price - a.price;
    if (sort === "Rating") return b.rating - a.rating;
    if (sort === "Title A-Z") return a.title.localeCompare(b.title);
    return 0;
  }).slice(0, trending === "bestsellers" ? 10 : trending === "popular" ? 10 : trending === "new" ? 10 : undefined);

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="app">
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} onCategorySelect={(cat) => { setCategory(cat); setActiveTab("shop"); setTrending(null); }} onCartOpen={() => setCartOpen(true)} onHelpOpen={handleHelpOpen} storedUser={userName} wishlistCount={wishlist.length} cartCount={totalItems}
        onTrending={(t) => { setTrending(t); setCategory("All"); setActiveTab("shop"); setSearch(""); }}
      />

      <nav className="navbar">
        <div className="nav-left">
          <button className="hamburger-btn" onClick={() => setMenuOpen(true)}><span></span><span></span><span></span></button>
          <div className="nav-logo" style={{ cursor: "pointer" }} onClick={() => { setActiveTab("shop"); setCategory("All"); }}>📜 <span>PageTurn</span></div>
        </div>
        <input className="search-input" placeholder="Search books or authors…" value={search} onChange={e => { setSearch(e.target.value); setActiveTab("shop"); setTrending(null); }} />
        <div className="nav-right">
          <button className={`nav-tab-btn ${activeTab === "shop" ? "active" : ""}`} onClick={() => setActiveTab("shop")}>🏠 Shop</button>
          <button className={`nav-tab-btn wishlist-tab ${activeTab === "wishlist" ? "active" : ""}`} onClick={() => setActiveTab("wishlist")}>♥ Wishlist {wishlist.length > 0 && <span className="nav-badge">{wishlist.length}</span>}</button>
          <button className="cart-btn" onClick={() => setCartOpen(true)}>🛒 Cart {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}</button>
          <button className="help-btn" onClick={handleHelpOpen}>Help</button>
          <div className="user-pill">
            <div className="user-avatar">{userName[0].toUpperCase()}</div>
            <span className="user-name">{userName}</span>
            <button className="logout-btn" onClick={handleLogoutRequest} title="Sign out">⏻</button>
          </div>
        </div>
      </nav>

      {activeTab === "shop" && (
        <section className="hero">
          <div className="hero-text">
            <h1>Find your next <span className="accent">great read</span></h1>
            <p className="hero-sub">Books for every age, genre and taste 📜</p>
          </div>
          <div className="hero-stats">
            <div className="stat"><span>100+</span><label>Books</label></div>
            <div className="stat"><span>15</span><label>Genres</label></div>
          </div>
        </section>
      )}

      <div className="controls-bar">
        <div className="category-bar">{CATEGORIES.map(cat => (<button key={cat} className={`cat-btn ${category === cat ? "active" : ""}`} onClick={() => { setCategory(cat); setActiveTab("shop"); setTrending(null); }}>{cat}</button>))}</div>
        <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>{SORT_OPTIONS.map(s => <option key={s} value={s}>{s === "Featured" ? "Sort: Featured" : s}</option>)}</select>
      </div>

      <main className="catalog">
        <div className="catalog-header">
          <h2>
            {trending === "bestsellers" ? "⭐ Best Sellers"
              : trending === "new" ? "🆕 New Releases"
              : trending === "popular" ? "🔥 Most Popular"
              : activeTab === "wishlist" ? "❤️ My Wishlist"
              : category === "All" ? "All Books" : category}
            {trending && <button onClick={() => setTrending(null)} style={{ marginLeft: "1rem", fontSize: "0.75rem", background: "#1a1f35", border: "1px solid #334", color: "#aaa", borderRadius: "20px", padding: "3px 12px", cursor: "pointer" }}>✕ Clear</button>}
          </h2>
        </div>
        {loading ? (<div className="loading-grid">{[...Array(8)].map((_, i) => <div key={i} className="skeleton" />)}</div>) : (
          <div className="book-grid">
            {filtered.map(book => (
              <BookCard
                key={book.id}
                book={book}
                onAdd={handleAdd}
                adding={addingId === book.id}
                wishlist={wishlist}
                onToggleWishlist={handleToggleWishlist}
                cartQty={cart.find(i => i.id === book.id)?.qty || 0}
                onOpenDetail={() => setSelectedBook(book)}
              />
            ))}
            {filtered.length === 0 && <div className="no-results">{activeTab === "wishlist" ? "No books in wishlist yet!" : `No books found for "${search}"`}</div>}
          </div>
        )}
      </main>

      {logoutConfirm && (
        <div className="modal-overlay" onClick={() => setLogoutConfirm(false)}>
          <div className="book-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div style={{ padding: "2rem", textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⏻</div>
              <h2 style={{ color: "#fff", marginBottom: "0.5rem", fontSize: "1.3rem" }}>Sign out of PageTurn?</h2>
              <p style={{ color: "#8899aa", fontSize: "0.85rem", marginBottom: "2rem" }}>
                You'll need to sign back in to access your cart and wishlist.
              </p>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  onClick={() => setLogoutConfirm(false)}
                  style={{ flex: 1, padding: "0.75rem", borderRadius: "10px", border: "1px solid #334", background: "none", color: "#ccd", cursor: "pointer", fontSize: "0.95rem", fontWeight: 600 }}
                >
                  No, stay
                </button>
                <button
                  onClick={handleLogout}
                  style={{ flex: 1, padding: "0.75rem", borderRadius: "10px", border: "none", background: "#e94560", color: "#fff", cursor: "pointer", fontSize: "0.95rem", fontWeight: 600 }}
                >
                  Yes, sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onAdd={handleAdd}
          adding={addingId === selectedBook.id}
          cartQty={cart.find(i => i.id === selectedBook.id)?.qty || 0}
          wishlist={wishlist}
          onToggleWishlist={handleToggleWishlist}
        />
      )}
      {cartOpen && <CartSidebar cart={cart} onClose={() => setCartOpen(false)} onUpdate={handleUpdate} onRemove={handleRemove} onCheckout={handleCheckout} checking={checking} />}
      <section className="social-banner">
        <div className="social-banner-left">
          <h2 className="social-banner-title">Follow <span className="social-banner-accent">PageTurn</span></h2>
          <p className="social-banner-sub">Stay updated with new arrivals, reading recommendations and exclusive deals</p>
        </div>
        <div className="social-banner-cards">
          {[
            { name: "Instagram", handle: "@pageturn", url: "https://instagram.com/pageturn", svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> },
            { name: "Twitter / X", handle: "@pageturn", url: "https://twitter.com/pageturn", svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
            { name: "Facebook", handle: "/pageturn", url: "https://facebook.com/pageturn", svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
            { name: "LinkedIn", handle: "/pageturn", url: "https://linkedin.com/company/pageturn", svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
          ].map(s => (
            <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="social-card">
              <div className="social-card-icon">{s.svg}</div>
              <p className="social-card-name">{s.name}</p>
              <p className="social-card-handle">{s.handle}</p>
            </a>
          ))}
        </div>
      </section>

      <footer className="footer">
        <div>PageTurn © 2025 · Books for every age, genre and taste 📜</div>
        <div className="footer-socials">
          <a href="https://instagram.com/pageturn" target="_blank" rel="noopener noreferrer" className="social-link" title="Instagram">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </a>
          <a href="https://facebook.com/pageturn" target="_blank" rel="noopener noreferrer" className="social-link" title="Facebook">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <a href="https://twitter.com/pageturn" target="_blank" rel="noopener noreferrer" className="social-link" title="X (Twitter)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="https://linkedin.com/company/pageturn" target="_blank" rel="noopener noreferrer" className="social-link" title="LinkedIn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
        </div>
      </footer>
    </div>
  );
}