import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/App.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(formData.name, formData.email, formData.password, formData.phone);
      }

      if (result.success) {
        alert(`${isLogin ? 'Login' : 'Registration'} successful!`);
        navigate('/');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="login-container">
      <h2 className="login-title">{isLogin ? 'Login' : 'Sign Up'}</h2>
      
      {error && (
        <div style={{ 
          background: '#fee', 
          color: '#c00', 
          padding: '0.75rem', 
          borderRadius: '8px', 
          marginBottom: '1rem',
          fontSize: '0.875rem'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
        )}
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            className="form-input"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            className="form-input"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
          />
        </div>
        {!isLogin && (
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              className="form-input"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
        )}
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
        </button>
      </form>
      
      <div className="auth-switch">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button onClick={() => {
          setIsLogin(!isLogin);
          setError('');
        }}>
          {isLogin ? 'Sign Up' : 'Login'}
        </button>
      </div>
    </div>
  );
};

export default Login;