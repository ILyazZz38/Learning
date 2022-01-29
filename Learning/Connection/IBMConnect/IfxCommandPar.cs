using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using IBM.Data.Informix;
using Learning.Connection.Interface;
using Learning.Models;

namespace Learning.Connection
{
    public class IfxCommandPar : IIfxCommandPar
    {
        IfxCommand ifxCommand;
        SqlRes sqlRes;

        /// <summary>
        /// Создание параметров для SQL запроса
        /// </summary>
        /// <param name="ifxCommand">Формирует команду</param>
        /// <param name="sqlRes">Модель</param>
        public void CreateParams(IfxCommand ifxCommand, SqlRes sqlRes)
        {
            this.ifxCommand = ifxCommand;
            this.sqlRes = sqlRes;

            string[] sql = sqlRes.sql.Split(new char[] { ' ' });

            if (sql[0] == "INSERT")
            {
                CreateColumnCreateParams();
            }
            if (sql[0] == "UPDATE")
            {
                UpdateColumnCreateParams();
            }
            if (sql[0] == "DELETE")
            {
                DeleteColumnCreateParams();
            }
        }

        /// <summary>
        /// Создание параметров при добавлении гражданина в таблицу
        /// </summary>
        void CreateColumnCreateParams()
        {
            ifxCommand.Parameters.Add(new IfxParameter("surname", sqlRes.citizenPar.surname));
            ifxCommand.Parameters.Add(new IfxParameter("firstname", sqlRes.citizenPar.firstname));
            ifxCommand.Parameters.Add(new IfxParameter("fathername", sqlRes.citizenPar.fathername));
            ifxCommand.Parameters.Add(new IfxParameter("birthday", sqlRes.citizenPar.birthday));
        }

        /// <summary>
        /// Создание параметров при обновлении гражданина в таблице
        /// </summary>
        void UpdateColumnCreateParams()
        {
            ifxCommand.Parameters.Add(new IfxParameter("surname", sqlRes.citizenPar.surname));
            ifxCommand.Parameters.Add(new IfxParameter("firstname", sqlRes.citizenPar.firstname));
            ifxCommand.Parameters.Add(new IfxParameter("fathername", sqlRes.citizenPar.fathername));
            ifxCommand.Parameters.Add(new IfxParameter("birthday", sqlRes.citizenPar.birthday));
            ifxCommand.Parameters.Add(new IfxParameter("id", sqlRes.citizenPar.id_citizen));
        }

        /// <summary>
        /// Создание параметров при удалении гражданина из таблицы
        /// </summary>
        void DeleteColumnCreateParams()
        {
            ifxCommand.Parameters.Add(new IfxParameter("id", sqlRes.citizenPar.id_citizen));
        }
    }
}