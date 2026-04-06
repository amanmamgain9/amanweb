import { useEffect, useState } from 'react';
import type { ExperienceEntry } from '../data/homeContent';

export const useActiveExperience = (items: ExperienceEntry[]) => {
  const [activeId, setActiveId] = useState(items[0]?.id ?? '');

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (!sections.length) return;
    let frame = 0;
    let lastScrollY = window.scrollY;

    const pickActive = () => {
      const currentScrollY = window.scrollY;
      const direction = currentScrollY >= lastScrollY ? 1 : -1;
      lastScrollY = currentScrollY;
      const triggerY = window.innerHeight * (direction > 0 ? 0.4 : 0.28);
      const containing = sections.find((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= triggerY && rect.bottom >= triggerY;
      });

      if (containing) {
        setActiveId((current) => (current === containing.id ? current : containing.id));
        return;
      }

      if (direction > 0) {
        const passed = sections
          .map((section) => ({ id: section.id, top: section.getBoundingClientRect().top }))
          .filter((section) => section.top <= triggerY)
          .pop();

        if (passed) {
          setActiveId((current) => (current === passed.id ? current : passed.id));
          return;
        }
      } else {
        const upcoming = sections
          .map((section) => ({ id: section.id, bottom: section.getBoundingClientRect().bottom }))
          .find((section) => section.bottom >= triggerY);

        if (upcoming) {
          setActiveId((current) => (current === upcoming.id ? current : upcoming.id));
          return;
        }
      }

      const nearest = sections
        .map((section) => {
          const rect = section.getBoundingClientRect();
          const center = rect.top + rect.height / 2;
          return { id: section.id, distance: Math.abs(center - triggerY) };
        })
        .sort((a, b) => a.distance - b.distance)[0];

      if (nearest) {
        setActiveId((current) => (current === nearest.id ? current : nearest.id));
      }
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        pickActive();
      });
    };

    pickActive();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [items]);

  return activeId;
};
