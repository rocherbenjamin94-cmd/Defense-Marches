// src/lib/place.ts
// Service de scraping pour la PLACE (marches-publics.gouv.fr)
// Récupère les marchés des Ministères (Armées, Intérieur, etc.)

import puppeteer, { Browser, Page } from 'puppeteer';

// Types de ministères supportés
export type Ministry = 'MINARM' | 'MININT';

// Types pour les marchés PLACE
export interface MarchePlace {
    id: string;
    reference: string;
    titre: string;
    acheteur: string;
    dateLimite: string;
    datePublication: string;
    type: string;
    procedure: string;
    lieu: string;
    url: string;
    source: 'PLACE';
    ministry?: Ministry; // Ministère source (MINARM, MININT)
}

// Configuration par ministère
export const MINISTRY_CONFIG: Record<Ministry, { name: string; searchTerm: string; cacheKey: string }> = {
    MINARM: {
        name: 'Ministère des Armées',
        searchTerm: 'ministère des armées',
        cacheKey: 'place:minarm:marches'
    },
    MININT: {
        name: 'Ministère de l\'Intérieur',
        searchTerm: 'ministère de l\'intérieur',
        cacheKey: 'place:minint:marches'
    }
};

const PLACE_URL = 'https://www.marches-publics.gouv.fr';
const SEARCH_URL = `${PLACE_URL}/?page=Entreprise.EntrepriseAdvancedSearch&searchAnnCons`;

// Configuration Puppeteer pour différents environnements
function getPuppeteerConfig() {
    const isVercel = process.env.VERCEL === '1';
    const isProduction = process.env.NODE_ENV === 'production';

    if (isVercel) {
        // Sur Vercel, on ne peut pas utiliser Puppeteer (serverless)
        // On retournera une erreur ou utilisera une alternative
        return null;
    }

    return {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--window-size=1920,1080',
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    };
}

/**
 * Formate une date au format DD/MM/YYYY pour le formulaire PLACE
 */
