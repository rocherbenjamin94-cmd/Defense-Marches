/**
 * Script d'audit BOAMP - Analyse du volume de marchés défense
 *
 * Objectif : Comprendre pourquoi on ne récupère que ~70 marchés MINARM
 * au lieu de plusieurs centaines.
 *
 * Usage : npx tsx scripts/audit-boamp.ts
 */

const API_ENDPOINT = "https://boamp-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/boamp/records";

interface QueryResult {
    label: string;
    query: string;
    totalCount: number;
    fetched: number;
    dateFilter: string;
}

interface BuyerStats {
    name: string;
    count: number;
}

// Délai entre requêtes pour éviter le rate limiting
const DELAY_MS = 300;
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fonction pour exécuter une requête et récupérer le total_count
async function queryBoamp(whereClause: string, label: string): Promise<{ totalCount: number; fetched: number; buyers: BuyerStats[] }> {
    const url = new URL(API_ENDPOINT);
    url.searchParams.set("select", "idweb,objet,nomacheteur,datelimitereponse,dateparution");
    url.searchParams.set("where", whereClause);
    url.searchParams.set("order_by", "dateparution DESC");
    url.searchParams.set("limit", "100");

    try {
        const response = await fetch(url.toString());
        if (!response.ok) {
            console.error(`  Erreur ${response.status} pour "${label}"`);
            return { totalCount: 0, fetched: 0, buyers: [] };
        }

        const data = await response.json();
        const totalCount = data.total_count || 0;
        const results = data.results || [];

        // Compter les acheteurs uniques
        const buyerCounts = new Map<string, number>();
        for (const r of results) {
            const buyer = r.nomacheteur || 'Inconnu';
            buyerCounts.set(buyer, (buyerCounts.get(buyer) || 0) + 1);
        }

        const buyers = Array.from(buyerCounts.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);

        return { totalCount, fetched: results.length, buyers };
    } catch (error) {
        console.error(`  Erreur réseau pour "${label}":`, error);
        return { totalCount: 0, fetched: 0, buyers: [] };
    }
}

// Pagination complète pour compter tous les résultats
async function countAllRecords(whereClause: string, maxRecords: number = 5000): Promise<{ total: number; uniqueBuyers: Set<string> }> {
    const uniqueBuyers = new Set<string>();
    let offset = 0;
    let total = 0;
    let totalCount = 0;

    while (offset < maxRecords) {
        const url = new URL(API_ENDPOINT);
        url.searchParams.set("select", "idweb,nomacheteur");
        url.searchParams.set("where", whereClause);
        url.searchParams.set("limit", "100");
        url.searchParams.set("offset", offset.toString());

        try {
            const response = await fetch(url.toString());
            if (!response.ok) break;

            const data = await response.json();
            totalCount = data.total_count || 0;
            const results = data.results || [];

            if (results.length === 0) break;

            for (const r of results) {
                if (r.nomacheteur) uniqueBuyers.add(r.nomacheteur);
            }

            total += results.length;
            offset += 100;

            if (results.length < 100) break;
            await sleep(DELAY_MS);
        } catch {
            break;
        }
    }

    return { total: totalCount, uniqueBuyers };
}

