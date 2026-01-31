import { publicPeopleServer } from '@/lib/api-server';
import { ProfessionalsClient } from './ProfessionalsClient';

export default async function Professionals() {
    const professionals = await publicPeopleServer.list();

    return (
        <div className="min-h-screen bg-[hsl(210,20%,98%)]/50 selection:bg-primary/20">
            <ProfessionalsClient professionals={professionals} />
        </div>
    );
}
