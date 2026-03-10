import React, { useState } from 'react'
import { EyeIcon, EyeOffIcon } from './Icons'
import s from './PasswordField.module.css'

export default function PasswordField({ label, placeholder = '', value, onChange }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className={s.field}>
      <label className={s.label}>{label}</label>
      <div className={s.wrap}>
        <input
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          className={s.input}
        />
        <button type="button" className={s.eye} onClick={() => setVisible(v => !v)}>
          {visible ? <EyeIcon /> : <EyeOffIcon />}
        </button>
      </div>
    </div>
  )
}
