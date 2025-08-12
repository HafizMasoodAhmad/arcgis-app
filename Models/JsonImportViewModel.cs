using System.Collections.Generic;

namespace App_ASP_PDT.Models
{
    public class JsonImportViewModel
    {
        public string? Message { get; set; }
        public string? Error { get; set; }
        public List<string> ValidationErrors { get; set; } = new();
    }
}


