"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Send,
  User,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Activity,
  TestTube,
  Pill,
  Stethoscope,
  Brain,
  Heart,
} from "lucide-react";
import type { Patient } from "~/types";
import { cdssApi } from "~/lib/api";

interface ChatMessage {
  id: string;
  type: "user" | "ai" | "system";
  content: string;
  timestamp: Date;
  suggestions?: string[];
  priority?: "low" | "medium" | "high";
}

interface ChatInterfaceProps {
  patient: Patient | null;
  onPatientSelect: (patientId: string) => void;
  caseId: string; // Case ID for the current chat session
}

export default function ChatInterface({
  patient,
  onPatientSelect,
  caseId
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedMode, setSelectedMode] = useState("诊断分析");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [conversationId, setConversationId] = useState<string>("");
  const [disabled, setDisabled] = useState(true);

  // Initialize messages when patient data is loaded
  useEffect(() => {
    if (patient) {
      setMessages([]);
    }
  }, [patient]);

  async function startConversation() {
    if (!caseId) {
      return
    }
    try {
      const response = await cdssApi.initiateDialogue(caseId);
      setConversationId(response.data.conversation_id);
      setMessages([{
        id: Date.now().toString(),
        type: "ai",
        content: response.data.summary ?? '<AI response>',
        timestamp: new Date(),
        priority: 'medium',
      }])
      console.log("Conversation started with ID:", response.data.conversation_id);
    } catch (error) {
      console.error("Failed to start conversation:", error);
      throw new Error("Failed to start conversation");
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !patient) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: newMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setIsTyping(true);

    const aiResponse = await generateAIResponse(newMessage);
    setMessages((prev) => [...prev, aiResponse]);
    setIsTyping(false);
  };

  const generateAIResponse = async (
    userInput: string,
  ): Promise<ChatMessage> => {
      const req = await cdssApi.continueDialogue(conversationId, userInput);
      return {
        id: Date.now().toString(),
        type: "ai",
        content: req.data.summary ?? '<AI response>',
        timestamp: new Date(),
        priority: 'medium',
      }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setNewMessage(suggestion);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "border-red-200 bg-red-50";
      case "medium":
        return "border-yellow-200 bg-yellow-50";
      case "low":
        return "border-green-200 bg-green-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "medium":
        return <Lightbulb className="h-4 w-4 text-yellow-500" />;
      case "low":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Brain className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="flex h-full flex-col overflow-auto bg-white">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-purple-50 to-blue-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-indigo-600" />
            <div>
              <h3 className="font-semibold text-gray-900">CDSS 智能助手</h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge
              variant="outline"
              className="border-green-200 bg-green-100 text-green-800"
            >
              <div className="mr-1 h-2 w-2 rounded-full bg-green-500"></div>
              在线
            </Badge>
          </div>
        </div>
      </div>

      {/* Loading state when patient is null */}
      {!patient ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Loading patient data...
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Please wait while we fetch patient information
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 pr-2 pl-3">
            <div className="space-y-4">
              {messages.map((message, index) => {
                const isDoctor = message.type === "user";
                const isBot = message.type === "ai";
                const isSystem = message.type === "system";

                return (
                  <div
                    key={message.id}
                    className={`space-y-2 ${index === 0 ? "pt-4" : ""}`}
                  >
                    <div
                      className={`flex ${isDoctor ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex max-w-[80%] items-start space-x-2 ${
                          isDoctor ? "flex-row-reverse space-x-reverse" : ""
                        }`}
                      >
                        {/* Avatar */}
                        <div
                          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full ${
                            isDoctor
                              ? "bg-gray-100"
                              : isBot
                                ? "border border-gray-200 bg-white"
                                : "bg-gray-600"
                          }`}
                        >
                          {isDoctor ? (
                            <User className="h-4 w-4 text-gray-700" />
                          ) : isBot ? (
                            <img
                              src="/images/logo.png"
                              alt="yitong"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Activity className="h-4 w-4 text-white" />
                          )}
                        </div>

                        {/* Message Content */}
                        <div
                          className={`rounded-lg p-3 ${
                            isDoctor
                              ? "bg-gray-100 text-gray-800"
                              : isBot
                                ? "border border-gray-100 bg-white text-gray-900"
                                : "bg-gray-100 text-gray-800"
                          }`}
                          style={{ minWidth: 0 }}
                        >
                          <div className="flex items-start space-x-2">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm break-words whitespace-pre-wrap">
                                {message.content}
                              </p>
                              <p className="mt-1 text-xs opacity-70">
                                {message.timestamp?.toLocaleTimeString?.("zh-CN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex max-w-[80%] items-start space-x-2">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-white">
                      <img
                        src="/images/logo.png"
                        alt="Bot Logo"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="rounded-lg border border-gray-100 bg-white p-3">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                        <div
                          className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="bg-white p-4 pt-0.5">
            {/* Outer Input Container */}
            <div className="mb-3 rounded-lg border border-gray-300 bg-white p-3 focus-within:border-transparent focus-within:ring-1 focus-within:ring-gray-400">
              {/* Text Input */}
              <div className="mb-3">
                <input
                  value={newMessage}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewMessage(e.target.value)
                  }
                  placeholder="询问CDSS助手关于诊断、治疗或检查的问题..."
                  onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) =>
                    e.key === "Enter" && handleSendMessage()
                  }
                  className="w-full border-0 bg-transparent p-2 text-sm placeholder:text-gray-500 focus:border-0 focus:ring-0 focus:outline-none"
                />
              </div>

              {/* Bottom Row: Mode Selection (Left) + Send Button (Right) */}
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap items-center space-y-1.5 space-x-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => cdssApi.getRecommendedTests(caseId).then(num => alert(`推荐检查数量: ${num.data}`))}
                    className={`flex h-7 items-center space-x-1 px-2 text-xs select-none cursor-pointer bg-transparent text-gray-600`}
                  >
                    <TestTube className="h-3 w-3" />
                    <span>检查建议</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startConversation()}
                    className={`flex h-7 items-center space-x-1 px-2 text-xs select-none ${
                      conversationId
                        ? "cursor-default bg-gray-800 text-white"
                        : "cursor-pointer bg-transparent text-gray-600"
                    }`}
                  >
                    <Stethoscope className="h-3 w-3" />
                    <span>诊断分析</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => cdssApi.getRecommendedTreatments(caseId).then(num => alert(`推荐治疗数量: ${num.data}`))}
                    className={`flex h-7 items-center space-x-1 px-2 text-xs select-none cursor-pointer bg-transparent text-gray-600`}
                  >
                    <Pill className="h-3 w-3" />
                    <span>治疗建议</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMode("风险评估")}
                    className={`flex h-7 items-center space-x-1 px-2 text-xs select-none cursor-pointer bg-transparent text-gray-600`}
                  >
                    <Heart className="h-3 w-3" />
                    <span>风险评估</span>
                  </Button>
                </div>

                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isTyping}
                  className="flex h-8 w-8 content-center justify-center rounded-full bg-black px-4 text-white hover:bg-gray-800 disabled:bg-gray-300"
                >
                  <Send className="mr-1 h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-0.5 text-center text-[12px] text-gray-400">
              CDSS助手可以协助您进行临床决策，但不能替代医生的专业判断
            </div>
          </div>
        </>
      )}
    </div>
  );
}
