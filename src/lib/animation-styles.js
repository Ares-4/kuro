export const getAnimationStyle = (type, duration = 0.5) => {
  const transition = { duration: duration, ease: "easeOut" };
  
  switch (type) {
    case 'fade':
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition
      };
    case 'slide':
    case 'slide-up':
      return {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 20 },
        transition
      };
    case 'slide-down':
      return {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition
      };
    case 'bounce':
      return {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: [1, 1.05, 1] },
        exit: { opacity: 0, scale: 0.8 },
        transition: { duration: 0.6, type: "spring", bounce: 0.5 }
      };
    case 'zoom':
      return {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
        transition
      };
    default:
      return {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 },
        transition
      };
  }
};