function formatDateFR(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

/**
 * Scrape les marchés d'un ministère depuis la PLACE
 * Par défaut, ne récupère que les marchés publiés à la date du jour
 * @param date - Date de publication à filtrer (par défaut: aujourd'hui)
 * @param ministry - Ministère à scraper (MINARM ou MININT)
 */
export async function scrapePlaceMinistry(date?: Date, ministry: Ministry = 'MINARM'): Promise<MarchePlace[]> {
    const targetDate = date || new Date();
    const dateStr = formatDateFR(targetDate);
    const ministryConfig = MINISTRY_CONFIG[ministry];
    console.log(`PLACE: Démarrage du scraping - ${ministryConfig.name} - Date: ${dateStr}`);

    const puppeteerConfig = getPuppeteerConfig();
    if (!puppeteerConfig) {
        console.warn('PLACE: Puppeteer non disponible dans cet environnement (Vercel serverless)');
        return [];
    }

    let browser: Browser | null = null;

    try {
        // Lancer Puppeteer
        browser = await puppeteer.launch(puppeteerConfig);

        const page = await browser.newPage();

        // User agent pour éviter d'être bloqué
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );

        // Viewport
        await page.setViewport({ width: 1920, height: 1080 });

        // Timeout plus long car le site est lent
        page.setDefaultTimeout(60000);
        page.setDefaultNavigationTimeout(60000);

        // URL de recherche avancée PLACE
        const advancedSearchUrl = `${PLACE_URL}/?page=Entreprise.EntrepriseAdvancedSearch&searchAnnCons`;

        console.log('PLACE: Navigation vers la recherche avancée...');
        await page.goto(advancedSearchUrl, { waitUntil: 'networkidle2', timeout: 60000 });

        // Attendre le chargement complet
        await delay(3000);

        // Screenshot de debug (désactivé en production)
        if (process.env.PLACE_DEBUG) {
            await page.screenshot({ path: 'place-debug-1-initial.png' });
            console.log('PLACE: Screenshot 1 sauvegardé');
        }

        // === ÉTAPE 1: Cliquer sur "Recherche dans une liste" pour activer le dropdown ===
        console.log('PLACE: Clic sur "Recherche dans une liste"...');
        await page.evaluate(() => {
            const elements = document.querySelectorAll('a, button, span');
            for (const el of elements) {
                if (el.textContent?.includes('Recherche dans une liste')) {
                    (el as HTMLElement).click();
                    return true;
                }
            }
            return false;
        });
        await delay(2000);

        // === ÉTAPE 2: Sélectionner le ministère dans le dropdown ===
        console.log(`PLACE: Sélection de ${ministryConfig.name} dans le dropdown...`);
        const searchTerm = ministryConfig.searchTerm;
        const selectedMinistry = await page.evaluate((term) => {
            // Chercher le select "Entité publique"
            const selects = document.querySelectorAll('select');
            for (const select of selects) {
                const options = Array.from(select.querySelectorAll('option'));
                // Chercher l'option du ministère
                for (const option of options) {
                    const text = option.textContent?.toLowerCase() || '';
                    if (text.includes(term)) {
                        console.log('Option trouvée:', option.textContent, 'value:', option.value);
                        (select as HTMLSelectElement).value = option.value;
                        select.dispatchEvent(new Event('change', { bubbles: true }));
                        return { found: true, value: option.value, text: option.textContent };
                    }
                }
            }
            // Lister toutes les options pour debug
            const allOptions: string[] = [];
            selects.forEach((sel, i) => {
                sel.querySelectorAll('option').forEach(opt => {
                    if (opt.textContent && opt.textContent.length > 3) {
                        allOptions.push(`Select${i}: ${opt.textContent.substring(0, 50)}`);
                    }
                });
            });
            return { found: false, options: allOptions.slice(0, 20) };
        }, searchTerm);
        console.log('PLACE: Résultat sélection:', JSON.stringify(selectedMinistry));
        await delay(1000);

        // Si pas trouvé dans le dropdown, essayer l'autocomplétion
        if (!selectedMinistry.found) {
            console.log('PLACE: Tentative avec autocomplétion...');
            // Cliquer sur "Recherche par autocomplétion"
            await page.evaluate(() => {
                const elements = document.querySelectorAll('a, button, span');
                for (const el of elements) {
                    if (el.textContent?.includes('autocomplétion')) {
                        (el as HTMLElement).click();
                        return true;
                    }
                }
                return false;
            });
            await delay(1000);

            // Taper dans le champ d'autocomplétion
            const inputField = await page.$('input[type="text"]');
            if (inputField) {
                await inputField.click();
                await inputField.type(ministryConfig.name, { delay: 30 });
                await delay(2000);

                // Cliquer sur la suggestion
                const suggestionTerm = searchTerm;
                await page.evaluate((term) => {
                    const suggestions = document.querySelectorAll('li, .suggestion, .autocomplete-item, [role="option"]');
                    for (const sug of suggestions) {
                        if (sug.textContent?.toLowerCase().includes(term)) {
                            (sug as HTMLElement).click();
                            return true;
                        }
                    }
                    return false;
                }, suggestionTerm);
                await delay(1000);
            }
        }


        // === ÉTAPE 3: Vérifier si on a besoin de cocher "Inclure les descendances" ===
        // Note: D'après les screenshots, c'est peut-être déjà fait automatiquement
        console.log('PLACE: Vérification "Inclure les descendances"...');
        await page.evaluate(() => {
            const labels = document.querySelectorAll('label');
            for (const label of labels) {
                const text = label.textContent?.toLowerCase() || '';
                if (text.includes('descendance') || text.includes('inclure')) {
                    const radio = label.querySelector('input[type="radio"], input[type="checkbox"]');
                    if (radio && !(radio as HTMLInputElement).checked) {
                        (radio as HTMLInputElement).click();
                        return true;
                    }
                }
            }
            return false;
        });
        await delay(500);

        // === ÉTAPE 4: Vérifier que "Annonce de consultation" est sélectionné ===
        console.log('PLACE: Vérification type "Annonce de consultation"...');
        await page.evaluate(() => {
            const selects = document.querySelectorAll('select');
            for (const select of selects) {
                const label = select.closest('div')?.querySelector('label')?.textContent || '';
                if (label.toLowerCase().includes('type') && label.toLowerCase().includes('annonce')) {
                    const options = select.querySelectorAll('option');
                    for (const option of options) {
                        if (option.textContent?.toLowerCase().includes('consultation')) {
                            (select as HTMLSelectElement).value = option.value;
                            select.dispatchEvent(new Event('change', { bubbles: true }));
                            return true;
                        }
                    }
                }
            }
            return false;
        });
        await delay(500);

        // === ÉTAPE 5: Remplir UNIQUEMENT la "Date de mise en ligne" (pas la date limite) ===
        console.log(`PLACE: Définition de la date de mise en ligne: ${dateStr}`);
        const dateSet = await page.evaluate((targetDateStr) => {
            // Stratégie: trouver le label "Date de mise en ligne" et les inputs associés
            // Le formulaire a 2 sections de dates:
            // 1. "Date limite de remise des plis" (en haut) - NE PAS TOUCHER
            // 2. "Date de mise en ligne" (en bas) - C'EST CELLE-CI QU'ON VEUT

            // Chercher tous les éléments contenant "Date de mise en ligne"
            const allElements = document.querySelectorAll('*');
            let miseEnLigneRow: Element | null = null;

            for (const el of allElements) {
                const text = el.textContent?.trim() || '';
                // Chercher exactement "Date de mise en ligne" et pas un conteneur plus grand
                if (text === 'Date de mise en ligne' ||
                    (text.startsWith('Date de mise en ligne') && text.length < 50)) {
                    miseEnLigneRow = el;
                    break;
                }
            }

            if (!miseEnLigneRow) {
                // Fallback: chercher par structure du formulaire
                const labels = document.querySelectorAll('label, td, th, span');
                for (const label of labels) {
                    if (label.textContent?.includes('Date de mise en ligne')) {
                        miseEnLigneRow = label;
                        break;
                    }
                }
            }

            if (!miseEnLigneRow) {
                return { success: false, error: 'Label "Date de mise en ligne" non trouvé' };
            }

            // Remonter au conteneur parent (tr, div) qui contient les inputs
            let container = miseEnLigneRow.parentElement;
            let inputs: NodeListOf<Element> | null = null;

            // Chercher les inputs dans les éléments parents/frères
            for (let i = 0; i < 5 && container; i++) {
                inputs = container.querySelectorAll('input[type="text"]');
                if (inputs && inputs.length >= 2) {
                    break;
                }
                // Essayer aussi le parent suivant
                container = container.parentElement;
            }

            // Si toujours pas trouvé, chercher dans les éléments frères (même niveau)
            if (!inputs || inputs.length < 2) {
                const parent = miseEnLigneRow.parentElement;
                if (parent) {
                    const siblings = parent.querySelectorAll('input[type="text"]');
                    if (siblings.length >= 2) {
                        inputs = siblings;
                    }
                }
            }

            if (!inputs || inputs.length < 2) {
                // Dernier recours: chercher les 4 derniers inputs date du formulaire
                // (les 2 premiers sont pour "Date limite", les 2 derniers pour "Date de mise en ligne")
                const allDateInputs = document.querySelectorAll('input[type="text"]');
                const dateInputs: HTMLInputElement[] = [];

                allDateInputs.forEach(input => {
                    const inp = input as HTMLInputElement;
                    // Identifier les inputs de date par leur format ou attributs
                    if (inp.value.match(/^\d{2}\/\d{2}\/\d{4}$/) ||
                        inp.placeholder?.includes('date') ||
                        inp.name?.toLowerCase().includes('date') ||
                        inp.id?.toLowerCase().includes('date')) {
                        dateInputs.push(inp);
                    }
                });

                // Prendre les 2 derniers (Date de mise en ligne)
                if (dateInputs.length >= 4) {
                    const startInput = dateInputs[dateInputs.length - 2];
                    const endInput = dateInputs[dateInputs.length - 1];

                    startInput.value = targetDateStr;
                    startInput.dispatchEvent(new Event('input', { bubbles: true }));
                    startInput.dispatchEvent(new Event('change', { bubbles: true }));
                    startInput.dispatchEvent(new Event('blur', { bubbles: true }));

                    endInput.value = targetDateStr;
                    endInput.dispatchEvent(new Event('input', { bubbles: true }));
                    endInput.dispatchEvent(new Event('change', { bubbles: true }));
                    endInput.dispatchEvent(new Event('blur', { bubbles: true }));

                    return {
                        success: true,
                        method: 'last-two-date-inputs',
                        values: [startInput.value, endInput.value]
                    };
                }

                return { success: false, error: 'Inputs de date non trouvés', totalInputs: allDateInputs.length };
            }

            // Remplir les deux inputs trouvés avec la même date
            const input1 = inputs[0] as HTMLInputElement;
            const input2 = inputs[1] as HTMLInputElement;

            input1.value = targetDateStr;
            input1.dispatchEvent(new Event('input', { bubbles: true }));
            input1.dispatchEvent(new Event('change', { bubbles: true }));
            input1.dispatchEvent(new Event('blur', { bubbles: true }));

            input2.value = targetDateStr;
            input2.dispatchEvent(new Event('input', { bubbles: true }));
            input2.dispatchEvent(new Event('change', { bubbles: true }));
            input2.dispatchEvent(new Event('blur', { bubbles: true }));

            return {
                success: true,
                method: 'label-proximity',
                values: [input1.value, input2.value]
            };
        }, dateStr);

        console.log('PLACE: Résultat dates:', JSON.stringify(dateSet));
        await delay(500);

        // === ÉTAPE 6: Lancer la recherche ===
        console.log('PLACE: Lancement de la recherche...');

        // Scroller vers le bas pour voir le bouton Rechercher
        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
        });
        await delay(500);


        // Chercher et cliquer sur le bouton "Lancer la recherche"
        const searchClicked = await page.evaluate(() => {
            // Chercher tous les inputs et boutons
            const allElements = document.querySelectorAll('input[type="submit"], input[type="button"], button');

            for (const el of allElements) {
                const value = (el as HTMLInputElement).value?.toLowerCase() || '';
                const text = el.textContent?.toLowerCase() || '';

                // Chercher "Lancer la recherche"
                if (value.includes('lancer la recherche') || text.includes('lancer la recherche')) {
                    console.log('Bouton trouvé:', value || text, el.tagName);
                    (el as HTMLElement).click();
                    return { clicked: true, text: value || text };
                }
            }

            return { clicked: false };
        });

        console.log('PLACE: Résultat clic rechercher:', JSON.stringify(searchClicked));

        // Attendre le chargement des résultats
        console.log('PLACE: Attente des résultats...');
        await delay(5000);


        // Vérifier le nombre de résultats
        const resultCount = await page.evaluate(() => {
            const bodyText = document.body?.innerText || '';
            const match = bodyText.match(/Nombre de résultats\s*:\s*(\d+)/);
            return match ? parseInt(match[1]) : 0;
        });
        console.log(`PLACE: ${resultCount} résultats trouvés`);

        // Vérifier si on a des résultats
        if (resultCount === 0) {
            console.log(`PLACE: Aucun marché publié le ${dateStr}`);
            return [];
        }

        // === EXTRAIRE LES RÉSULTATS (une seule page) ===
        const marches = await extractMarches(page, ministry);

        console.log(`PLACE: ${marches.length} marchés récupérés pour le ${dateStr}`);
        return marches;

    } catch (error) {
        console.error('PLACE: Erreur lors du scraping:', error);
        return [];
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

/**
 * Remplit le formulaire de recherche avancée
 */
async function fillSearchForm(page: Page): Promise<void> {
    try {
        console.log('PLACE: Remplissage du formulaire de recherche...');

        // Chercher les champs de recherche par organisme
        // La PLACE a plusieurs variations de formulaire selon les mises à jour

        // 1. Essayer de trouver un champ de recherche par organisme/acheteur
        const organismeSelectors = [
            'input[name*="organisme"]',
            'input[name*="acheteur"]',
            'input[name*="entite"]',
            '#organisme',
            '#acheteur',
            '#entitePublique',
            'input[placeholder*="organisme"]',
            'input[placeholder*="acheteur"]',
        ];

        for (const selector of organismeSelectors) {
            const field = await page.$(selector);
            if (field) {
                await field.type('Ministère des Armées');
                console.log(`PLACE: Champ organisme trouvé avec ${selector}`);
                break;
            }
        }

        // 2. Essayer de cocher "inclure les descendants/sous-organismes"
        const descendantsSelectors = [
            'input[name*="descendant"]',
            'input[name*="sous"]',
            '#inclureDescendances',
            'input[type="checkbox"][id*="descend"]',
        ];

        for (const selector of descendantsSelectors) {
            const checkbox = await page.$(selector);
            if (checkbox) {
                const isChecked = await page.evaluate(el => (el as HTMLInputElement).checked, checkbox);
                if (!isChecked) {
                    await checkbox.click();
                    console.log('PLACE: Case descendants cochée');
                }
                break;
            }
        }

        // 3. Sélectionner uniquement les consultations en cours
        const typeSelectors = [
            'select[name*="type"]',
            '#typeAnnonce',
            'select[name*="annonce"]',
        ];

        for (const selector of typeSelectors) {
            const select = await page.$(selector);
            if (select) {
                // Essayer de sélectionner "Consultation en cours" ou équivalent
                await page.select(selector, '1').catch(() => { });
                console.log('PLACE: Type de consultation sélectionné');
                break;
            }
        }

        // 4. Optionnel : Définir les dates (6 derniers mois)
        const today = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const formatDateFR = (d: Date) =>
            `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

        // Champ date début
        const dateDebutSelectors = ['#dateMiseEnLigneDebut', 'input[name*="dateDebut"]', 'input[name*="from"]'];
        for (const selector of dateDebutSelectors) {
            const field = await page.$(selector);
            if (field) {
                await field.click({ clickCount: 3 }); // Sélectionner tout
                await field.type(formatDateFR(sixMonthsAgo));
                break;
            }
        }

        // Champ date fin
        const dateFinSelectors = ['#dateMiseEnLigneFin', 'input[name*="dateFin"]', 'input[name*="to"]'];
        for (const selector of dateFinSelectors) {
            const field = await page.$(selector);
            if (field) {
                await field.click({ clickCount: 3 });
                await field.type(formatDateFR(today));
                break;
            }
        }

        console.log('PLACE: Formulaire rempli');

    } catch (error) {
        console.error('PLACE: Erreur lors du remplissage du formulaire:', error);
    }
}

/**
 * Extrait les marchés de la page de résultats courante
 * Version simplifiée: pas de pagination car on filtre sur une seule date
 * Typiquement 0-10 marchés par jour
 */
async function extractMarches(page: Page, ministry: Ministry): Promise<MarchePlace[]> {
    console.log('PLACE: Extraction des marchés...');

    const marches = await page.evaluate(() => {
        const results: any[] = [];

        // Chercher tous les liens "Accéder à la consultation"
        const allLinks = document.querySelectorAll('a[href*="consultation"]');
        const seenIds = new Set<string>();

        allLinks.forEach((link) => {
            try {
                const href = (link as HTMLAnchorElement).href || link.getAttribute('href') || '';
                const linkText = link.textContent?.trim().toLowerCase() || '';

                // On veut les liens "Accéder à la consultation" (pas les messages)
                if (!linkText.includes('accéder') && !linkText.includes('consultation')) return;
                if (href.includes('#') || href.includes('echanges')) return;

                // Extraire l'ID
                const idMatch = href.match(/consultation\/(\d+)/);
                if (!idMatch) return;

                const id = idMatch[1];
                if (seenIds.has(id)) return;
                seenIds.add(id);

                // Remonter au bloc parent pour trouver toutes les infos
                let container = link.parentElement;
                for (let i = 0; i < 10 && container; i++) {
                    const text = container.textContent || '';
                    if (text.includes('Objet :') && /\b(AOO|MAPA|AOR|PAN)\b/i.test(text)) {
                        break;
                    }
                    container = container.parentElement;
                }

                // Nettoyer le texte
                const containerText = (container?.textContent || '')
                    .replace(/\s+/g, ' ')
                    .replace(/\n+/g, ' ')
                    .trim();

                // Extraire la procédure
                const procMatch = containerText.match(/\b(AOO|MAPA|AOR|AORC|PAN|PA|DC|MC)\b/i);
                const procedure = procMatch ? procMatch[1].toUpperCase() : '';

                // Extraire la référence et l'intitulé
                const refPatterns = [
                    /([A-Z]{2,}_\d{4}_\d+)\s*\|\s*([^O]+?)(?=Objet|$)/i,
                    /([A-Z]{2,}_[A-Z]+)\s*\|\s*([^O]+?)(?=Objet|$)/i,
                    /(\d{5,})\s*\|\s*([^O]+?)(?=Objet|$)/i,
                ];

                let reference = '';
                let intitule = '';
                for (const pattern of refPatterns) {
                    const match = containerText.match(pattern);
                    if (match) {
                        reference = match[1].trim();
                        intitule = match[2].trim();
                        break;
                    }
                }

                // Extraire l'objet
                const objetMatch = containerText.match(/Objet\s*:\s*(.+?)(?=Organisme|Message|Accéder|$)/i);
                const objet = objetMatch ? objetMatch[1].trim() : '';

                // Extraire l'organisme (générique pour tous les ministères)
                const orgMatch = containerText.match(/Organisme\s*:\s*([^A-Z]+?(?:Ministère[^M]+?))/i) ||
                    containerText.match(/Organisme\s*:\s*(Ministère[^O]+?)(?=Objet|Message|$)/i);
                const organisme = orgMatch ? orgMatch[1].trim() : '';

                // Extraire les dates
                const dateRegex = /(\d{1,2})\s+(janv?\.?|févr?\.?|fév\.?|mars|avr\.?|avril|mai|juin|juil?\.?|ao[uû]t|sept?\.?|oct\.?|nov\.?|d[eé]c\.?)\s+(\d{4})/gi;
                const dates: string[] = [];
                let dateMatch;
                while ((dateMatch = dateRegex.exec(containerText)) !== null) {
                    dates.push(`${dateMatch[1]} ${dateMatch[2]} ${dateMatch[3]}`);
                }

                results.push({
                    id,
                    reference: reference || id,
                    titre: objet || intitule || `Consultation ${id}`,
                    acheteur: organisme,
                    dateLimite: dates.length > 1 ? dates[dates.length - 1] : dates[0] || '',
                    datePublication: dates[0] || '',
                    type: procedure,
                    procedure,
                    url: `https://www.marches-publics.gouv.fr/app.php/entreprise/consultation/${id}`,
                });

            } catch (e) {
                // Ignorer
            }
        });

        return results;
    });

    // Filtrer les faux résultats (éléments de navigation, titres invalides)
    const invalidTitles = [
        'accueil', 'catégorie', 'categorie', 'menu', 'connexion', 'contact',
        'aide', 'faq', 'recherche', 'inscription', 'déconnexion', 'panier',
        'mon compte', 'profil', 'paramètres', 'accéder', 'retour', 'suivant',
        'précédent', 'fermer', 'ouvrir', 'consultation', 'consultations'
    ];

    const validMarches = marches.filter(m => {
        const titre = (m.titre || '').toLowerCase().trim();

        // Exclure les titres trop courts (< 15 caractères)
        if (titre.length < 15) {
            console.log(`PLACE: Exclu (titre trop court): "${m.titre}"`);
            return false;
        }

        // Exclure les titres qui sont des éléments de navigation
        if (invalidTitles.includes(titre)) {
            console.log(`PLACE: Exclu (navigation): "${m.titre}"`);
            return false;
        }

        // Exclure les titres génériques type "Consultation XXXXX"
        if (/^consultation\s+\d+$/i.test(titre)) {
            console.log(`PLACE: Exclu (générique): "${m.titre}"`);
            return false;
        }

        return true;
    });

    // Ajouter la source PLACE et le ministère
    const marchesWithSource: MarchePlace[] = validMarches.map(m => ({
        ...m,
        source: 'PLACE' as const,
        lieu: 'France',
        ministry: ministry,
    }));

    console.log(`PLACE: ${marchesWithSource.length} marchés valides extraits (${marches.length - validMarches.length} exclus)`);
    return marchesWithSource;
}

