import React, { useEffect, useRef, useState } from 'react';
import styles from "./ItemsList.module.css";
import { useUser } from '@/contexts/UserContext';
import ListItem from '../ListItem/ListItem';

interface ItemsListProps extends React.HTMLAttributes<HTMLDivElement> {
    competitionId: string
    setListItemsUnsinchronizedErrors: React.Dispatch<React.SetStateAction<{ [key: number]: { id: string, resolveFunc: () => void } }>>
    setListItemsValidationErrors: React.Dispatch<React.SetStateAction<{ [key: number]: string }>>
    listItemsUnsinchronizedErrors: { [key: number]: { id: string, resolveFunc: () => void } }
    listItemsValidationErrors: { [key: number]: string }
    listItemsValidationErrorsLastIndex: React.MutableRefObject<number>
    listItemsUnsinchronizedErrorsLastIndex: React.MutableRefObject<number>
    items: {
        [key: number]: JSX.Element;
    }
    setItems: React.Dispatch<React.SetStateAction<{
        [key: number]: JSX.Element;
    }>>
    lastIndex: React.MutableRefObject<number>
    openVideo: (videoId: string) => void
}

const ItemsList: React.FC<ItemsListProps> = ({ lastIndex, openVideo, items, setItems, listItemsValidationErrorsLastIndex, listItemsUnsinchronizedErrorsLastIndex, listItemsValidationErrors, listItemsUnsinchronizedErrors, setListItemsValidationErrors, setListItemsUnsinchronizedErrors, competitionId, ...props }) => {
    const { authenticatedFetch } = useUser();

    useEffect(() => {
        authenticatedFetch(`/competition/${competitionId}/item/`, { method: "GET" }).then(response => {
            if (response.ok) {
                response.json().then((data: { id: string, title: string, description: string, videoId: string }[]) => {
                    if (data.length) setItems(prevItems => {
                        delete prevItems[lastIndex.current];
                        return {
                            ...prevItems,
                            ...Object.fromEntries(data.map((item) => {
                                return [++lastIndex.current, <ListItem
                                    key={lastIndex.current}
                                    index={lastIndex.current}
                                    lastIndex={lastIndex}
                                    competitionId={competitionId}
                                    itemId={item.id}
                                    videoId={item.videoId}
                                    description={item.description}
                                    title={item.title}
                                    setListItemsUnsinchronizedErrors={setListItemsUnsinchronizedErrors}
                                    setListItemsValidationErrors={setListItemsValidationErrors}
                                    listItemsValidationErrorsLastIndex={listItemsValidationErrorsLastIndex}
                                    listItemsUnsinchronizedErrorsLastIndex={listItemsUnsinchronizedErrorsLastIndex}
                                    onImgageClick={(e, videoId) => { openVideo(videoId) }}
                                    setItems={setItems}
                                />]
                            })),
                            [++lastIndex.current]: (<ListItem
                                key={lastIndex.current}
                                index={lastIndex.current}
                                lastIndex={lastIndex}
                                competitionId={competitionId}
                                setListItemsUnsinchronizedErrors={setListItemsUnsinchronizedErrors}
                                setListItemsValidationErrors={setListItemsValidationErrors}
                                listItemsValidationErrorsLastIndex={listItemsValidationErrorsLastIndex}
                                listItemsUnsinchronizedErrorsLastIndex={listItemsUnsinchronizedErrorsLastIndex}
                                onImgageClick={(e, videoId) => { openVideo(videoId) }}
                                setItems={setItems}
                            />)
                        }
                    });
                })
            }
        })
    }, []);

    return (
        <div className={styles.list}>
            {Object.values(items)}
        </div>
    );
};

export default ItemsList;