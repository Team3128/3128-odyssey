import NumbersSection from "./numbers"

export default function OutreachPage() {
  return (
    <div className="min-h-screen bg-[#000d1a] text-white relative overflow-hidden">

    <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
  
  {/* Background Image */}
  <div className="absolute inset-0">
    <img
      src="/images/team.png"
      className="w-full h-full object-cover"
      alt="team"
    />
    
    {/* Dark overlay for base contrast */}
    <div className="absolute inset-0 bg-black/50" />
  </div>

  {/* Glass Content */}
  <div className="relative z-10 px-6">
    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl px-10 py-8 shadow-xl text-center max-w-2xl mx-auto">
      
      <h1 className="text-5xl md:text-6xl font-bold tracking-wide text-white">
        Outreach
      </h1>

      <p className="mt-4 text-gray-200">
        Community engagement, STEM education, and impact-driven programs
        that bring robotics to students of all ages.
      </p>

    </div>
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

<div className="rounded-2xl overflow-hidden border border-white/10 bg-blue-950/20">
  <img
    src="/images/camp.png"
    alt="Summer Camp"
    className="w-full h-auto object-contain"
  />
</div>

</section>

<section>
  <NumbersSection />
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

<div className="rounded-2xl overflow-hidden border border-white/10 bg-blue-950/20">
  <img
    src="/images/seniors.png"
    alt="Our Graduating Seniors From the 2024-2025 Season"
    className="w-full h-auto object-contain"
  />
</div>

        </section>

        {/* FUNDING */}
        <section className="grid md:grid-cols-2 gap-10 items-center">

    
<div className="rounded-2xl overflow-hidden border border-white/10 bg-blue-950/20">
  <img
    src="/images/finance.png"
    alt="Finance Chart"
    className="w-full h-auto object-contain"
  />
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

<div className="rounded-2xl overflow-hidden border border-white/10 bg-blue-950/20">
  <img
    src="/images/accessibility.png"
    alt="Accessibility Program for the Hard of Hearing"
    className="w-full h-auto object-contain"
  />
</div>
        </section>

        {/* COMMUNITY */}
        <section className="grid md:grid-cols-2 gap-10 items-center">

    
<div className="rounded-2xl overflow-hidden border border-white/10 bg-blue-950/20">
  <img
    src="/images/community.png"
    alt="Accessibility Program for the Hard of Hearing"
    className="w-full h-auto object-contain"
  />
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

      
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-blue-950/20">
  <img
    src="/images/stratWorkshop.png"
    alt="Poster for Strategy Workshops We Hosted"
    className="w-full h-auto object-contain"
  />
</div>

        </section>

        {/* SCOUTING */}
        <section className="grid md:grid-cols-2 gap-10 items-center">

    
              
  <div className="rounded-2xl overflow-hidden border border-white/10 bg-blue-950/20">
  <img
    src="/images/scouting.png"
    alt="Our Scouting App Suite that won us the Scouting Award at Beach Blitz in 2024"
    className="w-full h-auto object-contain"
  />
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