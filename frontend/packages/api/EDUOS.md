# EduOS-backend API mapping

Reference: [Likhithagandham/EduOS-backend](https://github.com/Likhithagandham/EduOS-backend)

## Mobile hook → EduOS endpoint

| PiiAura hook | EduOS endpoint |
|---|---|
| `useAuth().login` | `POST /api/v1/auth/login/disambiguate/` or `POST /api/v1/auth/login/` |
| `useFacultyDashboard` | `GET /api/v1/auth/me/faculty-dashboard/` |
| `useStudentDashboard` | `GET /api/v1/auth/me/dashboard/` |
| `useFacultyAttendanceSession` | `GET /api/v1/attendance/faculty/attendance/` |
| `useFacultySchedule` | `GET /api/v1/academics/faculty/timetable/` |
| `useStudentTimetable` | `GET /api/v1/academics/me/timetable/` |
| `useFacultyLeave` | `GET /api/v1/hr/me/leave/` |
| `useStudentLeave` | `GET /api/v1/attendance/me/leave/` |
| `useFacultyStudyMaterial` | `GET /api/v1/academics/faculty/study-materials/` |
| `useStudentLearn` | `GET /api/v1/academics/me/study-materials/` |
| `useFacultyAssignmentsScreen` | `GET /api/v1/examinations/me/teaching/assignments/` |
| `useFacultyMarksEntry` | `GET /api/v1/examinations/me/marks/` |
| `useFacultySyllabus` | `GET /api/v1/academics/faculty/syllabus/` |
| `useFacultyInvigilation` | `GET /api/v1/examinations/me/invigilation/` |
| `useFacultySalary` | `GET /api/v1/hr/me/payslip/` |
| `useFacultyAlerts` | `GET /api/v1/communications/announcements/faculty/` |
| `useStudentFees` | `GET /api/v1/fees/me/fees/` |
| `useStudentExams` | `GET /api/v1/examinations/me/exams/` |
| `useStudentHomework` | `GET /api/v1/coursework/student/homework/` |
| `useFacultyProfile` | `GET /api/v1/auth/me/faculty-profile/` |
| `useStudentProfile` | `GET /api/v1/auth/me/student-profile/` |

## Response envelope

EduOS wraps all JSON as `{ success, data, message }`. The mobile API client unwraps this automatically in `frontend/packages/api/src/client.ts`.

## Local backend path

```
C:\Users\likhi\PiiAura\EduOS-backend
```

Start with `python manage.py runserver` (port 8000).

```env
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_TENANT_ID=<uuid-from-eduos>
```

## Auth flow

1. Resolve tenant via `EXPO_PUBLIC_TENANT_ID` or `EXPO_PUBLIC_TENANT_SUBDOMAIN` → `GET /api/v1/organizations/tenant-config/?subdomain=greenfield`
2. `POST /api/v1/auth/login/disambiguate/` with `{ identifier, password, tenant_id }`
3. Store `access` + `refresh` JWT tokens
4. `GET /api/v1/auth/me/` for profile
5. On 401, `POST /api/v1/auth/refresh/` with `{ refresh }`
6. `POST /api/v1/auth/logout/` with `{ refresh }` on sign-out
