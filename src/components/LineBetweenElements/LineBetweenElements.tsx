import React, { useState, useEffect } from "react";

const LineBetweenElements: React.FC<{
  containerRef: React.RefObject<HTMLElement>;
  element1Ref: React.RefObject<HTMLElement>;
  element2Ref: React.RefObject<HTMLElement>;
}> = ({ containerRef, element1Ref, element2Ref }) => {
  const [linePoints, setLinePoints] = useState<{startX: number; startY: number; endX: number; endY: number; midX: number; midY1: number; midY2: number}>({startX: 0, startY: 0, endX: 0, endY: 0, midX: 0, midY1: 0, midY2: 0});
  const [haight, setHaight] = useState(0);
  const [width, setWidth] = useState(0);

  const updateLine = () => {
    if (!element1Ref.current || !element2Ref.current || !containerRef.current) return;

    // Получаем размеры и положение контейнера
    const container = containerRef.current.getBoundingClientRect();
    const element1 = element1Ref.current.getElementsByTagName("img")[0].getBoundingClientRect();
    const element2 = element2Ref.current.getElementsByTagName("img")[0].getBoundingClientRect();

    // Вычисляем координаты относительно контейнера
    const startX = Math.round((element1.right - container.left + Number.EPSILON) * 10) / 10;
    const startY = Math.round((element1.top + element1.height / 2 - container.top + Number.EPSILON) * 10) / 10;

    const endX = Math.round((element2.left - container.left + Number.EPSILON) * 10) / 10;
    const endY = Math.round((element2.top + element2.height / 2 - container.top + Number.EPSILON) * 10) / 10;

    // Координаты для ломаной линии
    const midX = (startX + endX) / 2;
    const midY1 = startY;
    const midY2 = endY;

    setLinePoints({ startX, startY, endX, endY, midX, midY1, midY2 });
    setHaight(Math.abs(endY - startY) || 2);
    setWidth(endX - startX);
  };

  useEffect(() => {
    updateLine();
  }, [element1Ref, element2Ref, containerRef]);

  return (
    <svg style={{ position: "absolute", top: 0, left: 0, width: `${width}px`, height: `${haight}px`, overflow: "visible" }}>
      <polyline points={`${linePoints.startX},${linePoints.startY} ${linePoints.midX},${linePoints.midY1} ${linePoints.midX},${linePoints.midY2} ${linePoints.endX},${linePoints.endY}`} stroke="black" strokeWidth={2} fill="none" />
    </svg>
  );
};

export default LineBetweenElements;
