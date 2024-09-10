import React, { useEffect, useRef, useState } from 'react';
import styles from "./ListItem.module.css";
import LabledInput from '../LabledInput/LabledInput';
import LabledTextarea from '../LabledTextarea/LabledTextarea';
import { useUser } from '@/contexts/UserContext';
import DeleteIcon from '@/local/svg/close.svg';

interface ListItemProps extends React.HTMLAttributes<HTMLDivElement> {
    index: number
    lastIndex: React.MutableRefObject<number>
    competitionId: string
    itemId?: string
    videoId?: string
    description?: string
    title?: string
    onImgageClick: (e: React.MouseEvent<HTMLImageElement, MouseEvent>, videoId: string) => void
    setItems: React.Dispatch<React.SetStateAction<{
        [key: number]: JSX.Element;
    }>>
    setListItemsUnsinchronizedErrors: React.Dispatch<React.SetStateAction<{ [key: number]: { id: string, resolveFunc: () => void } }>>
    setListItemsValidationErrors: React.Dispatch<React.SetStateAction<{ [key: number]: string }>>
    listItemsValidationErrorsLastIndex: React.MutableRefObject<number>
    listItemsUnsinchronizedErrorsLastIndex: React.MutableRefObject<number>
}

const ListItem: React.FC<ListItemProps> = ({ lastIndex, listItemsValidationErrorsLastIndex, listItemsUnsinchronizedErrorsLastIndex, setListItemsValidationErrors, setListItemsUnsinchronizedErrors, index, setItems, competitionId, itemId: initilItemId, videoId: initialVideoId, description: initialDescription, title: initialTitle, onImgageClick, ...props }) => {
    const validateVideoId = (value: string | number | readonly string[]) => {
        if (typeof value === 'string') {
            return /^[a-zA-Z0-9_-]{11}$/.test(value);
        }
        return false;
    }

    const itemId = useRef(initilItemId)
    const [videoId, setVideoId] = useState(initialVideoId || '')
    const [description, setDescription] = useState(initialDescription || '')
    const [title, setTitle] = useState(initialTitle || '')
    const [isVideoIdValid, setIsVideoIdValid] = useState(initialVideoId ? validateVideoId(initialVideoId) : false)
    const initing = useRef(true)
    const validationErrorId = useRef<number>(0)
    const unsinchronizedErrorId = useRef<number>(0)

    const { authenticatedFetch } = useUser();

    const controller = useRef<AbortController>();


    const serializeVideoId = (value: string) => {
        if (validateVideoId(value)) return value
        try {
            const url = new URL(value);
            return url.pathname.startsWith('/embed/') || url.pathname.startsWith('/youtu.be/')
                ? url.pathname.split('/').pop() || ''
                : new URLSearchParams(url.search).get('v') || '';
        } catch {
            return '';
        }
    }

    const getVideoTitle = (id: string) => {
        if (controller.current && !controller.current.signal.aborted) {
            controller.current.abort("Отмена")
        } else {
            controller.current = new AbortController()
        }

        authenticatedFetch(`/youtube/video-title/?id=${id}`, { method: "GET", signal: controller.current.signal }).then(response => {
            if (response.ok) {
                response.json().then(data => {

                    if (data.video_title) {
                        if (title != data.video_title) setTitle(data.video_title);
                        setIsVideoIdValid(true)
                    }
                })
            } else {
                setIsVideoIdValid(false)
            }
        }).catch(err => {
            if (err.name === 'AbortError') {
                console.log('Запрос был прерван:', err.message);
            }
        })
    }

    const handleVideoIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const id = serializeVideoId(e.target.value)

        if (id) {
            setVideoId(id);
            getVideoTitle(id);
        } else {
            setVideoId(e.target.value);
            setIsVideoIdValid(false);
            if (controller.current && !controller.current.signal.aborted) {
                controller.current.abort("Галя, отмена!")
            }
        }
    }

    const timeoutFunction = async () => {
        const formData = new FormData();
        formData.append("videoId", videoId)
        formData.append("description", description)
        formData.append("title", title)
        const response = await authenticatedFetch(itemId.current ? `/competition/${competitionId}/item/${itemId.current}/` : `/competition/${competitionId}/item/`, itemId.current ? { method: "PATCH", body: formData } : { method: "POST", body: formData })
        if (response.ok) {
            const data = await response.json()
            itemId.current = data.id;
            setTitle(data.title)
        } else {
            setIsVideoIdValid(false)
        }
        const cur = unsinchronizedErrorId.current
        setListItemsUnsinchronizedErrors(prevItems => {
            const new_items = { ...prevItems }
            delete new_items[cur]
            return new_items
        })
        unsinchronizedErrorId.current = 0;
    }

    useEffect(() => {
        if (initing.current) {
            return () => initing.current = false;
        }
        if (!isVideoIdValid) return;
        const timeout = setTimeout(timeoutFunction, 1000);
        if (!unsinchronizedErrorId.current) unsinchronizedErrorId.current = ++listItemsUnsinchronizedErrorsLastIndex.current


        const cur = unsinchronizedErrorId.current
        setListItemsUnsinchronizedErrors(prevItems => {
            return { ...prevItems, [cur]: { id: `item-${index}`, resolveFunc: () => { clearTimeout(timeout); timeoutFunction() } } }
        })
        return () => clearTimeout(timeout);
    }, [videoId, description, title, isVideoIdValid]);

    useEffect(() => {
        if (initing.current) return;
        const cur = lastIndex.current
        if (videoId && cur === index) {
            const newLastIndex = ++lastIndex.current
            setItems(prevItems => {
                return {
                    ...prevItems, [newLastIndex]: (<ListItem
                        key={newLastIndex}
                        index={newLastIndex}
                        lastIndex={lastIndex}
                        competitionId={competitionId}
                        setListItemsUnsinchronizedErrors={setListItemsUnsinchronizedErrors}
                        setListItemsValidationErrors={setListItemsValidationErrors}
                        listItemsValidationErrorsLastIndex={listItemsValidationErrorsLastIndex}
                        listItemsUnsinchronizedErrorsLastIndex={listItemsUnsinchronizedErrorsLastIndex}
                        onImgageClick={onImgageClick}
                        setItems={setItems}
                    />)
                }
            })
        }
        if (!videoId && cur !== index) {
            setItems(prevItems => {
                delete prevItems[index]
                return { ...prevItems }
            })
            if (itemId.current) {
                authenticatedFetch(`/competition/${competitionId}/item/${itemId.current}/`, { method: "DELETE" })
            }
        }
    }, [videoId, isVideoIdValid])

    useEffect(() => {
        if (videoId && !isVideoIdValid && !validationErrorId.current) {

            validationErrorId.current = ++listItemsValidationErrorsLastIndex.current
            setListItemsValidationErrors(prevItems => {
                return { ...prevItems, [validationErrorId.current]: `item-${index}` }
            })
            return;
        }
        if (isVideoIdValid && !!validationErrorId.current) {
            const cur = validationErrorId.current
            setListItemsValidationErrors(prevItems => {
                const newItems = { ...prevItems }
                delete newItems[cur]
                return newItems
            })
            validationErrorId.current = 0;
        }
    }, [isVideoIdValid])

    const handleDelete = () => {
        setVideoId('');
        setTitle('');
        setDescription('');
        setIsVideoIdValid(false);
    }

    return (
        <div {...props} className={styles.item + (props.className ? (' ' + props.className) : (''))} id={`item-${index}`}>
            <div className={styles.video}>
                <LabledInput inversed label='URL:' placeholder='URL' value={videoId} onChange={handleVideoIdChange} invalid={!isVideoIdValid} />
                {isVideoIdValid &&
                    <img src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} alt="" onClick={e => onImgageClick(e, videoId)} />
                }
            </div>
            <div className={styles.info}>
                <div className={styles.close} onClick={handleDelete}><DeleteIcon /></div>

                <LabledInput className={styles.title} inversed label='Title:' placeholder='Title' value={title} onChange={e => setTitle(e.target.value)} />
                <LabledTextarea inversed label='Description:' placeholder='Description' value={description} onChange={e => setDescription(e.target.value)} />
            </div>
        </div>
    );
};

export default ListItem;