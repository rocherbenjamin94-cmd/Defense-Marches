'use client';

import { useRouter } from 'next/navigation';
import { FormProvider, DC2FormProvider, useFormData, useFormDataDC2 } from '@/hooks/dc1';
import { DC2Form } from '@/components/dc1/form-dc2';
import { MainContainer } from '@/components/dc1/layout';
import { useEffect } from 'react';
import '@/lib/dc1/styles/variables.css';
import '@/lib/dc1/styles/global.css';

function DC2PageContent() {
    const router = useRouter();
    const { formData: dc1FormData, pappersData } = useFormData();
    const { prefillFromDC1 } = useFormDataDC2();

    useEffect(() => {
        // Prefill DC2 with DC1 data if available
        if (dc1FormData.candidat.siret) {
            const prefillData = {
                // DC1 Data
                siret: dc1FormData.candidat.siret,
                siren: dc1FormData.candidat.siret?.substring(0, 9),
                denomination_sociale: dc1FormData.candidat.denomination_sociale,
                nom_commercial: dc1FormData.candidat.nom_commercial,
                adresse_siege: dc1FormData.candidat.adresse_siege || dc1FormData.candidat.adresse_etablissement,
                adresse_etablissement: dc1FormData.candidat.adresse_etablissement,
                email: dc1FormData.candidat.email,
                telephone: dc1FormData.candidat.telephone,
                // Pappers Data
                ...(pappersData && {
                    forme_juridique: pappersData.forme_juridique,
                    date_creation: pappersData.date_creation_formate,
                    capital_social: pappersData.capital?.toString(),
                    devise_capital: 'EUR',
                    numero_rcs: pappersData.numero_rcs,
                    ville_rcs: pappersData.greffe,
                    code_naf: pappersData.code_naf,
                    libelle_naf: pappersData.libelle_code_naf,
                }),
            };
            prefillFromDC1(prefillData);
        }
    }, [dc1FormData, pappersData, prefillFromDC1]);

    const handleBackToDC1 = () => {
        router.push('/repondre/dc1');
    };

    return (
        <MainContainer>
            <DC2Form onBackToDC1={handleBackToDC1} />
        </MainContainer>
    );
}

export default function DC2Page() {
    return (
        <div className="min-h-screen bg-[#08080c] text-white pt-20">
            <FormProvider>
                <DC2FormProvider>
                    <DC2PageContent />
                </DC2FormProvider>
            </FormProvider>
        </div>
    );
}
