/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Search, SearchX } from 'lucide-react';
import { Course, INITIAL_COURSES } from './data/coursesData';
import { LectureItem } from './data/courseDetailsData';
import { fetchAllCourses, fetchCourseDetails } from './services/api';
import {
  ThemeMode,
  applyTheme,
  getSavedTheme,
  saveTheme,
  getEnrolledBatches,
  enrollBatch,
  unenrollBatch,
  getSelectedStudyBatch,
  setSelectedStudyBatch,
  addLectureToHistory,
  HistoryItem,
} from './services/storage';
import { Sidebar, NavSection } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { CourseCard } from './components/CourseCard';
import { CourseDetailView } from './components/CourseDetailView';
import { VideoPlayerView } from './components/VideoPlayerView';
import { StudyView } from './components/StudyView';
import { MyBatchesView } from './components/MyBatchesView';
import { HistoryView } from './components/HistoryView';
import { ContactView } from './components/ContactView';
import { TelegramModal } from './components/TelegramModal';
import { ToastContainer, toast } from './components/ToastContainer';

type ViewMode = NavSection | 'course' | 'player';

export default function App() {
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [loadingCourses, setLoadingCourses] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [activeNav, setActiveNav] = useState<NavSection>('batches');
  const [currentView, setCurrentView] = useState<ViewMode>('batches');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLecture, setSelectedLecture] = useState<LectureItem | null>(null);
  const [activeCourseLectures, setActiveCourseLectures] = useState<LectureItem[]>([]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [telegramModalOpen, setTelegramModalOpen] = useState(false);

  const [theme, setTheme] = useState<ThemeMode>(() => getSavedTheme());
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(
    () => new Set(getEnrolledBatches().map((b) => String(b.id)))
  );
  const [studyBatch, setStudyBatch] = useState<Course | null>(() => getSelectedStudyBatch());

  // Apply & sync theme (Light / Dark / System)
  useEffect(() => {
    applyTheme(theme);
    saveTheme(theme);
    if (theme === 'SYSTEM') {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      const onChange = () => applyTheme('SYSTEM');
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    }
  }, [theme]);

  // Network online / offline toast notifications
  useEffect(() => {
    const onOffline = () => toast.error('You are currently offline. Cached courses remain available.');
    const onOnline = () => toast.info('Back online!');
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, []);

  // Keep enrolled batch state synced across updates
  useEffect(() => {
    const syncBatches = () => {
      setEnrolledIds(new Set(getEnrolledBatches().map((b) => String(b.id))));
      setStudyBatch(getSelectedStudyBatch());
    };
    window.addEventListener('batchesUpdated', syncBatches);
    return () => window.removeEventListener('batchesUpdated', syncBatches);
  }, []);

  // Fetch live courses on mount with automatic cached fallback
  useEffect(() => {
    let isMounted = true;
    fetchAllCourses()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setCourses(data);
        }
        if (isMounted) setLoadingCourses(false);
      })
      .catch(() => {
        if (isMounted) setLoadingCourses(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Browser back button support
  useEffect(() => {
    const onPopState = () => {
      if (currentView === 'player') {
        setCurrentView('course');
        setSelectedLecture(null);
      } else if (currentView === 'course') {
        setCurrentView(activeNav);
        setSelectedCourse(null);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [currentView, activeNav]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => {
      if (c.category && c.category.trim()) set.add(c.category.trim());
    });
    return ['all', ...Array.from(set)];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return courses.filter((c) => {
      const matchCat =
        selectedCategory === 'all' ||
        (c.category && c.category.toLowerCase() === selectedCategory.toLowerCase());
      const matchSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        (c.exams_covered && c.exams_covered.toLowerCase().includes(q)) ||
        (c.short_description && c.short_description.toLowerCase().includes(q)) ||
        (c.category && c.category.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [courses, selectedCategory, searchQuery]);

  const handleSelectNav = (nav: NavSection) => {
    setActiveNav(nav);
    setCurrentView(nav);
    setSelectedCourse(null);
    setSelectedLecture(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    setCurrentView('course');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.history.pushState({ view: 'course', id: course.id }, '');
  };

  const handlePlayLecture = (lec: LectureItem, allLectures: LectureItem[]) => {
    setSelectedLecture(lec);
    setActiveCourseLectures(allLectures);
    setCurrentView('player');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.history.pushState({ view: 'player', id: lec.id }, '');
  };

  const handleEnroll = (course: Course) => {
    enrollBatch(course);
    setEnrolledIds(new Set(getEnrolledBatches().map((b) => String(b.id))));
    if (!studyBatch) {
      setSelectedStudyBatch(course);
      setStudyBatch(course);
    }
    toast.success(`Enrolled in ${course.title}`);
  };

  const handleUnenroll = (course: Course) => {
    unenrollBatch(course.id);
    setEnrolledIds(new Set(getEnrolledBatches().map((b) => String(b.id))));
    toast.info(`Removed ${course.title} from My Batches`);
  };

  const handleSelectStudyBatch = (course: Course) => {
    setSelectedStudyBatch(course);
    setStudyBatch(course);
    toast.success(`Selected ${course.title}`);
  };

  const handleGoBack = () => {
    if (currentView === 'player') {
      setCurrentView('course');
      setSelectedLecture(null);
    } else if (currentView === 'course') {
      setCurrentView(activeNav);
      setSelectedCourse(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResumeHistoryLecture = async (item: HistoryItem) => {
    const foundCourse = courses.find((c) => String(c.id) === String(item.courseId)) || {
      id: item.courseId,
      title: item.courseTitle,
      banner: item.thumb || '',
      category: 'GB STUDY',
      short_description: '',
      exams_covered: 'All Exams',
    };
    const lectureObj: LectureItem = {
      id: item.contentId,
      title: item.title,
      teacher: item.teacher || 'GB STUDY Faculty',
      subject: item.subject || '',
      link: item.link,
      thumb: item.thumb,
      is_live: false,
    };

    setSelectedCourse(foundCourse);
    addLectureToHistory(foundCourse, lectureObj);

    try {
      const details = await fetchCourseDetails(foundCourse.id);
      const list = [...details.freeClasses, ...details.paidClasses];
      handlePlayLecture(lectureObj, list.length > 0 ? list : [lectureObj]);
    } catch {
      handlePlayLecture(lectureObj, [lectureObj]);
    }
  };

  const handleOpenCourseById = (courseId: string) => {
    const found = courses.find((c) => String(c.id) === String(courseId));
    if (found) {
      handleSelectCourse(found);
    } else {
      toast.info('Course not found in current catalog');
    }
  };

  // Fullscreen Player mode hides Sidebar & TopHeader cleanly (matching StudyLayout)
  if (currentView === 'player' && selectedCourse && selectedLecture) {
    return (
      <div className="min-h-screen bg-black text-white">
        <ToastContainer />
        <VideoPlayerView
          course={selectedCourse}
          lecture={selectedLecture}
          allLectures={activeCourseLectures}
          onBackToCourse={() => {
            setCurrentView('course');
            setSelectedLecture(null);
          }}
          onSelectLecture={(lec) => {
            addLectureToHistory(selectedCourse, lec);
            setSelectedLecture(lec);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ToastContainer />

      <TelegramModal
        isOpen={telegramModalOpen ? true : undefined}
        onClose={() => setTelegramModalOpen(false)}
      />

      <Sidebar
        activeNav={activeNav}
        onSelectNav={handleSelectNav}
        onOpenTelegramModal={() => setTelegramModalOpen(true)}
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex min-h-screen flex-col xl:ml-64">
        <TopHeader
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
          canGoBack={currentView === 'course'}
          onGoBack={handleGoBack}
          theme={theme}
          onChangeTheme={setTheme}
        />

        <main className="flex-1 p-4 sm:p-6">
          {/* STUDY DASHBOARD */}
          {currentView === 'study' && (
            <StudyView
              courses={courses}
              enrolledIds={enrolledIds}
              selectedBatch={studyBatch}
              onSelectStudyBatch={handleSelectStudyBatch}
              onOpenCourse={handleSelectCourse}
              onNavigate={handleSelectNav}
            />
          )}

          {/* ALL BATCHES GRID (Default Landing Matching /study/nexttoppers) */}
          {currentView === 'batches' && (
            <div>
              {/* Reference Search Form */}
              <form
                onSubmit={(e) => e.preventDefault()}
                className="divshadow mb-6 flex flex-wrap items-center gap-3 sm:gap-5"
              >
                <div className="relative w-full">
                  <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Your Batch"
                    className="w-full rounded-md border bg-foreground/10 p-4 ps-10 pe-24 text-sm outline-none focus:ring-2 focus:ring-[#5a4bda]/40 dark:focus:ring-[#29ff94]/40"
                  />
                  <button
                    type="submit"
                    className="absolute bottom-2.5 end-2.5 rounded-lg bg-green-400 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 dark:bg-green-500 dark:hover:bg-green-600 cursor-pointer transition-colors"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Category Filter Strip */}
              {categories.length > 2 && (
                <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {categories.map((cat) => {
                    const active = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`whitespace-nowrap rounded-md border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                          active
                            ? 'border-[#5a4bda] bg-[#5a4bda] text-white dark:border-[#3dc280] dark:bg-[#29ff94] dark:text-black'
                            : 'bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        {cat === 'all' ? `All Batches (${courses.length})` : cat}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Batches Grid / Skeleton */}
              {loadingCourses ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="overflow-hidden rounded-xl border bg-background p-4 divshadow space-y-4"
                    >
                      <div className="flex justify-between gap-4">
                        <div className="skeleton-shimmer h-5 w-3/4 rounded" />
                        <div className="skeleton-shimmer h-5 w-12 rounded" />
                      </div>
                      <div className="skeleton-shimmer aspect-video w-full rounded-lg" />
                      <div className="skeleton-shimmer h-4 w-2/3 rounded" />
                      <div className="flex gap-2">
                        <div className="skeleton-shimmer h-10 flex-1 rounded-md" />
                        <div className="skeleton-shimmer h-10 flex-1 rounded-md" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredCourses.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border bg-background p-12 text-center divshadow">
                  <SearchX className="mb-3 h-10 w-10 text-muted-foreground" />
                  <h2 className="mb-1 text-base font-bold text-foreground">
                    No batches found
                  </h2>
                  <p className="mb-4 max-w-sm text-sm text-muted-foreground">
                    No batches match &quot;{searchQuery}&quot;. Try another search term or reset filters.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    className="rounded-md bg-green-400 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 dark:bg-green-500 cursor-pointer"
                  >
                    Reset Search
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredCourses.map((course, index) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      enrolled={enrolledIds.has(String(course.id))}
                      onSelect={handleSelectCourse}
                      onEnroll={handleEnroll}
                      onUnenroll={handleUnenroll}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MY BATCHES */}
          {currentView === 'mybatches' && (
            <MyBatchesView
              courses={courses}
              enrolledIds={enrolledIds}
              onSelectCourse={handleSelectCourse}
              onEnroll={handleEnroll}
              onUnenroll={handleUnenroll}
              onBrowseBatches={() => handleSelectNav('batches')}
            />
          )}

          {/* HISTORY */}
          {currentView === 'history' && (
            <HistoryView
              onResumeLecture={handleResumeHistoryLecture}
              onOpenCourseById={handleOpenCourseById}
              onBrowseBatches={() => handleSelectNav('batches')}
            />
          )}

          {/* CONTACT US */}
          {currentView === 'contact' && <ContactView />}

          {/* COURSE DETAIL VIEW */}
          {currentView === 'course' && selectedCourse && (
            <CourseDetailView
              course={selectedCourse}
              enrolled={enrolledIds.has(String(selectedCourse.id))}
              onEnroll={handleEnroll}
              onUnenroll={handleUnenroll}
              onPlayLecture={handlePlayLecture}
              onOpenTelegramModal={() => setTelegramModalOpen(true)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
