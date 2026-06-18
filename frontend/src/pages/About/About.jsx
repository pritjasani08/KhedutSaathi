import PageHero from '../../components/shared/PageHero';

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <PageHero 
        title="About KhedutSaathi" 
        subtitle="Empowering farmers with AI-driven insights for a sustainable and profitable agricultural future."
      />
      <div className="container-custom py-12 px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          We are dedicated to providing cutting-edge technology directly to the hands of farmers, bridging the gap between traditional practices and modern agricultural science.
        </p>
      </div>
    </div>
  );
}
