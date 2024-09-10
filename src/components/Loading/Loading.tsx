import styles from "./Loading.module.css";
import React from "react";


export const Loading: React.FC = (props: React.HTMLAttributes<HTMLDivElement>) => {
    return (
        <div
            className={styles.loader_wrapper} {...props}
        >
            <div className={styles.loader}></div>
        </div>
    );
};