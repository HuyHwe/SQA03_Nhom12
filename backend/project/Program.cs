using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using project.Models;
using Microsoft.AspNetCore.Mvc;
using project.Modules.Posts.Repositories.Interfaces;
using project.Modules.Posts.Services.Interfaces;
using project.Modules.Posts.Services.Implements;
using project.Modules.Posts.Repositories;
using project.Modules.Posts.Repositories.Implements;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using project.Modules.UserManagement.Services;
using Microsoft.OpenApi.Models;
using project.Modules.UserManagement.Services.Interfaces;
using project.Modules.Payment.Service.Interfaces;
using project.Modules.Payment.Repositories.Implements;
using project.Modules.Payments.Repositories.Interfaces;
using project.Modules.Payments.Service.Interfaces;
using project.Modules.Payments.Service.Implements;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("Elearning_DB") ?? throw new InvalidOperationException("Connection string 'Elearning_DB' not found");

// Add Connection to MSSQL
builder.Services.AddDbContext<DBContext>(options => options.UseSqlServer(connectionString));
builder.Services.AddIdentity<User, IdentityRole>()
    .AddEntityFrameworkStores<DBContext>()
    .AddDefaultTokenProviders();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
    };

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;

            if (!string.IsNullOrEmpty(accessToken) &&
                path.StartsWithSegments("/hubs"))
            {
                context.Token = accessToken;
            }

            return Task.CompletedTask;
        }
    };
});
// Add services to the container.
builder.Services.AddScoped<IExamService, ExamService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IQuestionExamService, QuestionExamService>();
builder.Services.AddScoped<ICourseService, CourseService>();
builder.Services.AddScoped<IChoiceService, ChoiceService>();
builder.Services.AddScoped<ISubmissionExamService, SubmissionExamService>();
builder.Services.AddScoped<ISubmissionAnswerService, SubmissionAnswerService>();
builder.Services.AddScoped<ILessonService, LessonService>();
builder.Services.AddScoped<ICourseContentService, CourseContentService>();
builder.Services.AddScoped<IRequestUpdateService, RequestUpdateService>();
builder.Services.AddScoped<IPostService, PostService>();
builder.Services.AddScoped<IDiscussionService, DiscussionService>();
builder.Services.AddScoped<IForumQuestionService, ForumQuestionService>();
builder.Services.AddScoped<ILikesService, LikesService>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();

builder.Services.AddScoped<ICourseReviewService, CourseReviewService>();
builder.Services.AddScoped<IEnrollmentCourseService, EnrollmentCourseService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IExamAttempService, ExamAttempService>();
builder.Services.AddScoped<ITeacherService, TeacherService>();
// builder.Services.AddScoped<IStudentService, StudentService>();

// Add repository to the container.
builder.Services.AddScoped<IExamRepository, ExamRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IQuestionExamRepository, QuestionExamRepository>();
builder.Services.AddScoped<ICourseRepository, CourseRepository>();
builder.Services.AddScoped<IChoiceRepository, ChoiceRepository>();
builder.Services.AddScoped<ISubmissionExamRepository, SubmissionExamRepository>();
builder.Services.AddScoped<ISubmissionAnswerRepository, SubmissionAnswerRepository>();
builder.Services.AddScoped<IStudentRepository, StudentRepository>();
builder.Services.AddScoped<ITeacherRepository, TeacherRepository>();
builder.Services.AddScoped<ICourseContentRepository, CourseContentRepository>();
builder.Services.AddScoped<ILessonRepository, LessonRepository>();
builder.Services.AddScoped<IRequestUpdateRepository, RequestUpdateRepository>();
builder.Services.AddScoped<IPostRepository, PostRepository>();
builder.Services.AddScoped<IDiscussionRepository, DiscussionRepository>();
builder.Services.AddScoped<IForumQuestionRepository, ForumQuestionRepository>();
builder.Services.AddScoped<ILikesRepository, LikesRepository>();
builder.Services.AddScoped<IReportRepository, ReportRepository>();
builder.Services.AddScoped<ICourseReviewRepository, CourseReviewRepository>();
builder.Services.AddScoped<IEnrollmentCourseRepository, EnrollmentCourseRepository>();
builder.Services.AddScoped<ILessonProgressRepository, LessonProgressRepository>();
builder.Services.AddScoped<IRequestRefundCourseRepository, RequestRefundCourseRepository>();
builder.Services.AddScoped<IAdminRepository, AdminRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IExamAttempRepository, ExamAttempRepository>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IStudentStatsRepository, StudentStatsRepository>();
builder.Services.AddScoped<IStudentStatsService, StudentStatsService>();
builder.Services.AddScoped<IReportRepository, ReportRepository>();
builder.Services.AddScoped<IReportService, ReportService>();

builder.Services.AddControllers();



// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "E-Learning API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter 'Bearer' [space] and then your token",
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            new string[] {}
        }
    });
});


// Upload file support in swagger
builder.Services.AddSwaggerGen(c =>
{
    c.MapType<IFormFile>(() => new Microsoft.OpenApi.Models.OpenApiSchema
    {
        Type = "string",
        Format = "binary"
    });
});

// Config SignalR
builder.Services.AddSignalR();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy.SetIsOriginAllowed(origin => true)
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials());
});

builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.SuppressModelStateInvalidFilter = true;
});

var app = builder.Build();
using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

    string[] roles = { "Student", "Teacher", "Admin" };

    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
            await roleManager.CreateAsync(new IdentityRole(role));
    }
}

// Temporarily commented to debug database connection
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<DBContext>();
    DBSeeder.Seed(context);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();


app.MapControllers();

app.MapGet("/", () => "Hello, .NET API is running!");

app.Run();
