import React, { useState, useRef, useEffect } from 'react';
import styles from './HorizontallyScrollableList.module.css'

interface HorizontallyScrollableListProps extends React.HTMLAttributes<HTMLDivElement> {
    items: JSX.Element[]
    onEndReach?: (isLeft: boolean, isRight: boolean) => void
    preventRedirect?: React.MutableRefObject<boolean>
}

const HorizontallyScrollableList: React.FC<HorizontallyScrollableListProps> = ({ preventRedirect, items, onEndReach, ...props }) => {
    const listRef = useRef<HTMLDivElement>(null);
    const [isLeftOverflowed, setIsLeftOverflowed] = useState(false);
    const [isRightOverflowed, setIsRightOverflowed] = useState(false);
    const isFunCalled = useRef(false)
    const isMouseDown = useRef(false);
    const startX = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            if (listRef.current) {
                const hasLeftOverflow = ~~listRef.current.scrollLeft !== 0;
                const hasRightOverflow = ~~(listRef.current.scrollLeft + listRef.current.clientWidth - listRef.current.scrollWidth) !== 0;
                if (onEndReach && (!hasLeftOverflow || !hasRightOverflow)) {
                    onEndReach(hasLeftOverflow, hasRightOverflow);
                    isFunCalled.current = true;
                }
                setIsLeftOverflowed(hasLeftOverflow);
                setIsRightOverflowed(hasRightOverflow);
            }
        };

        handleScroll();

        if (listRef.current) {
            listRef.current.addEventListener("scroll", handleScroll);
        }

        window.addEventListener("resize", handleScroll);

        return () => {
            if (listRef.current) {
                listRef.current.removeEventListener("scroll", handleScroll);
            }
            window.removeEventListener("resize", handleScroll);
        };
    }, []);

    useEffect(() => {
        if (!isFunCalled.current && onEndReach && listRef.current && (listRef.current.clientWidth === listRef.current.scrollWidth)) {
            onEndReach(false, false);
        }
        isFunCalled.current = false
    }, [items])

    const handleMouseDown = (e: any) => {
        e.preventDefault();
        if (preventRedirect) preventRedirect.current = false
        isMouseDown.current = true;
        startX.current = e.clientX;
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    const handleMouseMove = (e: any) => {
        if (isMouseDown.current && listRef.current) {
            const diff = e.clientX - startX.current;
            listRef.current.scrollLeft -= diff;
            if (preventRedirect && !preventRedirect.current) preventRedirect.current = !!diff
            startX.current = e.clientX;
        }
    };

    const handleMouseUp = (e: any) => {
        isMouseDown.current = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
    };

    const handleClick = (e: any) => {
        if (preventRedirect && preventRedirect.current) {
            e.preventDefault();
            e.cancelBubble = true;
            e.stopPropagation();
        }
    }

    return (
        <div className={styles.container + (props.className ? " " + props.className : "") + (isLeftOverflowed ? " " + styles.overflowShadowLeft : "") + (isRightOverflowed ? " " + styles.overflowShadowRight : "")}>
            <div className={styles.list} ref={listRef} onMouseDown={handleMouseDown} onClick={handleClick} >
                {items}
            </div>
        </div>
    )
}

export default HorizontallyScrollableList;