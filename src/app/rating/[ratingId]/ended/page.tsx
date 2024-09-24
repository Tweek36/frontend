"use client";

import { NextPage } from "next";
import styles from './page.module.css';
import Nav from "@/components/Nav/Nav";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import React, { useEffect, useRef, useState } from "react";
import { CompetitionItemSchema } from "@/types/competitionItem";
import { RatingSchema } from "@/types/rating";
import YouTubeThumbnail from "@/components/YouTubeThumbnail/YouTubeThumbnail";
import LineBetweenElements from "@/components/LineBetweenElements/LineBetweenElements";
import Video from "@/components/Dialogs/Video/Video";

interface RratingProps {
    params: { ratingId: string }
}

const Ended: NextPage<RratingProps> = ({ params }) => {
    const router = useRouter();
    const { authenticatedFetch } = useUser();
    const [grid, setGrid] = useState<(string | null)[][][]>([]);
    const [competitionItems, setCompetitionItems] = useState<{ [id: string]: { title: string, videoId: string } }>({});

    const [videoId, setVideoId] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const itemToUnset = useRef<string | null>(null);
    const currentPaddings = useRef<{ top: number, bottom: number }[]>([])
    const nextPaddings = useRef<{ top: number, bottom: number }[]>([])
    const contentRef = useRef<React.MutableRefObject<HTMLDivElement | null>[][][]>([]);
    const titleRef = useRef<HTMLDivElement | null>(null);

    const fetchGrid = async () => {
        const response = await authenticatedFetch(`/rating/${params.ratingId}/grid/`, { method: "GET" });
        return (await response.json()) as (string | null)[][][];
    }

    const fetchCompetitionItems = async (competition_id: string) => {
        const response = await authenticatedFetch(`/competition/${competition_id}/item/`, { method: "GET" });
        return (await response.json()) as CompetitionItemSchema[];
    }

    const fetchRating = async () => {
        const response = await authenticatedFetch(`/rating/${params.ratingId}/`, { method: "GET" });
        return (await response.json()) as RatingSchema;
    }

    useEffect(() => {
        const fetchdata = async () => {
            const rating = await fetchRating();
            if (!rating.ended) {
                router.push("/rating/" + params.ratingId)
            }
            const competitionItemsData = await fetchCompetitionItems(rating.competition_id);
            const gridData = await fetchGrid();
            // @ts-expect-error
            gridData.push([[gridData.at(-1)?.at(-1)?.at(0), null]]);
            setCompetitionItems(competitionItemsData.reduce((obj, item) => ({ ...obj, [item.id]: { title: item.title, videoId: item.videoId } }), {}));
            setGrid(gridData);
        }

        fetchdata();
        contentRef.current = []
    }, [])

    return <main className={styles.main}>
        <Nav />
        <Video isOpen={isOpen} setIsOpen={setIsOpen} videoId={videoId} />
        <div className={styles.content}>
            <div className={styles.title} ref={titleRef}></div>
            <div className={styles.grid}>
                {grid.map((row, i) => {
                    contentRef.current[i] = []
                    if (i === 0) {
                        currentPaddings.current = Array.from({ length: row.length * 2 }, () => ({ top: 0, bottom: 0 }));
                    } else {
                        currentPaddings.current = nextPaddings.current
                    }
                    nextPaddings.current = []
                    let iter = 0
                    const stageRef = React.createRef<HTMLDivElement>();
                    return <div className={styles.stage} key={`stage_${i}`} ref={stageRef}>
                        <div className={styles.items}>
                            {row.map((choice, index) => {
                                contentRef.current[i][index] = []
                                nextPaddings.current[index] = { top: 45, bottom: 45 }
                                return <div className={styles.choice} key={"choice_" + index}>
                                    {choice.map((item, ix) => {
                                        contentRef.current[i][index][ix] = React.createRef();
                                        if (ix === 0) {
                                            nextPaddings.current[index].bottom += (currentPaddings.current[iter].top + currentPaddings.current[iter].bottom) / 2
                                            nextPaddings.current[index].top += (currentPaddings.current[iter].top + currentPaddings.current[iter].bottom) / 2
                                        } else if (item) {
                                            nextPaddings.current[index].bottom += (currentPaddings.current[iter].top + currentPaddings.current[iter].bottom) / 2
                                            nextPaddings.current[index].top += (currentPaddings.current[iter].top + currentPaddings.current[iter].bottom) / 2
                                            if (currentPaddings.current[iter].top > currentPaddings.current[iter - 1].top) {
                                                nextPaddings.current[index].top -= 45
                                                nextPaddings.current[index].bottom += 45
                                            }
                                            if (currentPaddings.current[iter].top < currentPaddings.current[iter - 1].top) {
                                                nextPaddings.current[index].top += 45
                                                nextPaddings.current[index].bottom -= 45
                                            }
                                        }
                                        if (!item) {
                                            nextPaddings.current[index].top = currentPaddings.current[iter - 1].top
                                            nextPaddings.current[index].bottom = currentPaddings.current[iter - 1].bottom
                                            itemToUnset.current = choice[0];
                                            contentRef.current[i][index][ix].current = null;
                                            return;
                                        }
                                        if (itemToUnset.current === item) {
                                            itemToUnset.current = null
                                        }
                                        const v = iter++
                                        return <div ref={contentRef.current[i][index][ix]} className={styles.item} key={"item_" + ix} style={{ paddingTop: `${currentPaddings.current[v].top}px`, paddingBottom: `${currentPaddings.current[v].bottom}px` }} >
                                            {i > 0 && <LineBetweenElements element1Ref={contentRef.current[i - 1][v][0]} element2Ref={contentRef.current[i][index][ix]} containerRef={stageRef} />}
                                            {i > 0 && <LineBetweenElements element1Ref={contentRef.current[i - 1][v][1]} element2Ref={contentRef.current[i][index][ix]} containerRef={stageRef} />}
                                            <YouTubeThumbnail
                                                videoId={competitionItems[item].videoId}
                                                onDoubleClick={() => { setVideoId(competitionItems[item].videoId); setIsOpen(true) }}
                                                onClick={() => {
                                                    const winnerLine = contentRef.current[i][index][ix].current?.getElementsByTagName("polyline")[0];
                                                    const looserLine = contentRef.current[i][index][ix].current?.getElementsByTagName("polyline")[1];
                                                    if (winnerLine) {
                                                        winnerLine.style.stroke = winnerLine.style.stroke=="green" ? "black": "green";
                                                    }
                                                    if (looserLine) {
                                                        looserLine.style.stroke = looserLine.style.stroke=="red" ? "black": "red";
                                                    }
                                                }}
                                            />
                                        </div>
                                    }
                                    )}
                                </div>
                            }
                            )}
                        </div>
                    </div>
                }
                )}
            </div>
        </div>
    </main>
}

export default Ended