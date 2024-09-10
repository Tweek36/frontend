"use client";

import { NextPage } from "next";
import Nav from "@/components/Nav/Nav";
import styles from './page.module.css';
import { useEffect, useRef, useState } from "react";
import CompetitionCard from "@/components/CompetitionCard/CompetitionCard";
import LabledInput from "@/components/LabledInput/LabledInput";
import LabledTextarea from "@/components/LabledTextarea/LabledTextarea";
import { useParams, useRouter } from 'next/navigation'
import { useUser } from "@/contexts/UserContext";
import { API_URL } from "@/api/base";
import ItemsList from "@/components/ItemsList/ItemsList";
import WarningIcon from "@/local/svg/warning.svg";
import Link from "next/link";
import Video from "@/components/Dialogs/Video/Video";
import ListItem from "@/components/ListItem/ListItem";
import Error from 'next/error';

const Update: NextPage = () => {
  const router = useRouter();
  const params = useParams()
  const { authenticatedFetch } = useUser();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [published, setPublished] = useState(false);

  const [localData, setLocalData] = useState<{ title?: string, description?: string, category?: string, image?: File }>({});
  const [listItemsValidationErrors, setListItemsValidationErrors] = useState<{ [key: number]: string }>({});
  const listItemsValidationErrorsLastIndex = useRef(0)
  const [listItemsUnsinchronizedErrors, setListItemsUnsinchronizedErrors] = useState<{ [key: number]: { id: string, resolveFunc: () => void } }>({});
  const listItemsUnsinchronizedErrorsLastIndex = useRef(0)
  const [info, setInfo] = useState(false);
  const [playlist, setPlaylist] = useState('');
  const [isPlaylistValid, setIsPlaylistValid] = useState(false)
  const lastIndex = useRef(0)
  const [items, setItems] = useState<{ [key: number]: JSX.Element }>({});
  const [videoId, setVideoId] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  function extractPlaylistId(url: string): string {
    const regex = /(?:list=)([a-zA-Z0-9_-]{34})/;

    const match = url.match(regex);

    return match ? match[1] : '';
  }

  useEffect(() => {
    setItems([
      (<ListItem
        key={0}
        index={0}
        lastIndex={lastIndex}
        competitionId={String(params.competitionId)}
        onImgageClick={(e, videoId) => { openVideo(videoId) }}
        setItems={setItems}
        setListItemsUnsinchronizedErrors={setListItemsUnsinchronizedErrors}
        setListItemsValidationErrors={setListItemsValidationErrors}
        listItemsValidationErrorsLastIndex={listItemsValidationErrorsLastIndex}
        listItemsUnsinchronizedErrorsLastIndex={listItemsUnsinchronizedErrorsLastIndex}
      />)
    ])
    authenticatedFetch(`/competition/${params.competitionId}/`, { method: "GET" }).then(response => {
      if (!response.ok) {
        router.push("/");
        return;
      }
      response.json().then(data => {
        setTitle(data.title)
        setDescription(data.description)
        setCategory(data.category)
        setImage(`${API_URL}/image/${data.image}`)
        setPublished(data.published)
      })
    })
  }, [])

  useEffect(() => {
    if (Object.keys(localData).length === 0) return;

    const timeout = setTimeout(() => {
      const formData = new FormData();
      Object.entries(localData).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value);
        }
      });
      authenticatedFetch(`/competition/${params.competitionId}/`, { method: "PATCH", body: formData }, false).then(response => {
        if (response.ok) {
          setLocalData({});
        }
      })
    }, 1000);
    return () => clearTimeout(timeout);
  }, [title, description, category, image]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    setLocalData({ ...localData, title: e.target.value });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategory(e.target.value)
    setLocalData({ ...localData, category: e.target.value });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value)
    setLocalData({ ...localData, description: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(URL.createObjectURL(e.target.files[0]));
      setLocalData({ ...localData, image: e.target.files[0] });
    }
  };

  const publish = async () => {
    const formData = new FormData();
    formData.append("published", JSON.stringify(!published));
    const response = await authenticatedFetch(`/competition/${params.competitionId}/`, { method: "PATCH", body: formData }, false);
    if (response.ok) {
      const data = await response.json();
      setPublished(data.published);
    }
  }

  const handlePlaylistChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const playlistId = extractPlaylistId(e.target.value);
    if (playlistId) {
      setPlaylist(playlistId);
      setIsPlaylistValid(true)
      return;
    }
    setIsPlaylistValid(false)
    setPlaylist(e.target.value)
  }

  const handlePlaylistAdd = async () => {
    const formData = new FormData();
    formData.append("playlist_id", playlist);
    formData.append("competition_id", String(params.competitionId));
    const response = await authenticatedFetch(`/youtube/add/playlist/`, { method: "POST", body: formData });
    if (response.ok) {
      const data: { id: string, title: string, description: string, videoId: string }[] = await response.json();
      if (data.length) setItems(prevItems => {
        delete prevItems[lastIndex.current];
        return {
          ...prevItems,
          ...Object.fromEntries(data.map((item) => {
            return [++lastIndex.current, <ListItem
              key={lastIndex.current}
              index={lastIndex.current}
              lastIndex={lastIndex}
              competitionId={String(params.competitionId)}
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
            competitionId={String(params.competitionId)}
            setListItemsUnsinchronizedErrors={setListItemsUnsinchronizedErrors}
            setListItemsValidationErrors={setListItemsValidationErrors}
            listItemsValidationErrorsLastIndex={listItemsValidationErrorsLastIndex}
            listItemsUnsinchronizedErrorsLastIndex={listItemsUnsinchronizedErrorsLastIndex}
            onImgageClick={(e, videoId) => { openVideo(videoId) }}
            setItems={setItems}
          />)
        }
      });
    }
  }

  const openVideo = (videoId: string) => {
    setIsOpen(true);
    setVideoId(videoId);
  }

  return (
    <main className={styles.main}>
      <Video isOpen={isOpen} setIsOpen={setIsOpen} videoId={videoId} />
      <Nav />
      {(!!Object.keys(listItemsUnsinchronizedErrors).length || !!Object.keys(listItemsValidationErrors).length) && (
        <div className={styles.warning}>
          {info && (
            <div className={styles.warning_content}>
              {!!Object.keys(listItemsValidationErrors).length && (
                <div className={styles.invalid_content}>
                  <h3>Invalid items:</h3>
                  <div className={styles.invalid_items}>
                    {Object.entries(listItemsValidationErrors).map(([key, value]) => (
                      <Link key={key} href={`#${value}`}>{value}</Link>
                    ))}
                  </div>
                </div>
              )}
              {!!Object.keys(listItemsUnsinchronizedErrors).length && (
                <div className={styles.unsinchronized_content}>
                  {(!!Object.keys(listItemsValidationErrors).length) && <hr />}
                  <h3>Unsinchronized items:</h3>
                  <div className={styles.unsinchronized_items}>
                    {Object.entries(listItemsUnsinchronizedErrors).map(([key, value]) => (
                      <div key={'item' + key} className={styles.unsinchronized_item}>
                        <Link key={'link' + key} href={`#${value.id}`}>
                          {value.id}
                        </Link>
                        <button onClick={() => value.resolveFunc()}>Resolve</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <div onClick={() => setInfo(!info)} className={styles.warning_button + (!!Object.keys(listItemsUnsinchronizedErrors).length ? (' ' + styles.unsinchronized) : ('')) + (!!Object.keys(listItemsValidationErrors).length ? (' ' + styles.invalid) : (''))}>
            <WarningIcon />
          </div>
        </div>
      )}
      <button className={styles.publish} onClick={publish}>
        {published ? "Unpublish" : "Publish"}
      </button>
      <div className={styles.content}>
        <form className={styles.form}>
          <h1 className={styles.title}>{title}</h1>
          <hr />
          <div className={styles.inputs}>
            <LabledInput
              label="Title:"
              maxLength={30}
              type="text"
              placeholder="Title"
              name="title"
              required={true}
              onChange={handleTitleChange}
              value={title}
            />
            <LabledTextarea
              label="Description:"
              maxLength={300}
              placeholder="Description"
              name="description"
              required={true}
              onChange={handleDescriptionChange}
              value={description}
            />
            <LabledInput
              label="Category:"
              maxLength={30}
              type="text"
              placeholder="Category"
              name="category"
              required={true}
              onChange={handleCategoryChange}
              value={category}
            />
            <input
              type="file"
              name="image"
              required={true}
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          <div className={styles.message}></div>
        </form>
        <div className={styles.preview}>
          <CompetitionCard
            title={title}
            image={image}
            description={description}
            competitionId={String(params.competitionId)}
            onClick={(competitionId, e) => { router.push(`/competition/${competitionId}`) }} />
        </div>
      </div>
      <div className={styles.playlist}>
        <div className={styles.playlist_conteiner}>
          <hr />
          <div className={styles.playlist_wrapper}>
            <LabledInput
              label="Playlist:"
              type="text"
              placeholder="URL"
              name="playlist"
              required={false}
              onChange={handlePlaylistChange}
              value={playlist}
            />
            {/^[a-zA-Z0-9_-]{34}$/.test(playlist) && (
              <iframe src={`https://www.youtube.com/embed/videoseries?list=${playlist}`}></iframe>
            )}
            <button className={styles.playlist_button} disabled={!isPlaylistValid} onClick={handlePlaylistAdd}>
              Add
            </button>
          </div>
          <hr />
        </div>
      </div>
      <div className={styles.list}>
        <ItemsList
          className={styles.list}
          competitionId={String(params.competitionId)}
          setListItemsUnsinchronizedErrors={setListItemsUnsinchronizedErrors}
          setListItemsValidationErrors={setListItemsValidationErrors}
          listItemsUnsinchronizedErrors={listItemsUnsinchronizedErrors}
          listItemsValidationErrors={listItemsValidationErrors}
          listItemsValidationErrorsLastIndex={listItemsValidationErrorsLastIndex}
          listItemsUnsinchronizedErrorsLastIndex={listItemsUnsinchronizedErrorsLastIndex}
          items={items}
          setItems={setItems}
          lastIndex={lastIndex}
          openVideo={openVideo}
        />
      </div>
    </main>
  );
};

export default Update;
