import { publicPeopleServer } from '@/lib/api-server';
import { ProfessionalsClient } from './ProfessionalsClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Legal Professionals",
  description: "Browse our directory of legal professionals. Find lawyers, attorneys, and legal experts in your area.",
  openGraph: {
    title: "Legal Professionals Directory | Wokil",
    description: "Browse our directory of legal professionals. Find lawyers, attorneys, and legal experts in your area.",
  },
};

export const revalidate = 300;

export default async function Professionals() {
    const professionals = await publicPeopleServer.list();

    return (
        <div className="min-h-screen bg-[hsl(210,20%,98%)]/50 selection:bg-primary/20">
            <ProfessionalsClient professionals={professionals} />
        </div>
    );
}
