import React, { useState, useMemo } from 'react';
import {
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Share2,
  CheckCircle2,
  Filter,
  Star,
  DollarSign,
  Globe,
  Tag,
  Copy,
  Check,
  Wifi,
  HardDrive,
} from 'lucide-react';
import { Platform, PlatformCategory } from '../types';
import { VoiceSearchButton } from './VoiceSearchButton';

interface PlatformListViewProps {
  platforms: Platform[];
  activeCategory: string;
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onSelectTag: (tag: string) => void;
  searchQuery: string;
}

export const PlatformListView: React.FC<PlatformListViewProps> = ({
  platforms,
  activeCategory,
  savedIds,
  onToggleSave,
  onSelectTag,
  searchQuery,
}) => {
  const [costFilter, setCostFilter] = useState<'All' | 'Free' | 'Paid' | 'Mixed'>('All');
  const [sortBy, setSortBy] = useState<'rating' | 'name' | 'category'>('rating');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter & Search Logic
  const filteredPlatforms = useMemo(() => {
    return platforms.filter((p) => {
      // Category Match
      let categoryMatch = true;
      if (activeCategory === 'saved') {
        categoryMatch = savedIds.includes(p.id);
      } else if (activeCategory) {
        categoryMatch = p.category === activeCategory;
      }

      // Search Query
      let searchMatch = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        searchMatch =
          p.name.toLowerCase().includes(q) ||
          p.bestFor.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.regionFocus.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q));
      }

      // Cost Filter
      let costMatch = true;
      if (costFilter !== 'All') {
        costMatch = p.costToJobSeeker === costFilter;
      }

      return categoryMatch && searchMatch && costMatch;
    });
  }, [platforms, activeCategory, savedIds, searchQuery, costFilter]);

  // Sorted Platforms
  const sortedPlatforms = useMemo(() => {
    return [...filteredPlatforms].sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return a.category.localeCompare(b.category);
    });
  }, [filteredPlatforms, sortBy]);

  const handleShare = async (platform: Platform) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: platform.name,
          text: `Check out ${platform.name} for remote job opportunities: ${platform.bestFor}`,
          url: platform.website,
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }
    navigator.clipboard.writeText(platform.website);
    setCopiedId(platform.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryTitle = () => {
    if (activeCategory === 'saved') return '🔖 Saved Remote Platforms';
    if (activeCategory === 'global_boards') return '🌍 Global Remote Job Boards';
    if (activeCategory === 'national_canada') return '🇨🇦 Canada Remote Job Boards';
    if (activeCategory === 'national_nigeria') return '🇳🇬 Nigeria Remote Job Opportunities';
    if (activeCategory === 'national_ghana') return '🇬🇭 Ghana Remote Opportunities';
    if (activeCategory === 'national_kenya') return '🇰🇪 Kenya Remote Opportunities';
    if (activeCategory === 'national_uk') return '🇬🇧 United Kingdom Remote Boards';
    if (activeCategory === 'national_usa') return '🇺🇸 USA Remote Job Portals';
    if (activeCategory === 'freelance') return '💼 Freelance & Gig Marketplaces';
    if (activeCategory === 'tech_startup') return '💻 Tech & Startup Remote Portals';
    if (activeCategory === 'creative') return '🎨 Creative & Content Design Boards';
    return 'All Aggregated Remote Platforms';
  };

  return (
    <div className="space-y-4">
      {/* Category Header & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-[#064E3B] dark:text-emerald-100 flex items-center gap-2">
              {getCategoryTitle()}
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FBBF24]/20 text-[#064E3B] dark:text-[#FBBF24] border border-[#FBBF24]/40">
                {sortedPlatforms.length} Available
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
              Hand-screened, 100% verified 2026 remote job platforms with direct employer links.
            </p>
          </div>

          {/* Quick Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* PWA Cache Offline Indicator */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[#064E3B] dark:text-emerald-200 text-xs font-extrabold">
              <HardDrive className="w-3.5 h-3.5 text-amber-500" />
              <span>PWA Offline Cache Active</span>
            </div>

            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-slate-800 p-1 rounded-xl text-xs border border-gray-100 dark:border-slate-700">
              <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
              {(['All', 'Free', 'Paid'] as const).map((cost) => (
                <button
                  key={cost}
                  onClick={() => setCostFilter(cost)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    costFilter === cost
                      ? 'bg-[#FBBF24] text-[#064E3B] shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-[#064E3B] dark:hover:text-white'
                  }`}
                >
                  {cost}
                </button>
              ))}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#FBBF24]"
            >
              <option value="rating">Sort: Top Rated ⭐</option>
              <option value="name">Sort: Name (A-Z)</option>
              <option value="category">Sort: Category</option>
            </select>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {sortedPlatforms.length === 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-dashed border-[#064E3B]/20">
          <Globe className="w-12 h-12 text-[#064E3B] dark:text-[#FBBF24] mx-auto mb-3 animate-bounce" />
          <h3 className="text-base font-bold text-[#064E3B] dark:text-slate-200">
            No platforms found for your selection
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            Try adjusting your search query, switching cost filters, or clearing active keyword tags.
          </p>
        </div>
      )}

      {/* Platform Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedPlatforms.map((platform) => {
          const isSaved = savedIds.includes(platform.id);
          return (
            <div
              key={platform.id}
              id={`platform-card-${platform.id}`}
              className="group bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 hover:border-[#FBBF24] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Card Top Row: Name, Verified Badge, Rating */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-base font-bold text-[#064E3B] dark:text-emerald-100 group-hover:text-emerald-700 dark:group-hover:text-[#FBBF24] transition-colors flex items-center gap-1.5">
                      {platform.name}
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    </h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                      {platform.bestFor}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-[#FBBF24]/40 text-[#064E3B] dark:text-[#FBBF24] text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-[#FBBF24] text-[#FBBF24]" />
                    {platform.rating || 4.8}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed my-2">
                  {platform.shortDescription}
                </p>

                {/* Region & Cost Info */}
                <div className="flex flex-wrap items-center gap-2 my-3 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                    <Globe className="w-3 h-3 text-[#064E3B]" />
                    {platform.regionFocus}
                  </span>

                  <span
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold ${
                      platform.costToJobSeeker === 'Free'
                        ? 'bg-emerald-50 text-[#064E3B] dark:bg-emerald-950/80 dark:text-emerald-300'
                        : 'bg-amber-50 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300'
                    }`}
                  >
                    <DollarSign className="w-3 h-3" />
                    {platform.costToJobSeeker} to Seeker
                  </span>

                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-[#064E3B] dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold border border-emerald-100">
                    {platform.verifiedStatus}
                  </span>
                </div>

                {/* Interactive Skill Tags */}
                <div className="flex flex-wrap items-center gap-1.5 my-3">
                  <Tag className="w-3 h-3 text-slate-400" />
                  {platform.tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => onSelectTag(tag)}
                      className="px-2.5 py-0.5 text-[10px] rounded-md bg-gray-100 dark:bg-slate-800 hover:bg-[#FBBF24] hover:text-[#064E3B] text-slate-600 dark:text-slate-300 font-bold transition-all"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="pt-3 mt-2 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {/* Bookmark Save Button */}
                  <button
                    onClick={() => onToggleSave(platform.id)}
                    id={`bookmark-btn-${platform.id}`}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all ${
                      isSaved
                        ? 'bg-[#FBBF24] text-[#064E3B] border-[#FBBF24] shadow-xs'
                        : 'bg-gray-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-gray-200 dark:border-slate-700 hover:bg-gray-100'
                    }`}
                    title={isSaved ? 'Remove from Saved' : 'Save Platform'}
                  >
                    {isSaved ? <BookmarkCheck className="w-4 h-4 fill-[#064E3B]" /> : <Bookmark className="w-4 h-4 text-slate-500" />}
                    <span className="text-xs hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
                  </button>

                  {/* Share / Copy Button */}
                  <button
                    onClick={() => handleShare(platform)}
                    id={`share-btn-${platform.id}`}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
                    title="Share Official Platform Link"
                  >
                    {copiedId === platform.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Share2 className="w-4 h-4 text-slate-500" />
                    )}
                    <span className="text-xs hidden sm:inline">
                      {copiedId === platform.id ? 'Copied' : 'Share'}
                    </span>
                  </button>
                </div>

                {/* Official Website Direct Button */}
                <a
                  href={platform.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  id={`official-link-${platform.id}`}
                  className="px-4 py-2 rounded-lg bg-[#064E3B] hover:bg-[#043e2f] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all hover:scale-102"
                >
                  <span>Apply Now</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#FBBF24]" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
