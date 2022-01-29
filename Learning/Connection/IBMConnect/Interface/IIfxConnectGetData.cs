using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Learning.Connection.Interface
{
    public interface IIfxConnectGetData
    {
        void CreateConnection(string configuration, string sql);
        IList<List<string>> GetDataReader();
        void OpenConnection();
        void CloseConnection();
    }
}