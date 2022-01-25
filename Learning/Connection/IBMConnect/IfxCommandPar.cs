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
        void CreateColumnCreateParams()
        {
            ifxCommand.Parameters.Add(new IfxParameter("surname", sqlRes.citizenPar.surname));
            ifxCommand.Parameters.Add(new IfxParameter("firstname", sqlRes.citizenPar.firstname));
            ifxCommand.Parameters.Add(new IfxParameter("fathername", sqlRes.citizenPar.fathername));
            ifxCommand.Parameters.Add(new IfxParameter("birthday", sqlRes.citizenPar.birthday));
        }
        void UpdateColumnCreateParams()
        {
            ifxCommand.Parameters.Add(new IfxParameter("surname", sqlRes.citizenPar.surname));
            ifxCommand.Parameters.Add(new IfxParameter("firstname", sqlRes.citizenPar.firstname));
            ifxCommand.Parameters.Add(new IfxParameter("fathername", sqlRes.citizenPar.fathername));
            ifxCommand.Parameters.Add(new IfxParameter("birthday", sqlRes.citizenPar.birthday));
            ifxCommand.Parameters.Add(new IfxParameter("id", sqlRes.citizenPar.id_citizen));
        }
        void DeleteColumnCreateParams()
        {
            ifxCommand.Parameters.Add(new IfxParameter("id", sqlRes.citizenPar.id_citizen));
        }
    }
}