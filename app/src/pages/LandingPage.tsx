import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { 
  Search, Shield, Zap, TrendingUp, AlertTriangle, 
  CheckCircle, BarChart3, Link2, 
  ChevronDown, Twitter, 
  Linkedin, Github, Menu, X
} from 'lucide-react';
import type { SEOAuditResult } from '@/types';
import { performSEOAudit } from '@/utils/seoAnalyzer';
import { startStripeCheckout } from '@/utils/stripeCheckout';
import './LandingPage.css';

gsap.registerPlugin(ScrollTrigger);

// Navigation Component
const Navigation = memo(({ onStartAudit }: { onStartAudit: () => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-dark/90 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'
    }`}>
      <div className="w-full px-6 lg:px-12">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-lime rounded-lg flex items-center justify-center">
              <Search className="w-5 h-5 text-dark" />
            </div>
            <span className="font-display font-bold text-xl text-text-primary">SEO Pro</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-8">
            <button onClick={() => scrollToSection('audit')} className="nav-link">Audit</button>
            <button onClick={() => scrollToSection('features')} className="nav-link">Features</button>
            <button onClick={() => scrollToSection('pricing')} className="nav-link">Pricing</button>
            <button onClick={() => scrollToSection('faq')} className="nav-link">FAQ</button>
          </div>
          
          <div className="hidden lg:flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="nav-link">
              Dashboard
            </button>
            <button onClick={onStartAudit} className="btn-outline text-sm">
              Start Audit
            </button>
          </div>
          
          <button 
            className="lg:hidden text-text-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      
      {mobileMenuOpen && (
        <div className="lg:hidden bg-dark/95 backdrop-blur-xl border-t border-white/5">
          <div className="px-6 py-4 flex flex-col gap-4">
            <button onClick={() => scrollToSection('audit')} className="nav-link text-left">Audit</button>
            <button onClick={() => scrollToSection('features')} className="nav-link text-left">Features</button>
            <button onClick={() => scrollToSection('pricing')} className="nav-link text-left">Pricing</button>
            <button onClick={() => scrollToSection('faq')} className="nav-link text-left">FAQ</button>
            <button onClick={() => navigate('/dashboard')} className="nav-link text-left">Dashboard</button>
            <button onClick={onStartAudit} className="btn-lime w-full mt-2">Start Audit</button>
          </div>
        </div>
      )}
    </nav>
  );
});

// Hero Section
const HeroSection = memo(({ onStartAudit }: { onStartAudit: () => void }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const section = sectionRef.current;
    const headline = headlineRef.current;
    const card = cardRef.current;
    const bg = bgRef.current;
    if (!section || !headline || !card || !bg) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(bg, 
        { opacity: 0, scale: 1.06 },
        { opacity: 1, scale: 1, duration: 1, ease: 'power2.out' }
      );
      
      gsap.fromTo(headline.querySelectorAll('.animate-item'),
        { y: 60, opacity: 0, rotateX: 18 },
        { y: 0, opacity: 1, rotateX: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out', delay: 0.2 }
      );
      
      gsap.fromTo(card,
        { x: 120, opacity: 0, rotateY: -10 },
        { x: 0, opacity: 1, rotateY: 0, duration: 0.9, ease: 'power3.out', delay: 0.4 }
      );

      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=120%',
          pin: true,
          scrub: 0.6,
        }
      });

      scrollTl
        .fromTo(headline, 
          { x: 0, opacity: 1 },
          { x: '-40vw', opacity: 0, ease: 'power2.in' },
          0.7
        )
        .fromTo(card,
          { x: 0, opacity: 1 },
          { x: '40vw', opacity: 0, ease: 'power2.in' },
          0.7
        )
        .fromTo(bg,
          { scale: 1, y: 0 },
          { scale: 1.08, y: '-6vh' },
          0.7
        );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="audit" className="section-pinned z-10">
      <div ref={bgRef} className="absolute inset-0">
        <img src="/hero_city_street.jpg" alt="City night" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-overlay" />
      </div>
      
      <div className="relative z-10 w-full h-full flex items-center">
        <div className="w-full px-6 lg:px-[8vw] flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-0">
          <div ref={headlineRef} className="w-full lg:w-[46vw] perspective-1000">
            <span className="animate-item text-micro text-lime mb-4 block">SEO AUDIT TOOLKIT</span>
            <h1 className="animate-item heading-display text-text-primary mb-6">
              OPTIMIZE<br />EVERYTHING
            </h1>
            <p className="animate-item text-text-secondary text-lg max-w-md mb-8">
              A complete SEO toolkit with site audits, keyword research, backlink analysis, 
              competitor tracking, and rank monitoring. All in one powerful dashboard.
            </p>
            <div className="animate-item flex flex-wrap gap-4">
              <button onClick={() => navigate('/dashboard')} className="btn-lime flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Launch Toolkit
              </button>
              <button onClick={onStartAudit} className="btn-outline flex items-center gap-2">
                <Search className="w-4 h-4" />
                Quick Audit
              </button>
            </div>
          </div>
          
          <div ref={cardRef} className="w-full lg:w-auto perspective-1000">
            <div className="card-dark p-6 lg:p-8 w-full lg:w-[min(520px,38vw)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-lime/10 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-lime" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary">Analyze your site</h3>
              </div>
              
              <div className="space-y-4">
                <input type="url" placeholder="https://yourwebsite.com" className="input-dark w-full" readOnly />
                <button onClick={onStartAudit} className="btn-lime w-full flex items-center justify-center gap-2">
                  <Search className="w-4 h-4" />
                  Start Free Audit
                </button>
                <button onClick={() => navigate('/dashboard')} className="text-text-secondary text-sm hover:text-text-primary transition-colors w-full text-center">
                  Explore all tools
                </button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
                <div className="text-center">
                  <p className="text-2xl font-display font-bold text-lime">50+</p>
                  <p className="text-text-secondary text-xs">SEO Checks</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-display font-bold text-lime">10K+</p>
                  <p className="text-text-secondary text-xs">Users</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-display font-bold text-lime">99%</p>
                  <p className="text-text-secondary text-xs">Accuracy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

// Features Section
const FeaturesSection = memo(() => {
  const sectionRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      icon: Search,
      title: 'Site Audit',
      description: 'Comprehensive technical SEO analysis with 50+ checks for meta tags, headings, images, links, and performance.',
    },
    {
      icon: TrendingUp,
      title: 'Keyword Research',
      description: 'Discover high-value keywords with search volume, difficulty scores, and CPC data for better content strategy.',
    },
    {
      icon: Link2,
      title: 'Backlink Analysis',
      description: 'Analyze your backlink profile, track new and lost links, and monitor domain authority over time.',
    },
    {
      icon: BarChart3,
      title: 'Rank Tracking',
      description: 'Monitor your keyword rankings daily with historical data and competitor comparison.',
    },
    {
      icon: Shield,
      title: 'Competitor Analysis',
      description: 'Compare your SEO performance with competitors and identify opportunities for improvement.',
    },
    {
      icon: Zap,
      title: 'Site Health Monitor',
      description: 'Track Core Web Vitals, uptime, SSL status, and crawl errors in real-time.',
    },
  ];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo('.features-header',
        { y: 24, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6,
          scrollTrigger: { trigger: section, start: 'top 80%', end: 'top 55%', scrub: 0.5 }
        }
      );

      gsap.fromTo('.feature-card',
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, stagger: 0.1, duration: 0.6,
          scrollTrigger: { trigger: section, start: 'top 75%', end: 'top 45%', scrub: 0.5 }
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="features" className="relative z-60 bg-dark py-20 lg:py-32">
      <div className="px-6 lg:px-[8vw]">
        <div className="features-header text-center mb-12 lg:mb-16">
          <span className="text-micro text-lime mb-4 block">FEATURES</span>
          <h2 className="heading-section mb-4">Everything you need to rank higher</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            A complete suite of SEO tools designed to help you optimize your website, 
            track performance, and outrank your competitors.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="feature-card card-dark-solid p-6 lg:p-8 hover:border-lime/20 transition-colors">
                <div className="w-12 h-12 bg-lime/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-lime" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">{feature.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
});

// Pricing Section
const PricingSection = memo(() => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [checkoutPlan, setCheckoutPlan] = useState<'pro' | 'agency' | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const plans: Array<{
    id: 'starter' | 'pro' | 'agency';
    name: string;
    price: string;
    period: string;
    description: string;
    features: string[];
    cta: string;
    highlighted: boolean;
  }> = [
    {
      id: 'starter',
      name: 'Starter',
      price: 'Free',
      period: '',
      description: 'Perfect for personal projects',
      features: ['5 audits/month', 'Basic keyword research', 'Core metrics', 'Email summaries'],
      cta: 'Start free',
      highlighted: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$29',
      period: '/mo',
      description: 'For serious marketers',
      features: ['Unlimited audits', 'Full keyword research', 'Backlink analysis', 'Competitor tracking', 'Rank monitoring', 'Export reports'],
      cta: 'Start Pro trial',
      highlighted: true,
    },
    {
      id: 'agency',
      name: 'Agency',
      price: '$99',
      period: '/mo',
      description: 'For teams and agencies',
      features: ['Everything in Pro', 'White-label reports', 'Client dashboards', 'API access', 'Priority support', 'Custom integrations'],
      cta: 'Contact sales',
      highlighted: false,
    },
  ];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo('.pricing-header',
        { y: 24, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6,
          scrollTrigger: { trigger: section, start: 'top 80%', end: 'top 55%', scrub: 0.5 }
        }
      );

      gsap.fromTo('.pricing-card-item',
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, stagger: 0.1, duration: 0.6,
          scrollTrigger: { trigger: section, start: 'top 75%', end: 'top 45%', scrub: 0.5 }
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const handlePlanClick = async (planId: 'starter' | 'pro' | 'agency') => {
    if (planId === 'starter') {
      navigate('/dashboard');
      return;
    }

    setCheckoutError(null);
    setCheckoutPlan(planId);
    try {
      await startStripeCheckout(planId);
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Unable to open checkout.');
      setCheckoutPlan(null);
    }
  };

  return (
    <section ref={sectionRef} id="pricing" className="relative z-60 bg-dark py-20 lg:py-32">
      <div className="px-6 lg:px-[8vw]">
        <div className="pricing-header text-center mb-12 lg:mb-16">
          <span className="text-micro text-lime mb-4 block">PRICING</span>
          <h2 className="heading-section mb-4">Simple pricing</h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Start free. Upgrade when you're ready to scale.
          </p>
          {checkoutError && (
            <p className="text-red-400 text-sm mt-4">{checkoutError}</p>
          )}
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`pricing-card-item pricing-card ${plan.highlighted ? 'pricing-card-highlight' : ''}`}
            >
              <div>
                <h3 className="text-text-primary font-semibold text-lg">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-display font-bold text-text-primary">{plan.price}</span>
                  <span className="text-text-secondary">{plan.period}</span>
                </div>
                <p className="text-text-secondary text-sm mt-2">{plan.description}</p>
              </div>
              
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-text-secondary text-sm">
                    <CheckCircle className="w-4 h-4 text-lime flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button 
                onClick={() => void handlePlanClick(plan.id)}
                disabled={checkoutPlan === plan.id}
                className={plan.highlighted ? 'btn-lime w-full' : 'btn-outline w-full'}
              >
                {checkoutPlan === plan.id ? 'Redirecting...' : plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

// FAQ Section
const FAQSection = memo(() => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'How does the site audit work?',
      answer: 'Enter your URL and our tool will crawl your website, analyzing 50+ SEO factors including meta tags, headings, images, links, performance, and security. You\'ll get a detailed report with actionable recommendations.',
    },
    {
      question: 'Is there a free plan?',
      answer: 'Yes! Our Starter plan is completely free and includes 5 site audits per month, basic keyword research, and core SEO metrics. It\'s perfect for personal projects and small websites.',
    },
    {
      question: 'Can I track my competitors?',
      answer: 'Absolutely. Our Competitor Analysis tool lets you compare your SEO performance with up to 5 competitors. Track their keywords, backlinks, and traffic to identify opportunities.',
    },
    {
      question: 'How often is rank tracking updated?',
      answer: 'Rank tracking is updated daily for Pro and Agency plans. You can monitor unlimited keywords and view historical data to track your progress over time.',
    },
    {
      question: 'Can I export reports?',
      answer: 'Yes, Pro and Agency plans include PDF and CSV export options. Agency plans also offer white-label reports that you can customize with your branding.',
    },
    {
      question: 'Do you offer API access?',
      answer: 'API access is available on our Agency plan. Integrate our SEO data into your own applications, dashboards, or reporting tools.',
    },
  ];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo('.faq-header',
        { y: 24, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6,
          scrollTrigger: { trigger: section, start: 'top 80%', end: 'top 55%', scrub: 0.5 }
        }
      );

      gsap.fromTo('.faq-item-element',
        { y: 24, opacity: 0 },
        {
          y: 0, opacity: 1, stagger: 0.08, duration: 0.5,
          scrollTrigger: { trigger: section, start: 'top 75%', end: 'top 45%', scrub: 0.5 }
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="faq" className="relative z-60 bg-dark py-20 lg:py-32">
      <div className="px-6 lg:px-[8vw]">
        <div className="faq-header text-center mb-12 lg:mb-16">
          <span className="text-micro text-lime mb-4 block">FAQ</span>
          <h2 className="heading-section mb-4">Questions & answers</h2>
        </div>
        
        <div className="max-w-2xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item-element faq-item">
              <button
                className="w-full flex items-center justify-between p-5 text-left"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="text-text-primary font-medium pr-4">{faq.question}</span>
                <ChevronDown 
                  className={`w-5 h-5 text-text-secondary flex-shrink-0 transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`} 
                />
              </button>
              {openIndex === index && (
                <div className="px-5 pb-5">
                  <p className="text-text-secondary leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

// Footer
const Footer = memo(() => {
  const navigate = useNavigate();

  return (
    <footer className="relative z-60 bg-dark border-t border-white/[0.08]">
      <div className="px-6 lg:px-[8vw] py-12 lg:py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-lime rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-dark" />
              </div>
              <span className="font-display font-bold text-xl text-text-primary">SEO Pro</span>
            </div>
            <p className="text-text-secondary text-sm mb-4">
              A complete SEO toolkit to help you optimize, track, and rank higher.
            </p>
            <button onClick={() => navigate('/dashboard')} className="btn-lime text-sm">
              Launch Toolkit
            </button>
          </div>
          
          <div>
            <h4 className="text-text-primary font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/tools/audit" className="text-text-secondary hover:text-text-primary transition-colors text-sm">Site Audit</Link></li>
              <li><Link to="/tools/keywords" className="text-text-secondary hover:text-text-primary transition-colors text-sm">Keyword Research</Link></li>
              <li><Link to="/tools/backlinks" className="text-text-secondary hover:text-text-primary transition-colors text-sm">Backlink Analysis</Link></li>
              <li><Link to="/tools/competitors" className="text-text-secondary hover:text-text-primary transition-colors text-sm">Competitor Analysis</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-text-primary font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-text-secondary hover:text-text-primary transition-colors text-sm">Documentation</a></li>
              <li><a href="#" className="text-text-secondary hover:text-text-primary transition-colors text-sm">API Reference</a></li>
              <li><a href="#" className="text-text-secondary hover:text-text-primary transition-colors text-sm">Blog</a></li>
              <li><a href="#" className="text-text-secondary hover:text-text-primary transition-colors text-sm">Changelog</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-text-primary font-semibold mb-4">Connect</h4>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-white/10 transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-white/10 transition-all">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-white/10 transition-all">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/[0.08] mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-text-secondary text-sm">© 2026 SEO Pro. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-text-secondary hover:text-text-primary transition-colors text-sm">Privacy</a>
            <a href="#" className="text-text-secondary hover:text-text-primary transition-colors text-sm">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
});

// Audit Modal
const AuditModal = memo(({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [url, setUrl] = useState('');
  const [step, setStep] = useState<'input' | 'loading' | 'result'>('input');
  const [result, setResult] = useState<SEOAuditResult | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setStep('loading');
    
    // Simulate audit
    const auditResult = await performSEOAudit(url);
    
    setResult(auditResult);
    setStep('result');
  };

  const handleClose = () => {
    setStep('input');
    setUrl('');
    setResult(null);
    onClose();
  };

  const handleViewFullReport = () => {
    handleClose();
    navigate('/tools/audit');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-dark/90 backdrop-blur-xl" onClick={handleClose} />
      
      <div className="relative card-dark-solid w-full max-w-lg p-6 lg:p-8 max-h-[90vh] overflow-auto">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        
        {step === 'input' && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-lime/10 rounded-xl flex items-center justify-center">
                <Search className="w-5 h-5 text-lime" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-text-primary">Analyze your site</h3>
                <p className="text-text-secondary text-sm">Get a complete SEO audit in seconds</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-text-secondary text-sm mb-2 block">Website URL</label>
                <input 
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="input-dark w-full"
                  required
                />
              </div>
              <button type="submit" className="btn-lime w-full flex items-center justify-center gap-2">
                <Search className="w-4 h-4" />
                Start Audit
              </button>
            </form>
          </div>
        )}
        
        {step === 'loading' && (
          <div className="py-12 text-center">
            <div className="w-16 h-16 border-4 border-lime/20 border-t-lime rounded-full animate-spin mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">Analyzing your site...</h3>
            <p className="text-text-secondary">Checking meta tags, headings, images, and more</p>
            <div className="mt-6 space-y-2">
              {['Crawling pages...', 'Analyzing meta tags...', 'Checking headings...', 'Evaluating performance...'].map((step, i) => (
                <p key={i} className="text-text-secondary text-sm animate-pulse" style={{ animationDelay: `${i * 200}ms` }}>
                  {step}
                </p>
              ))}
            </div>
          </div>
        )}
        
        {step === 'result' && result && (
          <div>
            <div className="text-center mb-6">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-full h-full score-ring" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" className="score-ring-circle" />
                  <circle 
                    cx="50" cy="50" r="45" 
                    className="score-ring-progress"
                    style={{ 
                      strokeDasharray: 2 * Math.PI * 45,
                      strokeDashoffset: 2 * Math.PI * 45 * (1 - result.score / 100)
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-display font-black text-lime">{result.score}</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-text-primary">Your SEO Score</h3>
              <p className="text-text-secondary capitalize">{result.status}</p>
            </div>
            
            <div className="space-y-3 mb-6">
              <p className="text-text-secondary text-sm">Top issues found:</p>
              {result.issues.slice(0, 3).map((issue) => (
                <div key={issue.id} className="flex items-center gap-2 p-3 rounded-lg bg-white/[0.03]">
                  <AlertTriangle className={`w-4 h-4 ${issue.severity === 'high' ? 'text-red-400' : 'text-yellow-400'}`} />
                  <span className="text-text-primary text-sm">{issue.title}</span>
                </div>
              ))}
            </div>
            
            <div className="flex gap-3">
              <button onClick={handleViewFullReport} className="btn-lime flex-1">
                View Full Report
              </button>
              <button onClick={handleClose} className="btn-outline px-4">
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

// Main Landing Page Component
export default function LandingPage() {
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const handleOpenAudit = useCallback(() => setAuditModalOpen(true), []);
  const handleCloseAudit = useCallback(() => setAuditModalOpen(false), []);

  // Global snap for pinned sections
  useEffect(() => {
    const setupSnap = () => {
      const pinned = ScrollTrigger.getAll()
        .filter(st => st.vars.pin)
        .sort((a, b) => a.start - b.start);
      
      const maxScroll = ScrollTrigger.maxScroll(window);
      if (!maxScroll || pinned.length === 0) return;

      const pinnedRanges = pinned.map(st => ({
        start: st.start / maxScroll,
        end: (st.end ?? st.start) / maxScroll,
        center: (st.start + ((st.end ?? st.start) - st.start) * 0.5) / maxScroll,
      }));

      ScrollTrigger.create({
        snap: {
          snapTo: (value: number) => {
            const inPinned = pinnedRanges.some(r => value >= r.start - 0.02 && value <= r.end + 0.02);
            if (!inPinned) return value;
            
            const target = pinnedRanges.reduce((closest, r) =>
              Math.abs(r.center - value) < Math.abs(closest - value) ? r.center : closest,
              pinnedRanges[0]?.center ?? 0
            );
            return target;
          },
          duration: { min: 0.15, max: 0.35 },
          delay: 0,
          ease: 'power2.out',
        }
      });
    };

    const timer = setTimeout(setupSnap, 500);
    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <div className="relative">
      <div className="noise-overlay" />
      
      <Navigation onStartAudit={handleOpenAudit} />
      
      <main className="relative">
        <HeroSection onStartAudit={handleOpenAudit} />
        <FeaturesSection />
        <PricingSection />
        <FAQSection />
        <Footer />
      </main>
      
      <AuditModal isOpen={auditModalOpen} onClose={handleCloseAudit} />
    </div>
  );
}
