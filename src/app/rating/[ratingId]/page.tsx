"use client";

import { NextPage } from "next";
import styles from './page.module.css';
import Nav from "@/components/Nav/Nav";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import React, { useEffect, useRef, useState } from "react";
import { ChooseResponseSchema, RatingChoiceResponseSchema } from "@/types/ratingChoice";
import { CompetitionItemSchema } from "@/types/competitionItem";
import ListIcon from "@/local/svg/list.svg";
import BackIcon from "@/local/svg/back.svg";
import RefreshIcon from "@/local/svg/refresh.svg";
import Loading from "@/components/Loading/Loading";
import Link from "next/link";
import { RatingSchema } from "@/types/rating";
import AvailableItemsList from "@/components/Dialogs/AvailableItemsList/AvailableItemsList";

interface RratingProps {
    params: { ratingId: string }
    searchParams: { [key: string]: string }
}

const Rrating: NextPage<RratingProps> = ({ params, searchParams }) => {
    const router = useRouter();
    const { authenticatedFetch } = useUser();

    const [stage, setStage] = useState(1);
    const [round, setRound] = useState(1);
    const [roundsTotal, setRoundsTotal] = useState(1);
    const [stagesTotal, setStagesTotal] = useState(1);
    const [isRefreshed, setIsRefreshed] = useState(false);
    const [havePrev, setHavePrev] = useState(false);

    const allRatingChoices = useRef<{ [id: string]: { items: string[], stage: number, round: number, prev: string | null, next: string | null, winner_id: string | null } }>({});
    const allCompetitionItems = useRef<{ [id: string]: { title: string, videoId: string } }>({});
    const competitionId = useRef("");

    const [availableItemsIds, setAvailableItemsIds] = useState<string[]>([]);
    const [currentRatingChoiceId, setCurrentRatingChoiceId] = useState<string>();

    const [fetching, setFetching] = useState(false);
    const [winnerId, setWinnerId] = useState<string | null>(null);
    const [isItemsOpen, setIsItemsOpen] = useState(false);

    const fetchRating = async () => {
        const response = await authenticatedFetch(`/rating/${params.ratingId}/`, { method: "GET" });
        return (await response.json()) as RatingSchema;
    }

    const fetchChoice = async (rating_choice_id: string) => {
        const response = await authenticatedFetch(`/rating/${params.ratingId}/choice/${rating_choice_id}/`, { method: "GET" });
        return (await response.json()) as RatingChoiceResponseSchema;
    }

    const fetchLastChoice = async () => {
        const response = await authenticatedFetch(`/rating/${params.ratingId}/choice/last/`, { method: "GET" });
        return (await response.json()) as RatingChoiceResponseSchema;
    }

    const fetchRoundsTotal = async () => {
        const response = await authenticatedFetch(`/rating/${params.ratingId}/rounds_total/`, { method: "GET" });
        return (await response.json()) as number;
    }

    const fetchStagesTotal = async (competition_id: string) => {
        const response = await authenticatedFetch(`/competition/${competition_id}/stages_total/`, { method: "GET" });
        return (await response.json()) as number;
    }

    const fetchChoose = async (choice_id: string, winner_id: string) => {
        const formData = new FormData();
        formData.append("winner_id", winner_id);
        const response = await authenticatedFetch(`/rating/${params.ratingId}/choose/${choice_id}/`, { method: "POST", body: formData });
        return (await response.json()) as ChooseResponseSchema;
    }

    const fetchAvailableItems = async () => {
        const response = await authenticatedFetch(`/rating/${params.ratingId}/items/`, { method: "GET" });
        return (await response.json()) as CompetitionItemSchema[];
    }

    const fetchAvailableItemsIds = async () => {
        const response = await authenticatedFetch(`/rating/${params.ratingId}/items/ids/`, { method: "GET" });
        return (await response.json()) as string[];
    }

    const fetchRefresh = async (choice_id: string) => {
        const response = await authenticatedFetch(`/rating/${params.ratingId}/refresh/${choice_id}/`, { method: "POST" });
        return (await response.json()) as RatingChoiceResponseSchema;
    }

    useEffect(() => {
        const fetchData = async () => {
            setFetching(true);
            const rating = await fetchRating();
            if (rating.ended) {
                router.push(`/rating/${params.ratingId}/ended`);
                setFetching(false);
                return;
            }

            const roundsTotal = await fetchRoundsTotal();
            const stagesTotal = await fetchStagesTotal(rating.competition_id);
            const lastChoice = await fetchLastChoice();
            const availableItems = await fetchAvailableItems();
            setAvailableItemsIds([...(await fetchAvailableItemsIds())]);
            competitionId.current = rating.competition_id;
            allRatingChoices.current[lastChoice.id] = { ...lastChoice };
            allCompetitionItems.current = availableItems.reduce((obj, item) => ({ ...obj, [item.id]: { title: item.title, videoId: item.videoId } }), {});
            setIsRefreshed(rating.is_refreshed);
            setHavePrev(!!lastChoice.prev);
            setRoundsTotal(roundsTotal);

            setStagesTotal(stagesTotal);

            setRound(lastChoice.round);
            setStage(lastChoice.stage);
            setCurrentRatingChoiceId(lastChoice.id);
            setFetching(false);
        }

        fetchData();
    }, [])

    const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, item_id: string) => {
        if (fetching) return;
        e.currentTarget.parentElement?.classList.add(styles.winner)
        setWinnerId(item_id);
    }

    useEffect(() => {
        if (!currentRatingChoiceId || fetching || !winnerId) return;
        const fetchData = async () => {
            setFetching(true);
            const timeout = new Promise(resolve => setTimeout(resolve, 1000));

            const currentRatingChoice = allRatingChoices.current[currentRatingChoiceId]
            const nextRatingChoiceId = currentRatingChoice.next
            const nextRatingChoice = nextRatingChoiceId ? allRatingChoices.current[nextRatingChoiceId] : null;

            if (nextRatingChoice && nextRatingChoiceId) {
                if (currentRatingChoice.winner_id !== winnerId) {
                    await fetchChoose(currentRatingChoiceId, winnerId)
                    currentRatingChoice.winner_id = winnerId;
                }
                await timeout;
                setHavePrev(!!allRatingChoices.current[nextRatingChoiceId].prev)
                setCurrentRatingChoiceId(nextRatingChoiceId)
                setRound(round + 1)
            } else {
                const data = await fetchChoose(currentRatingChoiceId, winnerId)

                if (data.ended) {
                    router.push(`/rating/${params.ratingId}/ended`);
                    setFetching(false);
                    return;
                }
                const newNextRatingChoiceId = data.next_choice.id
                allRatingChoices.current[newNextRatingChoiceId] = { ...data.next_choice }
                currentRatingChoice.next = newNextRatingChoiceId

                if (stage !== data.next_choice.stage) {
                    const newItems = await fetchAvailableItemsIds()
                    await timeout;
                    setAvailableItemsIds(newItems);
                    setStage(data.next_choice.stage)
                    setRoundsTotal(Math.ceil(roundsTotal / 2));
                } else {
                    await timeout;
                    setAvailableItemsIds(prev => prev.filter(id => !data.next_choice.items.includes(id)))
                }
                setRound(data.next_choice.round)
                setCurrentRatingChoiceId(newNextRatingChoiceId)
                setHavePrev(!!data.next_choice.prev)
            }
            setWinnerId(null)
            setFetching(false)
        }

        fetchData();
    }, [winnerId, currentRatingChoiceId, fetching])

    const back = () => {
        if (!currentRatingChoiceId || fetching) return;
        const prevRatingChoiceId = allRatingChoices.current[currentRatingChoiceId].prev
        if (!prevRatingChoiceId) return;
        const fetchData = async () => {
            setFetching(true)
            if (!allRatingChoices.current[prevRatingChoiceId]) {
                const data = await fetchChoice(prevRatingChoiceId)
                allRatingChoices.current[prevRatingChoiceId] = { ...data }
            }
            setHavePrev(!!allRatingChoices.current[prevRatingChoiceId].prev)
            setCurrentRatingChoiceId(prevRatingChoiceId)
            setRound(round - 1)
            setFetching(false)
        }

        fetchData()
    }

    const refresh = () => {
        if (fetching || !currentRatingChoiceId) return;
        const fetchData = async () => {
            setFetching(true)
            const data = await fetchRefresh(currentRatingChoiceId)
            setAvailableItemsIds(await fetchAvailableItemsIds());
            allRatingChoices.current[data.id] = { ...data }
            setFetching(false)
        }

        fetchData()
    }

    return <main className={styles.main}>
        <Nav />
        <AvailableItemsList isOpen={isItemsOpen} setIsOpen={setIsItemsOpen} items={availableItemsIds.map(id => allCompetitionItems.current[id])} />
        <div className={styles.info}>
            <p className={styles.stage}>Stage: {stage} / {stagesTotal}</p>
            <p className={styles.round}>Round: {round} / {roundsTotal}</p>
            <button disabled={!availableItemsIds.length} className={styles.items} onClick={() => setIsItemsOpen(true)}><ListIcon /></button>
            <button disabled={fetching || !havePrev} onClick={back} className={styles.back}><BackIcon /></button>
            <button disabled={fetching || isRefreshed} onClick={refresh} className={styles.refresh}><RefreshIcon /></button>
        </div>
        <div className={styles.content + (!!winnerId ? " " + styles.selected : "")}>
            {currentRatingChoiceId ? (
                allRatingChoices.current[currentRatingChoiceId].items.map(item_id =>
                    <div className={styles.choice} key={item_id}>
                        <div className={styles.title}>
                            <Link tabIndex={0} href={`https://www.youtube.com/watch?v=${allCompetitionItems.current[item_id].videoId}`} target="_blank">{allCompetitionItems.current[item_id].title}</Link>
                        </div>
                        <div className={styles.video}>
                            <iframe src={`https://www.youtube.com/embed/${allCompetitionItems.current[item_id].videoId}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                        </div>
                        <button disabled={fetching} className={styles.button} onClick={(e) => handleClick(e, item_id)}>Choose</button>
                    </div>
                )
            ) : (<Loading />)}
        </div>
    </main>
}

export default Rrating