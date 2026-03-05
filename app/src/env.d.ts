/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STRIPE_PAYMENT_LINK_PRO?: string;
  readonly VITE_STRIPE_PAYMENT_LINK_AGENCY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
