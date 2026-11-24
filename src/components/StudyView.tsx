import React, { useMemo, useState } from 'react';
import {
  ChevronRight,
  BookOpen,
  Sparkles,
  Layers3,
  Search,
  X,
  Check,
  GraduationCap,
} from 'lucide-react';
import { Course } from '../data/coursesData';
import { BRAND_LOGO } from '../services/api';
import { NavSection } from './Sidebar';

interface StudyViewProps {
  courses: Course[];
  enrolledIds: Set<string>;
  selectedBatch: Course | null;
  onSelectStudyBatch: (course: Course) => void;
  onOpenCourse: (course: Course) => void;
  onNavigate: (nav: NavSection) => void;
}

export const StudyView: React.FC<StudyViewProps> = ({
  courses,
  enrolledIds,
  selectedBatch,
  onSelectStudyBatch,
  onOpenCourse,
  onNavigate,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSearch, setDrawerSearch] = useState('');

  const enrolledBatches = useMemo(
    () => courses.filter((c) => enrolledIds.has(c.id)),
    [courses, enrolledIds]
  );

  const activeBatch = useMemo(() => {
    if (selectedBatch && courses.some((c) => c.id === selectedBatch.id)) {
      return selectedBatch;
    }
    return enrolledBatches[0] || courses[0] || null;
  }, [selectedBatch, enrolledBatches, courses]);

  const drawerBatches = useMemo(() => {
    const list = enrolledBatches.length > 0 ? enrolledBatches : courses;
    const q = drawerSearch.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        (b.category && b.category.toLowerCase().includes(q)) ||
        (b.exams_covered && b.exams_covered.toLowerCase().includes(q))
    );
  }, [enrolledBatches, courses, drawerSearch]);

  return (
    <div className="space-y-6">
      {/* Purple Wave Header Card: Your Batch */}
      <div className="overflow-hidden rounded-xl border bg-background divshadow">
        <div
          className="bg-cover bg-center bg-no-repeat px-5 py-6 text-white sm:px-7 sm:py-8"
          style={{ backgroundImage: "url('/assets/img/descriptionHeader.svg')" }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-1.5">
              <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-white/80">
                YOUR BATCH
              </span>
              <h1 className="truncate text-xl font-bold sm:text-2xl">
                {activeBatch ? activeBatch.title : 'Select a batch to study'}
              </h1>
              <p className="text-xs text-white/85 sm:text-sm">
                {activeBatch
                  ? `${activeBatch.category || 'GB STUDY'} • ${activeBatch.exams_covered || 'All Exams'}`
                  : 'Choose any batch below to access lectures and PDF notes'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {activeBatch && (
                <button
                  type="button"
                  onClick={() => onOpenCourse(activeBatch)}
                  className="inline-flex items-center gap-2 rounded-lg bg-green-400 hover:bg-green-600 dark:bg-green-500 dark:hover:bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow transition-colors cursor-pointer"
                >
                  <GraduationCap className="h-4 w-4" />
                  <span>Open Batch</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 hover:bg-white/25 px-3.5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-colors cursor-pointer"
              >
                <span>Change Batch</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Start Learning / Batch Offerings */}
      <section className="space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#5a4bda] dark:text-[#29ff94]">
            START LEARNING
          </span>
          <h2 className="text-lg font-bold text-foreground sm:text-xl">
            Batch Offerings
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <button
            type="button"
            onClick={() => {
              if (activeBatch) {
                onOpenCourse(activeBatch);
              } else {
                onNavigate('batches');
              }
            }}
            className="group flex items-center justify-between gap-4 rounded-xl border bg-background p-5 text-left shadow-[0_6px_18px_rgba(15,23,42,0.05)] transition-all hover:shadow-md hover:border-[#7567ee]/50 dark:hover:border-[#3dc280]/50 cursor-pointer"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#7567ee]/10 text-[#5a4bda] dark:bg-[#3dc280]/10 dark:text-[#29ff94]">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground">All Classes</h3>
                <p className="text-xs text-muted-foreground truncate">
                  {activeBatch
                    ? `Lectures & PDFs in ${activeBatch.title}`
                    : 'Watch lectures & study notes'}
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('batches')}
            className="group flex items-center justify-between gap-4 rounded-xl border bg-background p-5 text-left shadow-[0_6px_18px_rgba(15,23,42,0.05)] transition-all hover:shadow-md hover:border-[#7567ee]/50 dark:hover:border-[#3dc280]/50 cursor-pointer"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-600 dark:text-green-400">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground">Explore All Batches</h3>
                <p className="text-xs text-muted-foreground">
                  Browse all {courses.length} free GB STUDY courses
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('mybatches')}
            className="group flex items-center justify-between gap-4 rounded-xl border bg-background p-5 text-left shadow-[0_6px_18px_rgba(15,23,42,0.05)] transition-all hover:shadow-md hover:border-[#7567ee]/50 dark:hover:border-[#3dc280]/50 cursor-pointer"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#7567ee]/10 text-[#5a4bda] dark:bg-[#3dc280]/10 dark:text-[#29ff94]">
                <Layers3 className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground">My Batches</h3>
                <p className="text-xs text-muted-foreground">
                  {enrolledBatches.length > 0
                    ? `${enrolledBatches.length} enrolled ${enrolledBatches.length === 1 ? 'batch' : 'batches'}`
                    : 'Manage your saved batches'}
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </section>

      {/* Quick Access Batches List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-foreground sm:text-xl">
            {enrolledBatches.length > 0 ? 'Your Enrolled Batches' : 'Recommended Batches'}
          </h2>
          <button
            type="button"
            onClick={() => onNavigate('batches')}
            className="text-xs sm:text-sm font-medium text-[#5a4bda] dark:text-[#29ff94] hover:underline cursor-pointer"
          >
            View all
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(enrolledBatches.length > 0 ? enrolledBatches : courses.slice(0, 6)).map((course) => (
            <button
              key={course.id}
              type="button"
              onClick={() => onOpenCourse(course)}
              className="group flex items-center gap-3.5 rounded-xl border bg-background p-3.5 text-left divshadow transition-all hover:shadow-md hover:border-[#7567ee]/50 dark:hover:border-[#3dc280]/50 cursor-pointer"
            >
              <img
                src={course.banner || BRAND_LOGO}
                alt={course.title}
                className="h-16 w-24 shrink-0 rounded-lg border bg-muted/30 object-contain"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = BRAND_LOGO;
                }}
              />
              <div className="min-w-0 flex-1">
                <span className="inline-block rounded bg-green-50 px-1.5 py-0.5 text-[10px] font-semibold text-green-600 dark:bg-green-500/20 dark:text-green-400 mb-1">
                  {course.category || 'FREE'}
                </span>
                <h3 className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-[#5a4bda] dark:group-hover:text-[#29ff94]">
                  {course.title}
                </h3>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>
      </section>

      {/* Right Slide-Over Drawer: Select Your Batch */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[80] flex justify-end">
          <div
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-[1px] transition-opacity"
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Select your batch"
            className="relative z-10 flex h-full w-full max-w-[410px] flex-col border-l bg-background text-foreground shadow-2xl animate-in slide-in-from-right duration-200"
          >
            <div className="flex items-center justify-between border-b p-4">
              <div>
                <h3 className="text-base font-bold">Select your batch</h3>
                <p className="text-xs text-muted-foreground">
                  {enrolledBatches.length > 0
                    ? `${enrolledBatches.length} enrolled batches`
                    : `Showing all ${courses.length} available batches`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                aria-label="Close drawer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="border-b p-3">
              <div className="relative">
                <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={drawerSearch}
                  onChange={(e) => setDrawerSearch(e.target.value)}
                  placeholder="Search batch..."
                  className="w-full rounded-md border bg-foreground/5 py-2 ps-9 pe-3 text-sm outline-none focus:ring-2 focus:ring-[#5a4bda]/40"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {drawerBatches.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No matching batches found.
                </div>
              ) : (
                drawerBatches.map((batch) => {
                  const isSelected = activeBatch?.id === batch.id;
                  return (
                    <button
                      key={batch.id}
                      type="button"
                      onClick={() => {
                        onSelectStudyBatch(batch);
                        setDrawerOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-[#5a4bda] bg-[#5a4bda]/5 dark:border-[#29ff94] dark:bg-[#29ff94]/5'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <img
                        src={batch.banner || BRAND_LOGO}
                        alt={batch.title}
                        className="h-11 w-16 shrink-0 rounded border bg-muted/30 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = BRAND_LOGO;
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-medium text-foreground">
                          {batch.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {batch.category || 'GB STUDY'}
                        </p>
                      </div>
                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          isSelected
                            ? 'border-[#5a4bda] bg-[#5a4bda] text-white dark:border-[#29ff94] dark:bg-[#29ff94] dark:text-black'
                            : 'border-muted-foreground/40'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
