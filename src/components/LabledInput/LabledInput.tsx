import React, { InputHTMLAttributes, useState, useEffect } from 'react';
import styles from "./LabledInput.module.css";

interface LabledInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    inversed?: boolean;
    invalid?: boolean
}

const LabledInput: React.FC<LabledInputProps> = ({ label, maxLength, inversed, invalid, ...props }) => {
    const [inputLength, setInputLength] = useState(props.value ? String(props.value).length : 0);
    const [inputValue, setInputValue] = useState(props.value);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (props.onChange) {
            props.onChange(e);
        }
        setInputLength(e.currentTarget.value.length);
        setInputValue(e.currentTarget.value);
    };

    useEffect(() => {
        setInputLength(props.value ? String(props.value).length : 0);
        setInputValue(props.value);
    }, [props.value]);

    return (
        <div className={styles.input_conteiner}>
            {label && <label>{label}</label>}
            <div className={styles.input_wrapper}>
                <input
                    {...props}
                    onChange={handleInputChange}
                    maxLength={maxLength}
                    className={styles.input + (inversed ? (" " + styles.inversed) : ("")) + (props.className ? (" " + props.className) : ("")) + (invalid ? (" " + styles.invalid) : (""))} />
            </div>
            {maxLength && <span className={styles.max_length}>{inputLength} / {maxLength}</span>}
        </div>
    );
};

export default LabledInput;