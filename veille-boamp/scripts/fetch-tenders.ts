import { fetchDefenseTenders } from '../src/lib/boamp';

// Polyfill for fetch in Node.js environment if needed (Node 18+ has it native)
// In a real project, we might compile this with tsc, but for simplicity we can run with ts-node
// or just ensure the service is compatible.
// Since BoampService uses 'export class', we need to handle imports correctly.
// For this script, we'll assume we can run it with `npx tsx scripts/fetch-tenders.ts`

async function main() {
    console.log('Starting daily BOAMP synchronization...');

    try {
        const tenders = await fetchDefenseTenders(); // Fetch up to 100

        console.log(`Found ${tenders.length} relevant tenders.`);

        // Log top 5 for verification
        tenders.slice(0, 5).forEach(t => {
            console.log(`[${t.score}%] ${t.title} (${t.buyer.name})`);
        });

        // Save to database (JSON file for MVP)
        const fs = require('fs');
        const path = require('path');

        const dataDir = path.join(__dirname, '../data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir);
        }

        const filePath = path.join(dataDir, 'tenders.json');
        fs.writeFileSync(filePath, JSON.stringify(tenders, null, 2));
        console.log(`Saved ${tenders.length} tenders to ${filePath}`);

    } catch (error) {
        console.error('Synchronization failed:', error);
        process.exit(1);
    }
}

main();
