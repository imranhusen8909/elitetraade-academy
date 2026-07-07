'use client';
// Add this import at the top of your file (with other imports)
import { supabase } from './lib/supabase';
import React, { useState, useEffect } from 'react';
import { TrendingUp, Star, BookOpen, HelpCircle, BarChart3, Lock } from 'lucide-react';

export default function EliteTradeAcademy() {
  
    const [trades, setTrades] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('eliteTrades');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
   
  useEffect(() => {
    localStorage.setItem('eliteTrades', JSON.stringify(trades));
  }, [trades]);
 
  const [activeTab, setActiveTab] = useState('learn');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showPremiumPage, setShowPremiumPage] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [showPaymentPage, setShowPaymentPage] = useState(false);
    

 const tabs = [
  { name: 'Learn Basics', id: 'learn', premium: false },
  { name: 'Dashboard', id: 'dashboard', premium: false },
  { name: 'Trading Journal', id: 'journal', premium: false },
  { name: 'Strategies', id: 'strategies', premium: false },
  { name: 'FAQ', id: 'faq', premium: false },
  { name: 'Contact', id: 'contact', premium: false },
];


  const isTabAccessible = (tabId: string) => true;
  // Premium Feature Gating
  // Authentication States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Persist login on page refresh
  useEffect(() => {
    const savedEmail = localStorage.getItem('currentEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setIsLoggedIn(true);
      const savedPremium = localStorage.getItem(`premium_${savedEmail}`);
      setIsPremium(savedPremium === 'true');
    }
  }, []);

  const [dashboardTrades, setDashboardTrades] = useState([]);

useEffect(() => {
  const loadDashboard = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id);
      
     setDashboardTrades(data || [] as any[]);
    }
  };
  loadDashboard();
}, [isLoggedIn]);

const totalTrades = dashboardTrades.length;
const totalPnL = dashboardTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
const winRate = totalTrades > 0 ? Math.round((dashboardTrades.filter(t => (t.pnl || 0) > 0).length / totalTrades) * 100) : 0;

 // Updated Login Handler
const handleLogin = async () => {
  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    alert(error.message);
    return;
  }

  setIsLoggedIn(true);
  setName(data.user?.user_metadata?.name || '');
  localStorage.setItem('currentEmail', email);
  setIsPremium(true); // You can change this logic later
  localStorage.setItem(`premium_${email}`, 'true');

  setShowLoginModal(false);
  setActiveTab('learn');
  alert("Login successful! Welcome back 🎉");
};

// Updated Signup Handler
const handleSignup = async () => {
  if (!name || !email || !password) {
    alert("Please fill all fields");
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }   // save name
    }
  });

  if (error) {
    alert(error.message);
    return;
  }

  setIsLoggedIn(true);
  setName(name);
  localStorage.setItem('currentEmail', email);
  setIsPremium(false);
  localStorage.setItem(`premium_${email}`, 'false');

  setShowLoginModal(false);
  setActiveTab('learn');
  alert("Account created successfully! Please check your email for confirmation.");
};

  // Logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsPremium(false);
    setName('');
    setEmail('');
    setPassword('');
    localStorage.removeItem('currentEmail');
    if (email) localStorage.removeItem(`premium_${email}`);
    setActiveTab('learn');
  };

  // ==================== TRADING JOURNAL (Full - Unchanged) ====================
 // ==================== TRADING JOURNAL WITH LOCALSTORAGE ====================
