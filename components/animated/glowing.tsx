// components/GlowingRings.tsx
import styles from '@/styles/glowing.module.css';

const GlowingRings: React.FC = () => {
    return (
        <div className={`${styles.abstractBackground} ${styles.glowingRings}`}>
            <div className={`${styles.ring} ${styles.ring1}`}></div>
            <div className={`${styles.ring} ${styles.ring2}`}></div>
            <div className={`${styles.ring} ${styles.ring2}`}></div>
            <div className={`${styles.ring} ${styles.ring3}`}></div>
            <div className={`${styles.ring} ${styles.ring3}`}></div>
            <div className={`${styles.ring} ${styles.ring3}`}></div>
        </div>
    );
};

export default GlowingRings;
