using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using App_ASP_PDT.Models;

namespace App_ASP_PDT.Controllers;

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;

    public HomeController(ILogger<HomeController> logger)
    {
        _logger = logger;
    }

    public IActionResult Index()
    {
        return View();
    }

    public IActionResult Privacy()
    {
        return View();
    }

    public IActionResult Map()
    {
        return View();
    }
    
    public IActionResult TestMap()
    {
        return View();
    }

    [HttpGet]
    public IActionResult JsonImport()
    {
        return View(new JsonImportViewModel());
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult JsonImport(IFormFile? file)
    {
        var vm = new JsonImportViewModel();
        if (file == null || file.Length == 0)
        {
            vm.Error = "Seleccione un archivo .json";
            return View(vm);
        }
        if (!file.FileName.EndsWith(".json", StringComparison.OrdinalIgnoreCase))
        {
            vm.Error = "El archivo debe tener extensión .json";
            return View(vm);
        }

        using var reader = new StreamReader(file.OpenReadStream());
        var text = reader.ReadToEnd();
        // Validación avanzada de estructura con mensajes claros
        try
        {
            using var doc = System.Text.Json.JsonDocument.Parse(text);
            var root = doc.RootElement;
            if (!root.TryGetProperty("Scenario", out var scenarioEl))
                vm.ValidationErrors.Add("Falta 'Scenario'.");
            if (!root.TryGetProperty("Projects", out var projectsEl) || projectsEl.ValueKind != System.Text.Json.JsonValueKind.Array)
                vm.ValidationErrors.Add("'Projects' debe existir y ser un arreglo.");
            if (!root.TryGetProperty("Treatments", out var treatmentsEl) || treatmentsEl.ValueKind != System.Text.Json.JsonValueKind.Array)
                vm.ValidationErrors.Add("'Treatments' debe existir y ser un arreglo.");

            // Validaciones de campos mínimos
            if (scenarioEl.ValueKind == System.Text.Json.JsonValueKind.Object)
            {
                if (!scenarioEl.TryGetProperty("ScenId", out var scenId) || scenId.ValueKind != System.Text.Json.JsonValueKind.Number)
                    vm.ValidationErrors.Add("Scenario.ScenId debe ser numérico.");
                if (!scenarioEl.TryGetProperty("LastRunBy", out var lastRunBy) || lastRunBy.ValueKind != System.Text.Json.JsonValueKind.String)
                    vm.ValidationErrors.Add("Scenario.LastRunBy es requerido (string).");
            }

            int projectIndex = 0;
            foreach (var p in projectsEl.EnumerateArray())
            {
                if (p.ValueKind != System.Text.Json.JsonValueKind.Object)
                {
                    vm.ValidationErrors.Add($"Projects[{projectIndex}] debe ser un objeto.");
                }
                else
                {
                    if (!p.TryGetProperty("ProjId", out var projId) || projId.ValueKind != System.Text.Json.JsonValueKind.Number)
                        vm.ValidationErrors.Add($"Projects[{projectIndex}].ProjId debe ser numérico.");
                    if (!p.TryGetProperty("SchemaId", out var schemaId) || (schemaId.ValueKind != System.Text.Json.JsonValueKind.Number && schemaId.ValueKind != System.Text.Json.JsonValueKind.Null))
                        vm.ValidationErrors.Add($"Projects[{projectIndex}].SchemaId debe ser numérico o null.");
                }
                projectIndex++;
                if (projectIndex >= 50) break; // limitar para mensajes
            }

            int treatIndex = 0;
            foreach (var t in treatmentsEl.EnumerateArray())
            {
                if (t.ValueKind != System.Text.Json.JsonValueKind.Object)
                {
                    vm.ValidationErrors.Add($"Treatments[{treatIndex}] debe ser un objeto.");
                }
                else
                {
                    if (!t.TryGetProperty("ProjId", out var tp) || tp.ValueKind != System.Text.Json.JsonValueKind.Number)
                        vm.ValidationErrors.Add($"Treatments[{treatIndex}].ProjId debe ser numérico.");
                    if (!t.TryGetProperty("Year", out var yr) || (yr.ValueKind != System.Text.Json.JsonValueKind.Number && yr.ValueKind != System.Text.Json.JsonValueKind.Null))
                        vm.ValidationErrors.Add($"Treatments[{treatIndex}].Year debe ser numérico o null.");
                }
                treatIndex++;
                if (treatIndex >= 50) break;
            }

            if (vm.ValidationErrors.Count > 0)
            {
                vm.Error = "El JSON no cumple el esquema requerido.";
                return View(vm);
            }
        }
        catch (Exception ex)
        {
            vm.Error = $"JSON inválido: {ex.Message}";
            return View(vm);
        }

        // Pasar el JSON a la siguiente vista vía TempData (sin mezclar lógica en la vista)
        TempData["ScenarioRawJson"] = text;
        // Indicamos a Home que hay una importación pendiente
        TempData["PendingImport"] = true;
        return RedirectToAction("Index");
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
