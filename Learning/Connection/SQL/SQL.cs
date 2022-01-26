using Learning.Connection.SQL.Interface;
using Learning.Models;
using Learning.Models.old;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Learning.Connection.SQL
{
    public class SQL : ISQL
    {
        string NameTable = "citizens";

        /// <summary>
        /// Команда получения всех данных с таблицы
        /// </summary>
        /// <returns></returns>
        public string GetAllColumn()
        {
            string sql = "Select* FROM  " + NameTable;
            return sql;
        }

        /// <summary>
        /// Команда добавления нового гражданина в таблицу
        /// </summary>
        /// <param name="surNameText">Фамилия</param>
        /// <param name="nameText">Имя</param>
        /// <param name="fatherNameText">Отчество</param>
        /// <param name="birthdayDate">Дата Рождения</param>
        /// <returns></returns>
        public SqlRes CreateColumn(string surNameText, string nameText, string fatherNameText, DateTime birthdayDate)
        {
            string sql = "INSERT INTO " + NameTable + " (surname, firstname, fathername, birthday)" +
                         "VALUES (?,?,?,?)";

            SqlRes sqlRes = new SqlRes();
            sqlRes.sql = sql;

            CitizenPar citizen = new CitizenPar();
            citizen.surname = surNameText;
            citizen.firstname = nameText;
            citizen.fathername = fatherNameText;
            citizen.birthday = birthdayDate;
            sqlRes.citizenPar = citizen;

            return sqlRes;
        }

        /// <summary>
        /// Команда обновления данных гражданине в таблице
        /// </summary>
        /// <param name="id">Ключ</param>
        /// <param name="surnameText">Фамилия</param>
        /// <param name="nameText">Имя</param>
        /// <param name="fatherNameText">Отчество</param>
        /// <param name="birthdayDate">Дата рождения</param>
        /// <returns></returns>
        public SqlRes UpdateColumn(int id, string surnameText, string nameText, string fatherNameText, DateTime birthdayDate)
        {
            string sql = "UPDATE " + NameTable + " SET (surname, firstname, fathername, birthday) = " +
                         "(?,?,?,?)" +
                         "WHERE id_citizen = ?";

            SqlRes sqlRes = new SqlRes();
            sqlRes.sql = sql;

            CitizenPar citizen = new CitizenPar();
            citizen.id_citizen = id;
            citizen.surname = surnameText;
            citizen.fathername = fatherNameText;
            citizen.firstname = nameText;
            citizen.birthday = birthdayDate;
            sqlRes.citizenPar = citizen;

            return sqlRes;
        }

        /// <summary>
        /// Команда удаления гражданина из таблицы
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public SqlRes DeleteColumn(int id)
        {
            string sql = "DELETE FROM " + NameTable + " WHERE id_citizen = ?";

            SqlRes sqlRes = new SqlRes();
            sqlRes.sql = sql;

            CitizenPar citizen = new CitizenPar();
            citizen.id_citizen = id;
            sqlRes.citizenPar = citizen;

            return sqlRes;
        }

    }
}