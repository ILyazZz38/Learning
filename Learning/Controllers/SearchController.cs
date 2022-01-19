using Learning.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Learning.Controllers
{
    public class SearchController : Controller
    {
        // POST: Search/preSearch
        [HttpPost]
        public ActionResult preSearch(SearchFilter searchFilter)
        {
            try
            {
                // TODO: Add insert logic here
                this.Session["searchFilterSession"] = searchFilter;
                return RedirectToAction("Index");
            }
            catch
            {
                return View();
            }
        }
        // POST: Search/Search
        [HttpGet]
        public ActionResult Search()
        {
            try
            {
                // TODO: Add insert logic here
                List<Citizen> citizens = new List<Citizen>();
                SearchFilter searchFilter = this.Session["searchFilterSession"] as SearchFilter;
                Citizen citizen = new Citizen()
                {
                    SurName = "Sergeev",
                    FirstName = "Silvestr",
                    FatherName = "Andreevich",
                    Birthday = new DateTime(),
                };

                citizens.Add(citizen);
                return Json(citizens, JsonRequestBehavior.AllowGet);
            }
            catch
            {
                return View();
            }
        }
    }
}
