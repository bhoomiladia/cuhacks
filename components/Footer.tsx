"use client";

export const Footer = () => (
  <footer className="container mx-auto px-8 py-20 border-t border-white/5 mt-20">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
      {/* Brand Column */}
      <div className="col-span-1 md:col-span-1">
        <div className="text-2xl font-bold tracking-tighter text-white uppercase imbue-bold mb-6">
          KAIRO
        </div>
        <p className="text-white/30 text-xs leading-relaxed max-w-[200px]">
          The first voice-driven multi-agent productivity OS. Built for the era of intent.
        </p>
      </div>

      {/* Links Columns */}
      <div className="grid grid-cols-2 md:grid-cols-3 col-span-1 md:col-span-3 gap-8">
        {[
          { title: "Product", links: ["Features", "Agents", "Integrations", "Security"] },
          { title: "Company", links: ["About", "Blog", "Careers", "Legal"] },
          { title: "Social", links: ["Twitter", "LinkedIn", "GitHub", "Discord"] },
        ].map((group) => (
          <div key={group.title}>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80 mb-6">
              {group.title}
            </h4>
            <ul className="space-y-4">
              {group.links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-xs text-white/30 hover:text-purple-300 transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>

    {/* Bottom Bar */}
    <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-white/5">
      <div className="text-[10px] text-white/20 uppercase tracking-[0.2em]">
        © 2024 Kairo AI. All Rights Reserved.
      </div>
      <div className="flex gap-8">
        <a href="#" className="text-[10px] text-white/20 hover:text-white transition-colors uppercase tracking-[0.1em]">Privacy Policy</a>
        <a href="#" className="text-[10px] text-white/20 hover:text-white transition-colors uppercase tracking-[0.1em]">Terms of Service</a>
      </div>
    </div>
  </footer>
);  