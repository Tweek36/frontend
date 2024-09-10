import React, { TextareaHTMLAttributes, useEffect, useState } from 'react';
import styles from "./LabledTextarea.module.css";

interface LabledTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    inversed?: boolean;
}

const LabledTextarea: React.FC<LabledTextareaProps> = ({ label, maxLength, inversed, ...props }) => {
    const [inputLength, setInputLength] = useState(props.value ? String(props.value).length : 0);
    const [inputValue, setInputValue] = useState(props.value);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputLength(e.target.value.length);
        if (props.onChange) {
            props.onChange(e);
        }
        setInputValue(e.target.value);
    };

    useEffect(() => {
        setInputLength(props.value ? String(props.value).length : 0);
        setInputValue(props.value);
    }, [props.value]);

    return (
        <div className={styles.input_conteiner}>
            {label && <label>{label}</label>}
            <div className={styles.input_wrapper}>
                <textarea
                    {...props}
                    maxLength={maxLength}
                    onChange={handleInputChange}
                    className={`${styles.input}${inversed ? (" " + styles.inversed) : ("")}${props.className ? (" " + props.className) : ("")}`} />
            </div>
            {maxLength && <span className={styles.max_length}>{inputLength} / {maxLength}</span>}
        </div>
    );
};

export default LabledTextarea;