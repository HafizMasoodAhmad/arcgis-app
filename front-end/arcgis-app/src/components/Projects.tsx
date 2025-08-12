import { useEffect, useState, type CSSProperties } from "react"
import { useApp } from "@/context/AppContext";

// Types for projects and treatments
interface Project {
    ProjId: number;
    ScenarioId: number;
    UserId: string;
    UserNotes: string;
    SchemaId: number;
    ProjType: number;
    Year: number;
    NBridges: number;
    NPave: number;
    Cost: number;
}

interface Treatment {
    TreatId: number;
    ProjId: number;
    TreatmentId: string;
    ProjType: number;
    Treatment: string;
    TreatType: string;
    Dist: number;
    Cnty: number;
    Rte: number;
    Dir: number;
    FromSection: number;
    ToSection: number;
    BRKEY: string;
    BRIDGE_ID: number;
    Owner: string;
    COUNTY: string;
    MPO_RPO: string;
    Year: number;
    Cost: number;
    Benefit: number;
    PreferredYear: number;
    MinYear: number;
    MaxYear: number;
    PriorityOrder: number;
    IsCommitted: boolean;
    Risk: number;
    IndirectCostDesign: number;
    IndirectCostOther: number;
    IndirectCostROW: number;
    IndirectCostUtilities: number;
    B_C: number;
    MPMSID: string;
}


