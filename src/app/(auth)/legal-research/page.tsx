import { ComingSoonOverlay } from '@/components/layout/ComingSoonOverlay';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Search,
  Gavel,
  BookOpen,
  Scale,
  History,
  FileText,
  Bookmark,
  ArrowRight,
} from 'lucide-react';

const databases = [
  {
    icon: BookOpen,
    title: 'Constitution of Nepal',
    description:
      'Explore the constitution, fundamental rights, and state structure with historical context.',
  },
  {
    icon: Gavel,
    title: 'Civil Law (Muluki)',
    description:
      'Access the Muluki Civil Code 2074, property laws, family law, and contract regulations.',
  },
  {
    icon: Scale,
    title: 'Criminal Law',
    description:
      'Muluki Criminal Code, penal procedures, evidence act, and major Supreme Court precedents.',
  },
];

const recentResearch = [
  {
    icon: History,
    title: 'Liability in Corporate Fraud under Company Act 2063',
    meta: 'Query saved 2 hours ago',
    tag: 'Corporate',
  },
  {
    icon: FileText,
    title: 'Supreme Court Decision: Nepal Bar Association vs. GoN (Writ No. 074-WO-0211)',
    meta: 'Document viewed yesterday',
    tag: 'Constitutional',
  },
  {
    icon: History,
    title: 'Divorce proceedings timelines under New Civil Code',
    meta: 'Query saved 3 days ago',
    tag: 'Family Law',
  },
];

export default function LegalResearchPage() {
  return (
    <ComingSoonOverlay
      title="Legal Research"
      description="Search Nepali constitutional law, civil codes, and criminal precedents through an AI-powered research assistant."
    >
      <div className="min-h-screen bg-background pb-20">
        <main className="container mx-auto px-6 py-8 max-w-7xl">
          <div className="flex flex-col gap-12">
            <PageHeader
              icon={<Gavel />}
              title="Legal Research"
              description="Access comprehensive Nepali constitutional law, civil codes, and criminal precedents through our AI-powered research system."
            />

            <section className="bg-card border border-border rounded-xl p-8 shadow-sm">
              <h2 className="font-heading text-lg font-bold text-foreground mb-6">
                Law &amp; Constitution Search
              </h2>
              <div className="relative">
                <Search className="w-5 h-5 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  disabled
                  placeholder="Query the Constitution, Civil Code, or specific precedents..."
                  className="w-full pl-12 pr-28 py-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground outline-none"
                />
                <button
                  type="button"
                  disabled
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest"
                >
                  Search
                </button>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mr-2">
                  Suggested:
                </span>
                {['Fundamental Rights (Part 3)', 'Muluki Civil Code 2074', 'Cyber Crime Precedents'].map(
                  (chip) => (
                    <button
                      key={chip}
                      type="button"
                      disabled
                      className="px-4 py-2 rounded-full border border-border bg-background text-sm text-foreground"
                    >
                      {chip}
                    </button>
                  ),
                )}
              </div>
            </section>

            <section>
              <h2 className="font-heading text-lg font-bold text-foreground mb-6">
                Core Legal Databases
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {databases.map(({ icon: Icon, title, description }) => (
                  <div
                    key={title}
                    className="p-6 rounded-xl border border-border bg-card"
                  >
                    <div className="w-12 h-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-heading text-base font-semibold text-foreground mb-2">
                      {title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                    <div className="mt-4 flex items-center gap-1 text-accent text-xs font-bold uppercase tracking-widest">
                      Browse <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-lg font-bold text-foreground">
                  Recent Research
                </h2>
                <span className="text-xs font-bold uppercase tracking-widest text-accent">
                  View All
                </span>
              </div>
              <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
                {recentResearch.map(({ icon: Icon, title, meta, tag }) => (
                  <div key={title} className="p-4 flex items-start gap-4">
                    <Icon className="w-5 h-5 text-muted-foreground mt-1 shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-foreground">{title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{meta}</span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span className="bg-secondary border border-accent text-foreground px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                          {tag}
                        </span>
                      </div>
                    </div>
                    <Bookmark className="w-4 h-4 text-muted-foreground shrink-0" />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </ComingSoonOverlay>
  );
}
