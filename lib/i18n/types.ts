export interface Dictionary {
  common: {
    appName: string
    tagline: string
    login: string
    register: string
    logout: string
    dashboard: string
    settings: string
    demo: string
    pricing: string
    home: string
    back: string
    save: string
    cancel: string
    delete: string
    confirm: string
    loading: string
    error: string
    success: string
    or: string
    and: string
    free: string
    month: string
    year: string
    unlimited: string
    contact: string
    learnMore: string
    getStarted: string
    tryDemo: string
    comparePlans: string
  }
  nav: {
    demo: string
    pricing: string
    login: string
    register: string
    contact: string
  }
  landing: {
    heroTitle: string
    heroSubtitle: string
    heroDesc: string
    ctaPrimary: string
    ctaSecondary: string
    formats: { label: string; desc: string }[]
    steps: { step: string; title: string; desc: string }[]
    stats: { value: string; label: string }[]
    scenariosTitle: string
    scenariosSubtitle: string
    scenarios: { title: string; genre: string }[]
    modelsTitle: string
    modelsSubtitle: string
    models: { name: string; tag: string; desc: string }[]
    plansTitle: string
    plansSubtitle: string
    plans: { name: string; price: string; desc: string; features: string[] }[]
    features: { title: string; desc: string }[]
    footerTagline: string
    footerCta: string
    memorial: string
  }
  demo: {
    title: string
    subtitle: string
    scenarioLabel: string
    scenarios: { title: string; genre: string; logline: string }[]
    playerPlay: string
    playerPause: string
    analysisTitle: string
    shotsDetected: string
    modelsAssigned: string
    estimatedBudget: string
    avgTension: string
    promptTitle: string
    promptNeg: string
    copyPrompt: string
    copied: string
    openIn: string
    generateWith: string
    configureKey: string
    noKeyInfo: string
    ctaTitle: string
    ctaDesc: string
    ctaButton: string
    storyboardTitle: string
    tensionTitle: string
    budgetTitle: string
    characterTitle: string
    tabAnalysis: string
    tabPrompts: string
    tabStoryboard: string
    tabTension: string
    tabBudget: string
    tabCharacters: string
  }
  pricing: {
    title: string
    subtitle: string
    monthly: string
    annual: string
    annualSave: string
    popular: string
    plans: {
      name: string
      price: string
      annualPrice: string
      desc: string
      cta: string
      features: { text: string; included: boolean }[]
    }[]
    valueTitle: string
    valuePillars: { title: string; desc: string }[]
    faqTitle: string
    faq: { q: string; a: string }[]
    ctaTitle: string
    ctaDesc: string
    ctaButton: string
    ctaSecondary: string
  }
  login: {
    title: string
    subtitle: string
    email: string
    password: string
    submit: string
    googleLogin: string
    noAccount: string
    registerLink: string
    forgotPassword: string
    errorInvalid: string
    errorGeneric: string
  }
  register: {
    title: string
    subtitle: string
    name: string
    email: string
    password: string
    passwordHint: string
    submit: string
    googleRegister: string
    hasAccount: string
    loginLink: string
    termsPrefix: string
    termsLink: string
    cgvLink: string
    privacyLink: string
    successTitle: string
    successDesc: string
    checkEmail: string
  }
  forgotPassword: {
    title: string
    subtitle: string
    email: string
    submit: string
    backToLogin: string
    successTitle: string
    successDesc: string
    errorNotFound: string
  }
  dashboard: {
    title: string
    subtitle: string
    newProject: string
    importProject: string
    searchPlaceholder: string
    noProjects: string
    noProjectsDesc: string
    createFirst: string
    projectCard: {
      scenes: string
      shots: string
      lastModified: string
      open: string
      delete: string
      confirmDelete: string
    }
    stats: {
      totalProjects: string
      totalShots: string
      avgTension: string
      modelsUsed: string
    }
  }
  settings: {
    title: string
    tabs: {
      profile: string
      apikeys: string
      billing: string
      usage: string
    }
    profile: {
      title: string
      name: string
      email: string
      save: string
      deleteAccount: string
      deleteAccountDesc: string
      deleteAccountConfirm: string
      exportData: string
      exportDataDesc: string
      exportDataButton: string
    }
    apikeys: {
      title: string
      desc: string
      addKey: string
      provider: string
      key: string
      save: string
      delete: string
      confirmDelete: string
      noKeys: string
      noKeysDesc: string
    }
    billing: {
      title: string
      currentPlan: string
      changePlan: string
      manageBilling: string
      features: string
    }
    usage: {
      title: string
      analysesUsed: string
      assistantUsed: string
      of: string
      resetDate: string
    }
  }
  project: {
    tabs: {
      script: string
      analysis: string
      timeline: string
      copilot: string
      media: string
      subtitles: string
      voiceover: string
      overview: string
    }
    modeSimple: string
    cockpit: {
      title: string
      totalShots: string
      totalScenes: string
      totalBudget: string
      continuityScore: string
      modelDistribution: string
      tensionCurve: string
      continuityAlerts: string
      exportStatus: string
      noAlerts: string
      alertType: string
      alertSeverity: string
      ready: string
      notReady: string
      formats: string
      complianceStatus: string
      avgDuration: string
      noAnalysis: string
      noAnalysisDesc: string
    }
    characterRef: {
      uploadImage: string
      removeImage: string
      referenceImage: string
      injectedInPrompts: string
      dragOrClick: string
      maxSize: string
      supportedFormats: string
      imageUploaded: string
      noImage: string
      injectHint: string
    }
    templates: {
      title: string
      subtitle: string
      useTemplate: string
      preview: string
      scenes: string
      shots: string
      categories: {
        luxury: string
        shortFilm: string
        musicVideo: string
        educational: string
        gameTrailer: string
        corporate: string
      }
    }
    modeExpert: string
    analyze: string
    analyzing: string
    export: string
    scriptPlaceholder: string
  }
  onboarding: {
    steps: {
      title: string
      desc: string
    }[]
    skip: string
    next: string
    start: string
  }
  notFound: {
    title: string
    subtitle: string
    desc: string
    home: string
    studio: string
  }
  errorPage: {
    title: string
    desc: string
    home: string
    retry: string
  }
  cookie: {
    message: string
    accept: string
    learnMore: string
  }
  contact: {
    title: string
    subtitle: string
    emailLabel: string
    email: string
    subjectLabel: string
    messageLabel: string
    send: string
    sent: string
    sentDesc: string
    info: string
  }
  footer: {
    product: string
    legal: string
    cgu: string
    cgv: string
    privacy: string
    mentions: string
    rights: string
  }
  sidebar: {
    projects: string
    settings: string
    newProject: string
    logout: string
    plan: string
  }
}
