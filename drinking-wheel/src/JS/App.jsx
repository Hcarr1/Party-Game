import React, { useState, useEffect, useRef } from "react";
import "../CSS/App.css";
import Wheel from "./wheel.jsx";
import Modal from "./Modal.jsx";
import { baseFeatures } from "./features.jsx";

export default function App() {
    // ---------- Game State ----------
    const [players, setPlayers] = useState(["Alice", "Bob", "Charlie", "Daisy"]);
    const [drinks, setDrinks] = useState([
        "1 sip", "2 sips", "3 sips", "Half drink", "Full drink", "Nominate"
    ]);
    const [customFeatures, setCustomFeatures] = useState(baseFeatures);
    const [spinningPlayer, setSpinningPlayer] = useState(false);
    const [spinningDrink, setSpinningDrink] = useState(false);
    const [player, setPlayer] = useState("");
    const [drink, setDrink] = useState("");
    const [popup, setPopup] = useState("");
    const [paused, setPaused] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [rules, setRules] = useState([]);
    const addRule = (rule) => setRules([...rules, rule]);

    // ---------- Modal State ----------
    const [showPlayerModal, setShowPlayerModal] = useState(false);
    const [showDrinkModal, setShowDrinkModal] = useState(false);
    const [showFeatureModal, setShowFeatureModal] = useState(false);
    const [showRuleModal, setShowRuleModal] = useState(false);

    // ---------- Modal Inputs ----------
    const [tempPlayerInput, setTempPlayerInput] = useState("");
    const [tempDrinkInput, setTempDrinkInput] = useState("");
    const [tempFeatureName, setTempFeatureName] = useState("");
    const [tempFeatureMessage, setTempFeatureMessage] = useState("");
    const [tempFeatureDuration, setTempFeatureDuration] = useState(5);
    const [tempFeatureTargetPlayer, setTempFeatureTargetPlayer] = useState(players[0] || "");
    const [tempFeatureTargetType, setTempFeatureTargetType] = useState("all");

    const [tempRuleText, setTempRuleText] = useState("");
    const [ruleSetter, setRuleSetter] = useState("");

    // ---------- Feature Queue ----------
    const [featureQueue, setFeatureQueue] = useState([]);

    // ---------- Load from localStorage ----------
    useEffect(() => {
        const savedPlayers = JSON.parse(localStorage.getItem("players"));
        const savedDrinks = JSON.parse(localStorage.getItem("drinks"));
        const savedFeatures = JSON.parse(localStorage.getItem("customFeatures"));
        const savedRules = JSON.parse(localStorage.getItem("rules"));
        if (savedPlayers) setPlayers(savedPlayers);
        if (savedDrinks) setDrinks(savedDrinks);
        if (savedFeatures) setCustomFeatures(savedFeatures);
        if (savedRules) setRules(savedRules);
    }, []);

    // ---------- Save to localStorage ----------
    useEffect(() => localStorage.setItem("players", JSON.stringify(players)), [players]);
    useEffect(() => localStorage.setItem("drinks", JSON.stringify(drinks)), [drinks]);
    useEffect(() => localStorage.setItem("customFeatures", JSON.stringify(customFeatures)), [customFeatures]);
    useEffect(() => localStorage.setItem("rules", JSON.stringify(rules)), [rules]);

    // ---------- Spin Functions ----------
    const spinPlayer = () => { setSpinningPlayer(true); setTimeout(() => setSpinningPlayer(false), 4000); };
    const spinDrink = () => { setSpinningDrink(true); setTimeout(() => setSpinningDrink(false), 4000); };
    const spinBoth = () => {
        if (paused) return;
        setPlayer("");
        setDrink("");
        spinPlayer();
        setTimeout(() => spinDrink(), 4200);
    };

    // ---------- Auto Spin ----------
    useEffect(() => {
        const timer = setInterval(() => {
            if (!paused) spinBoth();
        }, 20000);
        return () => clearInterval(timer);
    }, [paused]);

    // ---------- Handle Player + Drink Popups ----------
    useEffect(() => {
        if (player && drink) {
            if (drink === "Nominate") {
                setPaused(true);

                const originalDrinks = [...drinks];
                setDrinks(drinks.filter(d => d !== "Nominate"));

                setTimeout(() => {
                    setPaused(false);
                    spinDrink();
                }, 4000);

                setDrinks(originalDrinks); // restore after animation
                setPopup(`${player}'s nominated player must drink: ${drink}`)
                setPopup("")
            } else {
                setPaused(true);
                setPopup(`🎯 ${player} drinks: ${drink}`);
                setTimeout(() => {
                    setPopup("");
                    setPaused(false);
                }, 5000);
            }
        }
    }, [player, drink]);

    // ---------- Feature Interval ----------
    useEffect(() => {
        const interval = setInterval(() => {
            if (!paused && featureQueue.length === 0 && customFeatures.length > 0) {
                const randomFeature = customFeatures[Math.floor(Math.random() * customFeatures.length)];
                setFeatureQueue([randomFeature]);
            }
        }, 90000);
        return () => clearInterval(interval);
    }, [paused, featureQueue, customFeatures]);

    // ---------- Feature Queue Handler ----------
    useEffect(() => {
        if (featureQueue.length === 0) return;

        const feature = featureQueue[0];

        if (feature.id === "set-rule") {
            const chosenPlayer = feature.targetType === "specific" ? feature.targetPlayer : players[Math.floor(Math.random() * players.length)];
            setRuleSetter(chosenPlayer);
            setTempRuleText("");
            setPaused(true);
            setShowRuleModal(true);
        } else {
            const handleTarget = () => {
                if (feature.targetType === "specific") return feature.targetPlayer;
                if (feature.targetType === "random") return players[Math.floor(Math.random() * players.length)];
                return null; // "all"
            };

            const targetPlayer = handleTarget();

            const message = targetPlayer ? `${targetPlayer}: ${feature.message}` : feature.message;

            setPopup(message);
            setTimeout(() => {
                setPopup("");
                setPaused(false);
                setFeatureQueue([]);
            }, feature.duration);
        }
    }, [featureQueue]);

    // ---------- Finish Feature ----------
    const finishFeature = () => {
        setPaused(false);
        setFeatureQueue([]);
    };

    // ---------- Trigger Feature Manually ----------
    const triggerFeature = (feature) => {
        if (featureQueue.length === 0) {
            setFeatureQueue([feature]);
        }
    };

    // ---------- Render ----------
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100vw", height: "100vh", overflow: "hidden", position: "relative", background: "#000" }}>

            {/* Wheels */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "4vw", flexWrap: "wrap", flex: 1, width: "100%" }}>
                <Wheel items={players} spinning={spinningPlayer} onFinish={setPlayer} label="Player" />
                <Wheel items={drinks} spinning={spinningDrink} onFinish={setDrink} label="Drink" />
            </div>

            {/* Spin Button */}
            <button onClick={spinBoth} disabled={paused || spinningPlayer || spinningDrink} style={{ marginBottom: "40px", background: paused ? "#555" : "#ff3366", color: "white", border: "none", borderRadius: "12px", padding: "15px 40px", fontSize: "1.5em", cursor: paused ? "not-allowed" : "pointer", boxShadow: "0 0 20px rgba(255, 51, 102, 0.7)" }}>
                🍻 Spin!
            </button>

            {/* Rules Panel */}
            <div style={{ position: "absolute", top: "20px", right: "40px", width: "10vw", background: "#111", color: "white", padding: "12px", borderRadius: "10px", maxHeight: "80vh", overflowY: "auto" }}>
                <h3>Rules</h3>
                {rules.length === 0 && <p>No rules yet</p>}
                {rules.map((rule, index) => <div key={index} style={{ marginBottom: "5px" }}>{index + 1}. {rule}</div>)}
            </div>

            {/* Menu Button */}
            <button onClick={() => setShowMenu(!showMenu)} style={{ position: "absolute", top: "20px", left: "20px", padding: "10px 20px", background: "#ff3366", border: "none", borderRadius: "8px", color: "white", cursor: "pointer" }}>
                ⚙️ Menu
            </button>

            {/* Menu Panel */}
            {showMenu && (
                <div style={{ position: "fixed", top: 0, left: 0, width: "300px", height: "100%", background: "#111", padding: "20px", overflowY: "auto", zIndex: 100 }}>
                    <h2 style={{ color: "white" }}>Settings</h2>

                    {/* Players */}
                    <h3 style={{ color: "white" }}>Players</h3>
                    <button onClick={() => setShowPlayerModal(true)} style={{ width: "100%", marginBottom: "10px" }}>Add Player</button>
                    {players.map((p, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px", background: "#222", padding: "5px 10px", borderRadius: "5px" }}>
                            <span style={{ color: "white" }}>{p}</span>
                            <button onClick={() => setPlayers(players.filter((_, idx) => idx !== i))} style={{ background: "none", color: "#ff3366", border: "1px solid #ff3366", borderRadius: "4px", cursor: "pointer", padding: "2px 6px" }}>✖</button>
                        </div>
                    ))}

                    {/* Drinks */}
                    <h3 style={{ color: "white" }}>Drinks</h3>
                    <button onClick={() => setShowDrinkModal(true)} style={{ width: "100%", marginBottom: "10px" }}>Add Drink</button>
                    {drinks.map((d, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px", background: "#222", padding: "5px 10px", borderRadius: "5px" }}>
                            <span style={{ color: "white" }}>{d}</span>
                            <button onClick={() => setDrinks(drinks.filter((_, idx) => idx !== i))} style={{ background: "none", color: "#ff3366", border: "1px solid #ff3366", borderRadius: "4px", cursor: "pointer", padding: "2px 6px" }}>✖</button>
                        </div>
                    ))}

                    {/* Extra Features */}
                    <h3 style={{ color: "white" }}>Extra Features</h3>
                    <button onClick={() => setShowFeatureModal(true)} style={{ width: "100%", marginBottom: "10px" }}>Add Feature</button>
                    {customFeatures.map((f) => (
                        <div key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px", background: "#222", padding: "5px 10px", borderRadius: "5px" }}>
                            <span style={{ color: "white" }}>{f.name}</span>
                            <button onClick={() => setCustomFeatures(customFeatures.filter((feat) => feat.id !== f.id))} style={{ background: "none", color: "#ff3366", border: "1px solid #ff3366", borderRadius: "4px", cursor: "pointer", padding: "2px 6px" }}>✖</button>
                        </div>
                    ))}

                    <button onClick={() => setShowMenu(false)} style={{ marginTop: "20px", background: "#ff3366", border: "none", padding: "10px 20px", borderRadius: "8px", color: "white", cursor: "pointer", width: "100%" }}>Close</button>
                </div>
            )}

            {/* Popup */}
            {popup && (
                <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "rgba(255,51,102,0.95)", color: "white", padding: "60px 80px", borderRadius: "20px", fontSize: "2em", fontWeight: "bold", textAlign: "center", boxShadow: "0 0 50px rgba(255,51,102,0.8)", zIndex: 200 }}>
                    {popup}
                </div>
            )}

            {/* --- Modals --- */}
            <Modal visible={showPlayerModal} onClose={() => setShowPlayerModal(false)}>
                <h3>Add Player</h3>
                <input autoFocus placeholder="Player Name" value={tempPlayerInput} onChange={(e) => setTempPlayerInput(e.target.value)} style={{ width: "100%", padding: "5px", marginBottom: "10px" }} />
                <button onClick={() => { if (tempPlayerInput.trim()) setPlayers([...players, tempPlayerInput.trim()]); setTempPlayerInput(""); setShowPlayerModal(false); }} style={{ width: "100%", padding: "8px", background: "#ff3366", color: "white", border: "none", borderRadius: "6px" }}>Add Player</button>
            </Modal>

            <Modal visible={showDrinkModal} onClose={() => setShowDrinkModal(false)}>
                <h3>Add Drink</h3>
                <input autoFocus placeholder="Drink Name" value={tempDrinkInput} onChange={(e) => setTempDrinkInput(e.target.value)} style={{ width: "100%", padding: "5px", marginBottom: "10px" }} />
                <button onClick={() => { if (tempDrinkInput.trim()) setDrinks([...drinks, tempDrinkInput.trim()]); setTempDrinkInput(""); setShowDrinkModal(false); }} style={{ width: "100%", padding: "8px", background: "#ff3366", color: "white", border: "none", borderRadius: "6px" }}>Add Drink</button>
            </Modal>

            <Modal visible={showFeatureModal} onClose={() => setShowFeatureModal(false)}>
                <input autoFocus placeholder="Feature Name" value={tempFeatureName} onChange={(e) => setTempFeatureName(e.target.value)} style={{ width: "100%", padding: "5px", marginBottom: "5px" }} />
                <input placeholder="Message to show in popup" value={tempFeatureMessage} onChange={(e) => setTempFeatureMessage(e.target.value)} style={{ width: "100%", padding: "5px", marginBottom: "5px" }} />
                <input type="number" placeholder="Duration (seconds)" value={tempFeatureDuration} onChange={(e) => setTempFeatureDuration(Number(e.target.value))} style={{ width: "100%", padding: "5px", marginBottom: "5px"}} />
                <select value={tempFeatureTargetType} onChange={(e) => setTempFeatureTargetType(e.target.value)} style={{ width: "100%", padding: "5px", marginBottom: "5px" }}>
                    <option value="all">Everyone</option>
                    <option value="specific">Specific Player</option>
                    <option value="random">Random Player</option>
                </select>
                {tempFeatureTargetType === "specific" && (
                    <select value={tempFeatureTargetPlayer} onChange={(e) => setTempFeatureTargetPlayer(e.target.value)} style={{ width: "100%", padding: "5px", marginBottom: "5px" }}>
                        {players.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                )}
                <button onClick={() => {
                    if (!tempFeatureName || !tempFeatureMessage) return;
                    const newFeature = {
                        id: crypto.randomUUID(),
                        name: tempFeatureName,
                        message: tempFeatureMessage,
                        duration: tempFeatureDuration * 1000,
                        type: "popup",
                        targetType: tempFeatureTargetType,
                        targetPlayer: tempFeatureTargetPlayer
                    };
                    setCustomFeatures([...customFeatures, newFeature]);
                    setTempFeatureName(""); setTempFeatureMessage(""); setTempFeatureDuration(5);
                    setTempFeatureTargetPlayer(players[0] || ""); setTempFeatureTargetType("specific");
                    setShowFeatureModal(false);
                }} style={{ width: "100%", padding: "8px", background: "#ff3366", color: "white", border: "none", borderRadius: "6px" }}>
                    Add Feature
                </button>
            </Modal>

            {/* --- Set Rule Modal --- */}
            <Modal visible={showRuleModal} onClose={() => { setShowRuleModal(false); finishFeature(); }}>
                <h3>{ruleSetter}, add a new rule</h3>
                <input
                    autoFocus
                    placeholder="Enter rule..."
                    value={tempRuleText}
                    onChange={(e) => setTempRuleText(e.target.value)}
                    style={{ width: "100%", padding: "5px", marginBottom: "10px" }}
                />
                <button
                    onClick={() => {
                        if (tempRuleText.trim()) {
                            addRule(tempRuleText.trim());
                            setPopup(`👑 ${ruleSetter} added a new rule: ${tempRuleText}`);
                            setTimeout(() => setPopup(""), 5000);
                        }
                        setShowRuleModal(false);
                        finishFeature();
                    }}
                    style={{ width: "100%", padding: "8px", background: "#ff3366", color: "white", border: "none", borderRadius: "6px" }}
                >
                    Add Rule
                </button>
            </Modal>
        </div>
    );
}
