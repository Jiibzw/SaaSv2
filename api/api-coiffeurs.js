const db = require('../lib/db');

module.exports = async (req, res) => {
    if (req.method === 'GET') {
        const { salon_id } = req.query;
        if (!salon_id) {
            return res.status(400).json({ error: 'Missing salon_id' });
        }
        try {
            const { rows } = await db.query(
                'SELECT * FROM coiffeurs WHERE salon_id = $1 ORDER BY nom ASC',
                [salon_id]
            );
            return res.status(200).json(rows);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    if (req.method === 'POST') {
        const { salon_id, prenom, nom, specialite, actif } = req.body;
        if (!salon_id || !prenom || !nom) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        try {
            const { rows } = await db.query(
                'INSERT INTO coiffeurs (salon_id, prenom, nom, specialite, actif) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [salon_id, prenom, nom, specialite, actif !== undefined ? actif : true]
            );
            return res.status(200).json(rows[0]);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    if (req.method === 'PATCH') {
        const { id, actif } = req.body;
        if (!id) {
            return res.status(400).json({ error: 'Missing id' });
        }
        try {
            const { rows } = await db.query(
                'UPDATE coiffeurs SET actif = $1 WHERE id = $2 RETURNING *',
                [actif, id]
            );
            return res.status(200).json(rows[0]);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    if (req.method === 'DELETE') {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: 'Missing id' });
        }
        try {
            await db.query('DELETE FROM coiffeurs WHERE id = $1', [id]);
            return res.status(200).json({ success: true });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
};
