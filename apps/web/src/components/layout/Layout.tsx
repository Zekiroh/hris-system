import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const Layout = () => {
    return (
        <div className="flex h-screen bg-[#f1f5f9]">
            <Sidebar />
            <div className="flex-1 ml-[260px] flex flex-col h-screen overflow-hidden transition-all duration-300">
                <TopBar />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    <div className="container mx-auto max-w-7xl">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
