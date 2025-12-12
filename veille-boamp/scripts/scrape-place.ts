#!/usr/bin/env npx tsx
/**
 * Script de scraping PLACE quotidien
 * Récupère les marchés des 10 derniers jours et les envoie vers Redis Upstash
 * Cela permet de s'assurer de récupérer tous les marchés actifs même si
 * le scraping a échoué certains jours.
 *
 * Usage:
 *   npx tsx scripts/scrape-place.ts
 *
 * Variables d'environnement requises:
 *   UPSTASH_REDIS_REST_URL
 *   UPSTASH_REDIS_REST_TOKEN
 */

// Charger les variables d'environnement depuis .env.local
import { config } from 'dotenv';
config({ path: '.env.local' });

import { Redis } from '@upstash/redis';
import { scrapePlaceMinarm, MarchePlace } from '../src/lib/place';

const PLACE_CACHE_KEY = 'place:minarm:marches';
const PLACE_CACHE_TTL = 14 * 24 * 60 * 60; // 14 jours (pour couvrir les 10 jours de scraping)
const DAYS_TO_SCRAPE = 10; // Nombre de jours à scraper

interface CachedPlaceData {
    marches: MarchePlace[];
    cachedAt: string;
    count: number;
    lastScrapedDate?: string;
    scrapedDates?: string[]; // Liste des dates scrapées
}

/**
 * Formate une date en chaîne YYYY-MM-DD
 */
function formatDateISO(date: Date): string {
    return date.toISOString().split('T')[0];
}

/**
 * Formate une date en chaîne DD/MM/YYYY pour l'affichage
 */
function formatDateFR(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

/**
 * Délai entre les requêtes pour ne pas surcharger le serveur
 */
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log('=== Script de scraping PLACE (10 derniers jours) ===');
    console.log(`Date d'exécution: ${new Date().toLocaleString('fr-FR')}\n`);

    // Vérifier les variables d'environnement
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!redisUrl || !redisToken) {
        console.error('❌ Variables d\'environnement manquantes:');
        console.error('   UPSTASH_REDIS_REST_URL');
        console.error('   UPSTASH_REDIS_REST_TOKEN');
        process.exit(1);
    }

    // Connexion Redis
    const redis = new Redis({ url: redisUrl, token: redisToken });
    console.log('✓ Connexion Redis établie');

    try {
        // 1. Charger le cache existant
        let existingMarches: MarchePlace[] = [];
        const cachedData = await redis.get<CachedPlaceData>(PLACE_CACHE_KEY);

        if (cachedData) {
            existingMarches = cachedData.marches || [];
            console.log(`✓ Cache existant: ${existingMarches.length} marchés`);
            console.log(`  Dernier scrape: ${cachedData.lastScrapedDate || 'inconnu'}`);
        } else {
            console.log('ℹ Pas de cache existant');
        }

        // 2. Générer les dates des 10 derniers jours
        const today = new Date();
        const datesToScrape: Date[] = [];

        for (let i = 0; i < DAYS_TO_SCRAPE; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            datesToScrape.push(date);
        }

        console.log(`\n📡 Scraping PLACE pour les ${DAYS_TO_SCRAPE} derniers jours...`);
        console.log(`   Du ${formatDateFR(datesToScrape[datesToScrape.length - 1])} au ${formatDateFR(datesToScrape[0])}\n`);

        // 3. Scraper chaque jour
        const allScrapedMarches: MarchePlace[] = [];
        const scrapedDates: string[] = [];
        const scrapedIds = new Set<string>(); // Pour éviter doublons entre jours

        for (let i = 0; i < datesToScrape.length; i++) {
            const date = datesToScrape[i];
            const dateStr = formatDateFR(date);
            const dateISO = formatDateISO(date);

            console.log(`[${i + 1}/${DAYS_TO_SCRAPE}] Scraping du ${dateStr}...`);

            try {
                const marches = await scrapePlaceMinarm(date);
                // Garder tous les marchés (pas seulement les nouveaux) pour rafraîchir les données
                const uniqueMarches = marches.filter(m => !scrapedIds.has(m.id));

                // Ajouter les IDs au set pour éviter les doublons entre jours
                uniqueMarches.forEach(m => scrapedIds.add(m.id));
                allScrapedMarches.push(...uniqueMarches);
                scrapedDates.push(dateISO);

                console.log(`   ✓ ${marches.length} marchés trouvés (${uniqueMarches.length} ajoutés)`);

                // Pause entre les requêtes pour ne pas surcharger le serveur
                if (i < datesToScrape.length - 1) {
                    await delay(2000); // 2 secondes entre chaque jour
                }
            } catch (error) {
                console.error(`   ❌ Erreur pour le ${dateStr}:`, error);
                // Continuer avec les autres dates même en cas d'erreur
            }
        }

        // 4. Fusionner avec les marchés existants
        // Important: mettre les nouveaux scrapés APRÈS pour qu'ils écrasent les anciens (priority aux données fraîches)
        console.log(`\n📊 Résumé du scraping:`);
        console.log(`   - Marchés scrapés: ${allScrapedMarches.length}`);

        const allMarches = [...existingMarches, ...allScrapedMarches];

        // 5. Supprimer les doublons (les derniers gagnent, donc les freshly scraped prennent le dessus)
        const uniqueMarches = Array.from(
            new Map(allMarches.map(m => [m.id, m])).values()
        );

        console.log(`   - Total après dédoublonnage: ${uniqueMarches.length}`);

        // 6. Sauvegarder dans Redis
        const todayStr = formatDateISO(today);
        const cacheData: CachedPlaceData = {
            marches: uniqueMarches,
            cachedAt: new Date().toISOString(),
            count: uniqueMarches.length,
            lastScrapedDate: todayStr,
            scrapedDates: scrapedDates,
        };

        await redis.set(PLACE_CACHE_KEY, cacheData, { ex: PLACE_CACHE_TTL });

        console.log(`\n✅ Cache mis à jour:`);
        console.log(`   - Total marchés: ${uniqueMarches.length}`);
        console.log(`   - Nouveaux: ${allScrapedMarches.length}`);
        console.log(`   - TTL: 14 jours`);

        // Afficher les nouveaux marchés
        if (allScrapedMarches.length > 0) {
            console.log('\n📋 Nouveaux marchés ajoutés:');
            allScrapedMarches.slice(0, 20).forEach((m, i) => {
                const titre = m.titre?.substring(0, 50) || 'Sans titre';
                console.log(`   ${i + 1}. [${m.procedure}] ${titre}...`);
            });
            if (allScrapedMarches.length > 20) {
                console.log(`   ... et ${allScrapedMarches.length - 20} autres`);
            }
        }

    } catch (error) {
        console.error('\n❌ Erreur:', error);
        process.exit(1);
    }

    console.log('\n=== Fin du script ===');
}

main();
