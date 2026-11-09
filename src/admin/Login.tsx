import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { InstitutionSettings as InstitutionConfig } from '../institution'
import { demoAccounts, Role, signIn } from '../auth'

export default function Login({
  onLogin,
  institution,
}: {
  onLogin: (role: Role) => void
  institution: InstitutionConfig
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState(demoAccounts[1].email)
  const [password, setPassword] = useState('universidad')
  const [error, setError] = useState('')

  function submit(event: FormEvent) {
    event.preventDefault()
    const role = signIn(email, password)
    if (role) {
      setError('')
      onLogin(role)
    } else setError('Datos incorrectos. Usa una cuenta de demostración y la contraseña universidad.')
  }

  return (
    <main className="login-page">
      <section className="login-brand-panel">
        <div className="login-brand-content">
          <div className="brand-mark brand-mark--light">
            <GraduationCap size={27} />
          </div>
          <p className="eyebrow">GESTIÓN UNIVERSITARIA</p>
          <h1>
            {institution.name}
            <br />
            en un solo lugar.
          </h1>
          <p className="login-intro">{institution.tagline}. Un acceso para administración, docentes y alumnos.</p>
          <div className="login-proof">
            <div className="proof-avatars">
              <span>AM</span>
              <span>CR</span>
              <span>DV</span>
            </div>
            <div>
              <strong>Una experiencia más simple</strong>
              <small>para toda la comunidad universitaria</small>
            </div>
          </div>
        </div>
        <div className="brand-orbit brand-orbit-one" />
        <div className="brand-orbit brand-orbit-two" />
      </section>

      <section className="login-form-panel">
        <form className="login-card" onSubmit={submit}>
          <div className="mobile-logo">
            <div className="brand-mark">
              <GraduationCap size={24} />
            </div>
            <span>{institution.shortName} · CampusOne</span>
          </div>
          <p className="eyebrow eyebrow--dark">BIENVENIDO DE NUEVO</p>
          <h2>Inicia sesión</h2>
          <p className="form-subtitle">Ingresa con tu cuenta. Te llevaremos al portal que corresponde a tu rol.</p>

          <label>
            Correo institucional
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label>
            Contraseña
            <div className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button type="button" onClick={() => setShowPassword((value) => !value)}>
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </label>
          <button className="primary-button" type="submit">
            Entrar a la plataforma
          </button>
          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}
          <p className="demo-note">Demostración: elige una cuenta. Contraseña: universidad.</p>
          <div className="demo-accounts">
            {demoAccounts.map((account) => (
              <button
                type="button"
                key={account.role}
                onClick={() => {
                  setEmail(account.email)
                  setError('')
                }}
              >
                {account.label}
              </button>
            ))}
          </div>
          <Link className="student-access-link" to="/aspirantes">
            ¿Eres aspirante? Consulta admisiones
          </Link>
          <a className="institution-contact" href={`mailto:${institution.contactEmail}`}>
            Contacto institucional: {institution.contactEmail}
          </a>
        </form>
      </section>
    </main>
  )
}
