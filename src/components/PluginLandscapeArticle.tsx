import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { FaArrowLeft, FaSearch } from 'react-icons/fa';
import landscapeSource from '../data/pluginLandscape.md?raw';

const ARTICLE_DESCRIPTION =
  'A searchable, source-linked reference to 205 DeepSeek Harness plugins across 48 package groups.';
const focusRingClassName =
  'focus-visible:outline-[3px] focus-visible:outline-blue focus-visible:outline-offset-4';
const selectClassName =
  `w-full min-w-0 rounded-none border border-line bg-paper px-3 py-3 text-ink outline-none focus:border-blue ${focusRingClassName}`;

type ModelEffect = 'direct' | 'indirect' | 'none';

type PluginEntry = {
  name: string;
  paragraphs: string[];
  effects: ModelEffect[];
  searchText: string;
};

type PluginGroup = {
  name: string;
  description: string;
  entries: PluginEntry[];
};

const effectOptions: Array<{ value: ModelEffect | 'all'; label: string }> = [
  { value: 'all', label: 'All effects' },
  { value: 'direct', label: 'Direct' },
  { value: 'indirect', label: 'Indirect' },
  { value: 'none', label: 'None' },
];

const plainText = (markdown: string) => markdown
  .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
  .replace(/`([^`]+)`/g, '$1');

const parseLandscape = (markdown: string): PluginGroup[] => {
  const pluginSection = markdown
    .split('<a id="plugin-landscape"></a>')[1]
    ?.split('<a id="further-exploration"></a>')[0];

  if (!pluginSection) return [];

  return pluginSection.split(/\n### /).slice(1).map((groupChunk) => {
    const firstBreak = groupChunk.indexOf('\n');
    const name = groupChunk.slice(0, firstBreak).trim();
    const [descriptionChunk, ...entryChunks] = groupChunk.slice(firstBreak + 1).split(/\n#### /);
    const description = descriptionChunk.trim();

    const entries = entryChunks.map((entryChunk) => {
      const headingBreak = entryChunk.indexOf('\n');
      const entryName = entryChunk.slice(0, headingBreak).replace(/`/g, '').trim();
      const paragraphs = entryChunk
        .slice(headingBreak + 1)
        .replace(/\n-----\s*$/, '')
        .trim()
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.replace(/\s*\n\s*/g, ' ').trim())
        .filter(Boolean);
      const modelEffect = paragraphs.find((paragraph) => paragraph.startsWith('Model effect')) ?? '';
      const effects = effectOptions
        .map(({ value }) => value)
        .filter((value): value is ModelEffect => (
          value !== 'all' && new RegExp(`\\b${value}\\b`, 'i').test(modelEffect)
        ));

      return {
        name: entryName,
        paragraphs,
        effects,
        searchText: plainText(`${name} ${entryName} ${paragraphs.join(' ')}`).toLocaleLowerCase(),
      };
    });

    return { name, description, entries };
  });
};

const landscape = parseLandscape(landscapeSource);
const pluginCount = landscape.reduce((total, group) => total + group.entries.length, 0);

const InlineMarkdown = ({ children }: { children: string }) => {
  const parts: ReactNode[] = [];
  const tokenPattern = /(`[^`]+`|\[[^\]]+]\([^)]+\))/g;
  let cursor = 0;

  for (const match of children.matchAll(tokenPattern)) {
    const index = match.index ?? 0;
    if (index > cursor) parts.push(children.slice(cursor, index));

    const token = match[0];
    if (token.startsWith('`')) {
      parts.push(<code key={index}>{token.slice(1, -1)}</code>);
    } else {
      const link = token.match(/^\[([^\]]+)]\(([^)]+)\)$/);
      if (link) {
        parts.push(
          <a
            className={focusRingClassName}
            key={index}
            href={link[2]}
            target="_blank"
            rel="noreferrer"
          >
            {link[1]}
          </a>,
        );
      }
    }

    cursor = index + token.length;
  }

  if (cursor < children.length) parts.push(children.slice(cursor));
  return parts;
};

const effectClassName = (effect: ModelEffect) => {
  if (effect === 'direct') return 'border-orange text-orange';
  if (effect === 'indirect') return 'border-blue text-blue';
  return 'border-muted text-muted';
};

