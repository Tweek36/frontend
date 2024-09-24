"use client";

import { NextPage } from "next";
import Nav from "@/components/Nav/Nav";
import styles from './page.module.css';
import { useEffect, useRef, useState } from "react";
import { useRouter } from 'next/navigation'
import { useUser } from "@/contexts/UserContext";
import Loading from "@/components/Loading/Loading";
import { API_URL } from "@/api/base";
import { CompetitionItemPaginatedResponseSchema } from "@/types/competitionItem";
import InfoItem from "@/components/InfoItem/InfoItem";
import { useElementOnScreen } from "@/utils/base";
import Video from "@/components/Dialogs/Video/Video";

interface CompetitionProps {
    params: { competitionId: string }
    searchParams: { [key: string]: string }
}

const Competition: NextPage<CompetitionProps> = ({ params, searchParams, ...props }) => {
    const router = useRouter();
    const { authenticatedFetch } = useUser();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [image, setImage] = useState('');
    const [published, setPublished] = useState(false);

    const [pulling, setPulling] = useState<boolean>(true);
    const [error, setError] = useState('');

    const [items, setItems] = useState<JSX.Element[]>([]);
    const itemsPage = useRef(0);
    const isFetchable = useRef(true);
    const [isFetching, setIsFetching] = useState(false);

    const [isVisible, itemRef] = useElementOnScreen<HTMLDivElement>({ threshold: 0.0, root: null, rootMargin: "0px" });

    const [videoId, setVideoId] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const [diabled, setDisabled] = useState(false);

    useEffect(() => {
        authenticatedFetch(`/competition/${params.competitionId}/`, { method: "GET" }).then((res) => {
            res.json().then((data) => {
                if (!res.ok) {
                    router.push('/');
                    return;
                }

                setTitle(data.title);
                setDescription(data.description);
                setCategory(data.category);
                setPublished(data.published);
                setImage(`${API_URL}/image/${data.image}`);
                setPulling(false);
            })
        })
    }, [])

    useEffect(() => {
        if (isVisible && !isFetching) fetchItems();
    }, [isVisible, isFetching])

    const fetchItems = async () => {
        if (itemRef.current) itemRef.current = null;
        if (!isFetchable.current) return;
        setIsFetching(true);
        const response = await authenticatedFetch(`/competition/${params.competitionId}/item/?max_per_page=10&page=${++itemsPage.current}`, { method: "GET" });
        if (!response.ok) {
            setIsFetching(false);
            isFetchable.current = false;
            return
        }
        const data: CompetitionItemPaginatedResponseSchema = await response.json();
        setItems(prevItems => [...prevItems, ...data.data.map((item, index) => {
            if ((data.data.length - 1) === index) {
                const lastItem = <InfoItem
                    key={prevItems.length + index}
                    title={item.title}
                    videoId={item.videoId}
                    ref={itemRef}
                    onImgageClick={(e, videoId) => { setIsOpen(true); setVideoId(videoId) }}
                />
                return lastItem
            }
            return <InfoItem
                key={prevItems.length + index}
                title={item.title}
                videoId={item.videoId}
                onImgageClick={(e, videoId) => { setIsOpen(true); setVideoId(videoId) }}
            />
        }
        )]);
        setIsFetching(false);
    }

    const toggleHandler = (event: React.ToggleEvent<HTMLDetailsElement>) => {
        if (!items.length && !isFetching && event.currentTarget.open) fetchItems();
    }

    const startRating = async () => {
        setDisabled(true)
        try {
            const response = await authenticatedFetch(`/rating/start/${params.competitionId}/`, { method: "POST" });
            if (!response.ok) {
                setDisabled(false)
                const data = await response.json();
                setError(data)
                return
            }
            const data = await response.json();
            setDisabled(false)
            router.push(`/rating/${data}`)
        } catch (e) {
            setDisabled(false)
        }
    }

    if (pulling) {
        return (
            <main className={styles.main}>
                <Nav />
                <Loading />
            </main>
        )
    }

    return (
        <main className={styles.main}>
            <Nav />
            <Video isOpen={isOpen} setIsOpen={setIsOpen} videoId={videoId} />
            <div className={styles.container}>
                {!published && (<h2 className={styles.warning}>Only you can see this page</h2>)}
                <h1>{title}</h1>
                <img src={image} alt="" />
                <p>{description}</p>
                <details onToggle={toggleHandler}>
                    <summary onMouseDown={(e) => e.preventDefault()}>Items</summary>
                    <div className={styles.items}>
                        {items}
                    </div>
                    {isFetching && (<Loading />)}
                </details>
                <button disabled={diabled} onClick={startRating}>Start</button>
            </div>
        </main>
    )
}

export default Competition;
