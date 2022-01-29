using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Learning.Models
{
    public class CitizenList
    {
        public int total { get; set; }
        public List<Citizen> newCitizens { get; set; }
    }
}