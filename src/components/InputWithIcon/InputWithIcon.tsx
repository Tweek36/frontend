import React from 'react';
import styles from './InputWithIcon.module.css'

interface InputWithIconProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon: React.ReactElement;
}

const InputWithIcon: React.FC<InputWithIconProps> = ({ icon, ...props }) => {
    return (
        <div className={styles.inputWithIcon}>
            <input {...props} />
            {icon}
        </div>
    )
}

export default InputWithIcon;