'use client';
import styles from '../styles/InfinityLoader.module.css';

const PATH = 'M 0 0 C -5 -14 -28 -14 -28 0 C -28 14 -5 14 0 0 C 5 -14 28 -14 28 0 C 28 14 5 14 0 0';

export default function InfinityLoader({ size = 56, color = '#7ee7ff', className = '' }) {
    return (
        <svg
            className={`${styles.loader} ${className}`}
            viewBox="-34 -20 68 40"
            width={size}
            height={size * 0.58}
            aria-label="Chargement"
        >
            <path
                d={PATH}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                pathLength="1"
                strokeDasharray="0.22 0.78"
                className={styles.trail}
            />
        </svg>
    );
}
