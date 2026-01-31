import { publicPeopleServer } from '@/lib/api-server';
import { HomeClient } from './HomeClient';

export default async function Home() {
    const professionals = await publicPeopleServer.list();

    return (
        <div className="min-h-screen bg-background selection:bg-primary/20">
            <HomeClient professionals={professionals} />
        </div>
    );
}