export const PluginLandscapeArticle = () => {
  const [query, setQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedEffect, setSelectedEffect] = useState<ModelEffect | 'all'>('all');

  useEffect(() => {
    const previousTitle = document.title;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = description?.content;
    document.title = 'DeepSeek Harness Plugin Landscape — Aman Mamgain';
    if (description) description.content = ARTICLE_DESCRIPTION;

    return () => {
      document.title = previousTitle;
      if (description && previousDescription) description.content = previousDescription;
    };
  }, []);

  const filteredGroups = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    return landscape
      .filter((group) => selectedGroup === 'all' || group.name === selectedGroup)
      .map((group) => ({
        ...group,
        entries: group.entries.filter((entry) => (
          (!normalizedQuery || entry.searchText.includes(normalizedQuery))
          && (selectedEffect === 'all' || entry.effects.includes(selectedEffect))
        )),
      }))
      .filter((group) => group.entries.length > 0);
  }, [query, selectedEffect, selectedGroup]);

  const visibleCount = filteredGroups.reduce((total, group) => total + group.entries.length, 0);

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <header className="border-b border-line bg-paper/95">
        <div className="mx-auto flex min-h-16 w-full max-w-page items-center px-page-gutter-compact sm:px-page-gutter">
          <a
            className={`inline-flex items-center gap-2.5 font-bold text-ink no-underline ${focusRingClassName}`}
            href="/articles/"
          >
            <FaArrowLeft aria-hidden="true" /> Articles
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-page px-page-gutter-compact py-10 sm:px-page-gutter sm:py-12">
        <header className="mb-7 sm:mb-9">
          <p className="text-caption font-bold uppercase tracking-widest text-orange">Reference</p>
          <h1 className="mt-2 text-h1">DeepSeek Harness plugins</h1>
          <p className="mt-2 text-xs text-muted">{pluginCount} plugins · {landscape.length} groups · source-linked</p>
        </header>

        <div className="sticky top-0 z-10 grid grid-cols-2 gap-2 border-y border-line bg-paper/95 py-3 backdrop-blur-md md:grid-cols-6">
          <label className="col-span-2 flex min-w-0 items-center gap-3 border border-line bg-paper px-3 focus-within:border-blue md:col-span-4">
            <FaSearch className="shrink-0 text-caption text-muted" aria-hidden="true" />
            <input
              className={`min-w-0 flex-1 bg-transparent py-3 text-ink outline-none ${focusRingClassName}`}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${pluginCount} plugins`}
              aria-label="Search plugins"
            />
          </label>
          <select
            className={selectClassName}
            value={selectedGroup}
            onChange={(event) => setSelectedGroup(event.target.value)}
            aria-label="Filter by group"
          >
            <option value="all">All groups</option>
            {landscape.map((group) => (
              <option key={group.name} value={group.name}>{group.name}</option>
            ))}
          </select>
          <select
            className={selectClassName}
            value={selectedEffect}
            onChange={(event) => setSelectedEffect(event.target.value as ModelEffect | 'all')}
            aria-label="Filter by model effect"
          >
            {effectOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <p className="mt-3 text-caption text-muted" aria-live="polite">
          {visibleCount} {visibleCount === 1 ? 'plugin' : 'plugins'}
        </p>

        {filteredGroups.map((group) => (
          <section className="scroll-mt-20 pt-10 sm:pt-12" key={group.name} id={group.name}>
            <div className="flex items-baseline gap-3">
              <h2 className="text-h2">{group.name}</h2>
              <span className="text-xs font-bold text-orange">{group.entries.length}</span>
            </div>
            <p className="mt-2 max-w-content text-sm-plus leading-relaxed text-muted [&_a]:text-inherit [&_a]:underline-offset-4 [&_code]:font-inherit [&_code]:text-ink">
              <InlineMarkdown>{group.description}</InlineMarkdown>
            </p>

            <div className="mt-4 border-t border-line">
              {group.entries.map((entry) => (
                <article
                  className="grid grid-cols-1 gap-4 border-b border-line py-6 md:grid-cols-3 md:gap-8"
                  key={entry.name}
                >
                  <header className="min-w-0">
                    <h3 className="break-words font-mono text-h3 font-semibold">
                      {entry.name}
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Model effects">
                      {entry.effects.map((effect) => (
                        <span
                          className={`border px-1.5 py-1 text-caption font-bold uppercase tracking-wider ${effectClassName(effect)}`}
                          key={effect}
                        >
                          {effect}
                        </span>
                      ))}
                    </div>
                  </header>
                  <div className="text-sm-plus leading-relaxed text-ink md:col-span-2 [&_a]:text-blue [&_a]:underline-offset-4 [&_code]:font-mono [&_code]:text-code-sm [&_p+p]:mt-3.5 [&_p:nth-child(2)]:text-muted">
                    {entry.paragraphs.map((paragraph, index) => (
                      <p key={index}><InlineMarkdown>{paragraph}</InlineMarkdown></p>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}

        {visibleCount === 0 ? <p className="py-16 text-md text-muted">No plugins match those filters.</p> : null}

        <p className="mt-16 border-t border-line pt-5 text-xs text-muted">
          Independent reference. Counts reflect the reviewed source inventory and will change with the project.
        </p>
      </main>
    </div>
  );
};
