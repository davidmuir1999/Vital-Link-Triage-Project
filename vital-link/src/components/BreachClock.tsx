"use client"

import { useEffect, useState } from "react";

type BreachClockProps = {
    admissionDate: Date;
}


export default function BreachClock({ admissionDate }: BreachClockProps ) {

    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    useEffect(() => {
        const fourHoursInMs = 4 * 60 * 60 * 1000;
        const breachTargetTime = new Date(admissionDate).getTime() + fourHoursInMs;

        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const difference = breachTargetTime - now;
            setTimeLeft(difference);
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(interval);
    }, [admissionDate]);

    if(timeLeft === null) return <span className="text-gray-400">Loading countdown...</span>;

    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    const isCritical = timeLeft <= 30 * 60 * 1000;
    const isWarning = timeLeft <= 60 * 60 * 1000;

    return (
        <div className={`font-mono text-sm font-bold ${isCritical ? "text-red-600 animate-pulse" : isWarning ? "text-orange-500" : "text-green-600"}`}>
            {hoursLeft > 0 ? `${hoursLeft}h ` : ""}
            {minutesLeft}m left
        </div>
    );
}