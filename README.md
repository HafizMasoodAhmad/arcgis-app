# App ASP PDT - Pennsylvania Department of Transportation

## Project Description

This is a web project developed with ASP.NET Core MVC for the Pennsylvania Department of Transportation (PDT). The application includes mapping functionalities with ArcGIS and transportation data management.

## Technologies Used

- **.NET 9.0** - Development framework
- **ASP.NET Core MVC** - Web architecture pattern
- **Razor Runtime Compilation** - Runtime compilation for development
- **Bootstrap** - CSS framework for responsive design
- **jQuery** - JavaScript library
- **ArcGIS JavaScript API** - For mapping functionalities

## Project Structure

```
App_ASP_PDT/
├── Controllers/                  # MVC Controllers (e.g., HomeController)
├── Models/                       # ViewModels and DTOs (e.g., JsonImportViewModel)
├── Services/                     # Application services (e.g., ScenarioValidationService)
├── TagHelpers/                   # Custom Razor TagHelpers (ReactMountTagHelper)
├── ViewComponents/               # Optional React mount ViewComponent (ReactAppViewComponent)
├── Views/                        # Razor views and layouts
│   ├── Home/
│   │   ├── Index.cshtml          # Hosts React app via <react-mount>
│   │   ├── Map.cshtml            # Also mounts React
│   │   ├── TestMap.cshtml        # Also mounts React
│   │   └── JsonImport.cshtml     # JSON upload/validation page
│   └── Shared/
│       └── _Layout.cshtml        # Loads built CSS, nav links
├── wwwroot/                      # Static files served by ASP.NET Core
│   ├── css/
│   ├── js/
│   │   └── filter/               # Vite build output (bundle_filter.js, vendor-*.js, main.css)
│   └── lib/                      # Third-party libraries (Bootstrap, etc.)
├── front-end/arcgis-app/         # React + TypeScript + Vite source
│   ├── src/                      # App.tsx, context, components, utils, types
│   ├── vite.config.ts            # Vite build config (base=/js/filter/, outDir=wwwroot/js/filter)
│   └── package.json              # Frontend deps (React 19, @arcgis/core, sql.js)
├── App_ASP_PDT.csproj            # MSBuild targets to build frontend before static assets
├── Program.cs                    # ASP.NET Core pipeline configuration
└── Properties/
```

## Additional Libraries

### NuGet Packages
- **Microsoft.AspNetCore.Mvc.Razor.RuntimeCompilation** (v9.0.7)
  - Enables runtime compilation of Razor views
  - Facilitates development by not requiring full recompilation

### Frontend Libraries (wwwroot/lib/)
- **Bootstrap** - CSS framework for responsive design
- **jQuery** - JavaScript library for DOM manipulation
- **jQuery Validation** - Form validation
- **jQuery Validation Unobtrusive** - Non-intrusive validation

### Frontend (React + Vite)
- The React/TypeScript app lives under `front-end/arcgis-app/` and is built to `wwwroot/js/filter/`.
- Razor loads the built bundle via a custom TagHelper: `<react-mount mount-id="react-filter"></react-mount>`.
- An alternative ViewComponent exists (`ReactAppViewComponent`) for teams preferring that approach.

### Legacy
- Legacy scripts under `wwwroot/js/arcgis/**` are excluded from build and publish to avoid confusion.

## Prerequisites

- **.NET 9.0 SDK** or higher
- **Visual Studio 2022** or **Visual Studio Code**
- **Node.js** (optional, for frontend development tools)

## Installation and Configuration

### 1. Clone the Repository
```bash
git clone [REPOSITORY_URL]
cd App_ASP_PDT
```

### 2. Restore Dependencies
```bash
dotnet restore
```

### 3. Verify Configuration
Make sure the configuration files are present:
- `appsettings.json`
- `appsettings.Development.json`

## Startup Commands

### Normal Startup (Development)
```bash
# Option 1: Using dotnet CLI
dotnet run

# Option 2: Using Visual Studio
# Press F5 or Ctrl+F5

# Option 3: Using specific profiles
dotnet run --launch-profile "https"
dotnet run --launch-profile "http"
```

### Startup to Check for Changes (Watch Mode)
```bash
# Start the application in watch mode to automatically detect changes
dotnet watch run

# With specific profile
dotnet watch run --launch-profile "https"
```

### Access URLs
- **HTTP**: http://localhost:5136
- **HTTPS**: https://localhost:7194

## Development Configuration

### Environment Variables
The project uses the following environment variables:
- `ASPNETCORE_ENVIRONMENT`: Development (default)

### Development Features
- **Runtime Compilation**: Razor views compile automatically
- **Hot Reload**: Code changes are reflected without restarting the application
- **Static Assets**: Automatically served from wwwroot

