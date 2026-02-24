"use client";

import { useEffect, useState } from "react";

export function FlashSaleCountdown() {
    const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 58, seconds: 43 });

    useEffect(() => {
        // Mock countdown from roughly 12 hours
        let totalSeconds = 12 * 3600 + 58 * 60 + 43;

        const timer = setInterval(() => {
            if (totalSeconds <= 0) {
                clearInterval(timer);
                return;
            }
            totalSeconds -= 1;
            setTimeLeft({
                hours: Math.floor(totalSeconds / 3600) % 24,
                minutes: Math.floor(totalSeconds / 60) % 60,
                seconds: totalSeconds % 60,
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex flex-row items-center justify-between mt-8 mb-4">
            <div className="flex flex-col">
                <h2 className="text-[22px] font-semibold text-neutral-900 tracking-tight leading-tight">Ended Before</h2>
                <p className="text-sm font-medium text-neutral-400 mt-1">Get it before your late</p>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
                <div className="flex flex-col items-center">
                    <div className="w-[52px] h-[52px] bg-red-50 rounded-[14px] flex items-center justify-center">
                        <span className="text-xl font-bold font-inter-bold text-[#FF3E38]">
                            {timeLeft.hours.toString().padStart(2, "0")}
                        </span>
                    </div>
                    <span className="text-[10px] sm:text-xs font-semibold text-[#FF3E38]/80 mt-1.5 uppercase tracking-wider">Hours</span>
                </div>

                <span className="text-neutral-300 font-bold text-xl self-start mt-2">:</span>

                <div className="flex flex-col items-center">
                    <div className="w-[52px] h-[52px] bg-red-50 rounded-[14px] flex items-center justify-center">
                        <span className="text-xl font-bold font-inter-bold text-[#FF3E38]">
                            {timeLeft.minutes.toString().padStart(2, "0")}
                        </span>
                    </div>
                    <span className="text-[10px] sm:text-xs font-semibold text-[#FF3E38]/80 mt-1.5 uppercase tracking-wider">Minutes</span>
                </div>

                <span className="text-neutral-300 font-bold text-xl self-start mt-2">:</span>

                <div className="flex flex-col items-center">
                    <div className="w-[52px] h-[52px] bg-red-50 rounded-[14px] flex items-center justify-center">
                        <span className="text-xl font-bold font-inter-bold text-[#FF3E38]">
                            {timeLeft.seconds.toString().padStart(2, "0")}
                        </span>
                    </div>
                    <span className="text-[10px] sm:text-xs font-semibold text-[#FF3E38]/80 mt-1.5 uppercase tracking-wider">Seconds</span>
                </div>
            </div>
        </div>
    );
}
