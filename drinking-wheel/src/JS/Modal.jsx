export default function Modal ({ visible, onClose, children }) {
    if (!visible) return null;
    return (
        <div
            style={{
                position: "fixed",
                top: 0, left: 0, right: 0, bottom: 0,
                background: "rgba(0,0,0,0.7)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 500,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: "#111",
                    padding: "20px",
                    borderRadius: "12px",
                    minWidth: "300px",
                    maxWidth: "90%",
                }}
                onClick={(e) => e.stopPropagation()} // prevent closing on inner click
            >
                {children}
            </div>
        </div>
    );
};