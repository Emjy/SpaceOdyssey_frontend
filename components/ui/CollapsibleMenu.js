'use client';

import React, { memo } from 'react';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import styles from '../../styles/HomePage.module.css';

/**
 * Menu déroulant réutilisable avec animation
 * @param {Object} props
 * @param {string} props.title - Titre du menu
 * @param {boolean} props.isOpen - État ouvert/fermé
 * @param {Function} props.onToggle - Fonction appelée lors du clic sur le titre
 * @param {React.ReactNode} props.children - Contenu du menu
 * @param {number} props.itemCount - Nombre d'items pour calculer la hauteur
 * @param {string} props.maxHeight - Hauteur maximale optionnelle
 * @param {boolean} props.scrollable - Si true, ajoute un scroll
 */
const CollapsibleMenu = memo(({
    title,
    isOpen,
    onToggle,
    children,
    itemCount = 0,
    maxHeight,
    scrollable = false
}) => {
    const calculatedHeight = isOpen ? `${(itemCount + 1) * 2.5}em` : '3.3em';
    const finalHeight = maxHeight && isOpen ? maxHeight : calculatedHeight;

    return (
        <div className={styles.menuItem}>
            <div
                className={styles.secondaryButtons}
                style={{
                    height: finalHeight,
                    maxHeight: maxHeight || 'none'
                }}
            >
                <div className={styles.menuTitle} onClick={onToggle}>
                    <div></div>
                    {title}
                    {isOpen ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
                </div>
                {isOpen && (
                    <div style={scrollable ? { maxHeight: '290px', overflow: 'auto' } : {}}>
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
});

CollapsibleMenu.displayName = 'CollapsibleMenu';

export default CollapsibleMenu;
