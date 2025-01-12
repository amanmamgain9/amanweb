import { ROUTES, LIST_CONTENT_ROUTES } from './constants';
import { getCurrentMonthDefault } from '../data/weekData';
import { getDefaultShowcase } from '../data/showcaseItems';

interface RouteState {
  currentRoute: string;
  selectedId: string | null;
  isFocused: boolean;
  showMobileDetail: boolean;
  fullRoute: string;
}

export const parseRoute = (pathname: string, isMobileView:boolean): RouteState => {
  const pathParts = pathname.slice(1).split('/');
  const path = pathParts[0].toUpperCase() || 'HOME';
  let selectedId = null;
  let isFocused = false;

  if (path === ROUTES.WDYGDTW && pathParts[1]) {
    selectedId = pathParts[1];
    if (pathParts[2]) {
      selectedId = `${pathParts[1]}/${pathParts[2]}`;
      isFocused = true;
    }
  } else if (pathParts[1]) {
    selectedId = pathParts[1];
    isFocused = pathParts[2] === 'focus';
  }

  let showMobileDetail = !!(selectedId || !LIST_CONTENT_ROUTES.includes(path as any));
  if(!isMobileView) {
    showMobileDetail = false;
  }
  return {
    currentRoute: path,
    selectedId,
    isFocused,
    showMobileDetail
  };
};

export const getDefaultSelection = (path: string, isMobileView: boolean): string | null => {
  if (!isMobileView) {
    if (path === ROUTES.WDYGDTW) {
      return getCurrentMonthDefault();
    } else if (path === ROUTES.PROJECTS) {
      return getDefaultShowcase();
    }
  }
  return null;
};
