import { memo } from 'react';
import { motion } from 'framer-motion';

const BASE_CLASSNAME = 'w-full h-full';
const PATH_CLASSNAME = 'w-full h-full path-shimmer';

function PathfinderCell({
  path,
  style,
  initialVariant,
  animateVariant,
  transition,
}) {
  return (
    <motion.div
      className={path ? PATH_CLASSNAME : BASE_CLASSNAME}
      style={style}
      initial={initialVariant}
      animate={animateVariant}
      transition={transition}
    />
  );
}

export default memo(PathfinderCell, (prev, next) =>
  prev.visited === next.visited &&
  prev.path === next.path &&
  prev.wall === next.wall &&
  prev.isStart === next.isStart &&
  prev.isTarget === next.isTarget,
);
