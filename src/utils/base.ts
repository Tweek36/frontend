import { useEffect, useState, useRef, MutableRefObject } from "react";

const useElementOnScreen = <T extends HTMLElement>(
    options: IntersectionObserverInit
): [boolean, MutableRefObject<T | null>] => {
    const elementRef = useRef<T | null>(null);

    const [isIntersecting, setIntersecting] = useState(false);

    useEffect(() => {

        if (!elementRef.current) {
            setIntersecting(false);
            return;
        }
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.target !== elementRef.current) {
                observer.unobserve(entry.target);
                setIntersecting(false);
                return
            }

            setIntersecting(entry.isIntersecting)
        }, options);
        observer.observe(elementRef.current);
        return () => {
            if (elementRef.current) observer.unobserve(elementRef.current);
        };
    }, [elementRef.current, options]);

    return [isIntersecting, elementRef];
};

export { useElementOnScreen }