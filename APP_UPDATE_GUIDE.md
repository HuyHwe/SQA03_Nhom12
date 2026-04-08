# 🔐 App.jsx Update Guide - Adding Route Guards

## Imports to Add (Top of file, after existing imports)

```javascript
// Add these imports after line 588
import PrivateRoute from "./components/auth/PrivateRoute";
import RequireRole from "./components/auth/RequireRole";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastProvider } from "./components/ui/Toast";

// Update error pages imports (replace existing NotFound if any)
import Unauthorized from "./pages/errors/Unauthorized";
import Forbidden from "./pages/errors/Forbidden";
import NotFoundPage from "./pages/errors/NotFound";
```

## Wrap App with ErrorBoundary and ToastProvider

```javascript
// In main.jsx or App.jsx export, wrap like this:
export default function App() {
  const { hydrate } = useAuth();
  useEffect(() => { hydrate(); }, [hydrate]);

  return (
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter>
          {/* existing app content */}
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  );
}
```

## Route Structure Changes

### 1. Protect ALL Student Routes (/s/*)

**Find lines 732-793** (Student routes) and wrap them:

```javascript
{/* ---------- PROTECTED: STUDENT ROUTES ---------- */}
<Route element={<PrivateRoute />}>
  <Route element={<RequireRole roles={["Student"]} />}>
    <Route path="/s/dashboard" element={<Dashboard />} />
    <Route path="/s/enrollments" element={<Enrollments title="..." />} />
    <Route path="/s/:courseContentId/lesson/:lessonId" element={<LessonDetail title="..." />} />
    <Route path="/s/exam/:id" element={<ExamDetail title="..." />} />
    <Route path="/s/exam/:id/take-exam" element={<QuizTest />} />
    <Route path="/s/exam/:id/take/:attemptId" element={<QuizTest />} />
    <Route path="/s/results/:attemptId" element={<ResultAttempt title="..." />} />
    <Route path="/s/resultstest" element={<IELTSResultsPage />} />
    <Route path="/s/historytest" element={<HistoryTest />} />
    <Route path="/s/profile" element={<ProfilePage title="..." />} />
    <Route path="/s/schedulepage" element={<SchedulePage />} />
  </Route>
</Route>
```

### 2. Protect ALL Instructor Routes (/i/*)

**Find lines 795-832** (Instructor routes) and wrap them:

```javascript
{/* ---------- PROTECTED: INSTRUCTOR ROUTES ---------- */}
<Route element={<PrivateRoute />}>
  <Route element={<RequireRole roles={["Teacher"]} />}>
    <Route path="/i/dashboard" element={<InstructorDashboard title="..." />} />
    <Route path="/i/courses" element={<InstructorCourses title="..." />} />
    <Route path="/i/courses/new" element={<CourseNew title="..." />} />
    <Route path="/i/courses/:id/edit" element={<CourseEdit title="..." />} />
    <Route path="/i/courses/:id/lessons" element={<CourseLessons title="..." />} />
    <Route path="/i/courses/:id/students" element={<CourseStudents title="..." />} />
    <Route path="/i/courses/:id/students/:userId" element={<StudentProgress title="..." />} />
    <Route path="/i/courses/:id/reviews" element={<CourseReviews title="..." />} />
    <Route path="/i/exams" element={<Exams title="..." />} />
    <Route path="/i/exams/new" element={<ExamNew title="..." />} />
    <Route path="/i/exams/:id/edit" element={<ExamEdit title="..." />} />
    <Route path="/i/exams/:id/stats" element={<ExamStats title="..." />} />
    <Route path="/i/exams/:id/attempts" element={<ExamAttempts title="..." />} />
    <Route path="/i/become-instructor" element={<BecomeInstructor title="..." />} />
    <Route path="/i/courses/:courseId/lessons/:lessonId/edit" element={<LessonEdit />} />
    <Route path="/i/courses/:courseId/lessons/:lessonId/preview" element={<LessonPreview />} />
    <Route path="/i/courses/:courseId/lessons/:lessonId/upload" element={<LessonUpload />} />
    <Route path="/i/categories" element={<Categories />} />
    <Route path="/i/categories/new" element={<CategoryCreate />} />
  </Route>
</Route>
```

### 3. Protect Blog Editor Routes

**Find lines 770-771** (Blog editor) and wrap:

```javascript
{/* Protect blog creation/editing */}
<Route element={<PrivateRoute />}>
  <Route path="/blog/new" element={<BlogEditor mode="create" />} />
  <Route path="/blog/:id/edit" element={<BlogEditor mode="edit" />} />
</Route>
```

### 4. Protect Forum Editor Routes (Optional)

```javascript
{/* Protect forum question creation/editing */}
<Route element={<PrivateRoute />}>
  <Route path="/forum/new" element={<AskQuestion />} />
  <Route path="/forum/:id/edit" element={<EditQuestion />} />
  <Route path="/forum/my" element={<MyQuestions />} />
</Route>
```

### 5. Add Error Routes

**Add BEFORE the 404 catch-all (line 841)**:

```javascript
{/* ---------- ERROR PAGES ---------- */}
<Route path="/unauthorized" element={<Unauthorized />} />
<Route path="/forbidden" element={<Forbidden />} />

{/* ---------- 404 ---------- */}
<Route path="*" element={<NotFoundPage />} />
```

## Complete Updated Structure

Your routes should look like this:

```javascript
<Routes>
  {/* PUBLIC routes - no protection */}
  <Route element={<Layout />}>
    <Route path="/courses" element={<Courses />} />
    <Route path="/courses/:id" element={<CourseDetail />} />
  </Route>
  
  <Route index element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/about" element={<About />} />
  {/* ... other public routes ... */}

  {/* PROTECTED: Student routes */}
  <Route element={<PrivateRoute />}>
    <Route element={<RequireRole roles={["Student"]} />}>
      {/* All /s/* routes */}
    </Route>
  </Route>

  {/* PROTECTED: Instructor routes */}
  <Route element={<PrivateRoute />}>
    <Route element={<RequireRole roles={["Teacher"]} />}>
      {/* All /i/* routes */}
    </Route>
  </Route>

  {/* PROTECTED: Auth-only routes (no role restriction) */}
  <Route element={<PrivateRoute />}>
    <Route path="/blog/new" element={<BlogEditor mode="create" />} />
    <Route path="/blog/:id/edit" element={<BlogEditor mode="edit" />} />
  </Route>

  {/* Error pages */}
  <Route path="/unauthorized" element={<Unauthorized />} />
  <Route path="/forbidden" element={<Forbidden />} />
  <Route path="*" element={<NotFoundPage />} />
</Routes>
```

## Testing After Update

1. **Test unauthenticated access**:
   - Try visiting `/s/dashboard` → should redirect to `/login`
   - Try visiting `/i/courses` → should redirect to `/login`

2. **Test role-based access**:
   - Login as Student → try `/i/courses` → should redirect to `/forbidden`
   - Login as Teacher → try `/s/dashboard` → should redirect to `/forbidden`

3. **Test public routes still work**:
   - `/courses`, `/login`, `/register` should work without login

## Notes

- This protects ~40+ routes that were previously completely open
- Users will be redirected to `/login` with the `from` state to return after login
- The `isHydrated` check ensures auth state is loaded before checking
- Role detection uses `studentId`/`teacherId` from backend response
