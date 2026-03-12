using FluentValidation;
using FluentValidation.AspNetCore;
using MongoDB.Driver;
using Serilog;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/hospital-.log", rollingInterval: RollingInterval.Day)
    .Enrich.FromLogContext()
    .CreateLogger();

var builder = WebApplication.CreateBuilder(args);
builder.Host.UseSerilog();

// configuration MongoDB
builder.Services.Configure<PersonnelMS.Configurations.MongoSettings>(
    builder.Configuration.GetSection("MongoDB"));

// Add Mongo client and database
builder.Services.AddSingleton(sp =>
{
    var settings = sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<PersonnelMS.Configurations.MongoSettings>>().Value;
    return new MongoDB.Driver.MongoClient(settings.ConnectionURI);
});
builder.Services.AddScoped(sp =>
{
    var settings = sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<PersonnelMS.Configurations.MongoSettings>>().Value;
    var client = sp.GetRequiredService<MongoDB.Driver.MongoClient>();
    return client.GetDatabase(settings.DatabaseName);
});

// configure conventions and create indexes during startup
PersonnelMS.Configurations.MongoConfiguration.ConfigurerConventions();

// Add services to the container.

builder.Services.AddControllers()
    .AddFluentValidation(fv => fv.RegisterValidatorsFromAssemblyContaining<PersonnelMS.Validators.PersonnelCreateDtoValidator>())
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    var xmlFile = System.IO.Path.ChangeExtension(System.Reflection.Assembly.GetExecutingAssembly().Location, ".xml");
    if (System.IO.File.Exists(xmlFile))
    {
        options.IncludeXmlComments(xmlFile);
    }
});

// registre des dépendances métiers
builder.Services.AddScoped<PersonnelMS.Repositories.IPersonnelRepository, PersonnelMS.Repositories.PersonnelRepository>();
// nouveaux repositories
builder.Services.AddScoped<PersonnelMS.Repositories.IEquipeRepository, PersonnelMS.Repositories.EquipeRepository>();
builder.Services.AddScoped<PersonnelMS.Repositories.IDisponibiliteRepository, PersonnelMS.Repositories.DisponibiliteRepository>();
builder.Services.AddScoped<PersonnelMS.Repositories.IAbsenceRepository, PersonnelMS.Repositories.AbsenceRepository>();
builder.Services.AddScoped<PersonnelMS.Repositories.IDemandeModificationRepository, PersonnelMS.Repositories.DemandeModificationRepository>();

// services génériques et spécifiques
builder.Services.AddScoped<PersonnelMS.Services.IServicePersonnel, PersonnelMS.Services.ServicePersonnel>();
builder.Services.AddScoped<PersonnelMS.Services.IMedecinService, PersonnelMS.Services.MedecinService>();
builder.Services.AddScoped<PersonnelMS.Services.IInfirmierService, PersonnelMS.Services.InfirmierService>();
builder.Services.AddScoped<PersonnelMS.Services.IAideSoignantService, PersonnelMS.Services.AideSoignantService>();
builder.Services.AddScoped<PersonnelMS.Services.ISecretaireService, PersonnelMS.Services.SecretaireService>();
builder.Services.AddScoped<PersonnelMS.Services.IBrancardierService, PersonnelMS.Services.BrancardierService>();
builder.Services.AddScoped<PersonnelMS.Services.IDirecteurService, PersonnelMS.Services.DirecteurService>();
builder.Services.AddScoped<PersonnelMS.Services.IDisponibiliteService, PersonnelMS.Services.DisponibiliteService>();
builder.Services.AddScoped<PersonnelMS.Services.IAbsenceService, PersonnelMS.Services.AbsenceService>();
builder.Services.AddScoped<PersonnelMS.Services.IDemandeModificationService, PersonnelMS.Services.DemandeModificationService>();

// services et repositories pour sprint 3
builder.Services.AddScoped<PersonnelMS.Repositories.IPlanningRepository, PersonnelMS.Repositories.PlanningRepository>();
builder.Services.AddScoped<PersonnelMS.Repositories.ICreneauRepository, PersonnelMS.Repositories.CreneauRepository>();

builder.Services.AddScoped<PersonnelMS.Services.IEquipeService, PersonnelMS.Services.EquipeService>();
builder.Services.AddScoped<PersonnelMS.Services.IPlanningService, PersonnelMS.Services.PlanningService>();
builder.Services.AddScoped<PersonnelMS.Services.ICreneauService, PersonnelMS.Services.CreneauService>();
builder.Services.AddScoped<PersonnelMS.Services.IRapportService, PersonnelMS.Services.RapportService>();

var app = builder.Build();

// création des indexes au démarrage
using (var scope = app.Services.CreateScope())
{
    var database = scope.ServiceProvider.GetRequiredService<MongoDB.Driver.IMongoDatabase>();
    await PersonnelMS.Configurations.MongoConfiguration.CreerIndexesPersonnelsAsync(database);
    await PersonnelMS.Configurations.MongoConfiguration.CreerIndexesCreneauxAsync(database);
    await PersonnelMS.Configurations.MongoConfiguration.CreerIndexesPlanningsAsync(database);
    await PersonnelMS.Configurations.MongoConfiguration.CreerIndexesDisponibilitesAsync(database);
    await PersonnelMS.Configurations.MongoConfiguration.CreerIndexesAbsencesAsync(database);
    await PersonnelMS.Configurations.MongoConfiguration.CreerIndexesDemandesModificationAsync(database);
    await PersonnelMS.Configurations.MongoConfiguration.CreerIndexesEquipesAsync(database);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<PersonnelMS.Middleware.MiddlewareGestionExceptions>();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
