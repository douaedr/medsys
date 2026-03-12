using System;

namespace PersonnelMS.Exceptions
{
    /// <summary>
    /// Exception de base pour les violations de règles métier.
    /// </summary>
    public class RegleMetierException : Exception
    {
        public RegleMetierException()
        {
        }

        public RegleMetierException(string message)
            : base(message)
        {
        }

        public RegleMetierException(string message, Exception innerException)
            : base(message, innerException)
        {
        }
    }
}

