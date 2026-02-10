'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SwissGrid } from '@/components/home/swiss-grid';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTranslations } from '@/lib/i18n';
import { fetchResume } from '@/lib/api/resume';
import { generateCareerPath } from '@/lib/api/career';
import { CareerPathResponse, CareerPathResult } from '@/lib/types/career';
import { ArrowLeft, Rocket, Target, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';

export default function CareerPathGenerator() {
    const { t } = useTranslations();
    const [goal, setGoal] = useState('');
    const [skills, setSkills] = useState('');
    const [experience, setExperience] = useState('');
    const [education, setEducation] = useState('');
    const [result, setResult] = useState<CareerPathResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadMasterResume = async () => {
            const masterResumeId = localStorage.getItem('master_resume_id');
            if (masterResumeId) {
                try {
                    const data = await fetchResume(masterResumeId);
                    if (data.processed_resume) {
                        const pr = data.processed_resume;
                        const skillsList = pr.additional?.technicalSkills || [];
                        setSkills(skillsList.join(', '));

                        const lastJob = pr.workExperience?.[0];
                        if (lastJob) {
                            setExperience(`${lastJob.title} at ${lastJob.company} (${lastJob.years})`);
                        }

                        const lastEdu = pr.education?.[0];
                        if (lastEdu) {
                            setEducation(`${lastEdu.degree} from ${lastEdu.institution}`);
                        }
                    }
                } catch (err) {
                    console.error('Failed to load master resume for career path:', err);
                }
            }
        };
        loadMasterResume();
    }, []);

    const handleGenerate = async () => {
        if (!goal.trim()) {
            setError(t('career.errors.noGoal'));
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const resp: CareerPathResponse = await generateCareerPath({
                goal,
                skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
                experience,
                education,
            });
            setResult(resp.result);
        } catch (err: any) {
            setError(err.message || t('career.errors.failedToGenerate'));
        } finally {
            setLoading(false);
        }
    };

    const router = useRouter();

    return (
        <div
            className="min-h-screen w-full bg-[#F6F5EE] flex flex-col items-center p-4 md:p-8 font-sans scroll-smooth"
            style={{
                backgroundImage:
                    'linear-gradient(rgba(29, 78, 216, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(29, 78, 216, 0.1) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
            }}
        >
            <div className="w-full max-w-6xl bg-white border border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] p-8 md:p-12 relative flex flex-col">
                {/* Back Button */}
                <Button variant="link" className="absolute top-4 left-4" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('common.back')}
                </Button>

                <header className="mb-12 mt-8 text-center border-b-2 border-black pb-8">
                    <h1 className="font-serif text-5xl md:text-6xl font-black uppercase tracking-tight leading-[0.95]">
                        {t('career.title')}
                    </h1>
                    <p className="font-mono text-sm mt-4 uppercase font-bold text-blue-700">
                        {'// '} {t('career.subtitle')}
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                    {/* Form Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-3 border-b-2 border-black pb-4">
                            <Target className="w-6 h-6 text-blue-700" />
                            <h2 className="text-xl font-bold uppercase tracking-tight">{t('career.aspirationsTitle')}</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                    {t('career.goalLabel')}
                                </label>
                                <Input
                                    placeholder={t('career.goalPlaceholder')}
                                    value={goal}
                                    onChange={(e) => setGoal(e.target.value)}
                                    className="rounded-none border-2 border-black focus-visible:ring-0 focus-visible:border-blue-700 h-12 text-lg font-medium bg-gray-50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                    {t('career.skillsLabel')}
                                </label>
                                <Textarea
                                    placeholder={t('career.skillsPlaceholder')}
                                    value={skills}
                                    onChange={(e) => setSkills(e.target.value)}
                                    className="rounded-none border-2 border-black focus-visible:ring-0 focus-visible:border-blue-700 min-h-[120px] font-mono text-sm bg-gray-50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                    {t('career.experienceLabel')}
                                </label>
                                <Input
                                    placeholder={t('career.experiencePlaceholder')}
                                    value={experience}
                                    onChange={(e) => setExperience(e.target.value)}
                                    className="rounded-none border-2 border-black focus-visible:ring-0 focus-visible:border-blue-700 h-12 text-sm bg-gray-50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                    {t('career.educationLabel')}
                                </label>
                                <Input
                                    placeholder={t('career.educationPlaceholder')}
                                    value={education}
                                    onChange={(e) => setEducation(e.target.value)}
                                    className="rounded-none border-2 border-black focus-visible:ring-0 focus-visible:border-blue-700 h-12 text-sm bg-gray-50"
                                />
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 border-2 border-red-600 text-red-600 font-mono text-xs font-bold uppercase">
                                    {error}
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
                                    <Rocket className="w-6 h-6 mr-3" />
                                )}
                                {loading ? t('career.analyzing') : t('career.generateButton')}
                            </Button>
                        </div>
                    </div>

                    {/* Results Column */}
                    <div className="lg:col-span-3">
                        {result ? (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="border-4 border-black bg-blue-700 text-white p-6 shadow-[8px_8px_0px_0px_rgba(29,78,216,0.2)]">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-white text-blue-700 p-3 border-2 border-black shrink-0">
                                            <Sparkles className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black uppercase tracking-tight pb-2 border-b border-white/30">{t('career.strategyTitle')}</h3>
                                            <p className="mt-3 text-sm leading-relaxed font-medium">
                                                {result.summary}
                                            </p>
                                            {result.estimated_timeline && (
                                                <div className="mt-4 font-mono text-[10px] font-bold uppercase bg-white text-blue-700 inline-block px-2 py-0.5 border border-black">
                                                    {t('career.timelineLabel', { timeline: result.estimated_timeline })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-black uppercase tracking-tight border-b-2 border-black pb-1 inline-block">
                                            {t('career.actionPlanTitle')}
                                        </h3>
                                        <div className="space-y-6">
                                            {result.steps.map((step, i) => (
                                                <div key={i} className="flex gap-4 group">
                                                    <div className="flex-shrink-0 w-8 h-8 bg-black text-white flex items-center justify-center font-bold text-sm border border-black">
                                                        {i + 1}
                                                    </div>
                                                    <div className="pt-0.5">
                                                        <p className="font-bold text-base leading-tight group-hover:text-blue-700 transition-colors">
                                                            {typeof step === 'string' ? step : step.title}
                                                        </p>
                                                        {typeof step !== 'string' && step.description && (
                                                            <p className="text-xs text-gray-500 mt-1 font-medium">{step.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-lg font-black uppercase tracking-tight border-b-2 border-black pb-1 inline-block">
                                            {t('career.coreSkillsTitle')}
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {result.recommendedSkills.map((skill, i) => (
                                                <span
                                                    key={i}
                                                    className="bg-white border border-black px-3 py-1.5 font-mono text-[10px] font-bold uppercase shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-default"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="mt-12 p-6 border-2 border-black bg-[#F6F5EE] relative">
                                            <div className="absolute -top-3 left-4 bg-white border border-black px-2 py-0.5 font-mono text-[10px] font-bold uppercase">
                                                {t('career.tipTitle')}
                                            </div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <CheckCircle2 className="w-4 h-4 text-green-700" />
                                                <h4 className="font-bold uppercase text-xs">{t('career.tipSubTitle')}</h4>
                                            </div>
                                            <p className="text-xs text-gray-600 italic leading-relaxed">
                                                "Build depth before breadth. Achieve proficiency in {result.recommendedSkills[0] || 'core technologies'} before exploring the full roadmap."
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-black/20 bg-gray-50/50">
                                <Rocket className="w-12 h-12 text-gray-300 mb-4" />
                                <h3 className="text-lg font-bold uppercase tracking-tight text-gray-400">
                                    {t('career.awaitingInput')}
                                </h3>
                                <p className="text-[10px] font-mono mt-2 uppercase text-gray-400">
                                    // {t('career.roadmapWillAppear')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
