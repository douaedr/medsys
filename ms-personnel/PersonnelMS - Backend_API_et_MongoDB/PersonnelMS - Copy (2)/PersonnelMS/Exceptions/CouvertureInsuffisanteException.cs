using System;

namespace PersonnelMS.Exceptions
{
    /// <summary>
    /// Exception levée lorsqu'un planning ne respecte pas les règles de couverture minimale.
    /// </summary>
    public class CouvertureInsuffisanteException : RegleMetierException
    {
        public CouvertureInsuffisanteException()
        {
        }

        public CouvertureInsuffisanteException(string message)
            : base(message)
        {
        }

        public CouvertureInsuffisanteException(string message, Exception innerException)
            : base(message, innerException)
        {
        }
    }
}

