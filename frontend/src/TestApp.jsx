import React from 'react';

function TestApp() {
    return (
        <div style={ { padding: '20px', fontFamily: 'Arial' } }>
            <h1>✅ Sécuris Frontend Test</h1>
            <p>Si tu vois ce message, React fonctionne !</p>
            <div style={ { marginTop: '20px', padding: '10px', background: '#f0f0f0' } }>
                <h3>Tests API Backend :</h3>
                <button onClick={ () => {
                    fetch('http://localhost:5000/api/health')
                        .then(res => res.json())
                        .then(data => alert('Backend OK: ' + JSON.stringify(data)))
                        .catch(err => alert('Erreur backend: ' + err.message));
                } }>
                    Tester Backend (Health Check)
                </button>
            </div>
        </div>
    );
}

export default TestApp;