import NumbersSection from "./numbers"

export default function OutreachPage() {
  return (
    <div className="h-screen overflow-y-scroll snap-y snap-proximity scroll-smooth bg-gradient-to-b from-[#000d1a] via-[#020617] to-black text-white">

      {/* ───────── HERO ───────── */}
      <section className="snap-start h-screen flex items-center justify-center relative overflow-hidden">

        <div className="absolute inset-0">
          <img
            src="/images/team.png"
            className="w-full h-full object-cover"
            alt="team"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 px-6">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl px-10 py-8 shadow-xl text-center max-w-2xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold tracking-wide">
              Outreach
            </h1>
            <p className="mt-4 text-gray-200">
              Community engagement, STEM education, and impact-driven programs
              that bring robotics to students of all ages.
            </p>
          </div>
        </div>
      </section>
      {/* ───────── NUMBERS ───────── */}
      <section className="snap-start h-screen flex items-center">
        <div className="w-full">
          <NumbersSection />
        </div>
      </section>


      {/* ───────── SECTION TEMPLATE ───────── */}
      {[
        {
          title: "Summer Camp",
          text: "Our Summer Camp consists of three week-long programs that introduce elementary and middle school students to STEM and robotics.",
          bullets: [
            "Programs: Insight (1–4), Curiosity (5–6), Opportunity (7–9)",
            "1:4 counselor-to-student ratio",
            "FLL, VEX IQ, and FTC-based learning progression",
            "Fully student-led instruction model"
          ],
          img: "/images/camp.png",
          desc: "Hands-on robotics learning for younger students",
          reverse: false
        },
        
        {
          title: "Scholarships",
          text: "100% of financial need is met through scholarships. Any student requiring financial aid receives support with no documentation required.",
          img: "/images/scholarships.png",
          desc: "Ensuring access regardless of financial background",
          reverse: false
        },
        {
          title: "Fundraising & Finances",
          text: null,
          custom: (
            <div className="text-gray-300 space-y-2">
              <p><b>Total Revenue:</b> $128,527.60</p>
              <p><b>Net Income:</b> $94,310.16</p>
              <p><b>STEM Donations:</b> $34,217.44</p>
              <p><b>31.3%</b> of revenue allocated to student aid</p>
            </div>
          ),
          img: "/images/finance.png",
          desc: "Transparent funding and impact allocation",
          reverse: true
        },
        {
          title: "Hard of Hearing Outreach",
          text: "We bring STEM education to deaf and hard-of-hearing students through accessible robotics workshops.",
          img: "/images/accessibility.png",
          desc: "Accessible STEM education initiatives",
          reverse: false
        },
        {
          title: "Community Engagement",
          text: null,
          custom: (
            <div className="text-gray-300 space-y-2">
              <p>• STEM Showcase with district schools</p>
              <p>• Middle school STEM visits</p>
              <p>• Discovery Fest robotics demos</p>
              <p>• FIRST outreach & mentorship programs</p>
            </div>
          ),
          img: "/images/community.png",
          desc: "Connecting robotics with the community",
          reverse: true
        },
        {
          title: "Strategy Outreach",
          text: "Our Strategy Department publishes tools and resources for teams without access to scouting systems.",
          img: "/images/stratWorkshop.png",
          desc: "Sharing competitive tools with other teams",
          reverse: false
        },
        {
          title: "Scouting Alliance",
          text: "We collaborate with multiple teams at competitions to provide scouting tools and data systems.",
          img: "/images/scouting.png",
          desc: "Collaborative data systems at competitions",
          reverse: true
        }
      ].map((section, i) => (
        <section key={i} className="snap-start h-screen flex items-center py-10">
          <div className="max-w-7xl mx-auto px-4 md:px-10 w-full">

            <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 md:p-12 shadow-xl overflow-hidden hover:bg-white/10 transition duration-500">

              {/* glow */}
              <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />

              <div className={`grid md:grid-cols-2 gap-6 items-center ${section.reverse ? "md:flex-row-reverse" : ""}`}>

                {/* TEXT */}
                <div>
                  <h2 className="text-3xl font-bold mb-4">{section.title}</h2>
                  {section.text && (
                    <p className="text-gray-300 leading-relaxed">{section.text}</p>
                  )}
                  {section.bullets && (
                    <ul className="mt-4 text-gray-300 space-y-2 list-disc ml-5">
                      {section.bullets.map((b, j) => <li key={j}>{b}</li>)}
                    </ul>
                  )}
                  {section.custom}
                </div>

                {/* IMAGE */}
                <div className="group relative rounded-xl overflow-hidden border border-white/10 transition duration-500 hover:-translate-y-1 hover:shadow-2xl">
                  <img
                    src={section.img}
                    className="w-full h-auto object-contain transition duration-700 group-hover:scale-105"
                  />

                  {/* hover overlay */}
                  <div className="absolute bottom-0 left-0 w-full bg-black/60 backdrop-blur-sm text-sm text-gray-200 px-4 py-2 
                                  translate-y-full group-hover:translate-y-0 transition duration-300">
                    {section.desc}
                  </div>
                </div>

              </div>

              {/* subtle divider */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            </div>
          </div>
        </section>
      ))}

      
    </div>
  )
}