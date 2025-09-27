import { useLayoutEffect, useState } from 'react';

export function useStageSize(stageRef, { active, reservedAbove = 0, reservedBelow = 0 }) {
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!active) {
      return undefined;
    }

    const element = stageRef.current;
    if (!element) {
      return undefined;
    }

    const update = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const height = Math.max(320, Math.min(900, viewportHeight - reservedAbove - reservedBelow));
      const width = element.getBoundingClientRect().width || viewportWidth;
      setStageSize({ width, height });
    };

    update();

    const observer = new ResizeObserver(() => update());
    observer.observe(element);
    window.addEventListener('resize', update);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [active, reservedAbove, reservedBelow, stageRef]);

  return stageSize;
}
