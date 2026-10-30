import { FileText, Maximize2, Pause, Play, Subtitles, Volume2, VolumeX } from 'lucide-react';
import { useRef, useState } from 'react';

export interface VideoTranscriptCue {
  id: string;
  time: string;
  speaker: string;
  text: string;
}

export interface VideoPlayerProps {
  src?: string;
  poster?: string;
  title?: string;
  captionsSrc?: string;
  transcript?: VideoTranscriptCue[];
  mode?: 'interactive' | 'background';
  className?: string;
}

export const DEFAULT_TRANSCRIPT: VideoTranscriptCue[] = [
  {
    id: 'cue-1',
    time: '0:00',
    speaker: 'Narrator',
    text: 'Welcome to NextJob. In traditional job searches, candidates spray generic resumes into ATS black boxes.',
  },
  {
    id: 'cue-2',
    time: '0:14',
    speaker: 'Narrator',
    text: 'NextJob checks hard eligibility first — verifying work authorization, years of experience, and core stack.',
  },
  {
    id: 'cue-3',
    time: '0:32',
    speaker: 'Narrator',
    text: 'Every statement generated traces to your verified CareerClaims with cryptographic SHA-256 submission receipts.',
  },
  {
    id: 'cue-4',
    time: '0:48',
    speaker: 'Narrator',
    text: 'One-click application with full evidence provenance and zero hallucinations.',
  },
];

export function VideoPlayer({
  src = '/videos/nextjob-walkthrough.mp4',
  poster = '/images/video-poster.jpg',
  title = 'NextJob Product Walkthrough & Evidence Engine',
  captionsSrc = '/captions/walkthrough-en.vtt',
  transcript = DEFAULT_TRANSCRIPT,
  mode = 'interactive',
  className = '',
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(mode === 'background');
  const [showCaptions, setShowCaptions] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const toggleCaptions = () => {
    if (!videoRef.current) return;
    const nextCaptions = !showCaptions;
    setShowCaptions(nextCaptions);
    const tracks = videoRef.current.textTracks;
    if (tracks && tracks.length > 0) {
      tracks[0].mode = nextCaptions ? 'showing' : 'hidden';
    }
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      videoRef.current.requestFullscreen().catch(() => {});
    }
  };

  if (mode === 'background') {
    return (
      <div className={`relative overflow-hidden ${className}`} aria-hidden="true">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden ${className}`}
    >
      {/* Video Container */}
      <div className="relative aspect-video bg-black/80 flex items-center justify-center group">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          preload="metadata"
          playsInline
          muted={isMuted}
          className="w-full h-full object-contain"
          aria-label={title}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          {captionsSrc && (
            <track
              kind="captions"
              src={captionsSrc}
              srcLang="en"
              label="English"
              default={showCaptions}
            />
          )}
        </video>

        {/* Big Center Play Overlay Button */}
        {!isPlaying && (
          <button
            type="button"
            onClick={togglePlay}
            aria-label={`Play ${title}`}
            className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-moss/90 hover:bg-moss text-ink flex items-center justify-center shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss"
          >
            <Play className="w-7 h-7 translate-x-0.5 fill-current" aria-hidden="true" />
          </button>
        )}

        {/* Video Controls Bar */}
        <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
              className="p-2 rounded-lg hover:bg-white/20 text-paper transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" aria-hidden="true" />
              ) : (
                <Play className="w-5 h-5 fill-current" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
              className="p-2 rounded-lg hover:bg-white/20 text-paper transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Volume2 className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleCaptions}
              aria-label={showCaptions ? 'Disable captions' : 'Enable captions'}
              className={`p-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss ${
                showCaptions ? 'text-moss bg-moss/20' : 'text-fog hover:bg-white/20'
              }`}
            >
              <Subtitles className="w-5 h-5" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label="Toggle fullscreen"
              className="p-2 rounded-lg hover:bg-white/20 text-paper transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss"
            >
              <Maximize2 className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Transcript Accordion / Drawer */}
      <div className="p-4 sm:p-6 border-t border-white/5 bg-white/[0.01]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-fog">
            Accessibility & Transcript
          </span>
          <button
            type="button"
            onClick={() => setShowTranscript(!showTranscript)}
            aria-expanded={showTranscript}
            aria-controls="video-transcript-content"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-moss hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-moss rounded"
          >
            <FileText className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{showTranscript ? 'Hide Full Transcript' : 'Show Full Transcript'}</span>
          </button>
        </div>

        {showTranscript && (
          <section
            id="video-transcript-content"
            aria-label="Video transcript"
            className="mt-4 pt-4 border-t border-white/5 space-y-3 max-h-60 overflow-y-auto pr-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-moss rounded"
          >
            {transcript.map((cue) => (
              <div key={cue.id} className="text-xs leading-relaxed">
                <span className="font-mono text-moss/80 mr-2 tnum">[{cue.time}]</span>
                <span className="font-semibold text-paper mr-2">{cue.speaker}:</span>
                <span className="text-fog">{cue.text}</span>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
