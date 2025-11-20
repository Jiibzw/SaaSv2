const db = require('../lib/db');

module.exports = async (req, res) => {
    // Enable CORS if needed, or rely on server.js static serving same origin
    
    if (req.method === 'GET') {
        const { salon_id } = req.query;
        
        if (!salon_id) {
            return res.status(400).json({ error: 'Missing salon_id' });
        }

        try {
            const { rows } = await db.query(
                `SELECT 
                    id, salon_id, to_char(date, 'YYYY-MM-DD') as date, 
                    heure, client_prenom, client_nom, client_tel, 
                    coiffeur_id, statut, created_at 
                FROM bookings 
                WHERE salon_id = $1 
                ORDER BY date ASC`,
                [salon_id]
            );
            return res.status(200).json(rows);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    if (req.method === 'POST') {
        const { salon_id, date, heure, client_prenom, client_nom, client_tel, coiffeur_id } = req.body;

        if (!salon_id || !date || !heure || !client_prenom || !client_nom || !client_tel || !coiffeur_id) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        try {
            const { rows } = await db.query(
                `INSERT INTO bookings (salon_id, date, heure, client_prenom, client_nom, client_tel, coiffeur_id, statut)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, 'en_attente')
                 RETURNING *`,
                [salon_id, date, heure, client_prenom, client_nom, client_tel, coiffeur_id]
            );
            return res.status(200).json(rows[0]);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    if (req.method === 'PATCH') {
        const { id, statut } = req.body;

        if (!id || !statut) {
            return res.status(400).json({ error: 'Missing id or statut' });
        }

        try {
            const { rows } = await db.query(
                'UPDATE bookings SET statut = $1 WHERE id = $2 RETURNING *',
                [statut, id]
            );
            return res.status(200).json(rows[0]);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
};
