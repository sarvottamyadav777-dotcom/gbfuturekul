import React, { useEffect, useMemo, useState } from 'react';
import {
  Play,
  FileText,
  Folder,
  ChevronRight,
  ArrowLeft,
  Clock3,
  Search,
  ExternalLink,
  Download,
  BookOpen,
  Globe,
  CalendarCheck2,
  BookmarkPlus,
  PinOff,
  Send,
  Radio,
  X,
} from 'lucide-react';
import { Course } from '../data/coursesData';
import { CourseDetail, LectureItem, PdfItem } from '../data/courseDetailsData';
import { fetchCourseDetails, BRAND_LOGO, cleanHTML } from '../services/api';
import { addLectureToHistory, addNoteToHistory } from '../services/storage';

interface CourseDetailViewProps {
  course: Course;
  enrolled: boolean;
  onEnroll: (course: Course) => void;
  onUnenroll: (course: Course) => void;
  onPlayLecture: (lec: LectureItem, allLectures: LectureItem[]) => void;
  onOpenTelegramModal: () => void;
}

type CourseTab = 'overview' | 'lectures' | 'notes';

export const CourseDetailView: React.FC<CourseDetailViewProps> = ({
  course,
  enrolled,
  onEnroll,
  onUnenroll,
  onPlayLecture,
  onOpenTelegramModal,
}) => {
  const [activeTab, setActiveTab] = useState<CourseTab>('lectures');
  const [isLoading, setIsLoading] = useState(true);
  const [courseData, setCourseData] = useState<CourseDetail>({
    freeClasses: [],
    paidClasses: [],
    pdfs: [],
  });

  // Folder drill-down states: null = folder grid view; '__ALL__' = all items; string = specific subject
  const [selectedLectureFolder, setSelectedLectureFolder] = useState<string | null>(null);
  const [selectedPdfFolder, setSelectedPdfFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setSelectedLectureFolder(null);
    setSelectedPdfFolder(null);
    setSearchQuery('');

    fetchCourseDetails(course.id)
      .then((data) => {
        if (isMounted) {
          setCourseData(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load course details:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [course.id]);

  const combinedLectures = useMemo(() => {
    const list = [...courseData.freeClasses, ...courseData.paidClasses];
    return list.sort((a, b) => (a.priority || 999) - (b.priority || 999));
  }, [courseData]);

  // Group lectures by subject folder
  const lectureSubjects = useMemo(() => {
    const counts = new Map<string, number>();
    combinedLectures.forEach((l) => {
      const sub = (l.subject || 'General').trim() || 'General';
      counts.set(sub, (counts.get(sub) || 0) + 1);
    });
    return Array.from(counts.entries()).map(([name, count]) => ({ name, count }));
  }, [combinedLectures]);

  // Group PDFs by subject folder
  const pdfSubjects = useMemo(() => {
    const counts = new Map<string, number>();
    courseData.pdfs.forEach((p) => {
      const sub = (p.subject || 'Study Notes').trim() || 'Study Notes';
      counts.set(sub, (counts.get(sub) || 0) + 1);
    });
    return Array.from(counts.entries()).map(([name, count]) => ({ name, count }));
  }, [courseData.pdfs]);

  // Filtered lectures for active folder or search
  const visibleLectures = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return combinedLectures.filter((l) => {
      const sub = (l.subject || 'General').trim() || 'General';
      const matchesFolder =
        q.length > 0 ||
        selectedLectureFolder === '__ALL__' ||
        (selectedLectureFolder !== null &&
          sub.toLowerCase() === selectedLectureFolder.toLowerCase());

      if (!matchesFolder) return false;
      if (!q) return true;
      return (
        l.title.toLowerCase().includes(q) ||
        (l.teacher && l.teacher.toLowerCase().includes(q)) ||
        sub.toLowerCase().includes(q)
      );
    });
  }, [combinedLectures, selectedLectureFolder, searchQuery]);

  // Filtered PDFs for active folder or search
  const visiblePdfs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return courseData.pdfs.filter((p) => {
      const sub = (p.subject || 'Study Notes').trim() || 'Study Notes';
      const matchesFolder =
        q.length > 0 ||
        selectedPdfFolder === '__ALL__' ||
        (selectedPdfFolder !== null &&
          sub.toLowerCase() === selectedPdfFolder.toLowerCase());

      if (!matchesFolder) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        (p.teacher && p.teacher.toLowerCase().includes(q)) ||
        sub.toLowerCase().includes(q)
      );
    });
  }, [courseData.pdfs, selectedPdfFolder, searchQuery]);

  const handleWatchLecture = (lec: LectureItem) => {
    addLectureToHistory(course, lec);
    onPlayLecture(lec, combinedLectures);
  };

  const handleOpenNote = (pdf: PdfItem) => {
    addNoteToHistory(course, pdf);
  };

  const showLectureGrid =
    searchQuery.trim().length > 0 ||
    selectedLectureFolder !== null ||
    lectureSubjects.length <= 1;

  const showPdfGrid =
    searchQuery.trim().length > 0 ||
    selectedPdfFolder !== null ||
    pdfSubjects.length <= 1;

  const displayedLectures =
    lectureSubjects.length <= 1 && selectedLectureFolder === null && !searchQuery.trim()
      ? combinedLectures
      : visibleLectures;

  const displayedPdfs =
    pdfSubjects.length <= 1 && selectedPdfFolder === null && !searchQuery.trim()
      ? courseData.pdfs
      : visiblePdfs;

  return (
    <div className="space-y-6">
      {/* Course Wave Header + Tabs Container */}
      <div className="overflow-hidden rounded-[20px_20px_12px_12px] border bg-background divshadow">
        {/* Purple SVG Wave Banner */}
        <div
          className="bg-cover bg-center bg-no-repeat px-4 py-6 sm:px-6 sm:py-7"
          style={{ backgroundImage: "url('/assets/img/descriptionHeader.svg')" }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2 px-2">
                <span className="rounded bg-white/20 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                  {course.category || 'GB STUDY'}
                </span>
                <span className="rounded bg-green-500 px-2 py-0.5 text-[11px] font-semibold text-white">
                  100% Free
                </span>
              </div>
              <h1 className="p-2 text-xl font-bold text-white sm:text-2xl">
                {course.title}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2 px-2 shrink-0">
              {enrolled ? (
                <button
                  type="button"
                  onClick={() => onUnenroll(course)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-red-700 transition-colors cursor-pointer"
                >
                  <PinOff className="h-4 w-4" />
                  <span>Unenroll</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onEnroll(course)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-green-400 px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-green-600 dark:bg-green-500 dark:hover:bg-green-600 transition-colors cursor-pointer"
                >
                  <BookmarkPlus className="h-4 w-4" />
                  <span>Enroll Now</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex min-w-0 w-full items-center overflow-x-auto border-t bg-background px-2 sm:px-4 no-scrollbar">
          <button
            type="button"
            onClick={() => {
              setActiveTab('overview');
              setSearchQuery('');
            }}
            className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border-b-4 rounded border-[#7567ee] text-[#5a4bda] dark:border-[#3dc280] dark:text-[#29ff94] font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Overview
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('lectures');
              setSearchQuery('');
            }}
            className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'lectures'
                ? 'border-b-4 rounded border-[#7567ee] text-[#5a4bda] dark:border-[#3dc280] dark:text-[#29ff94] font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Lectures ({combinedLectures.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('notes');
              setSearchQuery('');
            }}
            className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'notes'
                ? 'border-b-4 rounded border-[#7567ee] text-[#5a4bda] dark:border-[#3dc280] dark:text-[#29ff94] font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            PDF Notes ({courseData.pdfs.length})
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border bg-background p-5 divshadow sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <img
                  src={course.banner || BRAND_LOGO}
                  alt={course.title}
                  className="aspect-video w-full sm:w-56 shrink-0 rounded-lg border bg-muted/30 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = BRAND_LOGO;
                  }}
                />
                <div className="space-y-2.5 flex-1">
                  <h2 className="text-lg font-bold text-foreground">
                    About This Batch
                  </h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {cleanHTML(course.short_description) ||
                      'Complete exam preparation batch with full chapter-wise video classes and downloadable handwritten PDF notes provided free on GB STUDY.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
                <div className="rounded-lg border bg-foreground/[0.02] p-3.5">
                  <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <BookOpen className="h-3.5 w-3.5 text-[#5a4bda] dark:text-[#29ff94]" />
                    <span>Exams Covered</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {course.exams_covered || 'All Competitive Exams'}
                  </p>
                </div>

                <div className="rounded-lg border bg-foreground/[0.02] p-3.5">
                  <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Globe className="h-3.5 w-3.5 text-[#5a4bda] dark:text-[#29ff94]" />
                    <span>Language</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {course.language || 'Hindi + Hinglish'}
                  </p>
                </div>

                <div className="rounded-lg border bg-foreground/[0.02] p-3.5">
                  <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarCheck2 className="h-3.5 w-3.5 text-[#5a4bda] dark:text-[#29ff94]" />
                    <span>Validity</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {course.duration || '1 Year Validity'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border bg-background p-5 divshadow space-y-4">
              <h3 className="text-base font-bold text-foreground">Batch Content</h3>
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('lectures')}
                  className="flex w-full items-center justify-between rounded-lg border p-3 text-left hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#7567ee]/10 text-[#5a4bda] dark:bg-[#3dc280]/10 dark:text-[#29ff94]">
                      <Play className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Video Lectures</p>
                      <p className="text-xs text-muted-foreground">
                        {combinedLectures.length} classes available
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('notes')}
                  className="flex w-full items-center justify-between rounded-lg border p-3 text-left hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#7567ee]/10 text-[#5a4bda] dark:bg-[#3dc280]/10 dark:text-[#29ff94]">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">PDF Notes</p>
                      <p className="text-xs text-muted-foreground">
                        {courseData.pdfs.length} study notes
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              <button
                type="button"
                onClick={onOpenTelegramModal}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
              >
                <Send className="h-4 w-4 text-[#5a4bda] dark:text-[#29ff94]" />
                <span>Join Telegram Updates</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2 & 3 SEARCH BAR */}
      {activeTab !== 'overview' && (
        <div className="relative">
          <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'lectures'
                ? 'Search lectures by title, topic or teacher...'
                : 'Search PDF notes by title or subject...'
            }
            className="w-full rounded-md border bg-foreground/10 p-3.5 ps-10 pe-10 text-sm outline-none divshadow focus:ring-2 focus:ring-[#5a4bda]/40 dark:focus:ring-[#29ff94]/40"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute end-3 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* LOADING SKELETON */}
      {activeTab !== 'overview' && isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border bg-background p-4 divshadow space-y-3">
              <div className="skeleton-shimmer aspect-video w-full rounded-lg" />
              <div className="skeleton-shimmer h-4 w-3/4 rounded" />
              <div className="skeleton-shimmer h-3 w-1/2 rounded" />
              <div className="skeleton-shimmer h-9 w-full rounded-md" />
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: LECTURES */}
      {!isLoading && activeTab === 'lectures' && (
        <>
          {combinedLectures.length === 0 ? (
            <div className="rounded-xl border bg-background p-10 text-center divshadow">
              <p className="text-base font-semibold text-foreground mb-1">
                No lectures available yet
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Check the PDF Notes tab or join Telegram for upcoming batch uploads.
              </p>
              <button
                type="button"
                onClick={onOpenTelegramModal}
                className="inline-flex items-center gap-2 rounded-md bg-green-400 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 dark:bg-green-500 cursor-pointer"
              >
                <Send className="h-4 w-4" />
                <span>Join Telegram</span>
              </button>
            </div>
          ) : !showLectureGrid ? (
            /* Subject Folders Grid */
            <div className="rounded-xl border bg-background p-4 divshadow sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-foreground sm:text-lg">
                    Subjects &amp; Folders
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Choose a subject folder to browse classes
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLectureFolder('__ALL__')}
                  className="text-xs sm:text-sm font-medium text-[#5a4bda] dark:text-[#29ff94] hover:underline cursor-pointer"
                >
                  View All Lectures ({combinedLectures.length})
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <button
                  type="button"
                  onClick={() => setSelectedLectureFolder('__ALL__')}
                  className="divshadow flex items-center justify-between gap-3 rounded-lg border bg-background p-3.5 text-left transition-all hover:shadow-md hover:border-[#7567ee]/60 dark:hover:border-[#3dc280]/60 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
                      <Play className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        All Lectures
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {combinedLectures.length} videos
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>

                {lectureSubjects.map((sub) => (
                  <button
                    key={sub.name}
                    type="button"
                    onClick={() => setSelectedLectureFolder(sub.name)}
                    className="divshadow flex items-center justify-between gap-3 rounded-lg border bg-background p-3.5 text-left transition-all hover:shadow-md hover:border-[#7567ee]/60 dark:hover:border-[#3dc280]/60 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#7567ee]/10 text-[#5a4bda] dark:bg-[#3dc280]/10 dark:text-[#29ff94]">
                        <Folder className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {sub.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {sub.count} {sub.count === 1 ? 'lecture' : 'lectures'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Lectures Grid + Breadcrumb */
            <div className="space-y-4">
              {lectureSubjects.length > 1 && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-background px-4 py-3 divshadow">
                  <div className="flex items-center gap-2 text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLectureFolder(null);
                        setSearchQuery('');
                      }}
                      className="inline-flex items-center gap-1.5 font-medium text-[#5a4bda] dark:text-[#29ff94] hover:underline cursor-pointer"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>All Subjects</span>
                    </button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-foreground">
                      {searchQuery.trim()
                        ? `Search: "${searchQuery}"`
                        : selectedLectureFolder === '__ALL__'
                        ? 'All Lectures'
                        : selectedLectureFolder}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {displayedLectures.length}{' '}
                    {displayedLectures.length === 1 ? 'video' : 'videos'}
                  </span>
                </div>
              )}

              {displayedLectures.length === 0 ? (
                <div className="rounded-xl border bg-background p-10 text-center divshadow">
                  <p className="text-sm font-medium text-muted-foreground">
                    No lectures match your search.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {displayedLectures.map((lec) => (
                    <article
                      key={lec.id}
                      className="flex flex-col overflow-hidden rounded-xl border bg-background divshadow transition hover:shadow-md"
                    >
                      <button
                        type="button"
                        onClick={() => handleWatchLecture(lec)}
                        className="group relative aspect-video w-full overflow-hidden bg-black/90 cursor-pointer"
                      >
                        <img
                          src={lec.thumb || course.banner || BRAND_LOGO}
                          alt={lec.title}
                          className="h-full w-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = BRAND_LOGO;
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/15 transition-colors group-hover:bg-black/30">
                          <div className="grid h-12 w-12 place-items-center rounded-full bg-black/65 text-white backdrop-blur-sm transition-transform group-hover:scale-110">
                            <Play className="h-5 w-5 fill-current ml-0.5" />
                          </div>
                        </div>

                        {lec.is_live && (
                          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                            <Radio className="h-3 w-3 animate-pulse" />
                            LIVE
                          </span>
                        )}

                        {lec.subject && (
                          <span className="absolute bottom-2 right-2 rounded bg-black/75 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                            {lec.subject}
                          </span>
                        )}
                      </button>

                      <div className="flex flex-1 flex-col p-4">
                        <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-foreground sm:text-base">
                          {lec.title}
                        </h3>

                        <div className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock3 className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">
                            {lec.teacher || 'GB STUDY Faculty'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleWatchLecture(lec)}
                          className="mt-auto inline-flex h-9 w-full items-center justify-center gap-2 rounded-md bg-green-400 px-3 text-sm font-medium text-white transition-colors hover:bg-green-600 dark:bg-green-500 dark:hover:bg-green-600 cursor-pointer"
                        >
                          <Play className="h-4 w-4 fill-current" />
                          <span>Watch</span>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* TAB 3: PDF NOTES */}
      {!isLoading && activeTab === 'notes' && (
        <>
          {courseData.pdfs.length === 0 ? (
            <div className="rounded-xl border bg-background p-10 text-center divshadow">
              <p className="text-base font-semibold text-foreground mb-1">
                No PDF notes available in this batch yet
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Join our Telegram channel for additional handwritten notes and practice sheets.
              </p>
              <button
                type="button"
                onClick={onOpenTelegramModal}
                className="inline-flex items-center gap-2 rounded-md bg-green-400 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 dark:bg-green-500 cursor-pointer"
              >
                <Send className="h-4 w-4" />
                <span>Join Telegram</span>
              </button>
            </div>
          ) : !showPdfGrid ? (
            /* PDF Subject Folders Grid */
            <div className="rounded-xl border bg-background p-4 divshadow sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-foreground sm:text-lg">
                    Notes Folders
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Select a subject to view downloadable study PDFs
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPdfFolder('__ALL__')}
                  className="text-xs sm:text-sm font-medium text-[#5a4bda] dark:text-[#29ff94] hover:underline cursor-pointer"
                >
                  View All Notes ({courseData.pdfs.length})
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <button
                  type="button"
                  onClick={() => setSelectedPdfFolder('__ALL__')}
                  className="divshadow flex items-center justify-between gap-3 rounded-lg border bg-background p-3.5 text-left transition-all hover:shadow-md hover:border-[#7567ee]/60 dark:hover:border-[#3dc280]/60 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        All PDF Notes
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {courseData.pdfs.length} files
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>

                {pdfSubjects.map((sub) => (
                  <button
                    key={sub.name}
                    type="button"
                    onClick={() => setSelectedPdfFolder(sub.name)}
                    className="divshadow flex items-center justify-between gap-3 rounded-lg border bg-background p-3.5 text-left transition-all hover:shadow-md hover:border-[#7567ee]/60 dark:hover:border-[#3dc280]/60 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#7567ee]/10 text-[#5a4bda] dark:bg-[#3dc280]/10 dark:text-[#29ff94]">
                        <Folder className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {sub.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {sub.count} {sub.count === 1 ? 'note' : 'notes'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* PDFs Grid + Breadcrumb */
            <div className="space-y-4">
              {pdfSubjects.length > 1 && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-background px-4 py-3 divshadow">
                  <div className="flex items-center gap-2 text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPdfFolder(null);
                        setSearchQuery('');
                      }}
                      className="inline-flex items-center gap-1.5 font-medium text-[#5a4bda] dark:text-[#29ff94] hover:underline cursor-pointer"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>All Folders</span>
                    </button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-foreground">
                      {searchQuery.trim()
                        ? `Search: "${searchQuery}"`
                        : selectedPdfFolder === '__ALL__'
                        ? 'All PDF Notes'
                        : selectedPdfFolder}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {displayedPdfs.length}{' '}
                    {displayedPdfs.length === 1 ? 'PDF' : 'PDFs'}
                  </span>
                </div>
              )}

              {displayedPdfs.length === 0 ? (
                <div className="rounded-xl border bg-background p-10 text-center divshadow">
                  <p className="text-sm font-medium text-muted-foreground">
                    No PDF notes match your search.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {displayedPdfs.map((pdf, index) => (
                    <article
                      key={pdf.id || index}
                      className="group flex flex-col justify-between gap-4 overflow-hidden rounded-xl border bg-background p-4 divshadow transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#7567ee]/10 text-[#5a4bda] dark:bg-[#3dc280]/10 dark:text-[#29ff94]">
                          <FileText className="h-6 w-6" />
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#5a4bda] dark:text-[#29ff94]">
                            STUDY NOTE
                          </span>
                          <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                            {pdf.title}
                          </h3>
                          <p className="truncate text-xs text-muted-foreground">
                            {pdf.subject ? `${pdf.subject} • ` : ''}
                            {pdf.teacher || 'GB STUDY Team'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`https://docs.google.com/viewer?url=${encodeURIComponent(pdf.link)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleOpenNote(pdf)}
                          className="flex flex-1 items-center justify-between rounded-lg border bg-foreground/[0.03] px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground/[0.07]"
                        >
                          <span>Open Notes</span>
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </a>

                        <a
                          href={pdf.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleOpenNote(pdf)}
                          title="Download PDF"
                          aria-label={`Download ${pdf.title}`}
                          className="inline-flex h-[42px] items-center justify-center rounded-lg bg-green-400 px-3 text-white transition-colors hover:bg-green-600 dark:bg-green-500 dark:hover:bg-green-600"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
