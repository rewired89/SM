import MediaGrid from './MediaGrid.jsx';
import LinkChips from './LinkChips.jsx';

export default function Attachments({ entity, title = 'Pitch deck, media and links' }) {
  if (!entity.media?.length && !entity.links?.length) return null;
  return (
    <section className="stack" aria-label={title}>
      <h2>{title}</h2>
      <MediaGrid media={entity.media} />
      <LinkChips links={entity.links} />
    </section>
  );
}
