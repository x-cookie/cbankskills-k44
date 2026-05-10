import { notFound } from "next/navigation";
import Link from "next/link";
import { verticals } from "@/content/verticals";
import PageHeader from "@/components/PageHeader";

type Props = { params: { slug: string; skill: string } };

const GITHUB_BASE = "https://github.com/spooky-may/project-jane-street/tree/main/skills/plugins/vertical-plugins";

export function generateStaticParams() {
  return verticals.flatMap((v) =>
    v.skills.map((s) => ({ slug: v.slug, skill: s.slug }))
  );
}

export default function SkillPage({ params }: Props) {
  const v = verticals.find((v) => v.slug === params.slug);
  if (!v) notFound();
  const s = v.skills.find((s) => s.slug === params.skill);
  if (!s) notFound();

  const skillGithubUrl = `${GITHUB_BASE}/${v.slug}/skills/${s.slug}`;
  const verticalGithubUrl = `${GITHUB_BASE}/${v.slug}`;

  return (
    <>
      <PageHeader
        eyebrow={`${v.title} · /${s.slug}`}
        title={s.name}
        subtitle={s.description}
      />

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", marginBottom: 32, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <Link href="/" style={{ color: "var(--text-faint)", textDecoration: "none" }}>Home</Link>
          <span style={{ color: "var(--text-faint)" }}>/</span>
          <Link href="/skills" style={{ color: "var(--text-faint)", textDecoration: "none" }}>Skills</Link>
          <span style={{ color: "var(--text-faint)" }}>/</span>
          <Link href={`/skills/${v.slug}`} style={{ color: "var(--text-faint)", textDecoration: "none" }}>{v.title}</Link>
          <span style={{ color: "var(--text-faint)" }}>/</span>
          <span style={{ color: "var(--text-muted)" }}>{s.name}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main content */}
          <div className="lg:col-span-2 flex flex-col gap-10">

            {/* What it produces */}
            <section>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 10 }}>
                Output
              </div>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 12, letterSpacing: "-0.01em" }}>
                What it produces
              </h2>
              <div style={{ background: "var(--s1)", border: "1px solid var(--b0)", borderRadius: 10, padding: "16px 20px" }}>
                <p style={{ fontSize: 13, color: "rgba(13,31,20,0.55)", lineHeight: 1.7, fontWeight: 300 }}>{s.outputFormat}</p>
              </div>
            </section>

            {/* Best for */}
            <section>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 12, letterSpacing: "-0.01em" }}>
                Best for
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {s.bestFor.split(",").map((item) => (
                  <span
                    key={item}
                    style={{
                      background: "var(--s2)",
                      border: "1px solid var(--b0)",
                      color: "var(--text-muted)",
                      fontSize: 11,
                      padding: "5px 12px",
                      borderRadius: 20,
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {item.trim()}
                  </span>
                ))}
              </div>
            </section>

            {/* Example triggers */}
            <section>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 10 }}>
                Example prompts
              </div>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 6, letterSpacing: "-0.01em" }}>
                Use it like this
              </h2>
              <p style={{ fontSize: 12, color: "rgba(13,31,20,0.45)", marginBottom: 14, fontWeight: 300 }}>
                After uploading this skill to Claude, type in the chat:
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {s.triggerPhrases.map((phrase, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#0D1F14",
                      border: "1px solid rgba(46,139,87,0.15)",
                      borderRadius: 8,
                      padding: "12px 16px",
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      color: "#fff",
                    }}
                  >
                    <span style={{ color: "var(--accent)", marginRight: 8 }}>›</span>
                    {phrase}
                  </div>
                ))}
              </div>
            </section>

            {/* How to use */}
            <section>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 10 }}>
                Installation
              </div>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 20, letterSpacing: "-0.01em" }}>
                How to use this skill
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  {
                    n: "1",
                    title: "Download the skill ZIP",
                    desc: (
                      <>
                        Go to the{" "}
                        <a href={skillGithubUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", textDecoration: "none" }}>
                          {s.name} folder on GitHub
                        </a>
                        , download it as a ZIP file. Or download the full{" "}
                        <a href={verticalGithubUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", textDecoration: "none" }}>
                          {v.title} vertical
                        </a>{" "}
                        to get all {v.skills.length} skills at once.
                      </>
                    ),
                  },
                  {
                    n: "2",
                    title: "Upload to Claude",
                    desc: (
                      <>
                        Open{" "}
                        <a href="https://claude.ai/customize/skills" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", textDecoration: "none" }}>
                          claude.ai/customize/skills
                        </a>
                        , click <strong>Add skill</strong>, and upload your ZIP. The skill will appear
                        as a slash command in your Claude workspace immediately.
                      </>
                    ),
                  },
                  {
                    n: "3",
                    title: `Type /${s.slug} in Claude`,
                    desc: (
                      <>
                        Open Claude, type{" "}
                        <code style={{ fontFamily: "var(--font-mono)", background: "var(--s2)", padding: "1px 6px", borderRadius: 3, fontSize: 11 }}>/{s.slug}</code>
                        , attach any relevant files (Excel models, PDFs, transcripts), and describe
                        your task. The skill handles the rest.
                      </>
                    ),
                  },
                ].map((step) => (
                  <div key={step.n} style={{ display: "flex", gap: 14 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: "var(--accent-dim)", color: "var(--accent)",
                      fontSize: 12, fontWeight: 700, fontFamily: "var(--font-mono)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, marginTop: 2,
                    }}>
                      {step.n}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 4, letterSpacing: "-0.01em" }}>{step.title}</div>
                      <p style={{ fontSize: 12, color: "rgba(13,31,20,0.50)", lineHeight: 1.7, fontWeight: 300 }}>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Other skills in vertical */}
            <section>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 12 }}>
                More skills in {v.title}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {v.skills
                  .filter((other) => other.slug !== s.slug)
                  .map((other) => (
                    <Link
                      key={other.slug}
                      href={`/skills/${v.slug}/${other.slug}`}
                      className="skill-card group"
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        background: "var(--s1)", border: "1px solid var(--b0)",
                        borderRadius: 8, padding: "10px 14px",
                        textDecoration: "none",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <code style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)", background: "var(--accent-dim)", padding: "2px 6px", borderRadius: 3 }}>
                          /{other.slug}
                        </code>
                        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                          {other.name}
                        </span>
                      </div>
                      <span style={{ fontSize: 11, color: "var(--accent)", opacity: 0, transition: "opacity 0.15s" }} className="group-hover:opacity-100">→</span>
                    </Link>
                  ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Primary CTA */}
            <div style={{
              background: "var(--text)",
              borderRadius: 14,
              padding: 22,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              position: "sticky",
              top: 80,
            }}>
              <div>
                <div style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(46,139,87,0.7)",
                  marginBottom: 10,
                }}>
                  Get this skill
                </div>
                <div style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 18,
                  fontWeight: 400,
                  color: "#fff",
                  marginBottom: 4,
                  lineHeight: 1.25,
                }}>
                  {s.name}
                </div>
                <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                  /{s.slug}
                </code>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <a
                  href={skillGithubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "var(--accent)",
                    color: "#fff",
                    padding: "10px 16px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: "none",
                    textAlign: "center",
                    display: "block",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Download ZIP from GitHub
                </a>
                <a
                  href="https://claude.ai/customize/skills"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.65)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    padding: "10px 16px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 500,
                    textDecoration: "none",
                    textAlign: "center",
                    display: "block",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Upload to Claude →
                </a>
              </div>

              <Link
                href="/docs"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "rgba(255,255,255,0.3)",
                  textAlign: "center",
                  textDecoration: "none",
                }}
              >
                Need help? Read the install guide
              </Link>
            </div>

            {/* Part of vertical */}
            <div style={{ background: "var(--s1)", border: "1px solid var(--b0)", borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 10 }}>
                Part of vertical
              </div>
              <Link
                href={`/skills/${v.slug}`}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", textDecoration: "none" }}
                className="group"
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", letterSpacing: "-0.01em" }}>
                    {v.title}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>
                    {v.skills.length} skills · v{v.version}
                  </div>
                </div>
                <span style={{ fontSize: 11, color: "var(--accent)", opacity: 0, transition: "opacity 0.15s" }} className="group-hover:opacity-100">→</span>
              </Link>
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--b0)" }}>
                <a
                  href={verticalGithubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-faint)", textDecoration: "none" }}
                >
                  Download full vertical →
                </a>
              </div>
            </div>

            {/* Dependency */}
            {v.slug !== "financial-analysis" && (
              <div style={{ background: "var(--s1)", border: "1px solid var(--b0)", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 8 }}>
                  Dependency
                </div>
                <p style={{ fontSize: 11, color: "rgba(13,31,20,0.50)", lineHeight: 1.65, fontWeight: 300 }}>
                  Install{" "}
                  <Link href="/skills/financial-analysis" style={{ color: "var(--accent)", textDecoration: "none" }}>
                    Financial Analysis
                  </Link>{" "}
                  first — it provides the Excel and PowerPoint authoring tools this vertical uses.
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
