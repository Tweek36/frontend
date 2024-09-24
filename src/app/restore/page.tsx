"use client";

import Loading from "@/components/Loading/Loading";
import { useUser } from "@/contexts/UserContext";
import { NextPage } from "next";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from './page.module.css';
import InputWithIcon from "@/components/InputWithIcon/InputWithIcon";
import PasswordIcon from '@/local/svg/password.svg';

const ConfirmRegistration: NextPage = () => {
    const { setAccessToken, setRefreshToken, username, authenticatedFetch } = useUser();

    const [globalError, setGlobalError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [formError, setFormError] = useState<string | null>(null)

    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const checkReset = async () => {
        if (!token) {
            setGlobalError("Token is missing or invalid");
            setLoading(false);
            return;
        }
        const formData = new FormData();
        formData.append("token", token);
        const response = await authenticatedFetch('/auth/reset_password/check/', { method: "POST", body: formData });
        const data = await response.json();
        if (response.ok) {
            setGlobalError(null);
        } else {
            setGlobalError(String(data.detail) || "An error occurred");
        }
        setLoading(false);
    };

    useEffect(() => {
        checkReset();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!token) {
            setGlobalError("Token is missing or invalid");
            setLoading(false);
            return;
        }
        const formData = new FormData(e.currentTarget);
        formData.append("token", token)
        const response = await authenticatedFetch('/auth/reset_password/', { method: "POST", body: formData });
        const data = await response.json();
        if (response.ok) {
            setRefreshToken(data.refresh_token);
            setAccessToken(data.access_token);
        } else {
            setFormError(data.detail)
        }
    }

    if (username) {
        return (
            <main>
                <p>You are already logged in</p>
            </main>
        )
    }

    if (loading) {
        return (
            <main>
                <Loading />
            </main>
        );
    }

    if (globalError) {
        return (
            <main>
                <div className={styles.message}>
                    <p>{globalError}</p>
                </div>
            </main>
        );
    }

    return (
        <main>
            <form method="post" onSubmit={handleSubmit}>
                <h1>Password Recovery</h1>
                <div className={styles.inputs}>
                    <InputWithIcon icon={<PasswordIcon />} name='password' type='password' placeholder='Password' />
                    <InputWithIcon icon={<PasswordIcon />} name='passwordConfirm' type='password' placeholder='Password' />
                </div>
                <div className={styles.message}>
                    {formError && (<p>{formError}</p>)}
                </div>
                <div className={styles.buttons}>
                    <button type='submit'>Submit</button>
                </div>
            </form>
        </main>
    );
}

export default ConfirmRegistration;
