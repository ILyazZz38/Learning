using Castle.Windsor;
using Learning.CastleWind;
using Learning.Connection.Interface;
using Learning.Connection.SQL.Interface;
using Learning.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Learning.Controllers
{
    public class JsonController : Controller
    {
        public ActionResult GetData()
        {
            CitizenList citizenList = new CitizenList();

            var cont = new WindsorContainer();
            cont.Install(new CastleWindConf());
            IGetTable connect = cont.Resolve<IGetTable>();
            ISQL sql = cont.Resolve<ISQL>();
            List<Citizen> newCitizens = connect.GetDataTable(sql.GetAllColumn());

            //int firstIndex = start;
            //int End = end;
            //int total = citizens.Count - start;
            //if (total < End)
            //{
            //    End = total;
            //}

            //List<Citizen> newCitizens = new List<Citizen>();

            //for (int i = 0; i < End; i++)
            //{
            //    newCitizens.Add(citizens[firstIndex]);
            //    firstIndex++;
            //}

            //citizenList.total = citizens.Count;
            //citizenList.newCitizens = newCitizens;

            return Json(newCitizens, JsonRequestBehavior.AllowGet);
        }
    }
}