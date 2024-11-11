'use client';

import { SetStateAction, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import axios from 'axios';
import { Volume, Send, Moon, Sun, Bot } from 'lucide-react';
import { useTheme } from "next-themes";
import { Card, CardContent } from "@/components/ui/card";

interface Message {
  text: string;
  sender: 'user' | 'bot';
  audioUrl?: string;
}

export default function Component() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleSpeak = async (text: string) => {
    if (!text.trim()) return;
    
    try {
      setIsLoading(true);
      const response = await axios.post('/api/speak', { text });
      
      const audioData = response.data.audioData;
      const byteCharacters = atob(audioData.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      
      await audio.play();
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
    } catch (error) {
      console.error('Error generating speech:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (input.trim()) {
      const userMessage: Message = { 
        text: input, 
        sender: 'user' 
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      
      try {
        setIsLoading(true);
        const response = await axios.post('/api/chat', { message: input });
        
        const botMessage: Message = { 
          text: response.data.response,
          sender: 'bot'
        };
        
        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
        console.error('Error getting response:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100">
      <div className="fixed top-4 right-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
      
      <div className="container mx-auto max-w-4xl p-4">
        <div className="flex items-center justify-center gap-3 mb-8">
          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Personal AI Assistant
          </h1>
          <Bot className="h-8 w-8 text-purple-500 animate-bounce" />
        </div>
        
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl rounded-2xl">
          <CardContent className="p-6">
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-2xl p-4 ${
                        message.sender === 'user' 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                          : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      } shadow-lg backdrop-blur-sm`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm md:text-base leading-relaxed">{message.text}</p>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSpeak(message.text)}
                          disabled={isLoading}
                          className="h-8 w-8 text-white/90 hover:text-white hover:bg-white/10 rounded-full"
                        >
                          <Volume className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="relative flex items-center">
            <Input
              type="text"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-14 pr-20 pl-8 py-6 text-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-full focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500 focus:border-transparent shadow-lg"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              className="absolute right-3 w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transition-transform hover:scale-105"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
