/**
 * Application Context - Global State, Role Management, and Reactive Data Provider
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  UserProfile,
  UserRole,
  BusinessSettings,
  QuoteDefaults,
  Customer,
  CatalogueItem,
  Quote,
  AppNotification,
  ActivityEvent,
  TemplateConfig,
  TeamMember,
} from '../types';
import { StorageService } from '../services/storage';
import { ApiService } from '../services/api';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  currentUser: UserProfile;
  availableUsers: UserProfile[];
  switchRole: (role: UserRole) => void;
  switchUser: (userId: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  business: BusinessSettings;
  updateBusiness: (settings: Partial<BusinessSettings>) => void;
  quoteDefaults: QuoteDefaults;
  updateQuoteDefaults: (defaults: Partial<QuoteDefaults>) => void;
  team: TeamMember[];
  addTeamMember: (member: Omit<TeamMember, 'id' | 'joinedAt'>) => void;
  customers: Customer[];
  refreshCustomers: () => void;
  saveCustomer: (customer: Partial<Customer> & { name: string; email: string }) => Customer;
  catalogue: CatalogueItem[];
  refreshCatalogue: () => void;
  saveCatalogueItem: (item: Partial<CatalogueItem> & { name: string; unitPrice: number }) => CatalogueItem;
  quotes: Quote[];
  refreshQuotes: () => void;
  saveQuote: (quote: Quote) => Quote;
  templates: TemplateConfig[];
  saveTemplate: (template: TemplateConfig) => void;
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  activities: ActivityEvent[];
  refreshActivities: () => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  dismissToast: (id: string) => void;
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  resetAllDemoData: () => void;
  isOnboardingCompleted: boolean;
  completeOnboarding: () => void;
  currentPlan: 'basic' | 'pro' | 'enterprise';
  billingInterval: 'monthly' | 'annual';
  quotesUsedThisMonth: number;
  quotesMonthlyLimit: number;
  changePlan: (plan: 'basic' | 'pro' | 'enterprise', interval?: 'monthly' | 'annual') => void;
  isUpgradeModalOpen: boolean;
  setUpgradeModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize storage once and hydrate from Cloud SQL if reachable
  useEffect(() => {
    StorageService.initialize();

    let isMounted = true;
    const hydrateFromBackend = async () => {
      try {
        const [qRes, cRes, catRes, bRes, aRes] = await Promise.allSettled([
          ApiService.getQuotes(),
          ApiService.getCustomers(),
          ApiService.getCatalogue(),
          ApiService.getBusiness(),
          ApiService.getActivityLogs(),
        ]);

        if (!isMounted) return;

        if (qRes.status === 'fulfilled' && qRes.value && qRes.value.length > 0) {
          setQuotes(qRes.value);
          qRes.value.forEach((q) => StorageService.saveQuote(q));
        }
        if (cRes.status === 'fulfilled' && cRes.value && cRes.value.length > 0) {
          setCustomers(cRes.value);
          cRes.value.forEach((c) => StorageService.saveCustomer(c));
        }
        if (catRes.status === 'fulfilled' && catRes.value && catRes.value.length > 0) {
          setCatalogue(catRes.value);
          StorageService.saveCatalogue(catRes.value);
        }
        if (bRes.status === 'fulfilled' && bRes.value) {
          const validBusiness: BusinessSettings = {
            ...bRes.value,
            address: bRes.value.address || {
              street: (bRes.value as any).street || '',
              city: (bRes.value as any).city || '',
              state: (bRes.value as any).state || '',
              postalCode: (bRes.value as any).postalCode || '',
              country: (bRes.value as any).country || 'United States',
            },
          };
          setBusinessState(validBusiness);
          StorageService.updateBusiness(validBusiness);
        }
        if (aRes.status === 'fulfilled' && aRes.value && aRes.value.length > 0) {
          setActivities(aRes.value);
        }
      } catch (err) {
        console.warn('Initial Cloud SQL sync skipped, operating in cached mode:', err);
      }
    };

    hydrateFromBackend();

    return () => {
      isMounted = false;
    };
  }, []);

  const [currentUser, setCurrentUserState] = useState<UserProfile>(() => StorageService.getCurrentUser());
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('aqg_theme_v1');
    return saved === 'dark' ? 'dark' : 'light';
  });

  const [business, setBusinessState] = useState<BusinessSettings>(() => StorageService.getBusiness());
  const [quoteDefaults, setQuoteDefaultsState] = useState<QuoteDefaults>(() => StorageService.getQuoteDefaults());
  const [team, setTeamState] = useState<TeamMember[]>(() => StorageService.getTeam());
  const [customers, setCustomers] = useState<Customer[]>(() => StorageService.getCustomers());
  const [catalogue, setCatalogue] = useState<CatalogueItem[]>(() => StorageService.getCatalogue());
  const [quotes, setQuotes] = useState<Quote[]>(() => StorageService.getQuotes());
  const [templates, setTemplates] = useState<TemplateConfig[]>(() => StorageService.getTemplates());
  const [notifications, setNotifications] = useState<AppNotification[]>(() => StorageService.getNotifications());
  const [activities, setActivities] = useState<ActivityEvent[]>(() => StorageService.getActivities());
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean>(() => StorageService.isOnboardingCompleted());

  // Subscription Pricing Plan State (Defaults to Basic $10/mo)
  const [currentPlan, setCurrentPlanState] = useState<'basic' | 'pro' | 'enterprise'>(() => {
    return (localStorage.getItem('aqg_plan_v1') as any) || 'basic';
  });
  const [billingInterval, setBillingIntervalState] = useState<'monthly' | 'annual'>(() => {
    return (localStorage.getItem('aqg_interval_v1') as any) || 'monthly';
  });
  const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const quotesUsedThisMonth = quotes.length + 8; // demo usage counter
  const quotesMonthlyLimit = currentPlan === 'basic' ? 50 : Infinity;

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const changePlan = useCallback(
    (newPlan: 'basic' | 'pro' | 'enterprise', newInterval?: 'monthly' | 'annual') => {
      setCurrentPlanState(newPlan);
      localStorage.setItem('aqg_plan_v1', newPlan);
      if (newInterval) {
        setBillingIntervalState(newInterval);
        localStorage.setItem('aqg_interval_v1', newInterval);
      }
      const planNames = { basic: 'Basic ($10/mo)', pro: 'Pro ($29/mo)', enterprise: 'Enterprise ($79/mo)' };
      setToasts((prev) => [
        ...prev,
        {
          id: `toast_${Date.now()}`,
          message: `Active subscription updated to ${planNames[newPlan]}!`,
          type: 'success',
        },
      ]);
    },
    []
  );

  // Apply dark theme class to documentElement
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('aqg_theme_v1', theme);
  }, [theme]);

  // Command palette keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    const users = StorageService.getAvailableUsers();
    const match = users.find((u) => u.role === role) || {
      ...currentUser,
      role,
    };
    StorageService.setCurrentUser(match);
    setCurrentUserState(match);
    showToast(`Switched active role to ${role.toUpperCase()}`, 'info');
  }, [currentUser, showToast]);

  const switchUser = useCallback((userId: string) => {
    const users = StorageService.getAvailableUsers();
    const user = users.find((u) => u.id === userId);
    if (user) {
      StorageService.setCurrentUser(user);
      setCurrentUserState(user);
      showToast(`Logged in as ${user.name} (${user.role.toUpperCase()})`, 'info');
    }
  }, [showToast]);

  const refreshQuotes = useCallback(async () => {
    const local = StorageService.getQuotes();
    setQuotes(local);
    const remote = await ApiService.getQuotes();
    if (remote && remote.length > 0) {
      setQuotes(remote);
    }
  }, []);

  const refreshCustomers = useCallback(async () => {
    const local = StorageService.getCustomers();
    setCustomers(local);
    const remote = await ApiService.getCustomers();
    if (remote && remote.length > 0) {
      setCustomers(remote);
    }
  }, []);

  const refreshCatalogue = useCallback(async () => {
    const local = StorageService.getCatalogue();
    setCatalogue(local);
    const remote = await ApiService.getCatalogue();
    if (remote && remote.length > 0) {
      setCatalogue(remote);
    }
  }, []);

  const refreshActivities = useCallback(async () => {
    const local = StorageService.getActivities();
    setActivities(local);
    const remote = await ApiService.getActivityLogs();
    if (remote && remote.length > 0) {
      setActivities(remote);
    }
  }, []);

  const updateBusiness = useCallback((newSettings: Partial<BusinessSettings>) => {
    const updated = StorageService.updateBusiness(newSettings);
    setBusinessState(updated);
    ApiService.updateBusiness(newSettings).catch((err) => console.warn('Cloud SQL business sync error:', err));
    showToast('Business profile updated', 'success');
  }, [showToast]);

  const updateQuoteDefaults = useCallback((newDefaults: Partial<QuoteDefaults>) => {
    const updated = StorageService.updateQuoteDefaults(newDefaults);
    setQuoteDefaultsState(updated);
    showToast('Quotation defaults updated', 'success');
  }, [showToast]);

  const addTeamMember = useCallback((member: Omit<TeamMember, 'id' | 'joinedAt'>) => {
    const created = StorageService.addTeamMember(member);
    setTeamState(StorageService.getTeam());
    showToast(`Invitation sent to ${created.email} (Simulated in demo mode)`, 'success');
  }, [showToast]);

  const saveCustomer = useCallback((customer: Partial<Customer> & { name: string; email: string }) => {
    const saved = StorageService.saveCustomer(customer);
    setCustomers(StorageService.getCustomers());
    ApiService.saveCustomer(saved).catch((err) => console.warn('Cloud SQL customer sync error:', err));
    showToast(`Customer "${saved.name}" saved`, 'success');
    return saved;
  }, [showToast]);

  const saveCatalogueItem = useCallback((item: Partial<CatalogueItem> & { name: string; unitPrice: number }) => {
    const saved = StorageService.saveCatalogueItem(item);
    setCatalogue(StorageService.getCatalogue());
    ApiService.saveCatalogueItem(saved).catch((err) => console.warn('Cloud SQL catalogue item sync error:', err));
    showToast(`Item "${saved.name}" saved to catalogue`, 'success');
    return saved;
  }, [showToast]);

  const saveQuote = useCallback((quote: Quote) => {
    const saved = StorageService.saveQuote(quote);
    setQuotes(StorageService.getQuotes());
    ApiService.saveQuote(saved).catch((err) => console.warn('Cloud SQL quote sync error:', err));
    return saved;
  }, []);

  const saveTemplate = useCallback((template: TemplateConfig) => {
    StorageService.saveTemplate(template);
    setTemplates(StorageService.getTemplates());
    showToast(`Template "${template.name}" updated`, 'success');
  }, [showToast]);

  const markNotificationRead = useCallback((id: string) => {
    StorageService.markNotificationAsRead(id);
    setNotifications(StorageService.getNotifications());
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    StorageService.markAllNotificationsAsRead();
    setNotifications(StorageService.getNotifications());
    showToast('All notifications marked as read', 'info');
  }, [showToast]);

  const resetAllDemoData = useCallback(() => {
    StorageService.resetAllDemoData();
    setCurrentUserState(StorageService.getCurrentUser());
    setBusinessState(StorageService.getBusiness());
    setQuoteDefaultsState(StorageService.getQuoteDefaults());
    setTeamState(StorageService.getTeam());
    setCustomers(StorageService.getCustomers());
    setCatalogue(StorageService.getCatalogue());
    setQuotes(StorageService.getQuotes());
    setTemplates(StorageService.getTemplates());
    setNotifications(StorageService.getNotifications());
    setActivities(StorageService.getActivities());
    setIsOnboardingCompleted(true);
    showToast('Demo environment reset to initial seed state', 'success');
  }, [showToast]);

  const completeOnboarding = useCallback(() => {
    StorageService.setOnboardingCompleted(true);
    setIsOnboardingCompleted(true);
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        availableUsers: StorageService.getAvailableUsers(),
        switchRole,
        switchUser,
        theme,
        toggleTheme,
        business,
        updateBusiness,
        quoteDefaults,
        updateQuoteDefaults,
        team,
        addTeamMember,
        customers,
        refreshCustomers,
        saveCustomer,
        catalogue,
        refreshCatalogue,
        saveCatalogueItem,
        quotes,
        refreshQuotes,
        saveQuote,
        templates,
        saveTemplate,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        activities,
        refreshActivities,
        toasts,
        showToast,
        dismissToast,
        isCommandPaletteOpen,
        setCommandPaletteOpen,
        resetAllDemoData,
        isOnboardingCompleted,
        completeOnboarding,
        currentPlan,
        billingInterval,
        quotesUsedThisMonth,
        quotesMonthlyLimit,
        changePlan,
        isUpgradeModalOpen,
        setUpgradeModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
