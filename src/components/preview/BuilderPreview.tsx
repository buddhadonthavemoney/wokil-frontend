'use client';

import { ReactNode, useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Sparkles, ZoomIn, ZoomOut } from 'lucide-react';

interface BuilderPreviewProps {
  /**
   * Controls above the slider — the theme picker, the "Desktop View" link.
   * Optional because they differ per wizard; everything below is identical.
   */
  toolbar?: ReactNode;
  /** True until the wizard has enough data to render anything meaningful. */
  isEmpty: boolean;
  emptyTitle: string;
  emptyDescription: string;
  /** The preview itself, given the current zoom. */
  children: (zoom: number) => ReactNode;
}

/**
 * The right-hand live preview both wizards show: zoom slider, empty state, and
 * a phone mockup around whichever preview component the caller renders.
 *
 * Zoom state lives here rather than in each page — it is only ever read by the
 * slider and the preview, so hoisting it into the callers would just duplicate
 * the same two lines in both wizards, which is what this component exists to
 * stop.
 */
export function BuilderPreview({
  toolbar,
  isEmpty,
  emptyTitle,
  emptyDescription,
  children,
}: BuilderPreviewProps) {
  const [zoom, setZoom] = useState([1.0]);

  return (
    <>
      {toolbar && (
        <div className="relative w-full flex justify-center items-center mb-4 px-2 gap-4">{toolbar}</div>
      )}

      <div className="flex justify-center mb-8 px-4">
        <div className="w-full max-w-[200px] flex items-center gap-3">
          <ZoomOut className="w-3 h-3 text-muted-foreground/40" />
          <Slider
            value={zoom}
            onValueChange={setZoom}
            min={0.5}
            max={1.5}
            step={0.05}
            className="w-full cursor-pointer h-1"
          />
          <ZoomIn className="w-3 h-3 text-muted-foreground/40" />
          <span className="text-[9px] font-mono text-muted-foreground/60 w-8 text-right">
            {Math.round(zoom[0] * 100)}%
          </span>
        </div>
      </div>

      {/* Phone mockup */}
      <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl">
        <div className="w-[148px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute z-20"></div>
        <div className="h-[32px] w-[3px] bg-gray-800 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
        <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
        <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
        <div className="h-[64px] w-[3px] bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>

        {/*
          overflow-hidden: the preview component owns the scroll container,
          because that element is its IntersectionObserver root. A second
          scroller here would leave the observer watching a box that never
          moves, and every [data-reveal] section would stay invisible.
        */}
        <div className="rounded-[2rem] overflow-hidden w-full h-full bg-card dark:bg-gray-800 relative z-10">
          {isEmpty ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-card p-8 text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-2">
                <Sparkles className="w-8 h-8 text-primary opacity-40" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 leading-tight">{emptyTitle}</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">{emptyDescription}</p>
              <div className="pt-4 flex flex-col gap-2 w-full">
                <div className="h-2 bg-slate-50 rounded-full w-3/4 mx-auto" />
                <div className="h-2 bg-slate-50 rounded-full w-1/2 mx-auto opacity-50" />
              </div>
            </div>
          ) : (
            children(zoom[0])
          )}
        </div>
      </div>
    </>
  );
}
