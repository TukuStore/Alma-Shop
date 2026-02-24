import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity } from 'react-native';

interface CheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    size?: number;
    disabled?: boolean;
}

export default function Checkbox({ checked, onChange, size = 20, disabled = false }: CheckboxProps) {
    return (
        <TouchableOpacity
            onPress={() => !disabled && onChange(!checked)}
            activeOpacity={0.8}
            className={`items-center justify-center rounded-[4px] border ${checked
                    ? 'bg-[#FF6B57] border-[#FF6B57]'
                    : 'bg-white border-neutral-200'
                }`}
            style={{ width: size, height: size }}
            disabled={disabled}
        >
            {checked && (
                <Ionicons name="checkmark" size={size * 0.7} color="white" />
            )}
        </TouchableOpacity>
    );
}
