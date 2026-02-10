'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTranslations } from '@/lib/i18n';
import { fetchResume } from '@/lib/api/resume';
import { recommendCareerSteps } from '@/lib/api/career';
import { CareerAdvisorResponse, CareerAdvisorResult } from '@/lib/types/career';
import { ArrowLeft, Rocket, Briefcase, Sparkles, Loader2, Footprints, GraduationCap } from 'lucide-react';

export default function CareerAdvisorPage() {
    const { t } = useTranslations();
    const router = useRouter();

    const [currentRole, setCurrentRole] = useState('');
    const [skills, setSkills] = useState('');
    const [experience, setExperience] = useState('');
    const [education, setEducation] = useState('');
    const [result, setResult] = useState<CareerAdvisorResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadMasterData = async () => {
            const masterId = localStorage.getItem('master_resume_id');
            if (masterId) {
                try {
                    const resume = await fetchResume(masterId);
                    if (resume && resume.processed_resume) {
                        const data = resume.processed_resume;
                        if (data.personalInfo?.title) setCurrentRole(data.personalInfo.title);
                        if (data.workExperience?.[0]) {
                            const exp = data.workExperience[0];
                            setExperience(`${exp.title} at ${exp.company} (${exp.years})`);
                        }
                        if (data.education?.[0]) {
                            const edu = data.education[0];
                            setEducation(`${edu.degree} from ${edu.institution}`);
                        }
                        if (data.additional?.technicalSkills) {
                            setSkills(data.additional.technicalSkills.join(', '));
                        }
                    }
                } catch (err) {
                    console.error('Failed to pre-fill advisor data', err);
                }
            }
        };
        loadMasterData();
    }, []);

    const handleGenerate = async () => {
        if (!currentRole.trim()) {
            setError(t('advisor.errors.noRole'));
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const resp: CareerAdvisorResponse = await recommendCareerSteps({
                currentRole,
                skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
                experience,
                education,
            });
            setResult(resp.aiRecommendations);
        } catch (err: any) {
            setError(err.message || t('advisor.errors.failedToGenerate'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen w-full bg-[#F6F5EE] flex flex-col items-center p-4 md:p-8 font-sans scroll-smooth"
            style={{
                backgroundImage:
                    'linear-gradient(rgba(29, 78, 216, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(29, 78, 216, 0.1) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
            }}
        >
            <div className="w-full max-w-5xl bg-white border border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] p-8 md:p-12 relative flex flex-col">
                {/* Back Button */}
                <Button variant="link" className="absolute top-4 left-4" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('common.back')}
                </Button>

                <header className="mb-12 mt-8 text-center border-b-2 border-black pb-8">
                    <h1 className="font-serif text-5xl md:text-6xl font-black uppercase tracking-tight leading-[0.95]">
                        {t('advisor.title').split(' ')[0]} <span className="text-blue-700">{t('advisor.title').split(' ').slice(1).join(' ')}</span>
                    </h1>
                    <p className="font-mono text-sm mt-4 uppercase font-bold text-blue-700">
                        {'// '} {t('advisor.subtitle')}
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left Panel: Form */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b-2 border-black pb-4">
                            <Briefcase className="w-6 h-6 text-blue-700" />
                            <h2 className="text-xl font-bold uppercase tracking-tight">Professional Profile</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                    {t('advisor.currentRoleLabel')}
                                </label>
                                <Input
                                    placeholder={t('advisor.currentRolePlaceholder')}
                                    value={currentRole}
                                    onChange={(e) => setCurrentRole(e.target.value)}
                                    className="rounded-none border-2 border-black focus-visible:ring-0 focus-visible:border-blue-700 h-12 text-lg font-medium bg-gray-50 shadow-inner"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                    {t('advisor.skillsLabel')}
                                </label>
                                <Textarea
                                    placeholder={t('advisor.skillsPlaceholder')}
                                    value={skills}
                                    onChange={(e) => setSkills(e.target.value)}
                                    className="rounded-none border-2 border-black focus-visible:ring-0 focus-visible:border-blue-700 min-h-[100px] font-mono text-sm bg-gray-50 shadow-inner"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                    {t('advisor.experienceLabel')}
                                </label>
                                <Input
                                    placeholder={t('advisor.experiencePlaceholder')}
                                    value={experience}
                                    onChange={(e) => setExperience(e.target.value)}
                                    className="rounded-none border-2 border-black focus-visible:ring-0 focus-visible:border-blue-700 h-12 text-sm bg-gray-50 shadow-inner"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                    {t('advisor.educationLabel')}
                                </label>
                                <Input
                                    placeholder={t('advisor.educationPlaceholder')}
                                    value={education}
                                    onChange={(e) => setEducation(e.target.value)}
                                    className="rounded-none border-2 border-black focus-visible:ring-0 focus-visible:border-blue-700 h-12 text-sm bg-gray-50 shadow-inner"
                                />
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 border-2 border-red-600 text-red-600 font-mono text-xs font-bold uppercase flex items-center gap-2">
                                    <span className="text-lg">!</span> {error}
                                </div>
                            )}

                            <Button
                                onClick={handleGenerate}
                                disabled={loading}
                                className="w-full h-16 bg-blue-700 text-white border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all rounded-none text-xl font-black uppercase tracking-tight"
                            >
                                {loading ? (
                                    <Loader2 className="w-6 h-6 animate-spin mr-3" />
                                ) : (
                                    <Sparkles className="w-6 h-6 mr-3" />
                                )}
                                {loading ? t('advisor.analyzing') : t('advisor.generateButton')}
                            </Button>
                        </div>
                    </div>

                    {/* Right Panel: Advice */}
                    <div className="bg-gray-50 border-2 border-black p-8 relative min-h-[500px]">
                        {result ? (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-black uppercase tracking-tight border-b-4 border-black pb-2 flex items-center gap-3">
                                        <Footprints className="w-6 h-6 text-blue-700" />
                                        {t('advisor.stepsTitle')}
                                    </h3>
                                    <ul className="space-y-4">
                                        {result.nextRoles.map((role, i) => (
                                            <li key={i} className="flex gap-4 group">
                                                <div className="shrink-0 w-8 h-8 bg-black text-white flex items-center justify-center font-bold text-sm border-2 border-black">
                                                    {i + 1}
                                                </div>
                                                <div className="text-xl font-bold uppercase tracking-tight group-hover:text-blue-700 transition-colors pt-0.5">
                                                    {role}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-black uppercase text-xs tracking-widest text-gray-500">{t('advisor.skillsToLearnTitle')}</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {result.skillsToLearn.map((skill, i) => (
                                            <span
                                                key={i}
                                                className="bg-white border-2 border-black px-3 py-1 font-mono text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_#000000]"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-black uppercase text-xs tracking-widest text-gray-500">{t('advisor.timelineTitle')}</h4>
                                    <p className="text-lg font-bold text-blue-700 uppercase">{result.timeline}</p>
                                </div>

                                <div className="space-y-2 pt-4 border-t-2 border-black/10">
                                    <h4 className="font-black uppercase text-xs tracking-widest text-gray-500">{t('advisor.summaryTitle')}</h4>
                                    <p className="text-sm leading-relaxed font-medium italic">
                                        "{result.summary}"
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-30">
                                <Rocket className="w-16 h-16 text-black mb-4" />
                                <h3 className="text-xl font-bold uppercase tracking-tight">
                                    {t('advisor.awaitingInput')}
                                </h3>
                                <p className="text-[10px] font-mono mt-2 uppercase">
                                    // {t('advisor.recommendationsWillAppear')}
                                </p>
                            </div>
                        )}

                        {/* Static Brutalist Element */}
                        <div className="absolute -bottom-4 -right-4 bg-yellow-400 border-2 border-black px-4 py-2 font-black uppercase text-xs shadow-[4px_4px_0px_0px_#000000]">
                            AI Advisor v1.0
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
