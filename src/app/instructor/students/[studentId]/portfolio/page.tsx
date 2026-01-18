
'use client'

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';

export default function InstructorPortfolioPage({ params }: { params: Promise<{ studentId: string }> }) {
    const { studentId } = use(params);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleAddSkill = async (skillName: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/students/${studentId}/portfolio`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'skill', skill: skillName })
            });
            if (res.ok) {
                alert('Skill added!');
                router.refresh();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    
    // Hardcoded skill options for MVP
    const SKILL_OPTIONS = [
        "Pizza Wedge", "French Fry Parallel", "Hockey Stop", "Carving", "Parallel Turns", "Pole Plant"
    ];

    return (
        <div className="p-4 max-w-md mx-auto">
            <h1 className="text-xl font-bold mb-6">Update Student Portfolio</h1>
            
            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-3">Award Skill</h2>
                <div className="grid grid-cols-2 gap-3">
                    {SKILL_OPTIONS.map(skill => (
                        <button
                            key={skill}
                            onClick={() => handleAddSkill(skill)}
                            disabled={loading}
                            className="bg-white border border-blue-200 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-50 active:scale-95 transition"
                        >
                            {skill}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="mb-8">
                 <h2 className="text-lg font-semibold mb-3">Award Badge</h2>
                 <p className="text-gray-500 text-sm">Badge selection coming soon.</p>
            </div>

            <div className="p-4 bg-gray-50 rounded text-center">
                <a href={`/parent/children/${studentId}/portfolio`} className="text-blue-600 underline text-sm">
                    View Public Portfolio
                </a>
            </div>
        </div>
    )
}
