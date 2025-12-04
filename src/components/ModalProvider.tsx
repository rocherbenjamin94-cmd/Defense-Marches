'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Tender } from '@/lib/types';
import TenderDetailModal from '@/components/TenderDetailModal';

interface ModalContextType {
    openModal: (tender: Tender) => void;
    closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
    const [selectedTender, setSelectedTender] = useState<Tender | null>(null);

    const openModal = (tender: Tender) => {
        setSelectedTender(tender);
        document.body.style.overflow = 'hidden'; // Disable scroll
    };

    const closeModal = () => {
        setSelectedTender(null);
        document.body.style.overflow = 'unset'; // Re-enable scroll
    };

    return (
        <ModalContext.Provider value={{ openModal, closeModal }}>
            {children}
            {selectedTender && (
                <TenderDetailModal tender={selectedTender} onClose={closeModal} />
            )}
        </ModalContext.Provider>
    );
}

export function useModal() {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
}
