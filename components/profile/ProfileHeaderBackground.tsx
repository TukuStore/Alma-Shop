import React from 'react';
import { Dimensions, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');
const HEIGHT = 300; // Height of the background header area

export default function ProfileHeaderBackground() {
    return (
        <View className="absolute top-0 left-0 right-0 h-[320px] bg-primary overflow-hidden">
            <Svg width={width} height={HEIGHT} viewBox={`0 0 ${width} ${HEIGHT}`} preserveAspectRatio="xMidYMid slice">
                <Defs>
                    <LinearGradient id="paint0_linear_header_1" x1="-187.88" y1="346.386" x2="1011.31" y2="406.534" gradientUnits="userSpaceOnUse">
                        <Stop stopColor="white" stopOpacity="0.08" />
                        <Stop offset="1" stopColor="white" stopOpacity="0" />
                    </LinearGradient>
                    <LinearGradient id="paint1_linear_header_1" x1="117.348" y1="110.04" x2="689.227" y2="769.754" gradientUnits="userSpaceOnUse">
                        <Stop stopColor="white" stopOpacity="0.08" />
                        <Stop offset="1" stopColor="white" stopOpacity="0" />
                    </LinearGradient>

                    <LinearGradient id="paint0_linear_header_2" x1="-175.612" y1="171.286" x2="828.218" y2="297.72" gradientUnits="userSpaceOnUse">
                        <Stop stopColor="white" stopOpacity="0.08" />
                        <Stop offset="1" stopColor="white" stopOpacity="0" />
                    </LinearGradient>
                    <LinearGradient id="paint1_linear_header_2" x1="100.61" y1="-46.03" x2="548.665" y2="470.843" gradientUnits="userSpaceOnUse">
                        <Stop stopColor="white" stopOpacity="0.08" />
                        <Stop offset="1" stopColor="white" stopOpacity="0" />
                    </LinearGradient>

                    <LinearGradient id="paint0_linear_header_3" x1="178.307" y1="-72.8883" x2="714.238" y2="-6.14928" gradientUnits="userSpaceOnUse">
                        <Stop stopColor="white" stopOpacity="0.08" />
                        <Stop offset="1" stopColor="white" stopOpacity="0" />
                    </LinearGradient>
                    <LinearGradient id="paint1_linear_header_3" x1="325.539" y1="-188.691" x2="565.009" y2="87.5596" gradientUnits="userSpaceOnUse">
                        <Stop stopColor="white" stopOpacity="0.08" />
                        <Stop offset="1" stopColor="white" stopOpacity="0" />
                    </LinearGradient>
                </Defs>

                {/* Main Shapes - Positioned approx to match Figma "left-[-112.01px] top-[-274.73px]" etc relative to container */}
                {/* Ellipse 1 */}
                <Path
                    d="M314.272 -211.308C472.192 -29.1335 845.902 633.94 689.227 769.755C532.553 905.57 277.523 867.988 119.604 685.813C-38.3162 503.638 -39.3255 245.856 117.349 110.041C274.024 -25.7735 156.352 -393.483 314.272 -211.308Z"
                    fill="url(#paint0_linear_header_1)"
                    stroke="url(#paint1_linear_header_1)"
                    transform="translate(-50, -100) scale(0.8)" /* Adjusted for mobile view */
                />

                {/* Ellipse 3 */}
                <Path
                    d="M1003.19 289.568C1126.91 432.298 375.412 135.784 232.713 259.483C90.0139 383.183 189.985 579.115 66.2581 436.385C-57.469 293.654 -42.089 77.6697 100.61 -46.0301C243.309 -169.73 879.461 146.837 1003.19 289.568Z"
                    fill="url(#paint0_linear_header_2)"
                    stroke="url(#paint1_linear_header_2)"
                    transform="translate(-50, -50) scale(0.6)"
                />

                {/* Ellipse 2 */}
                <Path
                    d="M582.98 -169.937C649.108 -93.653 641.062 21.6324 565.009 87.5596C488.956 153.487 75.9216 1034.38 9.79385 958.092C-56.3339 881.808 249.486 -122.763 325.539 -188.691C401.592 -254.618 516.853 -246.222 582.98 -169.937Z"
                    fill="url(#paint0_linear_header_3)"
                    stroke="url(#paint1_linear_header_3)"
                    transform="translate(-100, -50) scale(0.7)"
                />
            </Svg>
        </View>
    );
}
