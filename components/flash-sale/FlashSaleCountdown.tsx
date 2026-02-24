import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <View className="items-center gap-1">
        <View
            className="w-12 h-12 rounded-2xl items-center justify-center"
            style={{ backgroundColor: '#FFF0F0' }} // Light pink background
        >
            <Text className="text-lg font-bold text-[#FF3E38] font-inter-bold">
                {value.toString().padStart(2, '0')}
            </Text>
        </View>
        <Text className="text-[10px] text-[#FF3E38]/60 font-inter-medium">
            {label}
        </Text>
    </View>
);

export default function FlashSaleCountdown({ targetDate }: { targetDate?: Date }) {
    // Default to 2 hours from now if no target date provided
    const [endTime] = useState(targetDate || new Date(Date.now() + 12 * 60 * 60 * 1000 + 58 * 60 * 1000 + 47 * 1000));
    const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 58, seconds: 47 });

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const difference = endTime.getTime() - now.getTime();

            if (difference <= 0) {
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
                clearInterval(interval);
                return;
            }

            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);

            setTimeLeft({ hours, minutes, seconds });
        }, 1000);

        return () => clearInterval(interval);
    }, [endTime]);

    return (
        <View className="mb-6 flex-row items-center justify-between">
            <View>
                <Text className="text-base text-neutral-900 font-bold font-inter-bold">
                    Ended Before
                </Text>
                <Text className="text-xs text-neutral-400 font-inter mt-1">
                    Get it before your late
                </Text>
            </View>

            <View className="flex-row items-center gap-2">
                <TimeBlock value={timeLeft.hours} label="Hours" />
                <Text className="text-neutral-300 font-bold mb-4">:</Text>
                <TimeBlock value={timeLeft.minutes} label="Minutes" />
                <Text className="text-neutral-300 font-bold mb-4">:</Text>
                <TimeBlock value={timeLeft.seconds} label="Seconds" />
            </View>
        </View>
    );
}