async function main() {
    console.log("╔════════════════════════════════════════════════════════════════╗");
    console.log("║          AUDIT BOAMP - Volume des marchés Défense              ║");
    console.log("╚════════════════════════════════════════════════════════════════╝\n");

    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // ═══════════════════════════════════════════════════════════════════════════
    // SECTION 1 : Test de différentes requêtes
    // ═══════════════════════════════════════════════════════════════════════════
    console.log("┌────────────────────────────────────────────────────────────────┐");
    console.log("│ 1. VOLUME PAR REQUÊTE (marchés en cours, deadline >= aujourd'hui) │");
    console.log("└────────────────────────────────────────────────────────────────┘\n");

    const queries = [
        { label: "Ministère des Armées", query: `search(nomacheteur, "Ministère des Armées")` },
        { label: "MINARM (préfixe)", query: `startswith(nomacheteur, "MINARM")` },
        { label: "MINDEF (préfixe)", query: `startswith(nomacheteur, "MINDEF")` },
        { label: "DGA", query: `search(nomacheteur, "DGA")` },
        { label: "SGA", query: `search(nomacheteur, "SGA")` },
        { label: "SCA", query: `search(nomacheteur, "SCA")` },
        { label: "GSBdD", query: `search(nomacheteur, "GSBdD")` },
        { label: "ESID", query: `search(nomacheteur, "ESID")` },
        { label: "Service Infrastructure Défense", query: `search(nomacheteur, "Service d'Infrastructure")` },
        { label: "Armée de terre", query: `search(nomacheteur, "Armée de terre")` },
        { label: "Marine nationale", query: `search(nomacheteur, "Marine nationale")` },
        { label: "Armée de l'air", query: `search(nomacheteur, "Armée de l'air")` },
        { label: "Gendarmerie", query: `search(nomacheteur, "Gendarmerie")` },
        { label: "AIA (Ateliers Aéronautiques)", query: `search(nomacheteur, "AIA")` },
        { label: "SSA (Santé)", query: `search(nomacheteur, "Service de Santé des Armées")` },
        { label: "CPV 35* (équipements défense)", query: `search(donnees, "35200000") OR search(donnees, "35300000") OR search(donnees, "35400000") OR search(donnees, "35500000") OR search(donnees, "35600000")` },
    ];

    const results: QueryResult[] = [];

    console.log("Requête                               │ Total API │ Récupéré (100 max)");
    console.log("──────────────────────────────────────┼───────────┼───────────────────");

    for (const q of queries) {
        const whereClause = `${q.query} AND datelimitereponse >= "${today}"`;
        const result = await queryBoamp(whereClause, q.label);
        results.push({
            label: q.label,
            query: q.query,
            totalCount: result.totalCount,
            fetched: result.fetched,
            dateFilter: `>= ${today}`
        });

        const label = q.label.padEnd(37);
        const total = result.totalCount.toString().padStart(9);
        const fetched = result.fetched.toString().padStart(9);
        console.log(`${label} │ ${total} │ ${fetched}`);

        await sleep(DELAY_MS);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SECTION 2 : Impact des filtres de date
    // ═══════════════════════════════════════════════════════════════════════════
    console.log("\n┌────────────────────────────────────────────────────────────────┐");
    console.log("│ 2. IMPACT DES FILTRES DE DATE (recherche: MINARM OR DGA OR SCA)│");
    console.log("└────────────────────────────────────────────────────────────────┘\n");

    const baseQuery = `search(nomacheteur, "MINARM") OR search(nomacheteur, "DGA") OR search(nomacheteur, "SCA") OR search(nomacheteur, "GSBdD")`;

    const dateFilters = [
        { label: "Sans filtre de date", where: baseQuery },
        { label: `Date limite >= ${today}`, where: `(${baseQuery}) AND datelimitereponse >= "${today}"` },
        { label: `Publié depuis 30 jours`, where: `(${baseQuery}) AND dateparution >= "${thirtyDaysAgo}"` },
        { label: `Publié 30j + deadline >= today`, where: `(${baseQuery}) AND dateparution >= "${thirtyDaysAgo}" AND datelimitereponse >= "${today}"` },
    ];

    console.log("Filtre de date                        │ Total API │ Récupéré");
    console.log("──────────────────────────────────────┼───────────┼─────────");

    for (const df of dateFilters) {
        const result = await queryBoamp(df.where, df.label);
        const label = df.label.padEnd(37);
        const total = result.totalCount.toString().padStart(9);
        const fetched = result.fetched.toString().padStart(8);
        console.log(`${label} │ ${total} │ ${fetched}`);
        await sleep(DELAY_MS);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SECTION 3 : Requête combinée large pour MINARM complet
    // ═══════════════════════════════════════════════════════════════════════════
    console.log("\n┌────────────────────────────────────────────────────────────────┐");
    console.log("│ 3. REQUÊTE LARGE DÉFENSE (tous les termes, avec pagination)    │");
    console.log("└────────────────────────────────────────────────────────────────┘\n");

    console.log("Récupération exhaustive des marchés défense en cours...\n");

    const largeQuery = `(
        search(nomacheteur, "Ministère des Armées") OR
        search(nomacheteur, "MINARM") OR
        search(nomacheteur, "MINDEF") OR
        search(nomacheteur, "DGA") OR
        search(nomacheteur, "Direction générale de l'armement") OR
        search(nomacheteur, "SCA") OR
        search(nomacheteur, "Service du Commissariat") OR
        search(nomacheteur, "GSBdD") OR
        search(nomacheteur, "Groupement de soutien") OR
        search(nomacheteur, "ESID") OR
        search(nomacheteur, "SID") OR
        search(nomacheteur, "Service d'Infrastructure") OR
        search(nomacheteur, "Marine nationale") OR
        search(nomacheteur, "Armée de terre") OR
        search(nomacheteur, "Armée de l'air") OR
        search(nomacheteur, "SSA") OR
        search(nomacheteur, "Service de Santé") OR
        search(nomacheteur, "AIA") OR
        search(nomacheteur, "Atelier Industriel") OR
        search(nomacheteur, "SIAé") OR
        search(nomacheteur, "DMAé") OR
        search(nomacheteur, "BCRM") OR
        search(nomacheteur, "SMITer") OR
        search(nomacheteur, "SIMMT") OR
        search(nomacheteur, "SIMU") OR
        search(nomacheteur, "SEO") OR
        search(nomacheteur, "Gendarmerie") OR
        search(nomacheteur, "DGGN") OR
        startswith(nomacheteur, "MINARM") OR
        startswith(nomacheteur, "MINDEF") OR
        startswith(nomacheteur, "ESID")
    ) AND datelimitereponse >= "${today}"`;

    const largeResult = await countAllRecords(largeQuery, 5000);
    console.log(`Total marchés défense en cours (API) : ${largeResult.total}`);
    console.log(`Acheteurs uniques trouvés            : ${largeResult.uniqueBuyers.size}`);

    // ═══════════════════════════════════════════════════════════════════════════
    // SECTION 4 : Top acheteurs
    // ═══════════════════════════════════════════════════════════════════════════
    console.log("\n┌────────────────────────────────────────────────────────────────┐");
    console.log("│ 4. TOP 20 ACHETEURS DÉFENSE (marchés en cours)                 │");
    console.log("└────────────────────────────────────────────────────────────────┘\n");

    const topBuyers = Array.from(largeResult.uniqueBuyers).slice(0, 30);
    console.log("Acheteurs trouvés dans BOAMP :");
    topBuyers.forEach((b, i) => console.log(`  ${(i + 1).toString().padStart(2)}. ${b}`));

    // ═══════════════════════════════════════════════════════════════════════════
    // SECTION 5 : Comparaison avec le code actuel
    // ═══════════════════════════════════════════════════════════════════════════
    console.log("\n┌────────────────────────────────────────────────────────────────┐");
    console.log("│ 5. PROBLÈMES IDENTIFIÉS DANS LE CODE ACTUEL                    │");
    console.log("└────────────────────────────────────────────────────────────────┘\n");

    console.log("Problèmes détectés dans src/lib/boamp.ts :");
    console.log("");
    console.log("  1. LIMITATION À 3 TERMES PAR TUTELLE (ligne 951, 1078)");
    console.log("     const mainTerms = acheteurs.slice(0, 3)");
    console.log("     -> Rate ~90% des acheteurs de chaque tutelle");
    console.log("");
    console.log("  2. PRÉFIXES TROP RESTRICTIFS (ligne 16-39)");
    console.log("     Seuls 7 préfixes: MINDEF, MINARM, ESID, MINT/DGGN...");
    console.log("     -> Ne couvre pas GSBdD, AIA, SIAé, DMAé, etc.");
    console.log("");
    console.log("  3. PAGINATION LIMITÉE");
    console.log("     - Max 1000 pour acheteurs (ligne 482)");
    console.log("     - Max 500 pour CPV 35* (ligne 488)");
    console.log("     - Max 100 par terme/tutelle (ligne 962)");
    console.log("");
    console.log("  4. TOTAL_COUNT JAMAIS VÉRIFIÉ");
    console.log("     L'API retourne total_count mais il n'est pas exploité");

    // ═══════════════════════════════════════════════════════════════════════════
    // SECTION 6 : Recommandations
    // ═══════════════════════════════════════════════════════════════════════════
    console.log("\n┌────────────────────────────────────────────────────────────────┐");
    console.log("│ 6. RECOMMANDATIONS                                             │");
    console.log("└────────────────────────────────────────────────────────────────┘\n");

    const totalPotentiel = results.reduce((sum, r) => sum + r.totalCount, 0);

    console.log("Actions correctives suggérées :");
    console.log("");
    console.log("  A. SUPPRIMER LA LIMITE slice(0, 3)");
    console.log("     Utiliser TOUS les termes acheteurs de chaque tutelle");
    console.log("");
    console.log("  B. AUGMENTER maxRecords");
    console.log("     Passer de 1000 à 5000+ pour les acheteurs");
    console.log("");
    console.log("  C. UTILISER UNE REQUÊTE OR LARGE");
    console.log("     Combiner tous les termes en une seule requête avec pagination");
    console.log("");
    console.log("  D. VÉRIFIER total_count VS résultats récupérés");
    console.log("     Alerter si on ne récupère pas tout");
    console.log("");
    console.log("  E. CONSIDÉRER L'API PLACE EN COMPLÉMENT");
    console.log("     marches-publics.gouv.fr peut avoir des marchés non publiés au BOAMP");

    console.log("\n╔════════════════════════════════════════════════════════════════╗");
    console.log("║                        FIN DE L'AUDIT                          ║");
    console.log("╚════════════════════════════════════════════════════════════════╝\n");
}

main().catch(console.error);
