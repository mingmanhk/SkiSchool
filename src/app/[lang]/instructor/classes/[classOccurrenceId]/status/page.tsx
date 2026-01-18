
'use client'

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/i18n/client';

export default function ClassStatusPage({ params }: { params: Promise<{ classOccurrenceId: string, lang: string }> }) {
    const { classOccurrenceId } = use(params);
    const { t } = useTranslation()
    const [loading, setLoading] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<string | null>(null);
    const router = useRouter();

    const STATUS_OPTIONS = [
        { value: 'meeting_point', label: t('instructor.status.meeting_point') || 'At Meeting Point', color: 'bg-blue-500' },
        { value: 'on_lift', label: t('instructor.status.on_lift') || 'On Lift', color: 'bg-yellow-500' },
        { value: 'skiing', label: t('instructor.status.skiing') || 'Skiing / Practice', color: 'bg-green-500' },
        { value: 'break', label: t('instructor.status.break') || 'On Break / Lunch', color: 'bg-orange-500' },
        { value: 'returning', label: t('instructor.status.returning') || 'Returning to Base', color: 'bg-purple-500' },
        { value: 'dismissed', label: t('instructor.status.dismissed') || 'Class Dismissed', color: 'bg-gray-500' },
    ];

    const handleStatusUpdate = async (status: string) => {
        setLoading(true);
        try {
            // Optional: Get geolocation
            let location = { latitude: null, longitude: null };
            if (navigator.geolocation) {
                 try {
                     const position: any = await new Promise((resolve, reject) => {
                         navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
                     });
                     location = {
                         latitude: position.coords.latitude,
                         longitude: position.coords.longitude
                     };
                 } catch (e) {
                     console.log("Could not get location", e);
                 }
            }

            const res = await fetch(`/api/classes/${classOccurrenceId}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status,
                    ...location
                })
            });

            if (res.ok) {
                setCurrentStatus(status);
                router.refresh();
            } else {
                alert(t('common.error'));
            }

        } catch (error) {
            console.error(error);
            alert(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-center">{t('instructor.status_update')}</h1>
            
            <div className="grid grid-cols-1 gap-4">
                {STATUS_OPTIONS.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => handleStatusUpdate(option.value)}
                        disabled={loading}
                        className={`
                            ${option.color} text-white font-bold py-4 px-6 rounded-xl shadow-lg
                            transform transition duration-200 active:scale-95
                            disabled:opacity-50 disabled:cursor-not-allowed
                            flex items-center justify-center text-lg
                        `}
                    >
                        {loading && currentStatus === option.value ? t('common.loading') : option.label}
                    </button>
                ))}
            </div>

            {currentStatus && (
                <div className="mt-8 p-4 bg-gray-100 rounded-lg text-center dark:bg-gray-800">
                    <p className="text-gray-600 dark:text-gray-300">{t('common.status')}:</p>
                    <p className="font-bold text-lg dark:text-white">{STATUS_OPTIONS.find(o => o.value === currentStatus)?.label}</p>
                </div>
            )}
        </div>
    );
}
