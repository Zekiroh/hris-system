
import { Users, UserX, Building } from 'lucide-react';

interface RegionStatsProps {
    regionId: string;
}

const RegionStats = ({ regionId }: RegionStatsProps) => {
    // Mock data generator based on region
    const getStats = (id: string) => {
        // Deterministic random-ish numbers based on char code
        const base = id.charCodeAt(0) + (id.length * 10);
        return {
            manpower: base * 15,
            vacant: Math.floor(base * 1.5),
            offices: Math.floor(base / 5),
            director: `Director ${String.fromCharCode(65 + (base % 26))} Name`
        };
    };

    const stats = getStats(regionId);
    const regionNames: Record<string, string> = {
        'NCR': 'National Capital Region',
        'CAR': 'Cordillera Administrative Region',
        'R1': 'Region 1 (Ilocos Region)',
        'R2': 'Region 2 (Cagayan Valley)',
        'R3': 'Region 3 (Central Luzon)',
        'R4A': 'Region 4A (CALABARZON)',
        'R4B': 'Region 4B (MIMAROPA)',
        'R5': 'Region 5 (Bicol Region)',
        'R6': 'Region 6 (Western Visayas)',
        'R7': 'Region 7 (Central Visayas)',
        'R8': 'Region 8 (Eastern Visayas)',
        'R9': 'Region 9 (Zamboanga Peninsula)',
        'R10': 'Region 10 (Northern Mindanao)',
        'R11': 'Region 11 (Davao Region)',
        'R12': 'Region 12 (SOCCSKSARGEN)',
        'R13': 'Region 13 (Caraga)',
        'BARMM': 'Bangsamoro Autonomous Region',
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-[var(--color-primary)] mb-1">{regionNames[regionId] || regionId}</h2>
                <p className="text-gray-500 text-sm">Regional Office Overview</p>

                <div className="mt-6 flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="h-12 w-12 rounded-full bg-green-200 flex items-center justify-center text-green-800 font-bold text-lg">
                        D
                    </div>
                    <div>
                        <p className="text-xs text-green-600 font-bold uppercase">Regional Director</p>
                        <p className="font-bold text-gray-900">{stats.director}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Total Manpower</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stats.manpower}</p>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                        <Users size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Vacant Positions</p>
                        <p className="text-3xl font-bold text-orange-500 mt-1">{stats.vacant}</p>
                    </div>
                    <div className="p-3 bg-orange-50 text-orange-500 rounded-full">
                        <UserX size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Satellite Offices</p>
                        <p className="text-3xl font-bold text-purple-500 mt-1">{stats.offices}</p>
                    </div>
                    <div className="p-3 bg-purple-50 text-purple-500 rounded-full">
                        <Building size={24} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegionStats;
