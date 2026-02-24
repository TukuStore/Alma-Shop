import { Colors } from '@/constants/theme';
import { walletService } from '@/services/walletService';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

export default function WalletCard() {
    const [isBalanceVisible, setIsBalanceVisible] = useState(false);
    const [balance, setBalance] = useState(0);

    useFocusEffect(
        React.useCallback(() => {
            walletService.fetchWallet().then(w => {
                if (w) setBalance(w.balance);
            });
        }, [])
    );

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push('/wallet')}
            className="w-full h-52 bg-primary rounded-[30px] overflow-hidden relative p-6 justify-between shadow-lg shadow-primary/40"
        >
            {/* Background SVGs (Keeping original Layout) */}
            <View className="absolute inset-0">
                <Svg width="100%" height="100%" viewBox="0 0 350 200" preserveAspectRatio="xMidYMid slice">
                    <Defs>
                        <LinearGradient id="paint0_linear_wallet_1" x1="-97.8596" y1="245.438" x2="528.275" y2="276.843" gradientUnits="userSpaceOnUse">
                            <Stop stopColor="white" stopOpacity="0.08" />
                            <Stop offset="1" stopColor="white" stopOpacity="0" />
                        </LinearGradient>
                        <LinearGradient id="paint1_linear_wallet_1" x1="61.5104" y1="122.034" x2="360.107" y2="466.492" gradientUnits="userSpaceOnUse">
                            <Stop stopColor="white" stopOpacity="0.08" />
                            <Stop offset="1" stopColor="white" stopOpacity="0" />
                        </LinearGradient>

                        <LinearGradient id="paint0_linear_wallet_2" x1="-82.1365" y1="128.631" x2="441.996" y2="194.646" gradientUnits="userSpaceOnUse">
                            <Stop stopColor="white" stopOpacity="0.08" />
                            <Stop offset="1" stopColor="white" stopOpacity="0" />
                        </LinearGradient>
                        <LinearGradient id="paint1_linear_wallet_2" x1="62.088" y1="15.1635" x2="296.032" y2="285.04" gradientUnits="userSpaceOnUse">
                            <Stop stopColor="white" stopOpacity="0.08" />
                            <Stop offset="1" stopColor="white" stopOpacity="0" />
                        </LinearGradient>

                        <LinearGradient id="paint0_linear_wallet_3" x1="93.3388" y1="26.5202" x2="373.166" y2="61.3668" gradientUnits="userSpaceOnUse">
                            <Stop stopColor="white" stopOpacity="0.08" />
                            <Stop offset="1" stopColor="white" stopOpacity="0" />
                        </LinearGradient>
                        <LinearGradient id="paint1_linear_wallet_3" x1="170.213" y1="-33.9441" x2="295.248" y2="110.295" gradientUnits="userSpaceOnUse">
                            <Stop stopColor="white" stopOpacity="0.08" />
                            <Stop offset="1" stopColor="white" stopOpacity="0" />
                        </LinearGradient>
                    </Defs>

                    {/* Ellipse 1 */}
                    <Path
                        d="M164.331 -45.7529C246.786 49.3666 441.912 395.579 360.107 466.492C278.302 537.406 145.143 517.783 62.6879 422.663C-19.7671 327.544 -20.2941 192.948 61.5109 122.034C143.316 51.121 81.8756 -140.872 164.331 -45.7529Z"
                        fill="url(#paint0_linear_wallet_1)"
                        stroke="url(#paint1_linear_wallet_1)"
                    />

                    {/* Ellipse 3 */}
                    <Path
                        d="M533.353 190.39C597.955 264.914 205.571 110.094 131.063 174.682C56.5555 239.27 108.754 341.572 44.1518 267.048C-20.4501 192.524 -12.4198 79.7512 62.0881 15.1635C136.596 -49.4242 468.751 115.866 533.353 190.39Z"
                        fill="url(#paint0_linear_wallet_2)"
                        stroke="url(#paint1_linear_wallet_2)"
                        scale={1}
                        transform="translate(50, 20)"
                    />

                    {/* Ellipse 2 */}
                    <Path
                        d="M304.632 -24.1523C339.159 15.6783 334.958 75.8725 295.248 110.295C255.538 144.718 39.8799 604.659 5.35246 564.829C-29.175 524.998 130.504 0.478763 170.213 -33.944C209.923 -68.3668 270.104 -63.9829 304.632 -24.1523Z"
                        fill="url(#paint0_linear_wallet_3)"
                        stroke="url(#paint1_linear_wallet_3)"
                        transform="translate(-50, 0)"
                    />
                </Svg>
            </View>

            {/* Content */}
            <View>
                <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-white text-lg font-inter-medium opacity-90">My Wallet</Text>
                    <TouchableOpacity onPress={() => router.push('/wallet/transactions')}>
                        <Text className="text-white text-xs font-inter opacity-80 underline">View Wallet History</Text>
                    </TouchableOpacity>
                </View>

                <View className="items-center mt-2">
                    <Text className="text-white text-base font-inter opacity-90 mb-2">My Balance</Text>
                    <View className="flex-row items-center gap-3">
                        {isBalanceVisible ? (
                            <Text className="text-white text-3xl font-inter-bold">
                                Rp {balance.toLocaleString('id-ID')}
                            </Text>
                        ) : (
                            <View className="flex-row gap-2">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <View key={i} className="w-5 h-5 rounded-full bg-white/90" />
                                ))}
                            </View>
                        )}
                        <TouchableOpacity onPress={(e) => { e.stopPropagation(); setIsBalanceVisible(!isBalanceVisible); }}>
                            <Ionicons name={isBalanceVisible ? "eye-outline" : "eye-off-outline"} size={22} color="white" />
                        </TouchableOpacity>
                    </View>
                    <Text className="text-white/70 text-[10px] mt-2 font-inter">Updated : {new Date().toLocaleDateString()}</Text>
                </View>
            </View>

            {/* Buttons */}
            <View className="flex-row gap-4 justify-center mt-2">
                <TouchableOpacity onPress={(e) => { e.stopPropagation(); /* Transfer */ }} className="flex-row items-center gap-2 px-5 py-2.5 rounded-full border border-white/40 bg-white/10 active:bg-white/20">
                    <Text className="text-white text-sm font-inter-medium">Transfer</Text>
                    <Ionicons name="send" size={14} color="white" />
                </TouchableOpacity>

                <TouchableOpacity onPress={(e) => { e.stopPropagation(); router.push('/wallet?action=topup'); }} className="flex-row items-center gap-2 px-5 py-2.5 rounded-full bg-white active:opacity-90">
                    <Text className="text-primary text-sm font-inter-medium">Top Up</Text>
                    <Ionicons name="add" size={16} color={Colors.primary.DEFAULT} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}
