import React, { useState } from 'react';
import Login from './Forms/Login';
import Registration from './Forms/Registration';
import { useAuth } from '@/contexts/AuthContext';
import PassRestore from './Forms/PassRestore';


const Auth: React.FC = () => {
    const [authMode, setAuthMode] = useState<'login' | 'registration' | 'pass_restore' | 'message'>('login')
    const { isOpen, setIsOpen } = useAuth();

    const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
        if (e.target === e.currentTarget) {
            setIsOpen(false);
        }
    };

    return (
        <dialog open={isOpen} onMouseUp={handleDialogClick}>
            {authMode === 'login' && <Login setIsOpen={setIsOpen} setAuthMode={setAuthMode} />}
            {authMode === 'registration' && <Registration setIsOpen={setIsOpen} setAuthMode={setAuthMode} />}
            {authMode === 'pass_restore' && <PassRestore setIsOpen={setIsOpen} setAuthMode={setAuthMode}/>}
        </dialog>
    )
}

export default Auth;