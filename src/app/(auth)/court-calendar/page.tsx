import { ComingSoonOverlay } from '@/components/layout/ComingSoonOverlay';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  CalendarDays,
  RefreshCw,
  Clock,
  MapPin,
  Video,
  Gavel,
  Plus,
} from 'lucide-react';

const hearings = [
  {
    date: 'OCT 01',
    caseName: 'Sharma v. Thapa Constructions',
    caseNumber: 'Case No. 074-CV-01823',
    judge: 'Hon. Justice B. Rana',
    time: '09:00 AM - 11:30 AM',
    location: 'Supreme Court, Room 302',
    locationIcon: MapPin,
    status: 'Confirmed',
    statusTone: 'default' as const,
  },
  {
    date: 'OCT 04',
    caseName: 'Estate of H. Bhattarai',
    caseNumber: 'Case No. 075-PR-00947',
    judge: 'Hon. Justice A. Karki',
    time: '02:30 PM - 03:30 PM',
    location: 'Virtual (Video Link)',
    locationIcon: Video,
    status: 'Confirmed',
    statusTone: 'default' as const,
  },
  {
    date: 'OCT 09',
    caseName: 'Nepal Textiles Pvt. Ltd. v. Adhikari',
    caseNumber: 'Case No. 074-CM-02216',
    judge: 'Hon. Justice R. Shrestha',
    time: '11:00 AM - 12:15 PM',
    location: 'District Court, Room 108',
    locationIcon: MapPin,
    status: 'Rescheduled',
    statusTone: 'warning' as const,
  },
  {
    date: 'OCT 11',
    caseName: 'State v. Anderson',
    caseNumber: 'Case No. 073-CR-00512',
    judge: 'Hon. Justice P. Gurung',
    time: '10:00 AM - 12:00 PM',
    location: 'Motion to Dismiss',
    locationIcon: Gavel,
    status: 'Urgent',
    statusTone: 'urgent' as const,
  },
  {
    date: 'OCT 15',
    caseName: 'Koirala Family Trust Dispute',
    caseNumber: 'Case No. 075-FM-01102',
    judge: 'Hon. Justice S. Basnet',
    time: '01:00 PM - 02:00 PM',
    location: 'Supreme Court, Room 210',
    locationIcon: MapPin,
    status: 'Confirmed',
    statusTone: 'default' as const,
  },
];

const statusStyles: Record<string, string> = {
  default: 'bg-secondary border border-accent text-foreground',
  warning: 'bg-accent/10 border border-accent text-accent',
  urgent: 'bg-destructive/10 border border-destructive text-destructive',
};

export default function CourtCalendarPage() {
  return (
    <ComingSoonOverlay
      title="Court Calendar"
      description="Track hearing dates, filing deadlines, and courtroom details, synced automatically from national court systems."
    >
      <div className="min-h-screen bg-background pb-20">
        <main className="container mx-auto px-6 py-8 max-w-7xl">
          <div className="flex flex-col gap-12">
            <PageHeader
              icon={<CalendarDays />}
              title="Court Calendar"
              description="Manage your upcoming appearances, hearings, and filing deadlines in one place."
              actions={
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs label-caps"
                >
                  <Plus className="w-4 h-4" />
                  New Event
                </button>
              }
            />

            <section className="bg-card border border-dashed border-accent rounded-xl p-6 flex items-start gap-4">
              <div className="bg-secondary p-3 rounded-full shrink-0 border border-border">
                <RefreshCw className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="font-heading text-base font-bold text-foreground mb-1">
                  Court System Sync Coming Soon
                </h2>
                <p className="text-sm text-muted-foreground">
                  We&apos;re integrating with national court systems to automatically sync your
                  case dockets and hearing schedules directly into this calendar.
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-lg font-bold text-foreground">
                  Upcoming Hearings
                </h2>
                <span className="text-xs label-caps text-accent">
                  View All
                </span>
              </div>
              <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
                {hearings.map((hearing) => {
                  const LocationIcon = hearing.locationIcon;
                  const [month, day] = hearing.date.split(' ');
                  return (
                    <div key={hearing.caseNumber} className="p-4 flex items-start gap-4">
                      <div className="flex flex-col items-center justify-center bg-secondary rounded-lg border border-border px-3 py-2 min-w-[56px] shrink-0">
                        <span className="text-[10px] label-caps text-muted-foreground">
                          {month}
                        </span>
                        <span className="font-heading text-lg font-bold text-primary leading-none">
                          {day}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-foreground truncate">
                          {hearing.caseName}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {hearing.caseNumber} &middot; {hearing.judge}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {hearing.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <LocationIcon className="w-3.5 h-3.5" />
                            {hearing.location}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${statusStyles[hearing.statusTone]}`}
                      >
                        {hearing.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </main>
      </div>
    </ComingSoonOverlay>
  );
}
