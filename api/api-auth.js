const db = require('../lib/db');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        const { action } = req.body;

        if (action === 'login') {
            const { username, password, salon_id } = req.body;
            try {
                const { rows } = await db.query('SELECT * FROM users WHERE username = $1', [username]);
                if (rows.length === 0) return res.status(401).json({ error: 'Identifiants incorrects' });
                
                const user = rows[0];
                const match = await bcrypt.compare(password, user.password_hash);
                
                if (match) {
                    // Vérification du salon pour les comptes 'salon'
                    if (user.role === 'salon' && user.salon_id && user.salon_id !== salon_id) {
                        return res.status(403).json({ error: 'Ce compte n\'a pas accès à ce salon' });
                    }

                    return res.status(200).json({ 
                        success: true, 
                        user: { username: user.username, role: user.role, name: user.username === 'admin' ? 'Administrateur' : 'Gérant' } 
                    });
                } else {
                    return res.status(401).json({ error: 'Identifiants incorrects' });
                }
            } catch (e) {
                return res.status(500).json({ error: e.message });
            }
        }

        if (action === 'change_password') {
            const { username, old_password, new_password } = req.body;
            try {
                const { rows } = await db.query('SELECT * FROM users WHERE username = $1', [username]);
                if (rows.length === 0) return res.status(404).json({ error: 'Utilisateur non trouvé' });
                
                const user = rows[0];
                const match = await bcrypt.compare(old_password, user.password_hash);
                
                if (!match) return res.status(401).json({ error: 'Ancien mot de passe incorrect' });
                
                const newHash = await bcrypt.hash(new_password, 10);
                await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, user.id]);
                
                return res.status(200).json({ success: true });
            } catch (e) {
                return res.status(500).json({ error: e.message });
            }
        }

        if (action === 'reset_password') {
            const { username, recovery_key, new_password } = req.body;
            
            // Clé de récupération définie dans l'environnement ou par défaut
            const VALID_RECOVERY_KEY = process.env.RECOVERY_KEY || 'admin_rescue_2025';
            
            if (recovery_key !== VALID_RECOVERY_KEY) {
                return res.status(401).json({ error: 'Clé de récupération invalide' });
            }
            
            try {
                const newHash = await bcrypt.hash(new_password, 10);
                const result = await db.query('UPDATE users SET password_hash = $1 WHERE username = $2', [newHash, username]);
                
                if (result.rowCount === 0) return res.status(404).json({ error: 'Utilisateur non trouvé' });
                
                return res.status(200).json({ success: true });
            } catch (e) {
                return res.status(500).json({ error: e.message });
            }
        }
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
};
