import React from 'react';
import {
  Globe,
  MapPin,
  Flag,
  Building,
  Briefcase,
  Layers,
  Code,
  Palette,
  FileText,
  Mail,
  Mic,
  ShieldAlert,
  GitMerge,
  TrendingUp,
  CheckCircle2,
  Bookmark,
  ChevronRight,
  Bot,
  CreditCard,
  BellRing,
} from 'lucide-react';
import { MAIN_PANEL_BUTTONS } from '../data/platformsData';
import { PlatformCategory } from '../types';

interface LeftNavigationPanelProps {
  activeCategory: string;
  setActiveCategory?: (cat: string) => void;
  onSelectCategory?: (cat: string) => void;
  savedCount: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  isTrialExpired?: boolean;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Globe: <Globe className="w-4 h-4" />,
  Maple: <MapPin className="w-4 h-4 text-red-400" />,
  Flag: <Flag className="w-4 h-4 text-emerald-400" />,
  Building: <Building className="w-4 h-4 text-blue-400" />,
  Briefcase: <Briefcase className="w-4 h-4 text-amber-400" />,
  Layers: <Layers className="w-4 h-4 text-purple-400" />,
  Code: <Code className="w-4 h-4 text-cyan-400" />,
  Palette: <Palette className="w-4 h-4 text-pink-400" />,
  FileText: <FileText className="w-4 h-4 text-amber-300" />,
  Mail: <Mail className="w-4 h-4 text-amber-300" />,
  Mic: <Mic className="w-4 h-4 text-amber-300" />,
  ShieldAlert: <ShieldAlert className="w-4 h-4 text-rose-400" />,
  GitMerge: <GitMerge className="w-4 h-4 text-emerald-300" />,
  TrendingUp: <TrendingUp className="w-4 h-4 text-emerald-300" />,
  CheckCircle2: <CheckCircle2 className="w-4 h-4 text-amber-400" />,
  Bot: <Bot className="w-4 h-4 text-amber-300" />,
  CreditCard: <CreditCard className="w-4 h-4 text-amber-300" />,
  BellRing: <BellRing className="w-4 h-4 text-amber-300" />,
};

