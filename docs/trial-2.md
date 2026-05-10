**PAGE 1: Tableau de bord global (Global Dashboard)**

*Maps to UCD: "View global dashboard" and its includes.*

* **Purpose:** Provide an instant, visual snapshot of the laboratory's supervision health.  
* **Top Row — KPI Cards (Key Performance Indicators):**  
  * **Total Encadrements Actifs:** Total ongoing supervisions for the selected year.  
  * **Taux de Soutenance (Defense Rate) \[ Important \] :** Percentage of completed vs. planned defenses (Required by CDC & UCD).  
  * **Taux de Validation \[ Discarded \] :** Percentage of supervision records that are fully completed/validated in the system vs. drafts (Specific to UCD).  
* **Middle Row — Visual Analytics (Charts):**  
  * **Chart 1: Répartition par Type (Distribution by type) \[ Important \] :** A Donut chart showing the split between PFE, Master, Doctorat, and Stages.  
  * **Chart 2: État d'avancement (Statuses) \[ Important \] :** A Stacked Bar chart showing statuses (En cours, Soutenu, Abandonné, Prolongation) grouped by type.  
*    
* **Bottom Row — Thematic Analysis:**  
  * **Chart 3: Répartition Thématique (Thematic distribution):** A Radar chart or horizontal Bar chart showing how supervisions map to the lab's specific research axes/teams (Required by UCD & CDC). **\[ Important \]** 

**PAGE 2: Suivi de la charge d'encadrement (Workload Monitoring) \[ Important \]**

*Maps to UCD: "Monitor supervision workload".*

* **Purpose \[ not our usecase \] :** Allow the director to see who is supervising what, ensuring fair workload distribution and preventing burnout or overload.  
* **Filters (Top row) \[ important \] :** Search by Teacher Name, Filter by Lab Team/Axe.  
* **Main Data Table \[important \] :**  
  * **Columns:** Nom de l'enseignant | Équipe de recherche | PFEs actifs | Masters actifs | Doctorats actifs | **Charge Totale (Total Workload)**.  
  * **Visual Cues:** The "Charge Totale" column should use color-coding (e.g., Green for optimal load, Orange for heavy load, Red for overload) based on lab rules.  
*    
* **Interaction:** Clicking on a teacher's row opens an expandable panel or modal showing the *names of the students* and *project titles* they are currently supervising.

**PAGE 3: Recherche multicritère (Advanced Search) \[ Important \]**

*Maps to UCD: "Advanced multicriteria search".*

* **Purpose:** A powerful search engine for the director to find specific students, projects, or historical data across all years.    
* **Search Interface (A rich filter panel at the top)  \[ important \]  :**  
  * *Text Search:* Student name, Project title, Keywords.  
  * *Dropdowns (Multi-select):* Enseignant/Chercheur, Année universitaire, Type d’encadrement, Thématique, État d’avancement.  
  * *Checkbox:* "Inclure les co-encadrements externes".  
* **Results Table \[ important \-\> Links to specific pages like single supervision, single student etc… \] :**  
  * Columns: Titre du sujet | Étudiant | Type | Encadrant(s) | Thématique | Statut.  
* **Action Row:** A prominent button at the top right of the table: **"Exporter ces résultats (CSV/Excel)"**. This is crucial for custom queries. \[Discarded \]

**PAGE 4: Bilans & Rapports (Annual Reports)**

*Maps to UCD: "Prepare annual report" and "Export reports".*

* **Purpose:** Automate the tedious process of creating the annual scientific report for the university administration or evaluation instances (mentioned in CDC Phase II intro).  
* **Report Generator Wizard:**  
  * **Step 1: Période (Select Timeframe):** Choose a specific academic year or a custom date range (e.g., 2024-2026 for triennial evaluations).  
  * **Step 2: Contenu (Select Content):** Checkboxes to include specific sections in the report:  
    * Statistiques globales (types et taux)  
    * Liste détaillée des thèses de Doctorat  
    * Liste détaillée des Masters & PFEs  
    * Bilan par équipe de recherche  
  *    
  * **Step 3: Aperçu & Export (Preview & Export):**  
    * A scrollable web-preview of the generated document.  
    * Two large action buttons: **📄 Exporter en PDF** (Formatted for printing/sending) and **📊 Exporter en Excel** (For raw data manipulation).  
- Export Themes, Students, Supervisions. 

PAGE 5 : Profile Sections .   
\- Chnage Account infos.  
\- change password.