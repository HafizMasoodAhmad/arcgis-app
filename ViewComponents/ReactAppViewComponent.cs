using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using System.Text.Encodings.Web;

namespace App_ASP_PDT.ViewComponents
{
    // Alternative to TagHelper: not used by default to preserve current behavior
    public class ReactAppViewComponent : ViewComponent
    {
        private readonly ITempDataDictionaryFactory _tempDataFactory;

        public ReactAppViewComponent(ITempDataDictionaryFactory tempDataFactory)
        {
            _tempDataFactory = tempDataFactory;
        }

        public IViewComponentResult Invoke(string mountId = "react-filter")
        {
            var tempData = _tempDataFactory.GetTempData(HttpContext);
            var rawJson = tempData["ScenarioRawJson"] as string;

            var html = $"<div id=\"{HtmlEncoder.Default.Encode(mountId)}\" class=\"w-100 h-100\"></div>\n";
            if (!string.IsNullOrEmpty(rawJson))
            {
                var jsonEscaped = System.Text.Json.JsonSerializer.Serialize(rawJson);
                html += "<script>" +
                        $"sessionStorage.setItem('pdot:scenario:rawJson', {jsonEscaped});" +
                        "sessionStorage.setItem('pdot:scenario:pendingImport','1');" +
                        "</script>\n";
            }
            html += "<script src=\"/js/filter/bundle_filter.js\" type=\"module\"></script>\n";

            return Content(html);
        }
    }
}


