import { motion, AnimatePresence, Variants } from 'framer-motion';
import styled from 'styled-components';
type PageLayout = 'split' | 'full'

const ListSection = styled(motion.div)`
  width: 300px;
  height: 100%;
  border-right: 1px solid rgba(0, 240, 255, 0.2);
  overflow-y: auto;
  
  @media (max-width: 768px) {
    width: 100%;
    height: 50%;
  }
`;

const DetailSection = styled(motion.div)`
  flex: 1;
  height: 100%;
  overflow-y: auto;
`;

const ContentSlot = styled(motion.div)`
  height: 100%;
`;

const listVariants: Variants = {
  collapsed: { width: 0, opacity: 0 },
  expanded: { width: '300px', opacity: 1 }
};

const contentVariants: Variants = {
  full: { width: '100%' },
  expanded: { width: 'calc(100% - 300px)' }
};

const slotVariants = {
  itemTransition: {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  }
};


const MainContent = styled(motion.div)`
  width: 100%;
  max-width: 1200px;
  height: calc(100vh - 12rem); // Fixed height accounting for padding and navbar
  display: flex;
  flex-direction: row;
  background: rgba(10, 25, 41, 0.8);
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
    border-radius: 0;
    border: none;
  }
`
const AnimatedLayout: React.FC<{
  layout: PageLayout;
  ListComponent?: React.ComponentType<any>;
  ContentComponent: React.ComponentType<any>;
  listProps?: any;
  contentProps?: any;
}> = ({ layout, ListComponent, ContentComponent, listProps, contentProps }) => {
  return (
    <MainContent>
      <AnimatePresence mode="wait">
        {layout === 'split' && ListComponent && (
          <ListSection
            initial="collapsed"
            animate="expanded"
            variants={listVariants}
          >
            <ContentSlot>
              <ListComponent {...listProps} />
            </ContentSlot>
          </ListSection>
        )}
      </AnimatePresence>

      <DetailSection
        initial="full"
        animate={layout === 'split' ? "expanded" : "full"}
        variants={contentVariants}
      >
        <AnimatePresence mode="wait">
          <ContentSlot
            key={contentProps?.selectedId || 'content'}
            variants={slotVariants.itemTransition}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <ContentComponent {...contentProps} />
          </ContentSlot>
        </AnimatePresence>
      </DetailSection>
    </MainContent>
  )
}
export default AnimatedLayout;
