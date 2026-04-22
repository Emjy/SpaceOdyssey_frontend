import React from 'react';
import styles from '../../styles/HomePage.module.css';

/**
 * Composant de bouton de menu réutilisable avec mémorisation
 * @param {Object} props
 * @param {string|number} props.itemKey - Clé unique pour le bouton
 * @param {string} props.label - Texte à afficher
 * @param {boolean} props.isActive - Si le bouton est actif/sélectionné
 * @param {Function} props.onClick - Fonction à exécuter au clic
 */
const MenuButton = React.memo(({ itemKey, label, isActive, onClick }) => {
    return (
        <button
            key={itemKey}
            type="button"
            className={`${styles.secondaryButton} ${isActive ? styles.secondaryButtonActive : ''}`}
            onClick={onClick}
            aria-pressed={isActive}
        >
            <span className={styles.buttonLabel}>{label}</span>
            <span className={styles.buttonIndicator}></span>
        </button>
    );
});

MenuButton.displayName = 'MenuButton';

export default MenuButton;
