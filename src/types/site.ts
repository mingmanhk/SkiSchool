export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}

export interface BrandingConfig {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundMode?: 'light' | 'dark';
  headingFont?: string;
  bodyFont?: string;
}

export interface LogoConfig {
  headerLogoUrl?: string;
  footerLogoUrl?: string;
  faviconUrl?: string;
  appIconUrl?: string;
}

export interface HeroConfig {
  imageUrl?: string;
  title?: string;
  subtitle?: string;
  description?: string;
}

export interface SiteConfig {
  tenantId: string;
  navigation: NavItem[];
  branding: BrandingConfig;
  logos: LogoConfig;
  layout: Record<string, unknown>;
  hero: HeroConfig;
  sections: any[]; // can be refined
  aboutSections: any[];
  teamSections: any[];
  customPages: any[];
  updatedAt: string;
}
