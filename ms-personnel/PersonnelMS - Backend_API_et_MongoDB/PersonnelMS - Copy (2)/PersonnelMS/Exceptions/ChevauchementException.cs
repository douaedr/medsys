using System;

namespace PersonnelMS.Exceptions
{
    /// <summary>
    /// Exception levée lorsqu'un chevauchement de créneaux ou de disponibilités est détecté.
    /// </summary>
    public class ChevauchementException : RegleMetierException
    {
        public ChevauchementException()
        {
        }

        public ChevauchementException(string message)
            : base(message)
        {
        }

        public ChevauchementException(string message, Exception innerException)
            : base(message, innerException)
        {
        }
    }
}

