import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export default function Home() {
  const { isAuthenticated, student } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="w-full overflow-hidden">

      {/* HERO */}
      <section
        className="relative min-h-[90vh] bg-cover bg-center flex items-center"
        style={{
          backgroundImage: "url('/images/campuss.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />

        <div className="relative z-10 max-w-7xl mx-auto px-8 py-20 text-white">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight animate-fade-in">
            No-Dues Management System
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-gray-200 animate-slide-up">
            A modern digital platform to simplify student clearance, verification
            and approvals across all departments in seconds.
          </p>

          {!isAuthenticated ? (
            <div className="mt-10 flex flex-wrap gap-4">
              <button
                onClick={() => setLocation("/login")}
                className="px-8 py-3 rounded-xl bg-green-500 hover:bg-green-600 transition shadow-lg"
              >
                Get Started →
              </button>

              <button
                onClick={() => setLocation("/register")}
                className="px-8 py-3 rounded-xl border border-white hover:bg-white hover:text-black transition"
              >
                Create Account
              </button>
            </div>
          ) : (
            <div className="mt-10 space-y-4">
              <h2 className="text-xl font-semibold">
                Welcome back, {student?.fullName} 👋
              </h2>

              <button
                onClick={() => setLocation("/dashboard")}
                className="px-10 py-4 rounded-xl bg-primary-600 hover:bg-primary-700 transition shadow-lg"
              >
                Go To Dashboard →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-white px-6 md:px-12 py-24">
        <h2 className="text-4xl font-bold text-center mb-16">
          Why Choose CDGI No-Dues?
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
          <Feature title="⚡ Instant Apply" desc="No paperwork and zero queues. Submit digitally." />
          <Feature title="🔐 Secure Access" desc="JWT authentication with encrypted sessions." />
          <Feature title="📊 Live Tracking" desc="Track every department approval in real time." />
          <Feature title="📁 Profile Control" desc="Manage documents and personal details easily." />
          <Feature title="☁ Cloud Powered" desc="MongoDB Atlas ensures speed and scalability." />
          <Feature title="🎯 Smart Workflow" desc="Automated approvals and notifications." />
        </div>
      </section>
    </div>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="p-8 rounded-2xl border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white">
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-600">{desc}</p>
    </div>
  );
}
