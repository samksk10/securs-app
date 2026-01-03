// Dans la création de table
`CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(10) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    user_role VARCHAR(20) DEFAULT 'agent',  // CHANGÉ
    face_encoding TEXT,
    photo_url VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`

    // Dans les INSERT
    `INSERT INTO users (employee_id, full_name, email, password_hash, user_role) 
 VALUES ($1, $2, $3, $4, $5)`,
    [ 'ADMIN001', 'Administrateur Principal', 'admin@securis.com', adminPassword, 'admin' ]

        // Pour les agents
        `INSERT INTO users (employee_id, full_name, email, phone, password_hash, user_role) 
 VALUES ($1, $2, $3, $4, $5, $6)`,
    [ employeeId, fullName, email, phone, passwordHash, 'agent' ]