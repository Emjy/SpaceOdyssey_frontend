import MenuButton from './MenuButton';
import styles from '../../styles/homePage.module.css';

/**
 * Composant de menu de navigation réutilisable
 * Génère automatiquement les boutons à partir d'un tableau d'items
 */
const NavigationMenu = ({
    items,
    selectedItem,
    onItemClick,
    getItemKey,
    getItemLabel,
    isOpen
}) => {
    if (!isOpen) return null;

    return (
        <div className={styles.menu}>
            {items.map((item) => {
                const itemKey = getItemKey ? getItemKey(item) : item.id || item;
                const itemLabel = getItemLabel ? getItemLabel(item) : item.englishName || item;
                const isActive = selectedItem === itemKey || selectedItem === item;

                return (
                    <MenuButton
                        key={itemKey}
                        itemKey={itemKey}
                        label={itemLabel}
                        isActive={isActive}
                        onClick={() => onItemClick(item)}
                    />
                );
            })}
        </div>
    );
};

export default NavigationMenu;
