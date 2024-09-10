import React, { useState } from 'react';
import styles from "./Search.module.css";
import SearchIcon from "@/local/svg/search.svg"

interface SearchProps {
    onSubmit?: (e: React.FormEvent) => void
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    value?: string
}

const Search: React.FC<SearchProps> = ({ onSubmit, onChange, value }) => {
    return (
        <form className={styles.search} onSubmit={onSubmit}>
            <input
                type="text"
                placeholder="Search"
                value={value}
                onChange={onChange}
            />
            <button type="submit">
                <SearchIcon />
            </button>
        </form>
    );
};

export default Search;
