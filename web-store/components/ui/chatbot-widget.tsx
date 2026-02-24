"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Loader2, MessageCircle, Send, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Halo! Saya asisten virtual Alma Shop. Ada yang bisa saya bantu hari ini?" }
    ]);
    const [inputMessage, setInputMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputMessage.trim() || isLoading) return;

        const userMsg: Message = { role: "user", content: inputMessage };
        setMessages(prev => [...prev, userMsg]);
        setInputMessage("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // Sending the entire history including the new user message
                body: JSON.stringify({ messages: [...messages, userMsg] }),
            });

            if (!response.ok) {
                throw new Error("Gagal mengambil respon");
            }

            const data = await response.json();

            setMessages(prev => [
                ...prev,
                { role: "assistant", content: data.reply }
            ]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [
                ...prev,
                { role: "assistant", content: "Maaf, sistem sedang sibuk. Silakan coba beberapa saat lagi." }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">

            {/* Chat Window */}
            {isOpen && (
                <Card className="w-[320px] sm:w-[380px] h-[500px] max-h-[calc(100vh-100px)] mb-4 shadow-xl border-border flex flex-col translate-y-0 opacity-100 transition-all">
                    <CardHeader className="p-4 border-b border-border bg-primary/5 flex flex-row items-center justify-between rounded-t-xl">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/20 p-2 rounded-full">
                                <Bot className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-base">Alma Assistant</CardTitle>
                                <p className="text-xs text-muted-foreground">Aktif melayani</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive">
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>

                    <CardContent className="flex-1 p-0 overflow-hidden relative">
                        <ScrollArea className="h-[370px] p-4 text-sm font-medium pr-3">
                            <div className="flex flex-col gap-4 pb-4">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
                                        <Avatar className="h-8 w-8 mt-1 border border-border shrink-0">
                                            <AvatarFallback className={msg.role === 'assistant' ? 'bg-primary/10 text-primary' : 'bg-muted text-foreground'}>
                                                {msg.role === 'assistant' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className={`p-3 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted/60 text-foreground border border-border/50 rounded-tl-sm'}`}>
                                            <p className="whitespace-pre-wrap leading-relaxed">
                                                {msg.content}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex gap-3 max-w-[85%] self-start">
                                        <Avatar className="h-8 w-8 mt-1 shrink-0">
                                            <AvatarFallback className="bg-primary/10 text-primary"><Bot className="h-4 w-4" /></AvatarFallback>
                                        </Avatar>
                                        <div className="p-4 rounded-2xl rounded-tl-sm bg-muted/60 border border-border/50 flex items-center justify-center">
                                            <span className="flex gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce"></span>
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>
                    </CardContent>

                    <CardFooter className="p-3 border-t border-border bg-background flex-shrink-0">
                        <form onSubmit={handleSendMessage} className="flex gap-2 w-full items-center">
                            <Input
                                placeholder="Ketik pesan..."
                                className="flex-1 focus-visible:ring-1 focus-visible:ring-primary border-muted-foreground/30 bg-muted/20"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                disabled={isLoading}
                            />
                            <Button type="submit" size="icon" disabled={!inputMessage.trim() || isLoading} className="shrink-0 rounded-full w-10 h-10 shadow-sm">
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 -ml-0.5" />}
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            )}

            {/* Toggle Button */}
            <Button
                size="icon"
                className="h-14 w-14 rounded-full shadow-2xl hover:scale-105 transition-transform"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-7 w-7" />}
            </Button>

        </div>
    );
}
