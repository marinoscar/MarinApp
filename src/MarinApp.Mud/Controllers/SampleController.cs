using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MarinApp.Mud.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SampleController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Ok("Hello from controller!");
        }
    }
}
