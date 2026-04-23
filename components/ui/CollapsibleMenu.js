'use client';

import React, { memo } from 'react';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import styles from '../../styles/HomePage.module.css';

const CollapsibleMenu = memo(({
    title,
    isOpen,
    onToggle,
    children,
    itemCount = 0,
    maxHeight,
    scrollable = false
}) => {
    return (
        <div className={styles.menuItem}>
            <div className={`${styles.secondaryButtons} ${isOpen ? styles.secondaryButtonsOpen : ''}`}>
                <button className={styles.menuTitle} onClick={onToggle} type="button">
                    <span className={styles.menuTitleText}>{title}</span>
                    <span className={styles.menuCount}>{itemCount}</span>
                    {isOpen ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
                </button>
                <div className={styles.menuContentWrapper}>
                    <div
                        className={styles.menuContent}
                        style={scrollable ? { maxHeight: maxHeight || '290px', overflowY: 'auto' } : {}}
                    >
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
});

CollapsibleMenu.displayName = 'CollapsibleMenu';

export default CollapsibleMenu;
