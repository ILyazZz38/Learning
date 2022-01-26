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
        /// <summary>
        /// Получаем готовые данные для фронта в формате json
        /// </summary>
        /// <returns></returns>
        public ActionResult GetData()
        {
            CitizenList citizenList = new CitizenList();

            var cont = new WindsorContainer();
            cont.Install(new CastleWindConf());
            IGetTable connect = cont.Resolve<IGetTable>();
            ISQL sql = cont.Resolve<ISQL>();
            List<Citizen> newCitizens = connect.GetDataTable(sql.GetAllColumn());
            return Json(newCitizens, JsonRequestBehavior.AllowGet);
        }
    }
}