import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload,
  Mic,
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
  FileText,
  Bell,
  Settings,
} from "lucide-react";

export default function NoticeForm() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [noticeTitle, setNoticeTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Call API to submit notice
      const formData = new FormData();
      formData.append("title", noticeTitle);
      formData.append("description", description);
      if (file) {
        formData.append("file", file);
      }

      //await authApi.student.submitNotice(formData);

      // Reset form
      setNoticeTitle("");
      setDescription("");
      setFile(null);

      // Show success message
      alert("Notice submitted successfully!");
    } catch (error) {
      alert("Error submitting notice");
    } finally {
      setIsSubmitting(false);
    }
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
                  { icon: Bell, label: "Notice Form", path: "/notice-form", active: true },
                  { icon: Settings, label: "CDGI Sahayak", path: "/cdgi-sahayak", active: false },
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

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm p-8">
              <h2 className="text-2xl font-bold mb-6">Submit Notice</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Notice Title */}
                <div>
                  <Label htmlFor="title" className="text-white/90 font-medium mb-2 block">
                    Notice Title
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Enter notice title"
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                    required
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description" className="text-white/90 font-medium mb-2 block">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your notice..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={5}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 resize-none"
                  />
                </div>

                {/* File Attachment */}
                <div>
                  <Label className="text-white/90 font-medium mb-2 block">
                    File Attachment (PDF/Image)
                  </Label>
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-yellow-500/50 transition-colors">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      id="file-input"
                    />
                    <label htmlFor="file-input" className="cursor-pointer block">
                      <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-slate-400 text-sm">
                        {file ? file.name : "Drag & drop or click to browse"}
                      </p>
                    </label>
                  </div>
                </div>

                {/* Audio Attachment */}
                <div>
                  <Label className="text-white/90 font-medium mb-2 block">
                    Audio Attachment (Voice Note)
                  </Label>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-slate-600 text-white hover:bg-slate-700/50 flex items-center gap-2"
                    >
                      <Mic className="w-4 h-4" />
                      Record
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-slate-600 text-white hover:bg-slate-700/50"
                    >
                      Or upload an audio file
                    </Button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting || !noticeTitle || !description}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 rounded-lg transition-all hover:scale-105 disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit Notice"}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
