import { useState } from 'react';

const QuestionItem = ({ question, subQuestion }: { question: string, subQuestion?: string }) => {
    const [answer, setAnswer] = useState<'yes' | 'no' | null>(null);

    return (
        <div className="border-b border-gray-100 py-6 last:border-0">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                    <p className="text-gray-800 font-medium">{question}</p>
                    {subQuestion && <p className="text-gray-500 text-sm mt-1 ml-4">{subQuestion}</p>}
                </div>
                <div className="flex gap-4 items-start pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name={question}
                            checked={answer === 'yes'}
                            onChange={() => setAnswer('yes')}
                            className="w-4 h-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                        />
                        <span className="text-sm font-medium">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name={question}
                            checked={answer === 'no'}
                            onChange={() => setAnswer('no')}
                            className="w-4 h-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                        />
                        <span className="text-sm font-medium">No</span>
                    </label>
                </div>
            </div>

            {answer === 'yes' && (
                <div className="mt-4 ml-0 md:ml-4 bg-gray-50 p-4 rounded-lg border border-gray-200 animate-in slide-in-from-top-2 duration-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">If YES, give details:</label>
                    <textarea
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                        rows={2}
                    ></textarea>
                </div>
            )}
        </div>
    );
};

export const LegalC4 = () => {
    return (
        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-4">Legal Questionnaire</h3>

            <div className="space-y-2">
                <QuestionItem
                    question="34. Are you related by consanguinity or affinity to the appointing or recommending authority, or to the chief of bureau or office or to the person who has immediate supervision over you in the Office, Bureau or Department where you will be apppointed?"
                    subQuestion="a. Within the third degree?"
                />
                <QuestionItem
                    question="b. Within the fourth degree (for Local Government Unit - Career Employees)?"
                />
                <QuestionItem
                    question="35. a. Have you ever been found guilty of any administrative offense?"
                />
                <QuestionItem
                    question="b. Have you been criminally charged before any court?"
                />
                <QuestionItem
                    question="36. Have you ever been convicted of any crime or violation of any law, decree, ordinance or regulation by any court or tribunal?"
                />
                <QuestionItem
                    question="37. Have you ever been separated from the service in any of the following modes: resignation, retirement, dropped from the rolls, dismissal, termination, end of term, finished contract or phased out (abolition) in the public or private sector?"
                />
                <QuestionItem
                    question="38. a. Have you ever been a candidate in a national or local election (except Barangay election)?"
                />
                <QuestionItem
                    question="b. Have you resigned from the government service during the three (3)-month period before the last election to promote/actively campaign for a national or local candidate?"
                />
                <QuestionItem
                    question="39. Have you acquired the status of an immigrant or permanent resident of another country?"
                />
                <QuestionItem
                    question="40. Pursuant to: (a) Indigenous People's Act (RA 8371); (b) Magna Carta for Disabled Persons (RA 7277); and (c) Solo Parents Welfare Act of 2000 (RA 8972), please answer the following items:"
                    subQuestion="a. Are you a member of any indigenous group?"
                />
                <QuestionItem
                    question="b. Are you a person with disability?"
                />
                <QuestionItem
                    question="c. Are you a solo parent?"
                />
            </div>
        </div>
    );
};