export const Projects = () => {
    const { getProjectsFiltered, getTreatmentsPerProjectFromDB, getFilterValues, getSelectedScenario } = useApp();

    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const projectsPerPage = 20;

    // Label color to ensure good contrast over dark backgrounds
    const labelStyle: CSSProperties = { color: 'var(--primary-100)' };

    useEffect(() => {
        loadProjects();
        const handler = () => loadProjects();
        window.addEventListener('filter-updated', handler as any);
        return () => window.removeEventListener('filter-updated', handler as any);
    }, []);

    const loadProjects = () => {
        // Obtener todos los proyectos
        
        // Leer valores del filtro
        let filterValues = getFilterValues();
        let scenarioId = getSelectedScenario();
        const projects = getProjectsFiltered(scenarioId, filterValues);
        setAllProjects(projects);
        setFilteredProjects(projects);
        setCurrentPage(1);
        setSearchTerm("");
    }

    const getCurrentProjects = () => {
        const startIndex = (currentPage - 1) * projectsPerPage;
        const endIndex = startIndex + projectsPerPage;
        return filteredProjects.slice(startIndex, endIndex);
    }

    const getTotalPages = () => {
        return Math.ceil(filteredProjects.length / projectsPerPage);
    }

    const changePage = (page: number) => {
        const totalPages = getTotalPages();
        
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    }

    /* const goToPage = () => {
        const page = parseInt(pageInput);
        changePage(page);
    } */

    const handleSearch = (searchValue: string) => {
        setSearchTerm(searchValue);
        setCurrentPage(1);
        
        if (!searchValue.trim()) {
            setFilteredProjects(allProjects);
            return;
        }
        
        const filtered = allProjects.filter(project => 
            project.SchemaId.toString().toLowerCase().includes(searchValue.toLowerCase())
        );
        setFilteredProjects(filtered);
    }

    const generatePageNumbers = (currentPage: number, totalPages: number) => {
        const maxVisiblePages = 5;
        let pageNumbers: React.ReactNode[] = [];
        
        if (totalPages <= maxVisiblePages) {
            // Mostrar todas las páginas si hay 5 o menos
            for (let i = 1; i <= totalPages; i++) {
                const isActive = i === currentPage;
                pageNumbers.push(
                    <li key={i} className={`page-item ${i === currentPage ? 'active' : ''}`}>
                        <button
                            className="page-link"
                            style={{
                                backgroundColor: isActive ? 'var(--theme-secondary)' : 'var(--primary-700)',
                                color: isActive ? 'var(--white)' : 'var(--primary-100)',
                                borderColor: isActive ? 'var(--theme-secondary)' : 'var(--primary-400)',
                                fontWeight: isActive ? 700 : 400
                            }}
                            onClick={() => changePage(i)}
                        >
                            {i}
                        </button>
                    </li>
                );
            }
        } else {
            // Mostrar páginas con elipsis
            let startPage = Math.max(1, currentPage - 2);
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
            
            if (endPage - startPage < maxVisiblePages - 1) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }
            
            if (startPage > 1) {
                pageNumbers.push(
                    <li key="first" className="page-item">
                        <button className="page-link" style={{ backgroundColor: 'var(--primary-700)', color: 'var(--primary-100)', borderColor: 'var(--primary-400)' }} onClick={() => changePage(1)}>1</button>
                    </li>
                );
                pageNumbers.push(
                    <li key="ellipsis1" className="page-item disabled">
                        <span className="page-link" style={{ backgroundColor: 'var(--primary-700)', color: 'var(--primary-100)', borderColor: 'var(--primary-400)' }}>...</span>
                    </li>
                );
            }
            
            for (let i = startPage; i <= endPage; i++) {
                const isActive = i === currentPage;
                pageNumbers.push(
                    <li key={i} className={`page-item ${i === currentPage ? 'active' : ''}`}>
                        <button
                            className="page-link"
                            style={{
                                backgroundColor: isActive ? 'var(--theme-secondary)' : 'var(--primary-700)',
                                color: isActive ? 'var(--white)' : 'var(--primary-100)',
                                borderColor: isActive ? 'var(--theme-secondary)' : 'var(--primary-400)',
                                fontWeight: isActive ? 700 : 400
                            }}
                            onClick={() => changePage(i)}
                        >
                            {i}
                        </button>
                    </li>
                );
            }
            
            if (endPage < totalPages) {
                pageNumbers.push(
                    <li key="ellipsis2" className="page-item disabled">
                        <span className="page-link" style={{ backgroundColor: 'var(--primary-700)', color: 'var(--primary-100)', borderColor: 'var(--primary-400)' }}>...</span>
                    </li>
                );
                pageNumbers.push(
                    <li key="last" className="page-item">
                        <button className="page-link" style={{ backgroundColor: 'var(--primary-700)', color: 'var(--primary-100)', borderColor: 'var(--primary-400)' }} onClick={() => changePage(totalPages)}>{totalPages}</button>
                    </li>
                );
            }
        }
        
        return pageNumbers;
    }

    const renderTreatmentCard = (treatment: Treatment) => {
        return (
            <div key={treatment.TreatId} className="treatment-card mb-3">
                <div className="card border-0 shadow-sm" style={{ backgroundColor: 'rgba(8, 24, 56, 0.8)', color: 'var(--primary-100)', border: '1px solid var(--primary-400)' }}>
                    <div className="card-header" style={{ backgroundColor: 'var(--primary-700)', color: 'var(--primary-100)', borderBottom: '1px solid var(--primary-400)' }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-0">
                                <i className="fas fa-tools me-2"></i>
                                Treatment: {treatment.Treatment}
                            </h6>
                            <span className="badge" style={{ backgroundColor: 'var(--primary-400)', color: 'var(--white)' }}>{treatment.TreatType}</span>
                        </div>
                    </div>
                    <div className="card-body" style={{ color: 'var(--primary-100)' }}>
                        <div className="row g-3">
                            {/* Información básica */}
                            <div className="col-md-6 col-lg-3">
                                <div className="info-group">
                                    <label className="form-label fw-bold small" style={labelStyle}>Project ID</label>
                                    <div className="info-value">{treatment.ProjId}</div>
                                </div>
                            </div>
                            <div className="col-md-6 col-lg-3">
                                <div className="info-group">
                                    <label className="form-label fw-bold small" style={labelStyle}>Asset Type</label>
                                    <div className="info-value">{treatment.ProjType}</div>
                                </div>
                            </div>
                            <div className="col-md-6 col-lg-3">
                                <div className="info-group">
                                    <label className="form-label fw-bold small" style={labelStyle}>County</label>
                                    <div className="info-value">{treatment.Cnty}</div>
                                </div>
                            </div>
                            <div className="col-md-6 col-lg-3">
                                <div className="info-group">
                                    <label className="form-label fw-bold small" style={labelStyle}>Route</label>
                                    <div className="info-value">{treatment.Rte}</div>
                                </div>
                            </div>
                            
                            {/* Sección y BRKEY */}
                            <div className="col-md-6 col-lg-3">
                                <div className="info-group">
                                    <label className="form-label fw-bold small" style={labelStyle}>Section</label>
                                    <div className="info-value">{treatment.FromSection}-{treatment.ToSection || ''}</div>
                                </div>
                            </div>
                            <div className="col-md-6 col-lg-3">
                                <div className="info-group">
                                    <label className="form-label fw-bold small" style={labelStyle}>BRKEY</label>
                                    <div className="info-value">{treatment.BRKEY}</div>
                                </div>
                            </div>
                            <div className="col-md-6 col-lg-3">
                                <div className="info-group">
                                    <label className="form-label fw-bold small" style={labelStyle}>MPMS ID</label>
                                    <div className="info-value">{treatment.MPMSID}</div>
                                </div>
                            </div>
                            <div className="col-md-6 col-lg-3">
                                <div className="info-group">
                                    <label className="form-label fw-bold small" style={labelStyle}>Preferred Year</label>
                                    <div className="info-value">{treatment.PreferredYear}</div>
                                </div>
                            </div>
                            
                            {/* Años */}
                            <div className="col-md-6 col-lg-3">
                                <div className="info-group">
                                    <label className="form-label fw-bold small" style={labelStyle}>Min Year</label>
                                    <div className="info-value">{treatment.MinYear}</div>
                                </div>
                            </div>
                            <div className="col-md-6 col-lg-3">
                                <div className="info-group">
                                    <label className="form-label fw-bold small" style={labelStyle}>Max Year</label>
                                    <div className="info-value">{treatment.MaxYear}</div>
                                </div>
                            </div>
                            
                            {/* Costos */}
                            <div className="col-md-6 col-lg-4">
                                <div className="info-group">
                                    <label className="form-label fw-bold small" style={labelStyle}>Benefit</label>
                                    <div className="info-value text-success fw-bold">${parseFloat(treatment.Benefit?.toString() || '0').toLocaleString()}</div>
                                </div>
                            </div>
                            <div className="col-md-6 col-lg-4">
                                <div className="info-group">
                                    <label className="form-label fw-bold small" style={labelStyle}>Direct Cost</label>
                                    <div className="info-value text-danger fw-bold">${parseFloat(treatment.Cost?.toString() || '0').toLocaleString()}</div>
                                </div>
                            </div>
                            <div className="col-md-6 col-lg-4">
                                <div className="info-group">
                                    <label className="form-label fw-bold small" style={labelStyle}>Total Cost</label>
                                    <div className="info-value text-primary fw-bold">${parseFloat(treatment.Cost?.toString() || '0').toLocaleString()}</div>
                                </div>
                            </div>
                            
                            {/* Costos indirectos */}
                            <div className="col-12">
                                <hr className="my-3" style={{ borderTop: '1px solid var(--primary-400)' }} />
                                <h6 className="mb-3" style={{ color: 'var(--primary-100)' }}>
                                    <i className="fas fa-calculator me-2"></i>
                                    Indirect Costs
                                </h6>
                                <div className="row g-3">
                                    <div className="col-md-6 col-lg-3">
                                        <div className="info-group">
                                            <label className="form-label fw-bold small" style={labelStyle}>Design</label>
                                            <div className="info-value">${parseFloat(treatment.IndirectCostDesign?.toString() || '0').toLocaleString()}</div>
                                        </div>
                                    </div>
                                    <div className="col-md-6 col-lg-3">
                                        <div className="info-group">
                                            <label className="form-label fw-bold small" style={labelStyle}>ROW</label>
                                            <div className="info-value">${parseFloat(treatment.IndirectCostROW?.toString() || '0').toLocaleString()}</div>
                                        </div>
                                    </div>
                                    <div className="col-md-6 col-lg-3">
                                        <div className="info-group">
                                            <label className="form-label fw-bold small" style={labelStyle}>Utilities</label>
                                            <div className="info-value">${parseFloat(treatment.IndirectCostUtilities?.toString() || '0').toLocaleString()}</div>
                                        </div>
                                    </div>
                                    <div className="col-md-6 col-lg-3">
                                        <div className="info-group">
                                            <label className="form-label fw-bold small" style={labelStyle}>Other</label>
                                            <div className="info-value">${parseFloat(treatment.IndirectCostOther?.toString() || '0').toLocaleString()}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const renderProjectCard = (project: Project) => {
        const treatments = getTreatmentsPerProjectFromDB(project.ProjId.toString());
        
        return (
            <div key={project.ProjId} className="project-card mb-4">
                <div className="card border-0 shadow-sm" style={{ backgroundColor: 'rgba(8, 24, 56, 0.8)', color: 'var(--primary-100)', border: '1px solid var(--primary-400)' }}>
                    <div className="card-header" style={{ backgroundColor: 'var(--primary-800)', color: 'var(--primary-100)', borderBottom: '1px solid var(--primary-400)' }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 text-white">
                                <i className="fas fa-project-diagram me-2"></i>
                                Project: {project.SchemaId}
                            </h5>
                            <span className="badge" style={{ backgroundColor: 'var(--primary-400)', color: 'var(--white)' }}>District {project.ProjType}</span>
                        </div>
                    </div>
                    <div className="card-body" style={{ color: 'var(--primary-100)' }}>
                        <div className="row g-4">
                            {/* Project Identification */}
                            <div className="col-lg-6">
                                <div className="project-section">
                                    <h6 className="mb-3" style={{ color: 'var(--primary-100)' }}>
                                        <i className="fas fa-info-circle me-2"></i>
                                        Project Identification
                                    </h6>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <div className="info-group">
                                                <label className="form-label fw-bold small" style={labelStyle}>Schema ID</label>
                                                <div className="info-value">{project.SchemaId}</div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="info-group">
                                                <label className="form-label fw-bold small" style={labelStyle}>District</label>
                                                <div className="info-value">{project.ProjType}</div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="info-group">
                                                <label className="form-label fw-bold small" style={labelStyle}>County</label>
                                                <div className="info-value">{project.ProjType}</div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="info-group">
                                                <label className="form-label fw-bold small" style={labelStyle}>Route</label>
                                                <div className="info-value">{project.ProjType}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Project Description */}
                            <div className="col-lg-6">
                                <div className="project-section">
                                    <h6 className="mb-3" style={{ color: 'var(--primary-100)' }}>
                                        <i className="fas fa-edit me-2"></i>
                                        Project Description
                                    </h6>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <div className="info-group">
                                                <label className="form-label fw-bold small" style={labelStyle}>User ID</label>
                                                <div className="info-value">{project.UserId}</div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="info-group">
                                                <label className="form-label fw-bold small" style={labelStyle}>Year</label>
                                                <div className="info-value">{project.Year}</div>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="info-group">
                                                <label className="form-label fw-bold small" style={labelStyle}>Project Cost</label>
                                                <div className="info-value text-danger fw-bold">${parseFloat(project.Cost?.toString() || '0').toLocaleString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Notes Section */}
                            <div className="col-12">
                                <div className="project-section">
                                    <h6 className="mb-3" style={{ color: 'var(--primary-100)' }}>
                                        <i className="fas fa-sticky-note me-2"></i>
                                        Notes
                                    </h6>
                                    <div className="notes-container">
                                        <textarea
                                            className="form-control"
                                            rows={4}
                                            placeholder="Enter notes here..."
                                            style={{ resize: 'vertical', backgroundColor: 'var(--primary-700)', color: 'var(--primary-100)', borderColor: 'var(--primary-400)' }}
                                            defaultValue={project.UserNotes || ''}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Treatments Section */}
                        {treatments.length > 0 && (
                            <div className="row mt-3">
                                <div className="col-12">
                                    <div className="treatments-section">
                                        <h5 className="mb-3" style={{ color: 'var(--primary-100)' }}>
                                            <i className="fas fa-list-alt me-2"></i>
                                            Treatments ({treatments.length})
                                        </h5>
                                        <div className="treatments-container">
                                            {treatments.map((treatment: any) => renderTreatmentCard(treatment))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const renderPaginationControls = () => {
        const totalPages = getTotalPages();
        const startIndex = (currentPage - 1) * projectsPerPage + 1;
        const endIndex = Math.min(currentPage * projectsPerPage, filteredProjects.length);
        
        return (
            <div className="w-100 d-flex flex-column gap-2 align-items-center mt-3 p-3" style={{ backgroundColor: 'var(--primary-800)', borderTop: '1px solid var(--primary-400)' }}>
                <span style={{ fontSize: '12px', color: 'var(--primary-100)' }}>
                    Showing {startIndex} to {endIndex} of {filteredProjects.length} projects
                    {searchTerm && ` (filtered from ${allProjects.length} total)`}
                </span>
                <div className="d-flex justify-content-between align-items-center">                
                    <div className="d-flex align-items-center">
                        <nav aria-label="Project pagination">
                            <ul className="pagination pagination-sm mb-0" style={{ '--bs-pagination-active-bg': 'var(--theme-secondary)', '--bs-pagination-active-border-color': 'var(--theme-secondary)' } as React.CSSProperties}>
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button 
                                        className="page-link"
                                        style={{ backgroundColor: 'var(--primary-700)', color: 'var(--primary-100)', borderColor: 'var(--primary-400)' }} 
                                        onClick={() => changePage(1)} 
                                        disabled={currentPage === 1}
                                    >
                                        <i className="fas fa-angle-double-left"></i>
                                    </button>
                                </li>
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        style={{ backgroundColor: 'var(--primary-700)', color: 'var(--primary-100)', borderColor: 'var(--primary-400)' }} 
                                        onClick={() => changePage(currentPage - 1)} 
                                        disabled={currentPage === 1}
                                    >
                                        <i className="fas fa-angle-left"></i>
                                    </button>
                                </li>
                                
                                {generatePageNumbers(currentPage, totalPages)}
                                
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        style={{ backgroundColor: 'var(--primary-700)', color: 'var(--primary-100)', borderColor: 'var(--primary-400)' }} 
                                        onClick={() => changePage(currentPage + 1)} 
                                        disabled={currentPage === totalPages}
                                    >
                                        <i className="fas fa-angle-right"></i>
                                    </button>
                                </li>
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        style={{ backgroundColor: 'var(--primary-700)', color: 'var(--primary-100)', borderColor: 'var(--primary-400)' }} 
                                        onClick={() => changePage(totalPages)} 
                                        disabled={currentPage === totalPages}
                                    >
                                        <i className="fas fa-angle-double-right"></i>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>                   
                </div>
            </div>
        );
    }

    if (!getSelectedScenario()) {
        return (
            <div className="alert alert-warning">
                <i className="fas fa-exclamation-triangle me-2"></i>
                Please select a scenario first
            </div>
        );
    }

    const currentProjects = getCurrentProjects();

    return (
        <div className="projects-container d-flex flex-column gap-2 overflow-hidden h-100">
            {/* Search Bar */}
            <div className="search-container p-3" style={{ backgroundColor: 'var(--primary-800)', color: 'var(--primary-100)', borderBottom: '1px solid var(--primary-400)' }}>
                <div className="row g-2 align-items-center">
                    <div className="col-md-6">
                        <div className="input-group">
                            <span className="input-group-text" style={{ backgroundColor: 'var(--primary-700)', color: 'var(--primary-100)', borderColor: 'var(--primary-400)' }}>
                                <i className="fas fa-search"></i>
                            </span>
                            <input
                                type="text"
                                className="form-control search-input"
                                placeholder="Search by Schema ID..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                style={{ backgroundColor: 'var(--primary-700)', color: 'var(--primary-100)', borderColor: 'var(--primary-400)' }}
                            />
                            {searchTerm && (
                                <button
                                    className="btn btn-outline-primary"
                                    type="button"
                                    onClick={() => handleSearch("")}
                                    title="Clear search"
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="d-flex justify-content-end align-items-center">
                            <span className="small me-2" style={{ color: 'var(--primary-100)' }}>
                                {filteredProjects.length} of {allProjects.length} projects
                            </span>
                            {searchTerm && (
                                <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleSearch("")}
                                >
                                    Clear Filter
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Projects List */}
            <div className="project-info-body h-100 overflow-auto" style={{ color: 'var(--primary-100)' }}>
                {currentProjects.length > 0 ? (
                    currentProjects.map(project => renderProjectCard(project))
                ) : (
                    <div className="text-center py-5">
                        <i className="fas fa-search fa-3x mb-3" style={{ color: 'var(--primary-100)' }}></i>
                        <h5 style={{ color: 'var(--primary-100)' }}>No projects found</h5>
                        <p style={{ color: 'var(--primary-100)' }}>
                            {searchTerm ? `No projects match "${searchTerm}"` : "No projects available"}
                        </p>
                        {searchTerm && (
                            <button
                                className="btn btn-outline-primary"
                                onClick={() => handleSearch("")}
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                )}
            </div>
            
            {/* Pagination Controls */}
            {filteredProjects.length > 0 && renderPaginationControls()}
        </div>
    );
}