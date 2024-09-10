"use client";

import React from "react";
import styles from "./Nav.module.css";
import { useUser } from "@/contexts/UserContext";
import { useAuth } from "@/contexts/AuthContext";
import Search from "../Search/Search";
import Link from "next/link";
import LogoIcon from "@/local/svg/logo.svg"
import LogoutIcon from "@/local/svg/logout.svg"

const Nav: React.FC = () => {
    const { username, setUsername, setAccessToken, setRefreshToken, accessToken, refreshToken, authenticatedFetch } = useUser();
    try {
        const { setIsOpen } = useAuth();
        return (
            <nav className={styles.navigator}>
                <Link href={"/"} className={styles.logo}>
                    <LogoIcon />
                </Link>
                <div className={styles.search}><Search /></div>
                <div className={styles.buttons}>
                    <Link href={"/#"} onClick={(e) => { e.preventDefault(); setIsOpen(true) }}>Вход</Link>
                </div>
            </nav>
        )
    } catch (e) {
        const logoutOnClick = () => {
            const formData = new FormData();
            formData.append('access_token', accessToken || '');
            formData.append('refresh_token', refreshToken || '');

            authenticatedFetch('/auth/logout/', { method: "POST", body: formData });
            setUsername(null);
            setAccessToken(null);
            setRefreshToken(null);
        }
        return (
            <nav className={styles.navigator}>
                <Link href={"/"} className={styles.logo}>
                    <LogoIcon />
                </Link>
                <div className={styles.search}><Search /></div>
                <div className={styles.buttons}>
                    <Link href={"/competition"}>Create</Link>
                    <Link href={"/profile"}>{username}</Link>
                    <Link className={styles.logout} href={"/#"} onClick={(e) => { e.preventDefault(); logoutOnClick() }}><LogoutIcon /></Link>
                </div>
            </nav>
        );
    }
};

export default Nav;
