"use client";

import Loading from "@/components/Loading/Loading";
import { useUser } from "@/contexts/UserContext";
import { NextPage } from "next";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from './page.module.css';

const ConfirmRegistration: NextPage = () => {
    const { setAccessToken, setRefreshToken, authenticatedFetch } = useUser();

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    useEffect(() => {
        setError(sessionStorage.getItem("error"));
        setLoading(JSON.parse(sessionStorage.getItem("loading") || "true"));
    }, [])

    useEffect(() => {
        if (error) {
            sessionStorage.setItem("error", error)
        } else {
            sessionStorage.removeItem("error")
        }
    }, [error])

    useEffect(() => {
        sessionStorage.setItem("loading", JSON.stringify(loading))
        if (!loading) {
            setTimeout(() => {
                window.close();
            }, 5000);
        }
    }, [loading])

    const fetchUser = async () => {
        if (!token) {
            setError("Token is missing or invalid");
            setLoading(false);
            return;
        }
        const formData = new FormData();
        formData.append("token", token);
        const response = await authenticatedFetch('/auth/register/confirm/', { method: "POST", body: formData });
        const data = await response.json();
        if (response.ok) {
            setRefreshToken(data.refresh_token);
            setAccessToken(data.access_token);
            setError(null);
        } else {
            setError(data.detail || "An error occurred");
        }
        setLoading(false);
        sessionStorage.setItem("regToken", token);
    };

    useEffect(() => {
        if (sessionStorage.getItem("regToken") !== token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, [token]);


    if (loading) {
        return (
            <main>
                <Loading />
            </main>
        );
    }

    if (error) {
        return (
            <main>
                <div className={styles.message}>
                    <p>{error}</p>
                </div>
            </main>
        );
    }

    return (
        <main>
            <div className={styles.message}>
                <p>Registration confirmed successfully. This window will close shortly.</p>
            </div>
        </main>
    );
}

export default ConfirmRegistration;
