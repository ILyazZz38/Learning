using Learning.Connection.ParsConfig.NewFolder1.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Learning.Connection.ParsConfig
{
    public class ParsConfig : IParsConfig
    {
        private string ConfigurationConnect = null;
        public string configurationConnect
        {
            get
            {
                return ConfigurationConnect;
            }
        }

        public void ParseConfiguration()
        {
            ConfigurationConnect = "Database=sz_stagers; Host=192.168.224.27; Server=ol_test; Service=1527; Client Locale=ru_ru.CP1251; Database Locale=RU_RU.8859-5; Protocol=olsoctcp; UID=informix; Password=info;";
        }
    }
}