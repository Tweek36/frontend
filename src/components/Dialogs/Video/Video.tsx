import React, { useState } from 'react';
import styles from './Video.module.css'

interface VideoProps extends React.HTMLAttributes<HTMLDivElement> {
    videoId: string
    isOpen: boolean
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const Video: React.FC<VideoProps> = ({ setIsOpen, videoId, isOpen, ...props }) => {
    const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
        if (e.target === e.currentTarget) {
            setIsOpen(false);
        }
    };

    return (
        <dialog open={isOpen} onMouseUp={handleDialogClick} className={styles.video} >
            <iframe src={`https://www.youtube.com/embed/${videoId}`}></iframe>
        </dialog>
    )
}

export default Video;