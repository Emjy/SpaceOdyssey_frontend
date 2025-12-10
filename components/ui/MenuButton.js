import styles from '../../styles/HomePage.module.css';

/**
 * Composant de bouton de menu réutilisable
 * @param {Object} props
 * @param {string|number} props.itemKey - Clé unique pour le bouton
 * @param {string} props.label - Texte à afficher
 * @param {boolean} props.isActive - Si le bouton est actif/sélectionné
 * @param {Function} props.onClick - Fonction à exécuter au clic
 */
const MenuButton = ({ itemKey, label, isActive, onClick }) => {
    return (
        <div
            key={itemKey}
            style={{
                backgroundColor: isActive ? 'rgba(236, 243, 233, 0.2)' : '',
                color: isActive ? 'white' : ''
            }}
            className={styles.secondaryButton}
            onClick={onClick}
        >
            {label}
        </div>
    );
};

export default MenuButton;
