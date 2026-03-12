using System;

namespace PersonnelMS.Exceptions
{
    /// <summary>
    /// Exception levée lorsqu'une transition d'état n'est pas autorisée par la machine à états.
    /// </summary>
    public class TransitionNonAutoriseeException : RegleMetierException
    {
        public TransitionNonAutoriseeException()
        {
        }

        public TransitionNonAutoriseeException(string message)
            : base(message)
        {
        }

        public TransitionNonAutoriseeException(string message, Exception innerException)
            : base(message, innerException)
        {
        }
    }
}

