using Learning.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Learning.Connection.Interface
{
    public interface IEditTable
    {
        ResResponse EditDataTable(SqlRes sqlRes);
    }
}