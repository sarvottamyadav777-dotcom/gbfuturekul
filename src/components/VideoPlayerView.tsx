import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  ArrowLeft,
  EllipsisVertical,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Settings,
  Maximize,
  Minimize,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  Send,
} from 'lucide-react';
import { Course } from '../data/coursesData';
import { LectureItem } from '../data/courseDetailsData';
import { getYoutubeEmbed, TELEGRAM_URL } from '../services/api';

interface VideoPlayerViewProps {
  course: Course;
  lecture: LectureItem;
  allLectures: LectureItem[];
  onBackToCourse: () => void;
  onSelectLecture: (lec: LectureItem) => void;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export const VideoPlayerView: React.FC<VideoPlayerViewProps> = ({
  course,
  lecture,
  allLectures,
  onBackToCourse,
  onSelectLecture,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedTime, setBufferedTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [qualityLevels, setQualityLevels] = useState<{ id: number; label: string }[]>([]);
  const [currentQuality, setCurrentQuality] = useState(-1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [controlsVisible, setControlsVisible] = useState(true);
  const [topMenuOpen, setTopMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsSubmenu, setSettingsSubmenu] = useState<'main' | 'speed' | 'quality'>('main');
  const [reloadNonce, setReloadNonce] = useState(0);

  const currentIndex = useMemo(
    () => allLectures.findIndex((l) => l.id === lecture.id),
    [allLectures, lecture.id]
  );
  const prevLecture = currentIndex > 0 ? allLectures[currentIndex - 1] : null;
  const nextLecture =
    currentIndex >= 0 && currentIndex < allLectures.length - 1
      ? allLectures[currentIndex + 1]
      : null;

  const ytEmbed = lecture.link ? getYoutubeEmbed(lecture.link) : null;
  const isDirectVideo = !ytEmbed && !!lecture.link;

  const scheduleHideControls = useCallback(() => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
    }
    setControlsVisible(true);
    if (isPlaying && !topMenuOpen && !settingsOpen) {
      hideTimerRef.current = window.setTimeout(() => {
        setControlsVisible(false);
      }, 3000);
    }
  }, [isPlaying, topMenuOpen, settingsOpen]);

  useEffect(() => {
    scheduleHideControls();
    return () => {
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, [scheduleHideControls]);

  // Initialize HLS / Direct video stream
  useEffect(() => {
    setIsLoading(true);
    setErrorMsg(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setBufferedTime(0);
    setQualityLevels([]);
    setCurrentQuality(-1);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const videoEl = videoRef.current;
    if (!videoEl || !isDirectVideo) {
      setIsLoading(false);
      return;
    }

    const source = lecture.link;
    videoEl.playbackRate = playbackRate;
    videoEl.volume = isMuted ? 0 : volume;

    if (source.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        });
        hlsRef.current = hls;
        hls.loadSource(source);
        hls.attachMedia(videoEl);

        hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
          setIsLoading(false);
          const levels = data.levels.map((lvl, index) => ({
            id: index,
            label: lvl.height ? `${lvl.height}p` : `Level ${index + 1}`,
          }));
          setQualityLevels(levels);
          videoEl.play().catch(() => {});
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                setIsLoading(false);
                setErrorMsg('Video stream is temporarily unavailable.');
                hls.destroy();
                break;
            }
          }
        });
      } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
        videoEl.src = source;
        videoEl.onloadedmetadata = () => {
          setIsLoading(false);
          videoEl.play().catch(() => {});
        };
        videoEl.onerror = () => {
          setIsLoading(false);
          setErrorMsg('Unable to load video stream on this device.');
        };
      } else {
        setIsLoading(false);
        setErrorMsg('Your browser does not support HLS video streaming.');
      }
    } else {
      videoEl.src = source;
      videoEl.onloadeddata = () => {
        setIsLoading(false);
        videoEl.play().catch(() => {});
      };
      videoEl.onerror = () => {
        setIsLoading(false);
        setErrorMsg('Failed to load video stream.');
      };
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [lecture.link, isDirectVideo, reloadNonce]);

  // Attach video element event listeners
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || !isDirectVideo) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);
    const onTimeUpdate = () => {
      setCurrentTime(videoEl.currentTime || 0);
      setDuration(videoEl.duration || 0);
      if (videoEl.buffered.length > 0) {
        setBufferedTime(videoEl.buffered.end(videoEl.buffered.length - 1));
      }
    };

    videoEl.addEventListener('play', onPlay);
    videoEl.addEventListener('pause', onPause);
    videoEl.addEventListener('waiting', onWaiting);
    videoEl.addEventListener('canplay', onCanPlay);
    videoEl.addEventListener('timeupdate', onTimeUpdate);
    videoEl.addEventListener('durationchange', onTimeUpdate);
    videoEl.addEventListener('progress', onTimeUpdate);

    return () => {
      videoEl.removeEventListener('play', onPlay);
      videoEl.removeEventListener('pause', onPause);
      videoEl.removeEventListener('waiting', onWaiting);
      videoEl.removeEventListener('canplay', onCanPlay);
      videoEl.removeEventListener('timeupdate', onTimeUpdate);
      videoEl.removeEventListener('durationchange', onTimeUpdate);
      videoEl.removeEventListener('progress', onTimeUpdate);
    };
  }, [isDirectVideo]);

  const togglePlay = useCallback(() => {
    const videoEl = videoRef.current;
    if (!videoEl || !isDirectVideo) return;
    if (videoEl.paused) {
      videoEl.play().catch(() => {});
    } else {
      videoEl.pause();
    }
    scheduleHideControls();
  }, [isDirectVideo, scheduleHideControls]);

  const seekBy = useCallback(
    (delta: number) => {
      const videoEl = videoRef.current;
      if (!videoEl || !isDirectVideo) return;
      const target = Math.max(0, Math.min(videoEl.duration || Infinity, videoEl.currentTime + delta));
      videoEl.currentTime = target;
      setCurrentTime(target);
      scheduleHideControls();
    },
    [isDirectVideo, scheduleHideControls]
  );

  const toggleMute = useCallback(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    videoEl.muted = nextMuted;
    scheduleHideControls();
  }, [isMuted, scheduleHideControls]);

  const handleVolumeChange = (val: number) => {
    const videoEl = videoRef.current;
    setVolume(val);
    setIsMuted(val === 0);
    if (videoEl) {
      videoEl.volume = val;
      videoEl.muted = val === 0;
    }
  };

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      }
      if ('screen' in window && 'orientation' in window.screen && (window.screen.orientation as any).lock) {
        (window.screen.orientation as any).lock('landscape').catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        seekBy(-10);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        seekBy(10);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'Escape') {
        setTopMenuOpen(false);
        setSettingsOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [togglePlay, seekBy, toggleFullscreen, toggleMute]);

  const handleSelectSpeed = (spd: number) => {
    setPlaybackRate(spd);
    if (videoRef.current) {
      videoRef.current.playbackRate = spd;
    }
    setSettingsSubmenu('main');
    setSettingsOpen(false);
  };

  const handleSelectQuality = (lvlId: number) => {
    setCurrentQuality(lvlId);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = lvlId;
    }
    setSettingsSubmenu('main');
    setSettingsOpen(false);
  };

  const playedPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const bufferedPct = duration > 0 ? Math.min(100, (bufferedTime / duration) * 100) : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={scheduleHideControls}
      onTouchStart={scheduleHideControls}
      className="relative h-[100dvh] w-full select-none overflow-hidden bg-black text-white"
    >
      {/* Top Bar */}
      <div
        className={`absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-3 bg-gradient-to-b from-black/85 via-black/45 to-transparent px-3 py-3 sm:px-5 transition-all duration-200 ${
          controlsVisible || ytEmbed
            ? 'translate-y-0 opacity-100'
            : '-translate-y-3 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBackToCourse}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Back to course"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            <h1 className="line-clamp-1 text-sm font-semibold sm:text-base">
              {lecture.title}
            </h1>
            <p className="hidden truncate text-xs text-white/70 sm:block">
              {course.title} {lecture.teacher ? `• ${lecture.teacher}` : ''}
            </p>
          </div>
        </div>

        {/* 3-dot Top Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setTopMenuOpen((o) => !o);
              setSettingsOpen(false);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Player options"
          >
            <EllipsisVertical className="h-5 w-5" />
          </button>

          {topMenuOpen && (
            <div className="nt-player-menu absolute right-0 top-11 z-40 min-w-[210px] rounded-xl border border-white/10 bg-[#23232a]/95 p-1.5 text-sm shadow-2xl backdrop-blur-md">
              <button
                type="button"
                onClick={() => {
                  setReloadNonce((n) => n + 1);
                  setTopMenuOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left hover:bg-white/10 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reload video</span>
              </button>

              {prevLecture && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectLecture(prevLecture);
                    setTopMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous Lecture</span>
                </button>
              )}

              {nextLecture && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectLecture(nextLecture);
                    setTopMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                  <span>Next Lecture</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Video Surface */}
      <div className="relative flex h-full w-full items-center justify-center bg-black">
        {ytEmbed ? (
          <iframe
            src={ytEmbed}
            title={lecture.title}
            className="h-full w-full border-0 pt-14"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : isDirectVideo ? (
          <>
            <video
              ref={videoRef}
              playsInline
              crossOrigin="anonymous"
              preload="auto"
              onClick={() => {
                if (topMenuOpen || settingsOpen) {
                  setTopMenuOpen(false);
                  setSettingsOpen(false);
                } else {
                  togglePlay();
                }
              }}
              className="h-full w-full object-contain"
            />

            {/* Loading Spinner Overlay */}
            {isLoading && !errorMsg && (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/35">
                <div className="h-8 w-8 animate-spin rounded-full border-[5px] border-[#3f3f3f] border-r-[#777] border-t-[#dedede]" />
              </div>
            )}

            {/* Center Play Button when paused */}
            {!isPlaying && !isLoading && !errorMsg && (
              <button
                type="button"
                onClick={togglePlay}
                aria-label="Play video"
                className="absolute z-10 grid h-16 w-16 place-items-center rounded-full bg-black/65 text-white backdrop-blur-sm transition-transform hover:scale-110 cursor-pointer"
              >
                <Play className="h-7 w-7 fill-current ml-0.5" />
              </button>
            )}

            {/* Stream Error Overlay */}
            {errorMsg && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 p-6 text-center">
                <AlertCircle className="mb-3 h-11 w-11 text-red-500" />
                <p className="mb-1 text-base font-semibold">Playback Unavailable</p>
                <p className="mb-5 max-w-md text-xs text-white/70 sm:text-sm">
                  {errorMsg}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setReloadNonce((n) => n + 1)}
                    className="inline-flex items-center gap-2 rounded-md bg-green-500 px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-green-600 cursor-pointer"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Reload Video</span>
                  </button>
                  <a
                    href={TELEGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-white/20"
                  >
                    <Send className="h-4 w-4" />
                    <span>Telegram Support</span>
                  </a>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="mb-3 h-11 w-11 text-red-500" />
            <p className="mb-1 text-base font-semibold">No Video Stream Available</p>
            <p className="mb-4 max-w-sm text-xs text-white/70">
              No playable video URL is provided for this class.
            </p>
            <button
              type="button"
              onClick={onBackToCourse}
              className="rounded-md bg-white/15 px-4 py-2 text-sm font-medium hover:bg-white/25 cursor-pointer"
            >
              Back to Course
            </button>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar (Direct Video Only) */}
      {isDirectVideo && (
        <div
          className={`absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-3 pb-3 pt-10 sm:px-5 sm:pb-4 transition-all duration-200 ${
            controlsVisible
              ? 'translate-y-0 opacity-100'
              : 'translate-y-3 opacity-0 pointer-events-none'
          }`}
        >
          {/* Progress Slider Row */}
          <div className="mb-2.5 flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={(e) => {
                const target = parseFloat(e.target.value);
                if (videoRef.current) videoRef.current.currentTime = target;
                setCurrentTime(target);
              }}
              style={
                {
                  '--played': `${playedPct}%`,
                  '--buffered': `${bufferedPct}%`,
                } as React.CSSProperties
              }
              aria-label="Video seek bar"
              className="nt-player-progress h-1 w-full cursor-pointer appearance-none rounded-full sm:h-1.5"
            />
          </div>

          {/* Controls Buttons Row */}
          <div className="flex items-center justify-between gap-2">
            {/* Left Group */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              <button
                type="button"
                onClick={togglePlay}
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/15 transition-colors cursor-pointer"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 fill-current" />
                ) : (
                  <Play className="h-5 w-5 fill-current ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={() => seekBy(-10)}
                className="flex items-center gap-1 rounded-full px-2 py-1.5 text-xs font-medium hover:bg-white/15 transition-colors cursor-pointer"
                title="Rewind 10 seconds"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">10s</span>
              </button>

              <button
                type="button"
                onClick={() => seekBy(10)}
                className="flex items-center gap-1 rounded-full px-2 py-1.5 text-xs font-medium hover:bg-white/15 transition-colors cursor-pointer"
                title="Forward 10 seconds"
              >
                <RotateCw className="h-4 w-4" />
                <span className="hidden sm:inline">10s</span>
              </button>

              {/* Volume Control */}
              <div className="group flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/15 transition-colors cursor-pointer"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  aria-label="Volume"
                  className="hidden w-0 cursor-pointer accent-white transition-all duration-200 group-hover:w-20 sm:block focus:w-20"
                />
              </div>

              {/* Timestamp */}
              <span className="ml-1 text-xs font-medium tabular-nums text-white/90 sm:text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Right Group */}
            <div className="relative flex items-center gap-1.5 sm:gap-2">
              {nextLecture && (
                <button
                  type="button"
                  onClick={() => onSelectLecture(nextLecture)}
                  className="hidden items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium hover:bg-white/25 transition-colors sm:inline-flex cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              )}

              {/* Settings Cog + Submenu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setSettingsOpen((o) => !o);
                    setSettingsSubmenu('main');
                    setTopMenuOpen(false);
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/15 transition-colors cursor-pointer"
                  aria-label="Player settings"
                >
                  <Settings
                    className={`h-4 w-4 transition-transform duration-200 ${
                      settingsOpen ? 'rotate-45' : ''
                    }`}
                  />
                </button>

                {settingsOpen && (
                  <div className="nt-player-menu absolute bottom-12 right-0 z-40 min-w-[220px] rounded-xl border border-white/10 bg-[#23232a]/95 p-1.5 text-sm shadow-2xl backdrop-blur-md">
                    {settingsSubmenu === 'main' && (
                      <>
                        <button
                          type="button"
                          onClick={() => setSettingsSubmenu('speed')}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          <span>Playback Speed</span>
                          <span className="flex items-center gap-1 text-xs text-white/75">
                            {playbackRate === 1 ? 'Normal' : `${playbackRate}x`}
                            <ChevronRight className="h-4 w-4" />
                          </span>
                        </button>

                        {qualityLevels.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setSettingsSubmenu('quality')}
                            className="flex w-full items-center justify-between rounded-lg px-3 py-2 hover:bg-white/10 transition-colors cursor-pointer"
                          >
                            <span>Quality</span>
                            <span className="flex items-center gap-1 text-xs text-white/75">
                              {currentQuality === -1
                                ? 'Auto'
                                : qualityLevels.find((q) => q.id === currentQuality)?.label || 'Auto'}
                              <ChevronRight className="h-4 w-4" />
                            </span>
                          </button>
                        )}
                      </>
                    )}

                    {settingsSubmenu === 'speed' && (
                      <div>
                        <button
                          type="button"
                          onClick={() => setSettingsSubmenu('main')}
                          className="mb-1 flex w-full items-center gap-2 border-b border-white/10 px-3 py-2 text-xs font-semibold text-white/80 hover:text-white cursor-pointer"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span>Playback Speed</span>
                        </button>
                        <div className="max-h-56 overflow-y-auto">
                          {SPEED_OPTIONS.map((spd) => (
                            <button
                              key={spd}
                              type="button"
                              onClick={() => handleSelectSpeed(spd)}
                              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-white/10 cursor-pointer"
                            >
                              <span>{spd === 1 ? 'Normal (1x)' : `${spd}x`}</span>
                              {playbackRate === spd && (
                                <Check className="h-4 w-4 text-[#29ff94]" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {settingsSubmenu === 'quality' && (
                      <div>
                        <button
                          type="button"
                          onClick={() => setSettingsSubmenu('main')}
                          className="mb-1 flex w-full items-center gap-2 border-b border-white/10 px-3 py-2 text-xs font-semibold text-white/80 hover:text-white cursor-pointer"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span>Video Quality</span>
                        </button>
                        <div className="max-h-56 overflow-y-auto">
                          <button
                            type="button"
                            onClick={() => handleSelectQuality(-1)}
                            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-white/10 cursor-pointer"
                          >
                            <span>Auto</span>
                            {currentQuality === -1 && (
                              <Check className="h-4 w-4 text-[#29ff94]" />
                            )}
                          </button>
                          {qualityLevels.map((lvl) => (
                            <button
                              key={lvl.id}
                              type="button"
                              onClick={() => handleSelectQuality(lvl.id)}
                              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-white/10 cursor-pointer"
                            >
                              <span>{lvl.label}</span>
                              {currentQuality === lvl.id && (
                                <Check className="h-4 w-4 text-[#29ff94]" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={toggleFullscreen}
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/15 transition-colors cursor-pointer"
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
