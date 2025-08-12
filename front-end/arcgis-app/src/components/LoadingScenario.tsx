export const LoadingScenario = () => {
    return (
        <div id="loading-overlay" className="loading-overlay w-100 h-100 position-absolute">
            <div 
                className="d-flex flex-column align-items-center justify-content-center gap-2 p-4"
                style={{backgroundColor: 'var(--primary-800)', width: "300px", height: "150px"}}
            >
                <h6 className="text-white">LOADING SCENARIO</h6>
                <div className="progress w-100" style={{backgroundColor: 'transparent'}}>
                    <div 
                        className="progress-bar progress-bar-striped progress-bar-animated w-100"
                        style={{borderRadius: "510px"}}
                        role="progressbar"
                    ></div>
                </div>
            </div>
        </div>
    )
}