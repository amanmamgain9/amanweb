import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { LIST_CONTENT_ROUTES } from './utils/constants';
import { parseRoute, getDefaultSelection } from './utils/routeParser';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { ShowcaseList, ShowcaseDetail } from './components/Showcase';
import { AboutPage } from './components/AboutPage';
import { WDYGDTWList, WDYGDTWContent } from './components/WDYGDTWPage';
import styled from 'styled-components';
import { 
  getListContainerVariants, 
  getListContentVariants,
  getDetailContainerVariants,
  getDetailContentVariants,
  getListContainerAnimateInfo,
  getListContentInfo,
  getDetailContainerAnimateInfo,
  getDetailContentInfo
} from './libs/mainPageAnimate';

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 100vh;
  min-height: 100vh;
  background-color: #0a1929;
  color: #00f0ff;

  @media (max-width: 768px) {
    flex-direction: column-reverse;
    height: 100vh;
    overflow: hidden;
    position: relative;
  }
`;

const ContentContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem;
  padding-top: 6rem;

  @media (max-width: 768px) {
    padding: 0;
    height: calc(100vh - 64px);
    overflow: hidden;
    padding-bottom: 64px;
  }
`;

const MobileHeader = styled.div`
  display: none;
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: rgba(0, 240, 255, 0.1);
    border-bottom: 1px solid rgba(0, 240, 255, 0.2);
    font-family: 'Press Start 2P';
    color: #00f0ff;
    font-size: 1.1em;
    position: sticky;
    top: 0;
    z-index: 10;
  }
`;

const ListSection = styled(motion.div)`
  overflow: auto;
  width: 38.2%;
  flex-direction: column;

  @media (max-width: 768px) {
    width: 100%;
    height: 100%;
  }
`;

const MainContent = styled(motion.div)`
  width: 100%;
  max-width: 1200px;
  height: calc(100vh - 12rem);
  display: flex;
  flex-direction: row;
  background: rgba(10, 25, 41, 0.8);
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  @media (max-width: 768px) {
    height: 100%;
    border: none;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
  }
`;

const BackButton = styled.button`
  display: none;
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    background: rgba(0, 240, 255, 0.1);
    border: 1px solid rgba(0, 240, 255, 0.3);
    color: #00f0ff;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    position: absolute;
    top: 16px;
    left: 16px;
    z-index: 10;
    font-family: 'Press Start 2P';
    &:hover {
      background: rgba(0, 240, 255, 0.2);
    }
  }
`;

const DetailSection = styled(motion.div)`
  background-color: #0a1929;
  position: relative;
  min-height: 500px;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const ContentSlot = styled(motion.div)<{ hasBackButton?: boolean }>`
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;

  @media (max-width: 768px) {
    padding-top: ${props => props.hasBackButton ? '60px' : '0'};
    min-height: calc(100vh - 123px);
  }
