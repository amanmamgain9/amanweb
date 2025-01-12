import { Variants } from 'framer-motion';

interface AnimationState {
  initial: string;
  animate: string;
}

const CONTAINER_DURATION = 0.6;
// const DETAIL_CONTAINER_DURATION = 4.7;


export const getListContainerAnimateInfo = (
  hasListContent: boolean,
  showMobileDetail: boolean
): AnimationState => {
  return {
    initial: "hidden",
    animate: hasListContent 
      ? (showMobileDetail ? "hidden" : "visible") 
      : "hidden"
  };
};

export const getListContentInfo = (
  hasContainerTransition: boolean
): AnimationState => {
  return {
    initial: "hidden",
    animate: hasContainerTransition ? "visibleWithDelay" : "visible"
  };
};

export const getDetailContainerAnimateInfo = (
  hasListContent: boolean,
  isDesktop: boolean,
  isHidden: boolean
): AnimationState => {
  if (isHidden) {
    return {
      initial: "hidden",
      animate: "hidden"
    };
  }
  
  return {
    initial: "expanded",
    animate: hasListContent && isDesktop ? "collapsed" : "expanded"
  };
};

export const getDetailContentInfo = (
  hasContainerTransition: boolean
): AnimationState => {
  return {
    initial: "hidden",
    animate: hasContainerTransition ? "visibleWithDelay" : "visible"
  };
};

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
  hidden: {
    opacity: 0,
    y: isDesktop ? -50 : 50
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      y: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 }
    }
  },
  visibleWithDelay: {
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
  expanded: {
    width: "100%",
    transition: { duration: CONTAINER_DURATION, ease: "easeInOut" }
  },
  collapsed: {
    width: isDesktop ? "61.8%" : "100%",
    transition: { duration: CONTAINER_DURATION, ease: "easeInOut" }
  },
  hidden: {
    width: "0%"
  },
});

export const getDetailContentVariants = (isDesktop: boolean): Variants => {
    return {
      hidden: {
        opacity: 0,
        y: -300
      },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          y: { type: "spring", stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 }
        }
      },
      visibleWithDelay: {
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
    };
};