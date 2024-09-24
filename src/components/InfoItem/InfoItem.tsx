import React, { useEffect, useRef, forwardRef } from 'react';
import styles from './InfoItem.module.css';
import YouTubeThumbnail from '../YouTubeThumbnail/YouTubeThumbnail';

interface InfoItemProps extends React.HTMLAttributes<HTMLDivElement> {
    videoId: string;
    title: string;
    onImgageClick: (e: React.MouseEvent<HTMLImageElement, MouseEvent>, videoId: string) => void
}

const InfoItem = forwardRef<HTMLDivElement, InfoItemProps>(({ videoId, title, onImgageClick, ...props }, ref) => {

    return (
        <div className={styles.infoItem} {...props} ref={ref}>
            <YouTubeThumbnail videoId={videoId} onClick={(e) => onImgageClick(e, videoId)} />
            <p>{title}</p>
        </div>
    )
})

export default InfoItem;