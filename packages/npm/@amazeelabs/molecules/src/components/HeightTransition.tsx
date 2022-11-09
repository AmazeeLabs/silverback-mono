import clsx from 'clsx';
import gsap, { Power3 } from 'gsap';
import { ReactNode, useEffect, useRef } from 'react';

export function HeightTransition({
  children,
  show,
  durationEnter = 0.5,
  durationLeave = 0.5,
  beforeEnter,
  afterEnter,
  beforeLeave,
  afterLeave,
  delayEnter = 0,
  delayLeave = 0,
  className,
}: {
  children?: ReactNode;
  show: boolean;
  durationEnter?: number;
  durationLeave?: number;
  beforeEnter?: () => void;
  afterEnter?: () => void;
  beforeLeave?: () => void;
  afterLeave?: () => void;
  delayEnter?: number;
  delayLeave?: number;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef?.current;
    if (wrap) {
      if (show) {
        beforeEnter && beforeEnter();
        gsap.to(wrap, {
          height: 'auto',
          paddingTop: 'auto',
          paddingBottom: 'auto',
          duration: durationEnter,
          ease: Power3.easeOut,
          delay: delayEnter,
          onComplete: afterEnter ? () => afterEnter() : undefined,
        });
      } else {
        beforeLeave && beforeLeave();
        gsap.to(wrap, {
          height: 0,
          paddingTop: 0,
          paddingBottom: 0,
          duration: durationLeave,
          ease: Power3.easeOut,
          delay: delayLeave,
          onComplete: afterLeave ? () => afterLeave() : undefined,
        });
      }
    }
    return () => {};
  }, [wrapRef, show]);

  // const CollapsibleStyle = {
  //   overflow: 'hidden',
  //   height: 'inherit',
  // };

  return (
    <div
      ref={wrapRef}
      className={clsx('overflow-hidden', { 'h-0': !show }, className)}
    >
      {children}
    </div>
  );
}
