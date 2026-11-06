import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrandLogo } from '../components/ui/BrandLogo';
import { CurrencyAmount } from '../components/ui/CurrencyAmount';
import {
  FileText,
  ShieldCheck,
  Zap,
  ArrowRight,
  BookOpen,
  Send,
  CheckCircle2,
  Lock,
  Layers,
  Sliders,
  Clock,
  Check,
  FileDown,
  Building2,
  Wrench,
  Laptop,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Mail,
  ExternalLink,
  Eye,
  HelpCircle,
  Copy,
  Printer,
  BadgeCheck,
  CheckCheck,
  Award,
  FileSpreadsheet,
  Receipt,
  TrendingUp,
} from 'lucide-react';

interface DemoScenario {
  id: string;
  category: string;
  title: string;
  customer: string;
  inboundText: string;
  matchedItems: {
    sku: string;
    name: string;
    qty: number;
    unit: string;
    rate: number;
    total: number;
  }[];
  depositPercent: number;
}

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // Interactive Live Demo Simulator Scenarios
  const demoScenarios: DemoScenario[] = [
    {
      id: 'commercial',
      category: 'Commercial Fit-Out',
      title: '5,000 sq ft Office Acoustic Partitions & Power',
      customer: 'Apex Innovations Ltd',
      inboundText:
        'Hi Quotivo, we need a quote to fit out our new 5,000 sq ft floor: acoustic stud partitioning (approx 85 linear m), 4 glazed meeting room doors, double socket ring main, and final power sweep handover.',
      matchedItems: [
        { sku: 'CAT-FIT-081', name: 'Acoustic Stud Wall Partitioning (Double Plasterboard)', qty: 85, unit: 'lin m', rate: 110, total: 9350 },
        { sku: 'CAT-FIT-094', name: 'Solid Core Acoustic Doorset & Glazed Vision Panel', qty: 4, unit: 'item', rate: 750, total: 3000 },
        { sku: 'CAT-ELE-102', name: 'Commercial Ring Main 32A with Twin USB Sockets', qty: 18, unit: 'point', rate: 145, total: 2610 },
        { sku: 'CAT-CLN-004', name: 'Commercial Post-Construction Power Sweep & Clean', qty: 1, unit: 'service', rate: 850, total: 850 },
      ],
      depositPercent: 25,
    },
    {
      id: 'hvac',
      category: 'Specialist MEP',
      title: 'Commercial Server Room & Office Multi-Split AC',
      customer: 'Vanguard Data Systems',
      inboundText:
        'Urgent requirement for dual 14kW ceiling cassette air con units for our primary server room, plus fresh air ventilation ducting and digital Wi-Fi touch controllers.',
      matchedItems: [
        { sku: 'CAT-HVAC-012', name: '14kW Inverter Ceiling Cassette Heat Pump (R32)', qty: 2, unit: 'unit', rate: 2850, total: 5700 },
        { sku: 'CAT-HVAC-045', name: 'Rigid Spiral Galvanized Ducting & Diffusers (200mm)', qty: 35, unit: 'linear m', rate: 68, total: 2380 },
        { sku: 'CAT-HVAC-088', name: 'BMS Digital Touch Screen Controller & Wi-Fi Gateway', qty: 2, unit: 'unit', rate: 420, total: 840 },
        { sku: 'CAT-COM-001', name: 'F-Gas Certified Commissioning & Pressure Testing', qty: 1, unit: 'cert', rate: 950, total: 950 },
      ],
      depositPercent: 30,
    },
    {
      id: 'civil',
      category: 'Civil Works',
      title: 'Structural Retaining Wall & Foundation Works',
      customer: 'Crestline Infrastructure',
      inboundText:
        'Please quote excavation and masonry construction of a 45m retaining wall along North perimeter, including rubble spoil removal and perimeter security fencing.',
      matchedItems: [
        { sku: 'CAT-CIV-008', name: 'Mechanical Trench Excavation & Spoil Removal', qty: 42, unit: 'tonne', rate: 65, total: 2730 },
        { sku: 'CAT-CIV-022', name: 'Reinforced Concrete Foundation Footing (Grade C35)', qty: 18, unit: 'cu m', rate: 240, total: 4320 },
        { sku: 'CAT-CIV-041', name: 'Double-Skin Class B Engineering Brickwork', qty: 65, unit: 'sq m', rate: 115, total: 7475 },
        { sku: 'CAT-SEC-003', name: 'Heras Anti-Climb Temporary Site Perimeter Fencing', qty: 45, unit: 'linear m', rate: 18, total: 810 },
      ],
      depositPercent: 20,
    },
  ];

  const [activeScenarioId, setActiveScenarioId] = useState<string>('commercial');
  const activeScenario = demoScenarios.find((s) => s.id === activeScenarioId) || demoScenarios[0];

  const subtotal = activeScenario.matchedItems.reduce((acc, i) => acc + i.total, 0);
  const tax = subtotal * 0.1; // 10% tax
  const grandTotal = subtotal + tax;
  const deposit = grandTotal * (activeScenario.depositPercent / 100);

  // Interactive ROI Calculator State
  const [monthlyQuotes, setMonthlyQuotes] = useState<number>(35);
  const [avgQuoteValue, setAvgQuoteValue] = useState<number>(6500);

  // Hours saved: ~1.5h per quote manually drafted vs 5 min in Quotivo
  const hoursSavedPerMonth = Math.round(monthlyQuotes * 1.4);
  // Value protected: ~3.5% margin lost to manual math/pricing errors
  const marginProtectedPerYear = Math.round(monthlyQuotes * 12 * avgQuoteValue * 0.035);

  // Pricing State
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // Interactive Hero Preview Trade State
  const [heroTrade, setHeroTrade] = useState<'hvac' | 'fitout' | 'civil'>('hvac');

  // Interactive UI States
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isEmailPreviewOpen, setIsEmailPreviewOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden subtle-animated-bg text-neutral-900 dark:text-neutral-100 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900 relative">
      {/* Ambient background glow & vibrant high-tech aura */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-blue-500/20 via-indigo-500/15 to-transparent blur-3xl rounded-full pointer-events-none" />
        <div className="absolute top-36 -left-32 w-96 h-96 bg-cyan-500/15 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute top-52 -right-32 w-96 h-96 bg-blue-600/15 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800c_1px,transparent_1px),linear-gradient(to_bottom,#8080800c_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_65%_55%_at_50%_0%,#000_75%,transparent_100%)] pointer-events-none" />
      </div>

      {/* Top Bar following Top Bar Contract: Brand, Nav links, 1 Primary Action */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors w-full">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-3 sm:px-6 h-13 sm:h-14">
          {/* Zone 1: Brand Wordmark */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity shrink-0">
            <BrandLogo size="xs" showTagline={true} tagline="AI Quote Generator" />
          </Link>

          {/* Zone 2: Concise Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-600 dark:text-neutral-400">
            <a href="#simulator" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors whitespace-nowrap shrink-0">
              Live Simulator
            </a>
            <a href="#workflow" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors whitespace-nowrap shrink-0">
              Workflow
            </a>
            <a href="#calculator" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors whitespace-nowrap shrink-0">
              ROI Calculator
            </a>
            <a href="#pricing" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors whitespace-nowrap shrink-0 font-semibold text-blue-600 dark:text-blue-400">
              Pricing
            </a>
            <a href="#faq" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors whitespace-nowrap shrink-0">
              FAQ
            </a>
            <Link to="/login" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors whitespace-nowrap shrink-0">
              Sign In
            </Link>
          </nav>

          {/* Zone 3: Actions (Desktop & Mobile) */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/app"
              className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs hover:shadow-blue-500/20 transition-all whitespace-nowrap shrink-0"
            >
              Launch App
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="md:hidden p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileNavOpen && (
          <div className="md:hidden border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-3 space-y-2 animate-in slide-in-from-top-2 duration-150 text-xs">
            <a
              href="#simulator"
              onClick={() => setIsMobileNavOpen(false)}
              className="block py-2 text-neutral-700 dark:text-neutral-300 hover:text-blue-600 font-medium"
            >
              Live Simulator
            </a>
            <a
              href="#workflow"
              onClick={() => setIsMobileNavOpen(false)}
              className="block py-2 text-neutral-700 dark:text-neutral-300 hover:text-blue-600 font-medium"
            >
              Workflow Pipeline
            </a>
            <a
              href="#calculator"
              onClick={() => setIsMobileNavOpen(false)}
              className="block py-2 text-neutral-700 dark:text-neutral-300 hover:text-blue-600 font-medium"
            >
              ROI Calculator
            </a>
            <a
              href="#pricing"
              onClick={() => setIsMobileNavOpen(false)}
              className="block py-2 font-semibold text-blue-600 dark:text-blue-400"
            >
              Pricing & Plans ($10 / $29 / $79)
            </a>
            <a
              href="#faq"
              onClick={() => setIsMobileNavOpen(false)}
              className="block py-2 text-neutral-700 dark:text-neutral-300 hover:text-blue-600 font-medium"
            >
              Frequently Asked Questions
            </a>
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <Link
                to="/login"
                onClick={() => setIsMobileNavOpen(false)}
                className="py-1.5 text-neutral-600 dark:text-neutral-400 hover:underline"
              >
                Sign In
              </Link>
              <Link
                to="/onboarding"
                onClick={() => setIsMobileNavOpen(false)}
                className="py-1.5 px-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-semibold"
              >
                Test Onboarding
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section: Executive, Compact, Authoritative B2B SaaS */}
      <section className="pt-6 sm:pt-10 pb-6 sm:pb-12 px-3 sm:px-6 max-w-4xl mx-auto text-center space-y-4 sm:space-y-5 relative z-10 w-full">
        {/* Kicker Badge: Minimal, Professional */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[11px] font-medium border border-neutral-200/90 dark:border-neutral-700 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
          <span>Commercial Trade Estimating & Price Book Matching</span>
        </div>

        {/* Authoritative Headline: Clean & Scannable */}
        <h1
          className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 max-w-3xl mx-auto leading-tight"
          style={{ textWrap: 'balance' }}
        >
          Turn complex trade briefs into{' '}
          <span className="text-blue-600 dark:text-blue-400">
            authoritative quotations
          </span>{' '}
          in seconds.
        </h1>

        {/* Punchy, Credible Copy */}
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed">
          Quotivo maps customer briefs directly to your verified trade price catalogue with <strong>zero rate hallucination</strong>, enforces human approval governance, and dispatches print-ready quotes via n8n automation.
        </p>

        {/* Executive Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
          <Link
            to="/app"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 rounded-lg text-xs font-semibold shadow-2xs transition-all active:scale-95"
          >
            <span>Launch Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/onboarding"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-lg text-xs font-medium shadow-2xs transition-colors"
          >
            <span>1-Min Onboarding</span>
          </Link>
          <button
            type="button"
            onClick={() => setIsEmailPreviewOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 text-xs font-medium hover:underline transition-colors cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-blue-600" />
            <span>Sample Email</span>
          </button>
        </div>

        {/* Single-Line Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 pt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Catalogue Grounded</span>
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Dual Sign-Off Gate</span>
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <Send className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            <span>n8n Relay</span>
          </span>
        </div>

        {/* Interactive Hero Application Window (With live trade switching!) */}
        <div className="pt-3 sm:pt-6 max-w-4xl mx-auto text-left w-full">
          {/* Quick Trade Selector on Hero Mockup */}
          <div className="flex items-center justify-between gap-2 mb-2 px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Interactive Preview Scenario:
            </span>
            <div className="flex items-center gap-1 bg-neutral-200/60 dark:bg-neutral-800/80 p-0.5 rounded-lg text-[11px]">
              <button
                type="button"
                onClick={() => setHeroTrade('hvac')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  heroTrade === 'hvac'
                    ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 font-bold shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                HVAC (PKR)
              </button>
              <button
                type="button"
                onClick={() => setHeroTrade('fitout')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  heroTrade === 'fitout'
                    ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 font-bold shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                Fit-Out (USD)
              </button>
              <button
                type="button"
                onClick={() => setHeroTrade('civil')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  heroTrade === 'civil'
                    ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 font-bold shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                Civil (USD)
              </button>
            </div>
          </div>

          <div className="rounded-xl sm:rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden w-full ring-1 ring-black/5 dark:ring-white/10">
            {/* Window chrome */}
            <div className="px-3 sm:px-4 py-2 bg-neutral-100/90 dark:bg-neutral-800/80 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="ml-1 sm:ml-2 font-mono text-[10px] sm:text-[11px] text-neutral-500 truncate max-w-[140px] sm:max-w-none">
                  quotivo.app/app/quotes/{heroTrade === 'hvac' ? 'Q-2027-042' : heroTrade === 'fitout' ? 'Q-2027-088' : 'Q-2027-104'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span>Approved</span>
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-1.5 sm:px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                  n8n Synced
                </span>
              </div>
            </div>

            {/* Mock Application View with Dynamic Scenario Data */}
            <div className="p-3.5 sm:p-5 space-y-3 sm:space-y-4 text-xs w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100 text-xs sm:text-sm">
                      {heroTrade === 'hvac' ? 'Q-2027-042' : heroTrade === 'fitout' ? 'Q-2027-088' : 'Q-2027-104'}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">Rev 1 (Final Sign-Off)</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate mt-0.5">
                    {heroTrade === 'hvac'
                      ? 'AC Installation & Refrigerant Piping · John Doe'
                      : heroTrade === 'fitout'
                      ? 'Acoustic Partitions & Commercial Ring Main · Apex Ltd'
                      : 'Loading Dock Approach Ramp Re-surfacing · Crestline'}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-neutral-500 truncate">
                    {heroTrade === 'hvac'
                      ? 'Lahore, Pakistan · john@example.com (via mawamehar21@gmail.com)'
                      : heroTrade === 'fitout'
                      ? 'London, UK · estimating@apexinnovations.co.uk'
                      : 'Austin, TX · bids@crestline.example.com'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsEmailPreviewOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[11px] font-medium transition-colors"
                  >
                    <Eye className="w-3 h-3 text-blue-600" />
                    <span>Email</span>
                  </button>
                  <Link
                    to="/app/quotes/Q-2027-001"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] transition-colors shadow-xs"
                  >
                    <span>Open Quote &rarr;</span>
                  </Link>
                </div>
              </div>

              {/* Mobile Item Card View (sm:hidden) */}
              <div className="sm:hidden space-y-2">
                {heroTrade === 'hvac' && (
                  <>
                    <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700">
                      <div className="flex justify-between items-start">
                        <div className="pr-2">
                          <p className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
                            Split AC 2-ton installation
                          </p>
                          <p className="text-[10px] text-neutral-400">2 each @ 45,000 PKR</p>
                        </div>
                        <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100 text-xs tabular-nums shrink-0">
                          90,000 PKR
                        </span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700">
                      <div className="flex justify-between items-start">
                        <div className="pr-2">
                          <p className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
                            Copper pipe (per meter)
                          </p>
                          <p className="text-[10px] text-neutral-400">10 meter @ 650 PKR</p>
                        </div>
                        <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100 text-xs tabular-nums shrink-0">
                          6,500 PKR
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center px-1 pt-1 font-bold text-xs">
                      <span className="text-neutral-500">Total (0% Tax):</span>
                      <span className="font-mono text-sm text-blue-600 dark:text-blue-400 tabular-nums">
                        96,500 PKR
                      </span>
                    </div>
                  </>
                )}

                {heroTrade === 'fitout' && (
                  <>
                    <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700">
                      <div className="flex justify-between items-start">
                        <div className="pr-2">
                          <p className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
                            Acoustic Stud Wall Partitioning
                          </p>
                          <p className="text-[10px] text-neutral-400">85 lin m @ $110.00</p>
                        </div>
                        <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100 text-xs tabular-nums shrink-0">
                          $9,350.00
                        </span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700">
                      <div className="flex justify-between items-start">
                        <div className="pr-2">
                          <p className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
                            Commercial Ring Main 32A USB Sockets
                          </p>
                          <p className="text-[10px] text-neutral-400">18 points @ $145.00</p>
                        </div>
                        <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100 text-xs tabular-nums shrink-0">
                          $2,610.00
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center px-1 pt-1 font-bold text-xs">
                      <span className="text-neutral-500">Total:</span>
                      <span className="font-mono text-sm text-blue-600 dark:text-blue-400 tabular-nums">
                        $14,960.00
                      </span>
                    </div>
                  </>
                )}

                {heroTrade === 'civil' && (
                  <>
                    <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700">
                      <div className="flex justify-between items-start">
                        <div className="pr-2">
                          <p className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
                            Mechanical Trench Excavation & Spoil
                          </p>
                          <p className="text-[10px] text-neutral-400">42 tonne @ $65.00</p>
                        </div>
                        <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100 text-xs tabular-nums shrink-0">
                          $2,730.00
                        </span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700">
                      <div className="flex justify-between items-start">
                        <div className="pr-2">
                          <p className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
                            Double-Skin Class B Engineering Brickwork
                          </p>
                          <p className="text-[10px] text-neutral-400">65 sq m @ $115.00</p>
                        </div>
                        <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100 text-xs tabular-nums shrink-0">
                          $7,475.00
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center px-1 pt-1 font-bold text-xs">
                      <span className="text-neutral-500">Total:</span>
                      <span className="font-mono text-sm text-blue-600 dark:text-blue-400 tabular-nums">
                        $14,525.00
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Desktop Matched Items Table (hidden sm:block) */}
              <div className="hidden sm:block border border-neutral-200 dark:border-neutral-700/80 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 font-medium text-[11px] border-b border-neutral-200 dark:border-neutral-700/80">
                      <th className="py-2 px-3">Description</th>
                      <th className="py-2 px-3 text-right">Qty</th>
                      <th className="py-2 px-3 text-right">Catalogue Rate</th>
                      <th className="py-2 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-[11px]">
                    {heroTrade === 'hvac' && (
                      <>
                        <tr>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-neutral-800 dark:text-neutral-200 block">
                              Split AC 2-ton installation
                            </span>
                            <span className="text-[10px] text-neutral-400">Indoor/outdoor mounting, wall brackets & pressure test</span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono">2 each</td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums">45,000 PKR</td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
                            90,000 PKR
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-neutral-800 dark:text-neutral-200 block">
                              Copper pipe (per meter)
                            </span>
                            <span className="text-[10px] text-neutral-400">Insulated twin copper refrigerant lines with flared fittings</span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono">10 meter</td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums">650 PKR</td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
                            6,500 PKR
                          </td>
                        </tr>
                      </>
                    )}

                    {heroTrade === 'fitout' && (
                      <>
                        <tr>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-neutral-800 dark:text-neutral-200 block">
                              Acoustic Stud Wall Partitioning (Double Plasterboard)
                            </span>
                            <span className="text-[10px] text-neutral-400">70mm C-studs, acoustic mineral quilt infill & sound-block boards</span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono">85 lin m</td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums">$110.00</td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
                            $9,350.00
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-neutral-800 dark:text-neutral-200 block">
                              Commercial Ring Main 32A with Twin USB Sockets
                            </span>
                            <span className="text-[10px] text-neutral-400">Armoured radial wiring, metalclad faceplates, certified testing</span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono">18 point</td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums">$145.00</td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
                            $2,610.00
                          </td>
                        </tr>
                      </>
                    )}

                    {heroTrade === 'civil' && (
                      <>
                        <tr>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-neutral-800 dark:text-neutral-200 block">
                              Mechanical Trench Excavation & Spoil Removal
                            </span>
                            <span className="text-[10px] text-neutral-400">Hydraulic tracked digger, banksman guidance, off-site disposal</span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono">42 tonne</td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums">$65.00</td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
                            $2,730.00
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-neutral-800 dark:text-neutral-200 block">
                              Double-Skin Class B Engineering Brickwork
                            </span>
                            <span className="text-[10px] text-neutral-400">Weather-struck pointing, damp-proof course & cavity wall ties</span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono">65 sq m</td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums">$115.00</td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
                            $7,475.00
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-neutral-50/70 dark:bg-neutral-800/40 border-t border-neutral-200 dark:border-neutral-700 text-xs">
                      <td colSpan={3} className="py-2 px-3 text-right font-semibold text-neutral-600 dark:text-neutral-400">
                        Grand Total:
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                        {heroTrade === 'hvac' ? '96,500 PKR' : heroTrade === 'fitout' ? '$14,960.00' : '$14,525.00'}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Quantitative Proof Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-5 sm:pt-8 text-left border-y border-neutral-200/80 dark:border-neutral-800/80 py-4 sm:py-5 max-w-4xl mx-auto w-full">
          <div>
            <p className="font-mono text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">&lt; 60s</p>
            <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5">Inbound to Draft</p>
          </div>
          <div>
            <p className="font-mono text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">100%</p>
            <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5">Catalogue Grounded</p>
          </div>
          <div>
            <p className="font-mono text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">Zero</p>
            <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5">Unapproved Dispatches</p>
          </div>
          <div>
            <p className="font-mono text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">ISO A4</p>
            <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5">PDF Direct Export</p>
          </div>
        </div>
      </section>

      {/* Interactive Live Demo Simulator Section */}
      <section id="simulator" className="py-12 sm:py-16 px-4 sm:px-6 max-w-5xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Interactive Product Demonstration
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            See Quotivo match trade requests in real-time
          </h2>
          <p className="text-xs text-neutral-500 max-w-lg mx-auto">
            Select a commercial scenario below to test how raw client text is interpreted and paired with catalogue rates.
          </p>
        </div>

        {/* Scenario Switcher Tabs */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {demoScenarios.map((sc) => (
            <button
              key={sc.id}
              onClick={() => setActiveScenarioId(sc.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeScenarioId === sc.id
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50'
              }`}
            >
              {sc.category}
            </button>
          ))}
        </div>

        {/* Live Simulator Card */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden text-xs">
          {/* Card Topbar */}
          <div className="p-4 sm:p-5 border-b border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 bg-neutral-50/50 dark:bg-neutral-800/40">
            <div className="flex items-center gap-2">
              <BrandLogo variant="icon" size="xs" />
              <div>
                <span className="font-bold text-neutral-900 dark:text-neutral-100 block">
                  {activeScenario.title}
                </span>
                <span className="text-[11px] text-neutral-500">
                  Target Customer: <strong>{activeScenario.customer}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3 h-3" />
                <span>Revision 1 Certified</span>
              </span>
              <Link
                to="/app/requests/new"
                className="px-2.5 py-1 rounded bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-[11px] font-semibold hover:opacity-90"
              >
                Draft in App &rarr;
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-neutral-100 dark:divide-neutral-800">
            {/* Left 5 cols: Inbound Request & Parsing */}
            <div className="lg:col-span-5 p-5 space-y-4 bg-neutral-50/30 dark:bg-neutral-900/30">
              <div>
                <span className="font-semibold uppercase tracking-wider text-[10px] text-neutral-400 block mb-1">
                  Step 1 · Customer Inbound Message
                </span>
                <div className="p-3 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200/80 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-mono text-[11px] leading-relaxed">
                  "{activeScenario.inboundText}"
                </div>
              </div>

              <div>
                <span className="font-semibold uppercase tracking-wider text-[10px] text-neutral-400 block mb-1">
                  Step 2 · Quotivo AI Extraction
                </span>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-2 rounded bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700 text-[11px]">
                    <span className="text-neutral-600 dark:text-neutral-400">Catalogue Items Matched:</span>
                    <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">{activeScenario.matchedItems.length} SKUs</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700 text-[11px]">
                    <span className="text-neutral-600 dark:text-neutral-400">Missing Unit Prices:</span>
                    <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">0 (All Grounded)</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700 text-[11px]">
                    <span className="text-neutral-600 dark:text-neutral-400">Approval Governance:</span>
                    <span className="font-mono font-semibold text-neutral-700 dark:text-neutral-300">Locked to Rev 1</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 7 cols: Matched Line Items & Generated Financial Schedule */}
            <div className="lg:col-span-7 p-5 space-y-4">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-neutral-400 block">
                Step 3 · Verified Quotation Schedule
              </span>

              {/* Mobile item list for small screens */}
              <div className="sm:hidden space-y-2">
                {activeScenario.matchedItems.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs block truncate">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">
                          {item.sku} · {item.qty} {item.unit} @ ${item.rate}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-xs tabular-nums text-neutral-900 dark:text-neutral-100 shrink-0">
                        ${item.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block border border-neutral-200 dark:border-neutral-700/80 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 font-medium border-b border-neutral-200 dark:border-neutral-700/80 text-[11px]">
                      <th className="py-2 px-2.5">Item & Description</th>
                      <th className="py-2 px-2.5 text-right w-16">Qty</th>
                      <th className="py-2 px-2.5 text-right w-20">Rate</th>
                      <th className="py-2 px-2.5 text-right w-24">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-mono text-[11px]">
                    {activeScenario.matchedItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-neutral-50/50">
                        <td className="py-2 px-2.5 font-sans">
                          <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">{item.name}</span>
                          <span className="text-[10px] text-neutral-400 font-mono">{item.sku}</span>
                        </td>
                        <td className="py-2 px-2.5 text-right tabular-nums text-neutral-600 dark:text-neutral-300">
                          {item.qty} {item.unit}
                        </td>
                        <td className="py-2 px-2.5 text-right tabular-nums text-neutral-600 dark:text-neutral-300">
                          ${item.rate}
                        </td>
                        <td className="py-2 px-2.5 text-right tabular-nums font-semibold text-neutral-900 dark:text-neutral-100">
                          ${item.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Strip */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg border border-neutral-200/60 dark:border-neutral-700 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between text-neutral-500">
                  <span>Net Items Subtotal:</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Standard Tax (10%):</span>
                  <span>${tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-neutral-900 dark:text-neutral-100 pt-1 border-t border-neutral-200 dark:border-neutral-700">
                  <span>Grand Total Quotation:</span>
                  <span>${grandTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-blue-600 dark:text-blue-400 pt-1 text-[11px]">
                  <span>Required Mobilization Deposit ({activeScenario.depositPercent}%):</span>
                  <span className="font-bold">${deposit.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Primary Workflow */}
      <section id="workflow" className="py-16 px-4 sm:px-6 max-w-5xl mx-auto space-y-10 border-t border-neutral-200 dark:border-neutral-800">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Deterministic Request-to-Quotation Workflow
          </h2>
          <p className="text-xs text-neutral-500 max-w-xl mx-auto">
            Engineered for businesses where accurate pricing and human sign-off are non-negotiable.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2.5 shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all">
            <span className="font-mono text-xs text-blue-600 font-bold block">01. Capture Request</span>
            <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">Unstructured Inbound</h3>
            <p className="text-neutral-500 leading-relaxed">
              Paste customer WhatsApp texts, emails, or RFP notes with optional attachments.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2.5 shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all">
            <span className="font-mono text-xs text-blue-600 font-bold block">02. Catalogue Match</span>
            <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">Trade Price Grounding</h3>
            <p className="text-neutral-500 leading-relaxed">
              AI maps requests against your catalogue SKUs without inventing synthetic prices.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2.5 shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all">
            <span className="font-mono text-xs text-blue-600 font-bold block">03. Human Approval</span>
            <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">Revision Governance</h3>
            <p className="text-neutral-500 leading-relaxed">
              Approvers review exact quantities and rates. Unapproved quotes cannot be dispatched.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2.5 shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all">
            <span className="font-mono text-xs text-blue-600 font-bold block">04. Deliver & Audit</span>
            <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">PDF & Email History</h3>
            <p className="text-neutral-500 leading-relaxed">
              Download ISO A4 vector PDFs, dispatch email delivery, and track customer decisions.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive ROI Calculator */}
      <section id="calculator" className="py-16 px-4 sm:px-6 max-w-4xl mx-auto space-y-8 border-t border-neutral-200 dark:border-neutral-800">
        <div className="text-center space-y-2">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Commercial Business Impact
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Calculate your estimating time & margin gains
          </h2>
          <p className="text-xs text-neutral-500 max-w-lg mx-auto">
            See how automating catalogue matching while retaining approval sign-off compounds monthly.
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
          {/* Sliders */}
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-semibold text-neutral-800 dark:text-neutral-200">
                  Quotations Generated Per Month
                </label>
                <span className="font-mono font-bold text-blue-600 text-sm">{monthlyQuotes} quotes</span>
              </div>
              <input
                type="range"
                min="5"
                max="150"
                step="5"
                value={monthlyQuotes}
                onChange={(e) => setMonthlyQuotes(parseInt(e.target.value, 10))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 font-mono mt-1">
                <span>5 / mo</span>
                <span>75 / mo</span>
                <span>150 / mo</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-semibold text-neutral-800 dark:text-neutral-200">
                  Average Quotation Value (USD)
                </label>
                <span className="font-mono font-bold text-blue-600 text-sm">${avgQuoteValue.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="30000"
                step="500"
                value={avgQuoteValue}
                onChange={(e) => setAvgQuoteValue(parseInt(e.target.value, 10))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 font-mono mt-1">
                <span>$1,000</span>
                <span>$15,000</span>
                <span>$30,000</span>
              </div>
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="p-5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/80 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div>
                <span className="text-[11px] text-neutral-500 uppercase tracking-wider font-semibold">
                  Estimated Estimating Hours Saved
                </span>
                <p className="font-mono text-3xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
                  ~{hoursSavedPerMonth} hrs <span className="text-xs text-neutral-400 font-normal">/ month</span>
                </p>
              </div>

              <div>
                <span className="text-[11px] text-neutral-500 uppercase tracking-wider font-semibold">
                  Pricing Margin Protected Annually
                </span>
                <p className="font-mono text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  ${marginProtectedPerYear.toLocaleString()} <span className="text-xs text-neutral-400 font-normal">/ yr</span>
                </p>
                <p className="text-[10px] text-neutral-400 mt-0.5">
                  Based on eliminating manual arithmetic slippage & unauthorized unlisted discounting.
                </p>
              </div>
            </div>

            <Link
              to="/app"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold text-center transition-colors shadow-xs"
            >
              Start Generating With Quotivo
            </Link>
          </div>
        </div>
      </section>

      {/* Target Industries */}
      <section id="use-cases" className="py-16 px-4 sm:px-6 max-w-5xl mx-auto space-y-8 border-t border-neutral-200 dark:border-neutral-800">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Engineered for Trade & Professional Services
          </h2>
          <p className="text-xs text-neutral-500 max-w-xl mx-auto">
            Configurable catalogue schemas support physical trades and digital consulting alike.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2.5">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
              Civil Works & Construction
            </h3>
            <p className="text-neutral-500 leading-relaxed">
              Quantities measured in square meters, linear meters, tonnes of rubble, plant equipment hire days, and certified trades rates.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2.5">
            <Wrench className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
              Property & Facility Maintenance
            </h3>
            <p className="text-neutral-500 leading-relaxed">
              Standardized repair callouts, scheduled maintenance sweeps, safety perimeter fencing, and seasonal asphalt patching.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2.5">
            <Laptop className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
              Agencies & Professional Services
            </h3>
            <p className="text-neutral-500 leading-relaxed">
              Consulting audits, design sprints, architecture reviews, milestone deposit terms, and customized deliverables proposals.
            </p>
          </div>
        </div>
      </section>

      {/* Commercial Transparent Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-12 border-t border-neutral-200 dark:border-neutral-800">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <span>Transparent Commercial Pricing</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Simple, predictable plans for every trade business.
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
            From independent trade contractors to multi-division engineering operations. Real n8n automation and direct Gmail quote dispatch included.
          </p>

          {/* Billing Interval Toggle */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span className={`text-xs font-medium ${billingCycle === 'monthly' ? 'text-neutral-900 dark:text-neutral-100 font-semibold' : 'text-neutral-400'}`}>
              Monthly Billing
            </span>
            <button
              type="button"
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-neutral-200 dark:bg-neutral-800 transition-colors focus:outline-hidden"
              role="switch"
              aria-checked={billingCycle === 'annual'}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-blue-600 transition-transform ${
                  billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-xs font-medium flex items-center gap-1.5 ${billingCycle === 'annual' ? 'text-neutral-900 dark:text-neutral-100 font-semibold' : 'text-neutral-400'}`}>
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {/* Plan 1: Basic */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">
                  Basic Plan
                </span>
                <p className="text-xs text-neutral-500 mt-1">
                  For solo trade operators, freelance specialists, and small workshops.
                </p>
              </div>

              <div className="pt-2 flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 font-mono">
                  ${billingCycle === 'monthly' ? '10' : '8'}
                </span>
                <span className="text-xs text-neutral-500">/ month</span>
              </div>
              {billingCycle === 'annual' && (
                <p className="text-[11px] text-emerald-600 font-medium">Billed annually ($96/year)</p>
              )}

              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-2.5 text-xs text-neutral-600 dark:text-neutral-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>50 AI Quotes</strong> / month</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>n8n automation & email dispatch</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>1 Price Catalogue (PKR, USD, EUR, GBP)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Missing rates & unmatched alerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Print & PDF quotation download</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Standard email support</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <Link
                to="/app"
                className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 transition-colors shadow-2xs"
              >
                <span>Get Started with Basic</span>
              </Link>
            </div>
          </div>

          {/* Plan 2: Pro (Featured) */}
          <div className="rounded-2xl border-2 border-blue-600 bg-white dark:bg-neutral-900 p-6 sm:p-8 flex flex-col justify-between shadow-xl relative scale-102">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
              Most Popular · High Volume
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                  Pro Plan
                </span>
                <p className="text-xs text-neutral-500 mt-1">
                  For growing trade contractors, HVAC/MEP firms, and multi-estimator teams.
                </p>
              </div>

              <div className="pt-2 flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 font-mono">
                  ${billingCycle === 'monthly' ? '29' : '24'}
                </span>
                <span className="text-xs text-neutral-500">/ month</span>
              </div>
              {billingCycle === 'annual' && (
                <p className="text-[11px] text-emerald-600 font-medium">Billed annually ($288/year)</p>
              )}

              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-2.5 text-xs text-neutral-700 dark:text-neutral-200">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0 font-bold" />
                  <span><strong>Unlimited AI Quotes</strong> & Scope Drafting</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0 font-bold" />
                  <span>Real-time n8n Webhook + Gmail Dispatch</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0 font-bold" />
                  <span>Multi-industry price catalogues & rates</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0 font-bold" />
                  <span>Human approval workflows (Owner / Staff / Approver)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0 font-bold" />
                  <span>Custom company logo on header & PDF</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0 font-bold" />
                  <span>Revision audit trail & change requests</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0 font-bold" />
                  <span>Priority webhook queue & fast delivery</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <Link
                to="/app"
                className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white transition-all shadow-md hover:shadow-blue-500/25"
              >
                <span>Start 14-Day Free Trial</span>
              </Link>
            </div>
          </div>

          {/* Plan 3: Enterprise */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">
                  Enterprise
                </span>
                <p className="text-xs text-neutral-500 mt-1">
                  For general contractors, multi-branch builders & high-value tenders.
                </p>
              </div>

              <div className="pt-2 flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 font-mono">
                  ${billingCycle === 'monthly' ? '79' : '65'}
                </span>
                <span className="text-xs text-neutral-500">/ month</span>
              </div>
              {billingCycle === 'annual' && (
                <p className="text-[11px] text-emerald-600 font-medium">Billed annually ($780/year)</p>
              )}

              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-2.5 text-xs text-neutral-600 dark:text-neutral-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Unlimited Team Seats</strong> & Roles</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Dedicated n8n cloud webhook endpoint</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Multi-branch price catalogues & custom margins</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Advanced deposit escrow & stage payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Custom API integration & full JSON exports</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>24/7 dedicated support & SLA</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <Link
                to="/app"
                className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl text-xs font-semibold bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 transition-colors shadow-2xs"
              >
                <span>Deploy Enterprise Solution</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Real Contractor Testimonials */}
      <section className="py-12 sm:py-16 px-3 sm:px-6 max-w-5xl mx-auto space-y-6 sm:space-y-8 border-t border-neutral-200 dark:border-neutral-800 w-full">
        <div className="text-center space-y-2">
          <span className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Contractor Verified
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Trusted by trade specialists & MEP engineering firms
          </h2>
          <p className="text-xs text-neutral-500 max-w-lg mx-auto">
            Real field operators using catalogue-grounded quoting with n8n automated dispatch.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-xs">
          <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xs space-y-3">
            <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold text-[11px]">
              <CheckCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Verified HVAC Partner</span>
            </div>
            <p className="text-neutral-700 dark:text-neutral-300 italic leading-relaxed">
              "Quotivo cut our quote turnaround from 4 hours to 45 seconds for 2-ton split AC jobs in Lahore. The automated email through Mawa’s n8n workflow arrives instantly with zero calculation mistakes."
            </p>
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-neutral-900 dark:text-neutral-100">Tariq Malik</p>
                <p className="text-[10px] sm:text-[11px] text-neutral-400">MEP Contractor, Lahore</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 dark:bg-blue-950 text-blue-600">
                HVAC
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xs space-y-3">
            <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold text-[11px]">
              <CheckCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Verified Civil Contractor</span>
            </div>
            <p className="text-neutral-700 dark:text-neutral-300 italic leading-relaxed">
              "The catalogue rate lock is a lifesaver. Estimators cannot accidentally invent unapproved discount rates on the fly, and our revision history gives client directors complete trust."
            </p>
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-neutral-900 dark:text-neutral-100">Marcus Thorne</p>
                <p className="text-[10px] sm:text-[11px] text-neutral-400">Thorne Civil Works, UK</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 dark:bg-blue-950 text-blue-600">
                Civil
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xs space-y-3">
            <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold text-[11px]">
              <CheckCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Verified Fit-Out Partner</span>
            </div>
            <p className="text-neutral-700 dark:text-neutral-300 italic leading-relaxed">
              "The downloadable ISO A4 PDF featuring our custom business logo looks completely enterprise-grade. We won three commercial office tenders in our first month using Quotivo."
            </p>
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-neutral-900 dark:text-neutral-100">Elena Rostova</p>
                <p className="text-[10px] sm:text-[11px] text-neutral-400">Director, Fit-Out Works</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 dark:bg-blue-950 text-blue-600">
                Fit-Out
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive FAQ Accordion */}
      <section id="faq" className="py-12 sm:py-16 px-3 sm:px-6 max-w-4xl mx-auto space-y-6 sm:space-y-8 border-t border-neutral-200 dark:border-neutral-800 w-full">
        <div className="text-center space-y-2">
          <span className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Answers & Clarifications
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            Everything you need to know about deterministic catalogue quoting, n8n webhooks, and billing.
          </p>
        </div>

        <div className="space-y-2.5 sm:space-y-3 text-xs w-full">
          {[
            {
              q: 'How does Quotivo prevent hallucinated or inaccurate pricing?',
              a: 'Quotivo grounds every extraction exclusively against your active price catalogue. If a client requests a service, spec, or pipe length not present in your catalogue, the item is surfaced under "Unmatched Items" with rate 0 and an alert badge, preventing premature quotation approval until your human estimator reviews and prices it.',
            },
            {
              q: 'How does the n8n automation workflow work?',
              a: 'Our secure Express backend communicates directly with Mawa’s cloud n8n webhook using private headers and X-API-Key authentication. When you approve revision 1 in Quotivo, n8n automatically formats and dispatches the quotation directly to the client’s email from mawamehar21@gmail.com with the sign-off "Quotivo Team".',
            },
            {
              q: 'Can we configure different currencies like PKR, USD, EUR, and GBP?',
              a: 'Yes. Quotivo supports multi-currency operations. During quotation drafting or in your organization settings, you select your currency (e.g. PKR for Lahore MEP operations or USD for North America). Catalogue rates and totals remain strictly formatted in that currency without unexpected forex conversions.',
            },
            {
              q: 'Can I brand quotes with our company logo and custom payment terms?',
              a: 'Yes! You can upload your company logo directly in Workspace Settings or Onboarding. It immediately renders on the top header of all quote documents and in vector ISO A4 print and PDF exports, alongside your custom tax number, deposit percentages, and warranty terms.',
            },
            {
              q: 'Can sales staff dispatch quotes without an approver sign-off?',
              a: 'No. Quotivo enforces strict role-based access control (RBAC). Staff can draft and adjust scope items, but the quote remains in "Draft" or "Pending Review" status until an Approver or Business Owner reviews and locks the specific revision number.',
            },
          ].map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-3.5 sm:p-4 flex items-center justify-between text-left font-semibold text-neutral-900 dark:text-neutral-100 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition-colors cursor-pointer"
                >
                  <span className="text-xs sm:text-sm pr-2">{item.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-blue-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-3.5 sm:px-4 pb-4 pt-1 text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-neutral-100 dark:border-neutral-800/60 animate-in fade-in duration-150">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Governance & Anti-Slop Principle */}
      <section id="governance" className="py-12 sm:py-16 px-3 sm:px-6 max-w-4xl mx-auto space-y-5 sm:space-y-6 border-t border-neutral-200 dark:border-neutral-800 text-center w-full">
        <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100">
          Deterministic Commercial Governance
        </h2>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          AI suggests scope copy and recommends catalogue items, but the business calculations remain strictly decimal-safe and deterministic. Revisions are immutable, role-segregated, and auditable.
        </p>
        <div className="pt-1">
          <Link
            to="/app"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs hover:shadow-blue-500/20 transition-all"
          >
            <span>Open Demo Application</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Enhanced 4-Column Commercial Footer */}
      <footer className="mt-auto border-t border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-950/60 py-10 px-4 sm:px-6 text-xs text-neutral-500 w-full">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Col 1: Brand & Status (2 cols on lg) */}
            <div className="lg:col-span-2 space-y-3">
              <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
                <BrandLogo size="xs" showTagline={true} tagline="Commercial Quoting SaaS" />
              </Link>
              <p className="text-xs text-neutral-500 max-w-sm leading-relaxed">
                Deterministic quoting engine engineered for trade contractors, HVAC specialists, and engineering builders. Grounded in your own registered catalogue rates.
              </p>
              {/* Live Service Indicator */}
              <div className="pt-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>n8n Cloud Engine Live · Relay Operational</span>
                </div>
              </div>
            </div>

            {/* Col 2: Solutions */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 block">
                Trade Profiles
              </span>
              <ul className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                <li><Link to="/app/settings/business" className="hover:text-blue-600 transition-colors">HVAC & Climate Control</Link></li>
                <li><Link to="/app/settings/business" className="hover:text-blue-600 transition-colors">Civil Works & Masonry</Link></li>
                <li><Link to="/app/settings/business" className="hover:text-blue-600 transition-colors">Electrical Contracting</Link></li>
                <li><Link to="/app/settings/business" className="hover:text-blue-600 transition-colors">Commercial Fit-Out</Link></li>
                <li><Link to="/app/settings/business" className="hover:text-blue-600 transition-colors">Plumbing & Piping</Link></li>
              </ul>
            </div>

            {/* Col 3: Platform */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 block">
                Platform
              </span>
              <ul className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                <li><a href="#simulator" className="hover:text-blue-600 transition-colors">Live Demo Simulator</a></li>
                <li><Link to="/pricing" className="hover:text-blue-600 transition-colors">Commercial Pricing ($10 / $29 / $79)</Link></li>
                <li><Link to="/onboarding" className="hover:text-blue-600 transition-colors">1-Minute Onboarding</Link></li>
                <li><Link to="/app/requests/new" className="hover:text-blue-600 transition-colors">Generate Draft Quote</Link></li>
                <li><button type="button" onClick={() => setIsEmailPreviewOpen(true)} className="hover:text-blue-600 transition-colors text-left">Gmail Dispatch Preview</button></li>
              </ul>
            </div>

            {/* Col 4: Governance & Security */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 block">
                Governance
              </span>
              <ul className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                <li><span className="text-neutral-500">Strict Catalogue Grounding</span></li>
                <li><span className="text-neutral-500">Dual Human Approvals</span></li>
                <li><span className="text-neutral-500">Immutable Revisions</span></li>
                <li><span className="text-neutral-500">Zero Synthetic Rates</span></li>
                <li><span className="text-neutral-500">Backend X-API-Key Auth</span></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar: Clean, Executive & Single-Line Compact */}
          <div className="pt-4 border-t border-neutral-200/80 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2 text-neutral-500 dark:text-neutral-400">
              <span>© 2027 Quotivo Platform</span>
              <span>·</span>
              <span className="text-neutral-600 dark:text-neutral-300 font-medium">
                Made with <span className="text-rose-500">❤️</span> by Bright
              </span>
            </div>

            <div className="flex items-center gap-3 text-neutral-500">
              <span className="font-mono text-[10px] bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded border border-neutral-200/60 dark:border-neutral-700">
                PKR · USD · EUR · GBP
              </span>
              <Link to="/app" className="hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors">
                Workspace
              </Link>
              <Link to="/login" className="hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Interactive Email Preview Modal (Exact replica of Mawa n8n Gmail execution) */}
      {isEmailPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-xs">
            <div className="px-4 py-3 bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-neutral-900 dark:text-neutral-100">
                  Client Inbox Preview · Gmail
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsEmailPreviewOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="pb-3 border-b border-neutral-100 dark:border-neutral-800 flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                    Your Quotation
                  </h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    From: <strong>Mawa</strong> &lt;mawamehar21@gmail.com&gt;
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    To: &lt;john@example.com&gt;
                  </p>
                </div>
                <span className="text-[10px] font-mono text-neutral-400">16:26 (Just now)</span>
              </div>

              {/* Exact Email Body from Mawa's n8n workflow */}
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200/80 dark:border-neutral-700 font-mono text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-line">
{`Hi John Doe,

Thank you for your request. Here is your quotation:

- Split AC 2-ton installation: 2 x 45000 = 90000
- Copper pipe (per meter): 10 x 650 = 6500

Subtotal: 96500 PKR
Tax: 0 PKR
Total: 96500 PKR

Thank you for choosing us.

Best regards,
Quotivo Team`}
              </div>

              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Dispatched via live n8n webhook relay on approval. Delivered from mawamehar21@gmail.com.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEmailPreviewOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 font-medium cursor-pointer"
                >
                  Close Preview
                </button>
                <Link
                  to="/app/requests/new"
                  onClick={() => setIsEmailPreviewOpen(false)}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                >
                  Generate Test Quote in App &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