`;

// Types for state management
interface AppState {
  currentRoute: string;
  selectedItemId: string | null;
  isFocused: boolean;
  showMobileDetail: boolean;
  hasListContent: boolean;
}

// Custom hooks
const usePrevious = <T,>(value: T): T | undefined => {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};

function AppContent() {
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Batch all related state into a single object
  const [state, setState] = useState<AppState>(() => {
    const initialRoute = location.pathname.slice(1).toUpperCase() || 'HOME';
    return {
      currentRoute: initialRoute,
      selectedItemId: null,
      isFocused: false,
      showMobileDetail: false,
      hasListContent: LIST_CONTENT_ROUTES.includes(initialRoute as any)
    };
  });

  const prevHasListContent = usePrevious(state.hasListContent);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const { currentRoute, selectedId, isFocused, showMobileDetail } = parseRoute(location.pathname, isMobileView);
    
    // Batch all state updates together
    setState(() => {
      const newState = {
        currentRoute,
        selectedItemId: selectedId || (
          !selectedId ? getDefaultSelection(currentRoute, isMobileView) : null
        ),
        isFocused,
        showMobileDetail,
        hasListContent: LIST_CONTENT_ROUTES.includes(currentRoute as any) && !isFocused
      };
      
      return newState;
    });
  }, [location, isMobileView]);

  const handlePageChange = (page: string) => {
    if (page === state.currentRoute) return;
    navigate(`/${page.toLowerCase()}`);
  };

  const handleItemSelect = (id: string) => {
    if (id === state.selectedItemId) return;
    navigate(`/${state.currentRoute.toLowerCase()}/${id}`);
  };

  const focusItemSelect = (id: string) => {
    if (state.currentRoute === 'WDYGDTW') {
      const [monthId, weekNum] = id.split('/');
      navigate(`/${state.currentRoute.toLowerCase()}/${monthId}/${weekNum}`);
    } else {
      navigate(`/${state.currentRoute.toLowerCase()}/${id}/focus`);
    }
  };

  const unsetFocus = () => {
    const monthId = state.selectedItemId?.split('/')[0];
    if (monthId) {
      navigate(`/wdygdtw/${monthId}`);
    } else {
      navigate('/wdygdtw');
    }
  };

  const handleBackToList = () => {
    navigate(`/${state.currentRoute.toLowerCase()}`);
  };

  const renderList = () => {
    switch (state.currentRoute) {
      case 'PROJECTS':
        return <ShowcaseList onItemSelect={handleItemSelect} isVisible={true} />;
      case 'WDYGDTW':
        return <WDYGDTWList onWeekSelect={handleItemSelect} />;
      default:
        return null;
    }
  };

  const renderContent = () => {
    switch (state.currentRoute) {
      case 'PROJECTS':
        return state.selectedItemId && (
          <ShowcaseDetail 
            onClose={handleBackToList} 
            selectedId={state.selectedItemId}
          />
        );
      case 'HOME':
        return <AboutPage />;
      case 'WDYGDTW':
        return (
          <WDYGDTWContent
            key={location.pathname}
            onFocusSelect={focusItemSelect}
            onUnsetFocus={unsetFocus}
            pathname={location.pathname}
          />
        );
      default:
        return null;
    }
  };

  const isDesktop = !isMobileView;
  const hasContainerTransition = prevHasListContent !== state.hasListContent && 
    prevHasListContent !== undefined || (!isDesktop && state.hasListContent);
  const isDetailContainerHidden = !isDesktop && state.hasListContent && !state.showMobileDetail;
  console.log('hasContainerTransition:', hasContainerTransition);
  console.log("preHasListContent:", prevHasListContent);
  
  return (
    <Routes>
      <Route 
        path="*" 
        element={
          <Container>
            <Navbar 
              activePage={state.currentRoute}
              onPageChange={handlePageChange}
            />
            <ContentContainer>
              <MainContent>
                <ListSection
                  key="list"
                  {...getListContainerAnimateInfo(state.hasListContent, state.showMobileDetail)}
                  variants={getListContainerVariants(isDesktop)}
                  style={{ 
                    borderRightStyle: isDesktop ? 'solid' : 'none',
                  }}
                >
                  <AnimatePresence mode="wait">
                    {state.hasListContent && (
                      <>
                        <MobileHeader>
                          {state.currentRoute}
                        </MobileHeader>
                        <ContentSlot
                          key={state.currentRoute}
                          // key={!isDesktop? location.pathname : state.currentRoute}
                          variants={getListContentVariants(isDesktop)}
                          {...getListContentInfo(hasContainerTransition)}
                          exit="exit"
                        >
                          {renderList()}
                        </ContentSlot>
                      </>
                    )}
                  </AnimatePresence>
                </ListSection>
                
                <DetailSection
                  {...getDetailContainerAnimateInfo(state.hasListContent, isDesktop, isDetailContainerHidden)}
                  variants={getDetailContainerVariants(isDesktop)}
                >
                  {!isDesktop && state.hasListContent && state.showMobileDetail && (
                    <BackButton onClick={handleBackToList}>
                      {`<`} Back
                    </BackButton>
                  )}
                  <AnimatePresence mode="wait">
                    <ContentSlot
                      key={location.pathname}
                      // key={isDesktop ? location.pathname : state.currentRoute}
                      variants={getDetailContentVariants(isDesktop)}
                      {...getDetailContentInfo(hasContainerTransition)}
                      hasBackButton={!isDesktop && state.hasListContent}
                      exit="exit"
                    >
                      {renderContent()}
                    </ContentSlot>
                  </AnimatePresence>
                </DetailSection>
              </MainContent>
            </ContentContainer>
          </Container>
        } 
      />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}