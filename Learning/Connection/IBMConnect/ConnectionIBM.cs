using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using IBM.Data.Informix;
using Learning.Connection.Interface;
using Learning.Models;

namespace Learning.Connection
{
    public class ConnectionIBM : IIfxConnectGetData, IIfxConnectEditTable
    {
        IIfxCommandPar commandIfxParams;
        IfxConnection myConnection;
        IfxCommand ifxCommand;
        IfxDataReader ifxDataReader;
        ResResponse resResponse = new ResResponse();

        IList<List<string>> listcolumn = new List<List<string>>();

        string sql = "";

        /// <summary>
        /// Приминение параметров команд
        /// </summary>
        /// <param name="commandIfxParams"></param>
        public ConnectionIBM(IIfxCommandPar commandIfxParams)
        {
            this.commandIfxParams = commandIfxParams;
        }

        /// <summary>
        /// Создание подключения
        /// </summary>
        /// <param name="configuration"></param>
        /// <param name="sql"></param>
        public void CreateConnection(string configuration, string sql)
        {
            this.sql = sql;
            myConnection = new IfxConnection(configuration);
        }

        /// <summary>
        /// Чтение данных принятых с БД
        /// </summary>
        /// <returns></returns>
        public IList<List<string>> GetDataReader()
        {
            ifxCommand = new IfxCommand(sql, myConnection);
            ifxDataReader = ifxCommand.ExecuteReader();


            while (ifxDataReader.Read())
            {
                List<string> column = new List<string>();
                column.Add(ifxDataReader["id_citizen"].ToString());
                column.Add(ifxDataReader["surname"].ToString());
                column.Add(ifxDataReader["firstname"].ToString());
                column.Add(ifxDataReader["fathername"].ToString());
                column.Add(ifxDataReader["birthday"].ToString());
                listcolumn.Add(column);
            }
            return listcolumn;
        }

        /// <summary>
        /// Получение результата действий с БД
        /// </summary>
        /// <param name="sqlResult">Запрос sql</param>
        /// <returns></returns>
        public ResResponse EditTable(SqlRes sqlResult)
        {
            ifxCommand = new IfxCommand(sql, myConnection);

            commandIfxParams.CreateParams(ifxCommand, sqlResult);

            int res = ifxCommand.ExecuteNonQuery();
            if (res == 1)
            {
                resResponse.success = true;
                resResponse.message = "Операция выполнена";
                return resResponse;
            }
            else
            {
                resResponse.success = false;
                resResponse.message = "Ошибка!";
                return resResponse;
            }
        }

        /// <summary>
        /// Открыть подключение
        /// </summary>
        public void OpenConnection()
        {
            myConnection.Open();
        }

        /// <summary>
        /// Закрыть подключение
        /// </summary>
        public void CloseConnection()
        {
            myConnection.Close();
        }
    }
}