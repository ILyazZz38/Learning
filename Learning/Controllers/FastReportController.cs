using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Castle.Windsor;
using FastReport;
using FastReport.Table;
using FastReport.Export.Pdf;
using FastReport.Web;
using Learning.CastleWind;
using Learning.Connection.Interface;
using Learning.Connection.SQL.Interface;
using Learning.Models;

namespace Learning.Controllers
{
    public class FastReportController : Controller
    {

        /// <summary>
        /// Получаем данные и формируем отчет
        /// </summary>
        /// <param name="surname">Фамилия</param>
        /// <param name="firstname">Имя</param>
        /// <param name="fathername">Отчество</param>
        /// <param name="firstBirthday">Искать по дате рождения с этой даты</param>
        /// <param name="lastBirthday">Искать по дате рождения до этой даты</param>
        /// <returns></returns>
        public FileResult GetReport(string surname, string firstname, string fathername, DateTime firstBirthday, DateTime lastBirthday)
        {
            var cont = new WindsorContainer();
            cont.Install(new CastleWindConf());
            IGetTable connect = cont.Resolve<IGetTable>();
            ISQL sql = cont.Resolve<ISQL>();
            List<Citizen> citizens = connect.GetDataTable(sql.GetAllColumn(surname, firstname, fathername, firstBirthday, lastBirthday));

            Stream stream = new MemoryStream();
            WebReport webReport = new WebReport();
            webReport.Report.Load(this.Server.MapPath("~/FastRep/CitizensFastReport.frx"));
            TableObject table = webReport.Report.FindObject("Table2") as TableObject;
            table.ColumnCount = 5;
            table.RowCount = citizens.Count;
            if (table != null)
            {
                for (int row = 0; row < citizens.Count; row++)
                {
                    table[0, row].Text = citizens[row].id_citizen.ToString();
                    table[1, row].Text = citizens[row].surname.ToString();
                    table[2, row].Text = citizens[row].firstname.ToString();
                    table[3, row].Text = citizens[row].fathername.ToString();
                    table[4, row].Text = citizens[row].birthday.ToString();

                    table[0, row].Border.Lines = BorderLines.All;
                    table[1, row].Border.Lines = BorderLines.All;
                    table[2, row].Border.Lines = BorderLines.All;
                    table[3, row].Border.Lines = BorderLines.All;
                    table[4, row].Border.Lines = BorderLines.All;
                }
                webReport.Report.Prepare();
                webReport.Report.Export(new PDFExport(), stream);
                stream.Position = 0;
            }

            return File(stream, "application/zip", "Report.pdf");
        }
    }
}