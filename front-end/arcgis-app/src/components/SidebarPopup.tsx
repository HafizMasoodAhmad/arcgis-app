import { useEffect, type ReactNode } from "react";

interface SidebarPopupProps {
    title: string;
    children: ReactNode;
    open: boolean;
    onClose: () => void;
}

const SidebarPopup = ({ title, open, children, onClose }: SidebarPopupProps) => {
    useEffect(() => {
        console.log("open", open);
    }, [open]);
    
    return (
        <div
            className={`position-absolute bottom-0 end-0 p-2 d-flex flex-col gap-2 w-100 h-100 ${open ? 'open' : 'closed'}`}
            style={{
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                backdropFilter: "blur(10px)",
                zIndex: 1000,
            }}
            onClick={onClose}
        >
            <div
                className="w-100 h-50 position-absolute bottom-0 end-0"
                onClick={(e) => e.stopPropagation()}
            >
                <div 
                    className="d-flex flex-column h-100"
                    style={{borderTop: '2px solid var(--primary-500)'}}
                >
                    <div 
                        className="d-flex justify-content-between align-items-center w-100" 
                        style={{backgroundColor: 'var(--primary-800)', color: 'var(--primary-100)'}} 
                    >
                        <h6 className="mt-0 mb-0 p-2">{title}</h6>
                        <button className="btn btn-sm btn-primary" onClick={onClose} style={{border: 'none'}}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    <div className="overflow-auto h-100">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SidebarPopup;