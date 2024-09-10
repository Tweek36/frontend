import React, { useState } from 'react';
import styles from '../Auth.module.css'
import InputWithIcon from '@/components/InputWithIcon/InputWithIcon';

import CloseIcon from '@/local/svg/close.svg';
import UsernameIcon from '@/local/svg/login.svg';
import PasswordIcon from '@/local/svg/password.svg';
import { useUser } from '@/contexts/UserContext';

interface LoginProps {
    setIsOpen: (state: boolean) => void
    setAuthMode: (mode: 'login' | 'registration' | 'pass_restore') => void
}

const Login: React.FC<LoginProps> = ({ setIsOpen, setAuthMode }) => {
    const { setAccessToken, setRefreshToken, authenticatedFetch } = useUser();
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const response = await authenticatedFetch("/auth/login/", {method:"POST", body: formData});
        const data = await response.json();

        if (response.ok) {
            setError('')
            setAccessToken(data.access_token)
            setRefreshToken(data.refresh_token)
            setIsOpen(false);
        } else if (data.detail) {
            setError(String(data.detail))
        }
    };

    return (
        <form method='post' onSubmit={handleSubmit}>
            <button className={styles.close} type="button" onClick={() => setIsOpen(false)}>
                <CloseIcon />
            </button>
            <h1>Вход</h1>
            <div className={styles.inputs}>
                <InputWithIcon
                    icon={<UsernameIcon />}
                    name='username'
                    type='text'
                    placeholder='Username/email'
                />
                <InputWithIcon
                    icon={<PasswordIcon />}
                    name='password'
                    type='password'
                    placeholder='Password'
                />
            </div>
            <div className={styles.errors}>
                {error}
            </div>
            <div className={styles.buttons}>
                <button type='submit'>Submit</button>
            </div>
            <div className={styles.questions}>
                <a onClick={() => setAuthMode('pass_restore')}>Forgot your password?</a>
                <a onClick={() => setAuthMode('registration')}>Sign up</a>
            </div>
        </form>
    )
}

export default Login;