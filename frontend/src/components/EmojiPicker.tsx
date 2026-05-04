import { useState } from 'react';
import styles from './EmojiPicker.module.css';

const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
  {
    label: 'Common',
    emojis: ['📋', '✅', '🎯', '🚀', '⭐', '🔥', '💡', '📌', '🏆', '✨', '💪', '🎉'],
  },
  {
    label: 'Work',
    emojis: ['💼', '📊', '📈', '📉', '🖥️', '📧', '📞', '🗓️', '📝', '🔍', '💰', '🤝'],
  },
  {
    label: 'Personal',
    emojis: ['🏃', '🧘', '🍎', '💤', '🏠', '🚗', '✈️', '🎮', '📚', '🎵', '🧹', '🛒'],
  },
  {
    label: 'Flags',
    emojis: ['🔴', '🟡', '🟢', '🔵', '🟣', '⚪', '⚫', '🟤', '🏴', '🚩', '⚑', '🎌'],
  },
];

interface Props {
  selected: string;
  onChange: (emoji: string) => void;
  onClose: () => void;
}

export default function EmojiPicker({ selected, onChange, onClose }: Props) {
  const [activeGroup, setActiveGroup] = useState(0);

  return (
    <div className={styles.picker}>
      <div className={styles.header}>
        <span className={styles.heading}>Pick an icon</span>
        {selected && (
          <button className={styles.clearBtn} onClick={() => onChange('')}>
            Remove
          </button>
        )}
      </div>

      <div className={styles.tabs}>
        {EMOJI_GROUPS.map((g, i) => (
          <button
            key={g.label}
            className={`${styles.tab} ${activeGroup === i ? styles.tabActive : ''}`}
            onClick={() => setActiveGroup(i)}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {EMOJI_GROUPS[activeGroup].emojis.map((emoji) => (
          <button
            key={emoji}
            className={`${styles.emojiBtn} ${selected === emoji ? styles.selected : ''}`}
            onClick={() => { onChange(emoji); onClose(); }}
            title={emoji}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
