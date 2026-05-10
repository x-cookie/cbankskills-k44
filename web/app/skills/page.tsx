import Link from "next/link";
import { verticals } from "@/content/verticals";
import PageHeader from "@/components/PageHeader";

const SKILLS_GITHUB = "https://github.com/spooky-may/project-jane-street/tree/main/skills";
const totalSkills = verticals.reduce((acc, v) => acc + v.skills.length, 0);

export default function SkillsPage() {
  return (
    <>
      <PageHeader
        eyebrow={`${totalSkills} skills · 7 verticals`}
        title={
          <>
            All Skills{" "}
            <span style={{ color: "var(--text-fade)" }}>— browse everything</span>
          </>
        }
        subtitle={`${totalSkills} production-ready skills across 7 financial services verticals. Each skill is a downloadable ZIP — upload to claude.ai/customize/skills to activate it as a slash command.`}
      />

      <div className="max-w-6xl mx-auto px-6 py-14">
        {/* GitHub link */}
        <div className="flex justify-end mb-10">
          <a
            href={SKILLS_GITHUB}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--text-muted)",
              border: "1px solid var(--b1)",
              padding: "7px 14px",
              borderRadius: 6,
              textDecoration: "none",
              transition: "border-color 0.15s, color 0.15s",
            }}
            className="btn-outline"
          >
            View on GitHub →
          </a>
        </div>

        {/* Verticals with skill lists */}
        <div className="flex flex-col gap-16">
          {verticals.map((v) => (
            <div key={v.slug}>
              {/* Vertical header */}
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid var(--b0)" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 5 }}>
                    {v.skills.length} skills · v{v.version}
                  </div>
                  <Link
                    href={`/skills/${v.slug}`}
                    style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", textDecoration: "none", letterSpacing: "-0.02em", transition: "color 0.15s" }}
                    className="hover:text-primary"
                  >
                    {v.title}
                  </Link>
                  <p style={{ fontSize: 12, color: "rgba(13,31,20,0.45)", marginTop: 3, fontWeight: 300 }}>{v.tagline}</p>
                </div>
                <Link
                  href={`/skills/${v.slug}`}
                  style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)", textDecoration: "none" }}
                >
                  View vertical →
                </Link>
              </div>

              {/* Skills grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-1">
                {v.skills.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/skills/${v.slug}/${s.slug}`}
                    className="skill-card group"
                    style={{
                      background: "var(--s1)",
                      border: "1px solid var(--b0)",
                      borderRadius: 10,
                      padding: "16px 18px",
                      textDecoration: "none",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                      <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", letterSpacing: "-0.01em" }}>
                        {s.name}
                      </h3>
                      <code style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--accent)", background: "var(--accent-dim)", padding: "2px 6px", borderRadius: 3, flexShrink: 0 }}>
                        /{s.slug}
                      </code>
                    </div>
                    <p style={{ fontSize: 11, color: "rgba(13,31,20,0.45)", lineHeight: 1.55, fontWeight: 300 }}>
                      {s.bestFor}
                    </p>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)", marginTop: 2, opacity: 0, transition: "opacity 0.15s" }} className="group-hover:opacity-100">
                      View skill →
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ marginTop: 80, background: "var(--text)", borderRadius: 14, padding: "48px 40px", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(46,139,87,0.7)", marginBottom: 12 }}>
            Get started
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", marginBottom: 10 }}>
            Ready to use these skills?
          </h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 24, fontWeight: 300 }}>
            Download any skill ZIP from GitHub and upload it to <strong style={{ color: "rgba(255,255,255,0.7)" }}>claude.ai/customize/skills</strong> to activate it.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href={SKILLS_GITHUB}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "var(--accent)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                padding: "10px 22px",
                borderRadius: 7,
                textDecoration: "none",
                fontFamily: "var(--font-sans)",
              }}
            >
              Download from GitHub →
            </a>
            <a
              href="https://claude.ai/customize/skills"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "rgba(255,255,255,0.07)",
                color: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(255,255,255,0.12)",
                fontSize: 13,
                fontWeight: 500,
                padding: "10px 22px",
                borderRadius: 7,
                textDecoration: "none",
                fontFamily: "var(--font-sans)",
              }}
            >
              Open Claude Skills Manager
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
