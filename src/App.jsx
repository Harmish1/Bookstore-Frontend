import { useState, useEffect, useCallback } from "react";
import "./App.css";
import HelpCentre from "./HelpCentre";

const USER_ID = "user-1";
const CATEGORIES = ["All", "Fiction", "Science", "History", "Biography", "Self-Help", "Programming", "Fantasy", "Mystery", "Psychology", "Business", "Kids"];
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
  // Fiction
  { id: 1,  title: "To Kill a Mockingbird",            author: "Harper Lee",              price: 12.99, category: "Fiction",      rating: 4.9, stock: 20, isbn: "9780446310789", description: "A gripping tale of racial injustice and the loss of innocence in the American South, seen through the eyes of young Scout Finch." },
  { id: 2,  title: "1984",                              author: "George Orwell",            price: 10.99, category: "Fiction",      rating: 4.8, stock: 18, isbn: "9780451524935", description: "A dystopian masterpiece about surveillance, totalitarianism, and the terrifying power of a government that controls reality itself." },
  { id: 3,  title: "The Great Gatsby",                  author: "F. Scott Fitzgerald",      price: 9.99,  category: "Fiction",      rating: 4.5, stock: 15, isbn: "9780743273565", description: "A glittering portrait of the Jazz Age, wealth, and the elusive American Dream through the mysterious millionaire Jay Gatsby." },
  { id: 4,  title: "Pride and Prejudice",               author: "Jane Austen",              price: 8.99,  category: "Fiction",      rating: 4.7, stock: 22, isbn: "9780679783268", description: "A witty and romantic story of Elizabeth Bennet navigating love, class, and family in Regency-era England." },
  { id: 5,  title: "The Alchemist",                     author: "Paulo Coelho",             price: 13.99, category: "Fiction",      rating: 4.6, stock: 25, isbn: "9780061122415", description: "An enchanting fable about a young shepherd's journey to find treasure and discover his personal legend." },
  { id: 6,  title: "The Catcher in the Rye",            author: "J.D. Salinger",            price: 11.99, category: "Fiction",      rating: 4.3, stock: 14, isbn: "9780316769174", description: "The rebellious, moving story of Holden Caulfield navigating adolescence and alienation in New York City." },
  { id: 7,  title: "Brave New World",                   author: "Aldous Huxley",            price: 11.99, category: "Fiction",      rating: 4.5, stock: 16, isbn: "9780060850524", description: "A chilling vision of a future society controlled by pleasure, conditioning and technological power." },
  { id: 8,  title: "The Kite Runner",                   author: "Khaled Hosseini",          price: 13.99, category: "Fiction",      rating: 4.7, stock: 20, isbn: "9781594631931", description: "A powerful story of friendship, betrayal and redemption set against the backdrop of Afghanistan's turbulent history." },
  { id: 9,  title: "The Handmaid's Tale",               author: "Margaret Atwood",          price: 13.99, category: "Fiction",      rating: 4.6, stock: 16, isbn: "9780385490818", description: "A dystopian vision of a totalitarian society where women are stripped of rights and reduced to their fertility." },
  { id: 10, title: "Crime and Punishment",              author: "Fyodor Dostoevsky",        price: 12.99, category: "Fiction",      rating: 4.7, stock: 10, isbn: "9780486415871", description: "A psychological exploration of guilt and redemption following a young man who commits a murder in St. Petersburg." },

  // Fantasy
  { id: 11, title: "Harry Potter and the Sorcerer's Stone", author: "J.K. Rowling",         price: 16.99, category: "Fantasy",      rating: 4.9, stock: 35, isbn: "9780439708180", description: "The magical beginning of Harry Potter's journey at Hogwarts School of Witchcraft and Wizardry." },
  { id: 12, title: "A Game of Thrones",                 author: "George R.R. Martin",       price: 18.99, category: "Fantasy",      rating: 4.7, stock: 14, isbn: "9780553573404", description: "An epic tale of warring noble families fighting for control of the Iron Throne in a world of political intrigue and dragons." },
  { id: 13, title: "Circe",                             author: "Madeline Miller",          price: 15.99, category: "Fantasy",      rating: 4.7, stock: 13, isbn: "9780316556347", description: "The story of Circe, the witch-goddess of Greek mythology, discovering her powers among gods, monsters and men." },
  { id: 14, title: "The Hitchhiker's Guide to the Galaxy", author: "Douglas Adams",         price: 11.99, category: "Fantasy",      rating: 4.8, stock: 22, isbn: "9780345391803", description: "Seconds before Earth is demolished for a bypass, Arthur Dent is swept into space on an absurd cosmic adventure." },
  { id: 15, title: "Good Omens",                        author: "Terry Pratchett",          price: 13.99, category: "Fantasy",      rating: 4.8, stock: 18, isbn: "9780060853983", description: "An angel and a demon reluctantly team up to prevent the apocalypse in this hilarious collaboration." },
  { id: 16, title: "The Name of the Wind",              author: "Patrick Rothfuss",         price: 15.99, category: "Fantasy",      rating: 4.8, stock: 10, isbn: "9780756404741", description: "The legendary story of Kvothe, a magically gifted young man who grows to be the most notorious wizard his world has ever seen." },
  { id: 17, title: "Stardust",                          author: "Neil Gaiman",              price: 12.99, category: "Fantasy",      rating: 4.6, stock: 15, isbn: "9780061142024", description: "A young man crosses a wall into a magical kingdom to retrieve a fallen star and finds far more than he bargained for." },

  // Mystery
  { id: 18, title: "Gone Girl",                         author: "Gillian Flynn",            price: 13.99, category: "Mystery",      rating: 4.5, stock: 16, isbn: "9780307588371", description: "A psychological thriller about a husband suspected of murdering his wife, told through unreliable narrators with shocking twists." },
  { id: 19, title: "The Girl with the Dragon Tattoo",   author: "Stieg Larsson",            price: 14.99, category: "Mystery",      rating: 4.6, stock: 12, isbn: "9780307454546", description: "A gripping Swedish crime thriller following a journalist and hacker investigating a decades-old family mystery." },
  { id: 20, title: "And Then There Were None",          author: "Agatha Christie",          price: 10.99, category: "Mystery",      rating: 4.8, stock: 20, isbn: "9780312330873", description: "Ten strangers are lured to an island and begin to die one by one in this masterpiece of mystery fiction." },
  { id: 21, title: "The Silent Patient",                author: "Alex Michaelides",         price: 13.99, category: "Mystery",      rating: 4.5, stock: 17, isbn: "9781250301697", description: "A famous painter shoots her husband and then never speaks again. A criminal therapist is obsessed with uncovering why." },
  { id: 22, title: "The Da Vinci Code",                 author: "Dan Brown",                price: 13.99, category: "Mystery",      rating: 4.3, stock: 22, isbn: "9780307474278", description: "A Harvard professor unravels a centuries-old conspiracy involving the Catholic Church and the Holy Grail." },
  { id: 23, title: "Big Little Lies",                   author: "Liane Moriarty",           price: 12.99, category: "Mystery",      rating: 4.4, stock: 11, isbn: "9780425274866", description: "A darkly comic tale about three women whose seemingly perfect lives unravel to reveal secrets and lies." },
  { id: 24, title: "The Thursday Murder Club",          author: "Richard Osman",            price: 13.99, category: "Mystery",      rating: 4.5, stock: 18, isbn: "9781984880819", description: "Four unlikely detectives in a retirement village take on their first real murder case with surprising results." },

  // Science
  { id: 25, title: "A Brief History of Time",           author: "Stephen Hawking",          price: 14.99, category: "Science",      rating: 4.7, stock: 18, isbn: "9780553380163", description: "Stephen Hawking's landmark exploration of the universe — from the Big Bang to black holes — made accessible to everyone." },
  { id: 26, title: "Sapiens",                           author: "Yuval Noah Harari",        price: 16.99, category: "Science",      rating: 4.8, stock: 22, isbn: "9780062316097", description: "A sweeping history of humankind from the Stone Age to the Silicon Age, exploring how biology and history shaped us." },
  { id: 27, title: "Cosmos",                            author: "Carl Sagan",               price: 15.99, category: "Science",      rating: 4.9, stock: 14, isbn: "9780345539434", description: "Carl Sagan's iconic journey through the universe, exploring the nature of life, consciousness, and humanity's place in the cosmos." },
  { id: 28, title: "The Selfish Gene",                  author: "Richard Dawkins",          price: 15.99, category: "Science",      rating: 4.6, stock: 11, isbn: "9780192860927", description: "Dawkins' landmark book argues that genes, not individuals or species, are the true units of natural selection." },
  { id: 29, title: "Why We Sleep",                      author: "Matthew Walker",           price: 15.99, category: "Science",      rating: 4.6, stock: 18, isbn: "9781501144325", description: "Groundbreaking research on the science of sleep and its profound importance for health, memory and longevity." },
  { id: 30, title: "Astrophysics for People in a Hurry", author: "Neil deGrasse Tyson",    price: 12.99, category: "Science",      rating: 4.5, stock: 20, isbn: "9780393609394", description: "A concise and witty tour of the universe's greatest mysteries, from the Big Bang to dark matter and dark energy." },
  { id: 31, title: "The Body",                          author: "Bill Bryson",              price: 16.99, category: "Science",      rating: 4.7, stock: 15, isbn: "9780385539302", description: "A remarkable guided tour of the human body — how it works, its quirks and the science that keeps it alive." },

  // History
  { id: 32, title: "Guns, Germs, and Steel",            author: "Jared Diamond",            price: 16.99, category: "History",      rating: 4.6, stock: 13, isbn: "9780393317558", description: "A Pulitzer Prize-winning account of why certain civilisations came to dominate others through geography and biology." },
  { id: 33, title: "The Diary of a Young Girl",         author: "Anne Frank",               price: 9.99,  category: "History",      rating: 4.9, stock: 25, isbn: "9780553296983", description: "The powerful diary of a Jewish girl hiding from the Nazis during World War II — one of the most moving documents of the 20th century." },
  { id: 34, title: "Homo Deus",                         author: "Yuval Noah Harari",        price: 17.99, category: "History",      rating: 4.5, stock: 11, isbn: "9780062464316", description: "A bold vision of humanity's future, exploring how data, algorithms and AI will reshape life, death and meaning." },
  { id: 35, title: "The Wright Brothers",               author: "David McCullough",         price: 15.99, category: "History",      rating: 4.7, stock: 8,  isbn: "9781476728759", description: "The dramatic story of two bicycle mechanics from Ohio who changed history by achieving the first powered flight." },

  // Biography
  { id: 36, title: "Steve Jobs",                        author: "Walter Isaacson",          price: 19.99, category: "Biography",    rating: 4.7, stock: 16, isbn: "9781451648539", description: "The exclusive biography of Apple's visionary co-founder, based on over forty interviews with Jobs himself." },
  { id: 37, title: "Becoming",                          author: "Michelle Obama",           price: 17.99, category: "Biography",    rating: 4.8, stock: 20, isbn: "9781524763138", description: "An intimate and powerful memoir by the former First Lady of the United States." },
  { id: 38, title: "Educated",                          author: "Tara Westover",            price: 14.99, category: "Biography",    rating: 4.8, stock: 19, isbn: "9780399590504", description: "A memoir about a woman who grows up in a survivalist family and educates herself to earn a PhD from Cambridge." },
  { id: 39, title: "Long Walk to Freedom",              author: "Nelson Mandela",           price: 16.99, category: "Biography",    rating: 4.9, stock: 12, isbn: "9780316548182", description: "Nelson Mandela's autobiography tracing his journey from rural South Africa to 27 years in prison to the presidency." },
  { id: 40, title: "Leonardo da Vinci",                 author: "Walter Isaacson",          price: 20.99, category: "Biography",    rating: 4.7, stock: 11, isbn: "9781501139154", description: "A compelling biography of the Renaissance genius whose extraordinary imagination changed history." },
  { id: 41, title: "Open",                              author: "Andre Agassi",             price: 15.99, category: "Biography",    rating: 4.8, stock: 10, isbn: "9780307388407", description: "Tennis legend Andre Agassi's brutally honest memoir about fame, identity and his complicated relationship with the sport." },
  { id: 42, title: "Into the Wild",                     author: "Jon Krakauer",             price: 13.99, category: "Biography",    rating: 4.5, stock: 15, isbn: "9780385486804", description: "The true story of Christopher McCandless who abandoned everything to live in the Alaskan wilderness." },
  { id: 43, title: "Wild",                              author: "Cheryl Strayed",           price: 13.99, category: "Biography",    rating: 4.5, stock: 13, isbn: "9780307592736", description: "A woman hikes over a thousand miles alone on the Pacific Crest Trail to heal her broken life." },

  // Self-Help
  { id: 44, title: "Atomic Habits",                     author: "James Clear",              price: 15.99, category: "Self-Help",    rating: 4.9, stock: 30, isbn: "9780735211292", description: "A revolutionary system for building good habits and breaking bad ones, using the power of tiny 1% improvements." },
  { id: 45, title: "The 7 Habits of Highly Effective People", author: "Stephen Covey",     price: 14.99, category: "Self-Help",    rating: 4.7, stock: 20, isbn: "9780743269513", description: "A timeless guide to personal and professional effectiveness, built on principles of fairness, integrity and human dignity." },
  { id: 46, title: "Think and Grow Rich",               author: "Napoleon Hill",            price: 11.99, category: "Self-Help",    rating: 4.6, stock: 17, isbn: "9781585424337", description: "A classic motivational book that distils the success philosophy of over 500 self-made millionaires." },
  { id: 47, title: "The Power of Now",                  author: "Eckhart Tolle",            price: 13.99, category: "Self-Help",    rating: 4.5, stock: 15, isbn: "9781577314806", description: "A guide to spiritual enlightenment, teaching how living in the present moment can transform your life." },
  { id: 48, title: "Deep Work",                         author: "Cal Newport",              price: 15.99, category: "Self-Help",    rating: 4.7, stock: 16, isbn: "9781455586691", description: "Rules for focused success in a distracted world — how to master the ability to focus without distraction." },
  { id: 49, title: "The Subtle Art of Not Giving a F*ck", author: "Mark Manson",           price: 13.99, category: "Self-Help",    rating: 4.5, stock: 24, isbn: "9780062457714", description: "A counterintuitive approach to living a good life by focusing only on what truly matters." },
  { id: 50, title: "Can't Hurt Me",                     author: "David Goggins",            price: 16.99, category: "Self-Help",    rating: 4.8, stock: 20, isbn: "9781544512280", description: "How one man overcame poverty, racism and physical abuse to become a Navy SEAL and ultra-endurance athlete." },
  { id: 51, title: "Grit",                              author: "Angela Duckworth",         price: 14.99, category: "Self-Help",    rating: 4.6, stock: 17, isbn: "9781501111105", description: "The power of passion and perseverance — why talent is less important than grit in achieving long-term goals." },
  { id: 52, title: "Mindset",                           author: "Carol Dweck",              price: 13.99, category: "Self-Help",    rating: 4.7, stock: 21, isbn: "9780345472328", description: "The groundbreaking research on the growth mindset and how it can transform your life, relationships and career." },

  // Psychology
  { id: 53, title: "Thinking, Fast and Slow",           author: "Daniel Kahneman",          price: 16.99, category: "Psychology",   rating: 4.8, stock: 19, isbn: "9780374533557", description: "Nobel laureate Daniel Kahneman reveals the two systems that drive how we think — and the biases that distort our decisions." },
  { id: 54, title: "The Psychology of Money",           author: "Morgan Housel",            price: 14.99, category: "Psychology",   rating: 4.8, stock: 22, isbn: "9780857197689", description: "Timeless lessons on wealth, greed, and happiness, showing how your mindset shapes your financial destiny." },
  { id: 55, title: "Man's Search for Meaning",          author: "Viktor Frankl",            price: 10.99, category: "Psychology",   rating: 4.9, stock: 24, isbn: "9780807014271", description: "Holocaust survivor Viktor Frankl's profound account of finding meaning in the darkest of times." },
  { id: 56, title: "Influence",                         author: "Robert Cialdini",          price: 15.99, category: "Psychology",   rating: 4.7, stock: 13, isbn: "9780061241895", description: "The classic book on the psychology of persuasion, revealing the six universal principles that guide human influence." },
  { id: 57, title: "Quiet",                             author: "Susan Cain",               price: 14.99, category: "Psychology",   rating: 4.7, stock: 17, isbn: "9780307352149", description: "The power of introverts in a world that can't stop talking — a revolutionary look at personality and society." },
  { id: 58, title: "The Body Keeps the Score",          author: "Bessel van der Kolk",      price: 16.99, category: "Psychology",   rating: 4.8, stock: 14, isbn: "9780143127741", description: "How trauma reshapes the body and brain — and innovative treatments that allow survivors to reclaim their lives." },
  { id: 59, title: "Flow",                              author: "Mihaly Csikszentmihalyi",  price: 14.99, category: "Psychology",   rating: 4.6, stock: 11, isbn: "9780061339202", description: "The psychology of optimal experience — how to achieve the state of deep enjoyment and creativity." },
  { id: 60, title: "Lost Connections",                  author: "Johann Hari",              price: 14.99, category: "Psychology",   rating: 4.6, stock: 13, isbn: "9781632868305", description: "Uncovering the real causes of depression and the unexpected solutions that go beyond medication." },

  // Business
  { id: 61, title: "Zero to One",                       author: "Peter Thiel",              price: 15.99, category: "Business",     rating: 4.7, stock: 16, isbn: "9780804139021", description: "PayPal founder Peter Thiel's unconventional guide to building companies that create entirely new things." },
  { id: 62, title: "The Lean Startup",                  author: "Eric Ries",                price: 16.99, category: "Business",     rating: 4.6, stock: 14, isbn: "9780307887894", description: "A revolutionary approach to building businesses in conditions of extreme uncertainty using validated learning." },
  { id: 63, title: "Good to Great",                     author: "Jim Collins",              price: 17.99, category: "Business",     rating: 4.6, stock: 11, isbn: "9780066620992", description: "Why some companies make the leap from good to great and others don't — based on a rigorous five-year research study." },
  { id: 64, title: "Start With Why",                    author: "Simon Sinek",              price: 14.99, category: "Business",     rating: 4.7, stock: 20, isbn: "9781591846444", description: "How great leaders inspire action by starting with the question of why — the golden circle of purpose." },
  { id: 65, title: "Never Split the Difference",        author: "Chris Voss",               price: 15.99, category: "Business",     rating: 4.8, stock: 18, isbn: "9780062407801", description: "A former FBI hostage negotiator reveals negotiating techniques that work in any situation." },
  { id: 66, title: "Shoe Dog",                          author: "Phil Knight",              price: 16.99, category: "Business",     rating: 4.8, stock: 15, isbn: "9781501135927", description: "Nike founder Phil Knight's memoir about the early years of building one of the world's most iconic brands." },
  { id: 67, title: "Rework",                            author: "Jason Fried",              price: 13.99, category: "Business",     rating: 4.5, stock: 14, isbn: "9780307463746", description: "A new way of thinking about building and running a business — ignore the rules and do less to get more." },
  { id: 68, title: "The Hard Thing About Hard Things",  author: "Ben Horowitz",             price: 16.99, category: "Business",     rating: 4.7, stock: 9,  isbn: "9780062273208", description: "Honest advice on building and running a startup from one of Silicon Valley's most respected entrepreneurs." },

  // Programming
  { id: 69, title: "Clean Code",                        author: "Robert C. Martin",         price: 34.99, category: "Programming",  rating: 4.8, stock: 12, isbn: "9780132350884", description: "A handbook of agile software craftsmanship. Teaches best practices for writing clean, readable, and maintainable code." },
  { id: 70, title: "The Pragmatic Programmer",          author: "Andrew Hunt",              price: 45.99, category: "Programming",  rating: 4.9, stock: 8,  isbn: "9780135957059", description: "Your journey to mastery. Covers topics from personal responsibility to architectural techniques for flexible, adaptable code." },
  { id: 71, title: "You Don't Know JS",                 author: "Kyle Simpson",             price: 29.99, category: "Programming",  rating: 4.6, stock: 15, isbn: "9781491924464", description: "A deep dive into the core mechanisms of JavaScript, helping developers write more reliable and performant code." },
  { id: 72, title: "Cracking the Coding Interview",     author: "Gayle Laakmann McDowell",  price: 39.99, category: "Programming",  rating: 4.7, stock: 20, isbn: "9780984782857", description: "189 programming interview questions and solutions — the essential guide for landing a job at top tech companies." },
  { id: 73, title: "Introduction to Algorithms",        author: "Thomas Cormen",            price: 59.99, category: "Programming",  rating: 4.7, stock: 9,  isbn: "9780262033848", description: "The definitive reference for algorithms — comprehensive, rigorous and widely used in universities worldwide." },

  // Kids
  { id: 74, title: "The Very Hungry Caterpillar",       author: "Eric Carle",               price: 7.99,  category: "Kids",         rating: 4.9, stock: 40, isbn: "9780399226908", description: "A beloved classic for young children following a caterpillar's journey from egg to butterfly through a feast of foods." },
  { id: 75, title: "Where the Wild Things Are",         author: "Maurice Sendak",           price: 8.99,  category: "Kids",         rating: 4.8, stock: 35, isbn: "9780064431781", description: "Young Max is sent to bed without supper and imagines sailing to a land of wild creatures who make him their king." },
  { id: 76, title: "Charlie and the Chocolate Factory", author: "Roald Dahl",               price: 9.99,  category: "Kids",         rating: 4.9, stock: 30, isbn: "9780142410318", description: "Lucky Charlie Bucket wins a golden ticket to visit Willy Wonka's magical and mysterious chocolate factory." },
  { id: 77, title: "Matilda",                           author: "Roald Dahl",               price: 9.99,  category: "Kids",         rating: 4.9, stock: 28, isbn: "9780142410370", description: "A brilliant young girl with magical powers overcomes her awful family and tyrannical headmistress Miss Trunchbull." },
  { id: 78, title: "Charlotte's Web",                   author: "E.B. White",               price: 8.99,  category: "Kids",         rating: 4.8, stock: 22, isbn: "9780064400558", description: "The story of a pig named Wilbur and his friendship with a clever spider named Charlotte who saves his life." },
  { id: 79, title: "The Lion, the Witch and the Wardrobe", author: "C.S. Lewis",            price: 9.99,  category: "Kids",         rating: 4.9, stock: 30, isbn: "9780064404990", description: "Four children step through a wardrobe into the magical world of Narnia, where they must defeat the White Witch." },
  { id: 80, title: "Diary of a Wimpy Kid",              author: "Jeff Kinney",              price: 9.99,  category: "Kids",         rating: 4.6, stock: 35, isbn: "9780810993136", description: "Greg Heffley records his middle school misadventures in a hilarious illustrated diary full of embarrassing moments." },
  { id: 81, title: "Percy Jackson and the Lightning Thief", author: "Rick Riordan",         price: 10.99, category: "Kids",         rating: 4.8, stock: 30, isbn: "9780786838653", description: "A dyslexic boy discovers he is the son of a Greek god and embarks on a quest to prevent a war between the Olympians." },
  { id: 82, title: "Wonder",                            author: "R.J. Palacio",             price: 9.99,  category: "Kids",         rating: 4.9, stock: 25, isbn: "9780375869020", description: "A boy born with a facial difference starts school for the first time and teaches his community about kindness and acceptance." },
  { id: 83, title: "The Giver",                         author: "Lois Lowry",               price: 9.99,  category: "Kids",         rating: 4.7, stock: 18, isbn: "9780544336261", description: "In a seemingly perfect community, a boy is chosen to receive memories of the past and discovers dark truths about his world." },
  { id: 84, title: "The Gruffalo",                      author: "Julia Donaldson",          price: 6.99,  category: "Kids",         rating: 4.9, stock: 45, isbn: "9780142403877", description: "A mouse invents a scary creature called the Gruffalo to frighten away predators — until the Gruffalo turns out to be real!" },
  { id: 85, title: "Goodnight Moon",                    author: "Margaret Wise Brown",      price: 6.99,  category: "Kids",         rating: 4.8, stock: 40, isbn: "9780064430173", description: "A beloved bedtime classic in which a young bunny says goodnight to everything in the room before drifting off to sleep." },
  { id: 86, title: "The Giving Tree",                   author: "Shel Silverstein",         price: 7.99,  category: "Kids",         rating: 4.7, stock: 30, isbn: "9780060256654", description: "A touching story of a tree that gives everything it has to make a boy happy throughout his life." },
  { id: 87, title: "James and the Giant Peach",         author: "Roald Dahl",               price: 8.99,  category: "Kids",         rating: 4.7, stock: 20, isbn: "9780142410363", description: "Young James escapes his horrible aunts by travelling inside a magical giant peach with a crew of friendly insects." },
  { id: 88, title: "The BFG",                           author: "Roald Dahl",               price: 9.99,  category: "Kids",         rating: 4.8, stock: 25, isbn: "9780142410387", description: "Sophie is snatched from her orphanage by the Big Friendly Giant, who captures dreams and blows them into children's windows." },
];

