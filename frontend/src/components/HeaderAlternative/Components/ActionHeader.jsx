import GuestAction from "./Actions/GuestAction";
import StudentAction from "./Actions/StudentAction";
import TeacherAction from "./Actions/TeacherAction";

function ActionHeader({logged, user, headerMode}) {
    if (!logged) return <GuestAction />;

    const isTeacher = !!(user?.teacherId || user?.isTeacher);
    const isAdmin   = !!(user?.adminId || user?.isAdmin);

    if (isAdmin) return <p>Admin Action</p>;

    if (headerMode === "teacher" && isTeacher) {
        return <TeacherAction user={user} />;
    }

    return <StudentAction user={user} />;
}

export default ActionHeader;