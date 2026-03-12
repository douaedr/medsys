using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using PersonnelMS.Exceptions;
using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;

namespace PersonnelMS.Middleware
{
    /// <summary>
    /// Middleware global pour intercepter les exceptions et retourner un ProblemDetails conforme.
    /// </summary>
    public class MiddlewareGestionExceptions
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<MiddlewareGestionExceptions> _logger;

        public MiddlewareGestionExceptions(RequestDelegate next, ILogger<MiddlewareGestionExceptions> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur non gérée : {TypeException} - {Message}", ex.GetType().Name, ex.Message);
                await TraiterExceptionAsync(context, ex);
            }
        }

        private static async Task TraiterExceptionAsync(HttpContext context, Exception exception)
        {
            int statusCode;
            string titre;
            switch (exception)
            {
                case HabilitationException:
                case UnauthorizedAccessException:
                    statusCode = (int)HttpStatusCode.Forbidden;
                    titre = "Accès interdit";
                    break;
                case ChevauchementException:
                case CouvertureInsuffisanteException:
                case InvalidOperationException:
                    statusCode = (int)HttpStatusCode.Conflict;
                    titre = "Conflit";
                    break;
                case TransitionNonAutoriseeException:
                case RegleMetierException:
                    statusCode = (int)HttpStatusCode.BadRequest;
                    titre = "Requête invalide";
                    break;
                case KeyNotFoundException:
                    statusCode = (int)HttpStatusCode.NotFound;
                    titre = "Ressource introuvable";
                    break;
                default:
                    statusCode = (int)HttpStatusCode.InternalServerError;
                    titre = "Erreur interne";
                    break;
            }

            var problem = new
            {
                type = "about:blank",
                title = titre,
                status = statusCode,
                detail = exception.Message
            };

            context.Response.ContentType = "application/problem+json";
            context.Response.StatusCode = statusCode;
            await context.Response.WriteAsync(JsonSerializer.Serialize(problem));
        }
    }
}