function TradingJournal() {
  const [trades, setTrades] = useState([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    symbol: '',
    type: 'BUY',
    entryPrice: '',
    exitPrice: '',
    quantity: '',
    stopLoss: '',
    target: '',
    fees: '',
    reason: '',
    outcome: '',
    emotion: 'Neutral',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch trades from Supabase
  const fetchTrades = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error) setTrades(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const addTrade = async (e) => {
    e.preventDefault();
    if (!formData.symbol || !formData.entryPrice || !formData.exitPrice || !formData.quantity) {
      alert("Please fill required fields (*)");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const entry = parseFloat(formData.entryPrice);
    const exit = parseFloat(formData.exitPrice);
    const qty = parseInt(formData.quantity);
    const fees = parseFloat(formData.fees) || 0;

    const pnl = formData.type === 'BUY' 
      ? (exit - entry) * qty - fees 
      : (entry - exit) * qty - fees;

    const newTrade = {
      user_id: user.id,
      date: formData.date,
      symbol: formData.symbol.toUpperCase(),
      type: formData.type,
      entry_price: entry,
      exit_price: exit,
      quantity: qty,
      stop_loss: parseFloat(formData.stopLoss) || null,
      target: parseFloat(formData.target) || null,
      fees,
      reason: formData.reason,
      outcome: formData.outcome,
      pnl: parseFloat(pnl.toFixed(2)),
      pnl_percentage: entry !== 0 ? parseFloat((((exit - entry) / entry) * 100).toFixed(2)) : 0,
      image: imagePreview,
    };

    const { error } = await supabase.from('trades').insert([newTrade]);

    if (!error) {
      alert("Trade saved successfully!");
      fetchTrades(); // refresh list
      // reset form
      setFormData({ ...formData, symbol: '', entryPrice: '', exitPrice: '', quantity: '', stopLoss: '', target: '', fees: '', reason: '', outcome: '' });
      setImage(null);
      setImagePreview(null);
    } else {
      alert("Error saving trade");
    }
  };

  const deleteTrade = async (id) => {
    if (confirm("Delete this trade?")) {
      await supabase.from('trades').delete().eq('id', id);
      fetchTrades();
    }
  };

  const totalTradesLocal = trades.length;
  const totalPnLLocal = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const winRateLocal = totalTradesLocal > 0 ? Math.round((trades.filter(t => (t.pnl || 0) > 0).length / totalTradesLocal) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-semibold">Trading Journal</h1>
        <div className="text-sm text-gray-500">{totalTradesLocal} trades logged</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="border border-gray-200 rounded-3xl p-6">
          <p className="text-sm text-gray-500">Total P&amp;L</p>
          <p className={`text-3xl font-semibold mt-2 ${totalPnLLocal >= 0 ? 'text-green-600' : 'text-red-600'}`}>₹{totalPnLLocal.toFixed(2)}</p>
        </div>
        <div className="border border-gray-200 rounded-3xl p-6">
          <p className="text-sm text-gray-500">Win Rate</p>
          <p className="text-3xl font-semibold mt-2">{winRateLocal}%</p>
        </div>
        <div className="border border-gray-200 rounded-3xl p-6">
          <p className="text-sm text-gray-500">Total Trades</p>
          <p className="text-3xl font-semibold mt-2">{totalTradesLocal}</p>
        </div>
        <div className="border border-gray-200 rounded-3xl p-6">
          <p className="text-sm text-gray-500">Avg P&amp;L</p>
          <p className="text-3xl font-semibold mt-2">₹{totalTradesLocal > 0 ? (totalPnLLocal / totalTradesLocal).toFixed(2) : '0'}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-8 mb-12 text-black">
        <h2 className="text-2xl font-semibold mb-6">Log New Trade</h2>
        <form onSubmit={addTrade} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Date *</label>
            <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full p-3 border rounded-2xl" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Symbol *</label>
            <input type="text" name="symbol" value={formData.symbol} onChange={handleInputChange} placeholder="RELIANCE" className="w-full p-3 border rounded-2xl uppercase" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Type *</label>
            <select name="type" value={formData.type} onChange={handleInputChange} className="w-full p-3 border rounded-2xl">
              <option value="BUY">BUY (Long)</option>
              <option value="SELL">SELL (Short)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Entry Price *</label>
            <input type="number" name="entryPrice" value={formData.entryPrice} onChange={handleInputChange} step="0.01" className="w-full p-3 border rounded-2xl" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Exit Price *</label>
            <input type="number" name="exitPrice" value={formData.exitPrice} onChange={handleInputChange} step="0.01" className="w-full p-3 border rounded-2xl" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Quantity *</label>
            <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} className="w-full p-3 border rounded-2xl" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Stop Loss</label>
            <input type="number" name="stopLoss" value={formData.stopLoss} onChange={handleInputChange} step="0.01" className="w-full p-3 border rounded-2xl" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Target</label>
            <input type="number" name="target" value={formData.target} onChange={handleInputChange} step="0.01" className="w-full p-3 border rounded-2xl" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Fees / Brokerage</label>
            <input type="number" name="fees" value={formData.fees} onChange={handleInputChange} step="0.01" className="w-full p-3 border rounded-2xl" />
          </div>

          <div className="lg:col-span-3">
            <label className="block text-sm font-medium mb-2">Upload Trading Chart Screenshot</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="w-full p-3 border rounded-2xl" />
            {imagePreview && <img src={imagePreview} alt="preview" className="mt-4 max-h-64 rounded-2xl border" />}
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium mb-2">Reason / Setup</label>
            <textarea name="reason" value={formData.reason} onChange={handleInputChange} rows={3} className="w-full p-3 border rounded-3xl" placeholder="Why did you take this trade?" />
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium mb-2">Outcome / Lessons Learned</label>
            <textarea name="outcome" value={formData.outcome} onChange={handleInputChange} rows={3} className="w-full p-3 border rounded-3xl" placeholder="What went well? What could be improved?" />
          </div>

          <div className="lg:col-span-3">
            <button type="submit" className="bg-black text-white px-12 py-4 rounded-2xl hover:bg-gray-800 transition text-lg">
              Save Trade
            </button>
          </div>
        </form>
      </div>

      <h2 className="text-2xl font-semibold mb-6">Trade History</h2>
      {trades.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-gray-300 rounded-3xl text-gray-400">
          No trades logged yet. Add your first trade above.
        </div>
      ) : (
        <div className="space-y-8">
          {trades.map(trade => (
            <div key={trade.id} className="border border-gray-200 rounded-3xl p-6 bg-white relative">
              <button onClick={() => deleteTrade(trade.id)} className="absolute top-4 right-4 text-red-500 hover:text-red-700 text-xl">✕</button>
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 text-black">
                  <div className="flex items-center gap-4 mb-4">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${trade.type === 'BUY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {trade.type}
                    </span>
                    <h3 className="text-black font-bold">{trade.symbol}</h3>
                    <span className="text-black text-sm">{trade.date}</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-y-3 text-black">
                    <div><strong>Entry:</strong> ₹{trade.entry_price}</div>
<div><strong>Exit:</strong> ₹{trade.exit_price}</div>
<div><strong>Qty:</strong> {trade.quantity}</div>
<div><strong>Fees:</strong> ₹{trade.fees || 0}</div>
{trade.stop_loss && <div><strong>Stop Loss:</strong> ₹{trade.stop_loss}</div>}
{trade.target && <div><strong>Target:</strong> ₹{trade.target}</div>}
                  </div>

                  {trade.reason && <p className="mt-4"><strong>Setup Reason:</strong> {trade.reason}</p>}
                  {trade.outcome && <p className="mt-2"><strong>Outcome & Lessons:</strong> {trade.outcome}</p>}
                </div>

                <div className="lg:w-80 flex flex-col items-end">
                  <div className={`text-4xl font-bold mb-4 ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
  ₹{trade.pnl}<br />
  <span className="text-xl">({trade.pnl_percentage}%)</span>
</div>
                  {trade.image && (
                    <div>
                      <p className="text-black text-gray-500 mb-2">Trading Chart</p>
                      <img src={trade.image} alt="Trade Screenshot" className="max-h-80 rounded-2xl border shadow-sm" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-black/90 backdrop-blur-md z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center">
              <TrendingUp className="text-black" size={26} />
            </div>
            <div className="text-3xl font-bold tracking-tight">EliteTrade Academy</div>
          </div>

       <div className="flex items-center gap-8 text-sm font-medium">
  <a href="#learn" className="hover:text-gray-300 transition">Learn</a>
  <a href="#tools" className="hover:text-gray-300 transition">Tools</a>
  <a href="#strategies" className="hover:text-gray-300 transition">Strategies</a>
  
 {isLoggedIn ? (
  <div className="flex items-center gap-4">
    <span className="text-green-400">Welcome, {name || email?.split('@')[0] || 'Trader'}</span>
    <button onClick={handleLogout} className="bg-red-600 text-white px-6 py-2 rounded-2xl hover:bg-red-700 transition">
      Logout
    </button>
  </div>
) : (
  <button 
    onClick={() => setShowLoginModal(true)}
    className="bg-white text-black px-8 py-3 rounded-2xl font-semibold hover:bg-gray-100 transition"
  >
    Login
  </button>
)}
</div>
        </div>
      </nav>
      {/* Hero - Separate */}
      {!isLoggedIn && (
        <div className="relative min-h-screen flex items-center justify-center">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://p2.piqsels.com/preview/898/284/844/stock-trading-monitor-desk.jpg')`
            }}
          ></div>
          
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black"></div>

          {/* Main Content */}
          <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
            <h1 className="text-6xl md:text-7xl font-bold leading-none mb-6 tracking-tight text-white">
              THIS IS YOUR<br />MOMENT
            </h1>
            
            <p className="text-2xl text-gray-200 mb-10 max-w-2xl mx-auto">
              Master stock market trading with professional tools,<br />
              strategies, and real-time practice.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center">
         <button 
  onClick={() => {
    setIsLoggedIn(true);
    setActiveTab('learn');
  }}
  className="bg-white text-black text-lg font-semibold px-14 py-5 rounded-3xl hover:bg-gray-100 transition-all active:scale-95"
>
  Start Free
</button>
            </div>

            <p className="mt-8 text-gray-400 text-sm">
              No credit card needed • Instant access
            </p>
          </div>
        </div>
      )}
           {/* Login Modal */}
   {showLoginModal && (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
    <div className="bg-white text-black rounded-3xl p-8 max-w-sm w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">
          {isSignupMode ? 'Create Account' : 'Login to EliteTrade'}
        </h2>
        <p className="text-gray-500 mt-1">
          {isSignupMode ? 'Join the community' : 'Welcome back'}
        </p>
      </div>

      {isSignupMode && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Full Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="w-full p-4 border rounded-2xl" 
            placeholder="John Doe" 
          />
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Email Address</label>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          className="w-full p-4 border rounded-2xl" 
          placeholder="your@email.com" 
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Password</label>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          className="w-full p-4 border rounded-2xl" 
          placeholder="••••••••" 
        />
      </div>

      {!isSignupMode && (
        <button 
          onClick={() => alert("Password reset link sent! (Demo)")}
          className="text-sm text-blue-600 hover:underline mb-4 block w-full text-left"
        >
          Forgot Password?
        </button>
      )}

      <button 
        onClick={isSignupMode ? handleSignup : handleLogin} 
        className="w-full bg-black text-white py-4 rounded-2xl mb-4 font-semibold hover:bg-gray-800 transition"
      >
        {isSignupMode ? 'Create Account' : 'Login'}
      </button>

      <div className="text-center text-sm text-gray-500">
        {isSignupMode ? (
          <>Already have an account? <button onClick={() => setIsSignupMode(false)} className="text-blue-600 hover:underline">Login</button></>
        ) : (
          <>Don't have an account? <button onClick={() => setIsSignupMode(true)} className="text-blue-600 hover:underline">Create new account</button></>
        )}
      </div>

      <button 
        onClick={() => {setShowLoginModal(false); setIsSignupMode(false); setEmail(''); setPassword(''); setName('');}} 
        className="w-full text-gray-500 py-2 mt-4 hover:text-gray-700"
      >
        Close
      </button>
    </div>
  </div>
)}
      {/* Logged In Content */}
      {isLoggedIn && (
        <div className="pt-20 flex max-w-7xl mx-auto">
          <div className="w-64 border-r p-6 hidden md:block">
            <div className="uppercase text-xs text-gray-500 mb-4">PLATFORM</div>
            {tabs.map(item => {
              const accessible = isTabAccessible(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => accessible && setActiveTab(item.id)}
                  disabled={!accessible}
                  className={`w-full text-left px-5 py-3 mb-1 rounded-xl text-sm flex justify-between items-center ${
                    activeTab === item.id 
                      ? 'bg-black text-white' 
                      : accessible 
                        ? 'hover:bg-gray-100' 
                        : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <span>{item.name}</span>
                  {item.premium && !isPremium && (
                    <span className="text-amber-500 text-xs">⭐</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex-1 p-8">
            {activeTab === 'learn' && (
  <div className="max-w-4xl">
    <h1 className="text-4xl font-semibold mb-10">Learn Basics</h1>
    
    <div className="prose prose-gray text-[15px] leading-relaxed space-y-14 text-white">
      
      <section>
        <h2 className="text-2xl font-semibold mb-4">What is a Stock Exchange?</h2>
        <p>A stock exchange is a marketplace where stocks (shares of companies) are bought and sold. It provides a platform for companies to raise capital and for investors to own a part of companies.</p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Popular Stock Exchanges</h2>
        <p className="mb-2"><strong>🇮🇳 India:</strong></p>
        <ul className="list-disc pl-6 mb-4">
          <li>NSE (National Stock Exchange) - Largest in India</li>
          <li>BSE (Bombay Stock Exchange) - Oldest in Asia</li>
        </ul>
        <p><strong>🇺🇸 USA:</strong> NYSE (New York Stock Exchange), NASDAQ</p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Market Participants</h2>
        <ul className="list-disc pl-6 space-y-3">
          <li><strong>Retail Investors</strong>: Individual people investing their own money.</li>
          <li><strong>Institutional Investors</strong>: Large organizations like Mutual Funds, Insurance Companies, Banks, Pension Funds, and Foreign Institutional Investors (FIIs).</li>
          <li><strong>Traders</strong>: Professional and retail traders who buy and sell frequently to profit from price movements.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Types of Market</h2>
        <p><strong>Primary Market</strong>: Companies issue new shares through IPO (Initial Public Offering) to raise capital.</p>
        <p><strong>Secondary Market</strong>: Investors buy and sell already listed shares among themselves. This is where most trading happens.</p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">What is an IPO?</h2>
        <p>IPO stands for Initial Public Offering. It is the process by which a private company becomes public by selling its shares to the general public for the first time.</p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Market Capitalization</h2>
        <p><strong>Formula:</strong> Market Cap = Share Price × Total Number of Outstanding Shares</p>
        <p className="mt-3"><strong>Categories:</strong> Large Cap (Stable), Mid Cap (Growing), Small Cap (High Risk & High Reward)</p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Bull Market vs Bear Market</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 border border-green-200 bg-green-50/10 rounded-3xl">
            <p className="font-semibold text-green-400">🐂 Bull Market</p>
            <p>Prices are rising. Optimism and confidence are high.</p>
          </div>
          <div className="p-6 border border-red-200 bg-red-50/10 rounded-3xl">
            <p className="font-semibold text-red-400">🐻 Bear Market</p>
            <p>Prices are falling. Pessimism and fear dominate the market.</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Trading vs Investing</h2>
        <table className="w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-3 text-black">Aspect</th>
              <th className="border p-3 text-black">Trading</th>
              <th className="border p-3 text-black">Investing</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="border p-3">Time Horizon</td><td>Short-term (days/weeks)</td><td>Long-term (years)</td></tr>
            <tr><td className="border p-3">Risk Level</td><td>Higher</td><td>Lower</td></tr>
            <tr><td className="border p-3">Goal</td><td>Quick profits</td><td>Wealth creation</td></tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Risk Management</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Never risk more than 1-2% of your total capital on a single trade.</li>
          <li>Always use Stop Loss orders.</li>
          <li>Avoid revenge trading after a loss.</li>
          <li>Control greed and fear.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Important Stock Market Terms</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Equity</strong>: Ownership in a company</li>
          <li><strong>Dividend</strong>: Share of company profit given to shareholders</li>
          <li><strong>Volume</strong>: Number of shares traded in a day</li>
          <li><strong>Nifty 50</strong>: Top 50 companies on NSE</li>
          <li><strong>Sensex</strong>: Top 30 companies on BSE</li>
          <li><strong>Broker</strong>: Platform to buy/sell stocks</li>
        </ul>
      </section>

    </div>
  </div>
)}

{activeTab === 'dashboard' && (
  <div>
    <h1 className="text-3xl font-semibold mb-8">Market Dashboard</h1>
    
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
      <div className="border border-gray-200 rounded-3xl p-6">
        <p className="text-sm text-gray-500">Total P&amp;L</p>
        <p className={`text-3xl font-semibold mt-2 ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>₹{totalPnL.toFixed(2)}</p>
      </div>
      <div className="border border-gray-200 rounded-3xl p-6">
        <p className="text-sm text-gray-500">Win Rate</p>
        <p className="text-3xl font-semibold mt-2">{winRate}%</p>
      </div>
      <div className="border border-gray-200 rounded-3xl p-6">
        <p className="text-sm text-gray-500">Total Trades</p>
        <p className="text-3xl font-semibold mt-2">{totalTrades}</p>
      </div>
      <div className="border border-gray-200 rounded-3xl p-6">
        <p className="text-sm text-gray-500">Avg P&amp;L</p>
        <p className="text-3xl font-semibold mt-2">₹{totalTrades > 0 ? (totalPnL / totalTrades).toFixed(2) : '0'}</p>
      </div>
    </div>
  </div>
)}

            {activeTab === 'journal' &&  <TradingJournal />}
            {activeTab === 'strategies' &&  (
  <div className="max-w-6xl mx-auto pb-12">
    <div className="mb-12">
      <h1 className="text-4xl font-semibold mb-3">Premium Trading Strategies</h1>
      <p className="text-xl text-gray-600">
        Master these professional strategies. Each one is explained in full detail.
      </p>
    </div>

    <div className="space-y-12">

      {/* 1. Trend Following Strategy */}
      <div className="bg-white border border-gray-200 rounded-3xl p-10">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <TrendingUp className="text-emerald-600" size={32} />
          </div>
          <div>
            <h2 className="text-black">1. Trend Following Strategy</h2>
            <p className="text-gray-500 mt-1 text-lg">Trade in the direction of the prevailing trend</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
          <div>
            <h3 className="text-black">Description</h3>
            <p className="text-gray-700 leading-relaxed">Trade in the direction of the prevailing trend. The goal is to join an existing trend rather than predict reversals.</p>
          </div>
          <div>
            <h3 className="text-black">When to Use</h3>
            <p className="text-gray-700">Strong bullish or bearish markets • High momentum stocks or indices</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-2xl p-5">
            <h4 className="text-black">Market Conditions</h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm">✅ Bullish</span>
              <span className="px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm">✅ Bearish</span>
              <span className="px-4 py-1 bg-red-100 text-red-700 rounded-full text-sm">❌ Sideways</span>
            </div>
          </div>
          <div className="bg-gray-50 rounded-2xl p-5">
            <h4 className="text-black">Best Timeframe</h4>
            <p className="text-gray-700">5 min, 15 min, 1 Hour, Daily</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-5">
            <h4 className="text-black">Risk Management</h4>
            <p className="text-gray-700">Risk 1–2% per trade • Never average a losing position</p>
          </div>
        </div>

        <div className="mt-10 border-t pt-8">
          <h4 className="text-black">Entry Rules</h4>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="font-medium text-green-600 mb-3">BUY</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Price above 50 EMA or 200 EMA</li>
                <li>Higher Highs & Higher Lows</li>
                <li>Pullback to support</li>
                <li>Bullish confirmation candle</li>
              </ul>
            </div>
            <div>
              <p className="text-black">SELL</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Price below EMA</li>
                <li>Lower Highs & Lower Lows</li>
                <li>Pullback to resistance</li>
                <li>Bearish confirmation</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold mb-3">Exit Rules</h4>
            <p className="text-gray-700">Target: 1:2 or 1:3 Risk-Reward • Trail SL as trend continues • Exit when trend structure breaks</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Stop Loss</h4>
            <p className="text-gray-700">Below swing low (Buy) • Above swing high (Sell)</p>
          </div>
        </div>

        <div className="mt-10 bg-amber-50 border border-amber-100 rounded-2xl p-7">
          <h4 className="text-black">Example:</h4>
          <p className="text-gray-700">
            Reliance trades at ₹1500. Pullback to ₹1490. Bullish engulfing candle forms.<br />
            <strong>Entry:</strong> ₹1492 &nbsp;&nbsp; <strong>SL:</strong> ₹1482 &nbsp;&nbsp; <strong>Target:</strong> ₹1512
          </p>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold mb-4 text-green-600">Pros</h4>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li className="font-semibold mb-4 text-green-600">High probability</li>
              <li className="font-semibold mb-4 text-green-600">Easy to understand</li>
              <li className="font-semibold mb-4 text-green-600">Works in all asset classes</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-red-600">Cons</h4>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li className="font-semibold mb-4 text-red-600">Poor in sideways markets</li>
              <li className="font-semibold mb-4 text-red-600">False breakouts possible</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 2. Order Psychology */}
      <div className="bg-white border border-gray-200 rounded-black p-10">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Lock className="text-purple-600" size={32} />
          </div>
          <div>
            <h2 className="text-black font-semibold">2. Order Psychology (Accumulation → Liquidity Grab → Distribution)</h2>
            <p className="text-gray-500 mt-1 text-lg">Institutional traders order flow strategy</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-x-12 gap-y-8 text-gray-700 leading-relaxed">
          <div><strong>Description:</strong> Institutional traders often build positions quietly (accumulation), trigger stop losses (liquidity grab), then move price toward their intended direction (distribution).</div>
          <div><strong>When to Use:</strong> Market opening • Before major breakouts • Around key support/resistance</div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-2xl p-5">
            <h4 className="text-gray-700">Market Conditions</h4>
            <p className="text-gray-700">Bullish • Bearish • Volatile</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-5">
            <h4 className="text-gray-700">Best Timeframe</h4>
            <p className="text-gray-700">5 min, 15 min, 1 Hour</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-5">
            <h4 className="text-gray-700">Risk Management</h4>
            <p className="text-gray-700">Maximum 2% risk • Wait for confirmation</p>
          </div>
        </div>

        <div className="mt-10 space-y-6 text-gray-700">
          <div><strong>Entry Rules:</strong> Identify accumulation zone → Wait for liquidity sweep → Enter after confirmation in the expected direction</div>
          <div><strong>Exit Rules:</strong> Previous High/Low • Next demand/supply zone</div>
          <div><strong>Stop Loss:</strong> Beyond liquidity sweep</div>
        </div>

        <div className="mt-8 bg-amber-50 border border-amber-100 rounded-2xl p-7">
          <h4 className="text-gray-700">Example</h4>
          <p className="text-gray-700">
            NIFTY ranges between 24,800–24,850. Price dips to 24,790, triggers stops, then quickly moves back above 24,800.<br />
            <strong>Buy:</strong> 24,805 &nbsp; <strong>SL:</strong> 24,785 &nbsp; <strong>Target:</strong> 24,860
          </p>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-8">
          <div><strong className="text-green-600">Pros:</strong><strong className="text-green-600"> Good risk-reward • Captures institutional moves</strong></div>
          <div><strong className="text-red-600">Cons:</strong><strong className="text-red-600"> Easy to misread • Requires patience</strong></div>
        </div>
      </div>

      {/* 3. BTST / STBT */}
      <div className="bg-white border border-gray-200 rounded-3xl p-10">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <BarChart3 className="text-blue-600" size={32} />
          </div>
          <div>
            <h2 className="text-black font-semibold">3. BTST (Buy Today Sell Tomorrow) / STBT (Sell Today Buy Tomorrow)</h2>
            <p className="text-gray-500 mt-1 text-lg">Carry positions overnight expecting gap movement</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-x-12 gap-y-8 text-gray-700">
          <div><strong>Description:</strong> Carry positions overnight expecting a gap up or gap down on the next trading day.</div>
          <div><strong>When to Use:</strong> Strong closing momentum • Positive or negative market sentiment • Earnings or major news events</div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-2xl p-5"><h4 className="text-gray-700">Market Conditions</h4><p className="text-gray-700">Trending markets</p></div>
          <div className="bg-gray-50 rounded-2xl p-5"><h4 className="text-gray-700">Best Timeframe</h4><p className="text-gray-700">Daily</p></div>
          <div className="bg-gray-50 rounded-2xl p-5"><h4 className="text-gray-700">Risk Management</h4><p className="text-gray-700">Overnight risk • Reduce position size</p></div>
        </div>

        <div className="mt-10 space-y-4 text-gray-700">
          <div><strong>Entry Rules (BTST):</strong> Buy near market close with strong bullish candle, high volume, closing near day high</div>
          <div><strong>Exit Rules:</strong> Exit next day opening or after target is achieved</div>
          <div><strong>Stop Loss:</strong> Previous day's low/high</div>
        </div>

        <div className="mt-8 bg-amber-50 border border-amber-100 rounded-2xl p-7">
          <h4 className="text-gray-700">Example: </h4>
          <p className="text-gray-700">
            Stock closes at ₹250 with strong momentum.<br />
            <strong>Buy:</strong> ₹250 → Next day opens at ₹257 → Exit: ₹256–258
          </p>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-8">
          <div><strong className="text-green-600">Pros:</strong><strong className="text-green-600"> Captures overnight gaps • Less screen time</strong></div>
          <div><strong className="text-red-600">Cons:</strong><strong className="text-red-600"> Gap risk • News risk</strong></div>
        </div>
      </div>

      {/* 4 to 8 - Similarly detailed blocks added below (full content) */}

      {/* Strategy 4: Adjustment Theory */}
      <div className="bg-white border border-gray-200 rounded-3xl p-10">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <HelpCircle className="text-orange-600" size={32} />
          </div>
          <div>
            <h2 className="text-black font-semibold">4. Adjustment Theory (Expiry)</h2>
            <p className="text-gray-500 mt-1 text-lg">Options risk management during expiry week</p>
          </div>
        </div>
        <div className="space-y-6 text-gray-700">
          <p><strong>Description:</strong> A general options risk management approach where traders adjust positions during expiry week as option premiums decay and price moves.</p>
          <p><strong>When to Use:</strong> Weekly expiry • High volatility</p>
          <p><strong>Market Conditions:</strong> Volatile • Range-bound • Trending</p>
          <p><strong>Best Timeframe:</strong> Expiry week</p>
          <p><strong>Risk Management:</strong> Use defined-risk positions • Avoid overleveraging</p>
          <p><strong>Example:</strong> Short option premium collected at ₹100. If premium expands significantly against the position, reduce exposure or adjust according to your trading plan.</p>
        </div>
        <div className="mt-8 grid md:grid-cols-2 gap-8">
          <div><strong className="text-green-600">Pros:</strong><strong className="text-green-600"> Helps manage expiry risk</strong></div>
          <div><strong className="text-red-600">Cons:</strong><strong className="text-red-600"> Requires options knowledge</strong></div>
        </div>
      </div>

      {/* Strategy 5: Accumulation Zones in Option Premiums */}
      <div className="bg-white border border-gray-200 rounded-3xl p-10">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Star className="text-indigo-600" size={32} />
          </div>
          <div>
            <h2 className="text-black font-semibold">5. Accumulation Zones in Option Premiums (Big Money)</h2>
            <p className="text-gray-500 mt-1 text-lg">Premium behavior before directional moves</p>
          </div>
        </div>
        <div className="space-y-6 text-gray-700">
          <p><strong>Description:</strong> Looks for areas where option premiums appear to stabilize before a directional move, with the idea that larger participants may be building positions.</p>
          <p><strong>When to Use:</strong> Before breakouts • Near important strike prices</p>
          <p><strong>Market Conditions:</strong> Volatile • Pre-breakout</p>
          <p><strong>Best Timeframe:</strong> Intraday • Expiry week</p>
          <p><strong>Risk Management:</strong> Limit capital per trade • Confirm with multiple signals</p>
          <p><strong>Example:</strong> A call option premium trades in a narrow range despite underlying movement. A breakout in both price and premium may support a directional trade.</p>
        </div>
        <div className="mt-8 grid md:grid-cols-2 gap-8">
          <div><strong className="text-green-600">Pros:</strong><strong className="text-green-600"> Can improve timing</strong></div>
          <div><strong className="text-red-600">Cons:</strong><strong className="text-red-600"> Premium behavior alone is not sufficient</strong></div>
        </div>
      </div>

      {/* Strategy 6: Value Adjustment */}
      <div className="bg-white border border-gray-200 rounded-3xl p-10">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <BookOpen className="text-rose-600" size={32} />
          </div>
          <div>
            <h2 className="text-black font-semibold">6. Value Adjustment (Expiry)</h2>
            <p className="text-gray-500 mt-1 text-lg">Understanding time decay and premium changes</p>
          </div>
        </div>
        <div className="space-y-6 text-gray-700">
          <p><strong>Description:</strong> An options concept focused on how premiums change as expiry approaches due to time decay, implied volatility, and movement in the underlying.</p>
          <p><strong>When to Use:</strong> Expiry week • High implied volatility</p>
          <p><strong>Market Conditions:</strong> Volatile</p>
          <p><strong>Best Timeframe:</strong> Last 1–5 trading sessions before expiry</p>
          <p><strong>Example:</strong> An option loses value despite little price movement because time to expiry is shrinking. Plan entries and exits with this effect in mind.</p>
        </div>
        <div className="mt-8 grid md:grid-cols-2 gap-8">
          <div><strong className="text-green-600">Prost:</strong><strong className="text-green-600"> Encourages disciplined options management</strong></div>
          <div><strong className="text-red-600">Cons:</strong><strong className="text-red-600"> Complex for beginners</strong></div>
        </div>
      </div>

      {/* Strategy 7: 7 EMA Strategy */}
      <div className="bg-white border border-gray-200 rounded-3xl p-10">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-14 h-14 bg-cyan-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <BarChart3 className="text-cyan-600" size={32} />
          </div>
          <div>
            <h2 className="text-black font-semibold">7. 7 EMA Strategy</h2>
            <p className="text-gray-500 mt-1 text-lg">Short-term momentum using 7-period EMA</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-x-12 gap-y-8 text-gray-700">
          <div><strong>Description:</strong> Uses the 7-period Exponential Moving Average to identify short-term momentum and trend direction.</div>
          <div><strong>When to Use:</strong> Intraday trading • Scalping</div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-2xl p-5"><h4 className="text-gray-600">Market Conditions</h4><p className="text-gray-600">Trending markets</p></div>
          <div className="bg-gray-50 rounded-2xl p-5"><h4 className="text-gray-600">Best Timeframe</h4><p className="text-gray-600">1 min, 3 min, 5 min, 15 min</p></div>
          <div className="bg-gray-50 rounded-2xl p-5"><h4 className="text-gray-600">Risk Management</h4><p  className="text-gray-600">Risk 1–2% per trade</p></div>
        </div>

        <div className="mt-10 bg-amber-50 border border-amber-100 rounded-2xl p-7">
          <h4 className="text-gray-600">Example</h4>
          <p className="text-gray-700">
            BANKNIFTY trades above the 7 EMA.<br />
            <strong>Entry:</strong> 56,100 &nbsp; <strong>SL:</strong> 56,060 &nbsp; <strong>Target:</strong> 56,180
          </p>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-8">
          <div><strong className="text-green-600">Pros:</strong><strong className="text-green-600"> Fast signals • Simple to use</strong></div>
          <div><strong className="text-red-600">Cons:</strong><strong className="text-red-600"> More false signals in sideways markets</strong></div>
        </div>
      </div>

      {/* 8. Numerical Strategy */}
      <div className="bg-white border border-gray-200 rounded-3xl p-10">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Star className="text-teal-600" size={32} />
          </div>
          <div>
            <h2 className="text-black font-semibold">8. Numerical Strategy</h2>
            <p className="text-gray-500 mt-1 text-lg">Rule-based trading using calculated levels</p>
          </div>
        </div>

        <div className="space-y-6 text-gray-700">
          <p><strong>Description:</strong> A trading framework that uses predefined numerical levels or calculations to identify potential support, resistance, entry, and exit zones.</p>
          <p><strong>When to Use:</strong> Before market open • While planning key trading levels</p>
          <p><strong>Market Conditions:</strong> Can be adapted to bullish, bearish, or sideways markets</p>
          <p><strong>Best Timeframe:</strong> Depends on the calculation method; commonly intraday or daily planning</p>
          <p><strong>Risk Management:</strong> Risk only a small percentage of capital per trade • Avoid taking every numerical level without confirmation</p>
          <p><strong>Example:</strong> If a calculated resistance is ₹1,250 and price rejects that level with bearish confirmation, a trader may consider a short position with a stop above the rejection high.</p>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-8">
          <div><strong className="text-green-600">Pros:</strong><strong className="text-green-600"> Encourages rule-based trading • Helps remove emotional decision-making:</strong></div>
          <div><strong className="text-red-600">Cons:</strong><strong className="text-red-600"> Effectiveness depends entirely on the quality of the calculation method • Requires testing and validation before live trading</strong></div>
        </div>
      </div>

    </div>
  </div>
)} 
	{activeTab === 'faq' && (
  <div className="max-w-4xl mx-auto">
    <div className="mb-12 text-center">
      <h1 className="text-4xl font-semibold mb-4">Frequently Asked Questions</h1>
      <p className="text-gray-600 text-lg">Everything you need to know about EliteTrade Academy</p>
    </div>

    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-3xl p-8">
        <h3 className="text-black font-semibold mb-4">1. What is EliteTrade Academy?</h3>
        <p className="text-gray-700 leading-relaxed">EliteTrade Academy is a complete learning and trading platform designed to help beginners and intermediate traders master the stock market. It includes educational content, live tools like Option Chain, Trading Journal, and premium strategies.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-8">
        <h3 className="text-black font-semibold mb-4">2. Is this platform free or paid?</h3>
        <p className="text-gray-700 leading-relaxed">The basic learning modules and some tools are completely free. Premium features like Dashboard, Option Chain with live updates, Trading Journal, and exclusive Strategies are available only for Premium users.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-8">
        <h3 className="text-black font-semibold mb-4">3. How do I become a Premium member?</h3>
        <p className="text-gray-700 leading-relaxed">You can upgrade to Premium directly from the login screen or through the profile section. Premium unlocks advanced tools and strategies to help you trade better.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-8">
        <h3 className="text-black font-semibold mb-4">4. Does the Trading Journal save my data?</h3>
        <p className="text-gray-700 leading-relaxed">Yes. Your trades are saved in your browser's local storage. As long as you use the same browser and device, your journal remains safe.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-8">
        <h3 className="text-black font-semibold mb-4">5. Is the Option Chain data real-time?</h3>
        <p className="text-gray-700 leading-relaxed">Yes, during market hours (9:15 AM - 3:30 PM, Monday to Friday), the Option Chain shows simulated live price updates. Outside market hours, it shows static data.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-8">
        <h3 className="text-black font-semibold mb-4">6. Can I use this on mobile?</h3>
        <p className="text-gray-700 leading-relaxed">Yes. The platform is fully responsive and works well on mobile phones and tablets.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-8">
        <h3 className="text-black font-semibold mb-4">7. Are the strategies guaranteed to make profit?</h3>
        <p className="text-gray-700 leading-relaxed">No. No trading strategy guarantees profit. Always use proper risk management and trade with money you can afford to lose.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-8">
        <h3 className="text-black font-semibold mb-4">8. How do I contact support?</h3>
        <p className="text-gray-700 leading-relaxed">You can reach us through the Contact tab or by emailing support@elitetraadeacademy.com.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-8">
        <h3 className="text-black font-semibold mb-4">9. Is my personal data safe?</h3>
        <p className="text-gray-700 leading-relaxed">Yes. We do not store any sensitive personal or financial data on our servers. Your trading journal is saved locally in your browser.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-8">
        <h3 className="text-black font-semibold mb-4">10. Can beginners use this platform?</h3>
        <p className="text-gray-700 leading-relaxed">Absolutely! The "Learn Basics" section is made especially for beginners. Start there, then slowly move to tools and strategies as you gain confidence.</p>
      </div>
    </div>
  </div>
)}


                    {activeTab === 'contact' && (
  <div className="max-w-2xl mx-auto">
    <div className="text-center mb-12">
      <h1 className="text-4xl font-semibold mb-4">Get In Touch</h1>
      <p className="text-gray-600">Have questions? We'd love to hear from you.</p>
    </div>
    <div className="bg-white border border-gray-200 rounded-3xl p-10">
      <div className="space-y-8">
        <div>
          <label className="text-black">Your Name</label>
          <input type="text" className="w-full p-4 border rounded-2xl" placeholder="Enter your name" />
        </div>
        <div>
          <label className="text-black">Email Address</label>
        <input type="email" className="w-full p-4 border rounded-2xl" placeholder="your@email.com" />
        </div>
        <div>
          <label className="text-black">Message</label>
          <textarea rows={6} className="w-full p-4 border rounded-3xl" placeholder="How can we help you?"></textarea>
        </div>
        <button className="w-full bg-black text-white py-4 rounded-2xl text-lg hover:bg-gray-800 transition">
          Send Message
        </button>
      </div>
    </div>
  </div>
)}
          </div>
        </div>
      )}
    </div>
  );
}