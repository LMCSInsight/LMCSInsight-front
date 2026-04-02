import { useParams } from "react-router-dom";

export default function StudentDetailPage() {
  const { studentId } = useParams<{ studentId: string }>();

  return (
    <div>
      <h1 className="text-xl font-semibold">Student Details</h1>
      <p className="text-muted-foreground">Student {studentId} details page (placeholder).</p>
    </div>
  );
}
