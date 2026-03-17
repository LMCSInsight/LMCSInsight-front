import { useParams } from "react-router-dom";

export default function EditSupervisionPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div>
      <h1 className="text-xl font-semibold">Edit Supervision</h1>
      <p className="text-muted-foreground">Page 5: Edit Supervision {id} (placeholder).</p>
    </div>
  );
}
