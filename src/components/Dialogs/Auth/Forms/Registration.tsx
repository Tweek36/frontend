import React, { useState } from 'react';
import styles from '../Auth.module.css'
import InputWithIcon from '@/components/InputWithIcon/InputWithIcon';

import CloseIcon from '@/local/svg/close.svg';
import UsernameIcon from '@/local/svg/login.svg';
import PasswordIcon from '@/local/svg/password.svg';
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
            const response = await unauthenticatedFetch("/auth/register/", { method: "POST", body: formData });
            if (response.ok) {
                setCheck(true)
            }
        } catch (error) {
            console.error('Registration failed:', error);
        }
    };
    return (
        <form method='post' onSubmit={handleSubmit}>
            <button className={styles.close} type="button" onClick={() => setIsOpen(false)}>
                <CloseIcon />
            </button>
            <h1>Registration</h1>
            <div className={styles.inputs}>
                <InputWithIcon icon={<UsernameIcon />} name='username' type='text' placeholder='Username' />
                <InputWithIcon icon={<MailIcon />} name='email' type='email' placeholder='example@mail.example' />
                <InputWithIcon icon={<PasswordIcon />} name='password' type='password' placeholder='Password' />
                <InputWithIcon icon={<PasswordIcon />} name='passwordConfirm' type='password' placeholder='Password' />
            </div>
            <div className={styles.message}>
                {check && (<p>Check your email</p>)}
            </div>
            <div className={styles.buttons}>
                <button type='submit'>Submit</button>
            </div>
            <div className={styles.questions}>
                <a onClick={() => { setAuthMode('pass_restore'); setCheck(false) }}>Forgot your password?</a>
                <a onClick={() => { setAuthMode('login'); setCheck(false) }}>Already have an account?</a>
            </div>
        </form>
    )
}

export default Registration;