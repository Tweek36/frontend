"use client";

import { NextPage } from "next";
import Nav from "@/components/Nav/Nav";
import styles from './page.module.css';
import { useState, useEffect, useRef } from "react";
import HorizontallyScrollableList from "@/components/HorizontallyScrollableList/HorizontallyScrollableList";
import { API_URL, unauthenticatedFetch } from "@/api/base";
import CompetitionCard from "@/components/CompetitionCard/CompetitionCard";
import { useRouter } from "next/navigation";

interface CompetitionResponseSchema {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  published: boolean;
}

interface PaginatedResponse<T> {
  data: T[];
  max_per_page: number;
  page: number;
  total: number;
}

type CompetitionPaginatedResponseSchema = PaginatedResponse<CompetitionResponseSchema>;


const Main: NextPage = () => {
  const [published, setPublished] = useState<JSX.Element[]>([]);
  const publishedPage = useRef(0);
  const ispublishedFetchable = useRef(true)
  const router = useRouter();
  const preventRedirect = useRef(false)

  const fetchPublished = async (page: number) => {
    if (!ispublishedFetchable.current) {
      return
    }
    const response = await unauthenticatedFetch(`/competition/?max_per_page=10&page=${page}`, { method: "GET" });
    if (!response.ok) {
      ispublishedFetchable.current = false
      return;
    }
    const data: CompetitionPaginatedResponseSchema = await response.json();
    setPublished(prevItems => [...prevItems, ...data.data.map((item, index) => (
      <CompetitionCard
        key={prevItems.length + index}
        title={item.title}
        image={`${API_URL}/image/${item.image}`}
        description={item.description}
        competitionId={item.id}
        onClick={(competitionId, e) => { if (!preventRedirect.current) router.push(`/competition/${competitionId}`) }}
      />
    ))]);
  };

  const handleOnEndReach = (isLeft: boolean, isRight: boolean) => {
    if (!isRight || (!isLeft && !isRight)) {
      fetchPublished(++publishedPage.current);
    }
  };

  return (
    <main>
      <Nav />
      <div className={styles.page}>
        <div className={styles.published}>
          <h2>Published</h2>
          <HorizontallyScrollableList items={published} onEndReach={handleOnEndReach} preventRedirect={preventRedirect} />
        </div>
      </div>
    </main>
  );
};

export default Main;
