using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Learning.Connection.ParsConfig.NewFolder1.Interface
{
    public interface IParsConfig
    {
        string configurationConnect { get; }
        void ParseConfiguration();
    }
}