export const LeftNavigationPanel: React.FC<LeftNavigationPanelProps> = ({
  activeCategory,
  setActiveCategory,
  onSelectCategory,
  savedCount,
  isOpenMobile = false,
  onCloseMobile,
  isTrialExpired = false,
}) => {
  const handleSelect = (category: string) => {
    if (setActiveCategory) {
      setActiveCategory(category);
    } else if (onSelectCategory) {
      onSelectCategory(category);
    }
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Main Single Left Navigation Panel */}
      <aside
        id="single-left-navigation-panel"
        className={`fixed lg:sticky top-[57px] left-0 z-50 lg:z-10 w-72 h-[calc(100vh-57px)] bg-[#064E3B] dark:bg-emerald-950 border-r border-[#064E3B] text-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Panel Header */}
        <div className="p-4 border-b border-white/10 bg-black/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#FBBF24] rounded-lg flex items-center justify-center font-bold text-[#064E3B] text-lg shadow-sm">
              R
            </div>
            <div>
              <span className="text-sm font-bold uppercase tracking-wider text-white leading-tight block">
                Remote Jobs
              </span>
              <span className="text-xs font-bold text-[#FBBF24] block -mt-1">
                Platform
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FBBF24]/20 text-[#FBBF24] border border-[#FBBF24]/30">
            2026 Ready
          </span>
        </div>

        {/* Scrollable Buttons Panel */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1.5 custom-scrollbar">
          {/* Saved Platforms Button */}
          <button
            onClick={() => handleSelect('saved')}
            id="nav-btn-saved-platforms"
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition-all ${
              activeCategory === 'saved'
                ? 'bg-[#FBBF24] text-[#064E3B] font-bold shadow-lg ring-2 ring-[#FBBF24]/50'
                : 'text-white/80 hover:bg-white/10 hover:text-white font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Bookmark className={`w-4 h-4 ${activeCategory === 'saved' ? 'text-[#064E3B]' : 'text-[#FBBF24]'}`} />
              <span>Saved Boards</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeCategory === 'saved'
                  ? 'bg-[#064E3B] text-[#FBBF24]'
                  : 'bg-[#FBBF24] text-[#064E3B]'
              }`}
            >
              {savedCount}
            </span>
          </button>

          <div className="my-2 border-t border-white/10" />

          {/* Section Heading: Job Portals */}
          <div className="px-2 pt-1 pb-1 text-[10px] uppercase font-bold text-[#FBBF24] tracking-wider opacity-90">
            Job Portals & Regional Boards
          </div>

          {MAIN_PANEL_BUTTONS.filter((btn) =>
            [
              'global_boards',
              'national_canada',
              'national_nigeria',
              'national_ghana',
              'national_kenya',
              'national_uk',
              'national_usa',
              'freelance',
              'tech_startup',
              'creative',
            ].includes(btn.category)
          ).map((btn) => {
            const isActive = activeCategory === btn.category;
            return (
              <button
                key={btn.id}
                id={`nav-btn-${btn.id}`}
                onClick={() => handleSelect(btn.category)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition-all group ${
                  isActive
                    ? 'bg-[#FBBF24] text-[#064E3B] font-bold shadow-lg'
                    : 'text-white/80 hover:bg-white/10 hover:text-white font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`p-1.5 rounded-lg shrink-0 ${
                      isActive ? 'bg-[#064E3B] text-[#FBBF24]' : 'bg-white/10 text-emerald-200'
                    }`}
                  >
                    {ICON_MAP[btn.iconName] || <Globe className="w-4 h-4" />}
                  </div>
                  <div className="truncate">
                    <p className="truncate font-semibold">{btn.label}</p>
                    <p
                      className={`text-[10px] truncate ${
                        isActive ? 'text-[#064E3B]/80 font-medium' : 'text-emerald-200/70'
                      }`}
                    >
                      {btn.description}
                    </p>
                  </div>
                </div>
                {btn.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${
                      isActive
                        ? 'bg-[#064E3B] text-[#FBBF24]'
                        : 'bg-[#FBBF24] text-[#064E3B]'
                    }`}
                  >
                    {btn.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="my-2 border-t border-white/10" />

          {/* Section Heading: AI Career Tools & Trackers */}
          <div className="px-2 pt-1 pb-1 text-[10px] uppercase font-bold text-[#FBBF24] tracking-wider opacity-90">
            AI Tools & Career Visualizers
          </div>

          {MAIN_PANEL_BUTTONS.filter((btn) =>
            [
              'ai_resume',
              'ai_letter',
              'ai_interview',
              'scam_tips',
              'categories_roadmap',
              'salary_trends',
              'application_tracker',
              'job_alerts',
              'subscription_billing',
            ].includes(btn.category)
          ).map((btn) => {
            const isActive = activeCategory === btn.category;
            return (
              <button
                key={btn.id}
                id={`nav-btn-${btn.id}`}
                onClick={() => handleSelect(btn.category)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition-all group ${
                  isActive
                    ? 'bg-[#FBBF24] text-[#064E3B] font-bold shadow-lg'
                    : 'text-white/80 hover:bg-white/10 hover:text-white font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`p-1.5 rounded-lg shrink-0 ${
                      isActive ? 'bg-[#064E3B] text-[#FBBF24]' : 'bg-white/10 text-[#FBBF24]'
                    }`}
                  >
                    {ICON_MAP[btn.iconName] || <FileText className="w-4 h-4" />}
                  </div>
                  <div className="truncate">
                    <p className="truncate font-semibold">{btn.label}</p>
                    <p
                      className={`text-[10px] truncate ${
                        isActive ? 'text-[#064E3B]/80 font-medium' : 'text-emerald-200/70'
                      }`}
                    >
                      {btn.description}
                    </p>
                  </div>
                </div>
                {btn.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${
                      isActive
                        ? 'bg-[#064E3B] text-[#FBBF24]'
                        : 'bg-[#FBBF24] text-[#064E3B]'
                    }`}
                  >
                    {btn.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info badge */}
        <div className="p-3 border-t border-white/10 bg-black/20 text-[11px] text-white/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium">Cloud Synced</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#FBBF24]" />
        </div>
      </aside>
    </>
  );
};
