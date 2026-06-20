import PageHero from '../../components/shared/PageHero';

export default function About() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <PageHero 
          title="About KhedutSaathi" 
          subtitle="Empowering farmers with AI-driven insights for a sustainable and profitable agricultural future."
        />
        <div className="py-12 text-center">
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            We are dedicated to providing cutting-edge technology directly to the hands of farmers, bridging the gap between traditional practices and modern agricultural science.
          </p>
        </div>
      </div>
    </div>
  );
}
