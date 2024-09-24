import React, { useEffect, useRef, useState } from 'react'

interface YouTubeThumbnailProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
    videoId: string
}
const YouTubeThumbnail: React.FC<YouTubeThumbnailProps> = ({ videoId, onLoad, loading, ...props }) => {
    const [url, setUrl] = useState(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
    const thumbnail = ["mqdefault.jpg", "sddefault.jpg", "hqdefault.jpg", "default.jpg"];

    const onLoadHandler = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        !!onLoad && onLoad(e);
        const img = e.currentTarget
        if (img.naturalWidth === 120) {
            const currentThumbnail = url.split("/").pop();
            if (!currentThumbnail || currentThumbnail === "default.jpg") {
                return;
            }
            const index = thumbnail.indexOf(currentThumbnail);
            setUrl(`https://img.youtube.com/vi/${videoId}/${thumbnail[index + 1]}`);
        }
    }

    return (
        <img
            src={url}
            loading={loading || 'lazy'}
            onLoad={onLoadHandler}
            {...props}
        />
    )
}

export default YouTubeThumbnail
