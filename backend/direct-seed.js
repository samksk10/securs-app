// Dans les INSERT, changer "role" par "user_role"
await client.query(`
  INSERT INTO users (employee_id, full_name, email, password_hash, user_role, is_active)
  VALUES ($1, $2, $3, $4, $5, $6)
  ON CONFLICT (employee_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    user_role = EXCLUDED.user_role,
    is_active = EXCLUDED.is_active
`, [ 'ADMIN001', 'Administrateur Principal', 'admin@securis.com', adminPassword, 'admin', true ]);

// Pour les agents aussi
await client.query(`
  INSERT INTO users (employee_id, full_name, email, phone, password_hash, user_role, is_active)
  VALUES ($1, $2, $3, $4, $5, $6, $7)
  ON CONFLICT (employee_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    password_hash = EXCLUDED.password_hash,
    user_role = EXCLUDED.user_role,
    is_active = EXCLUDED.is_active
`, [ employeeId, fullName, email, phone, passwordHash, 'agent', true ]);