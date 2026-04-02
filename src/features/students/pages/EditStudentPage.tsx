import { useParams } from "react-router-dom";

export default function EditStudentPage() {
  const { studentId } = useParams<{ studentId: string }>();

  return (
    <div>
      <h1 className="text-xl font-semibold">Edit Student</h1>
      <p className="text-muted-foreground">Edit student {studentId} page (placeholder).</p>
    </div>
  );
}
