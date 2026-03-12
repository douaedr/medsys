using System;

namespace PersonnelMS.Exceptions
{
    /// <summary>
    /// Exception levée lorsqu'un utilisateur n'a pas les droits nécessaires pour effectuer une action.
    /// </summary>
    public class HabilitationException : RegleMetierException
    {
        public HabilitationException()
        {
        }

        public HabilitationException(string message)
            : base(message)
        {
        }

        public HabilitationException(string message, Exception innerException)
            : base(message, innerException)
        {
        }
    }
}

