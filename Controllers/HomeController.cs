using System.Diagnostics;
using Microsoft.AspNetCore.Http;
using App_ASP_PDT.Services;
using Microsoft.AspNetCore.Mvc;
using App_ASP_PDT.Models;

namespace App_ASP_PDT.Controllers;

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;
    private readonly IScenarioValidationService _validator;

    public HomeController(ILogger<HomeController> logger, IScenarioValidationService validator)
    {
        _logger = logger;
        _validator = validator;
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
    [RequestSizeLimit(10485760)] // 10 MB
    [RequestFormLimits(MultipartBodyLengthLimit = 10485760)]
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
        if (!_validator.ValidateRawJson(text, out var errs))
        {
            vm.Error = "El JSON no cumple el esquema requerido.";
            vm.ValidationErrors = errs;
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
