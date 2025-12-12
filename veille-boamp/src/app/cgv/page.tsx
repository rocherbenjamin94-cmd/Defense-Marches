'use client';

import Link from 'next/link';

export default function CGV() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-20">
            <div className="max-w-3xl mx-auto px-6">
                <Link href="/accueil" className="text-blue-500 hover:text-blue-400 mb-8 inline-block">
                    ← Retour à l'accueil
                </Link>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Conditions Générales de Vente</h1>

                <p className="text-gray-500 dark:text-gray-400 italic mb-8">Dernière mise à jour : Décembre 2024</p>

                <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Objet</h2>
                        <p>
                            Les présentes CGV régissent l'utilisation de la plateforme TenderSpotter,
                            service d'aide à la réponse aux marchés publics.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. Services proposés</h2>
                        <p>TenderSpotter propose :</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Consultation des appels d'offres publics (gratuit)</li>
                            <li>Analyse automatisée des marchés par IA</li>
                            <li>Génération de documents DC1/DC2</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. Tarifs</h2>
                        <p>
                            <strong>Offre gratuite :</strong> 5 générations de documents DC1/DC2 par mois.<br />
                            <strong>Offre Premium :</strong> Générations illimitées - tarif sur demande.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. Inscription</h2>
                        <p>
                            L'utilisation des services de génération nécessite la création d'un compte.
                            L'utilisateur s'engage à fournir des informations exactes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. Responsabilité</h2>
                        <p>
                            TenderSpotter fournit une aide à la rédaction. L'utilisateur reste seul responsable
                            de la vérification et de la soumission de ses documents aux acheteurs publics.
                        </p>
                        <p>
                            TenderSpotter ne garantit pas l'obtention des marchés et ne peut être tenu responsable
                            en cas de rejet de candidature.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6. Données personnelles</h2>
                        <p>
                            Les données sont traitées conformément au RGPD.
                            Voir nos <Link href="/mentions-legales" className="text-blue-500 hover:text-blue-400">Mentions Légales</Link> pour plus de détails.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">7. Résiliation</h2>
                        <p>
                            L'utilisateur peut supprimer son compte à tout moment en contactant contact@tenderspotter.fr.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">8. Droit applicable</h2>
                        <p>
                            Les présentes CGV sont soumises au droit français.
                            Tout litige sera de la compétence des tribunaux du Mans.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">9. Contact</h2>
                        <p>
                            Pour toute question : <a href="mailto:contact@tenderspotter.fr" className="text-blue-500 hover:text-blue-400">contact@tenderspotter.fr</a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
