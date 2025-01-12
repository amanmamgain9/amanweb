// animations.ts
import { Variants } from 'framer-motion';

type TransitionType = 'route' | 'item';

// Timing constants
const CONTAINER_DURATION = 0.7;
const DETAIL_CONTAINER_DURATION = 0.5;

export const getListContainerVariants = (isDesktop: boolean): Variants => {
  if (isDesktop) {
    return {
      visible: {
        width: "38.2%",
        borderRightWidth: 1,
        borderRightColor: "#1c4c7c",
        transition: { duration: CONTAINER_DURATION, ease: "easeInOut" }
      },
      hidden: {
        width: "0%",
        borderRightWidth: 0,
        borderRightColor: "rgba(28, 76, 124, 0)",
        transition: { duration: CONTAINER_DURATION, ease: "easeInOut" }
      }
    };
  }
  
  return {
    visible: {
      width: "100%",
      opacity: 1,
      display: "flex",
      transition: { duration: CONTAINER_DURATION, ease: "easeInOut" }
    },
    hidden: {
      width: "100%",
      opacity: 0,
      transitionEnd: { display: "none" },
      transition: { duration: CONTAINER_DURATION, ease: "easeInOut" }
    }
  };
};

export const getListContentVariants = (isDesktop: boolean): Variants => ({
  initial: {
    opacity: 0,
    y: isDesktop ? -50 : 50
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      y: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 }
    }
  },
  animateWithDelay: {
    opacity: 1,
    y: 0,
    transition: {
      y: { type: "spring", stiffness: 300, damping: 30, delay: CONTAINER_DURATION },
      opacity: { duration: 0.2, delay: CONTAINER_DURATION }
    }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3 }
  }
});

export const getDetailContainerVariants = (isDesktop: boolean): Variants => ({
  fullWidth: {
    width: "100%",
    transition: { duration: DETAIL_CONTAINER_DURATION, ease: "easeInOut" }
  },
  partialWidth: {
    width: isDesktop ? "61.8%" : "100%",
    transition: { duration: DETAIL_CONTAINER_DURATION, ease: "easeInOut" }
  }
});

export const getDetailContentVariants = (isDesktop: boolean, transitionType: TransitionType): Variants => {
  if (transitionType === 'route') {
    return {
      initial: {
        opacity: 0,
        y: -300
      },
      animate: {
        opacity: 1,
        y: 0,
        transition: {
          y: { type: "spring", stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 }
        }
      },
      animateWithDelay: {
        opacity: 1,
        y: 0,
        transition: {
          y: { type: "spring", stiffness: 300, damping: 30, delay: DETAIL_CONTAINER_DURATION },
          opacity: { duration: 0.2, delay: DETAIL_CONTAINER_DURATION }
        }
      },
      exit: {
        opacity: 0,
        transition: { duration: 0.7 }
      }
    };
  }

  return {
    initial: {
      opacity: 0,
      x: isDesktop ? 0 : 300
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        x: isDesktop ? undefined : { type: "spring", stiffness: 300, damping: 30 },
        duration: 0.3
      }
    },
    animateWithDelay: {
      opacity: 1,
      x: 0,
      transition: {
        x: isDesktop ? undefined : { 
          type: "spring", 
          stiffness: 300, 
          damping: 30,
          delay: DETAIL_CONTAINER_DURATION 
        },
        opacity: { duration: 0.3, delay: DETAIL_CONTAINER_DURATION }
      }
    },
    exit: {
      opacity: 0,
      x: isDesktop ? 0 : -300,
      transition: { duration: 0.3 }
    }
  };
};