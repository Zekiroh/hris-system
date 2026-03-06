import { useState } from 'react';
import { ArrowLeft, User, BookOpen, FileText, Scale, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PersonalC1 } from '../../components/personal-records/PersonalC1';
import { VoluntaryC2 } from '../../components/personal-records/VoluntaryC2';
import { OtherC3 } from '../../components/personal-records/OtherC3';
import { LegalC4 } from '../../components/personal-records/LegalC4';

const EmployeeProfile = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('c1');

    const tabs = [
        { id: 'c1', label: 'C1 - Personal Info', icon: User },
        { id: 'c2', label: 'C2 - Family & Educ', icon: BookOpen },
        { id: 'c3', label: 'C3 - Eligibility & Work', icon: FileText },
        { id: 'c4', label: 'C4 - Legal Questionnaire', icon: Scale },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 animate-fade-in-up">
                <button
                    onClick={() => navigate(-1)}
                    className="btn-ghost btn-icon hover:bg-gray-100"
                >
                    <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <div className="page-header" style={{ marginBottom: 0 }}>
                    <h1>Employee Profile</h1>
                    <p>Viewing records for Juan Dela Cruz</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar / Profile Card */}
                <div className="w-full lg:w-80 space-y-5 animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
                    <div className="pro-card overflow-visible">
                        {/* Gradient Banner */}
                        <div className="h-24 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-t-[14px] relative">
                            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                                <div className="relative">
                                    <div className="w-24 h-24 bg-gray-100 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                                            <User size={36} />
                                        </div>
                                    </div>
                                    <button className="absolute -bottom-1 -right-1 p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-md">
                                        <Camera size={12} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="pt-14 pb-5 px-5 text-center">
                            <h2 className="text-lg font-bold text-gray-900">Juan Dela Cruz</h2>
                            <p className="text-sm text-gray-500 mt-0.5">Administrative Officer V</p>
                            <span className="badge badge-success mt-2 inline-flex">
                                <span className="badge-dot" />
                                Active
                            </span>
                            <div className="mt-4 flex gap-2 w-full">
                                <button className="btn btn-secondary flex-1 text-xs">
                                    Message
                                </button>
                                <button className="btn btn-primary flex-1 text-xs">
                                    Edit
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="pro-card overflow-hidden">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-5 py-3.5 border-l-[3px] transition-all text-sm font-medium ${activeTab === tab.id
                                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700'
                                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                    }`}
                            >
                                <tab.icon size={18} className={activeTab === tab.id ? 'text-emerald-500' : 'text-gray-400'} />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
                    {activeTab === 'c1' && <PersonalC1 />}
                    {activeTab === 'c2' && <VoluntaryC2 />}
                    {activeTab === 'c3' && <OtherC3 />}
                    {activeTab === 'c4' && <LegalC4 />}
                </div>
            </div>
        </div>
    );
};

export default EmployeeProfile;
