import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Rect as SvgRect } from 'react-native-svg';

const Brand400 = '#FF6B57';
const Brand200 = '#FFBFA5';
const Brand100 = '#FFD8C9';
const Brand50 = '#FFF0EA';
const Gray900 = '#101828';
const Gray500 = '#667085';

export default function EmptyCartIllustration() {
    return (
        <View style={{ width: 260, height: 260, position: 'relative' }}>
            {/* Background Blob - Approximated */}
            <View style={{ position: 'absolute', top: 40, left: 20 }}>
                <Svg width="220" height="200" viewBox="0 0 220 200" fill="none">
                    <Path d="M110 0 C170 0 220 50 220 110 C220 160 180 200 130 200 C70 200 0 150 0 90 C0 40 50 0 110 0 Z" fill={Brand50} />
                </Svg>
            </View>

            {/* Warehouse Shelving (Background) */}
            <View style={{ position: 'absolute', top: 80, left: 60 }}>
                <Svg width="140" height="120" viewBox="0 0 140 120" fill="none">
                    {/* Vertical Posts */}
                    <SvgRect x="10" y="0" width="4" height="120" fill={Gray500} />
                    <SvgRect x="126" y="0" width="4" height="120" fill={Gray500} />
                    {/* Horizontal Shelves */}
                    <SvgRect x="10" y="0" width="120" height="4" fill={Gray500} />
                    <SvgRect x="10" y="60" width="120" height="4" fill={Gray500} />
                    <SvgRect x="10" y="116" width="120" height="4" fill={Gray500} />

                    {/* Boxes on shelves */}
                    <SvgRect x="20" y="25" width="30" height="35" fill={Brand200} stroke={Gray900} strokeWidth={1} />
                    <SvgRect x="52" y="30" width="25" height="30" fill={Brand100} stroke={Gray900} strokeWidth={1} />

                    <SvgRect x="85" y="76" width="35" height="40" fill={Brand200} stroke={Gray900} strokeWidth={1} />
                    <SvgRect x="25" y="80" width="30" height="36" fill={Brand100} stroke={Gray900} strokeWidth={1} />
                </Svg>
            </View>

            {/* Character (Lady) - Stylized Representation */}
            <View style={{ position: 'absolute', top: 90, left: 100 }}>
                <Svg width="60" height="130" viewBox="0 0 60 130" fill="none">
                    {/* Legs */}
                    <Path d="M20 90 L15 130 H25 L28 90 Z" fill={Gray900} />
                    <Path d="M40 90 L45 130 H35 L32 90 Z" fill={Gray900} />
                    {/* Skirt */}
                    <Path d="M15 90 L20 60 H40 L45 90 H15 Z" fill={Gray900} />
                    {/* Torso */}
                    <Path d="M20 60 L20 30 H40 L40 60 H20 Z" fill="white" stroke={Gray900} strokeWidth={1} />
                    {/* Head */}
                    <Path d="M30 10 A10 10 0 1 0 30 30 A10 10 0 1 0 30 10 Z" fill="white" stroke={Gray900} strokeWidth={1} />
                    <Path d="M30 10 C20 10 20 25 20 25 L15 30 C15 30 20 40 30 40 C40 40 45 30 45 30 L40 25 C40 25 40 10 30 10 Z" fill={Gray900} />
                    {/* Arms holding box */}
                    <Path d="M20 40 L10 50" stroke={Gray900} strokeWidth={2} />
                    <Path d="M40 40 L50 50" stroke={Gray900} strokeWidth={2} />
                </Svg>
            </View>

            {/* Main Box in Front (Orange) */}
            <View style={{ position: 'absolute', top: 120, left: 125 }}>
                <Svg width="50" height="40" viewBox="0 0 50 40" fill="none">
                    <SvgRect x="0" y="0" width="50" height="40" fill={Brand400} stroke={Gray900} strokeWidth={1.5} />
                    {/* Box Flaps */}
                    <Path d="M0 0 L15 15 M50 0 L35 15" stroke={Gray900} strokeWidth={1} />
                </Svg>
            </View>

            {/* Hand Truck / Dolly */}
            <View style={{ position: 'absolute', top: 120, left: 180 }}>
                <Svg width="40" height="100" viewBox="0 0 40 100" fill="none">
                    <Path d="M10 100 V40 H30 V100" stroke={Gray900} strokeWidth={2} />
                    <Path d="M10 90 H30" stroke={Gray900} strokeWidth={2} />
                    <Path d="M5 100 H35" stroke={Gray900} strokeWidth={2} />
                </Svg>
            </View>
        </View>
    );
}
