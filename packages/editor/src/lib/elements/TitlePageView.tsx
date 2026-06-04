import type { PageFormat } from '../ScriptEditor';

import { parseTitlePage } from './parseTitlePage';

export type TitlePageViewProps = {
  lines: string[];
  pageFormat?: PageFormat;
};

export function TitlePageView({
  lines,
  pageFormat = 'us-letter',
}: TitlePageViewProps) {
  const data = parseTitlePage(lines);

  return (
    <div className="title-page-sheet" data-page-format={pageFormat}>
      <div className="title-page-centre">
        {data.title.map((line, index) => (
          <p key={`title-${index}`} className="title-page-title">
            {line}
          </p>
        ))}
        {data.credit ? (
          <p className="title-page-credit">{data.credit}</p>
        ) : null}
        {data.author?.map((line, index) => (
          <p key={`author-${index}`} className="title-page-author">
            {line}
          </p>
        ))}
        {data.source ? (
          <p className="title-page-source">{data.source}</p>
        ) : null}
      </div>
      <div className="title-page-footer">
        {data.contact && data.contact.length > 0 ? (
          <div className="title-page-contact">
            {data.contact.map((line, index) => (
              <p key={`contact-${index}`}>{line}</p>
            ))}
          </div>
        ) : (
          <div />
        )}
        <div className="title-page-meta">
          {data.draftDate ? <p>{data.draftDate}</p> : null}
          {data.copyright ? <p>{data.copyright}</p> : null}
          {data.notes ? <p>{data.notes}</p> : null}
        </div>
      </div>
    </div>
  );
}
