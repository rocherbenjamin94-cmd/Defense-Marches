'use client';

import Link from 'next/link';

export default function MentionsLegales() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-20">
            <div className="max-w-3xl mx-auto px-6">
                <Link href="/accueil" className="text-blue-500 hover:text-blue-400 mb-8 inline-block">
                    ← Retour à l'accueil
                </Link>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Mentions Légales</h1>

                <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Éditeur du site</h2>
                        <p>
                            <strong>TDS TENDERSPOTTER</strong> (nom commercial : TENDERSPOTTER)<br />
                            SAS - Société par Actions Simplifiée<br />
                            Capital social : 1 500,00 €<br />
                            SIREN : 844 844 993<br />
                            SIRET (siège) : 844 844 993 00015<br />
                            RCS : Le Mans (inscrit le 26/12/2018)<br />
                            N° TVA Intracommunautaire : FR69844844993<br />
                            Siège social : 261 Route du Rôti, 72530 Yvré-l'Évêque<br />
                            Date de création : 01/12/2018<br />
                            Email : contact@tenderspotter.fr<br />
                            Site web : tenderspotter.fr
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Direction</h2>
                        <p>
                            <strong>Président :</strong> Benjamin Rocher<br />
                            <strong>Directeur général :</strong> Romain Rocher
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Activité</h2>
                        <p>
                            Assistance aux opérateurs économiques dans le cadre des marchés publics et privés.<br />
                            Conseil pour les affaires et autres conseils de gestion.<br />
                            Code NAF : 70.22Z
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Hébergement</h2>
                        <p>
                            <strong>Frontend :</strong> Vercel Inc.<br />
                            440 N Barranca Ave #4133, Covina, CA 91723, USA
                        </p>
                        <p>
                            <strong>Backend :</strong> Render Services, Inc.<br />
                            525 Brannan St, Suite 300, San Francisco, CA 94107, USA
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Propriété intellectuelle</h2>
                        <p>
                            L'ensemble du contenu de ce site (textes, images, logos, logiciels) est la propriété exclusive de TDS TENDERSPOTTER,
                            sauf mention contraire. Toute reproduction est interdite sans autorisation préalable.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Données personnelles</h2>
                        <p>
                            Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données.
                            Pour exercer ce droit, contactez-nous à : contact@tenderspotter.fr
                        </p>
                        <p>
                            Les données collectées (email, SIRET) sont utilisées uniquement pour le fonctionnement du service
                            et ne sont pas revendues à des tiers.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Cookies</h2>
                        <p>
                            Ce site utilise des cookies techniques nécessaires au fonctionnement (authentification).
                            Aucun cookie publicitaire n'est utilisé.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
