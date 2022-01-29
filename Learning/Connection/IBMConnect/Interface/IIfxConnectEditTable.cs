using Learning.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Learning.Connection.Interface
{
    public interface IIfxConnectEditTable
    {
        void CreateConnection(string configuration, string sql);
        ResResponse EditTable(SqlRes sqlRes);
        void OpenConnection();
        void CloseConnection();
    }
}