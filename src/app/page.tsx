import { publicPeopleServer } from '@/lib/api-server';


import { HomeClient } from './HomeClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Home",
  description: "Discover legal professionals and create your own professional profile with Wokil. Build beautiful websites and business cards for lawyers.",
  openGraph: {
    title: "Wokil - Discover Legal Professionals",
    description: "Discover legal professionals and create your own professional profile with Wokil. Build beautiful websites and business cards for lawyers.",
  },
};

export const revalidate = 300;

export default async function Home() {
    const professionals = await publicPeopleServer.list();

    return (
        <div className="min-h-screen bg-background selection:bg-primary/20">
            <HomeClient professionals={professionals} />
        </div>
    );
}
