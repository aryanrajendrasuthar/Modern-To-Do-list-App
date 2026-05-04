import styles from './TaskSkeleton.module.css';

export default function TaskSkeleton() {
  return (
    <div className={styles.skeleton}>
      {[...Array(4)].map((_, i) => (
        <div key={i} className={styles.card}>
          <div className={styles.checkbox} />
          <div className={styles.content}>
            <div className={styles.title} style={{ width: `${60 + i * 8}%` }} />
            <div className={styles.desc} />
            <div className={styles.meta}>
              <div className={styles.badge} />
              <div className={styles.badge} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
