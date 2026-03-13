import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Mail, Phone, MapPin, Send, MessageSquare, BookOpen, FileQuestion, Headphones } from 'lucide-react';

const faqs = [
    { q: 'How do I file a leave request?', a: 'Navigate to "My Leaves" from the sidebar, click "File Leave", select the leave type, dates, and provide a reason. Your manager will be notified automatically.' },
    { q: 'How do I view my pay slips?', a: 'Go to "My Pay Slips" from the sidebar. You can view and download current and past payslip details in PDF format.' },
    { q: 'How do I update my personal information?', a: 'Contact your HR administrator to request changes to your personal records. Some fields like contact number and emergency contacts can be updated through your Employee Dashboard.' },
    { q: 'What is the attendance policy?', a: 'Regular working hours are from 9:00 AM to 6:00 PM. Employees should time in within the grace period of 15 minutes. Tardiness beyond this is recorded accordingly.' },
    { q: 'How do I apply for overtime?', a: 'Overtime requests should be filed through your direct supervisor. Once approved, it will be automatically reflected in your next payslip.' },
    { q: 'How does the performance review process work?', a: 'Performance reviews are conducted bi-annually (mid-year and annual). Your manager sets KPIs at the beginning of each cycle, and you are evaluated based on your progress and accomplishments.' },
];

const HelpSupport = () => {
    const [openFaq, setOpenFaq] = useState<number | null>(0);
    const [ticketForm, setTicketForm] = useState({ subject: '', category: 'general', message: '' });

    const categories = [
        { icon: BookOpen, label: 'Getting Started', desc: 'Learn the basics of using the HRIS system', color: '#059669' },
        { icon: FileQuestion, label: 'FAQs', desc: 'Frequently asked questions and answers', color: '#2563eb' },
        { icon: Headphones, label: 'Contact Support', desc: 'Reach out to our support team', color: '#7c3aed' },
    ];

    return (
        <div className="space-y-6 pb-6">
            <div className="page-header animate-fade-in-up">
                <h1>Help & Support</h1>
                <p>Find answers to common questions or submit a support ticket</p>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
                {categories.map((cat, i) => (
                    <div key={i} className="pro-card !p-5 flex items-center gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.color + '15' }}>
                            <cat.icon className="w-6 h-6" style={{ color: cat.color }} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-800 group-hover:text-emerald-600 transition-colors">{cat.label}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{cat.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* FAQs */}
                <div className="pro-card p-5 animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
                    <div className="flex items-center gap-2 mb-5">
                        <HelpCircle className="w-4 h-4 text-emerald-600" />
                        <h3 className="text-base font-bold text-gray-800">Frequently Asked Questions</h3>
                    </div>
                    <div className="space-y-2">
                        {faqs.map((faq, i) => (
                            <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                                >
                                    <span className="text-sm font-semibold text-gray-800 pr-4">{faq.q}</span>
                                    {openFaq === i ? (
                                        <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    )}
                                </button>
                                {openFaq === i && (
                                    <div className="px-4 pb-4">
                                        <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Support Ticket + Contact */}
                <div className="space-y-6">
                    {/* Submit Ticket */}
                    <div className="pro-card p-5 animate-fade-in-up" style={{ animationDelay: '0.25s', opacity: 0 }}>
                        <div className="flex items-center gap-2 mb-5">
                            <MessageSquare className="w-4 h-4 text-emerald-600" />
                            <h3 className="text-base font-bold text-gray-800">Submit a Support Ticket</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Subject</label>
                                <input
                                    type="text"
                                    value={ticketForm.subject}
                                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                                    placeholder="Brief description of your issue"
                                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Category</label>
                                <select
                                    value={ticketForm.category}
                                    onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all"
                                >
                                    <option value="general">General Inquiry</option>
                                    <option value="technical">Technical Issue</option>
                                    <option value="payroll">Payroll</option>
                                    <option value="leave">Leave & Attendance</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Message</label>
                                <textarea
                                    value={ticketForm.message}
                                    onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                                    placeholder="Describe your issue in detail..."
                                    rows={4}
                                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 resize-none transition-all"
                                />
                            </div>
                            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors">
                                <Send className="w-4 h-4" /> Submit Ticket
                            </button>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="pro-card p-5 animate-fade-in-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
                        <h3 className="text-base font-bold text-gray-800 mb-4">Contact Information</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium">Email</p>
                                    <p className="text-sm font-semibold text-gray-700">support@simplevia.com</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <Phone className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium">Phone</p>
                                    <p className="text-sm font-semibold text-gray-700">+63 (2) 8888-1234</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-4 h-4 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium">Office</p>
                                    <p className="text-sm font-semibold text-gray-700">BGC, Taguig City, Philippines</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpSupport;
