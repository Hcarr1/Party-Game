import React, { useEffect, useRef, useState } from "react";

const players = ["Alice", "Bob", "Charlie", "Daisy", "Eve"];
const drinks = ["1 sip", "2 sips", "3 sips", "Shot", "Pint", "Nominate"];
const extras = [
    "Set a rule",
    "Everyone drinks",
    "All Girls drink",
    "All lads drink",
    "Waterfall!",
];

function Wheel({ items, spinning, onFinish, label }) {
    const canvasRef = useRef(null);
    const [angle, setAngle] = useState(0);
    const size = 500;
    const radius = size / 2;
    const segmentCount = items.length;
    const segmentAngle = (2 * Math.PI) / segmentCount;

    const drawWheel = (ctx) => {
        ctx.clearRect(0, 0, size, size);
        for (let i = 0; i < segmentCount; i++) {
            const startAngle = i * segmentAngle;
            ctx.beginPath();
            ctx.moveTo(radius, radius);
            ctx.arc(radius, radius, radius, startAngle, startAngle + segmentAngle);
            ctx.fillStyle = `hsl(${(i * 360) / segmentCount}, 80%, 50%)`;
            ctx.fill();

            ctx.save();
            ctx.translate(radius, radius);
            ctx.rotate(startAngle + segmentAngle / 2);
            ctx.textAlign = "right";
            ctx.fillStyle = "#fff";
            ctx.font = "bold 30px Poppins";
            ctx.fillText(items[i], radius - 10, 5);
            ctx.restore();
        }
    };

    const spin = () => {
        const ctx = canvasRef.current.getContext("2d");
        const spinTime = 4000;
        const spinAngle = Math.random() * 360 + 720;
        const targetAngle = angle + spinAngle;
        const startTime = performance.now();

        const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / spinTime, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentAngle = targetAngle * easeOut + angle * (1 - easeOut);

            ctx.save();
            ctx.translate(radius, radius);
            ctx.rotate((currentAngle * Math.PI) / 180);
            ctx.translate(-radius, -radius);
            drawWheel(ctx);
            ctx.restore();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setAngle(currentAngle);
                const index = Math.floor(
                    ((360 - (currentAngle % 360)) / (360 / segmentCount)) % segmentCount
                );
                onFinish(items[index]);
            }
        };

        requestAnimationFrame(animate);
    };

    useEffect(() => {
        const ctx = canvasRef.current.getContext("2d");
        drawWheel(ctx);
    }, []);

    useEffect(() => {
        if (spinning) spin();
    }, [spinning]);

    return (
        <div
            style={{
                position: "relative",
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {/* Right-side pointer */}
            <div
                style={{
                    position: "absolute",
                    right: "-24px",
                    top: "50%",
                    transform: "translateY(-50%) rotate(-90deg)",
                    width: 0,
                    height: 0,
                    borderLeft: "14px solid transparent",
                    borderRight: "14px solid transparent",
                    borderBottom: "28px solid #ffcc00",
                    zIndex: 10,
                }}
            />
            <canvas
                ref={canvasRef}
                width={size}
                height={size}
                style={{
                    borderRadius: "50%",
                    boxShadow: "0 0 40px rgba(255,255,255,0.2)",
                    marginBottom: 10,
                }}
            />
            <div
                style={{
                    position: "absolute",
                    bottom: "-30px",
                    width: "100%",
                    textAlign: "center",
                    fontSize: "1.2em",
                }}
            >
                {label}
            </div>
        </div>
    );
}

export default function App() {
    const [spinning, setSpinning] = useState(false);
    const [player, setPlayer] = useState("");
    const [drink, setDrink] = useState("");
    const [result, setResult] = useState("");
    const [popup, setPopup] = useState("");

    const spinBoth = () => {
        if (spinning) return;
        setResult("");
        setPlayer("");
        setDrink("");
        setSpinning(true);
        setTimeout(() => setSpinning(false), 4200);
    };

    useEffect(() => {
        if (player && drink) setResult(`🎯 ${player} drinks: ${drink}`);
    }, [player, drink]);

    // Auto spin every minute
    useEffect(() => {
        const interval = setInterval(spinBoth, 60000);
        return () => clearInterval(interval);
    }, []);

    // Random popups
    useEffect(() => {
        let timeout;
        const triggerPopup = () => {
            const extra = extras[Math.floor(Math.random() * extras.length)];
            setPopup(extra);
            setTimeout(() => setPopup(""), 5000);
            const nextTime = 30000 + Math.random() * 60000;
            timeout = setTimeout(triggerPopup, nextTime);
        };
        triggerPopup();
        return () => clearTimeout(timeout);
    }, []);

    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                background: "radial-gradient(circle, #1e1e1e, #000)",
                color: "#fff",
                fontFamily: "Poppins, sans-serif",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Wheels container */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "100px",
                    flexWrap: "wrap",
                }}
            >
                <Wheel
                    items={players}
                    spinning={spinning}
                    onFinish={setPlayer}
                    label="Players"
                />
                <Wheel
                    items={drinks}
                    spinning={spinning}
                    onFinish={setDrink}
                    label="Drinks"
                />
            </div>

            {/* Spin Button */}
            <button
                onClick={spinBoth}
                style={{
                    background: "#ff3366",
                    color: "white",
                    border: "none",
                    padding: "14px 30px",
                    borderRadius: "12px",
                    fontSize: "1.3em",
                    cursor: "pointer",
                    marginTop: "50px",
                    boxShadow: "0 0 10px rgba(255, 51, 102, 0.5)",
                }}
            >
                🎡 Spin Now
            </button>

            {/* Result */}
            <div style={{ fontSize: "1.6em", marginTop: 25, minHeight: "2em" }}>
                {result}
            </div>

            {/* Random popup */}
            {popup && (
                <div
                    style={{
                        position: "absolute",
                        top: "10%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "#ff3366",
                        color: "white",
                        padding: "20px 30px",
                        borderRadius: "12px",
                        fontSize: "1.4em",
                        boxShadow: "0 0 15px rgba(255,51,102,0.7)",
                        zIndex: 100,
                        animation: "fadein 0.5s",
                    }}
                >
                    ⚡ {popup}
                </div>
            )}
            <style>
                {`
          @keyframes fadein {
            from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
          }
        `}
            </style>
        </div>
    );
}
