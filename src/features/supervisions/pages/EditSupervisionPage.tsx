import { useParams } from "react-router-dom";

export default function EditSupervisionPage() {
  const { supervisionId } = useParams<{ supervisionId: string }>();
  return (
    <div>
      <h1 className="text-xl font-semibold">Edit Supervision</h1>
      <p className="text-muted-foreground">Page 5: Edit Supervision {supervisionId} (placeholder).</p>
    </div>
  );
}
