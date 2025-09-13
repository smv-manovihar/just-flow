import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import MemoryFlow from "@/components/memory/memory-flow";
import { Flow } from "@/types/flow.type";

export default async function Memory({ params }: { params: { id: string } }) {
  const { id } = params;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const baseURL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  try {
    const response = await fetch(`${baseURL}/api/flows/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Unauthorized, redirect to login
        redirect("/auth/login");
      }
      if (response.status === 404) {
        return (
          <div>
            <h1>Memory Not Found</h1>
            <p>
              The requested memory does not exist or you do not have permission
              to view it.
            </p>
          </div>
        );
      }
      throw new Error(`Failed to fetch flow: ${response.status}`);
    }

    const data = await response.json();
    const flow: Flow = data.flow;

    return (
      <div>
        <h1>Memory: {flow.title}</h1>
        <MemoryFlow flow={flow} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching flow:", error);
    return (
      <div>
        <h1>Error Loading Memory</h1>
        <p>There was an error loading the memory. Please try again later.</p>
      </div>
    );
  }
}
