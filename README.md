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
├── Controllers/          # MVC Controllers
├── Models/              # Data models
├── Views/               # Razor views
├── wwwroot/             # Static files
│   ├── css/            # Stylesheets
│   ├── js/             # JavaScript scripts
│   │   └── arcgis/     # ArcGIS specific scripts
│   └── lib/            # Third-party libraries
├── Properties/          # Project configuration
└── Program.cs          # Application entry point
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

### Custom Scripts
- **filter.js** - Filtering functionalities for ArcGIS
- **treatment.js** - Data treatment functionalities for ArcGIS

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

## ArcGIS Functionalities

The project includes integration with ArcGIS JavaScript API:

### JavaScript Files
- **filter.js**: Implements filters for map layers
- **treatment.js**: Handles geospatial data treatment

### Configuration
ArcGIS scripts are located in `wwwroot/js/arcgis/` and are automatically loaded in corresponding views.

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
