import { useState } from 'react';
import { ThumbsUp, MessageSquare, ArrowRight, Calendar, Tag } from 'lucide-react';

const CompanyNews = () => {
    const [shoutoutText, setShoutoutText] = useState('');

    const featuredArticle = {
        date: 'Feb 26, 2026',
        category: 'Company Events',
        title: 'Q1 2026 Townhall Recap: Record Growth & New Initiatives',
        excerpt: "If You Missed Yesterday's Townhall, We've Got You Covered! Leadership Shared Our Fantastic Q1 Results, Introduced The New Remote Flexible Policy Starting Next Month, And Announced The Location For This Year's Company Retreat. Check Out The Full Breakdown And Slide Deck Inside.",
    };

    const recentUpdates = [
        { title: 'Updated Work From Home (WFH) Guidelines', desc: 'Please Review The Latest Iteration Of Our Hybrid Work Policy, Which Includes Details On Reimbursable Home Office Expenses And Internet Subsidies Effective Immediately.', tag: 'HR Policy', time: '4 Hours Ago' },
        { title: 'March Birthdays & Anniversaries', desc: "Join Us In Celebrating The Birthdays Of Our Amazing Team Members This Coming March! We Will Be Hosting A Combined Pizza Party In The Main Breakroom On The 10th.", tag: 'Social Committee', time: '1 Day Ago' },
        { title: 'Annual Medical Exams Open', desc: 'As Part Of Our Commitment To Your Health And Wellness, All Regular Employees Are Requested To Schedule Their Annual Physical Exams (APE) With Our Partner Clinics Before The End Of April.', tag: 'Health', time: '3 Days Ago' },
    ];

    const shoutouts = [
        { name: 'Maria Cruz', initials: 'MC', time: '2 Hours Ago', message: 'Huge Shoutout To Rafael Santos For Staying Late To Help Deploy The Client Update. We Couldn\'t Have Hit The Deadline Without You! 🎉🚀', likes: 12, color: '#8b5cf6' },
        { name: 'John Doe', initials: 'JD', time: 'Yesterday', message: 'Just A Reminder That Someone Left A Platter Of Donuts In The Pantry On The 4th Floor. First Come, First Served! 🍩🎉', likes: 12, color: '#059669' },
        { name: 'HR Assistant', initials: 'HA', time: '2 Days Ago', message: 'Welcome To The Team, Lisa Wong! Lisa Is Joining Us As Our New QA Tester. Please Introduce Yourselves If You See Her Around! 👋', likes: 12, color: '#2563eb' },
    ];

    return (
        <div className="space-y-6 pb-6">
            <div className="page-header animate-fade-in-up">
                <h1>Company News</h1>
                <p>Stay updated with the latest company news and announcements</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Featured Article */}
                    <div className="pro-card overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
                        <div className="h-48 bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                                <MessageSquare className="w-8 h-8 text-white/80" />
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                                    <Calendar className="w-3 h-3" /> {featuredArticle.date}
                                </span>
                                <span className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                                    <Tag className="w-3 h-3" /> {featuredArticle.category}
                                </span>
                            </div>
                            <h2 className="text-lg font-bold text-gray-800 mb-2">{featuredArticle.title}</h2>
                            <p className="text-sm text-gray-500 leading-relaxed mb-4">{featuredArticle.excerpt}</p>
                            <button className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
                                Read Full Article <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Recent Updates */}
                    <div className="pro-card p-5 animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
                        <h3 className="text-base font-bold text-gray-800 mb-4">Recent Updates</h3>
                        <div className="space-y-4">
                            {recentUpdates.map((update, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-colors cursor-pointer">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                        <MessageSquare className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-gray-800">{update.title}</h4>
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{update.desc}</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-semibold">{update.tag}</span>
                                            <span className="text-[10px] text-gray-400">{update.time}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Shoutouts */}
                <div className="lg:col-span-2 pro-card p-5 animate-fade-in-up h-fit" style={{ animationDelay: '0.15s', opacity: 0 }}>
                    <h3 className="text-base font-bold text-gray-800 mb-4">Shoutouts</h3>

                    {/* Post Input */}
                    <div className="mb-5">
                        <textarea
                            value={shoutoutText}
                            onChange={(e) => setShoutoutText(e.target.value)}
                            placeholder="Give A Shoutout To A Colleague..."
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 resize-none transition-all"
                            rows={2}
                        />
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-lg cursor-pointer hover:scale-110 transition-transform">😊</span>
                            <button className="px-4 py-1.5 bg-rose-500 text-white text-sm font-semibold rounded-lg hover:bg-rose-600 transition-colors flex items-center gap-1">
                                Post
                            </button>
                        </div>
                    </div>

                    {/* Shoutout Posts */}
                    <div className="space-y-5">
                        {shoutouts.map((post, i) => (
                            <div key={i} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: post.color }}>
                                        {post.initials}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-gray-800">{post.name}</p>
                                        </div>
                                        <p className="text-[11px] text-gray-400">{post.time}</p>
                                        <p className="text-sm text-gray-600 mt-2 leading-relaxed">{post.message}</p>
                                        <button className="flex items-center gap-1.5 mt-2 text-xs text-gray-400 hover:text-emerald-600 transition-colors">
                                            <ThumbsUp className="w-3.5 h-3.5" /> {post.likes}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyNews;
