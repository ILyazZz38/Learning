using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Castle.Windsor;
using Learning.CastleWind;
using Learning.Connection.Interface;
using Learning.Connection.SQL.Interface;
using Learning.Models;
using Learning.Models.old;

namespace Learning.Controllers
{
    public class EditTableColumnController : Controller
    {

        /// <summary>
        /// Формируем строку подключения и отправляем данные, читаем ответ в json формате
        /// </summary>
        /// <param name="surname">Фамилия</param>
        /// <param name="firstname">Имя</param>
        /// <param name="fathername">Отчество</param>
        /// <param name="birthday">Дата рождения</param>
        /// <returns></returns>
        public ActionResult AddColumn(string surname, string firstname, string fathername, DateTime birthday)
        {
            var cont = new WindsorContainer();
            cont.Install(new CastleWindConf());
            IEditTable EditTable = cont.Resolve<IEditTable>();
            ISQL sql = cont.Resolve<ISQL>();
            ResResponse resResponse = EditTable.EditDataTable(sql.CreateColumn(surname, firstname, fathername, birthday));

            return Json(resResponse, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Формируем строку подключения и отправляем данные, читаем ответ в json формате
        /// </summary>
        /// <param name="id">Ключ</param>
        /// <param name="surname">Фамилия</param>
        /// <param name="firstname">Имя</param>
        /// <param name="fathername">Отчество</param>
        /// <param name="birthday">Дата рождения</param>
        /// <returns></returns>
        public ActionResult UpdateColumn(int id, string surname, string firstname, string fathername, DateTime birthday)
        {
            var cont = new WindsorContainer();
            cont.Install(new CastleWindConf());
            IEditTable EditTable = cont.Resolve<IEditTable>();
            ISQL sql = cont.Resolve<ISQL>();
            ResResponse resResponse = EditTable.EditDataTable(sql.UpdateColumn(id, surname, firstname, fathername, birthday));

            return Json(resResponse, JsonRequestBehavior.AllowGet);
        }

        public ActionResult SearchColumn(string surname, string firstname, string fathername, DateTime firstBirthday, DateTime lastBirthday)
        {
            var cont = new WindsorContainer();
            cont.Install(new CastleWindConf());
            IEditTable EditTable = cont.Resolve<IEditTable>();
            ISQL sql = cont.Resolve<ISQL>();
            ResResponse resResponse = EditTable.EditDataTable(sql.SearchColumn(surname, firstname, fathername, firstBirthday, lastBirthday));

            return Json(resResponse, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Формируем строку подключения и отправляем данные, читаем ответ в json формате
        /// </summary>
        /// <param name="id">Ключ</param>
        /// <returns></returns>
        public ActionResult DeleteColumn(int id)
        {
            var cont = new WindsorContainer();
            cont.Install(new CastleWindConf());
            IEditTable EditTable = cont.Resolve<IEditTable>();
            ISQL sql = cont.Resolve<ISQL>();
            ResResponse resResponse = EditTable.EditDataTable(sql.DeleteColumn(id));

            return Json(resResponse, JsonRequestBehavior.AllowGet);
        }
    }
}