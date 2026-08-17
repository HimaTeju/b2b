import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Login.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-page__container">
        <div className="auth-page__header">
          <span className="eyebrow">Industrial Exchange</span>
          <h1 className="auth-page__title">B2B WORKS</h1>
          <p className="auth-page__subtitle">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-page__form">
          {error && <div className="banner">{error}</div>}

          <div className="field">
            <label htmlFor="email" className="field__label">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
          </div>

          <div className="field">
            <label htmlFor="password" className="field__label">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <div className="auth-page__footer">
            <p className="auth-page__footer-text">
              Don't have an account?{' '}
              <button type="button" onClick={() => navigate('/register')} className="auth-page__link">
                Sign up
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
