import gsap, { Power3 } from 'gsap';
import {
  forwardRef,
  memo,
  ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';

const Animated = memo(
  forwardRef(({ children }: { children: ReactNode }, ref) => {
    const el = useRef<HTMLDivElement>(null);
    const animation = useRef<gsap.core.Tween>();
    useLayoutEffect(() => {
      const ctx = gsap.context(() => {
        if (el.current) {
          animation.current = gsap.from(el.current, {
            height: 0,
          });
        }
      });
      return () => ctx.revert();
    }, []);

    useEffect(() => {
      // forward the animation instance
      if (typeof ref === 'function') {
        ref(animation.current);
      } else if (ref) {
        ref.current = animation.current;
      }
    }, [ref]);

    return (
      <div ref={el} className={'bg-red-500'}>
        {children}
      </div>
    );
  }),
);

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
  const animation = useRef<gsap.core.Tween>();

  useEffect(() => {
    animation.current?.reversed(show);
  }, [show]);

  return <Animated ref={animation}>{children}</Animated>;
}
