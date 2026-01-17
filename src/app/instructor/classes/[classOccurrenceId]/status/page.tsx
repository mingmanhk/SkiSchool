'use client'

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';

const STATUS_OPTIONS = [
    { value: 'meeting_point', label: 'At Meeting Point', color: 'bg-blue-500' },
    { value: 'on_lift', label: 'On Lift', color: 'bg-yellow-500' },
    { value: 'skiing', label: 'Skiing / Practice', color: 'bg-green-500' },
    { value: 'break', label: 'On Break / Lunch', color: 'bg-orange-500' },
    { value: 'returning', label: 'Returning to Base', color: 'bg-purple-500' },
    { value: 'dismissed', label: 'Class Dismissed', color: 'bg-gray-500' },
];

export default function ClassStatusPage() {
    const params = useParams();
    const classOccurrenceId = params.classOccurrenceId as string;
    
    const [loading, setLoading] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<string | null>(null);
    const supabase = createClient();
    const router = useRouter();

    const handleStatusUpdate = async (status: string) => {
        setLoading(true);
        try {
            // Optional: Get geolocation
            let location = { latitude: null, longitude: null };
            if (navigator.geolocation) {
                 // Wrap in promise to wait for location
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
                alert('Failed to update status');
            }

        } catch (error) {
            console.error(error);
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-center">Update Class Status</h1>
            
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
                        {loading && currentStatus === option.value ? 'Updating...' : option.label}
                    </button>
                ))}
            </div>

            {currentStatus && (
                <div className="mt-8 p-4 bg-gray-100 rounded-lg text-center">
                    <p className="text-gray-600">Last updated status:</p>
                    <p className="font-bold text-lg">{STATUS_OPTIONS.find(o => o.value === currentStatus)?.label}</p>
                </div>
            )}
        </div>
    );
}
