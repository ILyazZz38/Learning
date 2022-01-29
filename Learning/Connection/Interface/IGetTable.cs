using Learning.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Learning.Connection.Interface
{
    public interface IGetTable
    {
        List<Citizen> GetDataTable(string sql);
    }
}