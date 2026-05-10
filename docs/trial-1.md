### **Direction**

### **Sidebar (left, fixed):**

* **LMCS logo** at top center  
* **User card:** avatar circle \+ full name \+ role label ("Direction")  
* **Navigation links** (with icon \+ label each):  
* 📊 Dashboard  
* 👥 Charge d'encadrements  
* 📄 Rapports & Exports  
* **Déconnexion** button pinned at very bottom with logout icon

(active state \= highlighted background (navy blue))

### **Navbar (top, fixed):**

* **Left:** Page title (changes per page) \+ subtitle "Bienvenue M/Mme \[Nom\]"  
* **Right:** 🌙 dark mode toggle \+ 🌐 language switcher \+ 🔔 notifications bell with red badge counter

# **PAGE 1 — Dashboard**

**Purpose:** Bird's-eye view of the entire laboratory's supervision activity.

## **Display — Top Row: 3 KPI Cards**

**Card 1 — Nombre total d'encadrements:**

* → Total count (all time)  
* → Sub-label: "encadrements enregistrés"

**Card 2 — Répartition par type:**

* → PFE / Master / Doctorat / Stage counts  
* → Displayed as small labeled numbers inside the card

**Card 3 — Nombre d'enseignants actifs \[ Important \] :**

* → Count of enseignants with at least one encadrement En cours  
* → Sub-label: "enseignants actifs"

## **Display — Bottom Row: 2 Charts**

**Chart 1 — Line chart: \[ Important \]**

* Title: "Évolution des encadrements"  
* X-axis: Academic years (2021, 2022, 2023, 2024, 2025\)  
* Y-axis: Number of supervisions (all laboratory)  
* One blue line showing evolution over time  
* No click interaction

**Chart 2 — Bar chart \[ Important \] :**

* Title: "Encadrements par type"  
* X-axis: PFE / Master / Doctorat / Stage / Projet  
* Y-axis: Count  
* Each bar a different color  
* No click interaction

# **PAGE 2 — Charge d'encadrements \[ Important \]**

**Purpose:** Compare the supervision workload across all enseignants/chercheurs to identify imbalances.

## **Display — Filter Bar \[ Important \]**

A horizontal row directly below the navbar containing:

* **Dropdown:** Période (Tous / 2023 / 2024 / 2025 / 2026\)  
* **Dropdown:** État (Tous / En cours / En attente / Terminé)  
* **Dropdown:** Type (Tous / PFE / Master / Doctorat / Stage / Projet)  
* "Filtrer" button (navy blue)

**Behavior:** Filters apply only when "Filtrer" is clicked. All dropdowns default to "Tous".

## **Display — Comparative Table \[ Important \]**

Columns: **Enseignant | Encadrements totaux | En cours | En attente | Terminé** 

* Each row \= one enseignant/chercheur

# **PAGE 3 — Rapports & Exports \[ super important \]**

**Purpose:** The Direction generates and downloads reports about the laboratory's supervisions in different formats.

**Display — Section 1: Export Rapide \[ Discarded \]**  
A row with the label "Exporter tous les encadrements du laboratoire" on the left. On the right a format dropdown (PDF / Excel) followed by a "Télécharger" navy button. One click downloads the full list immediately.

**Display — Section 2: Rapport Personnalisé \[ Important  \]**  
Four filters in a horizontal row:

* Date range picker: Du (start) → Au (end)  
* **Dropdown:** Enseignant (Tous / \[list of enseignants by name\])  
* **Dropdown:** Type (Tous / PFE / Master / Doctorat / Stage)  
* **Dropdown:** Statut (Tous / En cours / En attente / Terminé)

A "Générer" navy button below the filters. Clicking it shows a preview table of the filtered results below.  
Preview table columns:

* Étudiant | Enseignant | Type | Thématique | Année | Statut

Under the preview a single "Télécharger" navy button (PDF / Excel dropdown beside it).  
