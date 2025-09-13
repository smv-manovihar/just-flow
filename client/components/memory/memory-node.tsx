import { FlowNode } from "@/types/flow.type";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

type MemoryNodeProps = FlowNode;

export default function MemoryNode(props: MemoryNodeProps) {
  return (
    <Card>
      <CardHeader>
        <h3>{props.title}</h3>
        <p className="text-muted">
          <Badge color="primary">{props.type}</Badge>
        </p>
        <p className="text-muted">
          {props.tags.map((tag, index) => (
            <span key={index}>
              <Badge color="secondary">{tag}</Badge>
            </span>
          ))}
        </p>
      </CardHeader>
      <CardContent>
        <p>{props.content}</p>
        <p>{props.mediaUrl}</p>
      </CardContent>
      <CardFooter>
        <Button>Next</Button>
      </CardFooter>
    </Card>
  );
}
