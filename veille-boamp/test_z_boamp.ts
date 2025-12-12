
import { fetchDefenseTendersFromAPI } from './src/lib/boamp';

async function main() {
    console.log("Testing BOAMP Ultrathink Fetch...");
    try {
        const tenders = await fetchDefenseTendersFromAPI();
        console.log(`Success! Fetched ${tenders.length} tenders.`);

        // Log some stats
        const defense = tenders.filter(t => t.isDefenseEquipment).length;
        const civil = tenders.length - defense; // Roughly

        console.log(`Defense Equip (CPV 35*): ${defense}`);
        console.log(`Other (Buyer-based): ${civil}`);

        if (tenders.length > 0) {
            console.log("Top 3 Tenders:");
            tenders.slice(0, 3).forEach(t => {
                console.log(`- [${t.buyer.name}] ${t.title} (${t.cpv || 'No CPV'})`);
            });
        }
    } catch (e) {
        console.error("Error fetching tenders:", e);
    }
}

main();
