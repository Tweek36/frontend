"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./CompetitionCard.module.css";
import { API_URL } from "@/api/base";

interface CompetitionCardProps {
    title: string;
    image: string;
    description: string;
    competitionId: string;
    onClick: (competitionId: string, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}
const CompetitionCard: React.FC<CompetitionCardProps> = ({ title, image, competitionId, description, onClick }) => {
    const [isOverflowed, setIsOverflowed] = useState(false);
    const descriptionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkOverflow = () => {
            if (descriptionRef.current) {
                const hasOverflow = descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight;
                const { scrollTop, scrollHeight, clientHeight } = descriptionRef.current;
                if (scrollHeight - scrollTop - clientHeight < 1) {
                    setIsOverflowed(false);
                } else {
                    setIsOverflowed(hasOverflow);
                }
            }
        };

        const handleScroll = () => {
            if (descriptionRef.current) {
                const { scrollTop, scrollHeight, clientHeight } = descriptionRef.current;
                if (scrollHeight - scrollTop - clientHeight < 1) {
                    setIsOverflowed(false);
                } else {
                    setIsOverflowed(true);
                }
            }
        };

        checkOverflow();

        if (descriptionRef.current) {
            descriptionRef.current.addEventListener("scroll", handleScroll);
        }

        window.addEventListener("resize", checkOverflow);

        return () => {
            if (descriptionRef.current) {
                descriptionRef.current.removeEventListener("scroll", handleScroll);
            }
            window.removeEventListener("resize", checkOverflow);
        };
    }, [description]);


    return (
        <div className={styles.card} onClick={e => onClick(competitionId, e)}>
            <h3>{title}</h3>
            <div className={styles.image}>
                {image ? (<img src={image} />) : <img src={API_URL + "/image/default.png"} />}
            </div>
            <p ref={descriptionRef} className={`${styles.description} ${isOverflowed ? styles.overflowShadow : ""}`}>{description}</p>
        </div>
    )
};

export default CompetitionCard;
