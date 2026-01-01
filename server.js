const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = process.env.PORT || 3000;

const db = new sqlite3.Database(path.join(__dirname, "database.sqlite"));

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS demandes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      telephone TEXT NOT NULL,
      email TEXT NOT NULL,
      ville TEXT NOT NULL,
      typeTravaux TEXT NOT NULL,
      budget TEXT,
      delai TEXT,
      description TEXT,
      createdAt TEXT NOT NULL
    )
  `);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Routes pages (premium)
app.get("/", (_, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/devis", (_, res) => res.sendFile(path.join(__dirname, "public", "devis.html")));
app.get("/client", (_, res) => res.sendFile(path.join(__dirname, "public", "client.html")));
app.get("/artisan", (_, res) => res.sendFile(path.join(__dirname, "public", "artisan.html")));
app.get("/admin", (_, res) => res.sendFile(path.join(__dirname, "public", "admin.html")));

// API: créer une demande
app.post("/api/devis", (req, res) => {
  const { nom, telephone, email, ville, typeTravaux, budget, delai, description } = req.body || {};
  if (!nom || !telephone || !email || !ville || !typeTravaux || !description) {
    return res.status(400).json({ error: "Merci de remplir les champs obligatoires (*)" });
  }
  const createdAt = new Date().toISOString();
  db.run(
    `INSERT INTO demandes (nom, telephone, email, ville, typeTravaux, budget, delai, description, createdAt)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [nom, telephone, email, ville, typeTravaux, budget || "", delai || "", description, createdAt],
    function (err) {
      if (err) return res.status(500).json({ error: "Erreur base de données" });
      res.status(201).json({ ok: true, id: this.lastID });
    }
  );
});

// API: lister les demandes (admin)
app.get("/api/admin/demandes", (req, res) => {
  db.all("SELECT * FROM demandes ORDER BY id DESC LIMIT 200", (err, rows) => {
    if (err) return res.status(500).json({ error: "Erreur base de données" });
    res.json({ demandes: rows });
  });
});

app.listen(PORT, () => {
  console.log(`✅ CourtagePro premium lancé : http://localhost:${PORT}`);
  console.log(`   Pages: /  /devis  /client  /artisan  /admin`);
});