/**
 * Récupère les détails d'une consultation spécifique
 */
export async function getPlaceConsultationDetails(consultationId: string): Promise<any> {
    const config = getPuppeteerConfig();
    if (!config) return null;

    let browser: Browser | null = null;

    try {
        browser = await puppeteer.launch(config);
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

        const url = `${PLACE_URL}/app.php/consultation/${consultationId}`;
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Extraire les détails
        const details = await page.evaluate(() => {
            const getData = (label: string) => {
                const rows = Array.from(document.querySelectorAll('tr, .info-row, .detail-row'));
                const row = rows.find(r => r.textContent?.includes(label));
                const cells = row?.querySelectorAll('td, .value, dd');
                return cells?.[cells.length - 1]?.textContent?.trim() || '';
            };

            return {
                reference: getData('Référence'),
                objet: document.querySelector('h1, .titre-consultation')?.textContent?.trim() || '',
                acheteur: getData('Organisme') || getData('Acheteur'),
                datePublication: getData('Date de publication') || getData('Mise en ligne'),
                dateLimite: getData('Date limite') || getData('Clôture'),
                procedure: getData('Procédure'),
                type: getData('Type'),
                departement: getData('Département') || getData('Lieu'),
                description: document.querySelector('.description, .objet-marche')?.textContent?.trim() || '',
                lots: Array.from(document.querySelectorAll('.lot, .lot-item')).map(lot => ({
                    numero: lot.querySelector('.numero, .lot-numero')?.textContent?.trim(),
                    intitule: lot.querySelector('.intitule, .lot-titre')?.textContent?.trim(),
                })),
            };
        });

        return details;

    } catch (error) {
        console.error(`PLACE: Erreur détails consultation ${consultationId}:`, error);
        return null;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Helper: délai
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Wrapper pour scraper le Ministère des Armées (compatibilité)
 */
export async function scrapePlaceMinarm(date?: Date): Promise<MarchePlace[]> {
    return scrapePlaceMinistry(date, 'MINARM');
}

/**
 * Wrapper pour scraper le Ministère de l'Intérieur
 */
export async function scrapePlaceMinint(date?: Date): Promise<MarchePlace[]> {
    return scrapePlaceMinistry(date, 'MININT');
}

// Export pour les types
export type { MarchePlace as PlaceMarche };
