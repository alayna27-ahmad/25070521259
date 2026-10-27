import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';

const request = async (path, options = {}) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) }
  }).catch(() => { throw new Error('Cannot reach the server. Make sure it is running.'); });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
};

const icon = paths => props => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>{paths}</svg>;
const UserIcon = icon(<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>);
const MailIcon = icon(<><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></>);
const LockIcon = icon(<><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>);
const EyeIcon = icon(<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>);
const EyeOffIcon = icon(<><path d="M9.9 4.24A10.4 10.4 0 0 1 12 4c6.5 0 10 8 10 8a17.6 17.6 0 0 1-2.16 3.19M6.6 6.6A17.4 17.4 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /><path d="m2 2 20 20" /></>);
const ShieldIcon = icon(<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></>);
const LogoutIcon = icon(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></>);
const CalendarIcon = icon(<><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>);
const ClockIcon = icon(<><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>);
const BoltIcon = icon(<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />);
const DatabaseIcon = icon(<><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" /></>);
const AlertIcon = icon(<><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></>);
const CheckIcon = icon(<><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></>);
const ArrowIcon = icon(<path d="M5 12h14M13 5l7 7-7 7" />);

const LEVELS = [['Too short', '#f87171'], ['Weak', '#f87171'], ['Fair', '#fbbf24'], ['Good', '#60a5fa'], ['Strong', '#34d399']];
const strength = pw => [pw.length >= 6, pw.length >= 10, /[a-z]/.test(pw) && /[A-Z]/.test(pw), /\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
const initials = name => name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');

function Logo() {
  return <div className="brand"><span className="logo"><BoltIcon /></span>25070521259</div>;
}

function Field({ icon: Icon, label, type = 'text', ...props }) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return <label className="field">
    <span className="field-label">{label}</span>
    <span className="field-box">
      <Icon />
      <input type={isPassword && show ? 'text' : type} {...props} />
      {isPassword && <button type="button" className="eye" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOffIcon /> : <EyeIcon />}</button>}
    </span>
  </label>;
}

function Alert({ type, children }) {
  return <div className={`alert ${type}`}>{type === 'error' ? <AlertIcon /> : <CheckIcon />}{children}</div>;
}

function SubmitButton({ loading, children }) {
  return <button className="btn" type="submit" disabled={loading}>{loading ? <span className="spinner" /> : <>{children}<ArrowIcon /></>}</button>;
}

function SignUp({ onSwitch, onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const update = e => setForm({ ...form, [e.target.name]: e.target.value });
  const score = strength(form.password);
  const [label, color] = LEVELS[score];
  const submit = async e => {
    e.preventDefault();
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    setError(''); setLoading(true);
    try {
      const { name, email, password } = form;
      const data = await request('/api/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, password }) });
      onSuccess(email, data.message);
    } catch (error) { setError(error.message); }
    setLoading(false);
  };
  return <form className="form" onSubmit={submit}>
    <h2>Create your account</h2>
    <p className="sub">Join in seconds. It’s free and secure.</p>
    {error && <Alert type="error">{error}</Alert>}
    <Field icon={UserIcon} label="Full name" required name="name" value={form.name} onChange={update} placeholder="Jane Doe" autoComplete="name" />
    <Field icon={MailIcon} label="Email address" type="email" required name="email" value={form.email} onChange={update} placeholder="you@example.com" autoComplete="email" />
    <Field icon={LockIcon} label="Password" type="password" required minLength={6} name="password" value={form.password} onChange={update} placeholder="At least 6 characters" autoComplete="new-password" />
    {form.password && <div className="meter">
      <div className="bars">{[1, 2, 3, 4].map(i => <i key={i} style={i <= score ? { background: color } : undefined} />)}</div>
      <span style={{ color }}>{label}</span>
    </div>}
    <Field icon={LockIcon} label="Confirm password" type="password" required minLength={6} name="confirm" value={form.confirm} onChange={update} placeholder="Repeat your password" autoComplete="new-password" />
    <SubmitButton loading={loading}>Create account</SubmitButton>
    <p className="switch">Already have an account? <button type="button" className="link" onClick={onSwitch}>Sign in</button></p>
  </form>;
}

function SignIn({ onSwitch, onLogin, notice, defaultEmail }) {
  const [form, setForm] = useState({ email: defaultEmail, password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const update = e => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = await request('/api/auth/signin', { method: 'POST', body: JSON.stringify(form) });
      localStorage.setItem('token', data.token);
      onLogin(data.data);
    } catch (error) { setError(error.message); setLoading(false); }
  };
  return <form className="form" onSubmit={submit}>
    <h2>Welcome back</h2>
    <p className="sub">Sign in to continue to your dashboard.</p>
    {error ? <Alert type="error">{error}</Alert> : notice && <Alert type="success">{notice}</Alert>}
    <Field icon={MailIcon} label="Email address" type="email" required name="email" value={form.email} onChange={update} placeholder="you@example.com" autoComplete="email" />
    <Field icon={LockIcon} label="Password" type="password" required name="password" value={form.password} onChange={update} placeholder="Your password" autoComplete="current-password" />
    <SubmitButton loading={loading}>Sign in</SubmitButton>
    <p className="switch">New here? <button type="button" className="link" onClick={onSwitch}>Create an account</button></p>
  </form>;
}

function Auth({ onLogin }) {
  const [view, setView] = useState('signin');
  const [notice, setNotice] = useState('');
  const [email, setEmail] = useState('');
  const switchTo = next => { setView(next); setNotice(''); };
  const signedUp = (newEmail, message) => { setEmail(newEmail); setNotice(message); setView('signin'); };

  return <div className="auth">
    <section className="hero">
      <Logo />
      <h1>Your space,<br /><span className="gradient-text">beautifully secured.</span></h1>
      <p>Create an account, sign in, and step into a personal dashboard built around you.</p>
      <ul className="perks">
        <li><span><ShieldIcon /></span>Passwords encrypted with bcrypt</li>
        <li><span><BoltIcon /></span>Fast, token-based secure sessions</li>
        <li><span><DatabaseIcon /></span>Your details safely stored in MongoDB</li>
      </ul>
    </section>
    <div className="card auth-card">
      <div className="tabs" data-view={view}>
        <span className="pill" />
        <button type="button" className={view === 'signin' ? 'active' : ''} onClick={() => switchTo('signin')}>Sign In</button>
        <button type="button" className={view === 'signup' ? 'active' : ''} onClick={() => switchTo('signup')}>Sign Up</button>
      </div>
      {view === 'signin'
        ? <SignIn key={email} notice={notice} defaultEmail={email} onLogin={onLogin} onSwitch={() => switchTo('signup')} />
        : <SignUp onSuccess={signedUp} onSwitch={() => switchTo('signin')} />}
    </div>
  </div>;
}

function Dashboard({ user, onLogout }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const joined = new Date(user.createdAt);
  const days = Math.max(1, Math.ceil((Date.now() - joined) / 86400000));
  const stats = [
    { icon: ShieldIcon, tone: 'green', label: 'Account status', value: 'Active' },
    { icon: CalendarIcon, tone: 'violet', label: 'Member since', value: joined.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) },
    { icon: ClockIcon, tone: 'cyan', label: 'Days with us', value: days }
  ];

  return <div className="dash">
    <header className="topbar">
      <Logo />
      <div className="topbar-right">
        <div className="user-chip"><span className="avatar">{initials(user.name)}</span><div><strong>{user.name}</strong><small>{user.email}</small></div></div>
        <button className="btn-ghost" onClick={onLogout}><LogoutIcon />Sign out</button>
      </div>
    </header>

    <section className="card welcome">
      <span className="avatar lg">{initials(user.name)}</span>
      <div>
        <span className="badge"><i />Signed in</span>
        <h1>{greeting}, <span className="gradient-text">{user.name.split(' ')[0]}</span> 👋</h1>
        <p>Great to see you. Here’s a quick look at your account.</p>
      </div>
    </section>

    <section className="stats">
      {stats.map(({ icon: Icon, tone, label, value }, i) => <div className="card stat" key={label} style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
        <span className={`stat-icon ${tone}`}><Icon /></span>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>)}
    </section>

    <section className="card profile">
      <h3>Profile details</h3>
      <div className="row"><span><UserIcon />Full name</span><strong>{user.name}</strong></div>
      <div className="row"><span><MailIcon />Email</span><strong>{user.email}</strong></div>
      <div className="row"><span><CalendarIcon />Joined</span><strong>{joined.toLocaleString()}</strong></div>
      <div className="row"><span><LockIcon />Password</span><strong className="secure">Encrypted ✓</strong></div>
    </section>
  </div>;
}

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(() => !!localStorage.getItem('token'));

  useEffect(() => {
    if (!checking) return;
    request('/api/auth/me').then(d => setUser(d.data)).catch(() => localStorage.removeItem('token')).finally(() => setChecking(false));
  }, []);

  const logout = () => { localStorage.removeItem('token'); setUser(null); };

  return <>
    <div className="bg"><span className="blob b1" /><span className="blob b2" /><span className="blob b3" /></div>
    {checking ? <div className="loader"><span className="spinner" /></div>
      : user ? <Dashboard user={user} onLogout={logout} />
      : <Auth onLogin={setUser} />}
  </>;
}
createRoot(document.getElementById('root')).render(<App />);
