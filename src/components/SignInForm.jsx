import React, { useState } from 'react'
import { GoogleIcon, GitHubIcon } from './Icons'
import PasswordField from './PasswordField'
import s from './AuthForm.module.css'

export default function SignInForm({ onGoogleClick, onGitHubClick, onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    setError('')
    if (!email || !password) { setError('Please fill in all fields.'); return }
    if (!email.includes('@')) { setError('Please enter a valid email.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    // Simulate successful login — replace with real API call
    onSuccess({ name: email.split('@')[0], email })
  }

  return (
    <div className={s.form}>
      <div className={s.header}>
        <h2 className={s.title}>Welcome back</h2>
        <p className={s.subtitle}>Sign in to continue reading</p>
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
        <label className={s.label}>Email Address</label>
        <input
          type="email" placeholder="you@example.com" className={s.input}
          value={email} onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />
      </div>

      <PasswordField label="Password" placeholder="Enter password" value={password} onChange={setPassword} />

      <div className={s.forgotRow}>
        <a href="#forgot" className={s.forgotLink}>Forgot password?</a>
      </div>

      {error && <p className={s.errorMsg}>{error}</p>}

      <button className={s.ctaBtn} type="button" onClick={handleSubmit}>Sign In</button>
    </div>
  )
}
