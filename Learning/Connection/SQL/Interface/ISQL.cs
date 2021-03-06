using Learning.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Learning.Connection.SQL.Interface
{
    public interface ISQL
    {
        string GetAllColumn(string surname, string firstname, string fathername, DateTime firstBirthday, DateTime lastBirthday);
        SqlRes CreateColumn(string surNameText, string nameText, string fatherNameText, DateTime birthdayDate);
        SqlRes UpdateColumn(int id, string surnameText, string nameText, string fatherNameText, DateTime birthdayDate);
        SqlRes DeleteColumn(int id);
    }
}