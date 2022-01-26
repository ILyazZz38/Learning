using Castle.MicroKernel.Registration;
using Castle.MicroKernel.SubSystems.Configuration;
using Castle.Windsor;
using Learning.Connection;
using Learning.Connection.Interface;
using Learning.Connection.ParsConfig;
using Learning.Connection.ParsConfig.NewFolder1.Interface;
using Learning.Connection.SQL;
using Learning.Connection.SQL.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Learning.CastleWind
{
    public class CastleWindConf : IWindsorInstaller
    {
        /// <summary>
        /// Формирует настройки Castle Windsor контейнера 
        /// </summary>
        /// <param name="container"></param>
        /// <param name="store"></param>
        public void Install(IWindsorContainer container, IConfigurationStore store)
        {
            container.Register(Component.For<IGetTable>().ImplementedBy<Connect>().LifestyleTransient().Named("IGetTable"));
            container.Register(Component.For<IEditTable>().ImplementedBy<Connect>().LifestyleTransient().Named("IEditTable"));
            container.Register(Component.For<IParsConfig>().ImplementedBy<ParsConfig>().LifestyleTransient());
            container.Register(Component.For<IIfxConnectGetData>().ImplementedBy<ConnectionIBM>().LifestyleTransient().Named("IIfxConnectGetData"));
            container.Register(Component.For<IIfxConnectEditTable>().ImplementedBy<ConnectionIBM>().LifestyleTransient().Named("IIfxConnectEditTable"));
            container.Register(Component.For<ISQL>().ImplementedBy<SQL>().LifestyleTransient());
            container.Register(Component.For<IIfxCommandPar>().ImplementedBy<IfxCommandPar>().LifestyleTransient());
        }
    }
}