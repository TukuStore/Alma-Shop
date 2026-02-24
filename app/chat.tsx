import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'agent';
    time: string;
    status?: 'sent' | 'read';
    type?: 'text' | 'image';
    imageUrl?: string;
}

const QUICK_EMOJIS = ['😊', '👍', '📦', '❓', '🤔', '👋'];

export default function ChatScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);

    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        // Initial welcome message
        setMessages([
            {
                id: 'welcome',
                text: 'Halo! Selamat datang di Medina Store. Ada yang bisa saya bantu hari ini? 😊',
                sender: 'agent',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: 'text',
            }
        ]);
    }, []);

    useEffect(() => {
        // Auto-scroll to bottom when messages change
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages, isTyping]);

    const handleSend = async () => {
        const text = inputText.trim();
        if (!text) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            text: text,
            sender: 'user',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'sent',
            type: 'text',
        };

        setMessages((prev) => [...prev, newMessage]);
        setInputText('');
        setShowEmoji(false);
        setIsTyping(true);

        try {
            const { data, error } = await supabase.functions.invoke('chat-assistant', {
                body: { message: text },
            });

            if (error) throw error;

            const replyMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: data.reply || "Maaf, saya tidak mengerti.",
                sender: 'agent',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: 'text',
            };

            setMessages((prev) => [...prev, replyMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            if (error instanceof Error && 'context' in error) {
                // @ts-ignore
                console.error('Error context:', JSON.stringify(error.context, null, 2));
            }

            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: "Maaf, terjadi kesalahan saat menghubungi server. Mohon pastikan API Key sudah diset (lihat logs).",
                sender: 'agent',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: 'text',
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleAttachment = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'We need access to your photos to attach images.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                quality: 1,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const selectedImage = result.assets[0].uri;
                const newMessage: Message = {
                    id: Date.now().toString(),
                    text: 'Image attached',
                    sender: 'user',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    status: 'sent',
                    type: 'image',
                    imageUrl: selectedImage,
                };
                setMessages((prev) => [...prev, newMessage]);

                // For now, AI doesn't handle images, so just a canned reply
                setTimeout(() => {
                    const replyMessage: Message = {
                        id: Date.now().toString(),
                        text: "Maaf, saat ini saya belum bisa memproses gambar. Mohon kirimkan pertanyaan berupa teks saja ya. 🙏",
                        sender: 'agent',
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        type: 'text',
                    };
                    setMessages((prev) => [...prev, replyMessage]);
                }, 1000);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'An error occurred while picking the image.');
        }
    };

    const handleMenuAction = (action: 'clear' | 'end') => {
        setMenuVisible(false);
        if (action === 'clear') {
            Alert.alert('Clear Chat', 'Are you sure?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear', onPress: () => setMessages([]) }
            ]);
        } else if (action === 'end') {
            Alert.alert('End Chat', 'End this session?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'End', onPress: () => router.back() }
            ]);
        }
    };

    const renderItem = ({ item }: { item: Message }) => {
        const isUser = item.sender === 'user';
        return (
            <View className={`w-full flex-row ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
                <View
                    className={`max-w-[80%] p-3 ${isUser
                        ? 'bg-[#FF6B57] rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl'
                        : 'bg-[#F8FAFC] rounded-tl-2xl rounded-tr-2xl rounded-br-2xl'
                        }`}
                >
                    {item.type === 'image' && item.imageUrl ? (
                        <Image
                            source={{ uri: item.imageUrl }}
                            className="w-48 h-32 rounded-lg mb-2"
                            resizeMode="cover"
                        />
                    ) : (
                        <Text
                            className={`text-base ${isUser ? 'text-white' : 'text-[#121926]'} font-normal`}
                            style={{ fontFamily: 'Inter_400Regular', lineHeight: 24 }}
                        >
                            {item.text}
                        </Text>
                    )}

                    <View className={`flex-row items-center mt-1 gap-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <Text
                            className={`text-xs ${isUser ? 'text-white/80' : 'text-[#9AA4B2]'} font-normal`}
                            style={{ fontFamily: 'Inter_400Regular' }}
                        >
                            {item.time}
                        </Text>
                        {isUser && (
                            <Ionicons name="checkmark-done" size={16} color={item.status === 'read' ? 'white' : 'rgba(255,255,255,0.6)'} />
                        )}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-white">
            <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
                {/* Header */}
                <View className="flex-row items-center px-6 py-4 border-b border-gray-100 gap-4 z-10 bg-white">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 bg-[#FF6B57] rounded-full items-center justify-center"
                    >
                        <Ionicons name="arrow-back" size={20} color="white" />
                    </TouchableOpacity>

                    <View className="flex-1 flex-row items-center gap-3">
                        <View className="w-12 h-12 rounded-full overflow-hidden border border-gray-100">
                            <Image
                                source={{ uri: 'https://ui-avatars.com/api/?name=Via+Assistant&background=FFE8E5&color=FF6B57&size=128' }}
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                        </View>
                        <View>
                            <Text
                                className="text-[#121926] text-lg font-medium"
                                style={{ fontFamily: 'Inter_500Medium' }}
                            >
                                Via Shopping Assistant
                            </Text>
                            <Text
                                className="text-[#9AA4B2] text-sm"
                                style={{ fontFamily: 'Inter_400Regular' }}
                            >
                                {isTyping ? 'Sedang mengetik...' : 'Online'}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
                        <Ionicons name="ellipsis-vertical" size={24} color="#9AA4B2" />
                    </TouchableOpacity>

                    {/* Dropdown Menu */}
                    {menuVisible && (
                        <View className="absolute top-12 right-0 bg-white shadow-lg rounded-xl border border-gray-100 w-40 overflow-hidden">
                            <TouchableOpacity
                                onPress={() => handleMenuAction('clear')}
                                className="px-4 py-3 border-b border-gray-50 flex-row items-center gap-2"
                            >
                                <Ionicons name="trash-outline" size={18} color="#FF6B57" />
                                <Text className="text-[#121926] font-medium">Clear Chat</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleMenuAction('end')}
                                className="px-4 py-3 flex-row items-center gap-2"
                            >
                                <Ionicons name="close-circle-outline" size={18} color="#FF6B57" />
                                <Text className="text-[#121926] font-medium">End Chat</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Keyboard Avoiding View wrapper for Chat Body + Input */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    className="flex-1"
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
                >
                    {/* Chat Body */}
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => setMenuVisible(false)}
                        className="flex-1"
                    >
                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={{ padding: 24, paddingBottom: 20 }}
                            ListHeaderComponent={() => (
                                <View className="flex-row items-center justify-center gap-4 mb-6">
                                    <View className="flex-1 h-[1px] bg-[#E2E8F0]" />
                                    <Text className="text-[#9AA4B2] text-sm font-normal font-['Inter']">Hari Ini</Text>
                                    <View className="flex-1 h-[1px] bg-[#E2E8F0]" />
                                </View>
                            )}
                            renderItem={renderItem}
                            showsVerticalScrollIndicator={false}
                            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        />
                    </TouchableOpacity>

                    {/* Input Area */}
                    <View className="bg-white border-t border-[#F2F4F7]">
                        {/* Quick Emoji Bar */}
                        {showEmoji && (
                            <View className="flex-row items-center justify-around py-2 border-b border-[#F2F4F7] bg-gray-50">
                                {QUICK_EMOJIS.map((emoji) => (
                                    <TouchableOpacity key={emoji} onPress={() => setInputText(prev => prev + emoji)}>
                                        <Text className="text-2xl">{emoji}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        <View className="flex-row items-end gap-3 p-4">
                            <View className="flex-1 flex-row items-center bg-white border border-[#E2E8F0] rounded-full px-4 py-2.5 min-h-[48px]">
                                <TouchableOpacity
                                    className="mr-3"
                                    onPress={() => {
                                        setShowEmoji(!showEmoji);
                                        Keyboard.dismiss();
                                    }}
                                >
                                    <Ionicons name={showEmoji ? "keypad-outline" : "happy-outline"} size={24} color="#CDD5DF" />
                                </TouchableOpacity>
                                <TextInput
                                    className="flex-1 text-base text-[#121926] font-['Inter']"
                                    placeholder="Tulis pesan Anda..."
                                    placeholderTextColor="#CDD5DF"
                                    multiline
                                    value={inputText}
                                    onChangeText={setInputText}
                                    style={{ maxHeight: 100 }}
                                    onFocus={() => setShowEmoji(false)}
                                />
                                <TouchableOpacity className="ml-3" onPress={handleAttachment}>
                                    <Ionicons name="attach" size={24} color="#CDD5DF" />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                onPress={handleSend}
                                className="w-12 h-12 bg-[#FF6B57] rounded-full items-center justify-center shadow-sm"
                            >
                                <Ionicons name="send" size={20} color="white" style={{ marginLeft: 2 }} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}
