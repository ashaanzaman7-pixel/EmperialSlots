
import React from 'react';

export type AdminRole = 'Emperor' | 'King' | 'Duke' | 'Marquis' | 'Count' | 'Viscount' | 'Baron' | 'Peasant';

export interface User {
    id: string;
    playerId: string;
    email: string;
    name: string;
    balance: number;
    photoURL?: string;
    phone?: string;
    country?: string;
    profileCardBg?: string;
    createdAt?: string;
    // RBAC Fields
    role?: AdminRole;
    adminPermissions?: string[]; // e.g., ['images', 'games', 'security']
    adminPin?: string;
}

export enum ViewState {
    AUTH = 'AUTH',
    HOME = 'HOME',
    ABOUT = 'ABOUT',
    GAMES_INTRO = 'GAMES_INTRO',
    DASHBOARD = 'DASHBOARD',
    PROFILE = 'PROFILE',
    GAME_PANEL = 'GAME_PANEL',
    ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
    STATUS = 'STATUS',
    P2P_TRANSFER = 'P2P_TRANSFER',
    DEPOSIT = 'DEPOSIT',
    WITHDRAW = 'WITHDRAW',
    TUTORIALS = 'TUTORIALS',
    BLOG = 'BLOG',
    FAQ_PAGE = 'FAQ_PAGE',
    PRIVACY = 'PRIVACY',
    TERMS = 'TERMS',
    AML = 'AML',
    RESPONSIBLE = 'RESPONSIBLE'
}

export interface Game {
    id: string;
    title: string;
    description?: string;
    image: string;
    isHot?: boolean;
    rating?: number;
    activePlayers?: string;
    playLink?: string;
    downloadLink?: string;
    videoLink?: string;
}

// New Interface for Game Intro Pages (Full Screen Games)
export interface IntroGame {
    id: string;
    title: string;
    description: string;
    image: string;
    playLink?: string;
    downloadLink?: string;
    showDownload: boolean;
}

export interface PlatformStatus {
    id: string;
    name: string;
    image: string;
    status: 'Operational' | 'Down';
    details: string;
}

export interface GamePanelSoftware {
    id: string;
    name: string;
    image: string;
    status: 'Active' | 'Inactive';
    downloadUrl?: string;
}

export interface P2PTransaction {
    id: string;
    type: 'Sent' | 'Received';
    amount: number;
    counterpartyName: string;
    counterpartyEmail: string;
    timestamp: string;
    status: 'Success' | 'Failed';
}

export interface Feature {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
}

export interface ImageSettings {
    url: string;
    positionX: number;
    positionY: number;
    scale: number;
    opacity?: number;
}

export interface FAQ {
    id: string;
    question: string;
    answer: string;
    isFeatured: boolean;
}

export interface Tutorial {
    id: string;
    title: string;
    videoUrl: string;
}

export interface TelegramSettings {
    botToken: string;
    chatId: string;
}

export interface UploadedDocument {
    id: string;
    name: string;
    content: string;
    timestamp: string;
}

export interface AISettings {
    enabled: boolean;
    provider: 'gemini' | 'openrouter';
    geminiKey: string;
    openRouterKey: string;
    systemPrompt: string;
    knowledgeBase: string; // To attach document text manually
}

export interface SupportTelegramSettings {
    enabled: boolean;
    method: 'telegram' | 'webhook';
    botToken: string;
    chatId: string;
    webhookUrl: string;
}

export interface SocialLinks {
    facebook: string;
    youtube: string;
    instagram: string;
}

// NEW: Cash Flow Configuration
export interface CashFlowProvider {
    enabled: boolean;
    apiKey?: string;
    apiSecret?: string;
    merchantId?: string;
    webhookSecret?: string;
    email?: string; // For PayPal/CashApp
    cashtag?: string; // For CashApp
}

export interface CashFlowConfig {
    stripe: CashFlowProvider;
    paypal: CashFlowProvider;
    coinbase: CashFlowProvider;
    cashapp: CashFlowProvider;
}

// NEW: Detailed Webhook Configuration
export interface WebhookConfig {
    accountCreate: string;
    passwordReset: string;
    addCredits: string;
    redeemCredits: string;
    freePlay: string;
}

export interface SiteConfig {
    authHostess: ImageSettings;
    mobileAuthHostess: ImageSettings;
    tabletAuthHostess: ImageSettings; // NEW: Tablet Auth Character
    
    authBg: ImageSettings; 
    mobileAuthBg: ImageSettings;
    tabletAuthBg: ImageSettings; // NEW: Tablet Auth Background
    
    mobileSidebarBg: ImageSettings;
    authCircleImages: string[]; 
    mobileAuthCircleImages: string[];
    
    homeHeroBg: ImageSettings;
    tabletHeroBg: ImageSettings; // NEW: Tablet Hero Background
    
    heroLeftChar: ImageSettings;
    heroRightChar: ImageSettings;
    heroWelcomeChar: ImageSettings;

    // Tablet Hero Specifics (NEW)
    tabletHeroWelcomeChar: ImageSettings;
    
    // Mobile Hero Specifics
    mobileHeroWelcomeChar: ImageSettings;
    mobileHeroLeftDecor: ImageSettings;
    mobileHeroRightDecor: ImageSettings;
    mobileHeroTextScale: number;
    
    featuredGameLeftChar: ImageSettings;
    featuredGameRightChar: ImageSettings;
    aboutHeroLeft: ImageSettings;
    aboutPassionImg: ImageSettings; 
    aboutClosingRight: ImageSettings;
    statusBg: ImageSettings;
    profileBg: ImageSettings;
    profileCardPeekingImg: ImageSettings;
    gamePanelBg: ImageSettings;
    dashboardBg: ImageSettings;
    footerBg: ImageSettings;
    footerRightChar: ImageSettings;
    howItWorksBg: ImageSettings;
    fishSectionBg: ImageSettings;
    fishSectionLeftChar: ImageSettings;
    gamePanelWarningChar: ImageSettings;
    featuredGamesBg: ImageSettings;
    whyChooseBg: ImageSettings;
    featuredGames: Game[];
    introGames: IntroGame[];
    platformStatus: PlatformStatus[];
    gamePanelSoftware: GamePanelSoftware[];
    gamePanelRules?: {
        adding: string;
        redeeming: string;
    };
    faqs: FAQ[]; 
    tutorials: Tutorial[];
    
    // Webhooks (Replaced single URL with object)
    webhooks: WebhookConfig;
    
    // Legacy fields (kept for type safety during migration, can be removed later)
    webhookUrl?: string; 
    resetWebhookUrl?: string; 
    transactionWebhookUrl?: string; 
    chatbotWebhookUrl?: string; 
    
    enableSupportTab: boolean;
    aiConfig: AISettings;
    supportContact: SupportTelegramSettings;
    socialLinks: SocialLinks;
    cashFlow: CashFlowConfig; // NEW
    telegram: {
        create: TelegramSettings;
        reset: TelegramSettings;
        transaction: TelegramSettings;
        freePlay: TelegramSettings;
    };
}
