import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import '../styles/LoginForm.css';

function LoginForm() {
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ error, setError ] = useState(null);
    const [ loading, setLoading ] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError(null);

        try {
            await authService.login(email, password);
            navigate('/');
        } catch (err) {
            setError('Échec de la connexion. Vérifiez vos identifiants.');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={ handleSubmit }>
            <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="username"
                    className="form-control form-control-lg"
                    value={ email }
                    onChange={ (e) => setEmail(e.target.value) }
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="password">Mot de passe:</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    autoComplete="current-password"
                    className="form-control form-control-lg"
                    placeholder="••••••••"
                    value={ password }
                    onChange={ (e) => setPassword(e.target.value) }
                    required
                />
            </div>
            { error && <div className="error">{ error }</div> }
            <button type="submit" disabled={ loading } className="btn btn-primary w-100">
                { loading ? 'Connexion...' : 'Se connecter' }
            </button>
        </form>
    );
}

export default LoginForm;