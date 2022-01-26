using Learning.Connection.Interface;
using Learning.Connection.ParsConfig.NewFolder1.Interface;
using Learning.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Learning.Connection
{
    public class Connect : IGetTable, IEditTable
    {
        IParsConfig configuration;
        IIfxConnectGetData connectionInformix;
        IIfxConnectEditTable connectionInfmxEditTable;
        List<Citizen> citizens = new List<Citizen>();
        IList<List<string>> listcolumn;

        /// <summary>
        /// 
        /// </summary>
        /// <param name="connectionInformix"></param>
        /// <param name="configuration"></param>
        /// <param name="connectionInfmxEditTable"></param>
        public Connect(IIfxConnectGetData connectionInformix, IParsConfig configuration, IIfxConnectEditTable connectionInfmxEditTable)
        {

            this.connectionInformix = connectionInformix;
            this.configuration = configuration;
            this.connectionInfmxEditTable = connectionInfmxEditTable;
        }

        /// <summary>
        /// Получение данных
        /// </summary>
        /// <param name="sql"></param>
        /// <returns></returns>
        public List<Citizen> GetDataTable(string sql)
        {
            configuration.ParseConfiguration();
            connectionInformix.CreateConnection(configuration.configurationConnect, sql);
            connectionInformix.OpenConnection();

            listcolumn = connectionInformix.GetDataReader();
            foreach (var column in listcolumn)
            {
                Citizen citizen = new Citizen();
                citizen.id_citizen = column[0];
                citizen.surname = column[1];
                citizen.firstname = column[2];
                citizen.fathername = column[3];
                citizen.birthday = column[4];
                citizens.Add(citizen);
            }
            connectionInformix.CloseConnection();

            return citizens;
        }

        /// <summary>
        /// Изменение данных
        /// </summary>
        /// <param name="sqlRes"></param>
        /// <returns></returns>
        public ResResponse EditDataTable(SqlRes sqlRes)
        {
            configuration.ParseConfiguration();
            connectionInfmxEditTable.CreateConnection(configuration.configurationConnect, sqlRes.sql);
            connectionInfmxEditTable.OpenConnection();

            ResResponse result = connectionInfmxEditTable.EditTable(sqlRes);

            connectionInfmxEditTable.CloseConnection();
            return result;
        }
    }
}