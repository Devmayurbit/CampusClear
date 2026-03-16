export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-10">

        {/* COLLEGE INFO */}
        <div>
          <h2 className="text-xl font-bold text-white mb-3">
            🎓 Chameli Devi Group of Institutions
          </h2>
          <p className="text-sm leading-relaxed">
            CDGI No-Dues Management System is a digital platform designed to
            simplify student clearance, reduce paperwork, and improve
            transparency across academic departments.
          </p>

          <p className="mt-4 text-sm">
            📍 Indore, Madhya Pradesh, India  
            <br />
            🌐 www.cdgi.edu.in  
            <br />
            📧 admissions@cdgi.edu.in
          </p>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>✔ Student Dashboard</li>
            <li>✔ Profile Management</li>
            <li>✔ Department Clearances</li>
            <li>✔ Online Status Tracking</li>
            <li>✔ Secure Login System</li>
          </ul>
        </div>

        {/* PROJECT INFO */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">
            Project Information
          </h3>

          <p className="text-sm">
            🛠 Built using MERN Stack (React, Node.js, MongoDB Atlas)  
            <br />
            🔐 Secure Authentication with JWT  
            <br />
            ☁ Cloud Database Powered by MongoDB Atlas  
          </p>

          <p className="mt-4 font-semibold text-green-400">
            👨‍💻 Made by B-8 Group of CS 4th Year
          </p>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-gray-700 text-center py-4 text-sm text-gray-400">
        © {new Date().getFullYear()} Chameli Devi Group of Institutions. All rights reserved.
      </div>
    </footer>
  );
}
