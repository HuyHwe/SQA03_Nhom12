import EnrollmentItem from "./EnrollmentItem";

function ListEnrollment({ enrollmentList }) {
    return (
        <div className="flex flex-col gap-6">
            {enrollmentList.map((e) => <EnrollmentItem key={e.enrollmentId || e.id} item={e}/>)}
        </div>
    )
}

export default ListEnrollment;