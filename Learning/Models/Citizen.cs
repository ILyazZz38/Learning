using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Learning.Models
{
    public class Citizen
    {
        public string SurName { get; set; }
        public string FirstName { get; set; }
        public string FatherName { get; set; }
        public DateTime Birthday { get; set; }
    }

    //public class CitizenDBContext : DBContext
    //{
    //    public DbSet<Citizen> Citizens { get; set; }
    //}
}