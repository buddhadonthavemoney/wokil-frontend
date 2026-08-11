'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Building2, Users, UserPlus, Globe, ExternalLink, Pencil, Loader2, CalendarDays, BadgeCheck,
} from 'lucide-react';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getMyFirmOptions } from '@/generated/wokil-api/@tanstack/react-query.gen';
import { FirmProfile, toFirmProfile } from '@/types/firm';
import { FIRM_STEPS } from '@/components/form/firmSteps';

/**
 * Deep-links into the wizard at the roster step, found by key rather than
 * hardcoded, so reordering the steps cannot silently send "Edit roster"
 * somewhere else.
 */
const ROSTER_STEP = FIRM_STEPS.findIndex((s) => s.key === 'roster') + 1;

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export default function FirmDashboardPage() {
  const router = useRouter();
  const { data, isLoading } = useQuery(getMyFirmOptions());

  const raw = data as Partial<FirmProfile> | undefined;
  const firm: FirmProfile = toFirmProfile(raw);
  // getMyFirm answers {} when the caller has no firm, so an id is what
  // distinguishes "no firm yet" from "a firm with nothing filled in".
  const hasFirm = Boolean(raw?.id);
  const roster = firm.roster ?? [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading your firm…
      </div>
    );
  }

  // A real state, not an error: an individual account, or a firm account that
  // left the wizard before its first save.
  if (!hasFirm) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <main className="container mx-auto px-6 py-8 max-w-3xl">
          <Card className="p-10 text-center space-y-4 shadow-premium">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/5 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-primary/50" />
            </div>
            <h1 className="text-xl font-bold text-foreground">No firm set up yet</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Create your firm to manage its site and the lawyers who appear on it.
            </p>
            <Button onClick={() => router.push('/firm-builder')} className="gap-2">
              <Building2 className="w-4 h-4" />
              Set up your firm
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <PageHeader
          icon={<Building2 />}
          title={firm.firmDetails.name || 'Your Firm'}
          description={firm.firmDetails.tagline || 'Manage your firm presence and team.'}
          actions={
            <div className="flex items-center gap-3">
              {firm.siteUrl && (
                <Button variant="outline" asChild className="gap-2">
                  <a href={`https://${firm.siteUrl}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                    View Site
                  </a>
                </Button>
              )}
              <Button onClick={() => router.push('/firm-builder')} className="gap-2">
                <Pencil className="w-4 h-4" />
                Edit Firm
              </Button>
            </div>
          }
        />

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="shadow-premium">
            <CardContent className="p-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Lawyers</span>
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div className="text-3xl font-bold">{roster.length}</div>
            </CardContent>
          </Card>

          <Card className="shadow-premium">
            <CardContent className="p-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Site</span>
                <Globe className="w-4 h-4 text-primary" />
              </div>
              <div className="text-lg font-bold truncate">
                {firm.siteUrl || (
                  <span className="text-muted-foreground font-normal">Not published</span>
                )}
              </div>
              {firm.isPublished && <Badge variant="secondary" className="mt-1">Live</Badge>}
            </CardContent>
          </Card>

          <Card className="shadow-premium">
            <CardContent className="p-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Established</span>
                <CalendarDays className="w-4 h-4 text-primary" />
              </div>
              <div className="text-3xl font-bold">
                {firm.firmDetails.foundedYear || (
                  <span className="text-muted-foreground font-normal text-lg">—</span>
                )}
              </div>
              {firm.firmDetails.registrationNumber && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  Reg. {firm.firmDetails.registrationNumber}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-premium">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-lg font-bold text-foreground">Our Team</h2>
                <p className="text-sm text-muted-foreground">
                  The lawyers shown on your firm&apos;s site.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push(`/firm-builder?step=${ROSTER_STEP}`)}
                className="gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Edit roster
              </Button>
            </div>

            {roster.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/20 p-10 text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-xl bg-primary/5 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary/40" />
                </div>
                <p className="font-medium text-foreground">No lawyers added yet</p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Your site is still publishable — visitors are invited to contact the firm until
                  you add your team.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {/*
                  Keyed by index, matching RosterMemberList: members carry no id,
                  and the only mutations are append and remove-at-index.
                */}
                {roster.map((member, index) => (
                  <li key={index} className="flex items-center gap-4 py-4">
                    <Avatar className="h-10 w-10">
                      {member.photo && <AvatarImage src={member.photo} alt={member.fullName} />}
                      <AvatarFallback>{initials(member.fullName)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground truncate">{member.fullName}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {member.professionalTitle}
                        {member.email ? ` · ${member.email}` : ''}
                      </p>
                    </div>
                    {member.yearsOfExperience ? (
                      <Badge variant="secondary" className="shrink-0">
                        {member.yearsOfExperience}+ yrs
                      </Badge>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
