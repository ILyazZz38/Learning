//using Learning.Models;
//using Newtonsoft.Json;
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Web;
//using System.Web.Mvc;
//using Learning.Servers;

//namespace Learning.Controllers
//{
//    public class CitizensController : Controller
//    {
//        [HttpPost]
//        public ActionResult Add(Citizen newCitizen)
//        {
//            try
//            {
//                int count = ConnectionIBM.citizens.Count;
//                newCitizen.CitizenId = ConnectionIBM.citizens[count].CitizenId + 1;
//                // TODO: Add insert logic here
//                ConnectionIBM.citizens.Add(newCitizen);
//                return RedirectToAction("Success");
//            }
//            catch
//            {
//                return View();
//            }
//        }
//        [HttpPost]
//        public ActionResult Edit(Citizen newCitizen)
//        {
//            try
//            {
//                int id = newCitizen.CitizenId - 1;
//                // TODO: Add insert logic here
//                Citizen citizen = ConnectionIBM.citizens[id];


                
//                citizen = newCitizen;
//                //this.Session["searchFilterSession"] = citizen;

//                if (newCitizen.SurName != null)
//                {
//                    citizen.SurName = newCitizen.SurName;
//                }
//                if (newCitizen.FirstName != null)
//                {
//                    citizen.FirstName = newCitizen.FirstName;
//                }
//                if (newCitizen.FatherName != null)
//                {
//                    citizen.FatherName = newCitizen.FatherName;
//                }
//                if (newCitizen.Birthday != DateTime.MinValue)
//                {
//                    citizen.Birthday = newCitizen.Birthday;
//                }
//                ConnectionIBM.citizens[id] = citizen;

//                return RedirectToAction("Success");
//            }
//            catch
//            {
//                return View();
//            }
//        }
//        // POST: Citizens/preSearch
//        [HttpPost]
//        //public ActionResult preSearch(SearchFilter searchFilter)
//        //{
//        //    try
//        //    {
//        //        // TODO: Add insert logic here
//        //        this.Session["searchFilterSession"] = searchFilter;
//        //        return RedirectToAction("Index");
//        //    }
//        //    catch
//        //    {
//        //        return View();
//        //    }
//        //}

//        // GET: Citizens/Table
//        [HttpGet]
//        public ActionResult Table(SearchFilter searchFilter)
//        {
//            try
//            {
//                ConnectionIBM.TestConnection();

//                List<Citizen> filteredCitizens = ConnectionIBM.citizens;
//                if (searchFilter.surNameFilter != null)
//                {
//                    filteredCitizens = filteredCitizens.Where(filteredCitizen => filteredCitizen.SurName == searchFilter.surNameFilter).ToList();
//                }
//                if (searchFilter.nameFilter != null)
//                {
//                    filteredCitizens = filteredCitizens.Where(filteredCitizen => filteredCitizen.FirstName == searchFilter.nameFilter).ToList();
//                }
//                if (searchFilter.fatherNameFilter != null)
//                {
//                    filteredCitizens = filteredCitizens.Where(filteredCitizen => filteredCitizen.FatherName == searchFilter.fatherNameFilter).ToList();
//                }
//                if (searchFilter.firstDateFilter != DateTime.MinValue)
//                {
//                    filteredCitizens = filteredCitizens.Where(filteredCitizen => filteredCitizen.Birthday >= searchFilter.firstDateFilter).ToList();
//                }
//                if (searchFilter.lastDateFilter != DateTime.MinValue)
//                {
//                    filteredCitizens = filteredCitizens.Where(filteredCitizen => filteredCitizen.Birthday <= searchFilter.lastDateFilter).ToList();
//                }

//                // TODO: Add insert logic here
//                //SearchFilter searchFilter = this.Session["searchFilterSession"] as SearchFilter;

//                string json = JsonConvert.SerializeObject(filteredCitizens);
//                return Content(json);
//                //Json(citizens, JsonRequestBehavior.AllowGet);
//            }
//            catch
//            {
//                return View();
//            }
//        }

//        // POST: Citizens/Delete
//        [HttpPost]
//        public ActionResult Delete(int id)
//        {
//            try
//            {
//                // TODO: Add insert logic here
                
//                return RedirectToAction("Index");
//            }
//            catch
//            {
//                return View();
//            }
//        }
//    }
//}