import { Link } from "wouter";

export default function Home() {
  return (
    <div className="w-full">

      {/* HERO SECTION WITH FULL BACKGROUND IMAGE */}
      <section
        className="relative min-h-screen bg-cover bg-center flex flex-col"
        style={{
          backgroundImage: "url('/images/campuss.jpg')",
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* NAVBAR */}
        <nav className="relative z-10 flex justify-between items-center px-10 py-6 text-white">
          <div className="text-2xl font-bold flex items-center gap-2">
            🎓 CDGI No-Dues Portal
          </div>

          <div className="flex gap-6 items-center">
            <Link href="/login" className="hover:underline">
              Login
            </Link>

            <Link
              href="/register"
              className="bg-white text-black px-5 py-2 rounded-md font-semibold hover:bg-gray-200 transition"
            >
              Sign Up
            </Link>
          </div>
        </nav>

        {/* HERO CONTENT */}
        <div className="relative z-10 flex-1 flex items-center px-10">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
              No-Dues Management System
            </h1>

            <p className="mt-6 text-lg text-gray-200">
              A smart digital platform to simplify student clearance and
              verification across all departments in seconds.
            </p>

            <div className="mt-10 flex gap-4">
              <Link
                href="/login"
                className="bg-green-500 hover:bg-green-600 px-8 py-3 rounded-lg font-semibold transition"
              >
                Get Started →
              </Link>

              <Link
                href="/register"
                className="border border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-black transition"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="bg-white px-12 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">
          Why Use No-Dues Portal?
        </h2>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          <Feature title="⚡ Apply No-due" desc="No paperwork and no long queues. Track everything digitally." />
          <Feature title="🔒 Secure Login" desc="JWT based authentication with encrypted credentials." />
          <Feature title="📊 Live Status" desc="Real-time clearance updates from all departments." />
          <Feature title="💳 Payment Tracking" desc="View pending dues and payment history easily." />
          <Feature title="📁 Profile Management" desc="Update personal details and upload documents." />
          <Feature title="☁ Cloud Powered" desc="MongoDB Atlas ensures scalability and reliability." />
        </div>
      </section>
    </div>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="p-8 rounded-xl border shadow hover:shadow-lg transition">
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-600">{desc}</p>
    </div>
  );
}
