import { useState } from "react";
import "./HelpCentre.css";

const FAQS = [
  { q: "Why are book covers not showing?", a: "Book covers are fetched from Open Library. If a cover doesn't appear, it means the book doesn't have a cover registered in Open Library's database. The app will show a stylised fallback instead." },
  { q: "Why does it say 'Catalog Service Offline'?", a: "The Catalog Service badge shows the status of the backend Flask server. If it's offline, the app automatically falls back to demo data so you can still browse books." },
  { q: "Why does it say 'Cart Service Offline'?", a: "The Cart Service runs on Spring Boot. When offline, adding to cart still works locally in your browser session but won't be saved to the database." },
  { q: "How do I add a book to my wishlist?", a: "Click the heart icon (♡) on any book card to add it to your wishlist. It turns red when added. Your wishlist is saved for your current session." },
  { q: "How do I checkout?", a: "Add books to your cart, click the Cart button in the top right, review your items and click 'Checkout'. The Cart Service must be online for checkout to complete." },
  { q: "Can I search for books?", a: "Yes! Use the search bar in the navbar to search by book title or author name. Results update in real time as you type." },
  { q: "How do I filter by category?", a: "Use the category buttons (Programming, DevOps, Architecture, JavaScript) below the hero section to filter books by genre." },
  { q: "How do I sort books?", a: "Use the Sort dropdown on the right side of the category bar to sort by Featured, Price, Rating, or Title A-Z." },
];

// ─── FAQ Section ─────────────────────────────────────────────────────────────
function FAQSection() {
  const [open, setOpen] = useState(null);
  return (
    <div className="help-section">
      <div className="section-header">
        <span className="section-icon">❓</span>
        <div>
          <h2>Frequently Asked Questions</h2>
          <p>Quick answers to common questions</p>
        </div>
      </div>
      <div className="faq-list">
        {FAQS.map((faq, i) => (
          <div key={i} className={`faq-item ${open === i ? "open" : ""}`} onClick={() => setOpen(open === i ? null : i)}>
            <div className="faq-question">
              <span>{faq.q}</span>
              <span className="faq-arrow">{open === i ? "▲" : "▼"}</span>
            </div>
            {open === i && <div className="faq-answer">{faq.a}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Contact Form ─────────────────────────────────────────────────────────────
function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="help-section">
      <div className="section-header">
        <span className="section-icon">✉️</span>
        <div>
          <h2>Contact Us</h2>
          <p>Send us a message and we'll get back to you</p>
        </div>
      </div>
      {submitted ? (
        <div className="success-msg">✅ Message sent! We'll get back to you within 24 hours.</div>
      ) : (
        <div className="contact-form">
          <div className="form-row">
            <div className="form-group">
              <label>Your Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea
              placeholder="Describe your issue or question..."
              rows={5}
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
            />
          </div>
          <button className="submit-btn" onClick={handleSubmit}>Send Message →</button>
        </div>
      )}
    </div>
  );
}

// ─── AI Chat ──────────────────────────────────────────────────────────────────
function AIChat() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I'm PageTurn's AI assistant 📜 How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "You are a helpful customer support assistant for PageTurn, an online bookstore app. Help users with questions about browsing books, using the cart, wishlist, search, filters, and any technical issues. Keep responses concise and friendly.",
          messages: [{ role: "user", content: userMsg }]
        })
      });
      const data = await response.json();
      const reply = data.content?.[0]?.text || "Sorry, I couldn't process that. Please try again.";
      setMessages(prev => [...prev, { role: "assistant", text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "Sorry, I'm having trouble connecting right now. Please try the contact form instead." }]);
    }
    setLoading(false);
  };

  return (
    <div className="help-section">
      <div className="section-header">
        <span className="section-icon">🤖</span>
        <div>
          <h2>Live Chat with AI</h2>
          <p>Get instant help from our AI assistant</p>
        </div>
      </div>
      <div className="chat-window">
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-msg ${msg.role}`}>
              <span className="chat-avatar">{msg.role === "assistant" ? "📜" : "👤"}</span>
              <div className="chat-bubble">{msg.text}</div>
            </div>
          ))}
          {loading && (
            <div className="chat-msg assistant">
              <span className="chat-avatar">📜</span>
              <div className="chat-bubble typing">
                <span /><span /><span />
              </div>
            </div>
          )}
        </div>
        <div className="chat-input-row">
          <input
            type="text"
            placeholder="Type your question..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage} disabled={loading}>Send</button>
        </div>
      </div>
    </div>
  );
}

// ─── Bug Report ───────────────────────────────────────────────────────────────
function BugReport() {
  const [form, setForm] = useState({ title: "", steps: "", severity: "Medium" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!form.title || !form.steps) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setForm({ title: "", steps: "", severity: "Medium" });
  };

  return (
    <div className="help-section">
      <div className="section-header">
        <span className="section-icon">🐛</span>
        <div>
          <h2>Report a Bug</h2>
          <p>Found something broken? Let us know!</p>
        </div>
      </div>
      {submitted ? (
        <div className="success-msg">🐛 Bug report submitted! Thank you for helping improve PageTurn.</div>
      ) : (
        <div className="contact-form">
          <div className="form-group">
            <label>Bug Title</label>
            <input
              type="text"
              placeholder="e.g. Book cover not loading on Safari"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Severity</label>
            <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
          </div>
          <div className="form-group">
            <label>Steps to Reproduce</label>
            <textarea
              placeholder="1. Go to the home page&#10;2. Click on a book card&#10;3. Notice the issue..."
              rows={5}
              value={form.steps}
              onChange={e => setForm({ ...form, steps: e.target.value })}
            />
          </div>
          <button className="submit-btn bug-btn" onClick={handleSubmit}>Submit Bug Report 🐛</button>
        </div>
      )}
    </div>
  );
}

// ─── Main Help Centre Page ────────────────────────────────────────────────────
export default function HelpCentre({ onBack }) {
  const [activeTab, setActiveTab] = useState("faq");

  const tabs = [
    { id: "faq", label: "❓ FAQ" },
    { id: "contact", label: "✉️ Contact" },
    { id: "chat", label: "🤖 AI Chat" },
    { id: "bug", label: "🐛 Report Bug" },
  ];

  return (
    <div className="help-page">
      <div className="help-navbar">
        <button className="back-btn" onClick={onBack}>← Back to PageTurn</button>
        <div className="help-logo">📜 <span>PageTurn Help Centre</span></div>
      </div>

      <div className="help-hero">
        <h1>How can we <span className="help-accent">help you?</span></h1>
        <p>Find answers, contact support, or chat with our AI assistant</p>
      </div>

      <div className="help-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`help-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="help-content">
        {activeTab === "faq" && <FAQSection />}
        {activeTab === "contact" && <ContactForm />}
        {activeTab === "chat" && <AIChat />}
        {activeTab === "bug" && <BugReport />}
      </div>

      <footer className="help-footer">
        PageTurn Help Centre · CSC8113 DevOps Project
      </footer>
    </div>
  );
}
