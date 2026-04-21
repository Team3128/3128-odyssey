export default function OutreachPage() {
  return (
    <div className="min-h-screen bg-[#000d1a] text-white">

      {/* ───────────────── HERO ───────────────── */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        
        {/* Hero Image Placeholder */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-[#000d1a]">
          <img src="/public/images/team.png"></img>
        </div>

        <div className="relative z-10 text-center px-6">
          <h1 className="text-5xl md:text-6xl font-bold tracking-wide">
            Outreach
          </h1>
          <p className="mt-4 text-gray-300 max-w-2xl mx-auto">
            Community engagement, STEM education, and impact-driven programs
            that bring robotics to students of all ages.
          </p>
        </div>
      </section>

      {/* ───────────────── CONTENT ───────────────── */}
      <div className="max-w-6xl mx-auto px-6 md:px-16 py-20 space-y-24">

        {/* SUMMER CAMP */}
        <section className="grid md:grid-cols-2 gap-10 items-center">
          
          <div>
            <h2 className="text-3xl font-bold mb-4">Summer Camp</h2>
            <p className="text-gray-300 leading-relaxed">
              Our Summer Camp consists of three week-long programs that
              introduce elementary and middle school students to STEM and robotics.
              Students design, build, and program robots using starter kits
              with guidance from team mentors.
            </p>

            <ul className="mt-4 text-gray-300 space-y-2 list-disc ml-5">
              <li>Programs: Insight (1–4), Curiosity (5–6), Opportunity (7–9)</li>
              <li>1:4 counselor-to-student ratio</li>
              <li>FLL, VEX IQ, and FTC-based learning progression</li>
              <li>Fully student-led instruction model</li>
            </ul>
          </div>

          {/* Image Placeholder */}
          <div className="aspect-video rounded-2xl border border-blue-900/50 bg-blue-950/20 flex items-center justify-center text-gray-500 text-xs tracking-[0.3em] uppercase">
            Summer Camp Image
          </div>

        </section>

        {/* BY THE NUMBERS */}
        <section className="grid md:grid-cols-2 gap-10 items-center">

          {/* Image Placeholder */}
          <div className="aspect-video rounded-2xl border border-blue-900/50 bg-blue-950/20 flex items-center justify-center text-gray-500 text-xs tracking-[0.3em] uppercase">
            Stats / Camp Photos
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-4">By the Numbers</h2>
            <div className="text-gray-300 space-y-2">
              <p>• 3 weeks per year</p>
              <p>• 170 enrollments in 2025</p>
              <p>• ~500 enrollments in the last three years</p>
              <p>• 2000+ volunteer hours</p>
              <p>• $77,207 generated from summer camp</p>
            </div>
          </div>

        </section>

        {/* SCHOLARSHIPS */}
        <section className="grid md:grid-cols-2 gap-10 items-center">

          <div>
            <h2 className="text-3xl font-bold mb-4">Scholarships</h2>
            <p className="text-gray-300 leading-relaxed">
              100% of financial need is met through scholarships. Any student
              requiring financial aid receives support with no documentation required,
              ensuring equal access to STEM education.
            </p>
          </div>

          <div className="aspect-video rounded-2xl border border-blue-900/50 bg-blue-950/20 flex items-center justify-center text-gray-500 text-xs tracking-[0.3em] uppercase">
            Scholarship Impact Image
          </div>

        </section>

        {/* FUNDING */}
        <section className="grid md:grid-cols-2 gap-10 items-center">

          <div className="aspect-video rounded-2xl border border-blue-900/50 bg-blue-950/20 flex items-center justify-center text-gray-500 text-xs tracking-[0.3em] uppercase">
            Finance / Fundraising Image
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-4">Fundraising & Finances</h2>
            <div className="text-gray-300 space-y-2">
              <p><b>Total Revenue:</b> $128,527.60</p>
              <p><b>Net Income:</b> $94,310.16</p>
              <p><b>STEM Donations:</b> $34,217.44</p>
              <p><b>31.3%</b> of revenue allocated to student aid</p>
            </div>
          </div>

        </section>

        {/* HARD OF HEARING */}
        <section className="grid md:grid-cols-2 gap-10 items-center">

          <div>
            <h2 className="text-3xl font-bold mb-4">Hard of Hearing Outreach</h2>
            <p className="text-gray-300 leading-relaxed">
              We bring STEM education to deaf and hard-of-hearing students through
              accessible robotics workshops. Team members assist as interpreters
              and guide students through hands-on engineering activities using VEX IQ.
            </p>
          </div>

          <div className="aspect-video rounded-2xl border border-blue-900/50 bg-blue-950/20 flex items-center justify-center text-gray-500 text-xs tracking-[0.3em] uppercase">
            Accessibility Program Image
          </div>

        </section>

        {/* COMMUNITY */}
        <section className="grid md:grid-cols-2 gap-10 items-center">

          <div className="aspect-video rounded-2xl border border-blue-900/50 bg-blue-950/20 flex items-center justify-center text-gray-500 text-xs tracking-[0.3em] uppercase">
            Community Events Image
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-4">Community Engagement</h2>
            <div className="text-gray-300 space-y-2">
              <p>• STEM Showcase with district schools</p>
              <p>• Middle school STEM visits</p>
              <p>• Discovery Fest robotics demos</p>
              <p>• FIRST outreach & mentorship programs</p>
            </div>
          </div>

        </section>

        {/* STRATEGY */}
        <section className="grid md:grid-cols-2 gap-10 items-center">

          <div>
            <h2 className="text-3xl font-bold mb-4">Strategy Outreach</h2>
            <p className="text-gray-300 leading-relaxed">
              Our Strategy Department publishes tools and resources for teams
              without access to scouting or analytics systems, including workshops,
              whitepapers, and educational content.
            </p>
          </div>

          <div className="aspect-video rounded-2xl border border-blue-900/50 bg-blue-950/20 flex items-center justify-center text-gray-500 text-xs tracking-[0.3em] uppercase">
            Strategy Content Image
          </div>

        </section>

        {/* SCOUTING */}
        <section className="grid md:grid-cols-2 gap-10 items-center">

          <div className="aspect-video rounded-2xl border border-blue-900/50 bg-blue-950/20 flex items-center justify-center text-gray-500 text-xs tracking-[0.3em] uppercase">
            Scouting Alliance Image
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-4">Scouting Alliance</h2>
            <p className="text-gray-300 leading-relaxed">
              We collaborate with multiple teams at competitions to provide
              scouting tools and data systems, helping teams improve performance
              regardless of resources.
            </p>
          </div>

        </section>

      </div>
    </div>
  )
}