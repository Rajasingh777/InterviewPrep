import { useNavigate } from "react-router-dom";
import {
  MdPsychology as Brain,
  MdOutlinePreview as TargetIcon,
  MdBolt as Zap,
  MdGroups as Users,
  MdDownload as DownloadIcon,
  MdAutoAwesome as Sparkles,
} from "react-icons/md";

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: "AI-Generated Questions",
      description:
        "Get role-specific interview questions based on your profile and session settings.",
    },
    {
      icon: TargetIcon,
      title: "Focused Preparation",
      description:
        "Practice for technical, behavioral, or mixed interviews with topic targeting.",
    },
    {
      icon: Zap,
      title: "Detailed Explanations",
      description:
        "Review better, deeper answers so you can explain concepts confidently in interviews.",
    },
    {
      icon: Users,
      title: "Session Tracking",
      description:
        "Create multiple prep sessions, pin important items, and keep your workflow organized.",
    },
    {
      icon: DownloadIcon,
      title: "Download Support",
      description:
        "Export your full question sheet for revision and offline practice before interviews.",
    },
  ];

  const stats = [
    { label: "Question Types", value: "100+" },
    { label: "Prep Modes", value: "3" },
    { label: "Difficulty Levels", value: "Easy to Hard" },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#fff7ed_0%,_#ffedd5_35%,_#ffffff_75%)]">
      <div className="max-w-6xl mx-auto px-5 md:px-8 pt-16 pb-12">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              AI Interview Coach
            </span>

            <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mt-4">
              Crack Interviews With
              <span className="block bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 bg-clip-text text-transparent">
                Smarter Practice
              </span>
            </h1>

            <p className="text-slate-600 text-lg mt-5 max-w-xl">
              Generate role-based interview questions, revise detailed answers,
              pin important items, and export your full prep sheet before the
              real interview.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-7">
              <button
                onClick={() => navigate("/signup")}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3.5 rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all font-semibold"
              >
                Start Preparation
              </button>
              <button
                onClick={() => navigate("/login")}
                className="bg-white text-slate-800 px-8 py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all font-semibold"
              >
                Login
              </button>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur rounded-3xl border border-orange-100 shadow-xl p-6 md:p-8">
            <h3 className="text-slate-900 font-bold text-xl mb-5">Why this works better</h3>
            <div className="space-y-3">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <span className="text-slate-600">{item.label}</span>
                  <span className="font-bold text-orange-600">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-orange-100 to-amber-100 border border-orange-200">
              <p className="text-sm text-slate-700 font-medium">
                Tip: Start with 5 medium questions, then move to hard.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-slate-900">
            Everything You Need In One Prep Flow
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-slate-900 group-hover:text-orange-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="py-18 px-6 bg-gradient-to-r from-slate-900 via-slate-800 to-black">
        <div className="max-w-4xl mx-auto text-center py-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-5 text-white">
            Ready for your next interview round?
          </h2>
          <p className="text-slate-300 text-lg mb-8">
            Create your session, generate questions, and download your revision
            sheet in minutes.
          </p>
          <button
            onClick={() => navigate("/signup")}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-10 py-4 rounded-xl hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 font-bold text-lg"
          >
            Get Started For Free
          </button>
        </div>
      </div>

      <footer className="py-12 px-6 bg-gradient-to-r from-gray-900 to-black text-white">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
              NightSpider AI
            </h3>
            <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
              Copyright 2026 AI Interview Prep. Built for developers, by developers.
            </p>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <p className="text-sm text-gray-500">
              Powered by Gemini AI and optimized for technical interviews
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
