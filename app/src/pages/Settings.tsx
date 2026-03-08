import { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '@/components/shared/Layout';
import type { AccountPlan } from '@/contexts/app-context';
import { AuthContext, ThemeContext } from '@/contexts/app-context';
import { startStripeCheckout } from '@/utils/stripeCheckout';

type AccountState = {
  name: string;
  email: string;
  apiKey: string;
  gscConnected: boolean;
  gaConnected: boolean;
  plan: string;
  exportFormat: 'csv' | 'pdf';
  locale: string;
  language: string;
};

function formatPlanLabel(plan: AccountPlan) {
  if (plan === 'agency') return 'Agency';
  if (plan === 'pro') return 'Pro';
  return 'Free';
}

export default function Settings() {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { user, userEmail, setUserPlan } = useContext(AuthContext);
  const location = useLocation();
  const [account, setAccount] = useState<AccountState>({
    name: '',
    email: userEmail ?? '',
    apiKey: '',
    gscConnected: false,
    gaConnected: false,
    plan: formatPlanLabel(user?.plan ?? 'free'),
    exportFormat: 'csv',
    locale: 'United States',
    language: 'English',
  });
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [billingMessage, setBillingMessage] = useState<string | null>(null);
  const [checkoutPlan, setCheckoutPlan] = useState<'pro' | 'agency' | null>(null);

  const checkoutStatus = new URLSearchParams(location.search).get('checkout');
  const checkoutPlanFromUrl = new URLSearchParams(location.search).get('plan');

  useEffect(() => {
    setAccount((prev) => ({
      ...prev,
      email: userEmail ?? prev.email,
      plan: formatPlanLabel(user?.plan ?? 'free'),
    }));
  }, [user?.plan, userEmail]);

  useEffect(() => {
    if (checkoutStatus !== 'success') return;
    if (checkoutPlanFromUrl !== 'pro' && checkoutPlanFromUrl !== 'agency') return;

    setUserPlan(checkoutPlanFromUrl);
    setBillingMessage(`Your ${formatPlanLabel(checkoutPlanFromUrl)} plan is now active on this device.`);
  }, [checkoutPlanFromUrl, checkoutStatus, setUserPlan]);

  const handleChange = (field: keyof AccountState, value: AccountState[keyof AccountState]) => {
    setAccount((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    setSavedMessage('Settings saved (local only for now).');
    window.setTimeout(() => setSavedMessage(null), 1800);
  };

  const handleSubscribe = async (plan: 'pro' | 'agency') => {
    setBillingMessage(null);
    setCheckoutPlan(plan);
    try {
      await startStripeCheckout(plan);
    } catch (error) {
      setBillingMessage(error instanceof Error ? error.message : 'Unable to open checkout.');
      setCheckoutPlan(null);
    }
  };

  return (
    <Layout title="Settings">
      <div className="space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-dark-light border border-white/5 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-text-primary">Account</h2>
                <p className="text-text-secondary text-sm">Profile and authentication basics.</p>
              </div>
              <span className="text-sm text-text-secondary">{account.plan}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-text-primary">Name</span>
                <input
                  type="text"
                  className="input-dark"
                  placeholder="Your Name"
                  value={account.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-text-primary">Email</span>
                <input
                  type="email"
                  className="input-dark"
                  placeholder="you@example.com"
                  value={account.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-text-primary">API Keys</span>
                <input
                  type="text"
                  className="input-dark"
                  placeholder="Google API / GSC key"
                  value={account.apiKey}
                  onChange={(e) => handleChange('apiKey', e.target.value)}
                />
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className={`px-4 py-2 rounded-lg border ${account.gscConnected ? 'border-lime text-lime' : 'border-white/10 text-text-secondary'}`}
                  onClick={() => handleChange('gscConnected', !account.gscConnected)}
                >
                  {account.gscConnected ? 'GSC Connected' : 'Connect GSC'}
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded-lg border ${account.gaConnected ? 'border-lime text-lime' : 'border-white/10 text-text-secondary'}`}
                  onClick={() => handleChange('gaConnected', !account.gaConnected)}
                >
                  {account.gaConnected ? 'GA Connected' : 'Connect GA'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-dark-light border border-white/5 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-text-primary">Preferences</h2>
                <p className="text-text-secondary text-sm">Defaults for exports and targeting.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-text-primary">Default keyword location</span>
                <input
                  type="text"
                  className="input-dark"
                  placeholder="e.g., United States"
                  value={account.locale}
                  onChange={(e) => handleChange('locale', e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-text-primary">Language</span>
                <input
                  type="text"
                  className="input-dark"
                  placeholder="English"
                  value={account.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-text-primary">Export format</span>
                <select
                  className="input-dark"
                  value={account.exportFormat}
                  onChange={(e) => handleChange('exportFormat', e.target.value as AccountState['exportFormat'])}
                >
                  <option value="csv">CSV</option>
                  <option value="pdf">PDF</option>
                </select>
              </label>
              <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <div>
                  <p className="text-text-primary font-medium">Dark Mode</p>
                  <p className="text-text-secondary text-sm">Toggle the app theme</p>
                </div>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-lime w-5 h-5"
                    checked={isDarkMode}
                    onChange={toggleTheme}
                  />
                  <span className="text-text-primary">{isDarkMode ? 'On' : 'Off'}</span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-dark-light border border-white/5 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-text-primary">Subscription & Billing</h2>
                <p className="text-text-secondary text-sm">Upgrade to unlock higher limits.</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void handleSubscribe('pro')}
                  disabled={checkoutPlan !== null}
                  className="btn-lime"
                >
                  {checkoutPlan === 'pro' ? 'Redirecting...' : 'Get Pro Subscription'}
                </button>
                <button
                  type="button"
                  onClick={() => void handleSubscribe('agency')}
                  disabled={checkoutPlan !== null}
                  className="btn-outline"
                >
                  {checkoutPlan === 'agency' ? 'Redirecting...' : 'Get Agency Subscription'}
                </button>
              </div>
            </div>
            <p className="text-text-secondary text-sm">Current: {account.plan}</p>
            {checkoutStatus === 'success' && (
              <p className="text-lime text-sm">
                Stripe checkout completed for {checkoutPlanFromUrl ?? 'your selected'} plan.
              </p>
            )}
            {checkoutStatus === 'canceled' && (
              <p className="text-yellow-400 text-sm">Stripe checkout was canceled.</p>
            )}
            {billingMessage && <p className="text-red-400 text-sm">{billingMessage}</p>}
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" className="btn-lime">Save Settings</button>
            {savedMessage && <span className="text-sm text-lime">{savedMessage}</span>}
          </div>
        </form>
      </div>
    </Layout>
  );
}
