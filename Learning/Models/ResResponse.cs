using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Learning.Models
{
    public class ResResponse
    {
        public bool success { get; set; }
        public string message { get; set; }

        public List<Citizen> citizens { get; set; }
    }
}