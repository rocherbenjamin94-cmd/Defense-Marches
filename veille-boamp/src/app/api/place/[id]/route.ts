// src/app/api/place/[id]/route.ts
// API Route pour récupérer les détails d'une consultation PLACE

import { NextResponse } from 'next/server';
import { getPlaceConsultationDetails } from '@/lib/place';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 1 minute max

// GET /api/place/[id] - Détails d'une consultation
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json(
            { success: false, error: 'ID de consultation requis' },
            { status: 400 }
        );
    }

    try {
        console.log(`PLACE API: Récupération détails consultation ${id}...`);
        const details = await getPlaceConsultationDetails(id);

        if (!details) {
            return NextResponse.json(
                { success: false, error: 'Consultation non trouvée' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: details,
        });

    } catch (error) {
        console.error(`PLACE API: Erreur consultation ${id}:`, error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erreur lors de la récupération des détails',
                details: String(error)
            },
            { status: 500 }
        );
    }
}
