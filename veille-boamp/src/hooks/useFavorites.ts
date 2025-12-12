'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

const FAVORITES_KEY = 'tenderspotter_favorites';

export interface FavoriteTender {
    id: string;
    title: string;
    buyerName: string;
    deadlineDate: string;
    addedAt: string;
}

export function useFavorites() {
    const { isSignedIn } = useAuth();
    const [favorites, setFavorites] = useState<FavoriteTender[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Charger les favoris depuis localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(FAVORITES_KEY);
            if (stored) {
                try {
                    setFavorites(JSON.parse(stored));
                } catch {
                    setFavorites([]);
                }
            }
            setIsLoaded(true);
        }
    }, []);

    // Sauvegarder les favoris dans localStorage
    useEffect(() => {
        if (isLoaded && typeof window !== 'undefined') {
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        }
    }, [favorites, isLoaded]);

    const addFavorite = useCallback((tender: {
        id: string;
        title: string;
        buyer: { name: string };
        deadlineDate: string;
    }) => {
        setFavorites(prev => {
            if (prev.some(f => f.id === tender.id)) return prev;
            return [...prev, {
                id: tender.id,
                title: tender.title,
                buyerName: tender.buyer.name,
                deadlineDate: tender.deadlineDate,
                addedAt: new Date().toISOString()
            }];
        });
        return true;
    }, []);

    const removeFavorite = useCallback((tenderId: string) => {
        setFavorites(prev => prev.filter(f => f.id !== tenderId));
    }, []);

    const toggleFavorite = useCallback((tender: {
        id: string;
        title: string;
        buyer: { name: string };
        deadlineDate: string;
    }) => {
        setFavorites(prev => {
            const exists = prev.some(f => f.id === tender.id);
            if (exists) {
                return prev.filter(f => f.id !== tender.id);
            } else {
                return [...prev, {
                    id: tender.id,
                    title: tender.title,
                    buyerName: tender.buyer.name,
                    deadlineDate: tender.deadlineDate,
                    addedAt: new Date().toISOString()
                }];
            }
        });
        return true;
    }, []);

    const isFavorite = useCallback((tenderId: string) => {
        return favorites.some(f => f.id === tenderId);
    }, [favorites]);

    const clearFavorites = useCallback(() => {
        setFavorites([]);
    }, []);

    return {
        favorites,
        isLoaded,
        isSignedIn,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        isFavorite,
        clearFavorites,
        count: favorites.length
    };
}
