const https = require('https');

// No filter, just look at the dataset structure
const url = 'https://boamp-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/boamp/records?limit=1';

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.results && json.results.length > 0) {
                const r = json.results[0];
                console.log('--- All Field Keys ---');
                console.log(Object.keys(r).sort().join(', '));

                // Check specifically for anything looking like CPV
                const cpvKeys = Object.keys(r).filter(k => k.toLowerCase().includes('cpv'));
                console.log('\n--- CPV Related Keys ---');
                console.log(cpvKeys);
            } else {
                console.log('No results found.');
            }
        } catch (e) {
            console.error('Error parsing JSON:', e);
        }
    });
}).on('error', (err) => {
    console.error('Error:', err.message);
});
