export type SubscriptionPlan = 'pro' | 'agency';

const planCheckoutLinkMap: Record<SubscriptionPlan, string | undefined> = {
  pro: import.meta.env.VITE_STRIPE_PAYMENT_LINK_PRO,
  agency: import.meta.env.VITE_STRIPE_PAYMENT_LINK_AGENCY,
};

export async function startStripeCheckout(plan: SubscriptionPlan): Promise<void> {
  const paymentLink = planCheckoutLinkMap[plan];
  if (!paymentLink) {
    throw new Error(`Missing Stripe Payment Link for ${plan} plan.`);
  }

  try {
    new URL(paymentLink);
  } catch {
    throw new Error(`Invalid Stripe Payment Link for ${plan} plan.`);
  }

  window.location.assign(paymentLink);
}
