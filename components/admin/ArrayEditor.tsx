"use client";
import { ChevronUp, ChevronDown, Trash2, Plus } from "lucide-react";

type Props<T> = {
  items: T[];
  onChange: (next: T[]) => void;
  newItem: () => T;
  renderItem: (item: T, index: number, update: (patch: Partial<T>) => void) => React.ReactNode;
  itemLabel?: (index: number) => string;
  addLabel?: string;
  /** 是否允許新增 / 刪除（key_specs 固定 4 項，false） */
  fixed?: boolean;
};

export default function ArrayEditor<T>({
  items,
  onChange,
  newItem,
  renderItem,
  itemLabel = (i) => `Item #${i + 1}`,
  addLabel = "+ Add item",
  fixed = false,
}: Props<T>) {
  const update = (i: number, patch: Partial<T>) => {
    const next = items.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  const remove = (i: number) => {
    if (fixed) return;
    onChange(items.filter((_, x) => x !== i));
  };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = items.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const add = () => {
    if (fixed) return;
    onChange([...items, newItem()]);
  };

  return (
    <div className="adm-array">
      {items.map((it, i) => (
        <div key={i} className="adm-array-item">
          <div className="adm-array-item-header">
            <span>{itemLabel(i)}</span>
            <div className="adm-array-controls">
              <button
                type="button"
                className="adm-icon-btn"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label="Move up"
              >
                <ChevronUp size={14} />
              </button>
              <button
                type="button"
                className="adm-icon-btn"
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1}
                aria-label="Move down"
              >
                <ChevronDown size={14} />
              </button>
              {!fixed && (
                <button
                  type="button"
                  className="adm-icon-btn adm-icon-btn-danger"
                  onClick={() => remove(i)}
                  aria-label="Remove"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
          {renderItem(it, i, (patch) => update(i, patch))}
        </div>
      ))}
      {!fixed && (
        <button type="button" className="adm-add-btn" onClick={add}>
          <Plus size={14} /> {addLabel}
        </button>
      )}
    </div>
  );
}
