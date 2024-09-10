"use client";

import { NextPage } from "next";
import Nav from "@/components/Nav/Nav";
import styles from './page.module.css';
import { useState } from "react";
import CompetitionCard from "@/components/CompetitionCard/CompetitionCard";
import LabledInput from "@/components/LabledInput/LabledInput";
import LabledTextarea from "@/components/LabledTextarea/LabledTextarea";
import { useRouter } from 'next/navigation'
import { useUser } from "@/contexts/UserContext";

const Create: NextPage = () => {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState<boolean>(false);
  const { authenticatedFetch } = useUser();
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategory(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    const formData = new FormData(e.currentTarget);

    if (!image) {
      formData.delete("image")
    }
    const response = await authenticatedFetch('/competition/', { method: "POST", body: formData }, false);
    const data = await response.json();
    if (response.ok) {
      setError(null);
      router.push(`/competition/${data.id}/update`);
    } else {
      setError(data.detail || "An error occurred");
    }
    setSending(false);
  };

  return (
    <main className={styles.main}>
      <Nav />
      <div className={styles.content}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h1 className={styles.title}>Creating a competition</h1>
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
            />
            <LabledTextarea
              label="Description:"
              maxLength={300}
              placeholder="Description"
              name="description"
              required={true}
              onChange={handleDescriptionChange}
            />
            <LabledInput
              label="Category:"
              maxLength={30}
              type="text"
              placeholder="Category"
              name="category"
              required={true}
              onChange={handleCategoryChange}
            />
            <input
              type="file"
              name="image"
              required={false}
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          <div className={styles.message}>
            <p>{error}</p>
          </div>
          <div className={styles.buttons}>
            <button type="submit" className={styles.submint}>Create</button>
          </div>
        </form>
        <div className={styles.preview}>
          <CompetitionCard
            title={title}
            image={image ? URL.createObjectURL(image) : ''}
            description={description}
            competitionId={""}
            onClick={() => { }} />
        </div>
      </div>
    </main>
  );
};

export default Create;
