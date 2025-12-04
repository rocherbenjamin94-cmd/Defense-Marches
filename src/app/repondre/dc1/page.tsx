'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FormProvider, useFormData } from '@/hooks/dc1';
import { DC1Form } from '@/components/dc1/form';
import { MainContainer } from '@/components/dc1/layout';
import '@/lib/dc1/styles/variables.css';
import '@/lib/dc1/styles/global.css';

function DC1PageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { updateAcheteur, updateConsultation } = useFormData();

    useEffect(() => {
        const acheteur = searchParams.get('acheteur');
        const objet = searchParams.get('objet');
        const marcheId = searchParams.get('marcheId');
        const dateLimite = searchParams.get('dateLimite');

        if (acheteur) {
            updateAcheteur({ nom: acheteur });
        }

        if (objet || marcheId || dateLimite) {
            updateConsultation({
                objet: objet || '',
                reference: marcheId || '',
                date_limite: dateLimite || '',
            });
        }
    }, [searchParams, updateAcheteur, updateConsultation]);

    const handleGoToDC2 = () => {
        // Navigate to DC2 with same search params to persist context if needed
        // Or just navigate to /repondre/dc2
        // We might want to pass data via state or local storage which hooks handle
        router.push('/repondre/dc2');
    };

    return (
        <MainContainer>
            <DC1Form onGoToDC2={handleGoToDC2} />
        </MainContainer>
    );
}

export default function DC1Page() {
    return (
        <div className="min-h-screen bg-[#08080c] text-white pt-20 dc1-wrapper">
            <FormProvider>
                <Suspense fallback={<div>Chargement...</div>}>
                    <DC1PageContent />
                </Suspense>
            </FormProvider>
        </div>
    );
}
