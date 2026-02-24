import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type ReturnReason = {
    id: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
};

const RETURN_REASONS: ReturnReason[] = [
    { id: 'damaged', label: 'Barang rusak saat diterima', icon: 'alert-circle-outline' },
    { id: 'wrong_item', label: 'Barang yang diterima salah', icon: 'swap-horizontal-outline' },
    { id: 'defective', label: 'Barang cacat/tidak berfungsi', icon: 'bug-outline' },
    { id: 'not_as_described', label: 'Tidak sesuai deskripsi', icon: 'document-text-outline' },
    { id: 'no_longer_needed', label: 'Tidak dibutuhkan lagi', icon: 'heart-dislike-outline' },
    { id: 'other', label: 'Alasan lainnya', icon: 'ellipsis-horizontal-circle-outline' },
];

type Props = {
    visible: boolean;
    onClose: () => void;
    onConfirm: (reason: string, description: string, images?: string[]) => void;
    isLoading?: boolean;
};

export default function ReturnRequestModal({ visible, onClose, onConfirm, isLoading = false }: Props) {
    const [selectedReason, setSelectedReason] = React.useState<string>('');
    const [description, setDescription] = React.useState('');
    const [images, setImages] = React.useState<string[]>([]);
    const [uploadingImages, setUploadingImages] = React.useState(false);

    const handlePickImage = async () => {
        if (images.length >= 3) {
            Alert.alert('Maksimal Foto', 'Anda hanya dapat melampirkan maksimal 3 foto.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 0.6,
        });

        if (!result.canceled && result.assets[0]) {
            const asset = result.assets[0];
            setUploadingImages(true);
            try {
                const fileName = `complaint_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
                const response = await fetch(asset.uri);
                const blob = await response.blob();

                const { data, error } = await supabase.storage
                    .from('returns')
                    .upload(fileName, blob, { contentType: 'image/jpeg' });

                if (error) throw error;

                const { data: urlData } = supabase.storage
                    .from('returns')
                    .getPublicUrl(data.path);

                setImages(prev => [...prev, urlData.publicUrl]);
            } catch (err) {
                console.error('Upload error:', err);
                Alert.alert('Gagal Upload', 'Tidak dapat mengunggah foto. Coba lagi.');
            } finally {
                setUploadingImages(false);
            }
        }
    };

    const handleRemoveImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleConfirm = () => {
        if (!selectedReason || description.trim().length < 10) {
            return;
        }
        onConfirm(selectedReason, description, images.length > 0 ? images : undefined);
        // Reset form
        setSelectedReason('');
        setDescription('');
        setImages([]);
    };

    const handleClose = () => {
        setSelectedReason('');
        setDescription('');
        setImages([]);
        onClose();
    };

    const isFormValid = selectedReason && description.trim().length >= 10;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <Pressable className="flex-1 justify-end bg-black/50" onPress={handleClose}>
                <Pressable className="bg-white rounded-t-3xl w-full max-h-[85%]" onPress={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <View className="px-6 pt-5 pb-4 border-b border-neutral-100">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-xl font-inter-semibold text-neutral-900">
                                Ajukan Komplain
                            </Text>
                            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                        <Text className="text-sm font-inter text-neutral-500 mt-2">
                            Beritahu kami masalah yang Anda alami
                        </Text>
                    </View>

                    <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false}>
                        {/* Return Reasons */}
                        <Text className="text-sm font-inter-semibold text-neutral-900 mb-3">
                            Alasan Komplain
                        </Text>
                        <View className="gap-2 mb-6">
                            {RETURN_REASONS.map((reason) => {
                                const isSelected = selectedReason === reason.id;
                                return (
                                    <TouchableOpacity
                                        key={reason.id}
                                        onPress={() => setSelectedReason(reason.id)}
                                        className={`flex-row items-center p-4 rounded-xl border-2 ${isSelected ? 'border-primary bg-primary/5' : 'border-neutral-200 bg-white'
                                            }`}
                                    >
                                        <View className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${isSelected ? 'border-primary' : 'border-neutral-300'
                                            }`}>
                                            {isSelected && (
                                                <View className="w-2.5 h-2.5 rounded-full bg-primary" />
                                            )}
                                        </View>
                                        <Ionicons
                                            name={reason.icon}
                                            size={20}
                                            color={isSelected ? Colors.primary.DEFAULT : '#9CA3AF'}
                                        />
                                        <Text className={`flex-1 ml-3 text-sm font-inter-medium ${isSelected ? 'text-primary' : 'text-neutral-700'
                                            }`}>
                                            {reason.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Description */}
                        <Text className="text-sm font-inter-semibold text-neutral-900 mb-3">
                            Deskripsi <Text className="text-error">*</Text>
                        </Text>
                        <View className="bg-neutral-50 rounded-xl border border-neutral-200 p-4 mb-2">
                            <TextInput
                                className="text-sm font-inter text-neutral-900 min-h-[100px]"
                                placeholder="Jelaskan masalah secara detail (min. 10 karakter)..."
                                placeholderTextColor="#9CA3AF"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                textAlignVertical="top"
                                maxLength={500}
                            />
                        </View>
                        <Text className="text-xs font-inter text-neutral-400 mb-4 text-right">
                            {description.length}/500
                        </Text>

                        {/* Image Upload */}
                        <Text className="text-sm font-inter-semibold text-neutral-900 mb-3">
                            Foto Bukti <Text className="text-neutral-400">(opsional, maks. 3)</Text>
                        </Text>
                        <View className="flex-row gap-3 mb-6">
                            {images.map((uri, index) => (
                                <View key={index} className="w-20 h-20 rounded-xl overflow-hidden border border-neutral-200">
                                    <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                                    <TouchableOpacity
                                        onPress={() => handleRemoveImage(index)}
                                        className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full items-center justify-center"
                                    >
                                        <Ionicons name="close" size={12} color="white" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            {images.length < 3 && (
                                <TouchableOpacity
                                    onPress={handlePickImage}
                                    disabled={uploadingImages}
                                    className="w-20 h-20 rounded-xl border-2 border-dashed border-neutral-300 items-center justify-center bg-neutral-50"
                                >
                                    {uploadingImages ? (
                                        <ActivityIndicator size="small" color={Colors.primary.DEFAULT} />
                                    ) : (
                                        <>
                                            <Ionicons name="camera-outline" size={24} color="#9CA3AF" />
                                            <Text className="text-[10px] text-neutral-400 mt-1">Tambah</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Return Policy Notice */}
                        <View className="bg-blue-50 rounded-xl p-4 mb-6 flex-row items-start gap-3">
                            <Ionicons name="information-circle-outline" size={20} color="#3B82F6" />
                            <View className="flex-1">
                                <Text className="text-sm font-inter-semibold text-blue-900 mb-1">
                                    Kebijakan Pengembalian
                                </Text>
                                <Text className="text-xs font-inter text-blue-700 leading-5">
                                    Pengembalian diterima dalam 7 hari setelah pengiriman. Barang harus dalam
                                    kondisi asli dan belum digunakan. Pengembalian dana diproses dalam 5-7 hari kerja.
                                </Text>
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View className="flex-row gap-3 pb-6">
                            <TouchableOpacity
                                onPress={handleClose}
                                disabled={isLoading}
                                className="flex-1 py-3.5 rounded-xl border border-neutral-300 items-center justify-center"
                            >
                                <Text className="text-sm font-inter-semibold text-neutral-700">
                                    Batal
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleConfirm}
                                disabled={!isFormValid || isLoading}
                                className={`flex-1 py-3.5 rounded-xl items-center justify-center ${!isFormValid || isLoading ? 'bg-neutral-300' : 'bg-primary'
                                    }`}
                            >
                                {isLoading ? (
                                    <Text className="text-sm font-inter-semibold text-white">
                                        Mengirim...
                                    </Text>
                                ) : (
                                    <Text className="text-sm font-inter-semibold text-white">
                                        Kirim Komplain
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
