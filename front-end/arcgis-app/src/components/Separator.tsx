const Separator = ({className}: {className?: string}) => {
    return (
        <div className={`w-100 ${className?className:""}`} style={{borderBottom: "1px solid var(--primary-400)"}}></div>
    )
}

export default Separator;