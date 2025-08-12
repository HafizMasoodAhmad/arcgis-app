interface ButtonWidgetProps {
    title: string;
    className?: string;
    disabled?: boolean;
    isLoading?: boolean;
    selected?: boolean;
    children: React.ReactNode;
    onClick: () => void;
}

export const ButtonWidget = ({ title, className, disabled, onClick, children, selected }: ButtonWidgetProps) => {
   return <button
        className={`px-4 btn ${selected?"btn-secondary":"btn-primary"} ${className ? className : ''}`}
        disabled={disabled==true?disabled:false}
        title={title}
        onClick={onClick}
        style={{width: "auto", height: "40px", padding: "5px", boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.5)"}}
    >        
        {children}
    </button>
};
