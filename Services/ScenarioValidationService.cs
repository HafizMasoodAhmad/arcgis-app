using System.Text.Json;

namespace App_ASP_PDT.Services
{
	public class ScenarioValidationService : IScenarioValidationService
	{
		public bool ValidateRawJson(string rawJson, out List<string> errors)
		{
			errors = new List<string>();
			try
			{
				using var doc = JsonDocument.Parse(rawJson);
				var root = doc.RootElement;
				if (!root.TryGetProperty("Scenario", out var scenarioEl))
					errors.Add("Falta 'Scenario'.");
				if (!root.TryGetProperty("Projects", out var projectsEl) || projectsEl.ValueKind != JsonValueKind.Array)
					errors.Add("'Projects' debe existir y ser un arreglo.");
				if (!root.TryGetProperty("Treatments", out var treatmentsEl) || treatmentsEl.ValueKind != JsonValueKind.Array)
					errors.Add("'Treatments' debe existir y ser un arreglo.");

				if (scenarioEl.ValueKind == JsonValueKind.Object)
				{
					if (!scenarioEl.TryGetProperty("ScenId", out var scenId) || scenId.ValueKind != JsonValueKind.Number)
						errors.Add("Scenario.ScenId debe ser numérico.");
					if (!scenarioEl.TryGetProperty("LastRunBy", out var lastRunBy) || lastRunBy.ValueKind != JsonValueKind.String)
						errors.Add("Scenario.LastRunBy es requerido (string).");
				}

				int projectIndex = 0;
				foreach (var p in projectsEl.EnumerateArray())
				{
					if (p.ValueKind != JsonValueKind.Object)
						errors.Add($"Projects[{projectIndex}] debe ser un objeto.");
					else
					{
						if (!p.TryGetProperty("ProjId", out var projId) || projId.ValueKind != JsonValueKind.Number)
							errors.Add($"Projects[{projectIndex}].ProjId debe ser numérico.");
						if (!p.TryGetProperty("SchemaId", out var schemaId) || (schemaId.ValueKind != JsonValueKind.Number && schemaId.ValueKind != JsonValueKind.Null))
							errors.Add($"Projects[{projectIndex}].SchemaId debe ser numérico o null.");
					}
					projectIndex++;
					if (projectIndex >= 50) break;
				}

				int treatIndex = 0;
				foreach (var t in treatmentsEl.EnumerateArray())
				{
					if (t.ValueKind != JsonValueKind.Object)
						errors.Add($"Treatments[{treatIndex}] debe ser un objeto.");
					else
					{
						if (!t.TryGetProperty("ProjId", out var tp) || tp.ValueKind != JsonValueKind.Number)
							errors.Add($"Treatments[{treatIndex}].ProjId debe ser numérico.");
						if (!t.TryGetProperty("Year", out var yr) || (yr.ValueKind != JsonValueKind.Number && yr.ValueKind != JsonValueKind.Null))
							errors.Add($"Treatments[{treatIndex}].Year debe ser numérico o null.");
					}
					treatIndex++;
					if (treatIndex >= 50) break;
				}

				return errors.Count == 0;
			}
			catch (Exception ex)
			{
				errors.Add($"JSON inválido: {ex.Message}");
				return false;
			}
		}
	}
}


