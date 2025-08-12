// Variables globales para paginación
let allProjects = [];
let currentPage = 1;
const projectsPerPage = 50;

async function openProjects() {
    var myModal = new bootstrap.Modal(document.getElementById('projectInfoModal'))

    
    const scenarioId = document.getElementById('scenario_id')?.value;
    
    if(!scenarioId) {
        alert('Please select a scenario first');
        return;
    }
    
    myModal.toggle();

    // Obtener todos los proyectos
    allProjects = getProjectsFromDB(scenarioId);
    currentPage = 1;
    
    // Renderizar la primera página
    renderProjectsPage();
}

function renderProjectsPage() {
    const projectInfo = document.getElementById('projectInfoBody');
    projectInfo.innerHTML = ''; // Limpiar contenido anterior
    
    // Calcular índices de inicio y fin para la página actual
    const startIndex = (currentPage - 1) * projectsPerPage;
    const endIndex = startIndex + projectsPerPage;
    const currentProjects = allProjects.slice(startIndex, endIndex);
    
    // Renderizar proyectos de la página actual
    currentProjects.forEach(async project => {
        const projectDiv = document.createElement('div');
        const treatments = getTreatmentsPerProjectFromDB(project.ProjId);

        let treatmentsHtml = "";
        treatments.forEach(treatment => {
            treatmentsHtml += `
                <div class="treatment-card mb-3">
                    <div class="card border-0 shadow-sm">
                        <div class="card-header bg-primary text-white">
                            <div class="d-flex justify-content-between align-items-center">
                                <h6 class="mb-0">
                                    <i class="fas fa-tools me-2"></i>
                                    Treatment: ${treatment.Treatment}
                                </h6>
                                <span class="badge bg-light text-dark">${treatment.TreatType}</span>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="row g-3">
                                <!-- Información básica -->
                                <div class="col-md-6 col-lg-3">
                                    <div class="info-group">
                                        <label class="form-label fw-bold text-muted small">Project ID</label>
                                        <div class="info-value">${treatment.ProjId}</div>
                                    </div>
                                </div>
                                <div class="col-md-6 col-lg-3">
                                    <div class="info-group">
                                        <label class="form-label fw-bold text-muted small">Asset Type</label>
                                        <div class="info-value">${treatment.ProjType}</div>
                                    </div>
                                </div>
                                <div class="col-md-6 col-lg-3">
                                    <div class="info-group">
                                        <label class="form-label fw-bold text-muted small">County</label>
                                        <div class="info-value">${treatment.Cnty}</div>
                                    </div>
                                </div>
                                <div class="col-md-6 col-lg-3">
                                    <div class="info-group">
                                        <label class="form-label fw-bold text-muted small">Route</label>
                                        <div class="info-value">${treatment.Rte}</div>
                                    </div>
                                </div>
                                
                                <!-- Sección y BRKEY -->
                                <div class="col-md-6 col-lg-3">
                                    <div class="info-group">
                                        <label class="form-label fw-bold text-muted small">Section</label>
                                        <div class="info-value">${treatment.FromSection}-${treatment.ToSection || ''}</div>
                                    </div>
                                </div>
                                <div class="col-md-6 col-lg-3">
                                    <div class="info-group">
                                        <label class="form-label fw-bold text-muted small">BRKEY</label>
                                        <div class="info-value">${treatment.BRKEY}</div>
                                    </div>
                                </div>
                                <div class="col-md-6 col-lg-3">
                                    <div class="info-group">
                                        <label class="form-label fw-bold text-muted small">MPMS ID</label>
                                        <div class="info-value">${treatment.MPMSID}</div>
                                    </div>
                                </div>
                                <div class="col-md-6 col-lg-3">
                                    <div class="info-group">
                                        <label class="form-label fw-bold text-muted small">Preferred Year</label>
                                        <div class="info-value">${treatment.PreferredYear}</div>
                                    </div>
                                </div>
                                
                                <!-- Años -->
                                <div class="col-md-6 col-lg-3">
                                    <div class="info-group">
                                        <label class="form-label fw-bold text-muted small">Min Year</label>
                                        <div class="info-value">${treatment.MinYear}</div>
                                    </div>
                                </div>
                                <div class="col-md-6 col-lg-3">
                                    <div class="info-group">
                                        <label class="form-label fw-bold text-muted small">Max Year</label>
                                        <div class="info-value">${treatment.MaxYear}</div>
                                    </div>
                                </div>
                                
                                <!-- Costos -->
                                <div class="col-md-6 col-lg-4">
                                    <div class="info-group">
                                        <label class="form-label fw-bold text-muted small">Benefit</label>
                                        <div class="info-value text-success fw-bold">$${parseFloat(treatment.Benefit || 0).toLocaleString()}</div>
                                    </div>
                                </div>
                                <div class="col-md-6 col-lg-4">
                                    <div class="info-group">
                                        <label class="form-label fw-bold text-muted small">Direct Cost</label>
                                        <div class="info-value text-danger fw-bold">$${parseFloat(treatment.Cost || 0).toLocaleString()}</div>
                                    </div>
                                </div>
                                <div class="col-md-6 col-lg-4">
                                    <div class="info-group">
                                        <label class="form-label fw-bold text-muted small">Total Cost</label>
                                        <div class="info-value text-primary fw-bold">$${parseFloat(treatment.Cost || 0).toLocaleString()}</div>
                                    </div>
                                </div>
                                
                                <!-- Costos indirectos -->
                                <div class="col-12">
                                    <hr class="my-3">
                                    <h6 class="text-muted mb-3">
                                        <i class="fas fa-calculator me-2"></i>
                                        Indirect Costs
                                    </h6>
                                    <div class="row g-3">
                                        <div class="col-md-6 col-lg-3">
                                            <div class="info-group">
                                                <label class="form-label fw-bold text-muted small">Design</label>
                                                <div class="info-value">$${parseFloat(treatment.IndirectCostDesign || 0).toLocaleString()}</div>
                                            </div>
                                        </div>
                                        <div class="col-md-6 col-lg-3">
                                            <div class="info-group">
                                                <label class="form-label fw-bold text-muted small">ROW</label>
                                                <div class="info-value">$${parseFloat(treatment.IndirectCostROW || 0).toLocaleString()}</div>
                                            </div>
                                        </div>
                                        <div class="col-md-6 col-lg-3">
                                            <div class="info-group">
                                                <label class="form-label fw-bold text-muted small">Utilities</label>
                                                <div class="info-value">$${parseFloat(treatment.IndirectCostUtilities || 0).toLocaleString()}</div>
                                            </div>
                                        </div>
                                        <div class="col-md-6 col-lg-3">
                                            <div class="info-group">
                                                <label class="form-label fw-bold text-muted small">Other</label>
                                                <div class="info-value">$${parseFloat(treatment.IndirectCostOther || 0).toLocaleString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        const treatmentsSection = treatments.length > 0 ? `
            <div class="row mt-3">
                <div class="col-12">
                    <div class="treatments-section">
                        <h5 class="text-primary mb-3">
                            <i class="fas fa-list-alt me-2"></i>
                            Treatments (${treatments.length})
                        </h5>
                        <div class="treatments-container">
                            ${treatmentsHtml}
                        </div>
                    </div>
                </div>
            </div>
        ` : '';

        projectDiv.innerHTML = `
            <div class="project-card mb-4">
                <div class="card border-0 shadow-sm">
                    <div class="card-header bg-success text-white">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">
                                <i class="fas fa-project-diagram me-2"></i>
                                Project: ${project.SchemaId}
                            </h5>
                            <span class="badge bg-light text-dark">District ${project.District}</span>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="row g-4">
                            <!-- Project Identification -->
                            <div class="col-lg-6">
                                <div class="project-section">
                                    <h6 class="text-success mb-3">
                                        <i class="fas fa-info-circle me-2"></i>
                                        Project Identification
                                    </h6>
                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <div class="info-group">
                                                <label class="form-label fw-bold text-muted small">Schema ID</label>
                                                <div class="info-value">${project.SchemaId}</div>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="info-group">
                                                <label class="form-label fw-bold text-muted small">District</label>
                                                <div class="info-value">${project.District}</div>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="info-group">
                                                <label class="form-label fw-bold text-muted small">County</label>
                                                <div class="info-value">${project.County}</div>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="info-group">
                                                <label class="form-label fw-bold text-muted small">Route</label>
                                                <div class="info-value">${project.Route}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Project Description -->
                            <div class="col-lg-6">
                                <div class="project-section">
                                    <h6 class="text-primary mb-3">
                                        <i class="fas fa-edit me-2"></i>
                                        Project Description
                                    </h6>
                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <div class="info-group">
                                                <label class="form-label fw-bold text-muted small">User ID</label>
                                                <div class="info-value">${project.UserId}</div>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="info-group">
                                                <label class="form-label fw-bold text-muted small">Year</label>
                                                <div class="info-value">${project.Year}</div>
                                            </div>
                                        </div>
                                        <div class="col-12">
                                            <div class="info-group">
                                                <label class="form-label fw-bold text-muted small">Project Cost</label>
                                                <div class="info-value text-danger fw-bold">$${parseFloat(project.Cost || 0).toLocaleString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Notes Section -->
                            <div class="col-12">
                                <div class="project-section">
                                    <h6 class="text-warning mb-3">
                                        <i class="fas fa-sticky-note me-2"></i>
                                        Notes
                                    </h6>
                                    <div class="notes-container">
                                        <textarea class="form-control" rows="4" placeholder="Enter notes here..." style="resize: vertical;">${project.UserNotes || ''}</textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        ${treatmentsSection}
                    </div>
                </div>
            </div>
        `;
        projectInfo.appendChild(projectDiv);
    });
    
    // Renderizar controles de paginación
    renderPaginationControls();
}

function renderPaginationControls() {
    const totalPages = Math.ceil(allProjects.length / projectsPerPage);
    const startIndex = (currentPage - 1) * projectsPerPage + 1;
    const endIndex = Math.min(currentPage * projectsPerPage, allProjects.length);
    
    // Buscar o crear el contenedor de paginación
    let paginationContainer = document.getElementById('paginationContainer');
    if (!paginationContainer) {
        paginationContainer = document.createElement('div');
        paginationContainer.id = 'paginationContainer';
        paginationContainer.className = 'd-flex justify-content-between align-items-center mt-3 p-3 bg-light border-top';
        
        // Insertar después del projectInfoBody
        const projectInfo = document.getElementById('projectInfoBody');
        projectInfo.parentNode.insertBefore(paginationContainer, projectInfo.nextSibling);
    }
    
    paginationContainer.innerHTML = `
        <div class="d-flex align-items-center">
            <span class="text-muted">
                Showing ${startIndex} to ${endIndex} of ${allProjects.length} projects
            </span>
        </div>
        <div class="d-flex align-items-center">
            <nav aria-label="Project pagination">
                <ul class="pagination pagination-sm mb-0">
                    <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                        <button class="page-link" onclick="changePage(1)" ${currentPage === 1 ? 'disabled' : ''}>
                            <i class="fas fa-angle-double-left"></i>
                        </button>
                    </li>
                    <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                        <button class="page-link" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
                            <i class="fas fa-angle-left"></i>
                        </button>
                    </li>
                    
                    ${generatePageNumbers(currentPage, totalPages)}
                    
                    <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                        <button class="page-link" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
                            <i class="fas fa-angle-right"></i>
                        </button>
                    </li>
                    <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                        <button class="page-link" onclick="changePage(${totalPages})" ${currentPage === totalPages ? 'disabled' : ''}>
                            <i class="fas fa-angle-double-right"></i>
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
        <div class="d-flex align-items-center">
            <label class="me-2">Go to page:</label>
            <input type="number" id="pageInput" min="1" max="${totalPages}" value="${currentPage}" 
                   style="width: 60px;" class="form-control form-control-sm">
            <button class="btn btn-sm btn-primary ms-2" onclick="goToPage()">Go</button>
        </div>
    `;
}

function generatePageNumbers(currentPage, totalPages) {
    let pageNumbers = '';
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
        // Mostrar todas las páginas si hay 5 o menos
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <button class="page-link" onclick="changePage(${i})">${i}</button>
                </li>
            `;
        }
    } else {
        // Mostrar páginas con elipsis
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        if (startPage > 1) {
            pageNumbers += `
                <li class="page-item">
                    <button class="page-link" onclick="changePage(1)">1</button>
                </li>
                <li class="page-item disabled">
                    <span class="page-link">...</span>
                </li>
            `;
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <button class="page-link" onclick="changePage(${i})">${i}</button>
                </li>
            `;
        }
        
        if (endPage < totalPages) {
            pageNumbers += `
                <li class="page-item disabled">
                    <span class="page-link">...</span>
                </li>
                <li class="page-item">
                    <button class="page-link" onclick="changePage(${totalPages})">${totalPages}</button>
                </li>
            `;
        }
    }
    
    return pageNumbers;
}

function changePage(page) {
    const totalPages = Math.ceil(allProjects.length / projectsPerPage);
    
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderProjectsPage();
        
        // Scroll to top of modal content
        const modalBody = document.querySelector('.modal-body');
        if (modalBody) {
            modalBody.scrollTop = 0;
        }
    }
}

function goToPage() {
    const pageInput = document.getElementById('pageInput');
    const page = parseInt(pageInput.value);
    changePage(page);
}