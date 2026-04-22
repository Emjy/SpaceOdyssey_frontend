import React from 'react';
import { MdZoomIn, MdZoomOut, MdRestartAlt, Md3dRotation } from 'react-icons/md';
import styles from '../../styles/ViewControls.module.css';

/**
 * Composant de contrôles de vue (zoom, rotation, reset)
 */
const ViewControls = React.memo(({ zoom, rotationX, onZoomIn, onZoomOut, onReset }) => {
    return (
        <div className={styles.controls}>
            <div className={styles.header}>
                <div className={styles.eyebrow}>Camera</div>
                <div className={styles.title}>Scene controls</div>
            </div>

            <div className={styles.controlGroup}>
                <button
                    className={styles.controlButton}
                    onClick={onZoomIn}
                    title="Zoomer"
                    type="button"
                >
                    <MdZoomIn />
                </button>
                <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>Zoom</div>
                    <div className={styles.metricValue}>{Math.round(zoom * 100)}%</div>
                </div>
                <button
                    className={styles.controlButton}
                    onClick={onZoomOut}
                    title="Dézoomer"
                    type="button"
                >
                    <MdZoomOut />
                </button>
            </div>

            <div className={styles.controlGroup}>
                <button
                    className={styles.controlButton}
                    onClick={onReset}
                    title="Réinitialiser la vue"
                    type="button"
                >
                    <MdRestartAlt />
                </button>
                <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>Pitch</div>
                    <div className={styles.metricValue}>{Math.round(rotationX)}°</div>
                </div>
                <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>Mode</div>
                    <div className={styles.metricValue}>Orbital</div>
                </div>
            </div>

            <div className={styles.infoGroup}>
                <div className={styles.infoText}>
                    <Md3dRotation /> Cliquer-glisser pour faire pivoter
                </div>
                <div className={styles.angleDisplay}>
                    Reset recentre la scène sans perdre la sélection active
                </div>
            </div>
        </div>
    );
});

ViewControls.displayName = 'ViewControls';

export default ViewControls;
