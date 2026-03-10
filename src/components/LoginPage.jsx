import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookIcon, GoogleIcon, GitHubIcon } from './Icons'
import SignInForm from './SignInForm'
import SignUpForm from './SignUpForm'
import AccountChooser from './AccountChooser'
import GoogleAccountChooser from './GoogleAccountChooser'
import s from './PageTurn.module.css'

export default function LoginPage() {
  const [tab, setTab] = useState('signin')
  const [modal, setModal] = useState(null)
  const navigate = useNavigate()
  const close = () => setModal(null)

  const handleLoginSuccess = (user) => {
    // Save user to session so ProtectedApp lets them through
    sessionStorage.setItem('pt_user', JSON.stringify(user))
    close()
    navigate('/')
  }

  const handleOAuthSelect = (acc) => {
    handleLoginSuccess({ name: acc.name || acc.username, email: acc.email || `${acc.username}@github.com`, avatar: acc.initials })
  }

  return (
    <>
      <div className={s.layout}>
        {/* ── LEFT PANEL ── */}
        <div className={s.left}>
          <div className={s.brand}>
            <BookIcon />
            <span className={s.brandName}>PageTurn</span>
          </div>
          <div className={s.hero}>
            <h1 className={s.heroTitle}>
              Find your next
              <em className={s.heroItalic}>great read</em>
            </h1>
            <p className={s.heroSub}>
              A curated library at your fingertips. Discover,{' '}
              collect, and lose yourself in stories that matter.
            </p>
          </div>
          <div className={s.decoCards}>
            <div className={`${s.decoCard} ${s.decoCard1}`} />
            <div className={`${s.decoCard} ${s.decoCard2}`} />
            <div className={`${s.decoCard} ${s.decoCard3}`} />
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className={s.right}>
          <div className={s.tabs}>
            <button
              className={`${s.tab} ${tab === 'signin' ? s.tabActive : s.tabInactive}`}
              onClick={() => setTab('signin')}
            >Sign In</button>
            <button
              className={`${s.tab} ${tab === 'signup' ? s.tabActive : s.tabInactive}`}
              onClick={() => setTab('signup')}
            >Sign Up</button>
          </div>

          {tab === 'signup'
            ? <SignUpForm
                onGoogleClick={() => setModal('google')}
                onGitHubClick={() => setModal('github')}
                onSuccess={handleLoginSuccess}
              />
            : <SignInForm
                onGoogleClick={() => setModal('google')}
                onGitHubClick={() => setModal('github')}
                onSuccess={handleLoginSuccess}
              />
          }
        </div>
      </div>

      {modal === 'github' && (
        <AccountChooser onSelect={handleOAuthSelect} onUseAnother={close} onBack={close} />
      )}
      {modal === 'google' && (
        <GoogleAccountChooser onSelect={handleOAuthSelect} onUseAnother={close} onBack={close} />
      )}
    </>
  )
}
