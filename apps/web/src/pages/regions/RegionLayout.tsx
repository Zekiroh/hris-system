import { useState } from 'react';
import MapComponent from '../../components/regions/MapComponent';
import RegionStats from '../../components/regions/RegionStats';

const RegionLayout = () => {
    const [selectedRegion, setSelectedRegion] = useState<string>('NCR');

    return (
        <div className="space-y-6">
            <div className="page-header animate-fade-in-up">
                <h1>Regional Offices</h1>
                <p>Interactive map of regional deployments</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 h-[600px]">
                {/* Map Area */}
                <div className="flex-1 pro-card overflow-hidden h-full animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
                    <div className="p-6 h-full">
                        <MapComponent selectedRegion={selectedRegion} onRegionSelect={setSelectedRegion} />
                    </div>
                </div>

                {/* Sidebar Info Area */}
                <div className="w-full lg:w-96 h-full overflow-y-auto animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
                    <RegionStats regionId={selectedRegion} />
                </div>
            </div>
        </div>
    );
};

export default RegionLayout;
