using System.Collections.Generic;

namespace App_ASP_PDT.Services
{
	public interface IScenarioValidationService
	{
		bool ValidateRawJson(string rawJson, out List<string> errors);
	}
}


