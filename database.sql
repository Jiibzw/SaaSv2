-- Création de la table des coiffeurs
CREATE TABLE IF NOT EXISTS coiffeurs (
    id SERIAL PRIMARY KEY,
    salon_id VARCHAR(50) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    specialite VARCHAR(200),
    actif BOOLEAN DEFAULT true
);

-- Création de la table des réservations
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    salon_id VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    heure VARCHAR(10) NOT NULL,
    client_prenom VARCHAR(100) NOT NULL,
    client_nom VARCHAR(100) NOT NULL,
    client_tel VARCHAR(20) NOT NULL,
    coiffeur_id INTEGER REFERENCES coiffeurs(id),
    statut VARCHAR(20) DEFAULT 'en_attente', -- en_attente, confirme, annule
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Données initiales pour le salon Moderne
INSERT INTO coiffeurs (salon_id, prenom, nom, specialite, actif) VALUES 
('moderne', 'Sophie', 'Martin', 'Coupe & Coloration', true),
('moderne', 'Lucas', 'Dubois', 'Coupe homme & Barbe', true),
('moderne', 'Emma', 'Rousseau', 'Coiffure de mariage', true);

-- Données initiales pour le salon Chic
INSERT INTO coiffeurs (salon_id, prenom, nom, specialite, actif) VALUES 
('chic', 'Julie', 'Bertrand', 'Coupe VIP', true),
('chic', 'Thomas', 'Leroy', 'Coloration Luxe', true),
('chic', 'Sarah', 'Moreau', 'Coiffure Soirée', true);

-- Données initiales pour le salon Studio
INSERT INTO coiffeurs (salon_id, prenom, nom, specialite, actif) VALUES 
('studio', 'Sophie', 'Martin', 'Coupe & Coloration', true),
('studio', 'Lucas', 'Dubois', 'Coupe homme & Barbe', true),
('studio', 'Emma', 'Rousseau', 'Coiffure de mariage', true);

-- Données initiales pour le salon Beauté
INSERT INTO coiffeurs (salon_id, prenom, nom, specialite, actif) VALUES 
('beaute', 'Sophie', 'Martin', 'Coupe & Coloration', true),
('beaute', 'Lucas', 'Dubois', 'Coupe homme & Barbe', true),
('beaute', 'Emma', 'Rousseau', 'Coiffure de mariage', true);

-- Données initiales pour le salon Élégance
INSERT INTO coiffeurs (salon_id, prenom, nom, specialite, actif) VALUES 
('elegance', 'Sophie', 'Martin', 'Coupe & Coloration', true),
('elegance', 'Lucas', 'Dubois', 'Coupe homme & Barbe', true),
('elegance', 'Emma', 'Rousseau', 'Coiffure de mariage', true);
