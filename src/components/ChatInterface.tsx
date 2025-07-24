"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Send,
  Bot,
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
  FileText,
  Sparkles,
} from "lucide-react";
import type { Patient } from "~/types";

interface ChatMessage {
  id: string;
  type: "user" | "ai" | "system";
  content: string;
  timestamp: Date;
  suggestions?: string[];
  priority?: "low" | "medium" | "high";
}

interface ChatInterfaceProps {
  patient: Patient;
  onPatientSelect: (patientId: string) => void;
}

export default function ChatInterface({
  patient,
  onPatientSelect,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "system",
      content: `已加载患者 ${patient.demographics.last_name}${patient.demographics.first_name} 的病历信息。我可以协助您进行临床决策分析。`,
      timestamp: new Date(),
    },
    {
      id: "2",
      type: "ai",
      content: "基于患者的症状和检查结果，我建议考虑以下诊断和检查：",
      timestamp: new Date(),
      suggestions: [
        "建议心电图检查",
        "考虑冠心病可能",
        "评估心血管风险因素",
        "建议血脂检查",
      ],
    },
  ]);

  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: newMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(newMessage, patient);
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (
    userInput: string,
    patient: Patient,
  ): ChatMessage => {
    const lowerInput = userInput.toLowerCase();

    if (lowerInput.includes("诊断") || lowerInput.includes("分析")) {
      return {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: `基于患者${patient.demographics.last_name}${patient.demographics.first_name}的临床表现：${patient.historyPresentIllness?.chief_complaint}，结合生命体征异常（血压${patient.vitals[0]?.blood_pressure_systolic}/${patient.vitals[0]?.blood_pressure_diastolic}mmHg），建议考虑以下诊断：\n\n1. **${patient.diagnoses[0]?.diagnosis_name}** (概率: ${patient.diagnoses[0]?.probability}%)\n   - 症状符合度高\n   - 需要进一步检查确认\n\n2. 高血压病\n   - 血压持续升高\n   - 需要评估靶器官损害`,
        timestamp: new Date(),
        suggestions: [
          "建议完善心电图",
          "考虑超声心动图",
          "评估肾功能",
          "制定治疗方案",
        ],
        priority: "high",
      };
    }

    if (lowerInput.includes("治疗") || lowerInput.includes("用药")) {
      return {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: `针对患者目前的诊断，建议以下治疗方案：\n\n**药物治疗：**\n• ${patient.medicines[0]?.medicine_name} ${patient.medicines[0]?.dosage} ${patient.medicines[0]?.frequency}\n• 监测血压变化\n\n**生活方式干预：**\n• 低盐饮食（<6g/天）\n• 适量运动\n• 戒烟限酒\n• 体重控制\n\n**随访计划：**\n• 1周后复查血压\n• 1个月后评估治疗效果`,
        timestamp: new Date(),
        suggestions: [
          "查看药物相互作用",
          "评估肝肾功能",
          "制定随访计划",
          "患者教育指导",
        ],
        priority: "medium",
      };
    }

    if (lowerInput.includes("检查") || lowerInput.includes("化验")) {
      return {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: `基于当前临床情况，建议完善以下检查：\n\n**必要检查：**\n• 心电图 - 评估心律和缺血改变\n• 胸片 - 排除肺部疾病\n• 血常规、生化全套\n• 甲状腺功能\n\n**可选检查：**\n• 超声心动图 - 评估心脏结构功能\n• 24小时动态血压监测\n• 运动负荷试验\n\n**已完成检查结果：**\n• ${patient.tests[0]?.test_name}: ${patient.tests[0]?.results?.join(", ")}`,
        timestamp: new Date(),
        suggestions: [
          "解读检查结果",
          "安排进一步检查",
          "评估风险分层",
          "制定监测计划",
        ],
        priority: "medium",
      };
    }

    // Default response
    return {
      id: (Date.now() + 1).toString(),
      type: "ai",
      content:
        "我理解您的问题。让我分析一下患者的情况并为您提供临床建议。您可以询问关于诊断、治疗、用药或检查的任何问题。",
      timestamp: new Date(),
      suggestions: [
        "分析诊断可能性",
        "推荐治疗方案",
        "建议检查项目",
        "评估预后风险",
      ],
    };
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
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-indigo-50 to-purple-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-indigo-600" />
            <div>
              <h3 className="font-semibold text-gray-900">CDSS 智能助手</h3>
              <p className="text-sm text-gray-600">临床决策支持系统</p>
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

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="space-y-2">
              <div
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex max-w-[80%] items-start space-x-2 ${
                    message.type === "user"
                      ? "flex-row-reverse space-x-reverse"
                      : ""
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      message.type === "user"
                        ? "bg-blue-600"
                        : message.type === "system"
                          ? "bg-gray-600"
                          : "bg-gradient-to-r from-indigo-600 to-purple-600"
                    }`}
                  >
                    {message.type === "user" ? (
                      <User className="h-4 w-4 text-white" />
                    ) : message.type === "system" ? (
                      <Activity className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>

                  {/* Message content */}
                  <div
                    className={`rounded-lg p-3 ${
                      message.type === "user"
                        ? "bg-blue-600 text-white"
                        : message.type === "system"
                          ? "bg-gray-100 text-gray-800"
                          : `${getPriorityColor(message.priority)} border`
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.type === "ai" && message.priority && (
                        <div className="mt-0.5">
                          {getPriorityIcon(message.priority)}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <p className="mt-1 text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString("zh-CN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              {message.suggestions && (
                <div
                  className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className="ml-10 max-w-[80%]">
                    <div className="flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="border-blue-200 bg-white text-xs text-blue-700 hover:bg-blue-50"
                        >
                          <Sparkles className="mr-1 h-3 w-3" />
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex max-w-[80%] items-start space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="rounded-lg bg-gray-100 p-3">
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

      {/* Quick Actions */}
      <div className="border-t border-b bg-gray-50 px-4 py-2">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSuggestionClick("分析当前诊断的可能性")}
            className="flex items-center space-x-1 text-xs"
          >
            <Stethoscope className="h-3 w-3" />
            <span>诊断分析</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSuggestionClick("推荐适合的治疗方案")}
            className="flex items-center space-x-1 text-xs"
          >
            <Pill className="h-3 w-3" />
            <span>治疗建议</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSuggestionClick("建议需要的检查项目")}
            className="flex items-center space-x-1 text-xs"
          >
            <TestTube className="h-3 w-3" />
            <span>检查建议</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSuggestionClick("评估患者预后和风险")}
            className="flex items-center space-x-1 text-xs"
          >
            <Heart className="h-3 w-3" />
            <span>风险评估</span>
          </Button>
        </div>
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="询问CDSS助手关于诊断、治疗或检查的问题..."
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isTyping}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-2 text-center text-xs text-gray-500">
          CDSS助手可以协助您进行临床决策，但不能替代医生的专业判断
        </div>
      </div>
    </div>
  );
}
