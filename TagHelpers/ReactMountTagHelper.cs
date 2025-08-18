using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Razor.TagHelpers;

namespace App_ASP_PDT.TagHelpers
{
    [HtmlTargetElement("react-mount")]
    public class ReactMountTagHelper : TagHelper
    {
        private readonly ITempDataDictionaryFactory _tempDataFactory;

        public ReactMountTagHelper(ITempDataDictionaryFactory tempDataFactory)
        {
            _tempDataFactory = tempDataFactory;
        }

        [HtmlAttributeName("mount-id")]
        public string MountId { get; set; } = "react-filter";

        [ViewContext]
        public Microsoft.AspNetCore.Mvc.Rendering.ViewContext ViewContext { get; set; } = default!;

        public override void Process(TagHelperContext context, TagHelperOutput output)
        {
            output.TagName = null; // render as raw content

            var tempData = _tempDataFactory.GetTempData(ViewContext.HttpContext);
            var rawJson = tempData["ScenarioRawJson"] as string;

            // Build HTML: mount div
            var html = $"<div id=\"{HtmlEncoder.Default.Encode(MountId)}\" class=\"w-100 h-100\"></div>\n";

            // If exists rawJson in TempData, emit a script to push into sessionStorage
            if (!string.IsNullOrEmpty(rawJson))
            {
                var jsonEscaped = System.Text.Json.JsonSerializer.Serialize(rawJson);
                html += "<script>" +
                        $"sessionStorage.setItem('pdot:scenario:rawJson', {jsonEscaped});" +
                        "sessionStorage.setItem('pdot:scenario:pendingImport','1');" +
                        "</script>\n";
            }

            // Load built bundle
            html += "<script src=\"/js/filter/bundle_filter.js\" type=\"module\"></script>\n";

            output.Content.SetHtmlContent(html);
        }
    }
}


