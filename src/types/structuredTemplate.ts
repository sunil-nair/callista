export interface BrandSettings {
  logoUrl: string;
  businessName: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface HeroSection {
  imageUrl: string;
  headline: string;
  subheadline?: string;
}

export interface TextSection {
  id: string;
  content: string;
  alignment?: 'left' | 'center' | 'right';
}

export interface CTASection {
  buttonText: string;
  buttonUrl: string;
  buttonColor?: string;
  description?: string;
}

export interface StructuredTemplate {
  id?: string;
  name: string;
  apiShortcode?: string;
  brand: BrandSettings;
  hero: HeroSection;
  textSections: TextSection[];
  cta: CTASection;
}
