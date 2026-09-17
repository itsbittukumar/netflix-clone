import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please enter a valid email and password.')
      return
    }
    // Demo-only auth: no backend is wired up in this clone.
    // Wire this up to your own auth service / API before using it for real.
    navigate('/')
  }

  return (
    <div className="nf-login">
      <div className="nf-login__overlay">
        <header className="nf-login__header">
          <span className="brand-logo">NETFLIX</span>
        </header>

        <div className="nf-login__box">
          <h1>{isSignUp ? 'Sign Up' : 'Sign In'}</h1>
          {error && <div className="nf-login__error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="nf-login__field">
              <input
                type="email"
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                id="email"
              />
              <label htmlFor="email">Email or phone number</label>
            </div>
            <div className="nf-login__field">
              <input
                type="password"
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                id="password"
              />
              <label htmlFor="password">Password</label>
            </div>
            <button type="submit" className="nf-login__submit">
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
            <div className="nf-login__helpers">
              <label className="nf-login__remember">
                <input type="checkbox" defaultChecked /> Remember me
              </label>
              <a href="#">Need help?</a>
            </div>
          </form>

          <p className="nf-login__signup">
            {isSignUp ? 'Already have an account? ' : 'New to Netflix? '}
            <button className="nf-login__link" onClick={() => setIsSignUp((v) => !v)}>
              {isSignUp ? 'Sign in now.' : 'Sign up now.'}
            </button>
          </p>
          <p className="nf-login__captcha">
            This page is protected by demo reCAPTCHA. Learn more.
          </p>
        </div>
      </div>
    </div>
  )
}
