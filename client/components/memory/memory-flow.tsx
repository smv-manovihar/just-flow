import { Flow, FlowNode } from "@/types/flow.type";
import MemoryNode from "./memory-node";

interface MemoryFlowProps {
  flow: Flow;
}

export default function MemoryFlow({ flow }: MemoryFlowProps) {
  // Assuming flow.nodes is populated with node objects
  const nodes: FlowNode[] = flow.nodes as unknown as FlowNode[];

  // For simplicity, render head node and then list of nodes
  const headNode = nodes.find((node) => node.isheadNode);

  return (
    <div>
      <h2>Flow: {flow.title}</h2>
      <p>Tags: {flow.tags.join(", ")}</p>
      <p>Type: {flow.type}</p>
      <p>Visibility: {flow.visibility}</p>

      {headNode && (
        <div>
          <h3>Head Node:</h3>
          <MemoryNode {...headNode} />
        </div>
      )}

      <div>
        <h3>All Nodes:</h3>
        {nodes.map((node, index) => (
          <MemoryNode key={`${node.id}-${index}`} {...node} />
        ))}
      </div>
    </div>
  );
}
