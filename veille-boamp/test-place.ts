// Test script pour le scraper PLACE
import { scrapePlaceMinarm } from './src/lib/place';

async function testPlaceScraper() {
    console.log('=== Test du scraper PLACE - Ministère des Armées ===\n');

    try {
        const startTime = Date.now();

        // Tester avec la date du jour
        const today = new Date();
        console.log(`Date de recherche: ${today.toLocaleDateString('fr-FR')}`);

        const marches = await scrapePlaceMinarm(today);
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

        console.log(`\n=== RÉSULTATS ===`);
        console.log(`Durée: ${elapsed}s`);
        console.log(`Marchés publiés aujourd'hui: ${marches.length}`);

        if (marches.length > 0) {
            console.log('\n=== EXEMPLES (5 premiers) ===');
            marches.slice(0, 5).forEach((m, i) => {
                console.log(`\n[${i + 1}] ${m.titre.substring(0, 60)}...`);
                console.log(`    Référence: ${m.reference}`);
                console.log(`    Procédure: ${m.procedure}`);
                console.log(`    Date limite: ${m.dateLimite}`);
            });

            // Stats par procédure
            const byProcedure: Record<string, number> = {};
            marches.forEach(m => {
                const proc = m.procedure || 'Inconnu';
                byProcedure[proc] = (byProcedure[proc] || 0) + 1;
            });
            console.log('\n=== PAR PROCÉDURE ===');
            Object.entries(byProcedure).forEach(([proc, count]) => {
                console.log(`  ${proc}: ${count}`);
            });
        }

    } catch (error) {
        console.error('Erreur:', error);
    }
}

testPlaceScraper();