## Controller Structure

### HomeController
- `Index()` - Main page
- `Map()` - Map view with ArcGIS
- `Privacy()` - Privacy page
- `Error()` - Error handling

## Native Razor ↔ React integration (no dev server at runtime)

This application runs entirely as a native ASP.NET Core MVC app. React is built by Vite during the .NET build and the resulting static assets are served by the Static Files middleware.

### How the build pipeline works
- `App_ASP_PDT.csproj` defines a target `BuildClientBeforeStaticAssets` that runs before `ComputeStaticWebAssets;Build;Publish`:
  - `npm install` and `npm run build` are executed in `front-end/arcgis-app/`.
  - This ensures `wwwroot/js/filter/` contains the bundles when ASP.NET computes the Static Web Assets manifest.
- `vite.config.ts` sets:
  - `base: '/js/filter/'` so dynamic imports and assets resolve under the `wwwroot/js/filter/` path.
  - `outDir: '../../wwwroot/js/filter'` to write bundles where ASP.NET can serve them.
- `Program.cs` configures Static Files and adds long-lived cache headers for these bundles and response compression.

### How Razor mounts React
- The `ReactMountTagHelper` renders the mounting `<div>` and includes the `<script type="module" src="/js/filter/bundle_filter.js">`.
- It also bridges server state to the browser by copying `TempData` values into `sessionStorage` so the React app can read them on first load.
- Views such as `Views/Home/Index.cshtml` mount React with:
  - `<react-mount mount-id="react-filter"></react-mount>`
- Alternatively, a ViewComponent is available: `@await Component.InvokeAsync("ReactApp", new { mountId = "react-filter" })`.

### JSON import flow (Razor → React → SQLite → Map)
1. The `JsonImport` Razor page posts a `.json` file to `HomeController.JsonImport`.
2. The controller validates the payload using `IScenarioValidationService` and, if valid, stores the raw JSON in `TempData["ScenarioRawJson"]` and redirects to `Home/Index`.
3. On `Index`, the `ReactMountTagHelper` writes into `sessionStorage`:
   - `pdot:scenario:rawJson`
   - `pdot:scenario:pendingImport = '1'`
4. `App.tsx` waits for both `initMap()` and `createSqlLiteDB()` to complete, then checks `sessionStorage` keys:
   - If a pending import is found, it calls `loadDataFromJson(raw)` from the application context.
   - The context parses the JSON and inserts `Scenario`, `Projects`, and `Treatments` into an in-memory SQLite database (sql.js).
   - It then calls `filterRef.changeScenarioByImport(userId, scenId)` to populate dropdowns and load the ArcGIS FeatureLayer graphics for the scenario.
5. The import flags are cleared from `sessionStorage` once processed.

### Filter persistence and cross-widget synchronization
- Filters are persisted per scenario in `localStorage` under `pdot:filters:<ScenarioId>`.
- When a scenario is selected, saved filters are restored and applied to the layer via `definitionExpression`.
- Custom DOM events (`filter-updated`, `symbologyUpdate`) notify dependent components like Projects and Charts to recompute/reload based on the current filters.
- A single Clear all filters action is exposed in the sidebar to reset UI selections, clear the definition expression, and remove the persisted filters for the current scenario.

### Quick verification checklist (after changes)
- Build runs NPM before Static Web Assets; `wwwroot/js/filter/` contains `bundle_filter.js`, `main.css`, `assets/vendor-*.js`.
- `Home/JsonImport` accepts `.json`, rejects files >10MB, shows validation errors.
- After import, Home loads and dropdowns (User/Scenario/Year/AssetType/Treatment/Route) populate.
- Filters update map, Projects, and Charts; persistence by scenario works; Reset clears all (including User/Scenario).

## Useful Commands

### Development
```bash
# Clean build
dotnet clean

# Rebuild project
dotnet build

# Run tests (if they exist)
dotnet test

# Publish for production
dotnet publish -c Release
```

### Debugging
```bash
# Run with debugging
dotnet run --configuration Debug

# Run with detailed logging
dotnet run --environment Development
```

## Troubleshooting

### HTTPS Certificate Error
If you encounter HTTPS certificate issues:
```bash
dotnet dev-certs https --trust
```

### Port in Use
If the port is occupied, you can change the configuration in `Properties/launchSettings.json`

### Dependency Issues
```bash
# Clear NuGet cache
dotnet nuget locals all --clear

# Restore dependencies
dotnet restore --force
```

## Contributing

1. Create a branch for your feature
2. Make your changes
3. Run the tests
4. Create a pull request

## License

This project is developed for the Pennsylvania Department of Transportation.

## Contact

For more information about this project, contact the PDT development team.
