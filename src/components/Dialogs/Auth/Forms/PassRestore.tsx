import React, { useState } from 'react';
import styles from '../Auth.module.css'
import InputWithIcon from '@/components/InputWithIcon/InputWithIcon';

import CloseIcon from '@/local/svg/close.svg';
import MailIcon from '@/local/svg/mail.svg';
import { unauthenticatedFetch } from '@/api/base';

interface RegistrationProps {
    setIsOpen: (state: boolean) => void
    setAuthMode: (mode: 'login' | 'registration' | 'pass_restore') => void
}

const Registration: React.FC<RegistrationProps> = ({ setIsOpen, setAuthMode }) => {
    const [check, setCheck] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        try {
            const response = await unauthenticatedFetch('/auth/reset_password/start/', { method: "POST", body: formData });
            if (response.ok) {
                setCheck(true)
            }
        } catch (error) {
            console.error('Password Recovery failed:', error);
        }
    };

    return (
        <form method='post' onSubmit={handleSubmit}>
            <button className={styles.close} type="button" onClick={() => setIsOpen(false)}>
                <CloseIcon />
            </button>
            <h1>Password Recovery</h1>
            <div className={styles.inputs}>
                <InputWithIcon icon={<MailIcon />} name='email' type='email' placeholder='example@mail.example' />
            </div>
            <div className={styles.message}>
                {check && (<p>Check your email</p>)}
            </div>
            <div className={styles.buttons}>
                <button type='submit'>Submit</button>
            </div>
            <div className={styles.questions}>
                <a onClick={() => setAuthMode('registration')}>Sign up</a>
                <a onClick={() => setAuthMode('login')}>Already have an account?</a>
            </div>
        </form>
    )
}

export default Registration;