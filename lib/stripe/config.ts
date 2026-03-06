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
    assistantQuota: 3,  // 3 requêtes scénariste/mois (clé serveur)
    features: ['7 moteurs d\'analyse', '5 générations/mois', '3 projets max', 'Assistant IA (3 requêtes)', 'Export JSON'],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID || '',
    generations: 100,
    projects: 20,
    engines: 17,
    assistantQuota: 30,  // 30 requêtes/mois ou clé perso illimité
    features: ['17 moteurs d\'analyse', '100 générations/mois', '20 projets', 'Assistant IA (30 requêtes)', 'Export JSON + MP4', 'Support prioritaire'],
  },
  studio: {
    id: 'studio',
    name: 'Studio',
    price: 79,
    priceId: process.env.STRIPE_STUDIO_PRICE_ID || '',
    generations: -1,
    projects: -1,
    engines: 17,
    assistantQuota: -1,  // illimité (clé perso recommandée)
    features: ['17 moteurs d\'analyse', 'Générations illimitées', 'Projets illimités', 'Assistant IA illimité', 'Export tous formats', 'API access', 'Support dédié'],
  },
} as const;

export type PlanId = keyof typeof PLANS;

// ─── Credit Packs (one-time purchase) ───
export const CREDIT_PACKS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    credits: 50,
    price: 9.99,
    priceId: process.env.STRIPE_CREDITS_STARTER_ID || '',
    perCredit: 0.20,
    popular: false,
  },
  creator: {
    id: 'creator',
    name: 'Creator',
    credits: 150,
    price: 24.99,
    priceId: process.env.STRIPE_CREDITS_CREATOR_ID || '',
    perCredit: 0.17,
    popular: true,
  },
  studio: {
    id: 'studio_pack',
    name: 'Studio',
    credits: 500,
    price: 69.99,
    priceId: process.env.STRIPE_CREDITS_STUDIO_ID || '',
    perCredit: 0.14,
    popular: false,
  },
} as const;

export type CreditPackId = keyof typeof CREDIT_PACKS;
