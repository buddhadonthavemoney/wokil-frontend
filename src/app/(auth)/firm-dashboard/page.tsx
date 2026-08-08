import { Building2, Crown, Mail, Palette, Receipt, ShieldCheck, UserPlus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ComingSoonOverlay } from '@/components/layout/ComingSoonOverlay';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface FirmMember {
  name: string;
  email: string;
  title: string;
  role: 'Owner' | 'Admin' | 'Member';
  status: 'Live' | 'Pending';
}

const members: FirmMember[] = [
  {
    name: 'Jane Whitfield',
    email: 'jane.whitfield@harrowlaw.com',
    title: 'Managing Partner',
    role: 'Owner',
    status: 'Live',
  },
  {
    name: 'Robert Okafor',
    email: 'robert.okafor@harrowlaw.com',
    title: 'Senior Associate, Corporate Law',
    role: 'Admin',
    status: 'Live',
  },
  {
    name: 'Priya Nair',
    email: 'priya.nair@harrowlaw.com',
    title: 'Associate, Litigation',
    role: 'Member',
    status: 'Live',
  },
  {
    name: 'sarah.diallo@harrowlaw.com',
    email: 'Invitation sent 2 days ago',
    title: 'Associate, Family Law',
    role: 'Member',
    status: 'Pending',
  },
];

export default function FirmDashboardPage() {
  return (
    <ComingSoonOverlay
      title="Firm Dashboard"
      description="Soon firms will be able to invite team members, manage a shared firm site, and see everyone's status in one place."
    >
      <div className="min-h-screen bg-background pb-20">
        <main className="container mx-auto px-6 py-8 max-w-7xl">
          <PageHeader
            icon={<Building2 />}
            title="Firm Management"
            description="Manage your firm presence and team members."
            actions={
              <Button size="sm" className="gap-2 rounded-lg font-medium">
                <UserPlus className="w-4 h-4" />
                Invite Member
              </Button>
            }
          />

          <Card className="border border-border shadow-sm bg-card rounded-xl overflow-hidden mb-8">
            <div className="p-6 md:p-8 border-b border-border bg-muted/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center border border-border">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-heading font-bold text-foreground">Harrow &amp; Whitfield LLP</h3>
                  <p className="text-sm text-muted-foreground mt-1">Corporate Law &amp; Litigation</p>
                </div>
              </div>
              <Badge variant="outline" className="border-accent text-primary font-semibold uppercase tracking-widest text-[10px] px-3 py-1">
                Active Subscription
              </Badge>
            </div>

            <CardContent className="p-0">
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-border bg-muted/20 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <div className="col-span-5 pl-4">Member</div>
                <div className="col-span-3">Role</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 text-right pr-4">Actions</div>
              </div>

              <div className="flex flex-col divide-y divide-border">
                {members.map((member) => (
                  <div
                    key={member.name}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center"
                  >
                    <div className="col-span-1 md:col-span-5 flex items-center gap-4 md:pl-4">
                      <Avatar>
                        {member.status === 'Pending' ? (
                          <AvatarFallback className="border border-dashed border-border bg-muted">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                          </AvatarFallback>
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-primary font-heading font-semibold">
                            {member.name.split(' ').map((n) => n[0]).join('')}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p
                          className={`text-sm font-semibold text-foreground ${
                            member.status === 'Pending' ? 'italic text-muted-foreground' : ''
                          }`}
                        >
                          {member.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>

                    <div className="col-span-1 md:col-span-3">
                      <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
                        {member.role === 'Owner' && <Crown className="w-3.5 h-3.5 text-accent" />}
                        {member.role}
                      </span>
                      <p className="text-xs text-muted-foreground">{member.title}</p>
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            member.status === 'Live' ? 'bg-accent' : 'border border-border'
                          }`}
                        />
                        {member.status}
                      </span>
                    </div>

                    <div className="col-span-1 md:col-span-2 flex justify-end pr-0 md:pr-4">
                      <Button variant="ghost" size="sm">
                        {member.status === 'Pending' ? 'Resend' : 'Manage'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-border text-xs text-muted-foreground">
                Showing {members.length} of {members.length} members
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border border-border bg-card rounded-xl p-6 flex flex-col">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Palette className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-heading font-semibold text-foreground mb-2">Firm Branding</h4>
              <p className="text-sm text-muted-foreground flex-1">
                Update your firm&apos;s logo, colors, and typography across every member profile.
              </p>
              <span className="text-xs font-semibold uppercase tracking-widest text-accent mt-4">
                Configure
              </span>
            </Card>

            <Card className="border border-border bg-card rounded-xl p-6 flex flex-col">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Receipt className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-heading font-semibold text-foreground mb-2">Billing &amp; Seats</h4>
              <p className="text-sm text-muted-foreground flex-1">
                Manage payment methods, view invoices, and adjust your total active seats.
              </p>
              <span className="text-xs font-semibold uppercase tracking-widest text-accent mt-4">
                Manage
              </span>
            </Card>

            <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[180px]">
              <ShieldCheck className="w-7 h-7 text-muted-foreground mb-2" />
              <h4 className="text-sm font-semibold text-foreground mb-1">Firm-wide Permissions</h4>
              <p className="text-xs text-muted-foreground">Control what each role can see and edit</p>
            </div>
          </div>
        </main>
      </div>
    </ComingSoonOverlay>
  );
}
