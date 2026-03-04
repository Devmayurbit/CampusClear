import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Send,
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
  FileText,
  Bell,
  Settings,
} from "lucide-react";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
}

export default function CDGISahayak() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content: "Namaste! 🙏 I'm CDGI Sahayak, your academic assistant. How can I help you today? Type 'help' to see all options.",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (userMessage: string): string => {
    const lowerCase = userMessage.toLowerCase();

    if (lowerCase.includes("help")) {
      return `I can help you with:\n\n1. No-Dues Status - Ask about your clearance status\n2. Form Information - Questions about forms\n3. Department Details - Information about departments\n4. Fee Information - Fee-related queries\n5. Document Requirements - What documents you need\n\nJust type your question!`;
    }

    if (lowerCase.includes("no-dues") || lowerCase.includes("clearance")) {
      return "Your No-Dues clearance status:\n\n✓ Library - Approved\n✓ Accounts - Approved\n⏳ Hostel - Pending\n⏳ Lab - Pending Verification\n\nOverall Progress: 40%\n\nContact the respective departments for updates on pending clearances.";
    }

    if (lowerCase.includes("form") || lowerCase.includes("document")) {
      return "Required documents for No-Dues clearance:\n\n1. Student ID Card\n2. Latest Semester Grade Sheet\n3. Fee Receipt\n4. Library Clearance Form\n5. Department Completion Certificate\n\nYou can submit these through the No-Dues Form section.";
    }

    if (lowerCase.includes("department") || lowerCase.includes("contact")) {
      return "Department Contact Information:\n\nComputer Science:\n📧 cs@cdgi.edu.in\n📞 +91-XXXXXXXXXX\n🏢 Block A, Room 205\n\nLibrary:\n📧 library@cdgi.edu.in\n📍 Central Library, Ground Floor";
    }

    if (lowerCase.includes("fee") || lowerCase.includes("payment")) {
      return "Fee Information:\n\nTuition Fee: ₹1,50,000/semester\nLab Fee: ₹5,000/semester\nLibrary Fee: ₹2,000/semester\nTotal: ₹1,57,000/semester\n\nPayment Methods:\n• Online Banking\n• Cheque\n• Cash\n\nContact Finance Department for payment details.";
    }

    return "I'm here to help! You can ask me about:\n- No-Dues status\n- Forms and documents\n- Department information\n- Fees and payments\n\nType 'help' for detailed options or ask your question!";
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate bot response delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: getBotResponse(inputValue),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <Card className="lg:col-span-1 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm h-fit">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">Student Panel</h3>
              <nav className="space-y-3">
                {[
                  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", active: false },
                  { icon: FileText, label: "No-Dues Form", path: "/nodues", active: false },
                  { icon: Bell, label: "Notice Form", path: "/notice-form", active: false },
                  { icon: Settings, label: "CDGI Sahayak", path: "/cdgi-sahayak", active: true },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setLocation(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                      item.active
                        ? "bg-yellow-500/20 border border-yellow-500/50 text-yellow-400"
                        : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                    {item.active && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </button>
                ))}
              </nav>
            </div>
          </Card>

          {/* Chat Container */}
          <div className="lg:col-span-3">
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="border-b border-slate-700/50 p-6">
                <h2 className="text-2xl font-bold">CDGI Sahayak</h2>
                <p className="text-slate-400 text-sm">Your academic assistant - Online</p>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-3 rounded-lg ${
                        msg.type === "user"
                          ? "bg-yellow-500/20 border border-yellow-500/50 text-white"
                          : "bg-slate-700/50 border border-slate-600/50 text-slate-200"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-xs mt-1 ${
                        msg.type === "user"
                          ? "text-yellow-400/60"
                          : "text-slate-500"
                      }`}>
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-700/50 border border-slate-600/50 px-4 py-3 rounded-lg">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-slate-700/50 p-6">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <Input
                    type="text"
                    placeholder="Ask CDGI Sahayak anything..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={isLoading}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={isLoading || !inputValue.trim()}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes bounce {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-bounce {
          animation: bounce 1.4s infinite;
        }
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
}
