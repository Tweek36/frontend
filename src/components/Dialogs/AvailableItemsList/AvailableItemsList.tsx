import React, { useState } from 'react';
import styles from './AvailableItemsList.module.css'
import Image from 'next/image'
import YouTubeThumbnail from '@/components/YouTubeThumbnail/YouTubeThumbnail';

interface AvailableItemsListProps extends React.HTMLAttributes<HTMLDivElement> {
    items: { title: string, videoId: string }[];
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AvailableItemsList: React.FC<AvailableItemsListProps> = ({ setIsOpen, items, isOpen }) => {
    const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
        if (e.target === e.currentTarget) {
            setIsOpen(false);
        }
    };

    return (
        <dialog open={isOpen} onClick={handleDialogClick} className={styles.dialog} >
            <div className={styles.content}>
                {items.map(item =>
                    <div className={styles.item} key={item.videoId}>
                        <YouTubeThumbnail videoId={item.videoId} />
                        <p className={styles.title}>{item.title}</p>
                    </div>
                )}
            </div>
        </dialog>
    )
}

export default AvailableItemsList;