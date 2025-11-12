export const baseFeatures = [
    {
        id: "set-rule",
        name: "Set a Rule",
        duration: 10000,
        effect: ({ setPopup, setPaused, addRule }) => {
            System.out("set-rule feature activated");
            setPaused(true);
            const newRule = prompt("Enter a new rule:");
            if (newRule) {
                addRule(newRule);
                setPopup(`👑 New Rule Added: ${newRule}`);
                setTimeout(() => {
                    setPopup("");
                    setPaused(false);
                }, 5000);
            } else {
                setPaused(false);
            }
        }
    },
    {
        id: "everyone-drinks",
        name: "Everyone Drinks",
        duration: 5000,
        effect: ({ setPopup, setPaused }) => {
            setPaused(true);
            setPopup("🍻 Everyone takes a sip!");
            setTimeout(() => {
                setPopup("");
                setPaused(false);
            }, 5000);
        },
    },
    {
        id: "waterfall",
        name: "Waterfall",
        duration: 8000,
        effect: ({ setPopup, setPaused }) => {
            setPaused(true);
            setPopup("🌊 Waterfall! Start drinking!");
            setTimeout(() => {
                setPopup("");
                setPaused(false);
            }, 8000);
        },
    },
];
