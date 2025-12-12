#!/usr/bin/env npx tsx
/**
 * Script de diagnostic du cache PLACE
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import { Redis } from '@upstash/redis';

interface MarchePlace {
    id: string;
    titre: string;
    datePublication: string;
    dateLimite: string;
    acheteur: string;
}

interface CachedPlaceData {
    marches: MarchePlace[];
    cachedAt: string;
    count: number;
    lastScrapedDate?: string;
}

async function check() {
    const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!
    });

    const data = await redis.get<CachedPlaceData>('place:minarm:marches');

    if (!data) {
        console.log('Pas de données PLACE en cache');
        return;
    }

    console.log('=== Cache PLACE ===');
    console.log('Nombre de marchés:', data.marches?.length || 0);
    console.log('Dernière mise à jour:', data.cachedAt);
    console.log('Dernier scrape:', data.lastScrapedDate);
    console.log('');

    // Afficher les 10 premiers marchés avec leurs dates
    if (data.marches && data.marches.length > 0) {
        console.log('=== Exemples de marchés ===');
        data.marches.slice(0, 10).forEach((m, i) => {
            const titre = m.titre?.substring(0, 60) || 'Sans titre';
            console.log(`\n[${i+1}] ${titre}...`);
            console.log(`    ID: ${m.id}`);
            console.log(`    Date publication: "${m.datePublication || 'VIDE'}"`);
            console.log(`    Date limite: "${m.dateLimite || 'VIDE'}"`);
        });

        // Compter les marchés sans date de publication
        const sansDatePub = data.marches.filter(m => !m.datePublication || m.datePublication.trim() === '').length;
        const avecDatePub = data.marches.filter(m => m.datePublication && m.datePublication.trim() !== '').length;

        console.log('\n=== Statistiques dates ===');
        console.log(`Marchés avec date de publication: ${avecDatePub}`);
        console.log(`Marchés SANS date de publication: ${sansDatePub}`);
    }
}

check().catch(console.error);
