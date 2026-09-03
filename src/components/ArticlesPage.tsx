import { useEffect } from 'react';
import { FaArrowLeft, FaArrowRight, FaExternalLinkAlt } from 'react-icons/fa';
import { articles } from '../data/articles';

const PAGE_DESCRIPTION = 'Articles by Aman Mamgain on software, systems, and applied AI.';
const focusRingClassName =
  'focus-visible:outline-[3px] focus-visible:outline-blue focus-visible:outline-offset-4';

export const ArticlesPage = () => {
  useEffect(() => {
    const previousTitle = document.title;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = description?.content;
    document.title = 'Articles — Aman Mamgain';
    if (description) description.content = PAGE_DESCRIPTION;

    return () => {
      document.title = previousTitle;
      if (description && previousDescription) description.content = previousDescription;
    };
  }, []);

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <header className="border-b border-line">
        <div className="mx-auto flex min-h-16 w-full max-w-page items-center px-page-gutter-compact sm:px-page-gutter">
          <a
            className={`inline-flex items-center gap-2.5 font-bold text-ink no-underline ${focusRingClassName}`}
            href="/"
          >
            <FaArrowLeft aria-hidden="true" /> Aman Mamgain
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-page px-page-gutter-compact py-10 sm:px-page-gutter sm:py-12">
        <header className="mb-8 sm:mb-10">
          <p className="text-caption font-bold uppercase tracking-widest text-orange">Writing</p>
          <h1 className="mt-2 text-h1">Articles</h1>
        </header>

        <div className="border-t border-line">
          {articles.map((article, index) => (
            <a
              className={`group flex items-start gap-3 border-b border-line py-6 text-ink no-underline sm:gap-6 sm:py-7 ${focusRingClassName}`}
              key={article.href}
              href={article.href}
              target={article.external ? '_blank' : undefined}
              rel={article.external ? 'noreferrer' : undefined}
            >
              <span className="shrink-0 pt-1 font-mono text-caption text-muted">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap gap-x-4 gap-y-2 text-caption uppercase tracking-wider text-muted">
                  <span className="font-bold text-orange">{article.source}</span>
                  <time dateTime={article.publishedAt}>{article.publishedLabel}</time>
                </p>
                <h2 className="mt-2 text-h2">{article.title}</h2>
                <p className="mt-2 max-w-2xl text-md leading-relaxed text-muted">{article.summary}</p>
              </div>
              <span
                className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-caption transition duration-150 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:border-orange group-hover:text-orange"
                aria-hidden="true"
              >
                {article.external ? <FaExternalLinkAlt /> : <FaArrowRight />}
              </span>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
};
