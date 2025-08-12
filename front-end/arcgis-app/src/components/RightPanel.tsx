import { type ReactNode } from 'react';

type RightPanelProps = {
    title: string;
    open: boolean;
    width?: number;
    children: ReactNode;
    onClose: () => void;
};

function RightPanel(props: RightPanelProps) {
    const { title, open, onClose, width = 520, children } = props;

    return (
        <div
            className={`position-absolute top-0 start-0 h-100 ${open ? 'open' : 'closed'}`}
            style={{
                width,
                zIndex: 700,
                boxShadow: '0 0 20px rgba(0,0,0,0.2)',
                backgroundColor: 'rgba(8, 24, 56, 0.8)',
                backdropFilter: 'blur(10px)'
            }}
        >
            <div className="d-flex flex-column h-100">
                <div
                    className="d-flex justify-content-between align-items-center p-1"
                    style={{
                        backgroundColor: 'var(--primary-800)',
                        color: 'var(--primary-100)'
                    }}
                >
                    <h6 className="mt-0 mb-0 p-2">{title}</h6>
                    <button className="btn btn-sm btn-primary me-2" onClick={onClose} style={{ border: 'none', backgroundColor: 'var(--primary-800)' }}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div className="overflow-auto h-100 p-2">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default RightPanel;