// ─── Cover URL — Open Library Works API (reliable) ───────────────────────────
const getCoverUrl = (isbn) =>
  `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`;

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
function BookCard({ book, onAdd, adding, wishlist, onToggleWishlist, onClick }) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const colors = ["#00d4ff", "#e94560", "#f5a623", "#a78bfa", "#34d399"];
  const color = colors[book.id % colors.length];
  const isWishlisted = wishlist.includes(book.id);

  const handleImgLoad = (e) => {
    const img = e.target;
    if (img.naturalWidth <= 1 || img.naturalHeight <= 1) setImgError(true);
    else setImgLoaded(true);
  };

  return (
    <div className="book-card" onClick={onClick}>
      <div className="book-cover" style={{ background: `linear-gradient(135deg, #0f1623 0%, ${color}22 100%)`, borderBottom: `2px solid ${color}33` }}>
        {book.isbn && !imgError && (
          <img src={getCoverUrl(book.isbn)} alt={book.title}
            className={`cover-img ${imgLoaded ? "loaded" : ""}`}
            onLoad={handleImgLoad} onError={() => setImgError(true)} />
        )}
        <div className={`cover-fallback ${imgLoaded && !imgError ? "hidden" : ""}`}>
          <div className="book-spine" style={{ background: color }} />
          <div className="cover-fallback-text">
            <p className="cover-title">{book.title}</p>
            <p className="cover-author">{book.author}</p>
          </div>
        </div>
        <span className="book-category-tag" style={{ color, borderColor: `${color}44`, background: `${color}11` }}>
          {book.category}
        </span>
        <button
          className={`wishlist-btn ${isWishlisted ? "active" : ""}`}
          onClick={(e) => { e.stopPropagation(); onToggleWishlist(book.id); }}
        >{isWishlisted ? "♥" : "♡"}</button>
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
          <button className="add-btn"
            onClick={(e) => { e.stopPropagation(); onAdd(book); }}
            disabled={adding || book.stock === 0}>
            {adding ? "Adding…" : book.stock === 0 ? "Out of Stock" : "+ Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Book Detail Modal ────────────────────────────────────────────────────────
function BookDetail({ book, onClose, onAdd, adding, wishlist, onToggleWishlist }) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [added, setAdded] = useState(false);
  const colors = ["#00d4ff", "#e94560", "#f5a623", "#a78bfa", "#34d399"];
  const color = colors[book.id % colors.length];
  const isWishlisted = wishlist.includes(book.id);

  const handleImgLoad = (e) => {
    const img = e.target;
    if (img.naturalWidth <= 1 || img.naturalHeight <= 1) setImgError(true);
    else setImgLoaded(true);
  };

  const handleAdd = () => {
    onAdd(book);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const stars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < Math.round(rating) ? "#f5a623" : "#333" }}>★</span>
    ));
  };

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-modal" onClick={e => e.stopPropagation()}>
        <button className="detail-close" onClick={onClose}>✕</button>
        <div className="detail-body">

          {/* Left: Cover */}
          <div className="detail-cover" style={{ background: `linear-gradient(135deg, #0a0e1a 0%, ${color}22 100%)` }}>
            {book.isbn && !imgError ? (
              <img src={getCoverUrl(book.isbn)} alt={book.title}
                className={`detail-cover-img ${imgLoaded ? "loaded" : ""}`}
                onLoad={handleImgLoad} onError={() => setImgError(true)} />
            ) : null}
            {(!imgLoaded || imgError) && (
              <div className="detail-cover-fallback">
                <div className="detail-spine" style={{ background: color }} />
                <p className="detail-fallback-title">{book.title}</p>
                <p className="detail-fallback-author">{book.author}</p>
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="detail-info">
            <div className="detail-category" style={{ color, borderColor: `${color}44`, background: `${color}11` }}>
              {book.category}
            </div>
            <h2 className="detail-title">{book.title}</h2>
            <p className="detail-author">by {book.author}</p>

            <div className="detail-rating-row">
              <div className="detail-stars">{stars(book.rating)}</div>
              <span className="detail-rating-num">{book.rating} / 5</span>
            </div>

            <p className="detail-description">{book.description}</p>

            <div className="detail-meta-row">
              <div className="detail-meta-item">
                <span className="detail-meta-label">Price</span>
                <span className="detail-meta-value price">£{book.price?.toFixed(2)}</span>
              </div>
              <div className="detail-meta-item">
                <span className="detail-meta-label">Stock</span>
                <span className={`detail-meta-value ${book.stock < 5 ? "low-stock" : ""}`}>
                  {book.stock < 5 ? `⚠ Only ${book.stock} left` : `${book.stock} in stock`}
                </span>
              </div>
              <div className="detail-meta-item">
                <span className="detail-meta-label">ISBN</span>
                <span className="detail-meta-value">{book.isbn}</span>
              </div>
            </div>

            <div className="detail-actions">
              <button className="detail-add-btn" onClick={handleAdd}
                disabled={adding || book.stock === 0}>
                {added ? "✓ Added to Cart!" : adding ? "Adding…" : book.stock === 0 ? "Out of Stock" : "🛒 Add to Cart"}
              </button>
              <button
                className={`detail-wish-btn ${isWishlisted ? "active" : ""}`}
                onClick={() => onToggleWishlist(book.id)}>
                {isWishlisted ? "♥ Wishlisted" : "♡ Wishlist"}
              </button>
            </div>
          </div>
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
  const [helpOpen, setHelpOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

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
      {helpOpen && <HelpCentre onBack={() => setHelpOpen(false)} />}
      {!helpOpen && (<>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

      <nav className="navbar">
        <div className="nav-left">
          <div className="nav-logo">📜 <span>PageTurn</span></div>
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
        <button className="help-btn" onClick={() => setHelpOpen(true)}>
          ❓ Help
        </button>
      </nav>

      <section className="hero">
        <div className="hero-text">
          <h1>Find your next <span className="accent">great read</span></h1>
          <p className="hero-sub">Books for every age, genre and taste 📜</p>
        </div>
        <div className="hero-stats">
          <div className="stat"><span>{books.length || "100"}+</span><label>Books</label></div>
          <div className="stat"><span>11</span><label>Genres</label></div>
          <div className="stat"><span>4.7★</span><label>Avg Rating</label></div>
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
                onClick={() => setSelectedBook(book)}
              />
            ))}
            {filtered.length === 0 && (
              <div className="no-results">No books found for "{search}"</div>
            )}
          </div>
        )}
      </main>

      {selectedBook && (
        <BookDetail
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onAdd={handleAdd}
          adding={addingId === selectedBook.id}
          wishlist={wishlist}
          onToggleWishlist={handleToggleWishlist}
        />
      )}

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

      {/* Social Media Banner */}
      <section className="social-banner">
        <div className="social-banner-inner">
          <div className="social-banner-text">
            <h2>Follow <span className="accent">PageTurn</span></h2>
            <p>Stay updated with new arrivals, reading recommendations and exclusive deals</p>
          </div>
          <div className="social-links">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-card instagram">
              <span className="social-icon">📸</span>
              <span className="social-name">Instagram</span>
              <span className="social-handle">@pageturn</span>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-card twitter">
              <span className="social-icon">𝕏</span>
              <span className="social-name">Twitter / X</span>
              <span className="social-handle">@pageturn</span>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-card facebook">
              <span className="social-icon">f</span>
              <span className="social-name">Facebook</span>
              <span className="social-handle">/pageturn</span>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-card linkedin">
              <span className="social-icon">in</span>
              <span className="social-name">LinkedIn</span>
              <span className="social-handle">/pageturn</span>
            </a>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <span>PageTurn © 2025/2026 </span>
          <div className="footer-socials">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">📷</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">𝕏</a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">f</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">in</a>
          </div>
        </div>
      </footer>
      </>)}
    </div>
  );
}