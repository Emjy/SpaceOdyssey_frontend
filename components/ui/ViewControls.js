import React from 'react';
import { MdZoomIn, MdZoomOut, MdRestartAlt, Md3dRotation } from 'react-icons/md';
import styles from '../../styles/ViewControls.module.css';

/**
 * Composant de contrôles de vue (zoom, rotation, reset)
 */
const ViewControls = React.memo(({ zoom, rotationX, onZoomIn, onZoomOut, onReset }) => {
    return (
        <div className={styles.controls}>
            <div className={styles.controlGroup}>
                <button
                    className={styles.controlButton}
                    onClick={onZoomIn}
                    title="Zoomer"
                >
                    <MdZoomIn />
                </button>
                <div className={styles.zoomLevel}>
                    {Math.round(zoom * 100)}%
                </div>
                <button
                    className={styles.controlButton}
                    onClick={onZoomOut}
                    title="Dézoomer"
                >
                    <MdZoomOut />
                </button>
            </div>

            <div className={styles.controlGroup}>
                <button
                    className={styles.controlButton}
                    onClick={onReset}
                    title="Réinitialiser la vue"
                >
                    <MdRestartAlt />
                </button>
            </div>

            <div className={styles.infoGroup}>
                <div className={styles.infoText}>
                    <Md3dRotation /> Cliquer-glisser pour faire pivoter
                </div>
                <div className={styles.angleDisplay}>
                    Angle: {Math.round(rotationX)}°
                </div>
            </div>
        </div>
    );
});

ViewControls.displayName = 'ViewControls';

export default ViewControls;
