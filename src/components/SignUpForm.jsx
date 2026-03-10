import React, { useState } from 'react'
import { GoogleIcon, GitHubIcon } from './Icons'
import PasswordField from './PasswordField'
import s from './AuthForm.module.css'

export default function SignUpForm({ onGoogleClick, onGitHubClick, onSuccess }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    setError('')
    if (!name || !email || !password || !confirm) { setError('Please fill in all fields.'); return }
    if (!email.includes('@')) { setError('Please enter a valid email.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    // Simulate successful signup — replace with real API call
    onSuccess({ name, email })
  }

  return (
    <div className={s.form}>
      <div className={s.header}>
        <h2 className={s.title}>Create account</h2>
        <p className={s.subtitle}>Join PageTurn and start reading</p>
      </div>

      <div className={s.oauthRow}>
        <button className={s.oauthBtn} onClick={onGoogleClick} type="button">
          <GoogleIcon /> Google
        </button>
        <button className={s.oauthBtn} onClick={onGitHubClick} type="button">
          <GitHubIcon /> GitHub
        </button>
      </div>

      <div className={s.divider}><span>or continue with email</span></div>

      <div className={s.field}>
        <label className={s.label}>Full Name</label>
        <input
          type="text" placeholder="Robert Martin" className={s.input}
          value={name} onChange={e => setName(e.target.value)}
        />
      </div>

      <div className={s.field}>
        <label className={s.label}>Email Address</label>
        <input
          type="email" placeholder="you@example.com" className={s.input}
          value={email} onChange={e => setEmail(e.target.value)}
        />
      </div>

      <PasswordField label="Password" placeholder="Enter password" value={password} onChange={setPassword} />
      <PasswordField label="Confirm Password" placeholder="Confirm password" value={confirm} onChange={setConfirm} />

      {error && <p className={s.errorMsg}>{error}</p>}

      <button className={s.ctaBtn} type="button" onClick={handleSubmit}>Create Account</button>
    </div>
  )
}
