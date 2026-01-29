export default async function WardPage({
  params,
}: {
  params: Promise<{ wardId: string }>;
}) {
  const { wardId } = await params;
  return (
    <div>
      <h1>Welcome to Ward {wardId}</h1>
    </div>
  );
}
