import { HeroSection } from '@/components/home/hero-section';
import { TrustedCompanies } from '@/components/home/trusted-companies';
import { HowItWorks } from '@/components/home/how-it-works';
import { FeaturedDevs } from '@/components/home/featured-devs';
import { CTASection } from '@/components/home/cta-section';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export default function LandingPage() {


  return (
    <>
      <SiteHeader />
      <HeroSection />
      <TrustedCompanies />
      <HowItWorks />
      <FeaturedDevs />
      <CTASection />
      <SiteFooter />
    </>
  );
}
