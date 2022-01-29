using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Learning.Models
{
    public class Search
    {
        public string surname { get; set; }
        public string firstname { get; set; }
        public string fathername { get; set; }
        public DateTime firstBirthday { get; set; }
        public DateTime lastBirthday { get; set; }
    }
}