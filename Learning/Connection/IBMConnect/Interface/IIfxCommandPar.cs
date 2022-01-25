using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using IBM.Data.Informix;
using Learning.Models;

namespace Learning.Connection.Interface
{
    public interface IIfxCommandPar
    {
        void CreateParams(IfxCommand ifxCommand, SqlRes sqlRes);
    }
}