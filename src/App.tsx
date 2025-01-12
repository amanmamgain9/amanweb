import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'
import { Navbar } from './components/Navbar'
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { ShowcaseList, ShowcaseDetail } from './components/Showcase'
import { AboutPage } from './components/AboutPage'
import { WDYGDTWList, WDYGDTWContent } from './components/WDYGDTWPage'
import { showcaseItems, getDefaultShowcase } from './data/showcaseItems'
import { getCurrentMonthDefault } from './data/weekData'
import styled from 'styled-components'
import { 
  getListContainerVariants, 
  getListContentVariants,
  getDetailContainerVariants,
  getDetailContentVariants
} from './libs/mainPageAnimate'

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #0a1929;
  color: #00f0ff;

  @media (max-width: 768px) {
    flex-direction: column-reverse;
    height: 100vh;
    overflow: hidden;
    position: relative;
  }
`

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
`

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
`

const ListSection = styled(motion.div)<{ isMobileView?: boolean; showingContent?: boolean }>`
  overflow: auto;
  width: 38.2%;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    width: 100%;
    height: 100%;
    display: ${props => props.isMobileView && props.showingContent ? 'none' : 'flex'};
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

const DetailSection = styled(motion.div)<{ isMobileView?: boolean; hideOnMobile?: boolean; showingContent?: boolean }>`
  background-color: #0a1929;
  position: relative;
  min-height: 500px;
  display: flex;
  flex-direction: column;
  flex: 1;
  
  @media (max-width: 768px) {
    display: ${props => (props.hideOnMobile && !props.showingContent) ? 'none' : 'flex'};
  }
`

const ContentSlot = styled(motion.div)<{ hasBackButton?: boolean }>`
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;

  @media (max-width: 768px) {
    padding-top: ${props => props.hasBackButton ? '60px' : '0'};
  }
`

// Custom hooks
const usePrevious = <T,>(value: T): T | undefined => {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};

const useTransitionType = (currentRoute: string, selectedItemId: string | null): 'route' | 'item' => {
  const prevRoute = usePrevious(currentRoute);
  const prevItemId = usePrevious(selectedItemId);
  
  return prevRoute !== currentRoute ? 'route' : 'item';
};

function AppContent() {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768)
  const [showMobileDetail, setShowMobileDetail] = useState(false)
  const [hideList, setHideList] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const [currentRoute, setCurrentRoute] = useState(location.pathname.slice(1).toUpperCase() || 'HOME')
  const transitionType = useTransitionType(currentRoute, selectedItemId);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, []);

  useEffect(() => {
    const pathParts = location.pathname.slice(1).split('/')
    const path = pathParts[0].toUpperCase() || 'HOME'
    const id = pathParts[1]
    
    setCurrentRoute(path)
    
    // Handle auto-selection for desktop view
    if (!id && !isMobileView) {
      if (path === 'WDYGDTW') {
        setSelectedItemId(getCurrentMonthDefault())
      } else if (path === 'PROJECTS') {
        setSelectedItemId(getDefaultShowcase())
      }
    } else {
      setSelectedItemId(id || null)
    }
    
    if (id || !['PROJECTS', 'WDYGDTW'].includes(path)) {
      setShowMobileDetail(true)
    } else {
      setShowMobileDetail(false)
    }
  }, [location, isMobileView])
  

  const hasListContent = ['PROJECTS', 'WDYGDTW'].includes(currentRoute)
  const prevHasListContent = usePrevious(hasListContent);

  const renderList = () => {
    switch (currentRoute) {
      case 'PROJECTS':
        return (
          <ShowcaseList
            onItemSelect={handleItemSelect}
            isVisible={true}
          />
        )
      case 'WDYGDTW':
        return (
          <WDYGDTWList
            onWeekSelect={handleItemSelect}
          />
        )
      default:
        return null
    }
  }

  const renderContent = () => {
    switch (currentRoute) {
      case 'PROJECTS':
        return selectedItemId && (
          <ShowcaseDetail 
            onClose={handleBackToList} 
            selectedId={selectedItemId}
          />
        )
      case 'HOME':
        return <AboutPage />
      case 'WDYGDTW':
        return selectedItemId && (
          <WDYGDTWContent 
            weekId={selectedItemId}
            onFocusSelect={focusItemSelect}
          />
        )
      default:
        return null
    }
  }

  const handlePageChange = (page: string) => {
    if (page === currentRoute) return
    navigate(`/${page.toLowerCase()}`)
  }

  const handleItemSelect = (id: string) => {
    if (id === selectedItemId) return;
    navigate(`/${currentRoute.toLowerCase()}/${id}`)
  }

  const focusItemSelect = (id: string) => {
    setSelectedItemId(id);
    setHideList(true);
  }

  const handleBackToList = () => {
    navigate(`/${currentRoute.toLowerCase()}`)
  }

  const isDesktop = !isMobileView;
  const hasContainerTransition = prevHasListContent !== hasListContent && prevHasListContent !== undefined;

  return (
    <Routes>
      <Route path="*" element={
        <Container>
          <Navbar 
            activePage={currentRoute}
            onPageChange={handlePageChange}
          />
          <ContentContainer>
            <MainContent>
              <ListSection
                key={!isDesktop ? (showMobileDetail ? 'detail' : 'list') : 'persistent'}
                initial={isDesktop ? "visible" : "hidden"}
                animate={hasListContent ? (showMobileDetail && !isDesktop ? "hidden" : "visible") : "hidden"}
                variants={getListContainerVariants(isDesktop)}
                style={{ 
                  borderRightStyle: isDesktop ? 'solid' : 'none'
                }}
                isMobileView={!isDesktop}
                showingContent={showMobileDetail || hideList}
              >
                <AnimatePresence mode="wait">
                  {hasListContent && (
                    <>
                      <MobileHeader>
                        {currentRoute}
                      </MobileHeader>
                      <ContentSlot
                        key="list"
                        variants={getListContentVariants(isDesktop)}
                        initial="initial"
                        animate={hasContainerTransition ? "animateWithDelay" : "animate"}
                        exit="exit"
                      >
                        {renderList()}
                      </ContentSlot>
                    </>
                  )}
                </AnimatePresence>
              </ListSection>
              
              <DetailSection
                initial="fullWidth"
                animate={hasListContent && isDesktop ? "partialWidth" : "fullWidth"}
                variants={getDetailContainerVariants(isDesktop)}
                isMobileView={!isDesktop}
                showingContent={showMobileDetail}
                hideOnMobile={hasListContent}
              >
                {!isDesktop && hasListContent && (
                  <BackButton onClick={handleBackToList}>
                    {`<`} Back
                  </BackButton>
                )}
                <AnimatePresence mode="wait">
                  <ContentSlot
                    key={currentRoute + selectedItemId}
                    variants={getDetailContentVariants(isDesktop, transitionType)}
                    initial="initial"
                    animate={hasContainerTransition ? "animateWithDelay" : "animate"}
                    exit="exit"
                    hasBackButton={!isDesktop && hasListContent}
                  >
                    {renderContent()}
                  </ContentSlot>
                </AnimatePresence>
              </DetailSection>
            </MainContent>
          </ContentContainer>
        </Container>
      } />
    </Routes>
  )
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
