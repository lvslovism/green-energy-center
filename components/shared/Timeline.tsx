/**
 * 共用 timeline 元件，technology / about 頁皆使用。
 * 左側 vertical line + 圓點 marker，右側 year + content。
 */

export type TimelineNode = {
  year: string;
  content: string;
};

export default function Timeline({ nodes }: { nodes: TimelineNode[] }) {
  return (
    <ol className="timeline">
      {nodes.map((n) => (
        <li className="timeline-item" key={`${n.year}-${n.content}`}>
          <div className="timeline-dot" aria-hidden />
          <div className="timeline-content">
            <div className="timeline-year">{n.year}</div>
            <div className="timeline-text">{n.content}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}
