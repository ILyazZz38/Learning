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
    public class SearchController : Controller
    {
        /// <summary>
        /// Вводим фильтры и получаем данные
        /// </summary>
        /// <param name="surname">Фамилия</param>
        /// <param name="firstname">Имя</param>
        /// <param name="fathername">Отчество</param>
        /// <param name="firstBirthday">Искать по дате рождения с этой даты</param>
        /// <param name="lastBirthday">Искать по дате рождения до этой даты</param>
        /// <returns></returns>
        public ActionResult GetData(string surname, string firstname, string fathername , DateTime firstBirthday, DateTime lastBirthday)
        {
            var cont = new WindsorContainer();
            cont.Install(new CastleWindConf());
            IGetTable connect = cont.Resolve<IGetTable>();
            ISQL sql = cont.Resolve<ISQL>();
            List<Citizen> newCitizens = connect.GetDataTable(sql.GetAllColumn(surname, firstname, fathername, firstBirthday, lastBirthday));
            ResResponse resResponse = new ResResponse();
            if (newCitizens.Count > 0)
            {
                resResponse.success = true;
                resResponse.message = "Операция выполнена";
                resResponse.citizens = newCitizens;
            }
            else
            {
                resResponse.success = false;
                resResponse.message = "Ошибка!";
                resResponse.citizens = newCitizens;
            }
            return Json(resResponse, JsonRequestBehavior.AllowGet);
        }
    }
}