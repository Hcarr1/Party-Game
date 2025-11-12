import React, {useEffect, useRef, useState} from "react";

export default function Wheel({ items, spinning, onFinish, label }){
    const canvasRef = useRef(null);
    const [angle, setAngle] = useState(0);
    const [size, setSize] = useState(0);

    // Resize wheel dynamically
    useEffect(() => {
        const handleResize = () => {
            const maxWidth = window.innerWidth * 0.9; // 90% of viewport
            const newSize = Math.min(maxWidth / 2, window.innerHeight * 0.65);
            setSize(newSize);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Draw wheel
    useEffect(() => {
        if (!size) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        canvas.width = size;
        canvas.height = size;

        const radius = size / 2;
        const center = { x: radius, y: radius };
        const segmentAngle = (2 * Math.PI) / items.length;

        const wheelColors = [
            "#FF4C4C", // Red
            "#4CAF50", // Green
            "#2196F3", // Blue
            "#9C27B0", // Purple
            "#FFC107", // Amber/Gold
            "#FF9800", // Bright Orange
            "#3F51B5", // Indigo
            "#8BC34A", // Light Green
            "#E91E63", // Pink
            "#009688"  // Teal
        ];

        ctx.clearRect(0, 0, size, size);
        items.forEach((item, i) => {
            const start = i * segmentAngle + angle;
            const end = start + segmentAngle;

            ctx.beginPath();
            ctx.moveTo(center.x, center.y);
            ctx.arc(center.x, center.y, radius, start, end);
            ctx.fillStyle = wheelColors[i % wheelColors.length];
            ctx.fill();

            ctx.save();
            ctx.translate(center.x, center.y);
            ctx.rotate(start + segmentAngle / 2);
            ctx.textAlign = "right";
            ctx.fillStyle = "white";
            ctx.font = `${radius / 10}px sans-serif`;
            ctx.fillText(item, radius * 0.9, 10);
            ctx.restore();
        });
    }, [angle, items, size]);

    // Spin animation
    useEffect(() => {
        if (spinning) {
            const totalRotation = 10 + Math.random() * 8;
            const duration = 3000 + Math.random() * 2000;
            const start = performance.now();

            const animate = (time) => {
                const elapsed = time - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const currentAngle = eased * totalRotation * 2 * Math.PI;
                setAngle(currentAngle);
                if (progress < 1) requestAnimationFrame(animate);
                else {
                    const segmentAngle = (2 * Math.PI) / items.length;
                    const index =
                        Math.floor(
                            ((2 * Math.PI - (currentAngle % (2 * Math.PI))) / segmentAngle) %
                            items.length
                        );
                    onFinish(items[index]);
                }
            };
            requestAnimationFrame(animate);
        }
    }, [spinning]);

    return (
        <div
            style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            <canvas ref={canvasRef} />
            {/* Pointer triangles */}
            <div
                style={{
                    position: "absolute",
                    top: "45%",
                    right: `-${size * 0.03}px`,
                    transform: "translateY(-50%) rotate(180deg)",
                    width: 0,
                    height: 0,
                    borderTop: `${size * 0.03}px solid transparent`,
                    borderBottom: `${size * 0.03}px solid transparent`,
                    borderLeft: `${size * 0.06}px solid white`,
                }}
            ></div>
            <div
                style={{
                    textAlign: "center",
                    marginTop: "10px",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "1.2em",
                }}
            >
                {label}
            </div>
        </div>
    );
};
