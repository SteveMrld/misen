import Stripe from 'stripe';

export function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-12-18.acacia' as any,
  });
}

// ─── Plans MISEN ───
export const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceId: null as string | null,
    generations: 5,
    projects: 3,
    engines: 7,
    features: ['7 moteurs d\'analyse', '5 générations/mois', '3 projets max', 'Export JSON'],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID || '',
    generations: 100,
    projects: 20,
    engines: 13,
    features: ['13 moteurs d\'analyse', '100 générations/mois', '20 projets', 'Export JSON + MP4', 'Support prioritaire'],
  },
  studio: {
    id: 'studio',
    name: 'Studio',
    price: 79,
    priceId: process.env.STRIPE_STUDIO_PRICE_ID || '',
    generations: -1,
    projects: -1,
    engines: 13,
    features: ['13 moteurs d\'analyse', 'Générations illimitées', 'Projets illimités', 'Export tous formats', 'API access', 'Support dédié'],
  },
} as const;

export type PlanId = keyof typeof PLANS;
